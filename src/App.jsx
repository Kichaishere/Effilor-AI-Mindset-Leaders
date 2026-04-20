import React, { useState } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Download, ArrowRight, ArrowLeft, CheckCircle2, ExternalLink, Brain } from 'lucide-react';
import { jsPDF } from 'jspdf';

const LOGO_URL = '/effilor-logo.jpg';

const NAVY   = '#2D2D8F';
const PURPLE = '#6B3D7A';

// ─── Pillars ───────────────────────────────────────────────────────────────
const PILLARS = [
  {
    id: 'strategy',
    num: '01',
    label: 'AI for Business Strategy & Growth',
    short: 'Strategy',
    subtitle: 'Treating AI as a strategic lever, not just a cost tool',
    description: 'This pillar assesses whether you treat AI as a strategic lever, not just a cost tool. It surfaces gaps in competitive positioning and portfolio thinking.',
    maxRaw: 20,
  },
  {
    id: 'solutioning',
    num: '02',
    label: 'AI for Technical Solutioning & Delivery',
    short: 'Solutioning',
    subtitle: 'Decisions you make in architecting and governing technical work',
    description: 'This goes beyond awareness to actual decisions you make in architecting and governing technical work — distinguishing leaders who delegate AI thinking from those who guide it.',
    maxRaw: 20,
  },
  {
    id: 'team',
    num: '03',
    label: 'AI for Team & Talent Development',
    short: 'Team',
    subtitle: 'Building the human infrastructure for AI-era delivery',
    description: 'Often the most underdeveloped area — this pillar reveals whether leaders are building an AI-capable team or just assuming their people will figure it out.',
    maxRaw: 20,
  },
  {
    id: 'personal',
    num: '04',
    label: 'AI for Personal Productivity & Leadership',
    short: 'Personal',
    subtitle: 'Your own AI habits and the "do as I say, not as I do" gap',
    description: 'The most intimate pillar — it asks what you actually do, not just what you think. Surfaces the gap between strategic confidence and personal practice.',
    maxRaw: 20,
  },
];

// ─── Response scale ────────────────────────────────────────────────────────
// 1 = Never  2 = Occasionally  3 = Often  4 = Consistently
const SCALE = [
  { value: 1, label: 'Never',        desc: 'This does not describe my current practice' },
  { value: 2, label: 'Occasionally', desc: 'I do this sometimes but not regularly' },
  { value: 3, label: 'Often',        desc: 'I do this regularly as part of how I work' },
  { value: 4, label: 'Consistently', desc: 'This is fully embedded in how I lead' },
];

