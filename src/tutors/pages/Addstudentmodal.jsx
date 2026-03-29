import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  Search, 
  UserPlus, 
  ArrowLeft, 
  CheckCircle, 
  Loader2, 
  UserCheck, 
  Send,
  Briefcase
} from "lucide-react";
import api from "../../services/api";

/**
 * AddStudentModal
 * Props:
 *   isOpen       {boolean}
 *   onClose      {fn}
 *   onStudentAdded {fn}
 */
export default function AddStudentModal({ isOpen, onClose, onStudentAdded }) {
  // ── Steps: "search" | "found" | "not-found" | "manual" | "select-business" | "success"
  const [step, setStep] = useState("search");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const [adding, setAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors] = useState({});

  // Manual form data
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [manualPhone, setManualPhone] = useState("");

  // Business selection
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);

  const inputRef = useRef(null);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("search");
      setQuery("");
      setFoundUser(null);
      setManualName("");
      setManualEmail("");
      setManualPrice("");
      setManualPhone("");
      setSuccessMsg("");
      setErrors({});
      setSelectedBusiness(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Search platform users ──
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      setSearching(true);
      const res = await api.get(`/tutor/students/search?q=${encodeURIComponent(query.trim())}`);
      const user = res.data?.data;
      if (user) {
        setFoundUser(user);
        setStep("found");
      } else {
        setStep("not-found");
      }
    } catch {
      setStep("not-found");
    } finally {
      setSearching(false);
    }
  };

  // ── Add platform student ──
  const handleAddPlatformStudent = async () => {
    try {
      setAdding(true);
      await api.post("/tutor/students/add-platform", { userId: foundUser.id });
      setSuccessMsg(`${foundUser.fullName} has been added to your students!`);
      setStep("success");
      onStudentAdded?.();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add student.");
    } finally {
      setAdding(false);
    }
  };

  // ── Validate manual form ──
  const validateManualForm = () => {
    const newErrors = {};
    if (!manualName.trim()) {
      newErrors.name = "Name is required";
    }
    if (!manualPrice || Number(manualPrice) <= 0) {
      newErrors.price = "Price is required and must be greater than 0";
    }
    if (manualEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manualEmail)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Proceed to business selection ──
  const handleProceedToBusinessSelection = async () => {
    if (!validateManualForm()) return;
    
    // Fetch tutor's businesses
    try {
      setLoadingBusinesses(true);
      const res = await api.get('/tutor/students/businesses');
      const tutorBusinesses = res.data?.data || [];
      setBusinesses(tutorBusinesses);
      
      if (tutorBusinesses.length === 0) {
        alert("You need to create a tutoring service first before adding students.");
        return;
      }
      
      // If only one business, auto-select it
      if (tutorBusinesses.length === 1) {
        setSelectedBusiness(tutorBusinesses[0]);
      }
      
      setStep("select-business");
    } catch (err) {
      alert("Failed to load your services. Please try again.");
    } finally {
      setLoadingBusinesses(false);
    }
  };

  // ── Add external student with selected business ──
  const handleAddExternal = async () => {
    if (!selectedBusiness) {
      alert("Please select a business/service");
      return;
    }

    try {
      setAdding(true);
      await api.post("/tutor/students/add-external", {
        name: manualName.trim(),
        email: manualEmail.trim() || null,
        phone: manualPhone.trim() || null,
        price: Number(manualPrice),
        businessId: selectedBusiness.id,
      });

      const emailNote = manualEmail.trim()
        ? ` An invite email has been sent to ${manualEmail}.`
        : "";
      setSuccessMsg(`${manualName} has been added to your students for ${selectedBusiness.name}!${emailNote}`);
      setStep("success");
      onStudentAdded?.();
    } catch (err) {
      console.error("Error:", err.response?.data);
      alert(err.response?.data?.message || "Failed to add student.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="asm-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="asm-modal" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="asm-header">
          <div className="asm-header-left">
            {(step === "found" || step === "not-found" || step === "manual" || step === "select-business") && (
              <button 
                className="asm-back" 
                onClick={() => {
                  if (step === "select-business") setStep("manual");
                  else setStep("search");
                }}
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <h2 className="asm-title">
                {step === "search" && "Add Student"}
                {step === "found" && "Student Found"}
                {step === "not-found" && "No Account Found"}
                {step === "manual" && "Add Manually"}
                {step === "select-business" && "Select Service"}
                {step === "success" && "Student Added!"}
              </h2>
              <p className="asm-subtitle">
                {step === "search" && "Search by email or name"}
                {step === "found" && "Confirm to add this student"}
                {step === "not-found" && "Choose how to add them"}
                {step === "manual" && "Fill in their details"}
                {step === "select-business" && "Choose which service this student is for"}
                {step === "success" && "They've been added to your roster"}
              </p>
            </div>
          </div>
          <button className="asm-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="asm-body">

          {/* ── STEP: search ── */}
          {step === "search" && (
            <form onSubmit={handleSearch} className="asm-search-form">
              <div className="asm-search-wrap">
                <Search size={18} className="asm-search-icon" />
                <input
                  ref={inputRef}
                  className="asm-search-input"
                  placeholder="Enter email or full name…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  disabled={searching}
                />
                {searching && <Loader2 size={16} className="asm-spin asm-search-loader" />}
              </div>
              <button
                type="submit"
                className="asm-btn asm-btn-primary"
                disabled={!query.trim() || searching}
              >
                {searching ? <><Loader2 size={15} className="asm-spin" /> Searching…</> : "Search"}
              </button>

              <div className="asm-divider"><span>or</span></div>

              <button
                type="button"
                className="asm-btn asm-btn-ghost"
                onClick={() => setStep("manual")}
              >
                <UserPlus size={16} /> Add student manually
              </button>
            </form>
          )}

          {/* ── STEP: found ── */}
          {step === "found" && foundUser && (
            <div className="asm-found">
              <div className="asm-user-card">
                <div className="asm-avatar">{foundUser.fullName?.charAt(0).toUpperCase()}</div>
                <div>
                  <div className="asm-user-name">{foundUser.fullName}</div>
                  <div className="asm-user-email">{foundUser.email}</div>
                </div>
                <div className="asm-badge">On Platform</div>
              </div>
              <button
                className="asm-btn asm-btn-primary"
                onClick={handleAddPlatformStudent}
                disabled={adding}
              >
                {adding
                  ? <><Loader2 size={15} className="asm-spin" /> Adding…</>
                  : <><UserCheck size={15} /> Add to My Students</>}
              </button>
            </div>
          )}

          {/* ── STEP: not-found ── */}
          {step === "not-found" && (
            <div className="asm-not-found">
              <div className="asm-nf-icon">
                <Search size={32} />
              </div>
              <p className="asm-nf-msg">
                No CourseCompass account found for <strong>"{query}"</strong>
              </p>

              <div className="asm-options">
                <button
                  className="asm-option-card"
                  onClick={() => {
                    setManualEmail(query.includes("@") ? query : "");
                    setStep("manual");
                  }}
                >
                  <div className="asm-option-icon"><UserPlus size={22} /></div>
                  <div>
                    <div className="asm-option-title">Add Manually</div>
                    <div className="asm-option-desc">
                      Add as an offline student. If you provide their email, we'll send them an invite to join CourseCompass.
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ── STEP: manual ── */}
          {step === "manual" && (
            <div className="asm-manual">
              <div className="asm-field">
                <label>
                  Full Name <span className="asm-required">*</span>
                </label>
                <input
                  className={`asm-input ${errors.name ? 'asm-input-error' : ''}`}
                  placeholder="e.g. Thabo Nkosi"
                  value={manualName}
                  onChange={e => {
                    setManualName(e.target.value);
                    if (errors.name) setErrors({...errors, name: null});
                  }}
                />
                {errors.name && <span className="asm-error-msg">{errors.name}</span>}
              </div>

              <div className="asm-field">
                <label>
                  Email
                  <span className="asm-field-hint"> — we'll send an invite if provided</span>
                </label>
                <input
                  className={`asm-input ${errors.email ? 'asm-input-error' : ''}`}
                  type="email"
                  placeholder="thabo@example.com"
                  value={manualEmail}
                  onChange={e => {
                    setManualEmail(e.target.value);
                    if (errors.email) setErrors({...errors, email: null});
                  }}
                />
                {errors.email && <span className="asm-error-msg">{errors.email}</span>}
              </div>

              <div className="asm-row">
                <div className="asm-field">
                  <label>Phone</label>
                  <input
                    className="asm-input"
                    placeholder="+27 82 000 0000"
                    value={manualPhone}
                    onChange={e => setManualPhone(e.target.value)}
                  />
                </div>

                <div className="asm-field">
                  <label>
                    Monthly Price (ZAR) <span className="asm-required">*</span>
                  </label>
                  <input
                    className={`asm-input ${errors.price ? 'asm-input-error' : ''}`}
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="e.g. 799"
                    value={manualPrice}
                    onChange={e => {
                      setManualPrice(e.target.value);
                      if (errors.price) setErrors({...errors, price: null});
                    }}
                  />
                  {errors.price && <span className="asm-error-msg">{errors.price}</span>}
                </div>
              </div>

              {manualEmail.trim() && !errors.email && (
                <div className="asm-invite-notice">
                  <Send size={14} />
                  An invite email will be sent to <strong>{manualEmail}</strong> automatically.
                </div>
              )}

              <button
                className="asm-btn asm-btn-primary"
                onClick={handleProceedToBusinessSelection}
                disabled={loadingBusinesses}
              >
                {loadingBusinesses
                  ? <><Loader2 size={15} className="asm-spin" /> Loading…</>
                  : <><Briefcase size={15} /> Continue to Select Service</>}
              </button>
            </div>
          )}

          {/* ── STEP: select-business ── */}
          {step === "select-business" && (
            <div className="asm-select-business">
              <p className="asm-business-intro">
                Select which tutoring service <strong>{manualName}</strong> is enrolling for:
              </p>

              <div className="asm-business-list">
                {businesses.map((business) => (
                  <div
                    key={business.id}
                    className={`asm-business-card ${selectedBusiness?.id === business.id ? 'selected' : ''}`}
                    onClick={() => setSelectedBusiness(business)}
                  >
                    <div className="asm-business-icon">
                      <Briefcase size={20} />
                    </div>
                    <div className="asm-business-info">
                    <div className="asm-business-title">{business.name}</div>
                    <div className="asm-business-price">R{business.pricePerMonth}/month</div>
                      {business.description && (
                        <div className="asm-business-desc">{business.description}</div>
                      )}
                    </div>
                    {selectedBusiness?.id === business.id && (
                      <div className="asm-business-check">
                        <CheckCircle size={20} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                className="asm-btn asm-btn-primary"
                onClick={handleAddExternal}
                disabled={adding || !selectedBusiness}
              >
                {adding
                  ? <><Loader2 size={15} className="asm-spin" /> Adding…</>
                  :<> <UserPlus size={15} /> Add Student to {selectedBusiness?.name || 'Selected Service'}</>}
              </button>
            </div>
          )}

          {/* ── STEP: success ── */}
          {step === "success" && (
            <div className="asm-success">
              <div className="asm-success-icon"><CheckCircle size={48} /></div>
              <p className="asm-success-msg">{successMsg}</p>
              <button className="asm-btn asm-btn-primary" onClick={onClose}>Done</button>
            </div>
          )}

        </div>
      </div>

      <style>{`
        .asm-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(4px);
          z-index: 1000;
          animation: asm-fade-in 0.2s ease;
        }
        .asm-modal {
          position: fixed;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1001;
          width: min(520px, calc(100vw - 32px));
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.18);
          overflow: hidden;
          animation: asm-slide-up 0.25s cubic-bezier(.22,.68,0,1.2);
        }
        .asm-header {
          display: flex; align-items: flex-start;
          justify-content: space-between;
          padding: 24px 24px 20px;
          border-bottom: 1px solid #f0f0f0;
        }
        .asm-header-left { display: flex; align-items: center; gap: 12px; }
        .asm-back {
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 8px;
          border: 1.5px solid #e5e7eb; background: #f9fafb;
          cursor: pointer; color: #6b7280; flex-shrink: 0;
          transition: all 0.15s;
        }
        .asm-back:hover { background: #f3f4f6; color: #111; }
        .asm-title { font-size: 18px; font-weight: 700; color: #111; margin: 0 0 2px; }
        .asm-subtitle { font-size: 13px; color: #9ca3af; margin: 0; }
        .asm-close {
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 8px;
          border: none; background: #f3f4f6; cursor: pointer;
          color: #6b7280; transition: all 0.15s; flex-shrink: 0;
        }
        .asm-close:hover { background: #fee2e2; color: #ef4444; }

        .asm-body { padding: 24px; }

        /* Search */
        .asm-search-form { display: flex; flex-direction: column; gap: 12px; }
        .asm-search-wrap {
          position: relative; display: flex; align-items: center;
        }
        .asm-search-icon {
          position: absolute; left: 14px; color: #9ca3af; pointer-events: none;
        }
        .asm-search-loader { position: absolute; right: 14px; color: #9ca3af; }
        .asm-search-input {
          width: 100%; padding: 12px 44px;
          border: 1.5px solid #e5e7eb; border-radius: 12px;
          font-size: 14px; font-family: inherit; color: #111;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .asm-search-input:focus {
          outline: none; border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,.1);
        }
        .asm-divider {
          display: flex; align-items: center; gap: 12px;
          color: #d1d5db; font-size: 12px;
        }
        .asm-divider::before, .asm-divider::after {
          content: ''; flex: 1; height: 1px; background: #f0f0f0;
        }

        /* Buttons */
        .asm-btn {
          display: inline-flex; align-items: center; justify-content: center;
          gap: 7px; padding: 12px 20px; border-radius: 12px;
          font-size: 14px; font-weight: 600; font-family: inherit;
          cursor: pointer; border: none; transition: all 0.15s;
          width: 100%;
        }
        .asm-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .asm-btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff; box-shadow: 0 4px 14px rgba(99,102,241,.3);
        }
        .asm-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,.4);
        }
        .asm-btn-ghost {
          background: #f9fafb; color: #374151;
          border: 1.5px solid #e5e7eb;
        }
        .asm-btn-ghost:hover:not(:disabled) { background: #f3f4f6; }

        /* Found */
        .asm-found { display: flex; flex-direction: column; gap: 16px; }
        .asm-user-card {
          display: flex; align-items: center; gap: 14px;
          padding: 16px; border-radius: 14px;
          background: #f8f7ff; border: 1.5px solid #e0e7ff;
        }
        .asm-avatar {
          width: 44px; height: 44px; border-radius: 12px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff; font-size: 18px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .asm-user-name { font-weight: 600; font-size: 15px; color: #111; }
        .asm-user-email { font-size: 13px; color: #6b7280; }
        .asm-badge {
          margin-left: auto; background: #dcfce7; color: #16a34a;
          font-size: 11px; font-weight: 600; padding: 4px 10px;
          border-radius: 99px; white-space: nowrap;
        }

        /* Not found */
        .asm-not-found { display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .asm-nf-icon {
          width: 64px; height: 64px; border-radius: 16px;
          background: #fef3c7; color: #d97706;
          display: flex; align-items: center; justify-content: center;
        }
        .asm-nf-msg { font-size: 14px; color: #6b7280; text-align: center; margin: 0; }
        .asm-options { width: 100%; display: flex; flex-direction: column; gap: 10px; }
        .asm-option-card {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 16px; border-radius: 14px; width: 100%;
          background: #fff; border: 1.5px solid #e5e7eb;
          cursor: pointer; text-align: left; font-family: inherit;
          transition: all 0.15s;
        }
        .asm-option-card:hover {
          border-color: #6366f1; background: #f8f7ff;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99,102,241,.1);
        }
        .asm-option-icon {
          width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: #f3f4f6; color: #6366f1;
        }
        .asm-option-title { font-weight: 600; font-size: 14px; color: #111; margin-bottom: 4px; }
        .asm-option-desc { font-size: 12.5px; color: #6b7280; line-height: 1.5; }

        /* Manual form */
        .asm-manual { display: flex; flex-direction: column; gap: 14px; }
        .asm-field { display: flex; flex-direction: column; gap: 6px; flex: 1; }
        .asm-field label { font-size: 13px; font-weight: 600; color: #374151; }
        .asm-field-hint { font-weight: 400; color: #9ca3af; }
        .asm-required { color: #ef4444; }
        .asm-input {
          padding: 11px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px;
          font-size: 14px; font-family: inherit; color: #111;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .asm-input:focus {
          outline: none; border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,.1);
        }
        /* ← NEW: Error styles */
        .asm-input-error {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 3px rgba(239,68,68,.1) !important;
        }
        .asm-error-msg {
          font-size: 12px;
          color: #ef4444;
          font-weight: 500;
        }
        .asm-row { display: flex; gap: 12px; }
        .asm-invite-notice {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; border-radius: 10px;
          background: #f0fdf4; border: 1.5px solid #86efac;
          font-size: 12.5px; color: #166534;
        }

        /* Success */
        .asm-success {
          display: flex; flex-direction: column; align-items: center;
          gap: 16px; padding: 16px 0;
        }
        .asm-success-icon { color: #22c55e; }
        .asm-success-msg {
          font-size: 14px; color: #374151; text-align: center;
          line-height: 1.6; max-width: 340px; margin: 0;
        }

        /* Spinner */
        .asm-spin { animation: asm-rotate 0.8s linear infinite; flex-shrink: 0; }
        @keyframes asm-rotate { to { transform: rotate(360deg); } }
        @keyframes asm-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes asm-slide-up {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 20px)); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
        /* Business Selection Styles */
        .asm-select-business {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .asm-business-intro {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 8px;
          text-align: center;
        }
        .asm-business-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 300px;
          overflow-y: auto;
        }
        .asm-business-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          background: #fff;
          cursor: pointer;
          transition: all 0.15s;
        }
        .asm-business-card:hover {
          border-color: #6366f1;
          background: #f8f7ff;
        }
        .asm-business-card.selected {
          border-color: #6366f1;
          background: #f0fdf4;
        }
        .asm-business-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .asm-business-info {
          flex: 1;
        }
        .asm-business-title {
          font-weight: 600;
          font-size: 15px;
          color: #111;
          margin-bottom: 4px;
        }
        .asm-business-price {
          font-size: 14px;
          color: #6366f1;
          font-weight: 600;
        }
        .asm-business-desc {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }
        .asm-business-check {
          color: #22c55e;
        }
      `}</style>
    </>
  );
}