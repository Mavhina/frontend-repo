// src/pages/ChatsPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Bot,
  Users,
  GraduationCap,
  BadgeDollarSign,
  MessageCircle,
  Info,
  Send,
  Search,
  Trash2
} from "lucide-react";
import api from "../services/api";
import "./ChatsPage.css";

const TABS = [
  { key: "askai", label: "AskAI", icon: Bot, hint: "Private assistant for student questions" },
  { key: "community", label: "Community", icon: Users, hint: "Talk to other students" },
  { key: "course-help", label: "Course Help", icon: GraduationCap, hint: "Courses, careers, APS guidance" },
  { key: "funding-help", label: "Funding Help", icon: BadgeDollarSign, hint: "NSFAS, bursaries, fee fund support" }
];

const formatDateTime = (dateLike) => {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export default function ChatsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const initialTab = useMemo(() => {
    const t = params.get("tab");
    return TABS.some((x) => x.key === t) ? t : "askai";
  }, [params]);

  const [tab, setTab] = useState(initialTab);

  // keep URL in sync
  useEffect(() => {
    const urlTab = params.get("tab");
    if (urlTab !== tab) setParams({ tab });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // if user manually changes URL
  useEffect(() => {
    const urlTab = params.get("tab");
    if (urlTab && urlTab !== tab && TABS.some((x) => x.key === urlTab)) setTab(urlTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const ActiveIcon = TABS.find((t) => t.key === tab)?.icon || MessageCircle;

  return (
    <div className="ch-page">
      <div className="ch-wrap">
        {/* ✅ MAIN WHITE WRAPPER */}
        <div className="ch-main">
          {/* Header */}
          <div className="ch-head">
            <div>
              <h1>Chats</h1>
              <p className="muted">Ask questions, get guidance, and connect with other students.</p>
            </div>

            <div className="ch-head-actions">
              <button className="ch-btn" type="button" onClick={() => navigate("/app/fee-fund")}>
                Back to Fee Fund
              </button>
            </div>
          </div>

          {/* Hero */}
          <div className="ch-hero">
            <div className="ch-hero-left">
              <div className="ch-hero-icon">
                <ActiveIcon size={20} />
              </div>
              <div>
                <div className="ch-hero-title">{TABS.find((t) => t.key === tab)?.label || "Chats"}</div>
                <div className="ch-hero-sub">{TABS.find((t) => t.key === tab)?.hint || "Explore chats and help tools."}</div>
              </div>
            </div>

            <div className="ch-hero-actions">
              <button className="ch-btn primary" type="button" onClick={() => setTab("askai")}>
                Open AskAI <Bot size={16} />
              </button>
              <button className="ch-btn" type="button" onClick={() => setTab("community")}>
                Community <Users size={16} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="ch-tabs">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  className={`ch-tab ${tab === t.key ? "active" : ""}`}
                  onClick={() => setTab(t.key)}
                  type="button"
                >
                  <Icon size={16} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          {tab === "askai" ? <AskAITab /> : null}
          {tab === "community" ? <CommunityTab formatDateTime={formatDateTime} /> : null}
          {tab === "course-help" ? <CourseHelpTab /> : null}
          {tab === "funding-help" ? <FundingHelpTab /> : null}
        </div>
      </div>
    </div>
  );
}

/** -------------------- TABS -------------------- **/

function AskAITab() {
  const [text, setText] = useState("");

  const onSend = (e) => {
    e.preventDefault();
    alert("AskAI is coming next ✅ For now this is UI only.");
    setText("");
  };

  return (
    <div className="ch-grid">
      <div className="ch-card">
        <div className="ch-card-head">
          <div>
            <h2>AskAI</h2>
            <p className="muted">Ask anything about APS, NSFAS, courses, universities, careers and more.</p>
          </div>

          <div className="ch-chip">
            <Bot size={14} /> AI (soon)
          </div>
        </div>

        <div className="ch-chatbox">
          <div className="ch-msg ai">
            <div className="ch-msg-bubble">
              👋 Hi! I’m CourseCompass Assistant. Ask me about APS, NSFAS, courses, or bursaries.
            </div>
          </div>

          <div className="ch-empty muted">No messages yet. Ask your first question below.</div>
        </div>

        <form className="ch-input" onSubmit={onSend}>
          <div className="ch-input-icon">
            <MessageCircle size={16} />
          </div>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder='e.g. "What is NSFAS?"' />
          <button className="ch-btn primary" type="submit" disabled={!text.trim()}>
            Send <Send size={16} />
          </button>
        </form>

        <div className="ch-note">
          <Info size={16} />
          <span>CURRENTLY UNAVAILABLE (COMING SOON).</span>
        </div>
      </div>

      <div className="ch-card">
        <h2>Popular questions</h2>

        <div className="ch-quick">
          {[
            "What is NSFAS?",
            "How is APS calculated?",
            "What can I study with APS 28?",
            "Difference between Diploma & Bachelor pass?",
            "What jobs can I get with Computer Science?"
          ].map((q) => (
            <button
              key={q}
              className="ch-pill"
              type="button"
              onClick={() => alert(`Later: clicking will paste into AskAI.\n\n"${q}"`)}
            >
              {q}
            </button>
          ))}
        </div>

        <div className="ch-note">
          <Search size={16} />
          <span>Later you can power these from analytics (“most asked questions”).</span>
        </div>
      </div>
    </div>
  );
}

function CommunityTab({ formatDateTime }) {
  const ROOM = "community";
  const listRef = useRef(null);

  const [me, setMe] = useState(null);
  const [text, setText] = useState("");

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState(null);

  const scrollToBottom = (smooth = true) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  };

  const loadMe = async () => {
    const res = await api.get("/user/me");
    return res.data;
  };

  const loadMessages = async () => {
    const res = await api.get(`/chats/messages?room=${encodeURIComponent(ROOM)}&page=0&size=50`);
    const items = res.data?.items || [];
    items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return items;
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        setErr(null);
        setLoading(true);

        const [meRes, msgs] = await Promise.all([loadMe(), loadMessages()]);
        if (!mounted) return;

        setMe(meRes);
        setMessages(msgs);
        setTimeout(() => scrollToBottom(false), 0);
      } catch (e) {
        console.error(e);
        if (mounted) setErr("Failed to load community messages");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, []);

  const isMine = (m) => {
    if (!me?.id) return false;
    return String(m?.user?.id) === String(me.id);
  };

  const onSend = async (e) => {
    e.preventDefault();
    const msg = text.trim();
    if (!msg) return;

    setErr(null);
    setSending(true);

    const tempId = `tmp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      room: ROOM,
      message: msg,
      createdAt: new Date().toISOString(),
      visible: true,
      user: {
        id: me?.id ?? -1,
        fullName: me?.fullName ?? "Me",
        username: me?.username ?? me?.email ?? "me"
      },
      __optimistic: true
    };

    setMessages((prev) => [...prev, optimistic]);
    setText("");
    setTimeout(() => scrollToBottom(true), 0);

    try {
      const res = await api.post("/chats/messages", { room: ROOM, message: msg });
      const saved = res.data;
      setMessages((prev) => prev.map((m) => (m.id === tempId ? saved : m)));
      setTimeout(() => scrollToBottom(true), 0);
    } catch (e2) {
      console.error(e2);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setErr(e2?.response?.data?.message || e2?.response?.data?.error || "Failed to send message");
      setText(msg);
    } finally {
      setSending(false);
    }
  };

  const onDelete = async (id) => {
    const target = messages.find((m) => String(m.id) === String(id));
    if (!target) return;

    const mine = isMine(target);
    if (!mine) return;

    const ok = window.confirm("Delete this message?");
    if (!ok) return;

    const prev = messages;
    setMessages((p) => p.filter((m) => String(m.id) !== String(id)));

    try {
      await api.delete(`/chats/messages/${id}`);
    } catch (e) {
      console.error(e);
      setMessages(prev);
      setErr("Failed to delete message");
    }
  };

  return (
    <div className="ch-grid">
      <div className="ch-card">
        <div className="ch-card-head">
          <div>
            <h2>Community</h2>
            <p className="muted">Public room — everyone sees these messages.</p>
          </div>

          <div className="ch-chip">
            <Users size={14} /> {ROOM.toUpperCase()}
          </div>
        </div>

        {err ? <div className="muted" style={{ color: "#b91c1c" }}>{String(err)}</div> : null}
        {loading ? <div className="muted">Loading messages...</div> : null}

        <div className="ch-chatbox community-box" ref={listRef}>
          {messages.length === 0 && !loading ? (
            <div className="ch-empty muted">No messages yet. Be the first to say hi 👋</div>
          ) : null}

          {messages.map((m) => {
            const mine = isMine(m);
            return (
              <div key={m.id} className={`comm-row ${mine ? "me" : "other"}`}>
                <div className="comm-meta">
                  <span className="comm-user">{m.user?.fullName || "Unknown"}</span>
                  <span className="comm-time">{formatDateTime(m.createdAt)}</span>

                  {mine && m.id != null ? (
                    <button className="comm-del" type="button" title="Delete" onClick={() => onDelete(m.id)}>
                      <Trash2 size={14} />
                    </button>
                  ) : null}
                </div>

                <div className={`comm-bubble ${mine ? "mine" : "theirs"}`}>{m.message}</div>
              </div>
            );
          })}
        </div>

        <form className="ch-input" onSubmit={onSend}>
          <div className="ch-input-icon">
            <MessageCircle size={16} />
          </div>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a message to the community..."
            disabled={sending}
          />
          <button className="ch-btn primary" type="submit" disabled={sending || !text.trim()}>
            {sending ? "Sending..." : "Send"} <Send size={16} />
          </button>
        </form>

        <div className="ch-note">
          <Info size={16} />
          <span>Tip: be respectful to one another.</span>
        </div>
      </div>

      <div className="ch-card">
        <h2>Rules</h2>
        <ul className="ch-bullets">
          <li>No ID numbers or sensitive info.</li>
          <li>Be respectful (students helping students).</li>
          <li>Admins can moderate (we’ll add later).</li>
        </ul>
      </div>
    </div>
  );
}

function CourseHelpTab() {
  return (
    <div className="ch-grid">
      <div className="ch-card">
        <h2>Course Help</h2>
        <p className="muted">A focused area for course + career guidance (less noise than general community).</p>

        <div className="ch-placeholder">
          <GraduationCap size={18} />
          <div>
            <div className="ch-placeholder-title">Course Help board (next)</div>
            <div className="muted">
              COMING SOON: You'll be able to connect with people in different fields (working and in varsity).
            </div>
          </div>
        </div>
      </div>

      <div className="ch-card">
        <h2>COMING SOON</h2>
        <ul className="ch-bullets">
          <li>University Student</li>
          <li>Learn how they made it</li>
          <li>How is it working in the field</li>
        </ul>
      </div>
    </div>
  );
}

function FundingHelpTab() {
  return (
    <div className="ch-grid">
      <div className="ch-card">
        <h2>Funding Help</h2>
        <p className="muted">NSFAS + bursaries + fee fund support. This can link directly to your Fee Fund applications.</p>

        <div className="ch-placeholder">
          <BadgeDollarSign size={18} />
          <div>
            <div className="ch-placeholder-title">Funding help room (COMING SOON)</div>
            <div className="muted">
              Admin support, FAQs, and a “Chat with support about registration fee funding” when status = NEED_MORE_INFO.
            </div>
          </div>
        </div>
      </div>

      <div className="ch-card">
        <h2>Quick rules</h2>
        <ul className="ch-bullets">
          <li>No ID numbers or sensitive info in public posts</li>
          <li>Use official links only</li>
          <li>Admins can verify and pin answers</li>
        </ul>
      </div>
    </div>
  );
}