// ─── Questions ─────────────────────────────────────────────────────────────
const questions = [

  // PILLAR 1 — AI for Business Strategy & Growth (Q1–5)
  {
    id: 1,
    pillar: 'strategy',
    text: 'I actively track how AI is reshaping the competitive landscape in my clients\u2019 industries and factor this into my account or business planning.',
  },
  {
    id: 2,
    pillar: 'strategy',
    text: 'When presenting proposals or roadmaps to clients, I proactively introduce AI-led approaches as alternatives to conventional delivery models.',
  },
  {
    id: 3,
    pillar: 'strategy',
    text: 'I\u2019ve had a structured conversation with my leadership team in the last quarter about which parts of our business model are at risk or at advantage due to AI.',
  },
  {
    id: 4,
    pillar: 'strategy',
    text: 'I evaluate new business opportunities through the lens of whether AI can create a differentiated delivery or pricing model for us.',
  },
  {
    id: 5,
    pillar: 'strategy',
    text: 'I can articulate a point of view on how AI will change the nature of IT services contracts (scope, pricing, SLAs) in the next 2\u20133 years.',
  },

  // PILLAR 2 — AI for Technical Solutioning & Delivery (Q6–10)
  {
    id: 6,
    pillar: 'solutioning',
    text: 'When I review a solution design or architecture, I ask my teams to explicitly consider where AI/ML components could add value or reduce effort.',
  },
  {
    id: 7,
    pillar: 'solutioning',
    text: 'I have a working knowledge of at least 2\u20133 AI/ML tools or platforms that are relevant to the solutions my team typically builds or supports.',
  },
  {
    id: 8,
    pillar: 'solutioning',
    text: 'My team has a documented or agreed approach for evaluating when to use AI-generated code versus human-written code in delivery.',
  },
  {
    id: 9,
    pillar: 'solutioning',
    text: 'I include AI-readiness criteria (data quality, model explainability, integration patterns) when reviewing technical proposals or RFP responses.',
  },
  {
    id: 10,
    pillar: 'solutioning',
    text: 'I can meaningfully engage in a conversation with a client\u2019s CTO or architect on the trade-offs of building versus buying AI capabilities.',
  },

  // PILLAR 3 — AI for Team & Talent Development (Q11–15)
  {
    id: 11,
    pillar: 'team',
    text: 'I\u2019ve taken deliberate steps in the last 6 months to assess my team\u2019s AI skills and identify gaps at a role-by-role level.',
  },
  {
    id: 12,
    pillar: 'team',
    text: 'I regularly create space in team rituals (reviews, retrospectives, 1:1s) to discuss AI experiments, learnings, and failures.',
  },
  {
    id: 13,
    pillar: 'team',
    text: 'I have adapted how I evaluate performance \u2014 giving credit for smart AI-assisted output, not just volume of effort.',
  },
  {
    id: 14,
    pillar: 'team',
    text: 'I actively mentor team members on developing an \u201cAI-first\u201d approach to problem-solving rather than defaulting to traditional methods.',
  },
  {
    id: 15,
    pillar: 'team',
    text: 'I\u2019ve addressed concerns or resistance in my team about job security and AI, with honest and constructive conversations.',
  },

  // PILLAR 4 — AI for Personal Productivity & Leadership Effectiveness (Q16–20)
  {
    id: 16,
    pillar: 'personal',
    text: 'I use AI tools (e.g. for summarisation, research, drafting, analysis) in my own day-to-day work at least several times a week.',
  },
  {
    id: 17,
    pillar: 'personal',
    text: 'I\u2019ve experimented with AI to improve a leadership task \u2014 such as preparing for a tough client conversation, running a retrospective, or structuring a strategy document.',
  },
  {
    id: 18,
    pillar: 'personal',
    text: 'I actively share my own AI experiments \u2014 including failures \u2014 with my team to model a learning culture.',
  },
  {
    id: 19,
    pillar: 'personal',
    text: 'When I encounter a new problem or decision, AI-assisted thinking is part of my natural first step, not an afterthought.',
  },
  {
    id: 20,
    pillar: 'personal',
    text: 'I set aside deliberate time each month to explore new AI capabilities and assess their relevance to my work.',
  },
];

// ─── Scoring ───────────────────────────────────────────────────────────────
// Max raw score: 20 questions × 4 = 80
const calculateResults = (answers) => {
  const pillarRaw = {};
  PILLARS.forEach(p => { pillarRaw[p.id] = 0; });

  questions.forEach(q => {
    pillarRaw[q.pillar] += (answers[q.id] || 1);
  });

  const totalRaw = Object.values(pillarRaw).reduce((a, b) => a + b, 0);

  return { pillarRaw, totalRaw, profile: getProfile(totalRaw) };
};

