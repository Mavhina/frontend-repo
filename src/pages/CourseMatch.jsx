import React, { useEffect, useMemo, useState, useRef } from "react";
import api from "../services/api";
import { 
  RotateCcw, ArrowRight, ChevronRight, Sparkles, Star, Check, 
  MapPin, GraduationCap, Briefcase, TrendingUp, Info, School,
  Heart, Users, Lightbulb, Target, Award, BookOpen
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   TRAIT SYSTEM - Simplified for Grade 12 students
═══════════════════════════════════════════════════════════════ */
const TRAITS = [
  "NUMBERS", "PEOPLE", "TECH", "LOGISTICS", "CREATIVE",
  "LEADERSHIP", "HEALTH_CARE", "ENGINEERING", "LAW_JUSTICE",
  "TEACHING", "SCIENCE_LAB", "OUTDOORS",
];

const TRAIT_LABELS = {
  NUMBERS: "Working with Numbers & Money",
  PEOPLE: "Helping & Understanding People", 
  TECH: "Technology & Computers",
  LOGISTICS: "Planning & Organising Things",
  CREATIVE: "Being Creative & Artistic",
  LEADERSHIP: "Leading & Making Decisions",
  HEALTH_CARE: "Health, Nursing & Medicine",
  ENGINEERING: "Building, Fixing & Making Things",
  LAW_JUSTICE: "Justice, Law & Protecting People",
  TEACHING: "Teaching & Helping Others Learn",
  SCIENCE_LAB: "Science, Research & Discovery",
  OUTDOORS: "Nature, Animals & Working Outside",
};

const TRAIT_ICONS = {
  NUMBERS: "💰", PEOPLE: "🤝", TECH: "💻", LOGISTICS: "📋", CREATIVE: "🎨",
  LEADERSHIP: "⭐", HEALTH_CARE: "🏥", ENGINEERING: "🔧", LAW_JUSTICE: "⚖️",
  TEACHING: "📚", SCIENCE_LAB: "🔬", OUTDOORS: "🌾",
};

const TRAIT_COLORS = {
  NUMBERS: "#f59e0b", PEOPLE: "#ec4899", TECH: "#06b6d4", LOGISTICS: "#8b5cf6", 
  CREATIVE: "#f43f5e", LEADERSHIP: "#f97316", HEALTH_CARE: "#ef4444", 
  ENGINEERING: "#6366f1", LAW_JUSTICE: "#1e40af", TEACHING: "#10b981", 
  SCIENCE_LAB: "#22c55e", OUTDOORS: "#84cc16",
};

/* ═══════════════════════════════════════════════════════════════
   QUIZ SECTIONS - Grade 12 real-life questions (Rural & Urban friendly)
═══════════════════════════════════════════════════════════════ */
const QUIZ_SECTIONS = [
  {
    id: "school", label: "At School", icon: "📖", color: "#f59e0b",
    intro: "Let's talk about your school day and what you enjoy...",
    questions: [
      {
        q: "Which subject do you actually enjoy going to?",
        options: [
          { text: "Maths, Accounting or Business Studies", add: { NUMBERS: 3, LEADERSHIP: 1 } },
          { text: "Life Sciences, Physical Sciences or Agricultural Science", add: { SCIENCE_LAB: 3, HEALTH_CARE: 1, OUTDOORS: 1 } },
          { text: "English, History or Life Orientation", add: { PEOPLE: 2, LAW_JUSTICE: 1, TEACHING: 1 } },
          { text: "IT, Computer Applications or Technology", add: { TECH: 3, ENGINEERING: 1 } },
          { text: "Art, Music, Design or Dramatic Arts", add: { CREATIVE: 3, PEOPLE: 1 } },
          { text: "Geography, Tourism or Hospitality", add: { OUTDOORS: 2, PEOPLE: 2, CREATIVE: 1 } },
        ],
      },
      {
        q: "When the teacher gives group work, what do you usually do?",
        options: [
          { text: "I organise everyone and make sure we finish on time", add: { LEADERSHIP: 3, LOGISTICS: 2 } },
          { text: "I do the research and find all the information", add: { SCIENCE_LAB: 2, TEACHING: 1 } },
          { text: "I make the poster, slides or make it look nice", add: { CREATIVE: 3 } },
          { text: "I present to the class and speak for the group", add: { PEOPLE: 3, LEADERSHIP: 1 } },
          { text: "I check the facts and fix mistakes", add: { NUMBERS: 2, SCIENCE_LAB: 1 } },
          { text: "I come up with the main idea or solution", add: { CREATIVE: 2, LEADERSHIP: 2 } },
        ],
      },
      {
        q: "If you have a free period with nothing to do, you usually...",
        options: [
          { text: "Help a friend who is struggling with schoolwork", add: { TEACHING: 3, PEOPLE: 2 } },
          { text: "Use my phone or play with apps and games", add: { TECH: 3 } },
          { text: "Chat with friends and hang out", add: { PEOPLE: 3 } },
          { text: "Draw, write stories or create something", add: { CREATIVE: 3 } },
          { text: "Read ahead or study more", add: { SCIENCE_LAB: 2, NUMBERS: 1 } },
          { text: "Plan my week or organise my things", add: { LOGISTICS: 3, LEADERSHIP: 1 } },
        ],
      },
    ],
  },
  {
    id: "personality", label: "Who You Are", icon: "🧠", color: "#8b5cf6",
    intro: "Be honest — what describes you best?",
    questions: [
      {
        q: "Your friends and family would say you are...",
        options: [
          { text: "Reliable — I'm always on time and keep my promises", add: { LOGISTICS: 2, LEADERSHIP: 1 } },
          { text: "Smart — I usually know the answers", add: { SCIENCE_LAB: 2, NUMBERS: 1 } },
          { text: "Creative — I always have new ideas", add: { CREATIVE: 3 } },
          { text: "Caring — I always check on people and help them", add: { PEOPLE: 3, HEALTH_CARE: 2 } },
          { text: "Good with technology — I fix phones and computers", add: { TECH: 3 } },
          { text: "A leader — people listen to me", add: { LEADERSHIP: 3 } },
        ],
      },
      {
        q: "When something unfair happens to someone you know, you...",
        options: [
          { text: "Speak up immediately — someone must say something", add: { LAW_JUSTICE: 3, LEADERSHIP: 1 } },
          { text: "Comfort the person and make sure they are okay", add: { PEOPLE: 3, HEALTH_CARE: 1 } },
          { text: "Think about what should have happened differently", add: { LAW_JUSTICE: 2, SCIENCE_LAB: 1 } },
          { text: "Make a plan to help fix the situation", add: { LOGISTICS: 2, LEADERSHIP: 2 } },
          { text: "Talk about it or tell others what happened", add: { CREATIVE: 2, PEOPLE: 1 } },
          { text: "Ask questions to understand what really happened", add: { SCIENCE_LAB: 2, LAW_JUSTICE: 1 } },
        ],
      },
      {
        q: "Which of these makes you feel most happy?",
        options: [
          { text: "Helping someone solve their problem", add: { PEOPLE: 3, TEACHING: 2 } },
          { text: "Finishing a drawing, story or creative project", add: { CREATIVE: 3 } },
          { text: "Understanding something difficult", add: { SCIENCE_LAB: 2, NUMBERS: 2 } },
          { text: "Organising a messy room or planning an event", add: { LOGISTICS: 3, LEADERSHIP: 1 } },
          { text: "Fixing something that was broken", add: { ENGINEERING: 3, TECH: 1 } },
          { text: "Spending time outside in nature", add: { OUTDOORS: 3 } },
        ],
      },
    ],
  },
  {
    id: "home", label: "At Home", icon: "🏠", color: "#06b6d4",
    intro: "What do you do when you're at home?",
    questions: [
      {
        q: "On a Saturday at home, you are most likely...",
        options: [
          { text: "On my phone, laptop or playing video games", add: { TECH: 3 } },
          { text: "Drawing, writing, making music or creating content", add: { CREATIVE: 3 } },
          { text: "Visiting friends or family, or chatting on WhatsApp", add: { PEOPLE: 3 } },
          { text: "Helping at home — cooking, cleaning or fixing things", add: { ENGINEERING: 2, LOGISTICS: 1, HEALTH_CARE: 1 } },
          { text: "Outside — playing sport, working in the garden or with animals", add: { OUTDOORS: 3 } },
          { text: "Reading, watching educational videos or learning new things", add: { SCIENCE_LAB: 2, TEACHING: 1 } },
        ],
      },
      {
        q: "If you had R500 to spend on yourself, you would buy...",
        options: [
          { text: "Airtime, data or a new app/game", add: { TECH: 3 } },
          { text: "Art supplies, a camera or something to be creative", add: { CREATIVE: 3 } },
          { text: "Food and fun with friends or family", add: { PEOPLE: 3, CREATIVE: 1 } },
          { text: "Save it or buy something useful for the future", add: { NUMBERS: 3, LOGISTICS: 1 } },
          { text: "Something for gardening, farming or outdoor work", add: { OUTDOORS: 3 } },
          { text: "Books, study guides or something to help with school", add: { TEACHING: 2, SCIENCE_LAB: 1 } },
        ],
      },
      {
        q: "What kind of TV shows or videos do you enjoy watching?",
        options: [
          { text: "Technology, gaming and how things work", add: { TECH: 3 } },
          { text: "Health, fitness and taking care of yourself", add: { HEALTH_CARE: 3 } },
          { text: "Crime stories, police work and justice", add: { LAW_JUSTICE: 3 } },
          { text: "Fashion, art, design and creative things", add: { CREATIVE: 3 } },
          { text: "Business, money and successful people", add: { NUMBERS: 2, LEADERSHIP: 1 } },
          { text: "Nature, animals, farming and science", add: { OUTDOORS: 2, SCIENCE_LAB: 2 } },
        ],
      },
    ],
  },
  {
    id: "skills", label: "Your Strengths", icon: "⚡", color: "#22c55e",
    intro: "What are you naturally good at?",
    questions: [
      {
        q: "When someone needs help, what do you usually help with?",
        options: [
          { text: "Explaining schoolwork they don't understand", add: { TEACHING: 3, PEOPLE: 1 } },
          { text: "Making them feel better when they are sad", add: { PEOPLE: 3, HEALTH_CARE: 2 } },
          { text: "Fixing their phone, computer or something broken", add: { ENGINEERING: 2, TECH: 2 } },
          { text: "Creating something for them — a drawing, design or poster", add: { CREATIVE: 3 } },
          { text: "Making a plan so they can solve their own problem", add: { LOGISTICS: 3, LEADERSHIP: 1 } },
          { text: "Finding information or doing research for them", add: { SCIENCE_LAB: 2, NUMBERS: 1 } },
        ],
      },
      {
        q: "What do people often ask you to help them with?",
        options: [
          { text: "Maths homework or working with numbers", add: { NUMBERS: 3 } },
          { text: "Technology — fixing phones, apps or computers", add: { TECH: 3 } },
          { text: "Advice when they have problems or are stressed", add: { PEOPLE: 3, HEALTH_CARE: 1 } },
          { text: "Making things look nice — posters, designs, hair, clothes", add: { CREATIVE: 3 } },
          { text: "Planning events, parties or organising things", add: { LOGISTICS: 3, LEADERSHIP: 1 } },
          { text: "Speaking up for them or handling arguments", add: { LAW_JUSTICE: 2, LEADERSHIP: 2 } },
        ],
      },
      {
        q: "What kind of problem do you actually enjoy solving?",
        options: [
          { text: "A maths sum or puzzle with a clear answer", add: { NUMBERS: 3, SCIENCE_LAB: 1 } },
          { text: "A fight or disagreement between people", add: { PEOPLE: 3, LAW_JUSTICE: 1 } },
          { text: "A broken machine, phone or system", add: { ENGINEERING: 3, TECH: 1 } },
          { text: "A creative challenge with no right answer", add: { CREATIVE: 3 } },
          { text: "A science question or research problem", add: { SCIENCE_LAB: 3 } },
          { text: "A messy situation that needs organisation", add: { LOGISTICS: 3, LEADERSHIP: 2 } },
        ],
      },
    ],
  },
  {
    id: "future", label: "Your Future", icon: "🌟", color: "#f43f5e",
    intro: "Let's dream about your future...",
    questions: [
      {
        q: "In 10 years, what would make you feel successful?",
        options: [
          { text: "Running my own business or being my own boss", add: { LEADERSHIP: 3, NUMBERS: 2 } },
          { text: "Helping sick people get better", add: { HEALTH_CARE: 3, PEOPLE: 2 } },
          { text: "Building or creating something many people use", add: { TECH: 2, ENGINEERING: 2, CREATIVE: 1 } },
          { text: "Winning a court case or helping someone get justice", add: { LAW_JUSTICE: 3, PEOPLE: 1 } },
          { text: "Teaching young people and changing their lives", add: { TEACHING: 3, PEOPLE: 2 } },
          { text: "Making a difference in science, farming or the environment", add: { SCIENCE_LAB: 3, OUTDOORS: 2 } },
        ],
      },
      {
        q: "Where would you like to work one day?",
        options: [
          { text: "In an office with targets and financial goals", add: { NUMBERS: 2, LEADERSHIP: 1 } },
          { text: "In a hospital, clinic or community health centre", add: { HEALTH_CARE: 3 } },
          { text: "In a school, college or training centre", add: { TEACHING: 3 } },
          { text: "In a studio, working for myself or from home", add: { CREATIVE: 3 } },
          { text: "Outside, on a farm, in nature or working with my hands", add: { OUTDOORS: 2, ENGINEERING: 1 } },
          { text: "Anywhere with a computer — remote and flexible", add: { TECH: 3 } },
        ],
      },
      {
        q: "Which job would you be most proud to tell your family about?",
        options: [
          { text: "Doctor, nurse, pharmacist or health worker", add: { HEALTH_CARE: 3, SCIENCE_LAB: 1 } },
          { text: "Software developer, IT specialist or data scientist", add: { TECH: 3 } },
          { text: "Lawyer, police officer or detective", add: { LAW_JUSTICE: 3 } },
          { text: "Teacher, social worker or counsellor", add: { TEACHER: 3, PEOPLE: 2 } },
          { text: "Business owner, manager or entrepreneur", add: { LEADERSHIP: 3, NUMBERS: 1 } },
          { text: "Engineer, architect or designer", add: { ENGINEERING: 2, CREATIVE: 2, TECH: 1 } },
        ],
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   COURSE MATCHING - Keywords for matching traits to courses
═══════════════════════════════════════════════════════════════ */
const TRAIT_KEYWORDS = {
  NUMBERS:     ["account","finance","econom","tax","audit","bank","investment","actuari","financial","bcom","chartered","commerce","business science","cost","management accounting"],
  TECH:        ["computer","software","information system","information management","technology","cybersecurity","artificial intelligence","data science","programming","it management","informatics","data analytics","software engineering"],
  PEOPLE:      ["human resource","people management","psychology","counselling","community","public management","social work","development","communication","industrial psychology","sociology","anthropology"],
  LOGISTICS:   ["logistics","transport","supply chain","operations","warehouse","procurement","operations management"],
  CREATIVE:    ["marketing","tourism","hospitality","media","design","brand","communication","entrepreneur","advertising","fashion","multimedia","visual arts","film","journalism","public relations"],
  LEADERSHIP:  ["business management","management","governance","entrepreneur","leadership","public administration","strategic","commerce","general management"],
  HEALTH_CARE: ["nursing","health","medical","clinical","pharmacy","physio","radiography","occupational therapy","dietetics","midwifery","dental","optometry","speech","medicine","biokinetics","sports science"],
  ENGINEERING: ["engineering","civil","mechanical","electrical","mechatronics","construction","structural","chemical engineering","mining engineering","industrial engineering","aeronautical","marine engineering"],
  LAW_JUSTICE: ["law","legal","justice","forensic","criminology","policing","paralegal","llb","criminal","correctional"],
  TEACHING:    ["education","teaching","teacher","foundation phase","intermediate phase","early childhood","bed","pgce","curriculum","fet","senior phase"],
  SCIENCE_LAB: ["science","biology","chemistry","physics","laboratory","biotech","environmental science","biochemistry","microbiology","zoology","botany","geology","biomedical","biotechnology"],
  OUTDOORS:    ["agriculture","conservation","environment","nature","wildlife","forestry","marine","game","horticulture","veterinary","animal science","crop","soil","fisheries","ecology"],
};

/* ═══════════════════════════════════════════════════════════════
   CAREER PATHWAYS - Alternative routes for each trait
═══════════════════════════════════════════════════════════════ */
const CAREER_PATHWAYS = {
  NUMBERS: {
    university: ["BCom Accounting", "BCom Finance", "BCom Economics", "Actuarial Science"],
    college: ["Diploma in Financial Management", "Diploma in Accounting", "Bookkeeping Certificate"],
    workplace: ["Bank teller", "Sales assistant", "Admin clerk", "Cashier"],
    aps: "30-40+ depending on university"
  },
  PEOPLE: {
    university: ["BA Psychology", "BSW Social Work", "BA Human Resource Management"],
    college: ["Diploma in Human Resource Management", "Diploma in Counselling", "Community Development"],
    workplace: ["Call centre agent", "Receptionist", "Customer service", "Retail assistant"],
    aps: "24-35+ depending on university"
  },
  TECH: {
    university: ["BSc Computer Science", "BSc IT", "Software Engineering", "Data Science"],
    college: ["Diploma in IT", "Diploma in Software Development", "IT Technician Certificate"],
    workplace: ["IT support", "Phone repair shop", "Data capturer", "Digital assistant"],
    aps: "30-42+ depending on university"
  },
  LOGISTICS: {
    university: ["BCom Logistics", "BCom Supply Chain Management", "Operations Management"],
    college: ["Diploma in Logistics", "Diploma in Transport Management", "Warehouse Management"],
    workplace: ["Warehouse assistant", "Delivery driver", "Stock controller", "Procurement clerk"],
    aps: "24-35+ depending on university"
  },
  CREATIVE: {
    university: ["BA Visual Arts", "BA Media Studies", "BCom Marketing", "Graphic Design"],
    college: ["Diploma in Marketing", "Diploma in Design", "Hospitality Management"],
    workplace: ["Social media assistant", "Content creator", "Waiter/Waitress in hospitality", "Sales promoter"],
    aps: "24-35+ depending on university"
  },
  LEADERSHIP: {
    university: ["BCom Business Management", "BA Public Administration", "BCom Entrepreneurship"],
    college: ["Diploma in Business Management", "Diploma in Public Management", "Management Assistant"],
    workplace: ["Team leader", "Supervisor", "Small business owner", "Sales representative"],
    aps: "24-38+ depending on university"
  },
  HEALTH_CARE: {
    university: ["MBChB Medicine", "B Nursing", "B Pharmacy", "Physiotherapy", "Occupational Therapy"],
    college: ["Diploma in Nursing", "Emergency Medical Care", "Community Health Work"],
    workplace: ["Healthcare assistant", "Caregiver", "Pharmacy assistant", "Clinic receptionist"],
    aps: "30-45+ depending on course (Medicine needs 40+)"
  },
  ENGINEERING: {
    university: ["BEng Civil Engineering", "BEng Mechanical", "BEng Electrical", "BEng Chemical"],
    college: ["Diploma in Engineering", "Millwright", "Electrician", "Fitting and Turning"],
    workplace: ["Apprentice", "Construction worker", "Mechanic assistant", "Electrician assistant"],
    aps: "32-42+ depending on engineering type"
  },
  LAW_JUSTICE: {
    university: ["LLB Law", "BA Criminology", "BA Policing", "Forensic Science"],
    college: ["Diploma in Policing", "Diploma in Paralegal Studies", "Traffic Officer"],
    workplace: ["Security officer", "Police reservist", "Court orderly", "Legal secretary"],
    aps: "30-40+ depending on course"
  },
  TEACHING: {
    university: ["BEd Foundation Phase", "BEd Intermediate Phase", "BEd Senior Phase"],
    college: ["Diploma in Grade R Teaching", "ECD (Early Childhood Development)", "ABET Teaching"],
    workplace: ["Teacher assistant", "Aftercare supervisor", "Tutor", "Day care helper"],
    aps: "24-35+ depending on university"
  },
  SCIENCE_LAB: {
    university: ["BSc Biochemistry", "BSc Microbiology", "BSc Chemistry", "BSc Biotechnology"],
    college: ["Laboratory Technician", "Diploma in Biotechnology", "Analytical Chemistry"],
    workplace: ["Lab assistant", "Quality control assistant", "Research assistant", "Science tutor"],
    aps: "30-40+ depending on university"
  },
  OUTDOORS: {
    university: ["BSc Agriculture", "BSc Conservation", "BSc Environmental Science", "Veterinary Science"],
    college: ["Diploma in Agriculture", "Game Ranch Management", "Horticulture", "Animal Health"],
    workplace: ["Farm worker", "Game reserve guide", "Landscaping", "Veterinary assistant"],
    aps: "24-38+ depending on course"
  },
};

function emptyScores() { return TRAITS.reduce((a, t) => ({ ...a, [t]: 0 }), {}); }
function addScores(prev, addObj) {
  const next = { ...prev };
  for (const [k, v] of Object.entries(addObj || {})) next[k] = (next[k] || 0) + Number(v || 0);
  return next;
}
function topTraits(scores, n = 4) {
  return Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);
}
function scoreForCourse(course, traits) {
  const text = `${course?.name || ""} ${course?.description || ""}`.toLowerCase();
  let pts = 0;
  for (const t of traits) {
    const keys = TRAIT_KEYWORDS[t] || [];
    if (keys.some(k => text.includes(k))) pts += 1;
  }
  if (course?.inDemand) pts += 0.5;
  return Math.min(100, Math.round((pts / traits.length) * 100));
}

/* ═══════════════════════════════════════════════════════════════
   PERSONALITY PROFILES - Based on top 2 traits
═══════════════════════════════════════════════════════════════ */
function getPersonalityProfile(traits) {
  const [t1, t2] = traits;
  const profiles = {
    NUMBERS_LEADERSHIP:      { name: "The Future Business Owner",   emoji: "🚀", desc: "You have a good head for numbers and the confidence to lead. You would do well in business, finance, or even starting your own company one day." },
    NUMBERS_TECH:            { name: "The Data & Tech Thinker",        emoji: "📊", desc: "You like working with numbers AND technology. This is perfect for careers in data science, financial technology (fintech), or software development." },
    NUMBERS_SCIENCE_LAB:     { name: "The Research Mind",        emoji: "🔬", desc: "You enjoy finding answers through careful thinking. You would be great at research, economics, or working as an actuary." },
    HEALTH_CARE_PEOPLE:      { name: "The Caring Helper",   emoji: "🩺", desc: "You genuinely care about people and want to help them feel better. Nursing, medicine, social work or counselling could be perfect for you." },
    HEALTH_CARE_SCIENCE_LAB: { name: "The Medical Scientist",           emoji: "💊", desc: "You are interested in science AND helping people. This could lead you to pharmacy, medical lab work, or becoming a doctor." },
    TECH_ENGINEERING:        { name: "The Builder & Fixer",                emoji: "⚙️", desc: "You like to create and fix things that work. Software development, engineering, or IT support could be your path." },
    TECH_CREATIVE:           { name: "The Digital Creator",       emoji: "🎨", desc: "You combine tech skills with creativity. Web design, digital marketing, or multimedia could be perfect for you." },
    CREATIVE_PEOPLE:         { name: "The Creative Communicator",           emoji: "📣", desc: "You are creative and good with people. Marketing, media, public relations, or teaching could be great for you." },
    LAW_JUSTICE_PEOPLE:      { name: "The Fair Speaker",               emoji: "⚖️", desc: "You stand up for what is right and you are good with people. Law, criminology, or community work could be your calling." },
    TEACHING_PEOPLE:         { name: "The Natural Teacher",                 emoji: "📚", desc: "You enjoy helping others learn and grow. Teaching, training, or youth work would be very meaningful for you." },
    SCIENCE_LAB_OUTDOORS:    { name: "The Nature Scientist",               emoji: "🌿", desc: "You love science and the natural world. Environmental science, agriculture, or veterinary science could suit you." },
    ENGINEERING_TECH:        { name: "The Problem Solver",              emoji: "💡", desc: "You love building, fixing, and solving problems. Any type of engineering or computer science would be a good fit." },
    OUTDOORS_SCIENCE_LAB:    { name: "The Earth Protector",             emoji: "🌍", desc: "You care about nature and want to protect it. Conservation, agriculture, or environmental science could be your path." },
    LEADERSHIP_PEOPLE:       { name: "The Community Leader",            emoji: "✨", desc: "You lead with heart and bring people together. Management, public service, or starting a community project could suit you." },
    NUMBERS_LOGISTICS:       { name: "The Organised Planner", emoji: "📋", desc: "You are good with numbers and love organising. Supply chain management, logistics, or operations could be perfect." },
    PEOPLE_CREATIVIVE:       { name: "The People Person", emoji: "💝", desc: "You connect well with others and have a creative side. Human resources, counselling, or creative industries could work for you." },
  };
  const key1 = `${t1}_${t2}`;
  const key2 = `${t2}_${t1}`;
  return profiles[key1] || profiles[key2] || {
    emoji: "🌟",
    name: "The Well-Rounded Student",
    desc: `Your strengths in ${TRAIT_LABELS[t1] || t1} and ${TRAIT_LABELS[t2] || t2} mean you have many options. Explore courses where these two areas come together.`,
  };
}

/* ═══════════════════════════════════════════════════════════════
   STYLES - Clean, modern, accessible design
═══════════════════════════════════════════════════════════════ */
const CSS = `
  .cm {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    background: linear-gradient(135deg, #f8f9fc 0%, #f0f4ff 100%);
    min-height: 100vh;
    color: #1a1a2e;
  }
  .cm *, .cm *::before, .cm *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .cm-wrap { max-width: 900px; margin: 0 auto; padding: 24px 20px 80px; }

  /* ── PAGE HEADER ── */
  .cm-page-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 20px; gap: 16px; flex-wrap: wrap;
    background: white;
    padding: 20px 24px;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .cm-page-title { font-size: 24px; font-weight: 800; color: #1a1a2e; letter-spacing: -0.5px; }
  .cm-page-title span { color: #6366f1; }
  .cm-page-sub { font-size: 14px; color: #6b7280; margin-top: 4px; }
  .cm-header-controls { display: flex; gap: 10px; align-items: center; flex-shrink: 0; }

  .cm-uni-select {
    background: #f9fafb; border: 1.5px solid #e5e7eb; color: #374151;
    padding: 10px 16px; border-radius: 10px; font-size: 14px;
    font-family: inherit; cursor: pointer; outline: none;
    min-width: 200px;
    transition: all 0.2s;
  }
  .cm-uni-select:focus { border-color: #6366f1; background: white; }

  .cm-restart-btn {
    display: flex; align-items: center; gap: 6px;
    background: white; border: 1.5px solid #e5e7eb; color: #6b7280;
    padding: 10px 16px; border-radius: 10px; font-size: 13px;
    font-family: inherit; cursor: pointer;
    transition: all 0.2s;
  }
  .cm-restart-btn:hover { border-color: #6366f1; color: #6366f1; }

  /* ── PROGRESS ── */
  .cm-progress-wrap { 
    margin-bottom: 24px; 
    background: white;
    padding: 20px 24px;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .cm-progress-top {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;
  }
  .cm-progress-label { font-size: 14px; font-weight: 600; color: #374151; }
  .cm-progress-pct { font-size: 13px; color: #6366f1; font-weight: 700; }
  .cm-progress-track { height: 8px; background: #e5e7eb; border-radius: 10px; overflow: hidden; }
  .cm-progress-fill {
    height: 100%; border-radius: 10px;
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
    transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
  }
  .cm-section-tabs { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
  .cm-section-tab {
    display: flex; align-items: center; gap: 5px;
    padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 500;
    background: #f3f4f6; color: #9ca3af; border: 1.5px solid transparent;
    transition: all 0.2s; white-space: nowrap;
  }
  .cm-section-tab.active { background: #eef2ff; color: #6366f1; border-color: #c7d2fe; }
  .cm-section-tab.done  { background: #dcfce7; color: #16a34a; border-color: #86efac; }

  /* ── CARD ── */
  .cm-card {
    background: #fff; 
    border: 1px solid #e5e7eb;
    border-radius: 20px; 
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    overflow: hidden;
  }

  /* ── WELCOME ── */
  .cm-welcome { padding: 48px 40px; }
  @media(max-width:600px){ .cm-welcome{ padding:32px 24px; } }

  .cm-welcome-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6); 
    color: white;
    font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 100px;
    margin-bottom: 24px;
  }
  .cm-welcome-h1 {
    font-size: clamp(28px,5vw,42px); font-weight: 800; letter-spacing: -1px;
    line-height: 1.1; color: #1a1a2e; margin-bottom: 16px;
  }
  .cm-welcome-h1 span { 
    background: linear-gradient(135deg, #6366f1, #ec4899); 
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .cm-welcome-sub {
    font-size: 16px; color: #6b7280; line-height: 1.7;
    margin-bottom: 36px; max-width: 560px;
  }
  .cm-how-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 36px;
  }
  @media(max-width:600px){ .cm-how-grid{ grid-template-columns:1fr; } }
  .cm-how-item {
    background: #f9fafb; border: 1.5px solid #f3f4f6;
    border-radius: 14px; padding: 18px; display: flex; gap: 14px; align-items: flex-start;
    transition: all 0.2s;
  }
  .cm-how-item:hover { border-color: #c7d2fe; background: #eef2ff; }
  .cm-how-num {
    width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0;
    background: linear-gradient(135deg, #6366f1, #8b5cf6); 
    color: white;
    font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center;
  }
  .cm-how-title { font-size: 14px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
  .cm-how-desc  { font-size: 13px; color: #6b7280; line-height: 1.5; }

  .cm-cta {
    width: 100%; padding: 18px 28px; border-radius: 14px; border: none;
    background: linear-gradient(135deg, #6366f1, #8b5cf6); 
    color: #fff; font-size: 16px; font-weight: 700;
    font-family: inherit; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: all 0.3s; 
    box-shadow: 0 8px 24px rgba(99,102,241,0.35);
    letter-spacing: -0.2px;
  }
  .cm-cta:hover { 
    transform: translateY(-2px); 
    box-shadow: 0 12px 32px rgba(99,102,241,0.45); 
  }

  /* ── QUIZ ── */
  .cm-question-card { padding: 40px; }
  @media(max-width:600px){ .cm-question-card{ padding:28px 24px; } }

  .cm-question-meta {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;
  }
  .cm-section-label {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;
  }
  .cm-section-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .cm-q-pips { display: flex; gap: 6px; }
  .cm-pip { width: 8px; height: 8px; border-radius: 50%; background: #e5e7eb; transition: all 0.3s; }
  .cm-pip.done   { background: #22c55e; }
  .cm-pip.active { background: #6366f1; width: 20px; border-radius: 4px; }

  .cm-section-intro { 
    font-size: 14px; color: #9ca3af; 
    margin: 10px 0 18px; 
    font-style: italic;
  }
  .cm-question-text {
    font-size: clamp(20px,3.5vw,26px); font-weight: 700; color: #1a1a2e;
    letter-spacing: -0.4px; line-height: 1.35; margin-bottom: 28px;
  }

  /* options */
  .cm-options { display: flex; flex-direction: column; gap: 10px; }
  .cm-option {
    background: #f9fafb; border: 2px solid #f3f4f6; border-radius: 14px;
    padding: 16px 20px; display: flex; align-items: center; gap: 14px;
    cursor: pointer; transition: all 0.2s; text-align: left;
    color: #374151; font-family: inherit; font-size: 15px; font-weight: 400; width: 100%;
  }
  .cm-option:hover   { 
    background: #eef2ff; 
    border-color: #c7d2fe; 
    color: #1a1a2e; 
    transform: translateX(4px);
  }
  .cm-option.selected{ 
    background: linear-gradient(135deg, #eef2ff, #faf5ff); 
    border-color: #6366f1; 
    color: #1a1a2e; 
  }
  .cm-option:disabled{ opacity: 0.7; cursor: not-allowed; }

  .cm-opt-letter {
    width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0;
    border: 2px solid #e5e7eb; color: #9ca3af;
    font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .cm-option:hover    .cm-opt-letter { border-color: #6366f1; color: #6366f1; background: #fff; }
  .cm-option.selected .cm-opt-letter { 
    border-color: #6366f1; 
    background: linear-gradient(135deg, #6366f1, #8b5cf6); 
    color: #fff; 
  }
  .cm-opt-text  { flex: 1; line-height: 1.5; }
  .cm-opt-arrow { color: #d1d5db; flex-shrink: 0; transition: color 0.2s; }
  .cm-option:hover .cm-opt-arrow { color: #6366f1; }

  /* ── RESULTS ── */
  .cm-results-header {
    padding: 36px 40px 28px; 
    border-bottom: 1px solid #f3f4f6;
    background: linear-gradient(135deg, #fef3c7 0%, #fff7ed 100%);
  }
  @media(max-width:600px){ .cm-results-header{ padding:28px 24px 24px; } }

  .cm-results-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: white; border: 1.5px solid #fbbf24; color: #d97706;
    font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 100px; margin-bottom: 16px;
  }
  .cm-results-h {
    font-size: clamp(24px,4vw,32px); font-weight: 800; letter-spacing: -0.8px;
    color: #1a1a2e; margin-bottom: 8px;
  }
  .cm-results-sub { font-size: 15px; color: #6b7280; line-height: 1.6; }

  /* personality */
  .cm-personality { padding: 32px 40px; border-bottom: 1px solid #f3f4f6; }
  @media(max-width:600px){ .cm-personality{ padding:24px; } }

  .cm-personality-inner {
    background: linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%);
    border: 2px solid #e0e7ff; border-radius: 16px; padding: 28px; margin-bottom: 24px;
  }
  .cm-personality-label {
    font-size: 12px; font-weight: 700; color: #9ca3af;
    text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;
  }
  .cm-personality-name-row { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
  .cm-personality-emoji  { font-size: 40px; line-height: 1; }
  .cm-personality-name   { font-size: 26px; font-weight: 800; color: #1a1a2e; letter-spacing: -0.5px; }
  .cm-personality-desc   { font-size: 15px; color: #4b5563; line-height: 1.7; }

  .cm-trait-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  @media(max-width:500px){ .cm-trait-grid{ grid-template-columns:1fr; } }
  .cm-trait-chip {
    background: #fff; border: 1.5px solid #e5e7eb; border-radius: 12px;
    padding: 14px 16px; display: flex; align-items: center; gap: 12px;
    transition: all 0.2s;
  }
  .cm-trait-chip:hover { border-color: #c7d2fe; }
  .cm-trait-emoji       { font-size: 24px; line-height: 1; }
  .cm-trait-body        { flex: 1; min-width: 0; }
  .cm-trait-name        { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
  .cm-trait-bar-track   { height: 6px; background: #f3f4f6; border-radius: 6px; overflow: hidden; }
  .cm-trait-bar-fill    { 
    height: 100%; border-radius: 6px; 
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899); 
    transition: width 0.5s ease;
  }

  /* career pathways */
  .cm-pathways-section { 
    padding: 32px 40px; 
    border-bottom: 1px solid #f3f4f6;
    background: #f9fafb;
  }
  @media(max-width:600px){ .cm-pathways-section{ padding:24px; } }

  .cm-pathways-title {
    font-size: 18px; font-weight: 700; color: #1a1a2e;
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 20px;
  }
  .cm-pathways-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
  }
  @media(max-width:800px){ .cm-pathways-grid{ grid-template-columns:1fr; } }
  
  .cm-pathway-card {
    background: white;
    border: 1.5px solid #e5e7eb;
    border-radius: 14px;
    padding: 20px;
    transition: all 0.2s;
  }
  .cm-pathway-card:hover { border-color: #c7d2fe; box-shadow: 0 4px 16px rgba(99,102,241,0.1); }
  
  .cm-pathway-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 14px;
  }
  .cm-pathway-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .cm-pathway-icon.uni { background: #eef2ff; }
  .cm-pathway-icon.college { background: #fef3c7; }
  .cm-pathway-icon.work { background: #dcfce7; }
  
  .cm-pathway-name {
    font-size: 14px; font-weight: 700; color: #1a1a2e;
  }
  
  .cm-pathway-list {
    list-style: none;
    margin-bottom: 12px;
  }
  .cm-pathway-list li {
    font-size: 13px;
    color: #6b7280;
    padding: 4px 0;
    padding-left: 16px;
    position: relative;
  }
  .cm-pathway-list li::before {
    content: "•";
    position: absolute;
    left: 0;
    color: #6366f1;
    font-weight: bold;
  }
  
  .cm-pathway-aps {
    font-size: 12px;
    color: #9ca3af;
    font-style: italic;
    padding-top: 10px;
    border-top: 1px solid #f3f4f6;
  }

  /* courses */
  .cm-courses-section { padding: 32px 40px 40px; }
  @media(max-width:600px){ .cm-courses-section{ padding:24px; } }

  .cm-courses-header-row {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;
  }
  .cm-courses-title { font-size: 18px; font-weight: 700; color: #1a1a2e; }
  .cm-courses-count { font-size: 14px; color: #9ca3af; }

  .cm-courses-list { display: flex; flex-direction: column; gap: 12px; }

  .cm-course-card {
    border: 2px solid #f3f4f6; border-radius: 16px;
    padding: 22px 24px; display: flex; align-items: flex-start; gap: 18px;
    transition: all 0.2s; position: relative; overflow: hidden; background: #fff;
  }
  .cm-course-card::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
    border-radius: 4px 0 0 4px;
    background: linear-gradient(180deg, #6366f1, #8b5cf6);
    opacity: 0; transition: opacity 0.2s;
  }
  .cm-course-card:hover { 
    border-color: #e0e7ff; 
    box-shadow: 0 4px 20px rgba(99,102,241,0.12); 
    transform: translateY(-2px);
  }
  .cm-course-card:hover::before { opacity: 1; }
  .cm-course-card.top  { border-color: #e0e7ff; background: linear-gradient(135deg, #fff, #faf5ff); }
  .cm-course-card.top::before { opacity: 1; }

  .cm-match-badge {
    flex-shrink: 0; width: 60px; height: 60px; border-radius: 14px;
    background: linear-gradient(135deg, #eef2ff, #faf5ff); 
    border: 2px solid #c7d2fe;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
  }
  .cm-match-pct { font-size: 20px; font-weight: 800; color: #6366f1; line-height: 1; }
  .cm-match-lbl { font-size: 10px; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }

  .cm-course-info { flex: 1; min-width: 0; }
  .cm-course-name-row {
    display: flex; align-items: flex-start; flex-wrap: wrap; gap: 8px; margin-bottom: 6px;
  }
  .cm-course-name { font-size: 16px; font-weight: 700; color: #1a1a2e; line-height: 1.35; }
  .cm-tag {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 100px;
    white-space: nowrap; line-height: 1.4;
  }
  .cm-tag-demand { background: #fff7ed; color: #ea580c; border: 1.5px solid #fed7aa; }
  .cm-tag-top    { background: #eef2ff; color: #6366f1; border: 1.5px solid #c7d2fe; }
  .cm-course-meta { font-size: 13px; color: #9ca3af; margin-bottom: 6px; }
  .cm-course-desc { font-size: 14px; color: #6b7280; line-height: 1.6; }

  /* skeleton */
  .cm-skeleton {
    background: linear-gradient(90deg, #f3f4f6 25%, #e9eaec 50%, #f3f4f6 75%);
    background-size: 200% 100%; border-radius: 14px; animation: cm-skel 1.5s infinite;
  }
  @keyframes cm-skel { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  .cm-empty {
    text-align: center; padding: 48px 24px;
    color: #9ca3af; font-size: 15px; line-height: 1.8;
  }

  .cm-retry-btn {
    margin-top: 28px; width: 100%; padding: 16px; border-radius: 14px;
    border: 2px solid #e5e7eb; background: #fff; color: #374151;
    font-family: inherit; font-size: 15px; font-weight: 600; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: all 0.2s;
  }
  .cm-retry-btn:hover { border-color: #6366f1; color: #6366f1; }

  .cm-fadein { animation: cm-fade 0.4s ease forwards; }
  @keyframes cm-fade { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

  /* info box */
  .cm-info-box {
    background: linear-gradient(135deg, #ecfdf5, #d1fae5);
    border: 1.5px solid #6ee7b7;
    border-radius: 14px;
    padding: 18px 20px;
    margin-top: 24px;
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }
  .cm-info-box-icon {
    color: #059669;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .cm-info-box-text {
    font-size: 13px;
    color: #065f46;
    line-height: 1.6;
  }
  .cm-info-box-text strong {
    color: #047857;
  }
`;

const LETTERS = ["A","B","C","D","E","F"];

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function CourseMatch() {
  const [phase, setPhase] = useState("welcome");
  const [sectionIdx, setSectionIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [scores, setScores] = useState(emptyScores());
  const [animKey, setAnimKey] = useState(0);

  const [universities, setUniversities] = useState([]);
  const [selectedUniId, setSelectedUniId] = useState("");
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const topRef = useRef(null);

  /* progress */
  const totalQ = QUIZ_SECTIONS.reduce((s, sec) => s + sec.questions.length, 0);
  const answeredQ = useMemo(() => {
    let c = 0;
    for (let s = 0; s < sectionIdx; s++) c += QUIZ_SECTIONS[s].questions.length;
    return c + questionIdx;
  }, [sectionIdx, questionIdx]);

  const progress = useMemo(() => {
    if (phase === "welcome") return 0;
    if (phase === "results") return 100;
    return Math.round((answeredQ / totalQ) * 90) + 5;
  }, [phase, answeredQ, totalQ]);

  /* load universities */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/universities/names");
        setUniversities(res.data || []);
        if (res.data?.length) setSelectedUniId(String(res.data[0].id));
      } catch (e) { console.error(e); }
    })();
  }, []);

  /* load courses */
  useEffect(() => {
    if (!selectedUniId) return;
    (async () => {
      try {
        setLoadingCourses(true);
        const res = await api.get(`/universities/${selectedUniId}/courses`);
        setCourses(Array.isArray(res.data) ? res.data : []);
      } catch (e) { setCourses([]); }
      finally { setLoadingCourses(false); }
    })();
  }, [selectedUniId]);

  const top = useMemo(() => topTraits(scores, 4), [scores]);
  const profile = useMemo(() => getPersonalityProfile(top), [top]);

  const recommended = useMemo(() => {
    if (!courses.length) return [];
    const traits = top.length ? top : ["LEADERSHIP", "PEOPLE", "TECH"];
    return courses
      .map(row => { const c = row.course || row; return { row, pct: scoreForCourse(c, traits) }; })
      .filter(x => x.pct > 0)
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 12)
      .map(x => ({ ...x.row, _pct: x.pct }));
  }, [courses, top]);

  function scrollTop() {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function reset() {
    setPhase("welcome"); setSectionIdx(0); setQuestionIdx(0);
    setSelected(null); setScores(emptyScores());
    setAnimKey(k => k + 1); scrollTop();
  }

  function startQuiz() {
    setAnimKey(k => k + 1); setPhase("quiz"); scrollTop();
  }

  function pickOption(opt) {
    if (selected !== null) return;
    setSelected(opt);
    setScores(prev => addScores(prev, opt.add));
    setTimeout(() => {
      setSelected(null);
      const section = QUIZ_SECTIONS[sectionIdx];
      const nextQ = questionIdx + 1;
      if (nextQ < section.questions.length) {
        setAnimKey(k => k + 1); setQuestionIdx(nextQ);
      } else {
        const nextS = sectionIdx + 1;
        if (nextS < QUIZ_SECTIONS.length) {
          setAnimKey(k => k + 1); setSectionIdx(nextS); setQuestionIdx(0);
        } else {
          setAnimKey(k => k + 1); setPhase("results");
        }
      }
      scrollTop();
    }, 450);
  }

  const currentSection = QUIZ_SECTIONS[sectionIdx];
  const currentQuestion = currentSection?.questions[questionIdx];

  // Get career pathways for top trait
  const topPathway = top[0] ? CAREER_PATHWAYS[top[0]] : null;

  return (
    <>
      <style>{CSS}</style>
      <div className="cm" ref={topRef}>
        <div className="cm-wrap">

          {/* ── PAGE HEADER ── */}
          <div className="cm-page-header">
            <div>
              <div className="cm-page-title">Course<span>Match</span></div>
              <div className="cm-page-sub">Find the right study path for you after matric</div>
            </div>
            <div className="cm-header-controls">
              <select
                className="cm-uni-select"
                value={selectedUniId}
                onChange={e => setSelectedUniId(e.target.value)}
                disabled={!universities.length}
              >
                {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <button className="cm-restart-btn" onClick={reset}>
                <RotateCcw size={14} /> Restart
              </button>
            </div>
          </div>

          {/* ── SECTION PROGRESS TABS (quiz + results) ── */}
          {phase !== "welcome" && (
            <div className="cm-progress-wrap">
              <div className="cm-progress-top">
                <span className="cm-progress-label">
                  {phase === "results"
                    ? "✅ Quiz complete!"
                    : `${currentSection?.icon} ${currentSection?.label} — Question ${questionIdx + 1} of ${currentSection?.questions.length}`}
                </span>
                <span className="cm-progress-pct">{progress}%</span>
              </div>
              <div className="cm-progress-track">
                <div className="cm-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="cm-section-tabs">
                {QUIZ_SECTIONS.map((sec, si) => {
                  const isDone   = si < sectionIdx || phase === "results";
                  const isActive = si === sectionIdx && phase === "quiz";
                  return (
                    <div key={sec.id} className={`cm-section-tab${isActive ? " active" : isDone ? " done" : ""}`}>
                      {isDone ? "✓" : sec.icon} {sec.label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══════ WELCOME ══════ */}
          {phase === "welcome" && (
            <div key="welcome" className="cm-fadein cm-card">
              <div className="cm-welcome">
                <div className="cm-welcome-badge"><Sparkles size={14} /> For Grade 12 Learners in South Africa</div>
                <h1 className="cm-welcome-h1">Find the right course<br />that <span>fits who you are</span>.</h1>
                <p className="cm-welcome-sub">
                  Not sure what to study after matric? Answer a few simple questions about your life — 
                  what subjects you enjoy, what you're good at, and what makes you happy. We'll help you 
                  discover courses and careers that match your personality. Whether you're from the city 
                  or a rural area, this quiz is for you.
                </p>
                <div className="cm-how-grid">
                  {[
                    { n:1, title:"Answer honestly", desc:"Simple questions about your real life — no complicated career words." },
                    { n:2, title:"5 quick sections", desc:"3 questions each. Takes about 5 minutes. No wrong answers!" },
                    { n:3, title:"Discover your type", desc:"Learn what makes you special and what you're naturally good at." },
                    { n:4, title:"Get course ideas", desc:"See real courses at your chosen university that match your personality." },
                  ].map(s => (
                    <div className="cm-how-item" key={s.n}>
                      <div className="cm-how-num">{s.n}</div>
                      <div>
                        <div className="cm-how-title">{s.title}</div>
                        <div className="cm-how-desc">{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="cm-cta" onClick={startQuiz}>
                  Start the quiz <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* ══════ QUIZ ══════ */}
          {phase === "quiz" && currentSection && currentQuestion && (
            <div key={`q-${animKey}`} className="cm-fadein cm-card">
              <div className="cm-question-card">
                <div className="cm-question-meta">
                  <div className="cm-section-label">
                    <div className="cm-section-dot" style={{ background: currentSection.color }} />
                    {currentSection.label}
                  </div>
                  <div className="cm-q-pips">
                    {currentSection.questions.map((_, qi) => (
                      <div key={qi} className={`cm-pip${qi < questionIdx ? " done" : qi === questionIdx ? " active" : ""}`} />
                    ))}
                  </div>
                </div>

                <p className="cm-section-intro">{currentSection.intro}</p>
                <h2 className="cm-question-text">{currentQuestion.q}</h2>

                <div className="cm-options">
                  {currentQuestion.options.map((opt, i) => {
                    const isSel = selected === opt;
                    return (
                      <button
                        key={i}
                        className={`cm-option${isSel ? " selected" : ""}`}
                        onClick={() => pickOption(opt)}
                        disabled={selected !== null}
                      >
                        <span className="cm-opt-letter">
                          {isSel ? <Check size={14} /> : LETTERS[i]}
                        </span>
                        <span className="cm-opt-text">{opt.text}</span>
                        <ChevronRight size={16} className="cm-opt-arrow" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══════ RESULTS ══════ */}
          {phase === "results" && (
            <div key="results" className="cm-fadein cm-card">

              {/* header */}
              <div className="cm-results-header">
                <div className="cm-results-badge"><Star size={14} /> Your Results Are Ready</div>
                <h2 className="cm-results-h">Here's what we discovered about you!</h2>
                <p className="cm-results-sub">
                  Based on your answers, here's your personality profile and study options that match who you are.
                </p>
              </div>

              {/* personality */}
              <div className="cm-personality">
                <div className="cm-personality-inner">
                  <div className="cm-personality-label">Your Personality Type</div>
                  <div className="cm-personality-name-row">
                    <span className="cm-personality-emoji">{profile.emoji}</span>
                    <span className="cm-personality-name">{profile.name}</span>
                  </div>
                  <p className="cm-personality-desc">{profile.desc}</p>
                </div>

                <div className="cm-trait-grid">
                  {top.slice(0, 4).map(t => {
                    const maxScore = Math.max(...Object.values(scores), 1);
                    const barW = Math.round((scores[t] / maxScore) * 100);
                    return (
                      <div className="cm-trait-chip" key={t}>
                        <span className="cm-trait-emoji">{TRAIT_ICONS[t]}</span>
                        <div className="cm-trait-body">
                          <div className="cm-trait-name">{TRAIT_LABELS[t]}</div>
                          <div className="cm-trait-bar-track">
                            <div className="cm-trait-bar-fill" style={{ width: `${barW}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Career Pathways */}
              {topPathway && (
                <div className="cm-pathways-section">
                  <div className="cm-pathways-title">
                    <MapPin size={20} color="#6366f1" />
                    Your Study & Career Pathways
                  </div>
                  <div className="cm-pathways-grid">
                    <div className="cm-pathway-card">
                      <div className="cm-pathway-header">
                        <div className="cm-pathway-icon uni"><GraduationCap size={18} color="#6366f1" /></div>
                        <div className="cm-pathway-name">University Degree</div>
                      </div>
                      <ul className="cm-pathway-list">
                        {topPathway.university.slice(0, 3).map((course, i) => (
                          <li key={i}>{course}</li>
                        ))}
                      </ul>
                      <div className="cm-pathway-aps">APS needed: {topPathway.aps}</div>
                    </div>
                    
                    <div className="cm-pathway-card">
                      <div className="cm-pathway-header">
                        <div className="cm-pathway-icon college"><School size={18} color="#d97706" /></div>
                        <div className="cm-pathway-name">TVET College / Diploma</div>
                      </div>
                      <ul className="cm-pathway-list">
                        {topPathway.college.slice(0, 3).map((course, i) => (
                          <li key={i}>{course}</li>
                        ))}
                      </ul>
                      <div className="cm-pathway-aps">Often needs Grade 12 pass</div>
                    </div>
                    
                    <div className="cm-pathway-card">
                      <div className="cm-pathway-header">
                        <div className="cm-pathway-icon work"><Briefcase size={18} color="#16a34a" /></div>
                        <div className="cm-pathway-name">Start Working</div>
                      </div>
                      <ul className="cm-pathway-list">
                        {topPathway.workplace.slice(0, 3).map((job, i) => (
                          <li key={i}>{job}</li>
                        ))}
                      </ul>
                      <div className="cm-pathway-aps">Gain experience while studying</div>
                    </div>
                  </div>
                  
                  <div className="cm-info-box">
                    <Info size={20} className="cm-info-box-icon" />
                    <div className="cm-info-box-text">
                      <strong>What is APS?</strong> APS (Admission Point Score) is calculated from your matric marks. 
                      Each university course needs a minimum APS. Don't worry if your APS is low — 
                      there are always options like colleges, bridging courses, or starting with a lower qualification!
                    </div>
                  </div>
                </div>
              )}

              {/* courses */}
              <div className="cm-courses-section">
                <div className="cm-courses-header-row">
                  <div className="cm-courses-title">Recommended Courses at {universities.find(u => String(u.id) === selectedUniId)?.name || "Your University"}</div>
                  {!loadingCourses && (
                    <div className="cm-courses-count">
                      {recommended.length} match{recommended.length !== 1 ? "es" : ""} found
                    </div>
                  )}
                </div>

                {loadingCourses ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {[0,1,2,3].map(i => <div key={i} className="cm-skeleton" style={{ height:96 }} />)}
                  </div>
                ) : recommended.length === 0 ? (
                  <div className="cm-empty">
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                    <strong>No course matches found for this university yet.</strong><br />
                    Try selecting a different university above, or restart with different answers.<br />
                    Remember: You can also check TVET colleges for great alternatives!
                  </div>
                ) : (
                  <div className="cm-courses-list">
                    {recommended.map((row, idx) => {
                      const c = row.course || row;
                      const pct = row._pct || 0;
                      return (
                        <div key={idx} className={`cm-course-card${idx < 3 ? " top" : ""}`}>
                          <div className="cm-match-badge">
                            <div className="cm-match-pct">{pct}%</div>
                            <div className="cm-match-lbl">match</div>
                          </div>
                          <div className="cm-course-info">
                            <div className="cm-course-name-row">
                              <span className="cm-course-name">{c.name}</span>
                              {idx === 0 && <span className="cm-tag cm-tag-top">⭐ Top Pick</span>}
                              {c.inDemand && <span className="cm-tag cm-tag-demand">🔥 In Demand</span>}
                            </div>
                            <div className="cm-course-meta">
                              {[
                                c.faculty,
                                c.years && `${c.years} year${c.years !== 1 ? "s" : ""}`,
                                c.minAps && `Min APS: ${c.minAps}`,
                              ].filter(Boolean).join(" · ")}
                            </div>
                            {c.description && <div className="cm-course-desc">{c.description}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <button className="cm-retry-btn" onClick={reset}>
                  <RotateCcw size={16} /> Retake the quiz
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  );
}
