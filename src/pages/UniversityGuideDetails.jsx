import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";
import { ChevronLeft } from "lucide-react";

export default function UniversityGuideDetails() {
  const { universityId } = useParams();
  const navigate = useNavigate();

  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await api.get("/university-guides");
        setAll(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Failed to load university guides", e);
        setAll([]);
        setErr(e.response?.data?.message || "Failed to load university guide");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const guide = useMemo(() => {
    return all.find((x) => String(x.universityId) === String(universityId)) || null;
  }, [all, universityId]);

  if (loading) {
    return (
      <div style={{ padding: "16px 24px 30px" }}>
        <div className="card">
          <div className="card-body">
            <div className="empty">Loading guide…</div>
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div style={{ padding: "16px 24px 30px" }}>
        <div className="card">
          <div className="card-body">
            <div className="empty" style={{ color: "#ef4444", fontWeight: 700 }}>
              {err}
            </div>
            <div style={{ marginTop: 12 }}>
              <button className="signout" onClick={() => navigate(-1)}>
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div style={{ padding: "16px 24px 30px" }}>
        <div className="card">
          <div className="card-body">
            <div className="empty">Guide not found.</div>
            <div style={{ marginTop: 12 }}>
              <button className="signout" onClick={() => navigate(-1)}>
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const apps = guide.applications || {};
  const fees = guide.fees || {};
  const accom = guide.accommodation || {};
  const docs = Array.isArray(guide.requiredDocuments) ? guide.requiredDocuments : [];

  return (
    <div style={{ padding: "16px 24px 30px" }}>
      <div className="card">
        <div className="card-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="card-title">
            <span style={{ fontWeight: 800 }}>{guide.universityName || "University Guide"}</span>
          </div>

          <button className="signout" onClick={() => navigate(-1)} style={{ height: 40 }}>
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>
        </div>

        <div className="card-body">
          <div className="uni-details-grid">
            <div className="card" style={{ boxShadow: "none" }}>
              <div className="card-head"><div className="card-title"><span>🗓️ Applications</span></div></div>
              <div className="card-body">
                <div className="subject-sub"><strong>Open:</strong> {apps.openDate || "—"}</div>
                <div className="subject-sub"><strong>Close:</strong> {apps.closeDate || "—"}</div>
                <div className="subject-sub"><strong>Late:</strong> {apps.lateAvailable ? "Yes" : "No"}</div>
                <div className="subject-sub"><strong>Method:</strong> {apps.method || "—"}</div>
                {apps.notes ? <div className="subject-sub" style={{ marginTop: 10 }}>{apps.notes}</div> : null}
                {apps.viewProspectus ? (
  <div className="subject-sub" style={{ marginTop: 10 }}>
    <strong>Prospectus:</strong>{" "}
    <a href={apps.viewProspectus} target="_blank" rel="noopener noreferrer">
      View Prospectus
    </a>
  </div>
) : null}
              </div>
            </div>

            <div className="card" style={{ boxShadow: "none" }}>
              <div className="card-head"><div className="card-title"><span>📄 Required Documents</span></div></div>
              <div className="card-body">
                {docs.length === 0 ? <div className="empty">No documents listed.</div> : (
                  <ul className="uni-list">
                    {docs.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                )}
              </div>
            </div>

            <div className="card" style={{ boxShadow: "none" }}>
              <div className="card-head"><div className="card-title"><span>💰 Fees & Costs</span></div></div>
              <div className="card-body">
                <div className="subject-sub"><strong>Application fee:</strong> R{fees.applicationFee ?? "—"}</div>
                <div className="subject-sub"><strong>Registration fee:</strong> R{fees.registrationFee ?? "—"}</div>
                <div className="subject-sub">
                  <strong>Tuition estimate:</strong>{" "}
                  {fees.tuitionFeeMin != null && fees.tuitionFeeMax != null
                    ? `R${fees.tuitionFeeMin} – R${fees.tuitionFeeMax}`
                    : "—"}
                </div>
              </div>
            </div>

            <div className="card" style={{ boxShadow: "none" }}>
              <div className="card-head"><div className="card-title"><span>🏠 Accommodation</span></div></div>
              <div className="card-body">
                <div className="subject-sub"><strong>On-campus:</strong> {accom.onCampusAvailable ? "Available" : "Not available"}</div>
                <div className="subject-sub">
                  <strong>On-campus fees:</strong>{" "}
                  {accom.onCampusFeeMin != null && accom.onCampusFeeMax != null
                    ? `R${accom.onCampusFeeMin} – R${accom.onCampusFeeMax}`
                    : "—"}
                </div>
                <div className="subject-sub">
                  <strong>Private fees:</strong>{" "}
                  {accom.privateFeeMin != null && accom.privateFeeMax != null
                    ? `R${accom.privateFeeMin} – R${accom.privateFeeMax} / month`
                    : "—"}
                </div>
                <div className="subject-sub"><strong>Distance:</strong> {accom.distanceToCampusKm ?? "—"} km</div>
                {accom.transportNotes ? <div className="subject-sub" style={{ marginTop: 10 }}>{accom.transportNotes}</div> : null}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