const getProfile = (score) => {
  if (score >= 63) return {
    name: 'AI Catalyst',
    range: '63\u201380',
    tagline: 'Driving AI-led transformation across business, team, and self.',
    color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50', border: 'border-green-200',
    summary: 'You are operating at the frontier of AI leadership in IT services. AI is not a side conversation for you \u2014 it is woven into how you plan, how you build, how you develop people, and how you show up every day as a leader. You are the kind of leader your organisation and your clients need more of right now.',
    strengths: [
      'You connect AI to commercial outcomes, not just technical capability',
      'Your team sees you model AI practice \u2014 not just advocate for it',
      'You are building competitive advantage through AI leadership, not just AI adoption',
    ],
    focusAreas: [
      'Look at the pillar where you scored lowest \u2014 even Catalysts have blind spots worth addressing',
      'Think about how you can scale your AI leadership approach across your broader leadership community',
      'Push into the hardest frontier: helping your clients build their own AI literacy and capability',
    ],
    effilorHook: 'Effilor partners with AI Catalysts to design leadership programmes that spread this capability across their organisations and client ecosystems.',
  };
  if (score >= 51) return {
    name: 'AI Integrator',
    range: '51\u201362',
    tagline: 'Embedding AI across delivery and team \u2014 a strong foundation, but the ceiling is higher.',
    color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50', border: 'border-blue-200',
    summary: 'You are leading with AI in meaningful, observable ways. Your team knows where you stand, your delivery thinking has evolved, and you are engaging clients on AI with growing confidence. The gap for leaders at this level is typically in the most strategically sophisticated areas \u2014 competitive positioning, commercial model evolution, and becoming a genuine AI trusted advisor to clients.',
    strengths: [
      'You have moved from talking about AI to actively applying it in your leadership',
      'Your team feels permission to experiment because they see you doing the same',
      'You think about AI in delivery beyond just tooling \u2014 including governance and risk',
    ],
    focusAreas: [
      'Sharpen your AI narrative for your top 2\u20133 clients \u2014 make it specific to their industry and business context',
      'Revisit how you are pricing and scoping engagements in light of AI productivity shifts',
      'Build a more structured view of AI capability across your team \u2014 go beyond your instinct',
    ],
    effilorHook: 'Effilor\u2019s strategic AI advisory work focuses on this transition \u2014 from strong AI practitioner to market-differentiating AI leader.',
  };
  if (score >= 36) return {
    name: 'AI Explorer',
    range: '36\u201350',
    tagline: 'Experimenting individually, but not yet leading systemically.',
    color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50', border: 'border-yellow-200',
    summary: 'You are curious about AI and have begun to engage with it personally. But your practice is largely individual \u2014 your team, your delivery approach, your client conversations, and your commercial model have not yet been systematically shaped by what you know. This is the most common profile among experienced IT services leaders right now: genuine curiosity combined with organisational inertia.',
    strengths: [
      'Your personal curiosity gives you credibility when the topic comes up with your team',
      'You are asking the right questions, even if the answers are still forming',
      'You have enough awareness to distinguish AI signal from noise',
    ],
    focusAreas: [
      'Turn your personal AI use into a team conversation \u2014 share what you are trying and learning',
      'Pick one delivery process or governance standard and update it to reflect AI realities',
      'Prepare a specific AI point of view for your most important client relationship',
    ],
    effilorHook: 'Effilor works with leaders at the Explorer stage to build the structures and habits that turn individual curiosity into organisational capability.',
  };
  return {
    name: 'AI Observer',
    range: '20\u201335',
    tagline: 'Aware of AI\u2019s importance, but watching from the sidelines.',
    color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50', border: 'border-orange-200',
    summary: 'You recognise that AI matters \u2014 that is the necessary starting point. But awareness has not yet translated into structured thinking, changed behaviour, or deliberate practice. The risk is not that you are uninformed; it is that the gap between awareness and action is widening faster than it appears. Clients, competitors, and your own team members are moving, and the cost of waiting increases each quarter.',
    strengths: [
      'You recognise AI as strategically important \u2014 which is the first and necessary step',
      'You have not made costly mistakes by moving without understanding',
      'You have significant upside \u2014 focused effort over the next 90 days can shift your profile meaningfully',
    ],
    focusAreas: [
      'Start with 30 days of deliberate personal AI use \u2014 apply it to real leadership tasks, not just experiments',
      'Have one honest conversation with your team about where AI is already showing up in your delivery',
      'Identify the one client conversation where having an AI point of view would make the biggest difference',
    ],
    effilorHook: 'Effilor\u2019s AI Leadership Accelerator is designed for exactly this transition \u2014 from Observer to active AI leader \u2014 in a structured, practical way.',
  };
};

const getPillarLevel = (pct) => {
  if (pct >= 80) return { name: 'Strong',      color: 'bg-green-100 text-green-800' };
  if (pct >= 60) return { name: 'Developing',  color: 'bg-blue-100 text-blue-800' };
  if (pct >= 40) return { name: 'Emerging',    color: 'bg-yellow-100 text-yellow-800' };
  return              { name: 'Needs Focus', color: 'bg-red-100 text-red-800' };
};

