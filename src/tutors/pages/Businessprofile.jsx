import React, { useState, useEffect } from "react";
import api from "../../services/api";
import "../styles/Businessprofile.css";

const MODES = ["Online", "In-Person", "Hybrid"];

const defaultForm = {
  name: "", headline: "", mode: "Online", location: "",
  bannerImageUrl: "", bio: "", pricePerMonth: "", currency: "ZAR",
  subjectsOffered: [], whyJoinItems: [], pricingIncludes: [],
  galleryImages: [], tutors: [], reviews: [], successStories: [],
};

// ── tiny helpers ───────────────────────────────────────────────────────────────
const TagInput = ({ label, items, onChange, placeholder }) => {
  const [val, setVal] = useState("");
  const add = () => {
    const trimmed = val.trim();
    if (trimmed && !items.includes(trimmed)) onChange([...items, trimmed]);
    setVal("");
  };
  return (
    <div className="bp-field">
      <label>{label}</label>
      <div className="bp-tag-row">
        <input value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder || "Type and press Enter"} />
        <button type="button" className="bp-tag-add" onClick={add}>+ Add</button>
      </div>
      <div className="bp-tags">
        {items.map((item, i) => (
          <span key={i} className="bp-tag">
            {item}
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
};

// ── Tutor card editor ──────────────────────────────────────────────────────────
const TutorEditor = ({ tutors, onChange }) => {
  const blank = { name: "", imageUrl: "", subjectsCsv: "", grades: "", rating: "", reviewsCount: "", experienceYears: "" };
  const update = (i, field, val) => {
    const next = tutors.map((t, j) => j === i ? { ...t, [field]: val } : t);
    onChange(next);
  };
  return (
    <div className="bp-field">
      <label>Team / Tutors</label>
      {tutors.map((t, i) => (
        <div key={i} className="bp-card-editor">
          <div className="bp-card-editor-grid">
            <input placeholder="Full name" value={t.name} onChange={e => update(i, "name", e.target.value)} />
            <input placeholder="Photo URL" value={t.imageUrl} onChange={e => update(i, "imageUrl", e.target.value)} />
            <input placeholder="Subjects (comma-separated)" value={t.subjectsCsv} onChange={e => update(i, "subjectsCsv", e.target.value)} />
            <input placeholder="Grades e.g. Grades 10–12" value={t.grades} onChange={e => update(i, "grades", e.target.value)} />
            <input placeholder="Rating e.g. 4.8" type="number" step="0.1" value={t.rating} onChange={e => update(i, "rating", e.target.value)} />
            <input placeholder="Review count" type="number" value={t.reviewsCount} onChange={e => update(i, "reviewsCount", e.target.value)} />
            <input placeholder="Years experience" type="number" value={t.experienceYears} onChange={e => update(i, "experienceYears", e.target.value)} />
          </div>
          <button type="button" className="bp-remove" onClick={() => onChange(tutors.filter((_, j) => j !== i))}>Remove</button>
        </div>
      ))}
      <button type="button" className="bp-add-card" onClick={() => onChange([...tutors, blank])}>+ Add Tutor</button>
    </div>
  );
};

// ── Review editor ──────────────────────────────────────────────────────────────
const ReviewEditor = ({ reviews, onChange }) => {
  const blank = { student: "", rating: "", comment: "" };
  const update = (i, field, val) => onChange(reviews.map((r, j) => j === i ? { ...r, [field]: val } : r));
  return (
    <div className="bp-field">
      <label>Reviews</label>
      {reviews.map((r, i) => (
        <div key={i} className="bp-card-editor">
          <div className="bp-card-editor-grid">
            <input placeholder="Student / Parent name" value={r.student} onChange={e => update(i, "student", e.target.value)} />
            <input placeholder="Rating (1–5)" type="number" min="1" max="5" value={r.rating} onChange={e => update(i, "rating", e.target.value)} />
            <textarea placeholder="Comment" value={r.comment} onChange={e => update(i, "comment", e.target.value)} rows={2} style={{ gridColumn: "1/-1" }} />
          </div>
          <button type="button" className="bp-remove" onClick={() => onChange(reviews.filter((_, j) => j !== i))}>Remove</button>
        </div>
      ))}
      <button type="button" className="bp-add-card" onClick={() => onChange([...reviews, blank])}>+ Add Review</button>
    </div>
  );
};

// ── Success story editor ───────────────────────────────────────────────────────
const StoryEditor = ({ stories, onChange }) => {
  const blank = { student: "", subject: "", improvement: "", story: "" };
  const update = (i, field, val) => onChange(stories.map((s, j) => j === i ? { ...s, [field]: val } : s));
  return (
    <div className="bp-field">
      <label>Success Stories</label>
      {stories.map((s, i) => (
        <div key={i} className="bp-card-editor">
          <div className="bp-card-editor-grid">
            <input placeholder="Student name" value={s.student} onChange={e => update(i, "student", e.target.value)} />
            <input placeholder="Subject" value={s.subject} onChange={e => update(i, "subject", e.target.value)} />
            <input placeholder="Improvement e.g. 40% → 78%" value={s.improvement} onChange={e => update(i, "improvement", e.target.value)} />
            <textarea placeholder="Story" value={s.story} onChange={e => update(i, "story", e.target.value)} rows={2} style={{ gridColumn: "1/-1" }} />
          </div>
          <button type="button" className="bp-remove" onClick={() => onChange(stories.filter((_, j) => j !== i))}>Remove</button>
        </div>
      ))}
      <button type="button" className="bp-add-card" onClick={() => onChange([...stories, blank])}>+ Add Story</button>
    </div>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────────
export default function BusinessProfile() {
  const [form, setForm]       = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null); // { type: "success"|"error", msg }
  const [activeTab, setActiveTab] = useState("basics");

  useEffect(() => {
    api.get("/tutor/business")
      .then(res => {
        const d = res.data.data;
        if (d && d.id) {
          setForm({
            ...defaultForm, ...d,
            pricePerMonth: d.pricePerMonth ?? "",
            subjectsOffered: d.subjectsOffered   || [],
            whyJoinItems:    d.whyJoinItems       || [],
            pricingIncludes: d.pricingIncludes    || [],
            galleryImages:   d.galleryImages      || [],
            tutors:          d.businessTutors      || [],
            reviews:         d.reviews            || [],
            successStories:  d.successStories     || [],
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async () => {
    if (!form.name?.trim()) return showToast("error", "Business name is required.");
    setSaving(true);
    try {
      const payload = {
        ...form,
        pricePerMonth: form.pricePerMonth !== "" ? Number(form.pricePerMonth) : null,
        businessTutors: form.tutors.map(t => ({
          ...t,
          rating:          t.rating          !== "" ? Number(t.rating)          : null,
          reviewsCount:    t.reviewsCount    !== "" ? Number(t.reviewsCount)    : null,
          experienceYears: t.experienceYears !== "" ? Number(t.experienceYears) : null,
        })),
        reviews: form.reviews.map(r => ({
          ...r, rating: r.rating !== "" ? Number(r.rating) : null,
        })),
      };
      await api.put("/tutor/business", payload);
      showToast("success", "Business profile saved successfully!");
    } catch (e) {
      showToast("error", e.response?.data?.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: "basics",   label: "Basics"   },
    { id: "subjects", label: "Subjects & Details" },
    { id: "team",     label: "Team"     },
    { id: "pricing",  label: "Pricing"  },
    { id: "social",   label: "Gallery & Reviews" },
  ];

  if (loading) return <div className="bp-loading">Loading your business profile…</div>;

  return (
    <div className="bp-shell">
      {/* ── Header ── */}
      <div className="bp-header">
        <div>
          <h1 className="bp-title">Business Profile</h1>
          <p className="bp-subtitle">This is what students see when they find you. Make it count.</p>
        </div>
        <button className="bp-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`bp-toast bp-toast--${toast.type}`}>{toast.msg}</div>
      )}

      {/* ── Tabs ── */}
      <div className="bp-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`bp-tab ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bp-body">

        {/* ══ BASICS ══════════════════════════════════════════════════════ */}
        {activeTab === "basics" && (
          <div className="bp-section">
            <h2 className="bp-section-title">Basic Information</h2>
            <p className="bp-section-desc">Your business name and headline appear on the Find Tutors page.</p>

            <div className="bp-grid-2">
              <div className="bp-field">
                <label>Business Name *</label>
                <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Bright Minds Tutoring" />
              </div>
              <div className="bp-field">
                <label>Teaching Mode</label>
                <select value={form.mode} onChange={e => set("mode", e.target.value)}>
                  {MODES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="bp-field">
              <label>Headline</label>
              <input value={form.headline} onChange={e => set("headline", e.target.value)}
                placeholder="e.g. Helping learners unlock their full academic potential" />
            </div>

            <div className="bp-grid-2">
              <div className="bp-field">
                <label>Location</label>
                <input value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Johannesburg" />
              </div>
              <div className="bp-field">
                <label>Banner Image URL</label>
                <input value={form.bannerImageUrl} onChange={e => set("bannerImageUrl", e.target.value)}
                  placeholder="https://…" />
              </div>
            </div>

            {form.bannerImageUrl && (
              <div className="bp-banner-preview">
                <img src={form.bannerImageUrl} alt="Banner preview"
                  onError={e => { e.currentTarget.style.display = "none"; }} />
              </div>
            )}

            <div className="bp-field">
              <label>About / Bio</label>
              <textarea rows={5} value={form.bio} onChange={e => set("bio", e.target.value)}
                placeholder="Tell students what makes your tutoring service special…" />
            </div>
          </div>
        )}

        {/* ══ SUBJECTS & DETAILS ══════════════════════════════════════════ */}
        {activeTab === "subjects" && (
          <div className="bp-section">
            <h2 className="bp-section-title">Subjects & Why Join</h2>

            <TagInput label="Subjects Offered" items={form.subjectsOffered}
              onChange={v => set("subjectsOffered", v)} placeholder="e.g. Mathematics" />

            <TagInput label="Why Join Us (selling points)" items={form.whyJoinItems}
              onChange={v => set("whyJoinItems", v)}
              placeholder="e.g. Exam-focused revision and past papers" />
          </div>
        )}

        {/* ══ TEAM ════════════════════════════════════════════════════════ */}
        {activeTab === "team" && (
          <div className="bp-section">
            <h2 className="bp-section-title">Your Tutoring Team</h2>
            <p className="bp-section-desc">Add the tutors that appear on your profile page. These are showcase cards — they don't need to be registered users.</p>
            <TutorEditor tutors={form.tutors} onChange={v => set("tutors", v)} />
          </div>
        )}

        {/* ══ PRICING ═════════════════════════════════════════════════════ */}
        {activeTab === "pricing" && (
          <div className="bp-section">
            <h2 className="bp-section-title">Pricing</h2>

            <div className="bp-grid-2">
              <div className="bp-field">
                <label>Price Per Month (R)</label>
                <input type="number" value={form.pricePerMonth}
                  onChange={e => set("pricePerMonth", e.target.value)} placeholder="e.g. 799" />
              </div>
              <div className="bp-field">
                <label>Currency</label>
                <select value={form.currency} onChange={e => set("currency", e.target.value)}>
                  <option>ZAR</option>
                  <option>USD</option>
                  <option>EUR</option>
                </select>
              </div>
            </div>

            <TagInput label="What's Included in the Price" items={form.pricingIncludes}
              onChange={v => set("pricingIncludes", v)}
              placeholder="e.g. 4 lessons per week" />
          </div>
        )}

        {/* ══ GALLERY & REVIEWS ═══════════════════════════════════════════ */}
        {activeTab === "social" && (
          <div className="bp-section">
            <h2 className="bp-section-title">Gallery, Reviews & Success Stories</h2>

            <TagInput label="Gallery Image URLs" items={form.galleryImages}
              onChange={v => set("galleryImages", v)} placeholder="https://…" />

            {form.galleryImages.length > 0 && (
              <div className="bp-gallery-preview">
                {form.galleryImages.map((url, i) => (
                  <img key={i} src={url} alt={`Gallery ${i + 1}`}
                    onError={e => { e.currentTarget.style.display = "none"; }} />
                ))}
              </div>
            )}

            <ReviewEditor reviews={form.reviews} onChange={v => set("reviews", v)} />
            <StoryEditor  stories={form.successStories} onChange={v => set("successStories", v)} />
          </div>
        )}

      </div>

      {/* ── Sticky bottom save ── */}
      <div className="bp-footer">
        <button className="bp-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}