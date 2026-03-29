import React, { useState, useRef, useEffect } from "react";
import {
  Search, MoreHorizontal, Phone, Video,
  Send, Paperclip, Smile, CheckCheck, Check,
  Users, Megaphone,
} from "lucide-react";
import "../styles/Messages.css";
import api from "../../services/api";
import { Client } from "@stomp/stompjs";

const Messages = () => {
  const [selectedChat, setSelectedChat]   = useState(null);
  const [selectedType, setSelectedType]   = useState(null);
  const [messageInput, setMessageInput]   = useState("");
  const [chats, setChats]                 = useState([]);
  const [messages, setMessages]           = useState([]);
  const [loadingChats, setLoadingChats]   = useState(true);
  const [searchQuery, setSearchQuery]     = useState("");
  const [tutorId, setTutorId]             = useState(null);
  const [totalUnread, setTotalUnread]     = useState(0);
  const messagesEndRef                    = useRef(null);
  const stompClientRef                    = useRef(null);
  const selectedChatRef                   = useRef(null);
  const selectedTypeRef                   = useRef(null);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
    selectedTypeRef.current = selectedType;
  }, [selectedChat, selectedType]);

  const sortChats = (chatList) => {
    const broadcast = chatList.find(c => c.type === "broadcast");
    const rest = chatList.filter(c => c.type !== "broadcast");
    rest.sort((a, b) => {
      if (!a.timestamp && !b.timestamp) return 0;
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;
      return b.timestamp - a.timestamp;
    });
    return broadcast ? [broadcast, ...rest] : rest;
  };

  const calcTotalUnread = (chatList) =>
    chatList.reduce((sum, c) => sum + (c.unread || 0), 0);

  // ─── 1. Load tutor info + students + groups ───────────────────────────
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoadingChats(true);
        const [meRes, studentsRes, groupsRes, unreadRes] = await Promise.all([
          api.get("/user/me"),
          api.get("/tutor/students"),
          api.get("/tutor/groups"),
          api.get("/tutor/messages/unread-counts"),
        ]);

        const me       = meRes.data.data || meRes.data;
        setTutorId(me.id);

        const students    = studentsRes.data.data || [];
        const groups      = groupsRes.data.data   || [];
        const unreadMap   = unreadRes.data.data    || {};

        const broadcastChat = {
          id:          "broadcast",
          type:        "broadcast",
          name:        "📢 All Students",
          color:       "#6366f1",
          lastMessage: "Send an announcement to all your students",
          time:        "",
          timestamp:   null,
          unread:      0,
          memberCount: students.length,
        };

        const groupChats = groups.map(g => ({
          id:          g.id,
          type:        "group",
          name:        g.name,
          color:       g.color || "#6366f1",
          lastMessage: "",
          time:        "",
          timestamp:   null,
          unread:      0,
          memberCount: g.members?.length || 0,
          description: g.description || "",
        }));

        const seen = new Set();
        const studentChats = students
          .filter(s => {
            if (!s.studentId || !s.studentEmail) return false;
            if (seen.has(s.studentId)) return false;
            seen.add(s.studentId);
            return true;
          })
          .map(s => ({
            id:          s.studentId,
            type:        "student",
            name:        s.studentName?.replace(/^\(Guest\) /, "") || "Unknown",
            avatar:      (s.studentName?.replace(/^\(Guest\) /, "") || "?").charAt(0).toUpperCase(),
            email:       s.studentEmail || "",
            color:       null,
            lastMessage: "",
            time:        "",
            timestamp:   null,
            unread:      unreadMap[String(s.studentId)] || 0,
            subject:     s.subject || "",
          }));

        const allChats = sortChats([broadcastChat, ...groupChats, ...studentChats]);
        setChats(allChats);
        setTotalUnread(calcTotalUnread(allChats));
      } catch (e) {
        console.error("Failed to fetch chats:", e);
      } finally {
        setLoadingChats(false);
      }
    };

    fetchChats();
  }, []);

  // ─── 2. Connect WebSocket when chat is selected ───────────────────────
  useEffect(() => {
    if (!selectedChat || !selectedType) return;

    const fetchHistory = async () => {
      try {
        let url;
        if (selectedType === "broadcast") url = "/tutor/messages/broadcast";
        else if (selectedType === "group") url = `/tutor/messages/group/${selectedChat}`;
        else                               url = `/tutor/messages/${selectedChat}`;
        const res = await api.get(url);
        setMessages(res.data.data || []);
      } catch (e) {
        console.error("Failed to fetch history:", e);
        setMessages([]);
      }

      // Mark as read when tutor opens a student chat
      if (selectedType === "student") {
        try {
          await api.patch(`/tutor/messages/${selectedChat}/read`);
          setChats(prev => {
            const updated = prev.map(c =>
              c.id === selectedChat && c.type === "student"
                ? { ...c, unread: 0 } : c
            );
            setTotalUnread(calcTotalUnread(updated));
            return updated;
          });
        } catch (e) {
          console.error("Failed to mark as read:", e);
        }
      }
    };

    fetchHistory();

    const token  = localStorage.getItem("jwt");
    let   active = true;

    const getTopic = () => {
      if (selectedType === "broadcast") return `/topic/broadcast/${tutorId}`;
      if (selectedType === "group")     return `/topic/group-messages/${selectedChat}`;
      return `/topic/messages/${selectedChat}`;
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

          // Only re-sort + increment unread for incoming (not tutor's own messages)
          if (incoming.sender !== "tutor") {
            setChats(prev => {
              const updated = prev.map(c => {
                if (c.id === selectedChatRef.current && c.type === selectedTypeRef.current) {
                  // Active chat — update preview but keep unread at 0
                  return { ...c, lastMessage: incoming.text, time: incoming.time, timestamp: Date.now() };
                }
                if (c.id === incoming.senderId && c.type === "student") {
                  // Different chat got a message — increment unread
                  return { ...c, lastMessage: incoming.text, time: incoming.time, timestamp: Date.now(), unread: (c.unread || 0) + 1 };
                }
                return c;
              });
              setTotalUnread(calcTotalUnread(updated));
              return sortChats(updated);
            });
          }
        });
      },
      onDisconnect:     () => { stompClientRef.current = null; },
      onStompError:     (frame) => console.error("❌ STOMP error:", frame),
      onWebSocketError: (error) => console.error("❌ WebSocket error:", error),
    });

    const timer = setTimeout(() => client.activate(), 500);

    return () => {
      active = false;
      clearTimeout(timer);
      client.deactivate();
      stompClientRef.current = null;
    };
  }, [selectedChat, selectedType, tutorId]);

  // ─── 3. Auto-scroll ──────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── 4. Send message ─────────────────────────────────────────────────
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !stompClientRef.current?.connected) return;

    const destination =
      selectedType === "broadcast" ? "/app/broadcast" :
      selectedType === "group"     ? `/app/group-chat/${selectedChat}` :
                                     `/app/chat/${selectedChat}`;

    const now       = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const timestamp = Date.now();

    stompClientRef.current.publish({
      destination,
      body: JSON.stringify({
        text:        messageInput.trim(),
        toStudentId: selectedType === "student" ? selectedChat : null,
        toGroupId:   selectedType === "group"   ? selectedChat : null,
        time:        now,
      }),
    });

    setChats(prev => {
      const updated = prev.map(c =>
        c.id === selectedChat && c.type === selectedType
          ? { ...c, lastMessage: messageInput.trim(), time: now, timestamp }
          : c
      );
      return sortChats(updated);
    });

    setMessageInput("");
  };

  // ─── 5. Filter ───────────────────────────────────────────────────────
  const filteredChats = chats.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedChatData = chats.find(
    c => c.id === selectedChat && c.type === selectedType
  );

  const getPlaceholder = () => {
    if (selectedType === "broadcast") return "Write an announcement to all students...";
    if (selectedType === "group")     return `Message ${selectedChatData?.name || "group"}...`;
    return "Type a message...";
  };

  return (
    <div className="messages-container">
      {/* ── Sidebar ── */}
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
            <div className="chat-loading">No chats found.</div>
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
                onClick={() => {
                  setSelectedChat(chat.id);
                  setSelectedType(chat.type);
                }}
              >
                <div
                  className="chat-avatar"
                  style={{ background: chat.color || "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
                >
                  {chat.type === "broadcast" && <Megaphone size={18} color="white" />}
                  {chat.type === "group"     && <Users size={18} color="white" />}
                  {chat.type === "student"   && chat.avatar}
                </div>

                <div className="chat-info">
                  <div className="chat-header">
                    <span className="chat-name">{chat.name}</span>
                    <span className="chat-time">{chat.time}</span>
                  </div>
                  <span className="chat-subject">
                    {chat.type === "broadcast"
                      ? `${chat.memberCount} students`
                      : chat.type === "group"
                        ? `${chat.memberCount} member${chat.memberCount !== 1 ? "s" : ""}`
                        : chat.subject}
                  </span>
                  <div className="chat-footer">
                    <span className="chat-preview">
                      {chat.lastMessage || (chat.type === "student" ? chat.email : "")}
                    </span>
                    {chat.unread > 0 && (
                      <span className="unread-badge">{chat.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Chat Area ── */}
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
                  {selectedChatData.type === "student"   && selectedChatData.avatar}
                </div>
                <div className="chat-user-details">
                  <span className="chat-user-name">{selectedChatData.name}</span>
                  <span className="chat-user-status">
                    {selectedChatData.type === "broadcast"
                      ? `Announcement to all ${selectedChatData.memberCount} students`
                      : selectedChatData.type === "group"
                        ? `${selectedChatData.memberCount} members`
                        : selectedChatData.email}
                  </span>
                </div>
              </div>
              <div className="chat-actions">
                {selectedChatData.type === "student" && (
                  <>
                    <button className="chat-action-btn" title="Voice Call"><Phone size={20} /></button>
                    <button className="chat-action-btn" title="Video Call"><Video size={20} /></button>
                  </>
                )}
                <button className="chat-action-btn" title="More Options"><MoreHorizontal size={20} /></button>
              </div>
            </div>

            <div className="messages-content">
              {selectedType === "broadcast" && (
                <div className="broadcast-banner">
                  <Megaphone size={14} />
                  Announcements are sent to all your students
                </div>
              )}
              <div className="messages-date"><span>Today</span></div>
              {messages.length === 0 ? (
                <div className="no-messages">
                  {selectedType === "broadcast"
                    ? "No announcements yet. Send your first message to all students! 📢"
                    : "No messages yet. Say hello! 👋"}
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={message.id || index}
                    className={`message ${message.sender === "tutor" ? "sent" : "received"}`}
                  >
                    <div className="message-bubble">
                      <p>{message.text}</p>
                      <div className="message-meta">
                        <span className="message-time">{message.time}</span>
                        {message.sender === "tutor" && (
                          <span className={`message-status ${message.status}`}>
                            {message.status === "read"
                              ? <CheckCheck size={14} />
                              : <Check size={14} />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="message-input-area" onSubmit={handleSendMessage}>
              <button type="button" className="input-action-btn"><Paperclip size={20} /></button>
              <div className="message-input-wrapper">
                <input
                  type="text"
                  placeholder={getPlaceholder()}
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
          </>
        ) : (
          <div className="empty-chat">
            <div className="empty-chat-icon"><Send size={48} /></div>
            <h3>Select a conversation</h3>
            <p>Choose a student, group, or send an announcement to all students</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;