// ─── PDF ───────────────────────────────────────────────────────────────────
const generatePDF = (userData, answers) => {
  const doc = new jsPDF();
  const { pillarRaw, totalRaw, profile } = calculateResults(answers);

  doc.setFontSize(22);
  doc.setTextColor(45, 45, 143);
  doc.text('Effilor Consulting Services', 20, 20);

  doc.setFontSize(13);
  doc.setTextColor(107, 61, 122);
  doc.text('AI Mindset Assessment \u2014 Personalised Report', 20, 30);

  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Prepared for: ${userData.name}`, 20, 42);
  if (userData.designation) doc.text(`Designation: ${userData.designation}`, 20, 49);
  if (userData.company)     doc.text(`Organisation: ${userData.company}`, 20, 56);
  doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 20, 63);

  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text('Overall AI Mindset Score', 20, 78);

  doc.setFontSize(38);
  doc.setTextColor(107, 61, 122);
  doc.text(`${totalRaw} / 80`, 20, 95);

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(`Profile: ${profile.name}`, 20, 106);

  doc.setFontSize(10);
  doc.setTextColor(60);
  const summaryLines = doc.splitTextToSize(profile.summary, 170);
  doc.text(summaryLines, 20, 118);

  let y = 118 + summaryLines.length * 5 + 10;

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Pillar Scores', 20, y);
  y += 10;

  doc.setFontSize(10);
  PILLARS.forEach(p => {
    const raw = pillarRaw[p.id] || 0;
    const pct = Math.round((raw / p.maxRaw) * 100);
    const level = getPillarLevel(pct);
    doc.setTextColor(60);
    doc.text(`${p.label}: ${raw}/20  (${pct}%)  \u2014  ${level.name}`, 20, y);
    y += 8;
  });

  y += 6;
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Where to Focus Next', 20, y);
  y += 8;
  doc.setFontSize(10);
  profile.focusAreas.forEach(fa => {
    const lines = doc.splitTextToSize(`\u2022 ${fa}`, 170);
    doc.setTextColor(60);
    doc.text(lines, 20, y);
    y += lines.length * 5 + 3;
  });

  y += 5;
  doc.setFontSize(10);
  doc.setTextColor(107, 61, 122);
  const hookLines = doc.splitTextToSize(profile.effilorHook, 170);
  doc.text(hookLines, 20, y);

  doc.save(`Effilor-AI-Mindset-${userData.name.replace(/\s+/g, '-')}.pdf`);
};

// ─── Header ────────────────────────────────────────────────────────────────
const Header = () => (
  <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 px-6 py-4 flex flex-col items-center justify-center">
    <img src={LOGO_URL} alt="Effilor Consulting Services" className="h-12 w-auto mb-1" />
    <span className="text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
      style={{ background: 'rgba(107,61,122,0.1)', color: PURPLE }}>
      AI Mindset Assessment
    </span>
  </div>
);

// ─── App ───────────────────────────────────────────────────────────────────
const App = () => {
  const [currentScreen, setCurrentScreen]     = useState('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers]                 = useState({});
  const [userData, setUserData]               = useState({ name: '', email: '', company: '', designation: '', phone: '' });
  const [submitting, setSubmitting]           = useState(false);
  const [submitError, setSubmitError]         = useState('');

  // ── Welcome ──────────────────────────────────────────────────────────────
  if (currentScreen === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900">
        <Header />
        <div className="max-w-4xl mx-auto px-4 pt-36 pb-20">

          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-indigo-300 border border-indigo-500 rounded-full px-4 py-1.5 mb-6">
              For IT Services Leaders &middot; 12&ndash;20 Years Experience
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
              Where do you <span className="italic text-purple-300">really</span><br />stand on AI leadership?
            </h1>
            <p className="text-lg text-indigo-200 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              A 20-question diagnostic across four dimensions of AI leadership in IT services.
              Not a quiz about tools. A genuine measure of how AI is — or isn't — shaping
              how you win, deliver, build teams, and lead.
            </p>
            <div className="flex items-center justify-center gap-8 text-indigo-300 text-sm mb-12 flex-wrap">
              <span>📋 20 questions</span>
              <span>⏱ ~8–10 minutes</span>
              <span>✅ Instant results</span>
              <span>🔒 No sign-up required</span>
            </div>
            <button
              onClick={() => setCurrentScreen('questions')}
              className="inline-flex items-center gap-3 text-white font-bold text-lg px-10 py-5 rounded-2xl transition-all hover:scale-105 shadow-2xl"
              style={{ background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` }}
            >
              Start the Assessment
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Pillar cards */}
          <div className="mb-12">
            <p className="text-center text-indigo-300 text-sm font-semibold tracking-widest uppercase mb-8">
              Four dimensions this assessment covers
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {PILLARS.map(p => (
                <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <p className="text-purple-300 text-xs font-bold tracking-widest uppercase mb-2">Pillar {p.num}</p>
                  <h3 className="text-white font-bold text-base mb-2 leading-snug">{p.label}</h3>
                  <p className="text-indigo-300 text-sm leading-relaxed font-light">{p.subtitle}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scale explainer */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-purple-300 text-xs font-bold tracking-widest uppercase mb-4">How to answer</p>
            <p className="text-indigo-200 text-sm font-light mb-4">
              Each statement describes a leadership behaviour. Rate how consistently it describes your current practice.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SCALE.map(s => (
                <div key={s.value} className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-white font-bold text-sm mb-1">{s.label}</p>
                  <p className="text-indigo-300 text-xs font-light leading-snug">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Questions ────────────────────────────────────────────────────────────
  if (currentScreen === 'questions') {
    const q         = questions[currentQuestion];
    const progress  = Math.round((currentQuestion / questions.length) * 100);
    const pillar    = PILLARS.find(p => p.id === q.pillar);
    const pillarIdx = PILLARS.findIndex(p => p.id === q.pillar);

    const handleAnswer = (value) => {
      const newAnswers = { ...answers, [q.id]: value };
      setAnswers(newAnswers);
      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setCurrentScreen('results');
          window.scrollTo({ top: 0 });
        }
      }, 320);
    };

    const goBack = () => {
      if (currentQuestion > 0) {
        setCurrentQuestion(currentQuestion - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setCurrentScreen('welcome');
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-12 pt-36">

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span className="font-medium" style={{ color: PURPLE }}>
                Pillar {pillarIdx + 1} of {PILLARS.length}: {pillar.label}
              </span>
              <span>{currentQuestion + 1} / {questions.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${NAVY}, ${PURPLE})` }}
              />
            </div>
          </div>

          {/* Question card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 mb-6">
            <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">
              Statement {currentQuestion + 1} of {questions.length}
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-8 leading-snug">
              {q.text}
            </h2>

            <p className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">
              How consistently does this describe your current practice?
            </p>

            <div className="space-y-3">
              {SCALE.map(opt => {
                const isSelected = answers[q.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleAnswer(opt.value)}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-150 flex items-center gap-4 group
                      ${isSelected
                        ? 'text-white shadow-lg scale-[1.01]'
                        : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-800'
                      }`}
                    style={isSelected
                      ? { background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})`, borderColor: NAVY }
                      : {}
                    }
                  >
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 font-bold text-sm transition-all
                      ${isSelected ? 'bg-white border-white text-purple-700' : 'border-gray-300 text-gray-400 group-hover:border-purple-400'}`}>
                      {opt.value}
                    </div>
                    <div>
                      <p className={`font-bold text-base ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                        {opt.label}
                      </p>
                      <p className={`text-sm mt-0.5 ${isSelected ? 'text-white/75' : 'text-gray-500'}`}>
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-start">
            <button onClick={goBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {currentQuestion === 0 ? 'Back to Start' : 'Previous'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Results ──────────────────────────────────────────────────────────────
  if (currentScreen === 'results') {
    const { pillarRaw, totalRaw, profile } = calculateResults(answers);

    const radarData = PILLARS.map(p => ({
      pillar: p.short,
      score: Math.round((pillarRaw[p.id] / p.maxRaw) * 100),
    }));

    const barData = PILLARS.map(p => ({
      name: p.short,
      score: Math.round((pillarRaw[p.id] / p.maxRaw) * 100),
    }));

    const topPillar     = [...PILLARS].sort((a, b) => (pillarRaw[b.id] || 0) - (pillarRaw[a.id] || 0))[0];
    const weakestPillar = [...PILLARS].sort((a, b) => (pillarRaw[a.id] || 0) - (pillarRaw[b.id] || 0))[0];

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 pt-36">

          {/* Score hero */}
          <div className="text-center mb-10 py-12 rounded-3xl text-white shadow-2xl"
            style={{ background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` }}>
            <p className="text-indigo-200 text-sm font-semibold tracking-widest uppercase mb-3">Your AI Mindset Profile</p>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">{profile.name}</h1>
            <p className="text-indigo-200 text-lg italic font-light mb-8 max-w-xl mx-auto px-4">{profile.tagline}</p>
            <div className="inline-flex items-baseline gap-2 bg-white/15 border border-white/20 px-8 py-4 rounded-2xl">
              <span className="text-6xl font-extrabold">{totalRaw}</span>
              <span className="text-2xl text-white/50">/ 80</span>
            </div>
            <p className="text-indigo-300 text-sm mt-3">Score range for this profile: {profile.range} / 80</p>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What this means for you</h2>
            <p className="text-gray-600 leading-relaxed text-base">{profile.summary}</p>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">AI Leadership Radar</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Your Score" dataKey="score" stroke={PURPLE} fill={PURPLE} fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Score by Pillar</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} margin={{ bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" angle={-30} textAnchor="end" tick={{ fontSize: 11 }} height={60} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip formatter={v => [`${v}%`, 'Score']} />
                  <Bar dataKey="score" fill={PURPLE} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Strongest & Priority */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className={`${profile.bgLight} border-2 ${profile.border} rounded-3xl p-6`}>
              <h3 className={`text-xl font-bold ${profile.textColor} mb-2`}>🎯 Strongest Pillar</h3>
              <p className="text-lg font-semibold text-gray-900 mb-1">{topPillar.label}</p>
              <p className={`${profile.textColor} font-bold text-2xl mb-3`}>
                {Math.round((pillarRaw[topPillar.id] / topPillar.maxRaw) * 100)}%
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">
                Build on this as your foundation and use it to credibly lead AI conversations in this area.
              </p>
            </div>
            <div className="bg-orange-50 border-2 border-orange-200 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-orange-800 mb-2">⚡ Priority Focus Area</h3>
              <p className="text-lg font-semibold text-gray-900 mb-1">{weakestPillar.label}</p>
              <p className="text-orange-700 font-bold text-2xl mb-3">
                {Math.round((pillarRaw[weakestPillar.id] / weakestPillar.maxRaw) * 100)}%
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">
                Improving here will have the greatest impact on your overall AI leadership effectiveness.
              </p>
            </div>
          </div>

          {/* Detailed pillar breakdown */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Detailed Pillar Analysis</h3>
            <div className="space-y-6">
              {PILLARS.map(p => {
                const raw = pillarRaw[p.id] || 0;
                const pct = Math.round((raw / p.maxRaw) * 100);
                const level = getPillarLevel(pct);
                return (
                  <div key={p.id} className="border-l-4 pl-6" style={{ borderColor: PURPLE }}>
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <h4 className="text-lg font-bold text-gray-900">{p.label}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${level.color}`}>{level.name}</span>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold" style={{ color: PURPLE }}>{pct}%</span>
                      <span className="text-gray-400 text-sm">({raw} / 20)</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${NAVY}, ${PURPLE})` }} />
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{p.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths & Focus areas */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-green-50 border-2 border-green-200 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-green-800 mb-4">✅ What&apos;s Working</h3>
              <ul className="space-y-3">
                {profile.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
                    <span className="text-green-600 mt-0.5 shrink-0">→</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-indigo-800 mb-4">⚡ Where to Focus Next</h3>
              <ul className="space-y-3">
                {profile.focusAreas.map((f, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
                    <span className="text-indigo-600 mt-0.5 shrink-0">→</span>{f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Effilor CTA */}
          <div className="rounded-3xl shadow-xl p-8 text-center text-white mb-8"
            style={{ background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` }}>
            <Brain className="w-10 h-10 mx-auto mb-4 opacity-80" />
            <h3 className="text-2xl font-bold mb-3">How Effilor can help</h3>
            <p className="text-indigo-200 mb-6 max-w-lg mx-auto font-light leading-relaxed">{profile.effilorHook}</p>
            <a href="https://www.effilor.com/contact-us" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors"
              style={{ color: PURPLE }}>
              Talk to the Effilor team <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Report CTA */}
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Want a personalised written report?</h3>
            <p className="text-gray-600 mb-6 font-light">
              Share your details and the Effilor team will prepare a detailed report with specific
              recommendations for your profile — delivered within 48 hours.
            </p>
            <button
              onClick={() => setCurrentScreen('email')}
              className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity"
              style={{ background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` }}
            >
              <Download className="w-5 h-5" />
              Request my personalised report
            </button>
          </div>

          {/* Resources */}
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">💡 Explore Effilor Resources</h3>
              <p className="text-gray-600 text-sm mb-4 font-light">
                Articles, frameworks, and case studies on AI leadership for IT services firms.
              </p>
              <a href="https://www.effilor.com/our-blogs" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold border-2 text-sm transition-all hover:scale-105"
                style={{ borderColor: PURPLE, color: PURPLE }}>
                Browse Resources <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Email capture ─────────────────────────────────────────────────────────
  if (currentScreen === 'email') {
    const handleEmailSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      setSubmitError('');

      try {
        const { pillarRaw, totalRaw, profile } = calculateResults(answers);

        const pillarSummary = PILLARS.map(p => ({
          pillar: p.label,
          score: `${pillarRaw[p.id]} / 20  (${Math.round((pillarRaw[p.id] / p.maxRaw) * 100)}%)`,
        }));

        const answerDetail = questions.map(q => ({
          question: q.text,
          answer: SCALE.find(s => s.value === answers[q.id])?.label || 'Not answered',
        }));

        const res = await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userData,
            profile: profile.name,
            totalScore: `${totalRaw} / 80`,
            pillarSummary,
            answerDetail,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to submit. Please try again.');
        }

        setTimeout(() => generatePDF(userData, answers), 400);
        setCurrentScreen('thankyou');

      } catch (err) {
        setSubmitError(err.message || 'Something went wrong. Please try again.');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-12 pt-36">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` }}>
                <Download className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Get Your Personalised Report</h2>
              <p className="text-gray-600 font-light leading-relaxed">
                The Effilor team will prepare a detailed written report based on your results
                and have it with you within 48 hours. A PDF summary downloads immediately.
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-5">
              {[
                { field: 'name',        label: 'Full name',        placeholder: 'Rajiv Krishnamurthy',      type: 'text',  required: true  },
                { field: 'designation', label: 'Designation',      placeholder: 'VP Engineering / BU Head', type: 'text',  required: true  },
                { field: 'company',     label: 'Organisation',     placeholder: 'Your company name',        type: 'text',  required: true  },
                { field: 'email',       label: 'Work email',       placeholder: 'you@yourcompany.com',      type: 'email', required: true  },
                { field: 'phone',       label: 'Phone (optional)', placeholder: '+91 98xxx xxxxx',          type: 'tel',   required: false },
              ].map(({ field, label, placeholder, type, required }) => (
                <div key={field}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {label} {required && <span style={{ color: PURPLE }}>*</span>}
                  </label>
                  <input
                    type={type}
                    required={required}
                    value={userData[field]}
                    onChange={e => setUserData({ ...userData, [field]: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-gray-50 text-gray-900"
                    onFocus={e => e.target.style.borderColor = PURPLE}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    placeholder={placeholder}
                  />
                </div>
              ))}

              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-8 text-lg font-bold text-white rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` }}
              >
                {submitting
                  ? <><span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> Sending...</>
                  : <><Download className="w-5 h-5" /> Request Full Report</>
                }
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
              We respect your privacy. Your information is only used to send your report and will never be shared with third parties.
            </p>
            <div className="text-center mt-4">
              <button onClick={() => setCurrentScreen('results')} className="text-sm text-gray-400 hover:text-gray-600 underline">
                ← Back to my results
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Thank you ─────────────────────────────────────────────────────────────
  if (currentScreen === 'thankyou') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-12 pt-36">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Thank you, {userData.name}!</h2>
            <p className="text-lg text-gray-600 mb-8 font-light">Your request has been received by the Effilor team.</p>

            <div className="rounded-2xl p-6 mb-8 text-left" style={{ background: 'rgba(107,61,122,0.06)' }}>
              <p className="text-gray-700 mb-2">
                Your personalised report will be sent to <strong>{userData.email}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Please allow up to 2 business days. A PDF summary has also been downloaded to your device.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">What&apos;s Next?</h3>
              <a href="https://calendar.app.google/zCBe4tkGuv5TeyhE7" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 px-6 text-lg font-bold text-white rounded-xl hover:opacity-90 transition-all"
                style={{ background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` }}>
                📅 Schedule a Consultation <ExternalLink className="w-5 h-5" />
              </a>
              <a href="https://www.effilor.com/our-blogs" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 px-6 text-lg font-bold rounded-xl border-2 transition-all hover:scale-105"
                style={{ borderColor: PURPLE, color: PURPLE }}>
                📚 Explore More Resources <ExternalLink className="w-5 h-5" />
              </a>
              <a href="https://www.effilor.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 px-6 text-lg font-bold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                🏠 Back to Effilor.com <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              At Effilor Consulting Services, we specialise in Growth &amp; Strategy,
              Organisational Culture, and Leadership Development for IT services firms.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default App;
