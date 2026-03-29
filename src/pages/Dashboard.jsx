// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, GraduationCap, Plus, Trash2, Target } from "lucide-react";
import api from "../services/api";
import "./Dashboard.css";

function markToApsPoints(mark) {
  const m = Number(mark);
  if (Number.isNaN(m)) return 0;
  if (m >= 80) return 7;
  if (m >= 70) return 6;
  if (m >= 60) return 5;
  if (m >= 50) return 4;
  if (m >= 40) return 3;
  if (m >= 30) return 2;
  return 1;
}

// ---- APS RULE HELPERS ----
function toLevel(mark) {
  const m = Number(mark);
  if (Number.isNaN(m)) return 0;
  if (m >= 90) return 8;
  if (m >= 80) return 7;
  if (m >= 70) return 6;
  if (m >= 60) return 5;
  if (m >= 50) return 4;
  if (m >= 40) return 3;
  if (m >= 30) return 2;
  return 1;
}

function points7(mark) {
  const m = Number(mark);
  if (Number.isNaN(m)) return 0;
  if (m >= 80) return 7;
  if (m >= 70) return 6;
  if (m >= 60) return 5;
  if (m >= 50) return 4;
  if (m >= 40) return 3;
  if (m >= 30) return 2;
  return 1;
}

function points8(mark) {
  const m = Number(mark);
  if (Number.isNaN(m)) return 0;
  if (m >= 90) return 8;
  if (m >= 80) return 7;
  if (m >= 70) return 6;
  if (m >= 60) return 5;
  if (m >= 50) return 4;
  if (m >= 40) return 3;
  if (m >= 30) return 2;
  return 1;
}

function pointsUWC(subjectName, mark) {
  const lvl = toLevel(mark);

  const EN_MATH = { 8: 15, 7: 13, 6: 11, 5: 9, 4: 7, 3: 5, 2: 3, 1: 1, 0: 0 };
  const LO = { 8: 3, 7: 3, 6: 2, 5: 2, 4: 2, 3: 1, 2: 1, 1: 1, 0: 0 };
  const OTHER = { 8: 8, 7: 7, 6: 6, 5: 5, 4: 4, 3: 3, 2: 2, 1: 1, 0: 0 };

  const name = (subjectName || "").toLowerCase();

  const isEnglish = name.includes("english");
  const isMath = name.includes("mathematics") || name.includes("math lit") || name.includes("mathematical literacy");
  const isLO = name.includes("life orientation");

  if (isEnglish || isMath) return EN_MATH[lvl] ?? 0;
  if (isLO) return LO[lvl] ?? 0;
  return OTHER[lvl] ?? 0;
}

function pointsRhodes(subjectName, mark) {
  const name = (subjectName || "").toLowerCase();
  if (name.includes("life orientation")) return 0;
  const m = Number(mark);
  if (Number.isNaN(m)) return 0;
  return Number((m / 10).toFixed(1));
}

function pointsFortHare(subjectName, mark) {
  const name = (subjectName || "").toLowerCase();
  const m = Number(mark);
  if (Number.isNaN(m)) return 0;

  // ✅ LO rule stays the same
  if (name.includes("life orientation")) {
    if (m < 50) return 0;
    return Math.min(4, points7(m)); // capped at 4 as you want
  }

  // ✅ Non-LO now uses 8-point scale (90+ => 8)
  if (m < 30) return 0;
  return points8(m);
}


function apsCPUT(subjects) {
  const top6 = [...subjects]
    .filter((s) => s.mark !== "" && s.mark !== null && s.mark !== undefined)
    .sort((a, b) => Number(b.mark) - Number(a.mark))
    .slice(0, 6);

  const sum = top6.reduce((acc, s) => acc + Number(s.mark || 0), 0);
  return {
    total: Number((sum / 10).toFixed(1)),
    breakdown: top6.map((s) => ({ ...s, uniPoints: Number((Number(s.mark) / 10).toFixed(1)) })),
    note: "CPUT: Best 6 subject % total ÷ 10",
  };
}

