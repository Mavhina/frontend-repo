import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon, Clock, Video, MapPin, CheckCircle,
  XCircle, Plus, ChevronLeft, ChevronRight, Search, Users,
  User, MoreHorizontal, Repeat, X, ArrowRight, Check, AlertCircle, Loader2
} from "lucide-react";
import "../styles/Sessions.css";
import api from "../../services/api";

const now = new Date();
const pad = n => String(n).padStart(2, "0");
const todayStr  = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
const todayTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

const getInitial  = name => (name || "?").charAt(0).toUpperCase();
const statusColor = s => ({ CONFIRMED:"confirmed", PENDING:"warning", COMPLETED:"completed", CANCELLED:"cancelled" }[s] || "default");

const formatDisplayDate = dateStr => {
  if (dateStr === todayStr) return "Today";
  const tom = new Date(now); tom.setDate(tom.getDate() + 1);
  const tomStr = `${tom.getFullYear()}-${pad(tom.getMonth()+1)}-${pad(tom.getDate())}`;
  if (dateStr === tomStr) return "Tomorrow";
  return new Date(dateStr + "T00:00").toLocaleDateString("en-ZA", { weekday:"short", month:"short", day:"numeric" });
};

const addMinutes = (timeStr, mins) => {
  if (!timeStr) return "";
  const clean = timeStr.substring(0, 5);
  const [h, m] = clean.split(":").map(Number);
  const total  = h * 60 + m + Math.round(mins);
  return `${pad(Math.floor(total/60) % 24)}:${pad(total % 60)}`;
};

const countRecurring = (startDate, endDate, freq) => {
  if (!startDate || !endDate || endDate <= startDate) return 0;
  const cur = new Date(startDate + "T00:00");
  const end = new Date(endDate   + "T00:00");
  let count = 0;
  while (cur <= end && count < 52) {
    count++;
    if      (freq === "Monthly")  cur.setMonth(cur.getMonth() + 1);
    else if (freq === "Biweekly") cur.setDate(cur.getDate() + 14);
    else if (freq === "Daily")    cur.setDate(cur.getDate() + 1);
    else                          cur.setDate(cur.getDate() + 7);
  }
  return count;
};

const DURATION_OPTIONS = ["0.5","1","1.5","2","2.5","3"];
const RECUR_OPTIONS    = ["Daily","Weekly","Biweekly","Monthly"];

