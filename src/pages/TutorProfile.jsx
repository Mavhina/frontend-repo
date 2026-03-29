import React, { useEffect, useState, Component } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../pages/Dashboard.css";
import { ChevronLeft } from "lucide-react";
import BookTutorButton from "./Booktutorbutton";

// ─── Error boundary so booking button never crashes the whole profile ─────────
class BookingErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err) { console.error("BookTutorButton crashed:", err); }
  render() {
    if (this.state.hasError) {
      return (
        <button className="add-btn" style={{ height: 40, flex: 1 }} disabled>
          Book a Tutor
        </button>
      );
    }
    return this.props.children;
  }
}

// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars({ value = 0 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= full || (half && i + 1 === full + 1);
        return (
          <span key={i} style={{ fontSize: 14, lineHeight: 1, color: filled ? "#fbbf24" : "rgba(100,116,139,0.6)" }}>
            ★
          </span>
        );
      })}
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TutorProfile() {
  const { userId } = useParams();
  const navigate   = useNavigate();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await api.get(`/tutor-businesses/by-user/${userId}`);
        setData(res.data || null);
      } catch (e) {
        console.error("Failed to load tutor profile", e);
        setData(null);
        setErr(e.response?.data?.message || "Failed to load tutor profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) return (
    <div style={{ padding: "16px 24px 30px" }}>
      <div className="card"><div className="card-body"><div className="empty">Loading profile…</div></div></div>
    </div>
  );

  if (err) return (
    <div style={{ padding: "16px 24px 30px" }}>
      <div className="card">
        <div className="card-body">
          <div className="empty" style={{ color: "#ef4444", fontWeight: 700 }}>{err}</div>
          <div style={{ marginTop: 12 }}>
            <button className="signout" onClick={() => navigate(-1)}>
              <ChevronLeft size={16} /><span>Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!data) return (
    <div style={{ padding: "16px 24px 30px" }}>
      <div className="card"><div className="card-body"><div className="empty">No profile data.</div></div></div>
    </div>
  );

  const business = data.business      || {};
  const about    = data.about         || {};
  const pricing  = data.pricing       || {};
  const tutors   = Array.isArray(data.tutors)         ? data.tutors         : [];
  const gallery  = Array.isArray(data.gallery)        ? data.gallery        : [];
  const stories  = Array.isArray(data.successStories) ? data.successStories : [];
  const reviews  = Array.isArray(data.reviews)        ? data.reviews        : [];
  const whyJoin  = Array.isArray(about.whyJoin)       ? about.whyJoin       : [];

  // userId from route params is the tutor's user_id — used for booking
  const tutorUserId = Number(userId);

  return (
    <div style={{ padding: "16px 24px 30px" }}>
      <div className="card">

        {/* ── Banner ── */}
        <div className="tutorprof-banner">
          {business.bannerImageUrl && (
            <img
              src={business.bannerImageUrl}
              alt={business.name || "Tutor business"}
              className="tutorprof-bannerImg"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          )}
          <div className="tutorprof-bannerOverlay">
            <button className="signout" onClick={() => navigate(-1)} style={{ height: 40 }}>
              <ChevronLeft size={16} /><span>Back</span>
            </button>
            <div className="tutorprof-titleWrap">
              <div className="tutorprof-title">{business.name}</div>
              <div className="tutorprof-sub">{business.headline}</div>
              <div className="tutorprof-sub" style={{ marginTop: 6 }}>
                <strong>{business.mode}</strong> • <strong>{business.location}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="card-body">

          {/* ── About + Pricing ── */}
          <div className="tutorprof-grid">

            {/* About */}
            <div className="card" style={{ boxShadow: "none" }}>
              <div className="card-head">
                <div className="card-title"><span>About</span></div>
              </div>
              <div className="card-body">
                <div className="subject-sub" style={{ fontSize: 14, color: "var(--text)" }}>
                  {about.bio}
                </div>
                {whyJoin.length > 0 && (
                  <>
                    <div className="breakdown-title" style={{ marginTop: 14 }}>Why join us</div>
                    <ul className="tutorprof-list">
                      {whyJoin.map((x, i) => <li key={i}>{x}</li>)}
                    </ul>
                  </>
                )}
              </div>
            </div>

            {/* Pricing + Book */}
            <div className="card" style={{ boxShadow: "none" }}>
              <div className="card-head">
                <div className="card-title"><span>Pricing</span></div>
              </div>
              <div className="card-body">
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>
                    R{Number(pricing.pricePerMonth || 0).toLocaleString()}
                  </div>
                  <div className="subject-sub">/ month</div>
                </div>

                {Array.isArray(pricing.includes) && pricing.includes.length > 0 && (
                  <>
                    <div className="breakdown-title" style={{ marginTop: 12 }}>Includes</div>
                    <ul className="tutorprof-list">
                      {pricing.includes.map((x, i) => <li key={i}>{x}</li>)}
                    </ul>
                  </>
                )}

                {/* ── Book Tutor button — fully wired ── */}
                <div style={{ marginTop: 16 }}>
                  {tutorUserId ? (
                    <BookingErrorBoundary>
                      <BookTutorButton
                        tutorId={tutorUserId}
                        showMessage={true}   // full profile view — show message textarea
                        compact={false}      // full-size button
                      />
                    </BookingErrorBoundary>
                  ) : (
                    <button className="add-btn" style={{ height: 40, width: "100%" }} disabled>
                      Book a Tutor
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Tutors ── */}
          <div style={{ marginTop: 18 }}>
            <div className="card-head" style={{ borderBottom: "none", padding: 0, marginBottom: 10 }}>
              <div className="card-title"><span>Your Tutors</span></div>
            </div>
            {tutors.length === 0 ? (
              <div className="empty">No tutors listed yet.</div>
            ) : (
              <div className="tutorprof-tutorsGrid">
                {tutors.map((t) => (
                  <div key={t.id} className="tutorprof-tutorCard">
                    <div className="tutorprof-tutorImgWrap">
                      <img
                        src={t.imageUrl}
                        alt={t.name}
                        className="tutorprof-tutorImg"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    </div>
                    <div style={{ padding: 14 }}>
                      <div style={{ fontWeight: 900, fontSize: 16 }}>{t.name}</div>
                      <div className="subject-sub"><strong>Grades:</strong> {t.grades}</div>
                      <div className="subject-sub">
                        <strong>Subjects:</strong>{" "}
                        {Array.isArray(t.subjects) ? t.subjects.join(", ") : ""}
                      </div>
                      <div className="subject-sub" style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                        <Stars value={Number(t.rating || 0)} />
                        <strong style={{ color: "var(--text)" }}>{t.rating}</strong>
                        <span style={{ color: "var(--muted)" }}>({t.reviewsCount} reviews)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Gallery ── */}
          {gallery.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <div className="card-head" style={{ borderBottom: "none", padding: 0, marginBottom: 10 }}>
                <div className="card-title"><span>Gallery</span></div>
              </div>
              <div className="tutorprof-gallery">
                {gallery.map((url, i) => (
                  <div key={i} className="tutorprof-galleryItem">
                    <img
                      src={url}
                      alt={`Gallery ${i + 1}`}
                      className="tutorprof-galleryImg"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Success Stories ── */}
          {stories.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <div className="card-head" style={{ borderBottom: "none", padding: 0, marginBottom: 10 }}>
                <div className="card-title"><span>Success Stories</span></div>
              </div>
              <div className="tutorprof-stories">
                {stories.map((s, i) => (
                  <div key={i} className="card" style={{ boxShadow: "none" }}>
                    <div className="card-body">
                      <div style={{ fontWeight: 900 }}>{s.student} • {s.subject}</div>
                      <div className="subject-sub" style={{ marginTop: 4 }}>
                        <strong>Improvement:</strong> {s.improvement}
                      </div>
                      <div className="subject-sub" style={{ marginTop: 8, color: "var(--text)" }}>
                        {s.story}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Reviews ── */}
          {reviews.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <div className="card-head" style={{ borderBottom: "none", padding: 0, marginBottom: 10 }}>
                <div className="card-title"><span>Reviews</span></div>
              </div>
              <div className="tutorprof-stories">
                {reviews.map((r, i) => (
                  <div key={i} className="card" style={{ boxShadow: "none" }}>
                    <div className="card-body">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ fontWeight: 900 }}>{r.student}</div>
                        <Stars value={Number(r.rating || 0)} />
                      </div>
                      <div className="subject-sub" style={{ marginTop: 8, color: "var(--text)" }}>
                        {r.comment}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}