import React, { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown,
  Download,
  Calendar,
  Wallet,
  Users,
  Clock,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import "../styles/Earnings.css";

const Earnings = () => {
  const [period, setPeriod] = useState("month");

  const earningsData = {
    totalEarnings: 84750,
    monthlyEarnings: 12500,
    weeklyEarnings: 3200,
    pendingPayments: 4500,
    totalStudents: 24,
    totalHours: 234,
    growth: 12.5
  };

  const monthlyData = [
    { month: "Jan", earnings: 8000, hours: 20 },
    { month: "Feb", earnings: 9500, hours: 24 },
    { month: "Mar", earnings: 11000, hours: 28 },
    { month: "Apr", earnings: 10500, hours: 26 },
    { month: "May", earnings: 12500, hours: 32 },
    { month: "Jun", earnings: 14000, hours: 36 },
  ];

  const subjectBreakdown = [
    { name: "Mathematics", value: 45000, color: "#4f46e5" },
    { name: "Physics", value: 32000, color: "#10b981" },
    { name: "Chemistry", value: 7750, color: "#f59e0b" },
  ];

  const recentTransactions = [
    {
      id: 1,
      student: "Thabo Mokoena",
      type: "Subscription",
      amount: 2500,
      date: "2024-06-20",
      status: "completed",
      description: "Monthly subscription - Mathematics"
    },
    {
      id: 2,
      student: "Lerato Ndlovu",
      type: "Subscription",
      amount: 1800,
      date: "2024-06-19",
      status: "completed",
      description: "Monthly subscription - Physics"
    },
    {
      id: 3,
      student: "Nomsa Khumalo",
      type: "Subscription",
      amount: 3500,
      date: "2024-06-18",
      status: "completed",
      description: "Premium subscription - Physics & Chemistry"
    },
    {
      id: 4,
      student: "Sipho Dlamini",
      type: "Subscription",
      amount: 1500,
      date: "2024-06-15",
      status: "pending",
      description: "Monthly subscription - Mathematics"
    },
    {
      id: 5,
      student: "Amahle Ngcobo",
      type: "One-time",
      amount: 500,
      date: "2024-06-14",
      status: "completed",
      description: "Extra session - Physics"
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="earnings-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Earnings</h1>
          <p>Track your income, payments, and financial analytics</p>
        </div>
        <div className="header-actions">
          <select 
            className="period-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="btn-secondary">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="earnings-stats">
        <div className="earnings-stat-card primary">
          <div className="stat-header">
            <span className="stat-title">Total Earnings</span>
            <div className="stat-icon">
              <Wallet size={20} />
            </div>
          </div>
          <span className="stat-amount">{formatCurrency(earningsData.totalEarnings)}</span>
          <div className="stat-growth positive">
            <ArrowUpRight size={16} />
            <span>+{earningsData.growth}% from last month</span>
          </div>
        </div>

        <div className="earnings-stat-card">
          <div className="stat-header">
            <span className="stat-title">This Month</span>
            <div className="stat-icon blue">
              <Calendar size={20} />
            </div>
          </div>
          <span className="stat-amount">{formatCurrency(earningsData.monthlyEarnings)}</span>
          <div className="stat-growth positive">
            <ArrowUpRight size={16} />
            <span>+8% from last month</span>
          </div>
        </div>

        <div className="earnings-stat-card">
          <div className="stat-header">
            <span className="stat-title">This Week</span>
            <div className="stat-icon green">
              <TrendingUp size={20} />
            </div>
          </div>
          <span className="stat-amount">{formatCurrency(earningsData.weeklyEarnings)}</span>
          <div className="stat-growth positive">
            <ArrowUpRight size={16} />
            <span>+15% from last week</span>
          </div>
        </div>

        <div className="earnings-stat-card">
          <div className="stat-header">
            <span className="stat-title">Pending</span>
            <div className="stat-icon orange">
              <Clock size={20} />
            </div>
          </div>
          <span className="stat-amount">{formatCurrency(earningsData.pendingPayments)}</span>
          <div className="stat-growth neutral">
            <span>3 payments awaiting</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Monthly Earnings Chart */}
        <div className="chart-card large">
          <div className="chart-header">
            <div>
              <h3>Monthly Earnings</h3>
              <p>Revenue trend over the past 6 months</p>
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
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
                <Bar 
                  dataKey="earnings" 
                  fill="url(#earningsBarGradient)" 
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="earningsBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Breakdown */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Subject Breakdown</h3>
              <p>Earnings by subject</p>
            </div>
          </div>
          <div className="chart-wrapper pie">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={subjectBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {subjectBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Earnings']}
                  contentStyle={{ 
                    background: '#1e293b', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="pie-legend">
            {subjectBreakdown.map((item, idx) => (
              <div key={idx} className="legend-item">
                <span className="legend-color" style={{ background: item.color }}></span>
                <span className="legend-name">{item.name}</span>
                <span className="legend-value">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="transactions-card">
        <div className="card-header">
          <div>
            <h3>Recent Transactions</h3>
            <p>Latest payments and subscriptions</p>
          </div>
          <button className="view-all-btn">
            View All
          </button>
        </div>
        <div className="transactions-list">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-icon">
                <Wallet size={18} />
              </div>
              <div className="transaction-details">
                <div className="transaction-header">
                  <span className="transaction-student">{transaction.student}</span>
                  <span className={`transaction-status ${transaction.status}`}>
                    {transaction.status}
                  </span>
                </div>
                <span className="transaction-description">{transaction.description}</span>
                <span className="transaction-date">{transaction.date}</span>
              </div>
              <div className="transaction-amount">
                <span className={transaction.status === 'pending' ? 'pending' : ''}>
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="quick-stats-row">
        <div className="quick-stat">
          <div className="quick-stat-icon">
            <Users size={20} />
          </div>
          <div className="quick-stat-content">
            <span className="quick-stat-value">{earningsData.totalStudents}</span>
            <span className="quick-stat-label">Active Students</span>
          </div>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-icon">
            <Clock size={20} />
          </div>
          <div className="quick-stat-content">
            <span className="quick-stat-value">{earningsData.totalHours}</span>
            <span className="quick-stat-label">Hours Tutored</span>
          </div>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-icon">
            <Wallet size={20} />
          </div>
          <div className="quick-stat-content">
            <span className="quick-stat-value">R362</span>
            <span className="quick-stat-label">Avg. per Hour</span>
          </div>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-icon">
            <TrendingUp size={20} />
          </div>
          <div className="quick-stat-content">
            <span className="quick-stat-value">94%</span>
            <span className="quick-stat-label">Collection Rate</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
