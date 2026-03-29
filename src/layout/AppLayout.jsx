import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { HeartHandshake } from "lucide-react";
import { LayoutDashboard, LogOut, Search, Target, User, Wallet, MessageCircle, Home as HomeIcon, BookOpen, ClipboardCheck, Trophy } from "lucide-react";
import api from "../services/api";
import "../pages/Dashboard.css";
import { useUnread } from "../pages/Unreadcontext.jsx";

const AppLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { unreadCount, setUnreadCount } = useUnread();

  useEffect(() => {
    api.get("/user/me")
      .then((res) => setUser(res.data))
      .catch((err) => console.error("Failed to load user", err));
  }, []);

  // Fetch unread count on mount so nav badge shows immediately on any page
  useEffect(() => {
    api.get("/student/messages/unread-counts")
      .then((res) => {
        const data = res.data.data || {};
        const chatCounts  = Object.values(data.chats  || {});
        const groupCounts = Object.values(data.groups || {});
        const total = [...chatCounts, ...groupCounts].reduce((sum, v) => sum + Number(v), 0);
        setUnreadCount(total);
      })
      .catch(() => {}); // silently fail — tutor accounts won't have this endpoint
  }, []);

  const signOut = () => {
    localStorage.removeItem("jwt");
    navigate("/");
  };

  return (
    <div className="dash-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">◐</div>
          <span>CourseCompass</span>
        </div>

        <nav className="side-nav">
          <NavLink to="/app/dashboard" className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/app/course-match" className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}>
            <Search size={18} />
            <span>Course Match</span>
          </NavLink>

          <NavLink to="/app/tutors" className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}>
            <Target size={18} />
            <span>Find Tutors</span>
          </NavLink>

          <NavLink to="/app/university-guides" className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}>
            <Search size={18} />
            <span>University Guide</span>
          </NavLink>

          <NavLink to="/app/bursaries" className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}>
            <Wallet size={18} />
            <span>Bursaries</span>
          </NavLink>

          <NavLink to="/app/fee-fund" className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}>
            <HeartHandshake size={18} />
            <span>Fee Fund</span>
          </NavLink>

          <NavLink
            to="/app/messages"
            className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}
          >
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <MessageCircle size={18} />
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: -6, right: -8,
                  background: "#ef4444", color: "white",
                  fontSize: 10, fontWeight: 700,
                  borderRadius: "999px", minWidth: 16, height: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 4px", lineHeight: 1,
                }}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
            <span>Messages</span>
          </NavLink>

          <NavLink to="/app/chats" className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}>
            <MessageCircle size={18} />
            <span>Chats</span>
          </NavLink>

          <NavLink to="/app/accommodation" className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}>
            <HomeIcon size={18} />
            <span>Accommodation</span>
          </NavLink>

          <NavLink to="/app/resources" className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}>
            <BookOpen size={18} />
            <span>Resources</span>
          </NavLink>

          <NavLink to="/app/apply-for-me" className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}>
            <ClipboardCheck size={18} />
            <span>Apply For Me</span>
          </NavLink>

          <NavLink to="/app/rewards" className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}>
            <Trophy size={18} />
            <span>Rewards</span>
          </NavLink>

          <div style={{ marginTop: "auto", paddingTop: 10 }}>
            <button className="side-link" onClick={signOut}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      <div className="dash-main">
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-logo">
              <div className="logo-mark">◐</div>
              <div className="logo-text">CourseCompass</div>
            </div>
          </div>
          <div className="topbar-right">
            <div className="user-pill">
              <User size={16} />
              <span>{user?.fullName || "Loading..."}</span>
            </div>
            <button className="signout" onClick={signOut}>
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;