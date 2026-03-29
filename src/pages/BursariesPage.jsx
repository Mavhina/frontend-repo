// src/pages/BursariesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import {
  Search as SearchIcon,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Wallet,
} from "lucide-react";
import "./BursariesPage.css";

const toQuery = (obj) => {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === null || v === undefined || v === "") return;
    params.set(k, String(v));
  });
  return params;
};

const statusLabel = (s) => {
  if (!s) return "";
  return s.replaceAll("_", " ");
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const Badge = ({ status }) => {
  const cls =
    status === "OPEN"
      ? "badge open"
      : status === "CLOSING_SOON"
      ? "badge soon"
      : status === "COMING_SOON"
      ? "badge coming" 
      : "badge closed";
  return <span className={cls}>{statusLabel(status)}</span>;
};

// ─── Single featured card renderer ───────────────────────────────────────────
const FeaturedCard = ({ item }) => {
  if (!item) return null;

  return (
    <div className="featured-card">
      <div className="featured-left">
        <div className="featured-logo">
          {item.logoUrl ? (
            <img src={item.logoUrl} alt={item.name} />
          ) : (
            <div className="logo-fallback">
              <Wallet size={18} />
            </div>
          )}
        </div>

        <div className="featured-info">
          <div className="featured-top">
            <h2>{item.name}</h2>
            <Badge status={item.status} />
          </div>

          <p className="featured-summary">{item.summary}</p>

          <div className="featured-meta">
            <div className="meta-chip">
              <Calendar size={16} />
              <span>Closes: {formatDate(item.closingDate)}</span>
            </div>

            {item?.eligibilitySnapshot?.incomeMax ? (
              <div className="meta-chip">
                <span>
                  Income ≤ R
                  {item.eligibilitySnapshot.incomeMax.toLocaleString("en-ZA")}
                </span>
              </div>
            ) : null}

            {Array.isArray(item.covers) && item.covers.length > 0 ? (
              <div className="meta-chip">
                <span>
                  Covers: {item.covers.slice(0, 3).join(", ")}
                  {item.covers.length > 3 ? "…" : ""}
                </span>
              </div>
            ) : null}
          </div>

          <div className="featured-actions">
            <a
              className="btn primary"
              href={item.applyUrl}
              target="_blank"
              rel="noreferrer"
            >
              Apply for {item.name} <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Featured section: NSFAS on top, Funza Lushaka below ─────────────────────
const FeaturedSection = ({ featured, featuredSecondary }) => {
  if (!featured && !featuredSecondary) return null;

  return (
    <div className="featured-section">
      {featured && <FeaturedCard item={featured} />}
      {featuredSecondary && (
        <div className="featured-secondary">
          <FeaturedCard item={featuredSecondary} />
        </div>
      )}
    </div>
  );
};

// ─── Regular bursary card ─────────────────────────────────────────────────────
const BursaryCard = ({ item }) => {
  return (
    <div className="bursary-card">
      <div className="bursary-card-top">
        <div className="bursary-logo">
          {item.logoUrl ? (
            <img src={item.logoUrl} alt={item.name} />
          ) : (
            <div className="logo-fallback">◐</div>
          )}
        </div>

        <div className="bursary-title">
          <div className="title-row">
            <h3>{item.name}</h3>
            <Badge status={item.status} />
          </div>
          <div className="provider">{item.provider}</div>
        </div>
      </div>

      <div className="bursary-tags">
        {item.fundingType ? <span className="tag">{item.fundingType}</span> : null}
        {Array.isArray(item.fields)
          ? item.fields.slice(0, 3).map((f) => (
              <span className="tag" key={f}>
                {f}
              </span>
            ))
          : null}
        {Array.isArray(item.studyLevels)
          ? item.studyLevels.map((l) => (
              <span className="tag" key={l}>
                {l}
              </span>
            ))
          : null}
      </div>

      <p className="bursary-summary">{item.summary}</p>

      <div className="bursary-req">
        {item?.requirementsPreview?.apsMin != null ? (
          <div className="req-chip">APS ≥ {item.requirementsPreview.apsMin}</div>
        ) : null}
        {item?.requirementsPreview?.incomeMax != null ? (
          <div className="req-chip">
            Income ≤ R{Number(item.requirementsPreview.incomeMax).toLocaleString("en-ZA")}
          </div>
        ) : null}
        {item?.requirementsPreview?.bonded ? (
          <div className="req-chip">Work-back</div>
        ) : null}
      </div>

      <div className="bursary-footer">
        <div className="closing">
          <Calendar size={16} />
          <span>Closes: {formatDate(item.closingDate)}</span>
        </div>

        <Link className="btn ghost" to={`/app/bursaries/${item.id}`}>
          View Requirements
        </Link>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BursariesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filterMeta, setFilterMeta] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const q = searchParams.get("q") || "";
  const field = searchParams.get("field") || "";
  const fundingType = searchParams.get("fundingType") || "";
  const status = searchParams.get("status") || "";
  const page = Number(searchParams.get("page") || 0);
  const size = Number(searchParams.get("size") || 12);

  const queryObj = useMemo(
    () => ({ q, field, fundingType, status, page, size }),
    [q, field, fundingType, status, page, size]
  );

  useEffect(() => {
    api
      .get("/bursaries/filters")
      .then((res) => setFilterMeta(res.data))
      .catch(() => setFilterMeta(null));
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/bursaries?${toQuery(queryObj).toString()}`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [queryObj]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === "" || value == null) next.delete(key);
    else next.set(key, value);
    if (key !== "page") next.set("page", "0");
    setSearchParams(next);
  };

  const goPage = (nextPage) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    setSearchParams(next);
  };

  const totalPages = data?.page?.totalPages ?? 0;
  const canPrev = page > 0;
  const canNext = totalPages ? page < totalPages - 1 : false;

  return (
    <div className="bursaries-page">
      <div className="bursaries-wrap">
        <div className="bursaries-main">
          <div className="bursaries-header">
            <div>
              <h1>Bursaries</h1>
              <p>Find funding you qualify for — NSFAS, corporate and private bursaries.</p>
            </div>
          </div>

          {/* NSFAS on top, Funza Lushaka stacked below */}
          <FeaturedSection
            featured={data?.featured}
            featuredSecondary={data?.featuredSecondary}
          />

          <div className="filters-card">
            <div className="filters-top">
              <div className="searchbox">
                <SearchIcon size={18} />
                <input
                  value={q}
                  onChange={(e) => updateParam("q", e.target.value)}
                  placeholder="Search bursaries (e.g. IT, Engineering, Vodacom)…"
                />
              </div>

              <div className="filters-label">
                <Filter size={18} />
                <span>Filters</span>
              </div>
            </div>

            <div className="filters-grid">
              <div className="field">
                <label>Status</label>
                <select
                  value={status}
                  onChange={(e) => updateParam("status", e.target.value)}
                >
                  <option value="">All</option>
                  {(filterMeta?.statuses || ["OPEN", "CLOSING_SOON", "CLOSED"]).map(
                    (s) => (
                      <option key={s} value={s}>
                        {statusLabel(s)}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="field">
                <label>Funding Type</label>
                <select
                  value={fundingType}
                  onChange={(e) => updateParam("fundingType", e.target.value)}
                >
                  <option value="">All</option>
                  {(filterMeta?.fundingTypes || ["FULL", "PARTIAL", "LOAN"]).map(
                    (f) => (
                      <option key={f} value={f}>
                        {statusLabel(f)}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="field">
                <label>Field</label>
                <select
                  value={field}
                  onChange={(e) => updateParam("field", e.target.value)}
                >
                  <option value="">All</option>
                  {(filterMeta?.fields || []).map((x) => (
                    <option key={x} value={x}>
                      {statusLabel(x)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Per Page</label>
                <select
                  value={size}
                  onChange={(e) => updateParam("size", e.target.value)}
                >
                  {[6, 12, 18, 24].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bursaries-list">
            {loading ? (
              <div className="state">Loading bursaries…</div>
            ) : (data?.items?.length || 0) === 0 ? (
              <div className="state">
                <div className="state-title">No bursaries found</div>
                <div className="state-sub">
                  Try changing filters, or remove "Status / Field / Funding Type".
                </div>
                <button
                  className="btn ghost"
                  onClick={() =>
                    setSearchParams(
                      new URLSearchParams({ page: "0", size: String(size) })
                    )
                  }
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="bursaries-grid">
                  {data.items.map((item) => (
                    <BursaryCard key={item.id} item={item} />
                  ))}
                </div>

                <div className="pagination">
                  <button
                    className="btn ghost"
                    disabled={!canPrev}
                    onClick={() => goPage(page - 1)}
                  >
                    <ChevronLeft size={16} />
                    Prev
                  </button>

                  <div className="page-info">
                    Page <b>{totalPages ? page + 1 : 0}</b> of <b>{totalPages}</b>
                  </div>

                  <button
                    className="btn ghost"
                    disabled={!canNext}
                    onClick={() => goPage(page + 1)}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}