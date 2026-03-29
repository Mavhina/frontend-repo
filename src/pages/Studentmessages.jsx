import React, { useState, useRef, useEffect } from "react";
import {
  Search, MoreHorizontal, Send, Paperclip,
  Smile, CheckCheck, Check, Users, Megaphone,
} from "lucide-react";
import "./Studentmessages.css";
import api from "../services/api";
import { Client } from "@stomp/stompjs";
import { useUnread } from "./Unreadcontext";

const StudentMessages = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [chats, setChats]               = useState([]);
  const [messages, setMessages]         = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [searchQuery, setSearchQuery]   = useState("");
  const [totalUnread, setTotalUnread]   = useState(0);
  const { setUnreadCount }              = useUnread();
  const messagesEndRef                  = useRef(null);
  const stompClientRef                  = useRef(null);
  const selectedChatRef                 = useRef(null);
  const selectedTypeRef                 = useRef(null);
  const studentIdRef                    = useRef(null);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
    selectedTypeRef.current = selectedType;
  }, [selectedChat, selectedType]);

  const sortChats = (chatList) => {
    const broadcasts = chatList.filter(c => c.type === "broadcast");
    const rest       = chatList.filter(c => c.type !== "broadcast");
    rest.sort((a, b) => {
      if (!a.timestamp && !b.timestamp) return 0;
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;
      return b.timestamp - a.timestamp;
    });
    return [...broadcasts, ...rest];
  };

  const calcTotalUnread = (chatList) =>
    chatList.reduce((sum, c) => sum + (c.unread || 0), 0);

  const syncUnread = (chatList) => {
    const total = calcTotalUnread(chatList);
    setTotalUnread(total);
    setUnreadCount(total);
  };

  // ─── 1. Load student info + chats ─────────────────────────────────────
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoadingChats(true);
        const [meRes, chatsRes, groupsRes, unreadRes] = await Promise.all([
          api.get("/user/me"),
          api.get("/student/chats"),
          api.get("/student/groups"),
          api.get("/student/messages/unread-counts"),
        ]);

        const me = meRes.data.data || meRes.data;
        studentIdRef.current = me.id;

        const rawChats    = chatsRes.data.data   || [];
        const rawGroups   = groupsRes.data.data  || [];
        const unreadData  = unreadRes.data.data  || {};
        const chatUnread  = unreadData.chats     || {};
        const groupUnread = unreadData.groups    || {};

        const tutorChats = rawChats.map(c => ({
          id:          c.tutorId,
          type:        "tutor",
          name:        c.tutorName || "Tutor",
          avatar:      (c.tutorName || "T").charAt(0).toUpperCase(),
          email:       c.tutorEmail || "",
          color:       null,
          lastMessage: c.lastMessage || "",
          time:        c.lastTime || "",
          timestamp:   c.lastTimestamp ? new Date(c.lastTimestamp).getTime() : null,
          unread:      chatUnread[String(c.tutorId)] || 0,
        }));

        const groupChats = rawGroups.map(g => ({
          id:          g.id,
          type:        "group",
          name:        g.name,
          color:       g.color || "#6366f1",
          lastMessage: "",
          time:        "",
          timestamp:   null,
          unread:      groupUnread[String(g.id)] || 0,
          memberCount: g.members?.length || 0,
        }));

        const broadcastChats = rawChats.map(c => ({
          id:          `broadcast-${c.tutorId}`,
          tutorId:     c.tutorId,
          type:        "broadcast",
          name:        `📢 ${c.tutorName || "Tutor"} Announcements`,
          color:       "#6366f1",
          lastMessage: "Announcements from your tutor",
          time:        "",
          timestamp:   null,
          unread:      0,
        }));

        const allChats = sortChats([...broadcastChats, ...groupChats, ...tutorChats]);
        setChats(allChats);
        syncUnread(allChats);
      } catch (e) {
        console.error("❌ Failed to fetch chats:", e);
      } finally {
        setLoadingChats(false);
      }
    };
    fetchChats();
  }, []);

  // ─── 2. Fetch history + connect WebSocket ─────────────────────────────
  useEffect(() => {
    if (!selectedChat || !selectedType) return;

    const fetchHistory = async () => {
      try {
        let url;
        if (selectedType === "broadcast")  url = `/student/messages/broadcast`;
        else if (selectedType === "group") url = `/student/messages/group/${selectedChat}`;
        else                               url = `/student/messages/${selectedChat}`;
        const res = await api.get(url);
        setMessages(res.data.data || []);
      } catch (e) {
        console.error("❌ Failed to fetch history:", e);
        setMessages([]);
      }

      // Mark as read when opening the chat
      if (selectedType === "tutor") {
        try {
          await api.patch(`/student/messages/${selectedChat}/read`);
          setChats(prev => {
            const updated = prev.map(c =>
              c.id === selectedChat && c.type === "tutor" ? { ...c, unread: 0 } : c
            );
            syncUnread(updated);
            return updated;
          });
        } catch (e) { console.error("❌ Mark chat read failed:", e); }
      }

      if (selectedType === "group") {
        try {
          await api.patch(`/student/messages/group/${selectedChat}/read`);
          setChats(prev => {
            const updated = prev.map(c =>
              c.id === selectedChat && c.type === "group" ? { ...c, unread: 0 } : c
            );
            syncUnread(updated);
            return updated;
          });
        } catch (e) { console.error("❌ Mark group read failed:", e); }
      }
    };

    fetchHistory();

    const token = localStorage.getItem("jwt");
    let active  = true;

    const getTopic = () => {
      if (selectedType === "broadcast") {
        const chat = chats.find(c => c.id === selectedChat);
        return `/topic/broadcast/${chat?.tutorId}`;
      }
      if (selectedType === "group") return `/topic/group-messages/${selectedChat}`;
      return `/topic/messages/${studentIdRef.current}`;
    };

    const client = new Client({
      brokerURL: "ws://localhost:8080/ws/websocket",
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        if (!active) return;
        stompClientRef.current = client;
        client.subscribe(getTopic(), (frame) => {
          const incoming = JSON.parse(frame.body);
          setMessages(prev => [...prev, incoming]);

          if (incoming.sender !== "student") {
            setChats(prev => {
              const updated = prev.map(c => {
                const isOpen = c.id === selectedChatRef.current && c.type === selectedTypeRef.current;
                if (isOpen) {
                  return { ...c, lastMessage: incoming.text, time: incoming.time, timestamp: Date.now() };
                }
                // Not the open chat — increment unread
                const matchesTutor = c.type === "tutor" && c.id === incoming.senderId;
                const matchesGroup = c.type === "group" && selectedTypeRef.current === "group";
                if (matchesTutor || matchesGroup) {
                  return { ...c, lastMessage: incoming.text, time: incoming.time, timestamp: Date.now(), unread: (c.unread || 0) + 1 };
                }
                return c;
              });
              syncUnread(updated);
              return sortChats(updated);
            });
          }
        });
      },
      onDisconnect:     () => { stompClientRef.current = null; },
      onStompError:     (f) => console.error("❌ STOMP error:", f),
      onWebSocketError: (e) => console.error("❌ WS error:", e),
    });

    const timer = setTimeout(() => client.activate(), 500);

    return () => {
      active = false;
      clearTimeout(timer);
      client.deactivate();
      stompClientRef.current = null;
    };
  }, [selectedChat, selectedType]);

  // ─── 3. Auto-scroll ───────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── 4. Send message ──────────────────────────────────────────────────
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (selectedType === "broadcast") return;
    if (!messageInput.trim() || !stompClientRef.current?.connected) return;

    const text      = messageInput.trim();
    const now       = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const timestamp = Date.now();

    stompClientRef.current.publish({
      destination: selectedType === "group"
        ? `/app/group-chat/${selectedChat}`
        : `/app/student-chat/${selectedChat}`,
      body: JSON.stringify({ text, time: now }),
    });

    setMessages(prev => [...prev, {
      id: `optimistic-${timestamp}`, text, time: now, sender: "student", status: "sent",
    }]);

    setChats(prev => {
      const updated = prev.map(c =>
        c.id === selectedChat && c.type === selectedType
          ? { ...c, lastMessage: text, time: now, timestamp } : c
      );
      return sortChats(updated);
    });

    setMessageInput("");
  };

  // ─── 5. Filter ────────────────────────────────────────────────────────
  const filteredChats = chats.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedChatData = chats.find(
    c => c.id === selectedChat && c.type === selectedType
  );

  const isBroadcast = selectedType === "broadcast";

  return (
    <div className="messages-container">
      <div className="chat-list">
        <div className="chat-list-header">
          <h2>
            Messages
            {totalUnread > 0 && (
              <span className="unread-badge" style={{ marginLeft: 8, fontSize: 12 }}>
                {totalUnread}
              </span>
            )}
          </h2>
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="chat-list-content">
          {loadingChats ? (
            <div className="chat-loading">Loading...</div>
          ) : filteredChats.length === 0 ? (
            <div className="chat-loading">No messages yet.</div>
          ) : (
            filteredChats.map(chat => (
              <div
                key={`${chat.type}-${chat.id}`}
                className={[
                  "chat-item",
                  selectedChat === chat.id && selectedType === chat.type ? "active" : "",
                  chat.type === "broadcast" ? "broadcast-item" : "",
                  chat.unread > 0 ? "has-unread" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => { setSelectedChat(chat.id); setSelectedType(chat.type); }}
              >
                <div
                  className="chat-avatar"
                  style={{ background: chat.color || "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
                >
                  {chat.type === "broadcast" && <Megaphone size={18} color="white" />}
                  {chat.type === "group"     && <Users size={18} color="white" />}
                  {chat.type === "tutor"     && chat.avatar}
                </div>

                <div className="chat-info">
                  <div className="chat-header">
                    <span className="chat-name">{chat.name}</span>
                    <span className="chat-time">{chat.time}</span>
                  </div>
                  {chat.type === "group" && (
                    <span className="chat-subject">
                      {chat.memberCount} member{chat.memberCount !== 1 ? "s" : ""}
                    </span>
                  )}
                  <div className="chat-footer">
                    <span className="chat-preview">
                      {chat.lastMessage || (chat.type === "tutor" ? chat.email : "")}
                    </span>
                    {chat.unread > 0 && <span className="unread-badge">{chat.unread}</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="chat-area">
        {selectedChatData ? (
          <>
            <div className="chat-area-header">
              <div className="chat-user-info">
                <div
                  className="chat-avatar large"
                  style={{ background: selectedChatData.color || "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
                >
                  {selectedChatData.type === "broadcast" && <Megaphone size={20} color="white" />}
                  {selectedChatData.type === "group"     && <Users size={20} color="white" />}
                  {selectedChatData.type === "tutor"     && selectedChatData.avatar}
                </div>
                <div className="chat-user-details">
                  <span className="chat-user-name">{selectedChatData.name}</span>
                  <span className="chat-user-status">
                    {selectedChatData.type === "broadcast" ? "Tutor announcements (read only)"
                      : selectedChatData.type === "group"  ? `${selectedChatData.memberCount} members`
                      : selectedChatData.email}
                  </span>
                </div>
              </div>
              <div className="chat-actions">
                <button className="chat-action-btn"><MoreHorizontal size={20} /></button>
              </div>
            </div>

            <div className="messages-content">
              {isBroadcast && (
                <div className="broadcast-banner">
                  <Megaphone size={14} />
                  These are announcements from your tutor
                </div>
              )}
              <div className="messages-date"><span>Today</span></div>
              {messages.length === 0 ? (
                <div className="no-messages">
                  {isBroadcast ? "No announcements yet." : "No messages yet. Say hello! 👋"}
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={`message ${msg.sender === "student" ? "sent" : "received"}`}
                  >
                    <div className="message-bubble">
                      <p>{msg.text}</p>
                      <div className="message-meta">
                        <span className="message-time">{msg.time}</span>
                        {msg.sender === "student" && (
                          <span className={`message-status ${msg.status}`}>
                            {msg.status === "read" ? <CheckCheck size={14} /> : <Check size={14} />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {!isBroadcast && (
              <form className="message-input-area" onSubmit={handleSendMessage}>
                <button type="button" className="input-action-btn"><Paperclip size={20} /></button>
                <div className="message-input-wrapper">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                  />
                  <button type="button" className="emoji-btn"><Smile size={20} /></button>
                </div>
                <button
                  type="submit"
                  className={`send-btn ${messageInput.trim() ? "active" : ""}`}
                  disabled={!messageInput.trim()}
                >
                  <Send size={20} />
                </button>
              </form>
            )}

            {isBroadcast && (
              <div className="readonly-bar">
                <Megaphone size={16} />
                Announcements are read-only
              </div>
            )}
          </>
        ) : (
          <div className="empty-chat">
            <div className="empty-chat-icon"><Send size={48} /></div>
            <h3>Your messages</h3>
            <p>Select a conversation to start messaging your tutor</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentMessages;
