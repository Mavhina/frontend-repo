import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { ArrowLeft, Calendar, ExternalLink, FileText } from "lucide-react";
import "./BursaryDetailsPage.css";

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const statusLabel = (s) => (s ? s.replaceAll("_", " ") : "");

export default function BursaryDetailsPage() {
  const { id } = useParams();
  const [bursary, setBursary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/bursaries/${id}`)
      .then((res) => setBursary(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div style={{ padding: 24 }}>Loading bursary…</div>;
  }

  if (!bursary) {
    return (
      <div style={{ padding: 24 }}>
        <p>Could not load bursary.</p>
        <Link to="/app/bursaries">Back</Link>
      </div>
    );
  }

  return (
    <div className="bursary-details">
      <div className="details-top">
        <Link className="back" to="/app/bursaries">
          <ArrowLeft size={18} /> Back to bursaries
        </Link>
      </div>

      <div className="details-hero">
        <div className="hero-left">
          <div className="hero-logo">
            {bursary.logoUrl ? <img src={bursary.logoUrl} alt={bursary.name} /> : <div className="logo-fallback">◐</div>}
          </div>

          <div className="hero-info">
            <div className="hero-title">
              <h1>{bursary.name}</h1>
              <span className={`badge ${bursary.status?.toLowerCase?.() || ""}`}>
                {statusLabel(bursary.status)}
              </span>
            </div>

            <div className="hero-provider">{bursary.provider}</div>

            <div className="hero-meta">
              <div className="meta">
                <Calendar size={16} />
                <span>Opens: {formatDate(bursary.openDate)}</span>
              </div>
              <div className="meta">
                <Calendar size={16} />
                <span>Closes: {formatDate(bursary.closingDate)}</span>
              </div>
              {bursary.fundingType ? <div className="chip">{statusLabel(bursary.fundingType)}</div> : null}
            </div>
          </div>
        </div>

        {bursary?.howToApply?.applyUrl ? (
          <a className="btn primary" href={bursary.howToApply.applyUrl} target="_blank" rel="noreferrer">
            Apply Now <ExternalLink size={16} />
          </a>
        ) : null}
      </div>

      <div className="details-grid">
        {/* What it covers */}
        <section className="card">
          <h2>What it covers</h2>
          <ul>
            {(bursary?.whatItCovers?.covers || []).map((c) => (
              <li key={c}>{statusLabel(c)}</li>
            ))}
          </ul>
          {bursary?.whatItCovers?.notes ? <p className="muted">{bursary.whatItCovers.notes}</p> : null}
        </section>

        {/* Requirements */}
        <section className="card">
          <h2>Requirements</h2>

          <div className="req-row">
            {bursary?.requirements?.apsMin != null ? <div className="chip">APS ≥ {bursary.requirements.apsMin}</div> : null}
            {bursary?.requirements?.incomeMax != null ? (
              <div className="chip">Income ≤ R{Number(bursary.requirements.incomeMax).toLocaleString("en-ZA")}</div>
            ) : null}
            {bursary?.requirements?.bonded ? <div className="chip">Work-back (bonded)</div> : null}
          </div>

          {Array.isArray(bursary?.requirements?.academic) && bursary.requirements.academic.length > 0 ? (
            <>
              <h3>Academic</h3>
              <ul>{bursary.requirements.academic.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </>
          ) : null}

          {Array.isArray(bursary?.requirements?.financial) && bursary.requirements.financial.length > 0 ? (
            <>
              <h3>Financial</h3>
              <ul>{bursary.requirements.financial.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </>
          ) : null}

          {Array.isArray(bursary?.requirements?.other) && bursary.requirements.other.length > 0 ? (
            <>
              <h3>Other</h3>
              <ul>{bursary.requirements.other.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </>
          ) : null}
        </section>

        {/* Documents */}
        <section className="card">
          <h2>Required documents</h2>
          <ul>
            {(bursary.requiredDocuments || []).map((d, i) => (
              <li key={i}>
                <FileText size={16} style={{ marginRight: 8 }} />
                {d}
              </li>
            ))}
          </ul>
        </section>

        {/* How to apply */}
        <section className="card">
          <h2>How to apply</h2>
          {bursary?.howToApply?.method ? (
            <div className="chip">Method: {statusLabel(bursary.howToApply.method)}</div>
          ) : null}
          <ol>
            {(bursary?.howToApply?.steps || []).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          {bursary?.howToApply?.applyUrl ? (
            <a className="btn ghost" href={bursary.howToApply.applyUrl} target="_blank" rel="noreferrer">
              Open application link <ExternalLink size={16} />
            </a>
          ) : null}
        </section>

        {/* FAQs */}
        {Array.isArray(bursary.faqs) && bursary.faqs.length > 0 ? (
          <section className="card full">
            <h2>FAQs</h2>
            <div className="faq">
              {bursary.faqs.map((f, i) => (
                <div className="faq-item" key={i}>
                  <div className="q">{f.q}</div>
                  <div className="a">{f.a}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