function pointsSPU(subjectName, mark) {
  const lvl = toLevel(mark);
  const base = { 7: 7, 6: 6, 5: 5, 4: 4, 3: 3, 2: 2, 1: 1, 8: 8, 0: 0 };

  const EXTRA = { 8: 2, 7: 2, 6: 2, 5: 2, 4: 1, 3: 1, 2: 0, 1: 0, 0: 0 };
  const LO = { 8: 4, 7: 3, 6: 2, 5: 1, 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 };

  const name = (subjectName || "").toLowerCase();
  const isMath = name.includes("mathematics") || name.includes("math lit") || name.includes("mathematical literacy");
  const isHL = name.includes("home language") || name.includes("(hl)") || name.includes(" hl");
  const isLO = name.includes("life orientation");

  if (isLO) return LO[lvl] ?? 0;

  let p = base[lvl] ?? 0;
  if (isMath || isHL) p += EXTRA[lvl] ?? 0;
  return p;
}

function bestN(subjects, n, { excludeLO } = { excludeLO: false }) {
  const filtered = excludeLO
    ? subjects.filter((s) => !(s.subjectName || "").toLowerCase().includes("life orientation"))
    : subjects;

  return [...filtered].sort((a, b) => Number(b.mark) - Number(a.mark)).slice(0, n);
}

function apsOutOf600(subjects) {
  const top6 = bestN(subjects, 6, { excludeLO: true });
  const total = top6.reduce((acc, s) => acc + Number(s.mark || 0), 0);
  return {
    total,
    breakdown: top6.map((s) => ({ ...s, uniPoints: Number(s.mark || 0) })),
    note: "Sum of best 6 subject % (excluding LO) out of 600",
  };
}

/** ✅ WITS APS (matches slide) */
function pointsWits(subjectName, mark) {
  const lvl = toLevel(mark);
  const name = (subjectName || "").toLowerCase();

  const isEnglish = name.includes("english");
  const isMath = name.includes("mathematics"); // keep strict; add math lit if Wits accepts it
  const isLO = name.includes("life orientation");

  // Slide: Other Subjects show 8..3, but 2 and 1 become 0
  const OTHER = { 8: 8, 7: 7, 6: 6, 5: 5, 4: 4, 3: 3, 2: 0, 1: 0, 0: 0 };

  // Slide: Life Orientation points
  const LO = { 8: 4, 7: 3, 6: 2, 5: 1, 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 };

  // Slide: English & Mathematics = level (+2 for levels 5..8)
  const engMathPoints = lvl >= 5 ? lvl + 2 : lvl; // 8->10, 7->9, 6->8, 5->7, else same

  if (isLO) return LO[lvl] ?? 0;
  if (isEnglish || isMath) return engMathPoints;
  return OTHER[lvl] ?? 0;
}

function apsWits(subjects) {
  // 1) Find LO (only 1)
  const lo = subjects.find((s) => (s.subjectName || "").toLowerCase().includes("life orientation"));

  // 2) Best 6 subjects EXCLUDING LO
  const best6 = bestN(subjects, 6, { excludeLO: true });

  // 3) Breakdown = best6 + LO (so 7 items)
  const breakdown = [
    ...best6.map((s) => ({ ...s, uniPoints: pointsWits(s.subjectName, s.mark) })),
    ...(lo ? [{ ...lo, uniPoints: pointsWits(lo.subjectName, lo.mark) }] : []),
  ];

  // 4) Total = sum of all in breakdown
  const total = breakdown.reduce((acc, s) => acc + Number(s.uniPoints || 0), 0);

  return {
    total,
    breakdown,
    note: "Wits: Best 6 subjects + Life Orientation (7 subjects total)",
  };
}

