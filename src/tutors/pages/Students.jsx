import React, { useState, useEffect } from "react";
import {
  Search, Filter, MoreHorizontal, Calendar,
  CheckCircle, XCircle, Clock, Download,
  Plus, FileText, MessageCircle, ChevronDown
} from "lucide-react";
import "../styles/Students.css";
import api from "../../services/api";
import AddStudentModal from "./Addstudentmodal.jsx";

const PAYMENT_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending",  color: "pending" },
  { value: "PAID",    label: "Paid",     color: "paid" },
  { value: "OVERDUE", label: "Overdue",  color: "overdue" },
];

const Students = () => {
  const [searchQuery, setSearchQuery]           = useState("");
  const [filterStatus, setFilterStatus]         = useState("all");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [students, setStudents]                 = useState([]);
  const [summaryStats, setSummaryStats]         = useState({ total: 0, monthlyRevenue: 0 });
  const [showAddModal, setShowAddModal]         = useState(false);

  const now = new Date();
  const [selectedYear,  setSelectedYear]  = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [filterByMonth, setFilterByMonth] = useState(false);

  useEffect(() => { fetchSummaryStats(); }, []);
  useEffect(() => { fetchStudents(); }, [selectedYear, selectedMonth, filterByMonth]);

  const fetchSummaryStats = async () => {
    try {
      const res = await api.get('/tutor/dashboard/stats');
      const d = res.data.data;
      setSummaryStats({ total: d.totalStudents || 0, monthlyRevenue: d.monthlyEarnings || 0 });
    } catch (e) { console.error('Failed to fetch summary stats:', e); }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const url = filterByMonth
        ? `/tutor/students?year=${selectedYear}&month=${selectedMonth}`
        : '/tutor/students';
      const res = await api.get(url);
      setStudents(res.data.data || []);
    } catch (e) { console.error('Failed to fetch students:', e); }
    finally { setLoading(false); }
  };

  const handlePaymentStatusChange = async (bookingId, newStatus) => {
    try {
      await api.patch(`/tutor/students/${bookingId}/payment-status`, { paymentStatus: newStatus });
      setStudents(prev => prev.map(s =>
        s.bookingId === bookingId ? { ...s, paymentStatus: newStatus } : s
      ));
    } catch (e) { console.error('Failed to update payment status:', e); }
  };

  const handleDueDateChange = async (bookingId, dueDate) => {
    try {
      await api.patch(`/tutor/students/${bookingId}/due-date`, { dueDate });
      setStudents(prev => prev.map(s =>
        s.bookingId === bookingId ? { ...s, paymentDueDate: dueDate } : s
      ));
    } catch (e) { console.error('Failed to update due date:', e); }
  };

  const filteredStudents = students.filter(s => {
    const name  = s.studentName?.toLowerCase() || "";
    const email = s.studentEmail?.toLowerCase() || "";
    const matchesSearch = name.includes(searchQuery.toLowerCase()) ||
                          email.includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" ||
                          filterStatus === s.paymentStatus?.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total:          summaryStats.total,
    paid:           students.filter(s => s.paymentStatus === "PAID").length,
    pending:        students.filter(s => s.paymentStatus === "PENDING").length,
    overdue:        students.filter(s => s.paymentStatus === "OVERDUE").length,
    monthlyRevenue: summaryStats.monthlyRevenue,
  };

  const formatCurrency = amt =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(amt || 0);

  const handleExport = () => {
    const headers = ["Name", "Email", "Amount (ZAR)", "Booked On", "Payment Status", "Due Date"];
    const rows = filteredStudents.map(s => [
      s.studentName?.replace(/^\(Guest\) /, '') || "Unknown",
      s.studentEmail || "—",
      s.price || 0,
      formatDate(s.bookedAt),
      s.paymentStatus || "PENDING",
      s.paymentDueDate || "—"
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filterByMonth
      ? `students-${monthName(selectedMonth)}-${selectedYear}.csv`
      : `students-all.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = d => d ? new Date(d).toLocaleDateString('en-ZA') : "—";
  const monthName  = m => new Date(2000, m - 1).toLocaleString('default', { month: 'long' });

  const toggleSelectAll = () => {
    setSelectedStudents(
      selectedStudents.length === filteredStudents.length
        ? []
        : filteredStudents.map(s => s.bookingId)
    );
  };

  const toggleSelectStudent = id => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  return (
    <div className="students-container">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>My Students</h1>
          <p>Manage your students, track payments, and monitor progress</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleExport}>
            <Download size={18} /> Export
          </button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Add Student
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="students-stats">
        <div className="stat-box">
          <span className="stat-box-value">{stats.total}</span>
          <span className="stat-box-label">Total Students</span>
        </div>
        <div className="stat-box success">
          <span className="stat-box-value">{stats.paid}</span>
          <span className="stat-box-label">Paid</span>
        </div>
        <div className="stat-box warning">
          <span className="stat-box-value">{stats.pending}</span>
          <span className="stat-box-label">Pending</span>
        </div>
        <div className="stat-box danger">
          <span className="stat-box-value">{stats.overdue}</span>
          <span className="stat-box-label">Overdue</span>
        </div>
        <div className="stat-box primary">
          <span className="stat-box-value">{formatCurrency(stats.monthlyRevenue)}</span>
          <span className="stat-box-label">This Month's Earnings</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label className="month-filter-toggle">
            <input
              type="checkbox"
              checked={filterByMonth}
              onChange={e => setFilterByMonth(e.target.checked)}
            />
            Filter by month
          </label>
          {filterByMonth && (
            <>
              <select className="filter-select" value={selectedMonth}
                onChange={e => setSelectedMonth(Number(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{monthName(m)}</option>
                ))}
              </select>
              <select className="filter-select" value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}>
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </>
          )}
          <select className="filter-select" value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="students-table-card">
        <div className="table-header">
          <label className="checkbox-wrapper">
            <input
              type="checkbox"
              checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
              onChange={toggleSelectAll}
            />
            <span className="checkmark"></span>
          </label>
          <span className="selected-count">
            {selectedStudents.length > 0 && `${selectedStudents.length} selected`}
          </span>
        </div>

        <div className="students-table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Student</th>
                <th>Amount</th>
                <th>Booked On</th>
                <th>Payment Status</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading students...
                  </td>
                </tr>
              ) : filteredStudents.map(student => (
                <tr key={student.bookingId}>
                  <td>
                    <label className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.bookingId)}
                        onChange={() => toggleSelectStudent(student.bookingId)}
                      />
                      <span className="checkmark"></span>
                    </label>
                  </td>
                  <td>
                    <div className="student-cell">
                      <div className="student-avatar-wrap">
                        <div className="student-avatar">
                          {student.studentName?.charAt(0).toUpperCase() || "?"}
                        </div>
                        {student.externalStudentId && (
                          <div className="student-external-badge" title="Not on platform">
                            <span className="student-tooltip">Student not on CourseCompass</span>
                            ⚠
                          </div>
                        )}
                      </div>
                      <div className="student-details">
                        <span className="student-name">{student.studentName?.replace(/^\(Guest\) /, '') || "Unknown"}</span>
                        <span className="student-email">{student.studentEmail || "—"}</span>
                      </div>
                    </div>
                  </td>
                  <td><strong>{formatCurrency(student.price)}</strong></td>
                  <td>{formatDate(student.bookedAt)}</td>
                  <td>
                    <select
                      className={`payment-status-select ${student.paymentStatus?.toLowerCase()}`}
                      value={student.paymentStatus || "PENDING"}
                      onChange={e => handlePaymentStatusChange(student.bookingId, e.target.value)}
                    >
                      {PAYMENT_STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="date"
                      className="due-date-input"
                      value={student.paymentDueDate || ""}
                      onChange={e => handleDueDateChange(student.bookingId, e.target.value)}
                    />
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-icon-btn" title="Send Message">
                        <MessageCircle size={16} />
                      </button>
                      <button className="action-icon-btn" title="View Profile">
                        <FileText size={16} />
                      </button>
                      <button className="action-icon-btn" title="More Options">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredStudents.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon"><Search size={40} /></div>
            <h3>No students found</h3>
            <p>{filterByMonth
              ? `No bookings for ${monthName(selectedMonth)} ${selectedYear}`
              : "Try adjusting your search or filters"}</p>
          </div>
        )}

        <div className="table-footer">
          <span className="showing-text">
            Showing {filteredStudents.length} of {students.length} students
          </span>
          <div className="pagination">
            <button className="page-btn" disabled>Previous</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">Next</button>
          </div>
        </div>
      </div>

      {/* Modal — outside all other divs */}
      <AddStudentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onStudentAdded={() => { fetchStudents(); fetchSummaryStats(); }}
      />

    </div>
  );
};

export default Students;