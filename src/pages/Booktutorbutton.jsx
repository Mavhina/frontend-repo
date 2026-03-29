import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { Loader2, Check, Clock, X, UserCheck, AlertCircle, RotateCcw, CalendarPlus } from "lucide-react";

// ─── Status codes — mirror backend exactly ────────────────────────────────────
const STATUS = {
  NOT_BOOKED: null,
  PENDING: 0,
  ACCEPTED: 1,
  REJECTED: 2,
  CANCELLED: 3,
};

// ─── Per-status UI config ─────────────────────────────────────────────────────
const STATUS_CONFIG = {
  [STATUS.NOT_BOOKED]: {
    label: "Book Tutor",
    icon: <CalendarPlus size={15} />,
    btnClass: "bbt-btn--primary",
    action: "book",
    description: null,
    showCancel: false,
  },
  [STATUS.PENDING]: {
    label: "Pending…",
    icon: <Clock size={15} />,
    btnClass: "bbt-btn--warning",
    action: null,
    description: "Waiting for tutor to respond.",
    showCancel: true,
  },
  [STATUS.ACCEPTED]: {
    label: "Accepted ✓",
    icon: <UserCheck size={15} />,
    btnClass: "bbt-btn--success",
    action: null,
    description: "Tutor accepted! They'll be in touch soon.",
    showCancel: false,
  },
  [STATUS.REJECTED]: {
    label: "Try Again",
    icon: <RotateCcw size={15} />,
    btnClass: "bbt-btn--secondary",
    action: "book",
    description: "Tutor isn't available. You can try again.",
    showCancel: false,
  },
  [STATUS.CANCELLED]: {
    label: "Book Tutor",
    icon: <CalendarPlus size={15} />,
    btnClass: "bbt-btn--primary",
    action: "book",
    description: null,
    showCancel: false,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
/**
 * BookTutorButton
 *
 * Props:
 *  tutorId          {number}   — tutor's user_id from the backend
 *  businessId       {number}   — tutor_businesses.id (REQUIRED for booking)
 *  onBookingChange  {fn}       — called with { tutorId, status, bookingId } on any change
 *  showMessage      {boolean}  — show optional message textarea (default false)
 *  className        {string}   — extra class applied to wrapper
 *  compact          {boolean}  — smaller pill-style variant for cards (default false)
 */
export function BookTutorButton({
  tutorId,
  businessId,        // ← NEW: required for booking with price
  price,
  onBookingChange,
  showMessage = false,
  className = "",
  compact = false,
}) {
  const [status, setStatus]             = useState(STATUS.NOT_BOOKED);
  const [bookingId, setBookingId]       = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [checking, setChecking]         = useState(true);
  const [bookingMessage, setBookingMessage] = useState("");
  const [toast, setToast]               = useState(null);

  // ── 1. Check existing booking on mount / tutorId change ──
  const checkStatus = useCallback(async () => {
    try {
      setChecking(true);
      const res = await api.get(`/bookings/check?tutor_id=${tutorId}`);
      console.log("CHECK RESPONSE:", JSON.stringify(res.data));
      const data = res.data?.data;
      if (data?.hasBooking) {
        setStatus(data.booking.status);
        setBookingId(data.booking.id);
      } else {
        setStatus(STATUS.NOT_BOOKED);
        setBookingId(null);
      }
    } catch (err) {
      console.error("BookTutorButton: book failed", err);
      console.error("Backend error response:", JSON.stringify(err.response?.data)); // ← add this
      showToast("error", err.response?.data?.message || "Failed to send request. Try again.");
    } finally {
      setChecking(false);
    }
  }, [tutorId]);

  useEffect(() => {
    if (tutorId) checkStatus();
  }, [tutorId, checkStatus]);

  // ── 2. Toast helper ──
  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // ── 3. Book ──
  const handleBook = async () => {
    // Validate businessId is provided
    if (!businessId) {
      showToast("error", "Business ID is required. Please select a subject/package.");
      console.error("BookTutorButton: businessId is required but not provided");
      return;
    }

    try {
      setActionLoading(true);
      
      // Include businessId in the request
      // NEW — replace with this:
const payload = {
  tutorId,
  businessId,
  price,
  ...(bookingMessage.trim() && { message: bookingMessage.trim() }),
};
console.log("Booking payload:", JSON.stringify(payload));
const res = await api.post("/bookings", payload);

      if (res.data?.success) {
        const booking = res.data.data;
        setStatus(STATUS.PENDING);
        setBookingId(booking.id);
        setBookingMessage("");
        showToast("success", "Request sent! Waiting for tutor to respond.");
        onBookingChange?.({ tutorId, status: STATUS.PENDING, bookingId: booking.id });
      } else {
        showToast("error", res.data?.message || "Failed to send request.");
      }
    } catch (err) {
      console.error("BookTutorButton: book failed", err);
      showToast("error", err.response?.data?.message || "Failed to send request. Try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── 4. Cancel ──
  const handleCancel = async () => {
    if (!bookingId) return;
    try {
      setActionLoading(true);
      const res = await api.put(`/bookings/${bookingId}/cancel`);

      if (res.data?.success) {
        setStatus(STATUS.CANCELLED);
        setBookingId(null);
        showToast("success", "Booking cancelled.");
        onBookingChange?.({ tutorId, status: STATUS.CANCELLED, bookingId: null });
      } else {
        showToast("error", res.data?.message || "Failed to cancel.");
      }
    } catch (err) {
      console.error("BookTutorButton: cancel failed", err);
      showToast("error", err.response?.data?.message || "Failed to cancel. Try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── 5. Derive UI config ──
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG[STATUS.NOT_BOOKED];
  const isDisabled = cfg.action === null || actionLoading;

  // ── 6. Render: checking skeleton ──
  if (checking) {
    return (
      <div className={`bbt-wrapper ${compact ? "bbt-compact" : ""} ${className}`}>
        <button className="bbt-btn bbt-btn--ghost" disabled>
          <Loader2 size={14} className="bbt-spin" />
          {!compact && <span>Checking…</span>}
        </button>
      </div>
    );
  }

  return (
    <div className={`bbt-wrapper ${compact ? "bbt-compact" : ""} ${className}`}>

      {/* Toast notification */}
      {toast && (
        <div className={`bbt-toast bbt-toast--${toast.type}`}>
          {toast.type === "success"
            ? <Check size={14} />
            : <AlertCircle size={14} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Status description (non-compact only) */}
      {!compact && cfg.description && (
        <p className="bbt-description">{cfg.description}</p>
      )}

      {/* Optional message textarea */}
      {showMessage && cfg.action === "book" && (
        <textarea
          className="bbt-message"
          placeholder="Add a message for the tutor (optional)…"
          value={bookingMessage}
          onChange={(e) => setBookingMessage(e.target.value)}
          maxLength={500}
          rows={3}
        />
      )}

      {/* Pending state in compact mode: single-row split button */}
      {compact && status === 0 && bookingId ? (
        <div className="bbt-split">
          <span className="bbt-split__label">
            {actionLoading
              ? <><Loader2 size={13} className="bbt-spin" />Cancelling…</>
              : <><Clock size={13} />Pending…</>}
          </span>
          <button
            className="bbt-split__cancel"
            onClick={handleCancel}
            disabled={actionLoading}
            title="Cancel request"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        /* All other states: normal full-width button */
        <button
          className={`bbt-btn ${cfg.btnClass} ${compact ? "bbt-btn--compact" : ""}`}
          onClick={cfg.action === "book" ? handleBook : undefined}
          disabled={isDisabled}
          title={compact && cfg.description ? cfg.description : undefined}
        >
          {actionLoading && cfg.action === "book" ? (
            <><Loader2 size={14} className="bbt-spin" /><span>Sending…</span></>
          ) : (
            <>{cfg.icon}<span>{cfg.label}</span></>
          )}
        </button>
      )}

      {/* Cancel button — non-compact / full view only */}
      {!compact && cfg.showCancel && bookingId && (
        <button
          className="bbt-cancel"
          onClick={handleCancel}
          disabled={actionLoading}
        >
          {actionLoading
            ? <><Loader2 size={13} className="bbt-spin" />Cancelling…</>
            : <><X size={13} />Cancel Request</>}
        </button>
      )}
    </div>
  );
}

// ─── Injected styles ──────────────────────────────────────────────────────────
const css = `
/* Wrapper */
.bbt-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}
.bbt-compact {
  gap: 6px;
}

/* ── Base button ── */
.bbt-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  padding: 11px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  white-space: nowrap;
}
.bbt-btn--compact {
  padding: 9px 14px;
  font-size: 13px;
  border-radius: 8px;
}
.bbt-btn:disabled {
  cursor: not-allowed;
  opacity: 0.75;
}

/* ── Variants ── */
.bbt-btn--primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
  box-shadow: 0 3px 12px rgba(99,102,241,.30);
}
.bbt-btn--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(99,102,241,.40);
}
.bbt-btn--primary:active:not(:disabled) {
  transform: translateY(0);
}

.bbt-btn--warning {
  background: #fef9ec;
  color: #b45309;
  border: 1.5px solid #fde68a;
}

.bbt-btn--success {
  background: #f0fdf4;
  color: #15803d;
  border: 1.5px solid #86efac;
}

.bbt-btn--secondary {
  background: #f8f8ff;
  color: #6366f1;
  border: 1.5px solid #c7d2fe;
}
.bbt-btn--secondary:hover:not(:disabled) {
  background: #eef2ff;
  box-shadow: 0 2px 8px rgba(99,102,241,.15);
}

.bbt-btn--ghost {
  background: #f3f4f6;
  color: #9ca3af;
}

/* ── Compact split button (pending state) ── */
.bbt-split {
  display: flex;
  align-items: center;
  width: 100%;
  height: 38px;
  border-radius: 8px;
  overflow: hidden;
  border: 1.5px solid #fde68a;
  background: #fef9ec;
}
.bbt-split__label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: #b45309;
  padding: 0 10px;
  white-space: nowrap;
}
.bbt-split__cancel {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 100%;
  flex-shrink: 0;
  background: transparent;
  border: none;
  border-left: 1.5px solid #fde68a;
  color: #ef4444;
  cursor: pointer;
  transition: background 0.15s ease;
  padding: 0;
}
.bbt-split__cancel:hover:not(:disabled) {
  background: #fef2f2;
}
.bbt-split__cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Cancel link ── */
.bbt-cancel {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background: transparent;
  color: #ef4444;
  border: 1.5px solid #fecaca;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  width: 100%;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.bbt-cancel:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #ef4444;
}
.bbt-cancel:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Toast ── */
.bbt-toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 14px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 500;
  animation: bbt-slide-in 0.25s ease;
}
.bbt-toast--success {
  background: #f0fdf4;
  color: #166534;
  border: 1.5px solid #86efac;
}
.bbt-toast--error {
  background: #fef2f2;
  color: #dc2626;
  border: 1.5px solid #fecaca;
}

/* ── Description ── */
.bbt-description {
  margin: 0;
  font-size: 12.5px;
  color: #6b7280;
  text-align: center;
  background: #f9fafb;
  border-radius: 7px;
  padding: 7px 10px;
  line-height: 1.5;
}

/* ── Message textarea ── */
.bbt-message {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 9px;
  font-size: 13.5px;
  font-family: inherit;
  resize: vertical;
  min-height: 78px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  color: #111827;
}
.bbt-message:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,.10);
}
.bbt-message::placeholder { color: #9ca3af; }

/* ── Spinner ── */
.bbt-spin {
  animation: bbt-rotate 0.9s linear infinite;
  flex-shrink: 0;
}
@keyframes bbt-rotate {
  to { transform: rotate(360deg); }
}
@keyframes bbt-slide-in {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

if (typeof document !== "undefined" && !document.getElementById("bbt-styles")) {
  const tag = document.createElement("style");
  tag.id = "bbt-styles";
  tag.textContent = css;
  document.head.appendChild(tag);
}

export default BookTutorButton;