import React, { useState, useEffect } from "react";
import {
  Plus, Search, Users, UserPlus, Trash2,
  ChevronRight, X, GraduationCap, Check, Loader2
} from "lucide-react";
import "../styles/Groups.css";
import api from "../../services/api";

const GROUP_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#06b6d4",
  "#10b981", "#f59e0b", "#ef4444", "#3b82f6",
];

const getInitial = (name) =>
  (name || "?").replace(/^\(Guest\) /, "").charAt(0).toUpperCase();

// ── Main Component ───────────────────────────────────────────
export default function Groups() {
  const [groups, setGroups]                         = useState([]);
  const [students, setStudents]                     = useState([]);
  const [loadingGroups, setLoadingGroups]           = useState(true);
  const [loadingStudents, setLoadingStudents]       = useState(true);
  const [searchQuery, setSearchQuery]               = useState("");
  const [activeGroup, setActiveGroup]               = useState(null);
  const [showCreateModal, setShowCreateModal]       = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  useEffect(() => { fetchGroups(); fetchStudents(); }, []);

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      const res = await api.get('/tutor/groups');
      setGroups(res.data?.data || []);
    } catch (e) {
      console.error('Failed to fetch groups:', e);
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const res = await api.get('/tutor/students');
      const data = res.data?.data || [];
      setStudents(data.map(s => ({
        studentId: s.studentId || null,
        externalStudentId: s.externalStudentId || null,
        name: s.studentName || "Unknown",
        email: s.studentEmail || "",
        isExternal: !!s.externalStudentId,
      })));
    } catch (e) {
      console.error('Failed to fetch students:', e);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await api.delete(`/tutor/groups/${groupId}`);
      setGroups(prev => prev.filter(g => g.id !== groupId));
      if (activeGroup?.id === groupId) setActiveGroup(null);
    } catch (e) {
      console.error('Failed to delete group:', e);
      alert('Failed to delete group. Please try again.');
    }
  };

  const handleRemoveMember = async (groupId, memberId) => {
    try {
      await api.delete(`/tutor/groups/${groupId}/members/${memberId}`);
      const updatedMembers = activeGroup.members.filter(m => m.memberId !== memberId);
      const updatedGroup = { ...activeGroup, members: updatedMembers };
      setActiveGroup(updatedGroup);
      setGroups(prev => prev.map(g => g.id === groupId ? updatedGroup : g));
    } catch (e) {
      console.error('Failed to remove member:', e);
      alert('Failed to remove member. Please try again.');
    }
  };

  const handleAddMembers = async (groupId, selectedStudents) => {
    try {
      const members = selectedStudents.map(s => ({
        studentId: s.studentId || null,
        externalStudentId: s.externalStudentId || null,
      }));
      const res = await api.post(`/tutor/groups/${groupId}/members`, members);
      const updatedGroup = res.data?.data;
      setGroups(prev => prev.map(g => g.id === groupId ? updatedGroup : g));
      setActiveGroup(updatedGroup);
      setShowAddMemberModal(false);
    } catch (e) {
      console.error('Failed to add members:', e);
      alert('Failed to add members. Please try again.');
    }
  };

  const handleCreateGroup = async (payload) => {
    try {
      const res = await api.post('/tutor/groups', payload);
      setGroups(prev => [...prev, res.data?.data]);
      setShowCreateModal(false);
    } catch (e) {
      console.error('Failed to create group:', e);
      alert('Failed to create group. Please try again.');
    }
  };

  const filtered = groups.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const uniqueStudentsInGroups =
    [...new Set(groups.flatMap(g => (g.members || []).map(m => m.memberId)))].length;

  return (
    <div className="groups-container">

      {/* Header */}
      <div className="groups-header">
        <div>
          <h1>Student Groups</h1>
          <p>Organise your students into groups for easier session scheduling</p>
        </div>
        <button className="grp-btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} /> Create Group
        </button>
      </div>

      {/* Stats */}
      <div className="groups-stats">
        <div className="grp-stat">
          <span className="grp-stat-value">{groups.length}</span>
          <span className="grp-stat-label">Total Groups</span>
        </div>
        <div className="grp-stat">
          <span className="grp-stat-value">{uniqueStudentsInGroups}</span>
          <span className="grp-stat-label">Students in Groups</span>
        </div>
        <div className="grp-stat">
          <span className="grp-stat-value">{students.length}</span>
          <span className="grp-stat-label">Total Students</span>
        </div>
      </div>

      {/* Search */}
      <div className="groups-search-bar">
        <Search size={17} className="grp-search-icon" />
        <input
          className="grp-search-input"
          placeholder="Search groups…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Layout */}
      <div className={`groups-layout ${activeGroup ? "has-panel" : ""}`}>

        <div className="groups-grid">
          {loadingGroups ? (
            <div className="grp-empty">
              <Loader2 size={32} className="grp-spin" />
              <p>Loading groups…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="grp-empty">
              <Users size={40} />
              <h3>No groups yet</h3>
              <p>Create your first group to get started</p>
              <button className="grp-btn-primary" onClick={() => setShowCreateModal(true)}>
                <Plus size={16} /> Create Group
              </button>
            </div>
          ) : filtered.map(group => {
            const members  = group.members || [];
            const isActive = activeGroup?.id === group.id;
            return (
              <div
                key={group.id}
                className={`group-card ${isActive ? "active" : ""}`}
                onClick={() => setActiveGroup(isActive ? null : group)}
              >
                <div className="group-card-top">
                  <div className="group-icon" style={{ background: group.color || "#6366f1" }}>
                    <GraduationCap size={22} />
                  </div>
                  <button
                    className="grp-more-btn"
                    onClick={e => { e.stopPropagation(); handleDeleteGroup(group.id); }}
                    title="Delete group"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="group-card-body">
                  <h3 className="group-name">{group.name}</h3>
                  {group.description && <p className="group-desc">{group.description}</p>}
                </div>

                <div className="group-card-footer">
                  <div className="group-avatars">
                    {members.slice(0, 4).map((m, i) => (
                      <div
                        key={m.memberId}
                        className="group-mini-avatar"
                        style={{ zIndex: 4 - i, background: group.color || "#6366f1" }}
                        title={m.name}
                      >
                        {getInitial(m.name)}
                      </div>
                    ))}
                    {members.length > 4 && (
                      <div className="group-mini-avatar overflow">+{members.length - 4}</div>
                    )}
                  </div>
                  <span className="group-count">
                    {members.length} student{members.length !== 1 ? "s" : ""}
                  </span>
                  <ChevronRight size={16} className="group-arrow" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        {activeGroup && (
          <div className="group-detail-panel">
            <div className="gdp-header">
              <div className="gdp-icon" style={{ background: activeGroup.color || "#6366f1" }}>
                <GraduationCap size={22} />
              </div>
              <div className="gdp-title-wrap">
                <h2 className="gdp-title">{activeGroup.name}</h2>
                {activeGroup.description && (
                  <p className="gdp-desc">{activeGroup.description}</p>
                )}
              </div>
              <button className="gdp-close" onClick={() => setActiveGroup(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="gdp-section-label">
              Members · {activeGroup.members?.length || 0}
            </div>

            <div className="gdp-members">
              {(activeGroup.members || []).map(m => (
                <div key={m.memberId} className="gdp-member">
                  <div className="gdp-member-avatar" style={{ background: activeGroup.color || "#6366f1" }}>
                    {getInitial(m.name)}
                  </div>
                  <div className="gdp-member-info">
                    <span className="gdp-member-name">{m.name}</span>
                    <span className="gdp-member-email">{m.email || "External student"}</span>
                  </div>
                  <button
                    className="gdp-remove-btn"
                    title="Remove from group"
                    onClick={() => handleRemoveMember(activeGroup.id, m.memberId)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {(!activeGroup.members || activeGroup.members.length === 0) && (
                <div className="gdp-no-members">No members yet</div>
              )}
            </div>

            <button className="gdp-add-btn" onClick={() => setShowAddMemberModal(true)}>
              <UserPlus size={16} /> Add Students
            </button>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateGroupModal
          students={students}
          loadingStudents={loadingStudents}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateGroup}
        />
      )}

      {showAddMemberModal && activeGroup && (
        <AddMemberModal
          students={students}
          group={activeGroup}
          onClose={() => setShowAddMemberModal(false)}
          onAdd={handleAddMembers}
        />
      )}
    </div>
  );
}

// ── Create Group Modal ───────────────────────────────────────
function CreateGroupModal({ students, loadingStudents, onClose, onCreate }) {
  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor]             = useState(GROUP_COLORS[0]);
  const [selected, setSelected]       = useState([]);
  const [search, setSearch]           = useState("");
  const [saving, setSaving]           = useState(false);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const isSelected = (s) =>
    selected.some(sel =>
      sel.studentId === s.studentId &&
      sel.externalStudentId === s.externalStudentId
    );

  const toggle = (s) =>
    setSelected(prev =>
      isSelected(s)
        ? prev.filter(sel => !(sel.studentId === s.studentId && sel.externalStudentId === s.externalStudentId))
        : [...prev, s]
    );

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onCreate({
      name: name.trim(),
      description: description.trim(),
      color,
      members: selected.map(s => ({
        studentId: s.studentId || null,
        externalStudentId: s.externalStudentId || null,
      })),
    });
    setSaving(false);
  };

  return (
    <>
      <div className="grp-backdrop" onClick={onClose} />
      <div className="grp-modal">
        <div className="grp-modal-header">
          <h2>Create Group</h2>
          <button className="gdp-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="grp-modal-body">
          <div className="grp-field">
            <label>Group Name <span className="grp-req">*</span></label>
            <input
              className="grp-input"
              placeholder="e.g. Grade 11 Maths"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="grp-field">
            <label>Description <span className="grp-hint">(optional)</span></label>
            <input
              className="grp-input"
              placeholder="e.g. Saturday morning batch"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="grp-field">
            <label>Colour</label>
            <div className="grp-colors">
              {GROUP_COLORS.map(c => (
                <button
                  key={c}
                  className={`grp-color-dot ${color === c ? "selected" : ""}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                >
                  {color === c && <Check size={12} />}
                </button>
              ))}
            </div>
          </div>

          <div className="grp-field">
            <label>Add Students <span className="grp-hint">(optional)</span></label>
            <div className="grp-search-wrap">
              <Search size={15} />
              <input
                className="grp-input grp-search-sm"
                placeholder="Search students…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="grp-student-list">
              {loadingStudents && <p className="gdp-no-members">Loading students…</p>}
              {!loadingStudents && filtered.length === 0 && (
                <p className="gdp-no-members">No students found</p>
              )}
              {!loadingStudents && filtered.map((s, i) => (
                <div
                  key={i}
                  className={`grp-student-row ${isSelected(s) ? "selected" : ""}`}
                  onClick={() => toggle(s)}
                >
                  <div className="grp-student-avatar" style={{ background: color }}>
                    {getInitial(s.name)}
                  </div>
                  <div className="grp-student-info">
                    <span>{s.name.replace(/^\(Guest\) /, "")}</span>
                    <span className="grp-student-email">{s.email || "External"}</span>
                  </div>
                  <div className={`grp-checkbox ${isSelected(s) ? "checked" : ""}`}>
                    {isSelected(s) && <Check size={11} />}
                  </div>
                </div>
              ))}
            </div>
            {selected.length > 0 && (
              <p className="grp-selected-hint">
                {selected.length} student{selected.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        </div>

        <div className="grp-modal-footer">
          <button className="grp-btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="grp-btn-primary"
            onClick={handleSubmit}
            disabled={!name.trim() || saving}
          >
            {saving
              ? <><Loader2 size={14} className="grp-spin" /> Creating…</>
              : <><Plus size={15} /> Create Group</>}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Add Member Modal ─────────────────────────────────────────
function AddMemberModal({ students, group, onClose, onAdd }) {
  const [selected, setSelected] = useState([]);
  const [search, setSearch]     = useState("");
  const [saving, setSaving]     = useState(false);

  const existingStudentIds  = (group.members || []).map(m => m.studentId).filter(Boolean);
  const existingExternalIds = (group.members || []).map(m => m.externalStudentId).filter(Boolean);

  const available = students.filter(s => {
    if (s.studentId && existingStudentIds.includes(s.studentId)) return false;
    if (s.externalStudentId && existingExternalIds.includes(s.externalStudentId)) return false;
    return s.name.toLowerCase().includes(search.toLowerCase());
  });

  const isSelected = (s) =>
    selected.some(sel =>
      sel.studentId === s.studentId &&
      sel.externalStudentId === s.externalStudentId
    );

  const toggle = (s) =>
    setSelected(prev =>
      isSelected(s)
        ? prev.filter(sel => !(sel.studentId === s.studentId && sel.externalStudentId === s.externalStudentId))
        : [...prev, s]
    );

  const handleAdd = async () => {
    setSaving(true);
    await onAdd(group.id, selected);
    setSaving(false);
  };

  return (
    <>
      <div className="grp-backdrop" onClick={onClose} />
      <div className="grp-modal">
        <div className="grp-modal-header">
          <h2>Add Students to {group.name}</h2>
          <button className="gdp-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="grp-modal-body">
          <div className="grp-search-wrap">
            <Search size={15} />
            <input
              className="grp-input grp-search-sm"
              placeholder="Search students…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="grp-student-list">
            {available.length === 0 && (
              <p className="gdp-no-members">All students are already in this group</p>
            )}
            {available.map((s, i) => (
              <div
                key={i}
                className={`grp-student-row ${isSelected(s) ? "selected" : ""}`}
                onClick={() => toggle(s)}
              >
                <div className="grp-student-avatar" style={{ background: group.color || "#6366f1" }}>
                  {getInitial(s.name)}
                </div>
                <div className="grp-student-info">
                  <span>{s.name.replace(/^\(Guest\) /, "")}</span>
                  <span className="grp-student-email">{s.email || "External"}</span>
                </div>
                <div className={`grp-checkbox ${isSelected(s) ? "checked" : ""}`}>
                  {isSelected(s) && <Check size={11} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grp-modal-footer">
          <button className="grp-btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="grp-btn-primary"
            onClick={handleAdd}
            disabled={selected.length === 0 || saving}
          >
            {saving
              ? <><Loader2 size={14} className="grp-spin" /> Adding…</>
              : <><UserPlus size={15} /> Add {selected.length > 0 ? selected.length : ""} Student{selected.length !== 1 ? "s" : ""}</>}
          </button>
        </div>
      </div>
    </>
  );
}