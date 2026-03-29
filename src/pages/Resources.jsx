import React, { useMemo, useState } from "react";
import "./ResourcesPage.css"; // ✅ wrapper style

const GRADES = ["8", "9", "10", "11", "12"];
const TYPES = [
  { key: "notes", label: "Notes" },
  { key: "papers", label: "Past Papers" }
];

const SUBJECTS_BY_GRADE = {
  "8": ["Mathematics", "English", "Natural Sciences", "Social Sciences"],
  "9": ["Mathematics", "English", "Natural Sciences", "Social Sciences"],
  "10": ["Mathematics", "Physical Sciences", "Life Sciences", "Accounting", "Geography", "History", "English"],
  "11": ["Mathematics", "Physical Sciences", "Life Sciences", "Accounting", "Geography", "History", "English"],
  "12": ["Mathematics", "Physical Sciences", "Life Sciences", "Accounting", "Geography", "History", "English"]
};

const NOTES = {
  "12": {
    Mathematics: [
      { id: "n1", title: "Term 1 – Algebra Notes (PDF)", url: "#" },
      { id: "n2", title: "Term 2 – Calculus Notes (PDF)", url: "#" }
    ],
    "Physical Sciences": [{ id: "n3", title: "Term 1 – Mechanics Notes (PDF)", url: "#" }]
  }
};

const PAST_PAPERS = {
  "12": {
    Mathematics: {
      Term1: {
        papers: [{ id: "p1", title: "Term 1 Test Paper (PDF)", url: "#" }],
        memos: [{ id: "m1", title: "Term 1 Test Memo (PDF)", url: "#" }]
      },
      Term2: {
        papers: [{ id: "p2", title: "Midyear Exam Paper (PDF)", url: "#" }],
        memos: [{ id: "m2", title: "Midyear Exam Memo (PDF)", url: "#" }]
      }
    }
  }
};

function Card({ title, subtitle, children, right }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 16,
        padding: 14
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: 0 }}>{title}</h2>
          {subtitle ? <p style={{ margin: "6px 0 0", opacity: 0.75 }}>{subtitle}</p> : null}
        </div>
        {right ? <div>{right}</div> : null}
      </div>
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  );
}

export default function Resources() {
  const [grade, setGrade] = useState("");
  const [type, setType] = useState("");
  const [subject, setSubject] = useState("");
  const [term, setTerm] = useState("");

  const subjects = useMemo(() => SUBJECTS_BY_GRADE[grade] || [], [grade]);

  const resetAfterGrade = () => {
    setType("");
    setSubject("");
    setTerm("");
  };

  const resetAfterType = () => {
    setSubject("");
    setTerm("");
  };

  const showNotes = type === "notes" && grade && subject;
  const showPapers = type === "papers" && grade && subject && term;

  const notesList = NOTES?.[grade]?.[subject] || [];
  const paperPack = PAST_PAPERS?.[grade]?.[subject]?.[term] || { papers: [], memos: [] };

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      {/* ✅ WHITE WRAPPER ADDED HERE */}
      <div className="page-shell">

        <h1 style={{ margin: 0, fontSize: 28 }}>Resources</h1>
        <p style={{ marginTop: 8, opacity: 0.75 }}>
          Notes and past papers by grade, subject, and term.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 14, marginTop: 14 }}>
          {/* LEFT */}
          <Card title="Find resources" subtitle="Select grade → notes/past papers → subject → term (for papers).">

            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10, alignItems: "center" }}>
              <div style={{ fontWeight: 700 }}>Grade</div>
              <select
                value={grade}
                onChange={(e) => {
                  setGrade(e.target.value);
                  resetAfterGrade();
                }}
                style={{
                  height: 42,
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.12)",
                  padding: "0 12px",
                  background: "#fff"
                }}
              >
                <option value="">Select grade…</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "140px 1fr", gap: 10, alignItems: "center" }}>
              <div style={{ fontWeight: 700 }}>Category</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {TYPES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    disabled={!grade}
                    onClick={() => {
                      setType(t.key);
                      resetAfterType();
                    }}
                    style={{
                      borderRadius: 999,
                      padding: "10px 12px",
                      border: "1px solid rgba(0,0,0,0.12)",
                      background: type === t.key ? "rgba(0,0,0,0.03)" : "#fff",
                      cursor: !grade ? "not-allowed" : "pointer",
                      opacity: !grade ? 0.6 : 1
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "140px 1fr", gap: 10, alignItems: "center" }}>
              <div style={{ fontWeight: 700 }}>Subject</div>
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setTerm("");
                }}
                disabled={!grade || !type}
                style={{
                  height: 42,
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.12)",
                  padding: "0 12px",
                  background: "#fff",
                  opacity: !grade || !type ? 0.6 : 1
                }}
              >
                <option value="">Select subject…</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {type === "papers" && (
              <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "140px 1fr", gap: 10, alignItems: "center" }}>
                <div style={{ fontWeight: 700 }}>Term</div>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  disabled={!grade || !type || !subject}
                  style={{
                    height: 42,
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.12)",
                    padding: "0 12px",
                    background: "#fff",
                    opacity: !grade || !type || !subject ? 0.6 : 1
                  }}
                >
                  <option value="">Select term…</option>
                  <option value="Term1">Term 1</option>
                  <option value="Term2">Term 2</option>
                  <option value="Term3">Term 3</option>
                  <option value="Term4">Term 4</option>
                </select>
              </div>
            )}

            <div style={{ marginTop: 14, borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Results</div>

              {!grade && <div style={{ opacity: 0.75 }}>Choose a grade to start.</div>}
              {grade && !type && <div style={{ opacity: 0.75 }}>Choose Notes or Past Papers.</div>}
              {grade && type && !subject && <div style={{ opacity: 0.75 }}>Choose a subject.</div>}
              {type === "papers" && grade && subject && !term && (
                <div style={{ opacity: 0.75 }}>Choose a term to view papers and memos.</div>
              )}
            </div>

          </Card>

          {/* RIGHT */}
          <Card title="How it will work" subtitle="You will need to fill the Filter on the Left">
            <ul style={{ margin: "10px 0 0 18px", lineHeight: 1.7, opacity: 0.9 }}>
              <li>Grade selection filters subjects.</li>
              <li>Notes show available note packs.</li>
              <li>Past papers show paper + memo per term.</li>
              <li>The subject options depend on your APS subjects on Dashboard.</li>
            </ul>

            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,0.08)",
                background: "rgba(0,0,0,0.02)"
              }}
            >
              <b>Next:</b> When you’re ready, connect your resources API.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