export default function Sessions() {
  const [sessions, setSessions]         = useState([]);
  const [students, setStudents]         = useState([]);
  const [groups,   setGroups]           = useState([]);
  const [loading,  setLoading]          = useState(true);
  const [view,     setView]             = useState("list");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQ,  setSearchQ]          = useState("");
  const [showModal, setShowModal]       = useState(false);
  const [calDate,   setCalDate]         = useState(new Date());
  const [calSelected, setCalSelected]   = useState(null);

  useEffect(() => { fetchStudents(); fetchGroups(); }, []);
  useEffect(() => { fetchSessions(); }, [filterStatus]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus.toUpperCase());
      const res = await api.get(`/tutor/sessions?${params.toString()}`);
      setSessions(res.data?.data || []);
    } catch (e) { console.error("Failed to fetch sessions:", e); }
    finally { setLoading(false); }
  };

  const fetchStudents = async () => {
    try {
      const res  = await api.get("/tutor/students");
      const data = res.data?.data || [];
      setStudents(data.map(s => ({
        id:                s.externalStudentId ? `ext-${s.externalStudentId}` : `usr-${s.studentId}`,
        studentId:         s.studentId         || null,
        externalStudentId: s.externalStudentId || null,
        name:              (s.studentName || "Unknown").replace(/^\(Guest\) /, ""),
        email:             s.studentEmail || "",
      })));
    } catch (e) { console.error("Failed to fetch students:", e); }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get("/tutor/groups");
      setGroups(res.data?.data || []);
    } catch (e) { console.error("Failed to fetch groups:", e); }
  };

  const handleConfirm = async id => {
    try {
      const res = await api.patch(`/tutor/sessions/${id}/status`, { status: "CONFIRMED" });
      setSessions(prev => prev.map(s => s.id === id ? res.data?.data : s));
    } catch (e) { console.error("Failed to confirm:", e); }
  };

  const handleCancel = async id => {
    try {
      const res = await api.patch(`/tutor/sessions/${id}/status`, { status: "CANCELLED" });
      setSessions(prev => prev.map(s => s.id === id ? res.data?.data : s));
    } catch (e) { console.error("Failed to cancel:", e); }
  };

  const handleSaveSessions = async payload => {
    try {
      const res     = await api.post("/tutor/sessions", payload);
      const created = res.data?.data || [];
      setSessions(prev => [...prev, ...created]);
      setShowModal(false);
    } catch (e) {
      console.error("Failed to create sessions:", e);
      alert(e.response?.data?.message || "Failed to create session. Please try again.");
    }
  };

  const filtered = useMemo(() => sessions.filter(s => {
    if (!searchQ) return true;
    const q = searchQ.toLowerCase();
    return (s.studentName||"").toLowerCase().includes(q) ||
           (s.groupName  ||"").toLowerCase().includes(q) ||
           (s.subject    ||"").toLowerCase().includes(q);
  }), [sessions, searchQ]);

  const stats = useMemo(() => {
    const today     = sessions.filter(s => s.date === todayStr && s.computedStatus !== "CANCELLED");
    const upcoming  = sessions.filter(s => s.computedStatus === "CONFIRMED" && s.date >= todayStr);
    const pending   = sessions.filter(s => s.computedStatus === "PENDING");
    const completed = sessions.filter(s => s.computedStatus === "COMPLETED");
    const totalHours = completed.reduce((sum, s) => sum + parseFloat(s.duration || 0), 0);
    return { today: today.length, upcoming: upcoming.length, pending: pending.length, completed: completed.length, totalHours };
  }, [sessions]);

  const grouped = useMemo(() => {
    const map = {};
    [...filtered]
      .sort((a, b) => (a.date||"").localeCompare(b.date||"") || (a.startTime||"").localeCompare(b.startTime||""))
      .forEach(s => { if (!map[s.date]) map[s.date] = []; map[s.date].push(s); });
    return Object.entries(map);
  }, [filtered]);

  const calYear  = calDate.getFullYear();
  const calMonth = calDate.getMonth();

  const calDays = useMemo(() => {
    const first = new Date(calYear, calMonth, 1).getDay();
    const total = new Date(calYear, calMonth + 1, 0).getDate();
    return [...Array(first).fill(null), ...Array.from({length: total}, (_, i) => i + 1)];
  }, [calYear, calMonth]);

  const sessionsByDay = useMemo(() => {
    const map = {};
    sessions.forEach(s => {
      if (!s.date) return;
      const [y, m, d] = s.date.split("-").map(Number);
      if (y === calYear && m - 1 === calMonth) {
        if (!map[d]) map[d] = [];
        map[d].push(s);
      }
    });
    return map;
  }, [sessions, calYear, calMonth]);

  const calSelectedSessions = calSelected ? (sessionsByDay[calSelected] || []) : [];

  return (
    <div className="sess-container">
      <div className="sess-header">
        <div>
          <h1 className="sess-title">Sessions</h1>
          <p className="sess-sub">Manage your tutoring sessions and schedule</p>
        </div>
        <div className="sess-header-right">
          <div className="sess-view-toggle">
            <button className={view==="list"?"active":""} onClick={()=>setView("list")}>List</button>
            <button className={view==="calendar"?"active":""} onClick={()=>setView("calendar")}>Calendar</button>
          </div>
          <button className="sess-btn-primary" onClick={()=>setShowModal(true)}>
            <Plus size={17}/> Schedule Session
          </button>
        </div>
      </div>

      <div className="sess-stats">
        {[
          { label:"Today's Sessions", value:stats.today,     icon:<CalendarIcon size={18}/>, cls:"today" },
          { label:"Upcoming",         value:stats.upcoming,  icon:<Clock size={18}/>,        cls:"upcoming" },
          { label:"Pending",          value:stats.pending,   icon:<AlertCircle size={18}/>,  cls:"pending" },
          { label:"Completed",        value:stats.completed, icon:<CheckCircle size={18}/>,  cls:"completed" },
          { label:"Total Hours",      value:stats.totalHours%1===0?stats.totalHours:stats.totalHours.toFixed(1), icon:<Clock size={18}/>, cls:"hours" },
        ].map(({ label, value, icon, cls }) => (
          <div key={label} className="sess-stat">
            <div className={`sess-stat-icon ${cls}`}>{icon}</div>
            <div className="sess-stat-body">
              <span className="sess-stat-val">{value}</span>
              <span className="sess-stat-lbl">{label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="sess-filters">
        <div className="sess-search">
          <Search size={16} className="sess-search-icon"/>
          <input placeholder="Search by student, group or subject…" value={searchQ} onChange={e=>setSearchQ(e.target.value)}/>
        </div>
        <select className="sess-select" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
          <option value="all">All Sessions</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {view === "list" && (
        <div className="sess-list-card">
          {loading ? (
            <div className="sess-empty"><Loader2 size={32} className="sess-spin"/><p>Loading sessions…</p></div>
          ) : grouped.length === 0 ? (
            <div className="sess-empty">
              <CalendarIcon size={40}/>
              <h3>No sessions found</h3>
              <p>Try adjusting your filters or schedule a new session</p>
            </div>
          ) : grouped.map(([date, daySessions]) => (
            <div key={date} className="sess-day-group">
              <div className="sess-day-label">{formatDisplayDate(date)}</div>
              {daySessions.map(s => (
                <SessionRow key={s.id} session={s} onConfirm={handleConfirm} onCancel={handleCancel}/>
              ))}
            </div>
          ))}
        </div>
      )}

      {view === "calendar" && (
        <div className="sess-cal-wrap">
          <div className="sess-cal-card">
            <div className="sess-cal-header">
              <button className="sess-cal-nav" onClick={()=>setCalDate(new Date(calYear,calMonth-1,1))}><ChevronLeft size={18}/></button>
              <span className="sess-cal-title">{calDate.toLocaleString("default",{month:"long"})} {calYear}</span>
              <button className="sess-cal-nav" onClick={()=>setCalDate(new Date(calYear,calMonth+1,1))}><ChevronRight size={18}/></button>
            </div>
            <div className="sess-cal-weekdays">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d}>{d}</div>)}
            </div>
            <div className="sess-cal-days">
              {calDays.map((day, i) => {
                const daySess    = day ? (sessionsByDay[day] || []) : [];
                const isToday    = day && `${calYear}-${pad(calMonth+1)}-${pad(day)}` === todayStr;
                const isSelected = day === calSelected;
                return (
                  <div
                    key={i}
                    className={`sess-cal-day ${day?"has-day":""} ${isToday?"is-today":""} ${isSelected?"is-selected":""} ${daySess.length?"has-sessions":""}`}
                    onClick={()=>day && setCalSelected(day===calSelected?null:day)}
                  >
                    {day && <span className="day-num">{day}</span>}
                    {daySess.length > 0 && (
                      <div className="day-dots">
                        {daySess.slice(0,3).map((s,j)=>(
                          <span key={j} className={`day-dot ${statusColor(s.computedStatus)}`}/>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="sess-cal-legend">
              {["confirmed","pending","completed","cancelled"].map(s=>(
                <div key={s} className="legend-item">
                  <span className={`day-dot ${s}`}/>
                  <span>{s.charAt(0).toUpperCase()+s.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>

          {calSelected && (
            <div className="sess-cal-detail">
              <div className="cal-detail-header">
                <h3>{formatDisplayDate(`${calYear}-${pad(calMonth+1)}-${pad(calSelected)}`)}</h3>
                <button className="sess-close-btn" onClick={()=>setCalSelected(null)}><X size={16}/></button>
              </div>
              {calSelectedSessions.length === 0
                ? <div className="cal-no-sessions">No sessions this day</div>
                : calSelectedSessions.map(s=>(
                    <SessionRow key={s.id} session={s} onConfirm={handleConfirm} onCancel={handleCancel} compact/>
                  ))}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <ScheduleModal
          students={students}
          groups={groups}
          onClose={()=>setShowModal(false)}
          onSave={handleSaveSessions}
        />
      )}
    </div>
  );
}

function SessionRow({ session: s, onConfirm, onCancel, compact }) {
  const displayTime = s.startTime ? s.startTime.substring(0,5) : "";
  const displayEnd  = displayTime && s.duration ? addMinutes(displayTime, parseFloat(s.duration)*60) : "";
  const label       = s.type === "GROUP" ? s.groupName : s.studentName;
  const st          = s.computedStatus || s.status;

  return (
    <div className={`sess-row ${(st||"").toLowerCase()} ${compact?"compact":""}`}>
      <div className="sess-row-time">
        <span className="sr-time">{displayTime} – {displayEnd}</span>
        <span className="sr-dur">{s.duration}h</span>
      </div>
      <div className={`sess-row-avatar ${s.type==="GROUP"?"group":""}`}>
        {s.type === "GROUP" ? <Users size={16}/> : getInitial(label)}
      </div>
      <div className="sess-row-body">
        <div className="sr-top">
          <span className="sr-name">{label || "—"}</span>
          {s.recurring && <span className="sr-recur-badge"><Repeat size={10}/> Recurring</span>}
          <span className={`sr-status ${statusColor(st)}`}>{st ? st.charAt(0)+st.slice(1).toLowerCase() : ""}</span>
        </div>
        <span className="sr-topic">{s.subject} · {s.topic}</span>
        <div className="sr-meta">
          {s.mode === "Online"
            ? <span className="sr-meta-item"><Video size={12}/> Online</span>
            : <span className="sr-meta-item"><MapPin size={12}/> In-person</span>}
          {s.notes && <span className="sr-meta-item notes">"{s.notes}"</span>}
        </div>
      </div>
      <div className="sess-row-actions">
        {st === "PENDING" && (
          <>
            <button className="sr-act-btn confirm" title="Confirm" onClick={()=>onConfirm(s.id)}><CheckCircle size={16}/></button>
            <button className="sr-act-btn cancel"  title="Cancel"  onClick={()=>onCancel(s.id)}><XCircle size={16}/></button>
          </>
        )}
        {st === "CONFIRMED" && <button className="sr-act-btn join" title="Join"><Video size={16}/></button>}
        {(st === "CONFIRMED" || st === "PENDING") && <button className="sr-act-btn more"><MoreHorizontal size={16}/></button>}
      </div>
    </div>
  );
}

function ScheduleModal({ students, groups, onClose, onSave }) {
  const [step, setStep]                  = useState("type");
  const [sessType, setSessType]          = useState(null);
  const [selectedStudent, setSelStudent] = useState(null);
  const [selectedGroup, setSelGroup]     = useState(null);
  const [search, setSearch]              = useState("");
  const [saving, setSaving]              = useState(false);
  const [subject, setSubject]            = useState("");
  const [topic, setTopic]                = useState("");
  const [date, setDate]                  = useState("");
  const [startTime, setStartTime]        = useState("");
  const [duration, setDuration]          = useState("1.5");
  const [mode, setMode]                  = useState("Online");
  const [notes, setNotes]                = useState("");
  const [recurring, setRecurring]        = useState(false);
  const [recurFreq, setRecurFreq]        = useState("Weekly");
  const [recurEnd, setRecurEnd]          = useState("");
  const [errors, setErrors]              = useState({});

  const minDate = todayStr;
  const minTime = date === todayStr ? todayTime : "00:00";

  const validate = () => {
    const e = {};
    if (!subject.trim()) e.subject   = "Subject is required";
    if (!topic.trim())   e.topic     = "Topic is required";
    if (!date)           e.date      = "Date is required";
    if (date < todayStr) e.date      = "Date cannot be in the past";
    if (!startTime)      e.startTime = "Start time is required";
    if (date === todayStr && startTime < todayTime) e.startTime = "Time cannot be in the past";
    if (recurring) {
      if (!recurEnd)        e.recurEnd = "End date is required";
      if (recurEnd <= date) e.recurEnd = "End date must be after start date";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await onSave({
      type:              sessType,
      studentId:         sessType === "INDIVIDUAL" ? selectedStudent?.studentId         : null,
      externalStudentId: sessType === "INDIVIDUAL" ? selectedStudent?.externalStudentId : null,
      groupId:           sessType === "GROUP"      ? selectedGroup?.id                  : null,
      subject:  subject.trim(),
      topic:    topic.trim(),
      date, startTime,
      duration: parseFloat(duration),
      mode,
      notes:    notes.trim(),
      recurring,
      recurFrequency: recurring ? recurFreq : null,
      recurEndDate:   recurring ? recurEnd  : null,
    });
    setSaving(false);
  };

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const filteredGroups   = groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));
  const canProceed       = sessType === "INDIVIDUAL" ? !!selectedStudent : !!selectedGroup;
  const targetLabel      = sessType === "GROUP" ? selectedGroup?.name : selectedStudent?.name;
  const recurCount       = countRecurring(date, recurEnd, recurFreq);
  const steps            = ["type","target","details"];

  return (
    <>
      <div className="sess-backdrop" onClick={onClose}/>
      <div className="sess-modal">
        <div className="sess-modal-header">
          <div className="smh-left">
            {step !== "type" && (
              <button className="sess-back-btn" onClick={()=>{ if(step==="target") setStep("type"); if(step==="details") setStep("target"); }}>
                <ChevronLeft size={16}/>
              </button>
            )}
            <div>
              <h2 className="smh-title">
                {step==="type"?"Schedule Session":step==="target"?(sessType==="GROUP"?"Select Group":"Select Student"):"Session Details"}
              </h2>
              <p className="smh-sub">
                {step==="type"?"Who is this session for?":step==="target"?(sessType==="GROUP"?"Pick a group to schedule for":"Search for a student"):(targetLabel?`Scheduling for ${targetLabel}`:"")}
              </p>
            </div>
          </div>
          <button className="sess-close-btn" onClick={onClose}><X size={18}/></button>
        </div>

        <div className="sess-modal-progress">
          {steps.map((s,i)=>(
            <div key={s} className={`progress-dot ${step===s?"active":steps.indexOf(step)>i?"done":""}`}>
              {steps.indexOf(step)>i?<Check size={10}/>:i+1}
            </div>
          ))}
        </div>

        <div className="sess-modal-body">
          {step === "type" && (
            <div className="sm-type-grid">
              <button className="sm-type-card" onClick={()=>{setSessType("INDIVIDUAL");setStep("target");}}>
                <div className="sm-type-icon indiv"><User size={28}/></div>
                <h3>Individual</h3>
                <p>One-on-one session with a single student</p>
                <ArrowRight size={16} className="sm-type-arrow"/>
              </button>
              <button className="sm-type-card" onClick={()=>{setSessType("GROUP");setStep("target");}}>
                <div className="sm-type-icon grp"><Users size={28}/></div>
                <h3>Group</h3>
                <p>Session for an entire student group</p>
                <ArrowRight size={16} className="sm-type-arrow"/>
              </button>
            </div>
          )}

          {step === "target" && (
            <div className="sm-target">
              <div className="sm-search-wrap">
                <Search size={15}/>
                <input className="sm-search-input" placeholder={sessType==="GROUP"?"Search groups…":"Search students…"} value={search} onChange={e=>setSearch(e.target.value)} autoFocus/>
              </div>
              <div className="sm-target-list">
                {sessType === "INDIVIDUAL" && (filteredStudents.length === 0
                  ? <p className="sm-no-items">No students found</p>
                  : filteredStudents.map(s=>(
                    <div key={s.id} className={`sm-target-row ${selectedStudent?.id===s.id?"selected":""}`} onClick={()=>setSelStudent(s)}>
                      <div className="sm-trow-avatar">{getInitial(s.name)}</div>
                      <div className="sm-trow-info">
                        <span className="sm-trow-name">{s.name}</span>
                        <span className="sm-trow-sub">{s.email||"External student"}</span>
                      </div>
                      {selectedStudent?.id===s.id && <Check size={16} className="sm-trow-check"/>}
                    </div>
                  ))
                )}
                {sessType === "GROUP" && (filteredGroups.length === 0
                  ? <p className="sm-no-items">No groups yet — create groups first on the Groups page.</p>
                  : filteredGroups.map(g=>(
                    <div key={g.id} className={`sm-target-row ${selectedGroup?.id===g.id?"selected":""}`} onClick={()=>setSelGroup(g)}>
                      <div className="sm-trow-avatar grp" style={{background:g.color||"#6366f1"}}><Users size={15}/></div>
                      <div className="sm-trow-info">
                        <span className="sm-trow-name">{g.name}</span>
                        <span className="sm-trow-sub">{g.members?.length||0} members</span>
                      </div>
                      {selectedGroup?.id===g.id && <Check size={16} className="sm-trow-check"/>}
                    </div>
                  ))
                )}
              </div>
              <button className="sess-btn-primary full" disabled={!canProceed} onClick={()=>setStep("details")}>
                Continue <ArrowRight size={15}/>
              </button>
            </div>
          )}

          {step === "details" && (
            <div className="sm-details">
              <div className="sm-row">
                <div className="sm-field">
                  <label>Subject <span className="sm-req">*</span></label>
                  <input className={`sm-input ${errors.subject?"err":""}`} placeholder="e.g. Mathematics" value={subject} onChange={e=>{setSubject(e.target.value);setErrors(p=>({...p,subject:null}));}}/>
                  {errors.subject && <span className="sm-err">{errors.subject}</span>}
                </div>
                <div className="sm-field">
                  <label>Topic <span className="sm-req">*</span></label>
                  <input className={`sm-input ${errors.topic?"err":""}`} placeholder="e.g. Calculus - Derivatives" value={topic} onChange={e=>{setTopic(e.target.value);setErrors(p=>({...p,topic:null}));}}/>
                  {errors.topic && <span className="sm-err">{errors.topic}</span>}
                </div>
              </div>
              <div className="sm-row">
                <div className="sm-field">
                  <label>Date <span className="sm-req">*</span></label>
                  <input type="date" className={`sm-input ${errors.date?"err":""}`} min={minDate} value={date} onChange={e=>{setDate(e.target.value);setErrors(p=>({...p,date:null}));}}/>
                  {errors.date && <span className="sm-err">{errors.date}</span>}
                </div>
                <div className="sm-field">
                  <label>Start Time <span className="sm-req">*</span></label>
                  <input type="time" className={`sm-input ${errors.startTime?"err":""}`} min={minTime} value={startTime} onChange={e=>{setStartTime(e.target.value);setErrors(p=>({...p,startTime:null}));}}/>
                  {errors.startTime && <span className="sm-err">{errors.startTime}</span>}
                </div>
              </div>
              <div className="sm-row">
                <div className="sm-field">
                  <label>Duration</label>
                  <div className="sm-duration-opts">
                    {DURATION_OPTIONS.map(d=>(
                      <button key={d} className={`sm-dur-btn ${duration===d?"active":""}`} onClick={()=>setDuration(d)}>{d}h</button>
                    ))}
                  </div>
                </div>
                <div className="sm-field">
                  <label>Mode</label>
                  <div className="sm-mode-opts">
                    <button className={`sm-mode-btn ${mode==="Online"?"active":""}`} onClick={()=>setMode("Online")}><Video size={14}/> Online</button>
                    <button className={`sm-mode-btn ${mode==="In-person"?"active":""}`} onClick={()=>setMode("In-person")}><MapPin size={14}/> In-person</button>
                  </div>
                </div>
              </div>
              <div className="sm-field">
                <label>Notes <span className="sm-hint">(optional)</span></label>
                <textarea className="sm-input sm-textarea" placeholder="Any notes for this session…" value={notes} onChange={e=>setNotes(e.target.value)} rows={2}/>
              </div>
              <div className="sm-recurring-wrap">
                <div className="sm-recurring-toggle" onClick={()=>setRecurring(r=>!r)}>
                  <div className={`sm-toggle ${recurring?"on":""}`}><div className="sm-toggle-knob"/></div>
                  <div>
                    <span className="sm-tog-label"><Repeat size={14}/> Recurring session</span>
                    <span className="sm-tog-sub">Repeat this session on a schedule</span>
                  </div>
                </div>
                {recurring && (
                  <div className="sm-recur-opts">
                    <div className="sm-field">
                      <label>Frequency</label>
                      <div className="sm-duration-opts">
                        {RECUR_OPTIONS.map(f=>(
                          <button key={f} className={`sm-dur-btn ${recurFreq===f?"active":""}`} onClick={()=>setRecurFreq(f)}>{f}</button>
                        ))}
                      </div>
                    </div>
                    <div className="sm-field">
                      <label>End Date <span className="sm-req">*</span></label>
                      <input type="date" className={`sm-input ${errors.recurEnd?"err":""}`} min={date||minDate} value={recurEnd} onChange={e=>{setRecurEnd(e.target.value);setErrors(p=>({...p,recurEnd:null}));}}/>
                      {errors.recurEnd && <span className="sm-err">{errors.recurEnd}</span>}
                    </div>
                    {recurCount > 0 && (
                      <div className="sm-recur-preview">
                        <Repeat size={13}/> {recurCount} sessions will be created ({recurFreq.toLowerCase()})
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button className="sess-btn-primary full" onClick={handleSave} disabled={saving}>
                {saving
                  ? <><Loader2 size={14} className="sess-spin"/> Saving…</>
                  : <><CalendarIcon size={15}/> {recurring?"Schedule Recurring Sessions":"Schedule Session"}</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}