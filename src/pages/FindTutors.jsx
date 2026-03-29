import React, { useEffect, useState, Component } from "react";
import api from "../services/api";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import BookTutorButton from "./Booktutorbutton.jsx";


// ─── Error boundary so a booking-button crash never blanks the whole page ─────
class BookingErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err) { console.error("BookTutorButton crashed:", err); }
  render() {
    if (this.state.hasError) {
      return (
        <button className="add-btn" style={{ width: "100%", height: 40 }} disabled>
          Book Tutor
        </button>
      );
    }
    return this.props.children;
  }
}

// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars({ value = 0 }) {
  const full    = Math.floor(value);
  const hasHalf = value - full >= 0.5;
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= full || (i + 1 === full + 1 && hasHalf);
        return (
          <span key={i} style={{ fontSize: 14, lineHeight: 1, color: filled ? "#facc15" : "#cbd5e1" }}>
            {filled ? "★" : "☆"}
          </span>
        );
      })}
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function FindTutors() {
  const [tutors, setTutors]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const navigate              = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await api.get("/tutors");
        console.log("Tutors API response:", JSON.stringify(res.data)); // ← inspect in browser console
        setTutors(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Failed to load tutors", e);
        setTutors([]);
        setErr(e.response?.data?.message || "Failed to load tutors");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ padding: "16px 24px 30px" }}>
      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <span style={{ fontWeight: 800 }}>Find Tutors</span>
          </div>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="empty">Loading tutors…</div>
          ) : err ? (
            <div className="empty" style={{ color: "#ef4444", fontWeight: 700 }}>
              {err}
            </div>
          ) : tutors.length === 0 ? (
            <div className="empty">No tutors available yet.</div>
          ) : (
            <div className="tutors-grid">
              {tutors.map((t, idx) => {
                // Normalise ID — backend may send user_id or userId
                const tutorUserId = t.user_id ?? t.userId ?? null;

                return (
                  <div key={tutorUserId ?? idx} className="tutor-img-wrap">
                    <img
                      className="tutor-img"
                      src={t.imageUrl ?? t.image_url}
                      alt={t.name}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />

                    <div className="tutor-body">
                      <div className="tutor-name">
                        {t.name}{" "}
                        <span style={{ color: "var(--muted)", fontWeight: 700 }}>
                          • {t.mode}
                        </span>
                      </div>

                      <div className="tutor-muted">
                        <strong>Subjects:</strong>{" "}
                        {Array.isArray(t.subjects) ? t.subjects.join(", ") : t.subjects ?? ""}
                      </div>

                      <div className="tutor-muted">
                        <strong>Grades:</strong> {t.grades} •{" "}
                        <strong>Location:</strong> {t.location}
                      </div>

                      <div className="tutor-meta">
                        <div style={{ fontWeight: 800, color: "var(--text)" }}>
                          R{Number(t.pricePerMonth ?? t.price_per_month ?? 0).toLocaleString()} / month
                        </div>
                        <div className="tutor-muted" style={{ marginTop: 0 }}>
                          <Stars value={Number(t.rating || 0)} />{" "}
                          <strong style={{ color: "var(--text)" }}>{t.rating}</strong>{" "}
                          <span style={{ color: "var(--muted)" }}>
                            ({t.reviewsCount ?? t.reviews_count ?? 0} reviews)
                          </span>
                        </div>
                      </div>

                      <div className="tutor-actions">
                        {/* View Profile */}
                        <button
                          className="signout"
                          style={{ flex: 1 }}
                          onClick={() => {
                            if (!tutorUserId) {
                              alert("Tutor ID missing — check console for API response shape");
                              return;
                            }
                            navigate(`/app/tutors/${tutorUserId}`);
                          }}
                        >
                          View Profile
                        </button>

                        {/* Book Tutor — error boundary means a crash here never
                            takes down the rest of the tutors grid */}
                        <div style={{ flex: 1 }}>
                          {tutorUserId ? (
                            <BookingErrorBoundary key={tutorUserId}>
                              <BookTutorButton
  tutorId={tutorUserId}
  businessId={t.businessId ?? t.business_id ?? null}
  price={t.pricePerMonth ?? t.price_per_month ?? null}
  compact={true}
/>
                            </BookingErrorBoundary>
                          ) : (
                            <button
                              className="add-btn"
                              style={{ width: "100%", height: 40 }}
                              disabled
                              title="Tutor ID missing from API response"
                            >
                              Book Tutor
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}