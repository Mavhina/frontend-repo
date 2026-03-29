// src/pages/FeeFundPage.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BadgeDollarSign,
  Calendar,
  CheckCircle2,
  FileUp,
  HeartHandshake,
  Info,
  LayoutGrid,
  Send,
  User2,
  X,
  FileText,
  Lock
} from "lucide-react";
import "./FeeFundPage.css";
import api from "../services/api";

const TABS = [
  { key: "apply", label: "Apply", icon: Send },
  { key: "donate", label: "Donate", icon: BadgeDollarSign },
  { key: "mine", label: "My Applications", icon: User2 },
  { key: "about", label: "How it works", icon: Info }
];

const chipClass = (status) => {
  switch (status) {
    case "SUBMITTED":
      return "ff-chip ff-chip--neutral";
    case "UNDER_REVIEW":
      return "ff-chip ff-chip--info";
    case "NEED_MORE_INFO":
      return "ff-chip ff-chip--warn";
    case "APPROVED":
    case "PAID":
      return "ff-chip ff-chip--good";
    case "DECLINED":
      return "ff-chip ff-chip--bad";
    default:
      return "ff-chip ff-chip--neutral";
  }
};

const prettyStatus = (s) => (s || "").replaceAll("_", " ");
const money = (n) => (n == null ? "—" : `R${Number(n).toLocaleString("en-ZA")}`);

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-ZA");
};

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