function apsSPU(subjects) {
  // 1) Find LO (only 1)
  const lo = subjects.find((s) => (s.subjectName || "").toLowerCase().includes("life orientation"));

  // 2) Best 6 subjects EXCLUDING LO (selection based on marks, same as your other rules)
  const best6 = bestN(subjects, 6, { excludeLO: true });

  // 3) Breakdown = best6 + LO (7 items)
  const breakdown = [
    ...best6.map((s) => ({ ...s, uniPoints: pointsSPU(s.subjectName, s.mark) })),
    ...(lo ? [{ ...lo, uniPoints: pointsSPU(lo.subjectName, lo.mark) }] : []),
  ];

  // 4) Total = sum of all uniPoints
  const total = breakdown.reduce((acc, s) => acc + Number(s.uniPoints || 0), 0);

  return {
    total,
    breakdown,
    note: "SPU: Best 6 subjects (excluding LO) + Life Orientation (7 subjects total)",
  };
}

function calculateUniversityAps(universityName, addedSubjects) {
  const uni = (universityName || "").toLowerCase();

  const subjects = addedSubjects.map((s) => ({
    ...s,
    mark: Number(s.mark),
  }));

  // ✅ WITS branch (put early so it doesn't fall into group A)
  if (uni.includes("wits") || uni.includes("witwatersrand")) {
    return apsWits(subjects);
  }

  const groupA = [
    "university of johannesburg",
    "university of pretoria",
    "ukzn",
    "university of limpopo",
    "university of venda",
    "tshwane university of technology",
    "durban university of technology",
    "university of zululand",
    "university of mpumalanga",
    "university of south africa",
    "sefako makgatho health sciences university",
  ];
  if (groupA.some((x) => uni.includes(x))) {
    const top6 = bestN(subjects, 6, { excludeLO: true });
    const breakdown = top6.map((s) => ({ ...s, uniPoints: points7(s.mark) }));
    const total = breakdown.reduce((acc, s) => acc + s.uniPoints, 0);
    return { total, breakdown, note: "Best 6 subjects · LO excluded · 7-point APS" };
  }

  const groupB = [
    "university of the free state",
    "central university of technology",
    "mangosuthu university of technology",
    "vaal university of technology",
    "north-west university",
    "walter sisulu university",
  ];
  if (groupB.some((x) => uni.includes(x))) {
    const top6 = bestN(subjects, 6, { excludeLO: true });
    const breakdown = top6.map((s) => ({ ...s, uniPoints: points8(s.mark) }));
    const total = breakdown.reduce((acc, s) => acc + s.uniPoints, 0);
    return { total, breakdown, note: "Best 6 subjects · LO excluded · 8-point APS" };
  }

  if (uni.includes("university of cape town") || uni.includes("nelson mandela university")) {
    return apsOutOf600(subjects);
  }

  if (uni.includes("rhodes")) {
    const top6 = bestN(subjects, 6, { excludeLO: true });
    const breakdown = top6.map((s) => ({ ...s, uniPoints: pointsRhodes(s.subjectName, s.mark) }));
    const total = Number(breakdown.reduce((acc, s) => acc + s.uniPoints, 0).toFixed(1));
    return { total, breakdown, note: "Rhodes: % ÷ 10 points · LO = 0 · Best 6" };
  }

  if (uni.includes("western cape")) {
    const top6 = bestN(subjects, 6, { excludeLO: false });
    const breakdown = top6.map((s) => ({ ...s, uniPoints: pointsUWC(s.subjectName, s.mark) }));
    const total = breakdown.reduce((acc, s) => acc + s.uniPoints, 0);
    return { total, breakdown, note: "UWC points table · Best 6 (tunable) · LO allowed" };
  }

  if (uni.includes("fort hare")) {
    const hasLO = subjects.find((s) => (s.subjectName || "").toLowerCase().includes("life orientation"));
    const loMark = hasLO?.mark ?? null;

    const top6 = bestN(subjects, 6, { excludeLO: false });
    const breakdown = top6.map((s) => ({ ...s, uniPoints: pointsFortHare(s.subjectName, s.mark) }));
    const total = breakdown.reduce((acc, s) => acc + s.uniPoints, 0);

    const eligible = loMark !== null ? loMark >= 50 : false;

    return {
      total,
      breakdown,
      note: eligible
        ? "Fort Hare: LO must be ≥50, LO points capped at 4"
        : "Fort Hare: LO must be ≥50 (rating 4) for admission",
      eligible,
    };
  }

  if (uni.includes("cape peninsula university of technology")) {
    return apsCPUT(subjects);
  }

  if (uni.includes("sol plaatje")) {
    return apsSPU(subjects);
  }

  if (uni.includes("stellenbosch")) {
    return { total: 0, breakdown: [], note: "Stellenbosch: rules not added yet" };
  }

  const top6 = bestN(subjects, 6, { excludeLO: true });
  const breakdown = top6.map((s) => ({ ...s, uniPoints: points7(s.mark) }));
  const total = breakdown.reduce((acc, s) => acc + s.uniPoints, 0);
  return { total, breakdown, note: "Default: Best 6 · LO excluded · 7-point APS" };
}

