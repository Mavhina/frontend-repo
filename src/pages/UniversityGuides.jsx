import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

export default function UniversityGuides() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await api.get("/university-guides");
        setGuides(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Failed to load university guides", e);
        setGuides([]);
        setErr(e.response?.data?.message || "Failed to load university guides");
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
            <span style={{ fontWeight: 800 }}>University Guide</span>
          </div>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="empty">Loading universities…</div>
          ) : err ? (
            <div className="empty" style={{ color: "#ef4444", fontWeight: 700 }}>
              {err}
            </div>
          ) : guides.length === 0 ? (
            <div className="empty">No university guides yet.</div>
          ) : (
            <div className="uni-grid">
              {guides.map((u) => (
                <div key={u.universityId} className="uni-card">
                  <div className="uni-logoWrap">
                    {u.logoUrl ? (
                      <img
                        src={u.logoUrl}
                        alt={u.universityName || "University logo"}
                        className="uni-logo"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <div className="uni-logoFallback">🏛️</div>
                    )}
                  </div>

                  <div className="uni-name">
                    {u.universityName || `University ${u.universityId}`}
                  </div>

                  <div className="uni-sub">
                    View application dates, documents, fees & accommodation.
                  </div>

                  <div className="uni-actions">
                    <button
                      className="add-btn"
                      style={{ height: 40, width: "100%" }}
                      onClick={() => navigate(`/app/university-guides/${u.universityId}`)}
                    >
                      View Guide
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