export default function FeeFundPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("apply");

  // Universities
  const [universities, setUniversities] = useState([]);
  const [uniLoading, setUniLoading] = useState(true);
  const [uniError, setUniError] = useState(null);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // My Applications state
  const [myApps, setMyApps] = useState([]);
  const [myAppsLoading, setMyAppsLoading] = useState(false);
  const [myAppsError, setMyAppsError] = useState(null);
  const [myAppsPage, setMyAppsPage] = useState({
    number: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  });

  // Application details modal
  const [selectedId, setSelectedId] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [details, setDetails] = useState(null);

  // Apply form state
  const [universityId, setUniversityId] = useState("");
  const [programme, setProgramme] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [amountRequested, setAmountRequested] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [motivation, setMotivation] = useState("");
  const [files, setFiles] = useState([]);

  // Donate form
  const [donationAmount, setDonationAmount] = useState(100);
  const [anonymous, setAnonymous] = useState(false);
  const [donorMessage, setDonorMessage] = useState("");

  // Mock stats
  const stats = useMemo(
    () => ({
      balance: 5400,
      totalDonated: 12000,
      totalPaidOut: 6600,
      studentsHelped: 7
    }),
    []
  );

  // Fee fund config
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState(null);
  const [feeFundConfig, setFeeFundConfig] = useState({
    applicationsOpen: true,
    opensAt: null
  });

  useEffect(() => {
    let mounted = true;

    const loadConfig = async () => {
      try {
        setConfigLoading(true);
        setConfigError(null);
        const res = await api.get("/fee-fund/config");
        if (!mounted) return;
        setFeeFundConfig(res.data || { applicationsOpen: true, opensAt: null });
      } catch (err) {
        console.error("Failed to load fee fund config", err);
        if (mounted) setConfigError("Failed to load fee fund config");
      } finally {
        if (mounted) setConfigLoading(false);
      }
    };

    loadConfig();
    return () => {
      mounted = false;
    };
  }, []);

  // Determine if Apply is allowed
  const applyOpen = useMemo(() => {
    const allowed = !!feeFundConfig?.applicationsOpen;
    const opensAt = feeFundConfig?.opensAt;

    if (allowed && !opensAt) return true;
    if (!allowed) return false;

    const d = new Date(opensAt);
    if (Number.isNaN(d.getTime())) return allowed;
    return new Date() >= d;
  }, [feeFundConfig]);

  const opensAtLabel = useMemo(() => {
    if (!feeFundConfig?.opensAt) return null;
    return formatDate(feeFundConfig.opensAt);
  }, [feeFundConfig]);

  // Active application detection
  const ACTIVE_STATUSES = useMemo(
    () => new Set(["SUBMITTED", "UNDER_REVIEW", "NEED_MORE_INFO", "APPROVED"]),
    []
  );

  const activeApp = useMemo(() => {
    return (myApps || []).find((a) => ACTIVE_STATUSES.has(a.status));
  }, [myApps, ACTIVE_STATUSES]);

  const alreadyApplied = !!activeApp;

  // Load universities once
  useEffect(() => {
    let mounted = true;

    const loadUniversities = async () => {
      try {
        setUniLoading(true);
        setUniError(null);
        const res = await api.get("/universities/names");
        if (mounted) setUniversities(res.data || []);
      } catch (err) {
        console.error("Failed to load universities", err);
        if (mounted) setUniError("Failed to load universities");
      } finally {
        if (mounted) setUniLoading(false);
      }
    };

    loadUniversities();
    return () => {
      mounted = false;
    };
  }, []);

  // Load my applications ONCE at page load
  useEffect(() => {
    loadMyApplications(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load my applications when tab changes to "mine"
  useEffect(() => {
    if (tab !== "mine") return;
    loadMyApplications(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const loadMyApplications = async (pageNumber = 0) => {
    try {
      setMyAppsLoading(true);
      setMyAppsError(null);

      const res = await api.get(`/fee-fund/applications/me?page=${pageNumber}&size=10`);
      setMyApps(res.data?.items || []);
      setMyAppsPage(
        res.data?.page || {
          number: pageNumber,
          size: 10,
          totalPages: 0,
          totalElements: 0
        }
      );
    } catch (err) {
      console.error("Failed to load my applications", err);
      setMyAppsError("Failed to load your applications");
    } finally {
      setMyAppsLoading(false);
    }
  };

  const openDetails = async (id) => {
    setSelectedId(id);
    setDetails(null);
    setDetailsError(null);

    try {
      setDetailsLoading(true);
      const res = await api.get(`/fee-fund/applications/${id}`);
      setDetails(res.data);
    } catch (err) {
      console.error("Failed to load application details", err);
      setDetailsError("Failed to load application details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedId(null);
    setDetails(null);
    setDetailsError(null);
  };

  const applyLocked = configLoading || !applyOpen || alreadyApplied;

  const onSubmitApplication = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (configLoading) {
      setSubmitError("Checking application availability…");
      return;
    }

    if (!applyOpen) {
      setSubmitError(
        opensAtLabel
          ? `Applications are currently closed. They open on ${opensAtLabel}.`
          : "Applications are currently closed."
      );
      return;
    }

    if (alreadyApplied) {
      setSubmitError("You already have an active application. Please check My Applications.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("universityId", universityId);
      formData.append("programme", programme);
      formData.append("studentNumber", studentNumber);
      formData.append("amountRequested", amountRequested);
      formData.append("deadlineDate", deadlineDate);
      formData.append("motivation", motivation);

      files.forEach((file) => formData.append("documents", file));

      await api.post("/fee-fund/applications", formData);

      alert("✅ Application submitted successfully!");

      // reset
      setUniversityId("");
      setProgramme("");
      setStudentNumber("");
      setAmountRequested("");
      setDeadlineDate("");
      setMotivation("");
      setFiles([]);

      await loadMyApplications(0);
      setTab("mine");
    } catch (err) {
      console.error("Failed to submit application", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data ||
        "Failed to submit application. Please try again.";
      setSubmitError(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const onDonate = (e) => {
    e.preventDefault();
    console.log("DONATION:", { donationAmount, anonymous, donorMessage });
    alert("Donation flow (frontend demo). Integrate PayFast/Peach next ✅");
    setDonorMessage("");
  };

  return (
    <div className="ff-page">
      <div className="ff-wrap">
        {/* ✅ MAIN WRAPPER BOX */}
        <div className="ff-main">
          <div className="ff-head">
            <div>
              <h1>Registration Fee Fund</h1>
              <p>Apply for registration fee support or donate to help students register.</p>
            </div>

            <div className="ff-statbar">
              <div className="ff-stat">
                <div className="ff-stat-label">Fund Balance</div>
                <div className="ff-stat-value">{money(stats.balance)}</div>
              </div>
              <div className="ff-stat">
                <div className="ff-stat-label">Students Helped</div>
                <div className="ff-stat-value">{stats.studentsHelped}</div>
              </div>
            </div>
          </div>

          {/* Hero */}
          <div className="ff-hero">
            <div className="ff-hero-left">
              <div className="ff-hero-icon">
                <HeartHandshake size={20} />
              </div>
              <div>
                <div className="ff-hero-title">Help students register on time</div>
                <div className="ff-hero-sub">
                  We prioritise verified invoices and pay registration fees directly to institutions (safer & transparent).
                </div>
              </div>
            </div>

            <div className="ff-hero-actions">
              <button
                className="ff-btn ff-btn--primary"
                onClick={() => setTab("apply")}
                type="button"
                disabled={configLoading || !applyOpen}
                title={!applyOpen ? `Applications open on ${opensAtLabel || "soon"}` : ""}
              >
                Apply now <Send size={16} />
              </button>
              <button className="ff-btn" onClick={() => setTab("donate")} type="button">
                Donate <BadgeDollarSign size={16} />
              </button>
            </div>
          </div>

          {/* Tabs + Wall of Support */}
          <div className="ff-tabs">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  className={`ff-tab ${tab === t.key ? "active" : ""}`}
                  onClick={() => setTab(t.key)}
                  type="button"
                >
                  <Icon size={16} />
                  {t.label}
                </button>
              );
            })}

            <button className="ff-tab" onClick={() => navigate("/app/fee-fund/wall-of-support")} type="button">
              <HeartHandshake size={16} />
              Wall of Support
            </button>
          </div>

          {/* APPLY */}
          {tab === "apply" ? (
            <div className="ff-grid">
              <div className="ff-card">
                <h2>Apply for funding</h2>
                <p className="ff-muted">Submit your registration invoice/statement. We may request additional proof.</p>

                {configError ? <div className="ff-error">{configError}</div> : null}

                {!configLoading && !applyOpen ? (
                  <div className="ff-banner">
                    <div className="ff-banner-left">
                      <div className="ff-banner-icon">
                        <Lock size={16} />
                      </div>
                      <div>
                        <div className="ff-banner-title">Applications are currently closed</div>
                        <div className="ff-banner-sub">
                          Applications will open when university registrations open.
                          {opensAtLabel ? (
                            <>
                              {" "}
                              Opens on: <b>{opensAtLabel}</b>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="ff-banner-actions">
                      <button className="ff-btn" type="button" onClick={() => setTab("about")}>
                        How it works
                      </button>
                    </div>
                  </div>
                ) : null}

                {alreadyApplied ? (
                  <div className="ff-banner">
                    <div>
                      <div className="ff-banner-title">✅ You already have an active application</div>
                      <div className="ff-banner-sub">
                        {activeApp?.university?.name} • {activeApp?.programme} • Requested {money(activeApp?.amountRequested)}
                      </div>
                    </div>

                    <div className="ff-banner-actions">
                      <div className={chipClass(activeApp?.status)}>{prettyStatus(activeApp?.status)}</div>
                      <button className="ff-btn" type="button" onClick={() => setTab("mine")}>
                        View
                      </button>
                    </div>
                  </div>
                ) : null}

                <form className="ff-form" onSubmit={onSubmitApplication}>
                  <div className="ff-row">
                    <div className="ff-field">
                      <label>University</label>
                      <select
                        value={universityId}
                        onChange={(e) => setUniversityId(e.target.value)}
                        required
                        disabled={uniLoading || submitting || applyLocked}
                      >
                        <option value="">{uniLoading ? "Loading universities..." : "Select university"}</option>
                        {universities.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                      {uniError ? <div className="ff-error">{uniError}</div> : null}
                    </div>

                    <div className="ff-field">
                      <label>Student number</label>
                      <input
                        value={studentNumber}
                        onChange={(e) => setStudentNumber(e.target.value)}
                        placeholder="e.g. 219056683"
                        required
                        disabled={submitting || applyLocked}
                      />
                    </div>
                  </div>

                  <div className="ff-row">
                    <div className="ff-field">
                      <label>Programme / Course</label>
                      <input
                        value={programme}
                        onChange={(e) => setProgramme(e.target.value)}
                        placeholder="e.g. BSc Computer Science"
                        required
                        disabled={submitting || applyLocked}
                      />
                    </div>

                    <div className="ff-field">
                      <label>Amount requested (R)</label>
                      <input
                        type="number"
                        min="0"
                        value={amountRequested}
                        onChange={(e) => setAmountRequested(e.target.value)}
                        placeholder="e.g. 1500"
                        required
                        disabled={submitting || applyLocked}
                      />
                    </div>
                  </div>

                  <div className="ff-row">
                    <div className="ff-field">
                      <label>Registration deadline</label>
                      <div className="ff-input-icon">
                        <Calendar size={16} />
                        <input
                          type="date"
                          value={deadlineDate}
                          onChange={(e) => setDeadlineDate(e.target.value)}
                          required
                          disabled={submitting || applyLocked}
                        />
                      </div>
                    </div>

                    <div className="ff-field">
                      <label>Upload invoice/statement/proof of registration</label>
                      <div className="ff-upload">
                        <FileUp size={16} />
                        <input
                          type="file"
                          multiple
                          onChange={(e) => setFiles(Array.from(e.target.files || []))}
                          accept=".pdf,.png,.jpg,.jpeg"
                          disabled={submitting || applyLocked}
                        />
                        <span className="ff-upload-hint">
                          {files.length ? `${files.length} file(s) selected` : "PDF / JPG / PNG"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ff-field">
                    <label>Short motivation</label>
                    <textarea
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      placeholder="Tell us why you need support (max 500 characters)…"
                      maxLength={500}
                      rows={4}
                      required
                      disabled={submitting || applyLocked}
                    />
                    <div className="ff-counter">{motivation.length}/500</div>
                  </div>

                  {submitError ? <div className="ff-error">{submitError}</div> : null}

                  <button className="ff-btn ff-btn--primary" type="submit" disabled={submitting || applyLocked}>
                    {configLoading
                      ? "Checking availability..."
                      : !applyOpen
                      ? opensAtLabel
                        ? `Applications open on ${opensAtLabel}`
                        : "Applications closed"
                      : alreadyApplied
                      ? "Application already submitted"
                      : submitting
                      ? "Submitting..."
                      : "Submit application"}{" "}
                    <Send size={16} />
                  </button>
                </form>
              </div>

              <div className="ff-card">
                <h2>What we prioritise</h2>

                <div className="ff-list">
                  <div className="ff-li">
                    <CheckCircle2 size={18} />
                    <div>
                      <div className="ff-li-title">Verified registration invoice</div>
                      <div className="ff-li-sub">Clear proof of fee amount and reference number.</div>
                    </div>
                  </div>
                  <div className="ff-li">
                    <CheckCircle2 size={18} />
                    <div>
                      <div className="ff-li-title">Upcoming deadlines</div>
                      <div className="ff-li-sub">Students close to registration deadlines are prioritised.</div>
                    </div>
                  </div>
                  <div className="ff-li">
                    <CheckCircle2 size={18} />
                    <div>
                      <div className="ff-li-title">Direct payment to institution</div>
                      <div className="ff-li-sub">Safer and easier to audit.</div>
                    </div>
                  </div>
                </div>

                <div className="ff-note">
                  <LayoutGrid size={16} />
                  <span>Tip: Upload a clear PDF screenshot of your registration fee statement to speed up approval.</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* DONATE */}
          {tab === "donate" ? (
            <div className="ff-grid">
              <div className="ff-card">
                <h2>Donate to the fund</h2>
                <p className="ff-muted">Your donation helps a student pay registration fees and secure a spot at university.</p>

                <form className="ff-form" onSubmit={onDonate}>
                  <div className="ff-donate-amounts">
                    {[50, 100, 250, 500].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        className={`ff-pill ${donationAmount === amt ? "active" : ""}`}
                        onClick={() => setDonationAmount(amt)}
                      >
                        R{amt}
                      </button>
                    ))}
                  </div>

                  <div className="ff-row">
                    <div className="ff-field">
                      <label>Custom amount (R)</label>
                      <input
                        type="number"
                        min="10"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(Number(e.target.value))}
                      />
                    </div>

                    <div className="ff-field">
                      <label>Donation preference</label>
                      <div className="ff-toggle">
                        <input
                          id="anon"
                          type="checkbox"
                          checked={anonymous}
                          onChange={(e) => setAnonymous(e.target.checked)}
                        />
                        <label htmlFor="anon">Donate anonymously</label>
                      </div>
                    </div>
                  </div>

                  <div className="ff-field">
                    <label>Message (optional)</label>
                    <textarea
                      rows={3}
                      value={donorMessage}
                      onChange={(e) => setDonorMessage(e.target.value)}
                      placeholder="Leave a short message for students…"
                      maxLength={200}
                    />
                    <div className="ff-counter">{donorMessage.length}/200</div>
                  </div>

                  <button className="ff-btn ff-btn--primary" type="submit">
                    Continue to payment <BadgeDollarSign size={16} />
                  </button>

                  <div className="ff-note">
                    <Info size={16} />
                    <span>Payment integration will be added (PayFast/Peach). For now this is UI only.</span>
                  </div>
                </form>
              </div>

              <div className="ff-card">
                <h2>Transparency</h2>
                <div className="ff-stats-grid">
                  <div className="ff-stat2">
                    <div className="ff-stat2-label">Total donated</div>
                    <div className="ff-stat2-value">{money(stats.totalDonated)}</div>
                  </div>
                  <div className="ff-stat2">
                    <div className="ff-stat2-label">Total paid out</div>
                    <div className="ff-stat2-value">{money(stats.totalPaidOut)}</div>
                  </div>
                  <div className="ff-stat2">
                    <div className="ff-stat2-label">Current balance</div>
                    <div className="ff-stat2-value">{money(stats.balance)}</div>
                  </div>
                  <div className="ff-stat2">
                    <div className="ff-stat2-label">Students helped</div>
                    <div className="ff-stat2-value">{stats.studentsHelped}</div>
                  </div>
                </div>

                <div className="ff-note">
                  <HeartHandshake size={16} />
                  <span>We recommend paying institutions directly to protect donors and students.</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* MINE */}
          {tab === "mine" ? (
            <div className="ff-grid ff-grid-single">
              <div className="ff-card">
                <div className="ff-card-head">
                  <div>
                    <h2>My applications</h2>
                    <p className="ff-muted">Track your funding applications and updates here.</p>
                  </div>

                  <button className="ff-btn" type="button" onClick={() => loadMyApplications(myAppsPage.number)}>
                    Refresh
                  </button>
                </div>

                {myAppsLoading ? <div className="ff-muted">Loading...</div> : null}
                {myAppsError ? <div className="ff-error">{myAppsError}</div> : null}

                <div className="ff-apps">
                  {myApps.map((a) => (
                    <div
                      key={a.id}
                      className="ff-app-row"
                      role="button"
                      tabIndex={0}
                      onClick={() => openDetails(a.id)}
                      onKeyDown={(e) => (e.key === "Enter" ? openDetails(a.id) : null)}
                    >
                      <div>
                        <div className="ff-app-title">{a.university.name}</div>
                        <div className="ff-app-sub">
                          {a.programme} • Requested {money(a.amountRequested)} • Deadline {a.deadlineDate} • Docs {a.documentsCount}
                        </div>
                        <div className="ff-app-sub">Submitted {formatDate(a.createdAt)}</div>
                      </div>

                      <div className={chipClass(a.status)}>{prettyStatus(a.status)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ff-card">
                <h2>Quick tips</h2>
                <ul className="ff-bullets">
                  <li>Make sure your invoice shows the amount and reference number.</li>
                  <li>Deadlines closer to today are prioritised.</li>
                  <li>Status updates will appear here.</li>
                </ul>
              </div>
            </div>
          ) : null}

          {/* ABOUT */}
          {tab === "about" ? (
            <div className="ff-grid">
              <div className="ff-card">
                <h2>How it works</h2>
                <div className="ff-list">
                  <div className="ff-li">
                    <CheckCircle2 size={18} />
                    <div>
                      <div className="ff-li-title">1. Apply</div>
                      <div className="ff-li-sub">Submit your invoice/statement and deadline.</div>
                    </div>
                  </div>
                  <div className="ff-li">
                    <CheckCircle2 size={18} />
                    <div>
                      <div className="ff-li-title">2. Review</div>
                      <div className="ff-li-sub">We verify documents and may request extra proof.</div>
                    </div>
                  </div>
                  <div className="ff-li">
                    <CheckCircle2 size={18} />
                    <div>
                      <div className="ff-li-title">3. Approve & Pay</div>
                      <div className="ff-li-sub">When approved, the fund pays the institution directly.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ff-card">
                <h2>Rules & fairness</h2>
                <ul className="ff-bullets">
                  <li>Funds are limited — approvals depend on available balance.</li>
                  <li>Priority is given to verified invoices and earliest deadlines.</li>
                  <li>We may decline applications that are missing proof or are suspicious.</li>
                  <li>We avoid direct cash transfers to reduce fraud.</li>
                </ul>
              </div>
            </div>
          ) : null}

          {/* DETAILS MODAL */}
          {selectedId ? (
            <div className="ff-modal" role="dialog" aria-modal="true" onClick={closeDetails}>
              <div className="ff-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="ff-modal-head">
                  <div>
                    <h2 style={{ marginBottom: 6 }}>Application #{selectedId}</h2>
                    <div className="ff-muted">Details and documents</div>
                  </div>

                  <button className="ff-btn" type="button" onClick={closeDetails} aria-label="Close">
                    <X size={16} />
                  </button>
                </div>

                <div style={{ height: 12 }} />

                {detailsLoading ? (
                  <div className="ff-muted">Loading application details...</div>
                ) : detailsError ? (
                  <div className="ff-error">{detailsError}</div>
                ) : details ? (
                  <>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                      <div className={chipClass(details.status)}>{prettyStatus(details.status)}</div>
                      <div className="ff-chip ff-chip--neutral">Requested {money(details.amountRequested)}</div>
                      <div className="ff-chip ff-chip--neutral">Deadline {formatDate(details.deadlineDate)}</div>
                      <div className="ff-chip ff-chip--neutral">Submitted {formatDate(details.createdAt)}</div>
                    </div>

                    <div className="ff-modal-grid">
                      <div className="ff-card" style={{ margin: 0 }}>
                        <h3 style={{ marginTop: 0 }}>Application</h3>
                        <div className="ff-muted" style={{ marginBottom: 10 }}>
                          {details.university?.name} • {details.university?.location || "—"}
                        </div>

                        <div className="ff-muted">Programme</div>
                        <div style={{ marginBottom: 10 }}>{details.programme}</div>

                        <div className="ff-muted">Student number</div>
                        <div style={{ marginBottom: 10 }}>{details.studentNumber}</div>

                        <div className="ff-muted">Motivation</div>
                        <div style={{ whiteSpace: "pre-wrap" }}>{details.motivation}</div>
                      </div>

                      <div className="ff-card" style={{ margin: 0 }}>
                        <h3 style={{ marginTop: 0 }}>Documents</h3>

                        {details.documents?.length ? (
                          <div className="ff-docs">
                            {details.documents.map((d) => (
                              <div key={d.id} className="ff-doc-row">
                                <div className="ff-doc-left">
                                  <FileText size={18} />
                                  <div>
                                    <div className="ff-doc-name">{d.originalFileName}</div>
                                    <div className="ff-muted" style={{ fontSize: 12, margin: 0 }}>
                                      {d.contentType || "file"} • {formatBytes(d.fileSize)}
                                    </div>
                                  </div>
                                </div>

                                <button className="ff-btn" type="button" disabled>
                                  Download
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="ff-muted">No documents uploaded.</div>
                        )}

                        {details.adminNotes ? (
                          <div style={{ marginTop: 12 }}>
                            <div className="ff-muted">Admin notes</div>
                            <div>{details.adminNotes}</div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="ff-muted">No details found.</div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