function assessmentText(total) {
  if (total >= 40) return { label: "Excellent", text: "Strong score. You have many options." };
  if (total >= 30) return { label: "Good", text: "You’re close — a few improvements unlock more options." };
  return { label: "Assessment", text: "Consider improving your marks to unlock more options." };
}

function normalize(name) {
  return String(name || "").trim().toLowerCase();
}

function buildMarksMap(addedSubjects) {
  const map = new Map();
  addedSubjects.forEach((s) => {
    map.set(normalize(s.subjectName), Number(s.mark));
  });
  return map;
}

/** ✅ Additional Language Mapping Helpers */
function isLifeOrientation(name = "") {
  return name.toLowerCase().includes("life orientation");
}
function isHomeLanguage(name = "") {
  const n = name.toLowerCase();
  return n.includes("home language") || n.includes("(hl)") || n.includes(" hl");
}
function isFirstAdditionalLanguage(name = "") {
  const n = name.toLowerCase();
  return n.includes("first additional language") || n.includes("(fal)") || n.includes(" fal");
}
function getBestFALMark(addedSubjects) {
  const fals = addedSubjects.filter(
    (s) =>
      !isLifeOrientation(s.subjectName) &&
      !isHomeLanguage(s.subjectName) &&
      isFirstAdditionalLanguage(s.subjectName) &&
      s.mark !== "" &&
      s.mark !== null &&
      s.mark !== undefined
  );
  if (fals.length === 0) return null;
  return Math.max(...fals.map((s) => Number(s.mark)));
}

function meetsSingle(marksMap, subjectName, minPercentage, addedSubjects = []) {
  const target = normalize(subjectName);

  // ✅ Backend "Additional Language" should match student's best First Additional Language (FAL)
  if (target === "additional language" || target.includes("additional language")) {
    const bestFal = getBestFALMark(addedSubjects);
    return bestFal !== null && bestFal >= Number(minPercentage);
  }

  const got = marksMap.get(target);
  return typeof got === "number" && got >= Number(minPercentage);
}

function meetsAnyOf(marksMap, anyOfList, totalAps, addedSubjects = []) {
  return anyOfList.some((opt) => {
    const okSubject = meetsSingle(marksMap, opt.subject, opt.minPercentage, addedSubjects);
    const okAps = opt.minAps == null ? true : totalAps >= Number(opt.minAps);
    return okSubject && okAps;
  });
}

function qualifiesForCourse(courseRow, marksMap, totalAps, addedSubjects = []) {
  const minAps = Number(courseRow?.course?.minAps ?? 0);
  if (Number.isFinite(minAps) && totalAps < minAps) return false;

  const reqs = Array.isArray(courseRow?.requirements) ? courseRow.requirements : [];
  for (const r of reqs) {
    if (r.subject) {
      if (!meetsSingle(marksMap, r.subject, r.minPercentage, addedSubjects)) return false;
    }
    if (r.anyOf) {
      if (!meetsAnyOf(marksMap, r.anyOf, totalAps, addedSubjects)) return false;
    }
  }
  return true;
}

