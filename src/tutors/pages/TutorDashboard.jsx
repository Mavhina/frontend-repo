import React, { useState, useEffect } from "react";
import { 
  Users, 
  Calendar, 
  Wallet, 
  TrendingUp,
  TrendingDown,
  Clock, 
  Star,
  ChevronRight,
  Video,
  MapPin,
  MoreHorizontal,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import "../styles/TutorDashboard.css";
import api from "../../services/api";

const TutorDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    studentsThisMonth: 0,
    monthlyEarnings: 0,
    lastMonthEarnings: 0,
    totalEarnings: 0,
    totalSessions: 0,
    pendingPayments: 0,
    averageRating: null,
    totalReviews: 0,
  });

  const [earningsData, setEarningsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [sessionsThisWeek, setSessionsThisWeek] = useState(0);
  const [recentStudents] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
    fetchUpcomingSessions();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tutor/dashboard/stats');
      const data = response.data.data;

      setStats(prev => ({
        ...prev,
        totalStudents: data.totalStudents || 0,
        studentsThisMonth: data.studentsThisMonth || 0,
        monthlyEarnings: data.monthlyEarnings || 0,
        lastMonthEarnings: data.lastMonthEarnings || 0,
        totalEarnings: data.totalEarnings || 0,
        averageRating: data.averageRating || null,
        totalReviews: data.totalReviews || 0,
      }));

      if (data.earningsChart && data.earningsChart.length > 0) {
        setEarningsData(data.earningsChart.map(item => ({
          month: item.month,
          earnings: parseFloat(item.earnings) || 0,
        })));
      } else {
        setEarningsData([{ month: "Now", earnings: parseFloat(data.monthlyEarnings) || 0 }]);
      }

    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingSessions = async () => {
    try {
      const res = await api.get("/tutor/sessions?status=CONFIRMED");
      const all = res.data?.data || [];
      const now = new Date().toISOString().split("T")[0];

      // Get end of current week (Sunday)
      const endOfWeek = new Date();
      endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
      const endOfWeekStr = endOfWeek.toISOString().split("T")[0];

      // Count sessions this week
      const thisWeek = all.filter(s => s.date >= now && s.date <= endOfWeekStr);
      setSessionsThisWeek(thisWeek.length);

      const upcoming = all.filter(s => s.date >= now).slice(0, 5);
      setUpcomingSessions(upcoming);
    } catch (e) {
      console.error("Failed to fetch upcoming sessions:", e);
    }
  };

  const getEarningsChange = () => {
    const current = parseFloat(stats.monthlyEarnings) || 0;
    const last = parseFloat(stats.lastMonthEarnings) || 0;

    if (last === 0 && current === 0) return { direction: "neutral", label: "No data yet" };
    if (last === 0 && current > 0)   return { direction: "up",      label: "New earnings this month" };

    const change = ((current - last) / last) * 100;
    const rounded = Math.abs(change).toFixed(1);

    if (change > 0) return { direction: "up",     label: `+${rounded}% from last month` };
    if (change < 0) return { direction: "down",   label: `-${rounded}% from last month` };
    return               { direction: "neutral", label: "Same as last month" };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  const earningsChange = getEarningsChange();

  return (
    <div className="dashboard-container">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon students">
            <Users size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Students</span>
            <span className="stat-value">{stats.totalStudents}</span>
            <span className="stat-change positive">
              <TrendingUp size={14} />
              +{stats.studentsThisMonth} this month
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon earnings">
            <Wallet size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Monthly Earnings</span>
            <span className="stat-value">{formatCurrency(stats.monthlyEarnings)}</span>
            <span className={`stat-change ${
              earningsChange.direction === "up" ? "positive" :
              earningsChange.direction === "down" ? "negative" : "neutral"
            }`}>
              {earningsChange.direction === "up" && <TrendingUp size={14} />}
              {earningsChange.direction === "down" && <TrendingDown size={14} />}
              {earningsChange.label}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon sessions">
            <Calendar size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Upcoming Sessions</span>
            <span className="stat-value">{upcomingSessions.length}</span>
            <span className={`stat-change ${sessionsThisWeek > 0 ? "positive" : "neutral"}`}>
              {sessionsThisWeek > 0 && <TrendingUp size={14} />}
              {sessionsThisWeek > 0
                ? `+${sessionsThisWeek} this week`
                : "None this week"}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rating">
            <Star size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Your Rating</span>
            <span className="stat-value">{stats.averageRating || "—"}</span>
            <span className="stat-change neutral">
              {stats.totalReviews > 0
                ? `Based on ${stats.totalReviews} reviews`
                : "No reviews yet"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Earnings Chart */}
        <div className="dashboard-card earnings-chart">
          <div className="card-header">
            <div>
              <h3>Earnings Overview</h3>
              <p>Your monthly revenue for the past 6 months</p>
            </div>
          </div>
          <div className="chart-container">
            {earningsData.length === 0 ? (
              <div className="empty-state">No earnings data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={earningsData}>
                  <defs>
                    <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `R${value/1000}k`}
                    dx={-10}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), 'Earnings']}
                    contentStyle={{ 
                      background: '#1e293b', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    fill="url(#earningsGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card quick-actions">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="actions-list">
            <button className="action-btn">
              <div className="action-icon schedule"><Calendar size={18} /></div>
              <span>Schedule Session</span>
              <ChevronRight size={16} />
            </button>
            <button className="action-btn">
              <div className="action-icon message"><Users size={18} /></div>
              <span>Message Students</span>
              <ChevronRight size={16} />
            </button>
            <button className="action-btn">
              <div className="action-icon payment"><Wallet size={18} /></div>
              <span>View Payments</span>
              <ChevronRight size={16} />
            </button>
            <button className="action-btn">
              <div className="action-icon profile"><TrendingUp size={18} /></div>
              <span>Update Profile</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="dashboard-grid">
        {/* Upcoming Sessions */}
        <div className="dashboard-card sessions-card">
          <div className="card-header">
            <div>
              <h3>Upcoming Sessions</h3>
              <p>You have {upcomingSessions.length} session{upcomingSessions.length !== 1 ? "s" : ""} scheduled</p>
            </div>
            <button className="view-all-btn">View All <ChevronRight size={16} /></button>
          </div>
          <div className="sessions-list">
            {upcomingSessions.length === 0 ? (
              <div className="empty-state">No upcoming sessions yet.</div>
            ) : (
              upcomingSessions.map((s) => (
                <div key={s.id} className="session-item">
                  <div className="session-avatar">
                    {s.type === "GROUP"
                      ? "👥"
                      : (s.studentName || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="session-info">
                    <div className="session-header">
                      <span className="student-name">
                        {s.type === "GROUP" ? s.groupName : s.studentName}
                      </span>
                      <span className={`session-status ${(s.computedStatus || s.status).toLowerCase()}`}>
                        {(s.computedStatus === "CONFIRMED" || s.status === "CONFIRMED")
                          ? <><CheckCircle size={12}/> Confirmed</>
                          : <><AlertCircle size={12}/> Pending</>}
                      </span>
                    </div>
                    <span className="session-subject">{s.subject} · {s.topic}</span>
                    <div className="session-meta">
                      <span className="session-time">
                        <Clock size={12}/> {s.date}, {s.startTime?.substring(0, 5)}
                      </span>
                      <span className="session-type">
                        {s.mode === "Online" ? <Video size={12}/> : <MapPin size={12}/>}
                        {s.mode}
                      </span>
                    </div>
                  </div>
                  <button className="session-menu"><MoreHorizontal size={18}/></button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Students */}
        <div className="dashboard-card students-card">
          <div className="card-header">
            <div>
              <h3>Recent Students</h3>
              <p>Track your students' progress</p>
            </div>
            <button className="view-all-btn">View All <ChevronRight size={16} /></button>
          </div>
          <div className="students-list">
            {recentStudents.length === 0 ? (
              <div className="empty-state">No students yet.</div>
            ) : (
              recentStudents.map((student) => (
                <div key={student.id} className="student-item">
                  <div className="student-avatar">{student.avatar}</div>
                  <div className="student-info">
                    <div className="student-header">
                      <span className="student-name">{student.name}</span>
                      <span className={`payment-badge ${student.paymentStatus}`}>
                        {student.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    <span className="student-subject">{student.subject}</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${student.progress}%` }} />
                    </div>
                    <span className="progress-text">{student.progress}% complete</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Payment Alerts */}
      {stats.pendingPayments > 0 && (
        <div className="payment-alert">
          <div className="alert-icon"><AlertCircle size={20} /></div>
          <div className="alert-content">
            <span className="alert-title">Payment Reminder</span>
            <span className="alert-text">
              You have {stats.pendingPayments} students with pending payments.{" "}
              <a href="/tutor/students">View details</a>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorDashboard;