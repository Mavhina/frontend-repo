import React, { useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Wallet,
  MessageSquare,
  UserCircle,
  UsersRound,
  LogOut,
  Briefcase,
  Bell,
} from 'lucide-react';
import { useUser } from "./context/UserContext";
import { useTutorUnread } from "./context/Tutorunreadcontext";
import api from "../services/api";
import "./styles/TutorLayout.css";

const TutorLayout = () => {
  const navigate = useNavigate();
  const { currentUser, loading } = useUser();
  const { tutorUnreadCount, setTutorUnreadCount } = useTutorUnread();

  // Fetch unread count on mount so badge shows on every page
  useEffect(() => {
    api.get("/tutor/messages/unread-counts")
      .then((res) => {
        const counts = res.data.data || {};
        const total = Object.values(counts).reduce((sum, v) => sum + Number(v), 0);
        setTutorUnreadCount(total);
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getDisplayName = () => {
    if (!currentUser) return 'Tutor';
    return currentUser.fullName || currentUser.username || 'Tutor';
  };

  const getInitials = () => {
    if (!currentUser) return 'T';
    const name = currentUser.fullName || currentUser.username || 'T';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getFirstName = () => {
    if (!currentUser) return 'Tutor';
    const name = currentUser.fullName || currentUser.username || 'Tutor';
    return name.split(' ')[0];
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="tutor-shell">
      {/* Sidebar */}
      <aside className="tutor-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">C</div>
          <span>CourseCompass</span>
          <span className="brand-badge">TUTOR</span>
        </div>

        <nav className="side-nav">
          <NavLink to="/tutor/dashboard" className="side-link" end>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/tutor/students" className="side-link">
            <Users size={20} />
            <span>My Students</span>
          </NavLink>

          <NavLink to="/tutor/groups" className="side-link">
            <UsersRound size={20} />
            <span>Groups</span>
          </NavLink>

          <NavLink to="/tutor/sessions" className="side-link">
            <Calendar size={20} />
            <span>Sessions</span>
          </NavLink>

          <NavLink to="/tutor/business-profile" className="side-link">
  <Briefcase size={20} />
  <span>Business Profile</span>
</NavLink>

          <NavLink to="/tutor/earnings" className="side-link">
            <Wallet size={20} />
            <span>Earnings</span>
          </NavLink>

          {/* Messages with real unread badge */}
          <NavLink to="/tutor/messages" className="side-link">
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <MessageSquare size={20} />
              {tutorUnreadCount > 0 && (
                <span style={{
                  position:       "absolute",
                  top:            -6,
                  right:          -8,
                  background:     "#ef4444",
                  color:          "white",
                  fontSize:       10,
                  fontWeight:     700,
                  borderRadius:   "999px",
                  minWidth:       16,
                  height:         16,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  padding:        "0 4px",
                  lineHeight:     1,
                }}>
                  {tutorUnreadCount > 99 ? "99+" : tutorUnreadCount}
                </span>
              )}
            </div>
            <span>Messages</span>
          </NavLink>

          <NavLink to="/tutor/profile" className="side-link">
            <UserCircle size={20} />
            <span>Profile</span>
          </NavLink>

          <div style={{ flex: 1 }}></div>

          <button onClick={handleLogout} className="side-link logout">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="tutor-main">
        <header className="tutor-topbar">
          <div className="welcome-text">
            <h1>Welcome back, {getFirstName()}! 👋</h1>
            <p>Here's what's happening with your students today</p>
          </div>

          <div className="topbar-right">
            <button className="icon-btn">
              <Bell size={20} />
              {tutorUnreadCount > 0 && <span className="notification-dot">{tutorUnreadCount > 9 ? "9+" : tutorUnreadCount}</span>}
            </button>

            <div className="user-pill">
              <div className="user-avatar">{getInitials()}</div>
              <div className="user-info">
                <span className="user-name">{getDisplayName()}</span>
                <span className="user-role">{currentUser?.subject || 'Mathematics'}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="tutor-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TutorLayout;