const Dashboard = () => {
  // data
  const [subjects, setSubjects] = useState([]);
  const [universities, setUniversities] = useState([]);

  // ui / form state
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [mark, setMark] = useState("");
  const [addedSubjects, setAddedSubjects] = useState([]);

  const [selectedUniversityId, setSelectedUniversityId] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState("");

  // ✅ Course Recommendations filters (ONLY for "Courses You Qualify For")
  const [faculties, setFaculties] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState(""); // "" = all
  const [inDemandFilter, setInDemandFilter] = useState("all"); // "all" | "true" | "false"

  useEffect(() => {
    if (!selectedUniversityId) return;

    (async () => {
      try {
        const res = await api.get(`/universities/${selectedUniversityId}/faculties`);
        setFaculties(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load faculties", err);
        setFaculties([]);
      }
    })();
  }, [selectedUniversityId]);

  // ✅ load universities (default to the first one)
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/universities/names");
        console.log("UNIVERSITY NAMES:", res.data);

        setUniversities(res.data || []);

        if (res.data && res.data.length > 0) {
          setSelectedUniversityId(String(res.data[0].id));
        }
      } catch (err) {
        console.error("Failed to load university names", err);
        setUniversities([]);
      }
    })();
  }, []);

  // ✅ load subjects
  useEffect(() => {
    api
      .get("/subjects")
      .then((res) => setSubjects(res.data))
      .catch((err) => {
        console.error("Failed to load subjects", err);
        alert(err.response?.data?.message || "Failed to load subjects. Make sure you are logged in.");
      });
  }, []);

  // ✅ load courses for selected university
  useEffect(() => {
    if (!selectedUniversityId) return;

    (async () => {
      try {
        setCoursesLoading(true);
        setCoursesError("");

        const res = await api.get(`/universities/${selectedUniversityId}/courses`);
        setCourses(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load courses", err);
        setCourses([]);
        setCoursesError(err.response?.data?.message || "Failed to load courses");
      } finally {
        setCoursesLoading(false);
      }
    })();
  }, [selectedUniversityId]);

  // ✅ load saved marks after subjects loaded
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/student/marks");
        const rows = Array.isArray(res.data) ? res.data : [];

        const loaded = rows.map((r) => {
          const subjectId = r.subject?.id ?? r.subjectId;
          const subjectName = subjects.find((s) => String(s.id) === String(subjectId))?.name || "Subject";
          const percentage = Number(r.percentage ?? 0);

          return {
            subjectId,
            subjectName,
            mark: percentage,
            apsPoints: markToApsPoints(percentage),
          };
        });

        setAddedSubjects(loaded);
      } catch (err) {
        console.error("Failed to load saved marks", err);
      } finally {
        setHydrated(true);
      }
    })();
  }, [subjects]);

  // ✅ autosave marks
  useEffect(() => {
    if (!hydrated) return;

    const timer = setTimeout(async () => {
      try {
        setSaving(true);
        setSaveError("");

        const payload = addedSubjects.map((s) => ({
          subject: { id: s.subjectId },
          percentage: Number(s.mark),
        }));

        await api.post("/student/marks", payload);
      } catch (err) {
        console.error("Failed to save marks", err);
        setSaveError(err.response?.data?.message || "Failed to save marks");
      } finally {
        setSaving(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [addedSubjects, hydrated]);

  const universityOptions = Array.isArray(universities) ? universities : [];

  const selectedUniversity = useMemo(() => {
    return universityOptions.find((u) => String(u.id) === String(selectedUniversityId));
  }, [universityOptions, selectedUniversityId]);

  const selectedSubject = useMemo(() => {
    return subjects.find((s) => String(s.id) === String(selectedSubjectId));
  }, [subjects, selectedSubjectId]);

  const handleAddSubject = () => {
    if (!selectedSubject || mark === "") return;

    const cleanMark = Math.max(0, Math.min(100, Number(mark)));

    const exists = addedSubjects.some((x) => String(x.subjectId) === String(selectedSubject.id));
    if (exists) return;

    setAddedSubjects((prev) => [
      ...prev,
      {
        subjectId: selectedSubject.id,
        subjectName: selectedSubject.name,
        mark: cleanMark,
        apsPoints: markToApsPoints(cleanMark),
      },
    ]);

    setSelectedSubjectId("");
    setMark("");
  };

  const handleDelete = (subjectId) => {
    setAddedSubjects((prev) => prev.filter((x) => String(x.subjectId) !== String(subjectId)));
  };

  const handleMarkChange = (subjectId, newMark) => {
    const cleanMark = Math.max(0, Math.min(100, Number(newMark)));
    setAddedSubjects((prev) =>
      prev.map((x) =>
        String(x.subjectId) === String(subjectId)
          ? { ...x, mark: cleanMark, apsPoints: markToApsPoints(cleanMark) }
          : x
      )
    );
  };

  const selectedFacultyName = useMemo(() => {
    if (!selectedFacultyId) return "";
    const f = faculties.find((x) => String(x.id) === String(selectedFacultyId));
    return f?.name || "";
  }, [faculties, selectedFacultyId]);

  const uniAps = useMemo(() => {
    return calculateUniversityAps(selectedUniversity?.name, addedSubjects);
  }, [selectedUniversity?.name, addedSubjects]);

  const totalAps = uniAps.total;
  const assess = assessmentText(typeof totalAps === "number" ? totalAps : 0);

  const marksMap = useMemo(() => buildMarksMap(addedSubjects), [addedSubjects]);

  const qualifyingCourses = useMemo(() => {
    if (!Array.isArray(courses) || courses.length === 0) return [];

    return courses
      .filter((row) => qualifiesForCourse(row, marksMap, totalAps, addedSubjects))
      .filter((row) => {
        if (!selectedFacultyId) return true;
        const courseFaculty = normalize(row?.course?.faculty);
        return courseFaculty === normalize(selectedFacultyName);
      })
      .filter((row) => {
        if (inDemandFilter === "all") return true;
        const isInDemand = row?.course?.inDemand === true;
        return inDemandFilter === "true" ? isInDemand : !isInDemand;
      });
  }, [courses, marksMap, totalAps, addedSubjects, selectedFacultyId, selectedFacultyName, inDemandFilter]);

  return (
    <>
      {/* Welcome */}
      <section className="welcome">
        <h1>Welcome back!</h1>
        <p>Add your subject marks to calculate your APS score and discover your course options.</p>
      </section>

      {/* Grid */}
      <section className="grid">
        {/* Left: Subject Marks */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <BookOpen size={18} />
              <span>Your Subject Marks</span>
            </div>
          </div>

          <div className="card-body">
            <div className="subject-form">
              <div className="select-wrap">
                <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)}>
                  <option value="">Select a subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mark-wrap">
                <input
                  type="number"
                  placeholder="Mark %"
                  value={mark}
                  onChange={(e) => setMark(e.target.value)}
                  min={0}
                  max={100}
                />
              </div>

              <button className="add-btn" onClick={handleAddSubject}>
                <Plus size={16} />
                <span>Add</span>
              </button>
            </div>

            {addedSubjects.length === 0 ? (
              <div className="empty">No subjects added yet.</div>
            ) : (
              <div className="subject-list">
                {addedSubjects.map((s) => (
                  <div key={s.subjectId} className="subject-row">
                    <div className="subject-left">
                      <div className="subject-name">{s.subjectName}</div>
                      <div className="subject-sub">APS Points: {s.apsPoints}</div>
                    </div>

                    <div className="subject-right">
                      <div className="mark-edit">
                        <input
                          type="number"
                          value={s.mark}
                          min={0}
                          max={100}
                          onChange={(e) => handleMarkChange(s.subjectId, e.target.value)}
                        />
                        <span className="percent">%</span>
                      </div>

                      <button className="trash" onClick={() => handleDelete(s.subjectId)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="hint">
              {saveError ? (
                <span style={{ color: "#ef4444", fontWeight: 700 }}>Not saved: {saveError}</span>
              ) : saving ? (
                "Saving…"
              ) : (
                "Saved to your account ✓"
              )}
            </div>
          </div>
        </div>

        {/* Right: APS Score */}
        <div className="card">
          <div className="card-head aps-head">
            <div className="card-title">
              <Target size={18} />
              <span>Your APS Score For:</span>
            </div>

            <select
              className="uni-select"
              value={selectedUniversityId}
              onChange={(e) => setSelectedUniversityId(e.target.value)}
              disabled={universityOptions.length === 0}
            >
              {universityOptions.length === 0 ? (
                <option value="">Loading...</option>
              ) : (
                universityOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="card-body">
            <div className="aps-circle">
              <div className="aps-number">{totalAps}</div>
            </div>

            <div className="aps-caption">
              {selectedUniversity ? selectedUniversity.name : "Select a university"}
              <div style={{ fontSize: 12, marginTop: 6, color: "var(--muted)" }}>{uniAps.note}</div>

              {selectedUniversity?.name?.toLowerCase().includes("fort hare") && uniAps.eligible === false && (
                <div style={{ marginTop: 8, color: "#ef4444", fontWeight: 700 }}>
                  Life Orientation must be ≥ 50% for Fort Hare.
                </div>
              )}
            </div>

            <div className="assessment">
              <div className="assessment-title">
                <Target size={16} />
                <span>{assess.label}</span>
              </div>
              <div className="assessment-text">{assess.text}</div>
            </div>

            <div className="breakdown">
              <div className="breakdown-title">Score Breakdown:</div>
              <div className="breakdown-list">
                {addedSubjects.length === 0 ? (
                  <div className="breakdown-empty">No subjects yet.</div>
                ) : (
                  (uniAps.breakdown || []).map((s) => (
                    <div key={s.subjectId} className="break-item">
                      <span className="break-name">{s.subjectName}</span>
                      <span className="break-points">{s.uniPoints}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Course Recommendations */}
        <div className="card span-full">
          <div className="card-head">
            <div className="card-title">
              <GraduationCap size={18} />
              <span>Course Recommendations</span>
            </div>
          </div>

          <div className="card-body">
            <div
              className="qualify-row"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div className="qualify-title">Courses You Qualify For ({qualifyingCourses.length})</div>

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                {/* ✅ Faculty Filter */}
                <select
                  value={selectedFacultyId}
                  onChange={(e) => setSelectedFacultyId(e.target.value)}
                  style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e7eb" }}
                >
                  <option value="">All faculties</option>
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>

                {/* ✅ In Demand Filter */}
                <select
                  value={inDemandFilter}
                  onChange={(e) => setInDemandFilter(e.target.value)}
                  style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e7eb" }}
                >
                  <option value="all">All courses</option>
                  <option value="true">🔥 In demand</option>
                  <option value="false">Not in demand</option>
                </select>
              </div>
            </div>

            {coursesLoading ? (
              <div className="empty">Loading courses...</div>
            ) : coursesError ? (
              <div className="empty" style={{ color: "#ef4444", fontWeight: 700 }}>
                {coursesError}
              </div>
            ) : addedSubjects.length === 0 ? (
              <div className="empty">Add your marks to see course recommendations.</div>
            ) : qualifyingCourses.length === 0 ? (
              <div className="empty">No matches yet. Your APS or subject minimums don’t meet the requirements.</div>
            ) : (
              <div className="subject-list">
                {qualifyingCourses.map((row, idx) => (
                  <div key={idx} className="subject-row">
                    <div className="subject-left">
                      <div className="subject-name">
                        {row.course.name}{" "}
                        {row.course.inDemand === true && (
                          <span style={{ marginLeft: 8, color: "#f97316", fontWeight: 800 }}>🔥 In demand</span>
                        )}
                      </div>

                      <div className="subject-sub">
                        {row.course.faculty} • {row.course.years} years • Min APS {row.course.minAps}
                      </div>

                      <div className="subject-sub">{row.course.description}</div>

                      <div className="subject-sub" style={{ marginTop: 8 }}>
                        <strong>Requirements:</strong>{" "}
                        {row.requirements
                          .map((r) => {
                            if (r.subject) return `${r.subject} ≥ ${r.minPercentage}%`;
                            if (r.anyOf) {
                              const parts = r.anyOf.map((o) => `${o.subject} ≥ ${o.minPercentage}%`);
                              return `(${parts.join(" OR ")})`;
                            }
                            return "";
                          })
                          .filter(Boolean)
                          .join(" + ")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
