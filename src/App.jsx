import React, { useState, useEffect } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Download, ArrowRight, ArrowLeft, CheckCircle2, ExternalLink, Brain } from 'lucide-react';
import { jsPDF } from 'jspdf';

const LOGO_URL = '/effilor-logo.jpg';

// ─── Brand colours (Effilor navy + purple) ────────────────────────────────
const NAVY   = '#2D2D8F';
const PURPLE = '#6B3D7A';

// ─── Pillar metadata ───────────────────────────────────────────────────────
const PILLARS = [
  { id: 'winning',   label: 'Winning & Growing with AI',          short: 'Winning',   maxRaw: 20 },
  { id: 'delivery',  label: 'Delivering with AI',                 short: 'Delivery',  maxRaw: 20 },
  { id: 'team',      label: 'Building an AI-Ready Team',          short: 'Team',      maxRaw: 20 },
  { id: 'clients',   label: 'Managing Clients Through AI',        short: 'Clients',   maxRaw: 20 },
  { id: 'personal',  label: 'Leading with AI — Personal Practice',short: 'Personal',  maxRaw: 20 },
];

// ─── Questions ─────────────────────────────────────────────────────────────
// Each option: value 1–4 matching the maturity scale
// 1 = Not yet  2 = Aware  3 = Practicing  4 = Embedded

const questions = [

  // ── PILLAR 1: Winning & Growing with AI ──────────────────────────────────
  {
    id: 1,
    pillar: 'winning',
    text: "When scoping a new engagement or renewal, I account for the productivity impact of AI on my delivery model by:",
    context: "If your developers are 30–40% more productive with AI tools, your T&M billing model is exposed. The best leaders have restructured proposals before the client raises it.",
    options: [
      { value: 1, label: "I haven't thought about AI's impact on our commercial model yet" },
      { value: 2, label: "I'm aware this is changing but haven't yet changed how we scope or price" },
      { value: 3, label: "I've raised this internally and we're actively revisiting our pricing approach for at least some accounts" },
      { value: 4, label: "AI productivity impact is now part of how we structure all proposals — I have concrete examples" },
    ]
  },
  {
    id: 2,
    pillar: 'winning',
    text: "If a competitor pitches my client with an AI-native model — shorter timelines, lower cost, smaller team — my ability to respond in the next QBR is:",
    context: "This isn't hypothetical. It's happening across IT services right now. Relationship capital alone won't hold if you can't articulate a credible AI delivery counter-narrative.",
    options: [
      { value: 1, label: "I'd be caught off-guard — I don't have a prepared response to this yet" },
      { value: 2, label: "I'd rely primarily on the strength of our relationship and track record" },
      { value: 3, label: "I have a general AI narrative but it's not yet account-specific or evidence-backed" },
      { value: 4, label: "I have a clear, rehearsed, data-backed response ready for this conversation" },
    ]
  },
  {
    id: 3,
    pillar: 'winning',
    text: "In the last RFP or SOW my team responded to, AI-specific delivery commitments (tooling, productivity benchmarks, quality gates, AI-augmented roles) were:",
    context: "Most IT services proposals still describe AI in the 'innovation' section as an afterthought. Where does yours land?",
    options: [
      { value: 1, label: "Not included — we responded in our standard format" },
      { value: 2, label: "Mentioned briefly in a section on innovation or future capabilities" },
      { value: 3, label: "Included in some sections, though not systematically throughout the response" },
      { value: 4, label: "A genuine differentiator — specific, measurable, and woven into our delivery model" },
    ]
  },
  {
    id: 4,
    pillar: 'winning',
    text: "My ability to articulate specific AI-driven business outcomes for my top 2 clients — in their industry language, not generic IT terms — is:",
    context: "A leader managing a banking client should speak to credit decisioning or fraud detection, not 'faster development cycles'. Generic AI claims are increasingly invisible to clients.",
    options: [
      { value: 1, label: "I don't yet have a differentiated AI narrative for specific clients" },
      { value: 2, label: "I can speak broadly about AI efficiency — but not in client-specific business terms" },
      { value: 3, label: "I have a working point of view for my top accounts but it still needs sharpening" },
      { value: 4, label: "I can walk into any client meeting and speak credibly about AI value in their domain" },
    ]
  },
  {
    id: 5,
    pillar: 'winning',
    text: "When my organisation invests in a new AI capability or partnership (new tool, CoE, alliance), my role in shaping how it gets positioned with my accounts is:",
    context: "Are you a passive receiver of corporate AI initiatives, or an active shaper of how they translate to commercial value in your specific accounts?",
    options: [
      { value: 1, label: "I typically implement what's handed down — I'm not part of the shaping process" },
      { value: 2, label: "I'm consulted occasionally but don't drive the commercial positioning" },
      { value: 3, label: "I actively input on how new AI capabilities should be positioned for my accounts" },
      { value: 4, label: "I co-design the go-to-market approach for new AI capabilities alongside the corporate team" },
    ]
  },

  // ── PILLAR 2: Delivering with AI ─────────────────────────────────────────
  {
    id: 6,
    pillar: 'delivery',
    text: "My confidence that our delivery governance — code reviews, testing standards, security checks — has been updated for AI-generated output is:",
    context: "AI-generated code introduces hallucinations, subtle logic errors, and security vulnerabilities that traditional peer review isn't designed to catch. Unchanged governance is hidden delivery risk.",
    options: [
      { value: 1, label: "Our governance hasn't changed — we haven't thought about AI-specific failure modes" },
      { value: 2, label: "We've had the conversation but haven't made structural changes yet" },
      { value: 3, label: "Some teams have updated their practices, but it's not consistent across my portfolio" },
      { value: 4, label: "We have updated, documented standards for AI-assisted delivery that all teams follow" },
    ]
  },
  {
    id: 7,
    pillar: 'delivery',
    text: "Without asking my team, I can identify which projects in my current portfolio are using AI tools, which tools specifically, and what guardrails are in place:",
    context: "Many leaders discover teams are using AI in ways that breach client data agreements. The leader who can answer this without checking has a fundamentally different level of delivery engagement.",
    options: [
      { value: 1, label: "I'd need to ask — I don't have visibility into this right now" },
      { value: 2, label: "I have a general sense but not the specifics on tools or guardrails" },
      { value: 3, label: "I know which projects are using AI but not all the tool-level and guardrail details" },
      { value: 4, label: "Yes — I have clear visibility across my portfolio on this without needing to check" },
    ]
  },
  {
    id: 8,
    pillar: 'delivery',
    text: "My approach to the 'last mile' problem — where AI delivers 70–80% of a solution quickly but production-hardening, testing, and integration erode the projected gains — is:",
    context: "Leaders with an optimistic pitch-deck view of AI get surprised at this stage. Leaders with a realistic mental model of AI's contribution curve build it into their plans from day one.",
    options: [
      { value: 1, label: "I haven't encountered or thought through this problem specifically" },
      { value: 2, label: "I'm aware of this risk but we haven't formally adjusted our planning to account for it" },
      { value: 3, label: "We've built this into our estimating assumptions on some engagements" },
      { value: 4, label: "We have a consistent approach to AI delivery planning that accounts for this — with concrete examples to show" },
    ]
  },
  {
    id: 9,
    pillar: 'delivery',
    text: "When evaluating build vs. buy for AI components, my assessment includes total cost of ownership factors like data quality requirements, model drift, retraining costs, and explainability obligations:",
    context: "Leaders who skip these dimensions give advice that comes back to haunt them 12–18 months into implementation. AI TCO is structurally different from traditional software TCO.",
    options: [
      { value: 1, label: "I use our standard build vs. buy framework — AI-specific TCO factors haven't been added" },
      { value: 2, label: "I'm aware these factors matter but they're not part of my standard evaluation process yet" },
      { value: 3, label: "I factor some of these in — particularly data quality and cost — though not all systematically" },
      { value: 4, label: "AI-specific TCO is a defined part of how my team evaluates all build vs. buy decisions" },
    ]
  },
  {
    id: 10,
    pillar: 'delivery',
    text: "For support or managed services engagements in my portfolio, my approach to SLA design, incident response, and capacity planning has been updated to account for AI-driven anomalies and model failures:",
    context: "AI-powered systems fail in qualitatively different ways from traditional software. Managed services operating models built for conventional systems carry hidden risk when running AI-powered ones.",
    options: [
      { value: 1, label: "Our managed services model hasn't changed — AI-specific failure modes aren't yet factored in" },
      { value: 2, label: "We've had conversations about this but our SLAs and runbooks are still largely unchanged" },
      { value: 3, label: "We've updated some elements — particularly incident categorisation — but the overall model still needs work" },
      { value: 4, label: "Our managed services model explicitly accounts for AI failure modes, with updated SLAs and response playbooks" },
    ]
  },

  // ── PILLAR 3: Building an AI-Ready Team ──────────────────────────────────
  {
    id: 11,
    pillar: 'team',
    text: "In the last 12 months, I have made specific changes to hiring criteria, interview processes, or onboarding to reflect what an AI-augmented team actually needs:",
    context: "Not 'have you thought about AI skills' — but have you changed anything structural? The shift isn't just hiring AI engineers — it's updating the capability profile for every role.",
    options: [
      { value: 1, label: "Nothing has changed structurally — we hire the same way we always have" },
      { value: 2, label: "We've added AI to job descriptions but haven't changed how we assess for it" },
      { value: 3, label: "We've updated criteria for some roles and begun assessing AI fluency in interviews" },
      { value: 4, label: "We have a defined AI capability profile for every key role and our hiring process reflects it" },
    ]
  },
  {
    id: 12,
    pillar: 'team',
    text: "When I look at my mid-senior individual contributors — tech leads, delivery managers, solution architects — my understanding of who is genuinely AI-capable versus performing familiarity is:",
    context: "The difference between genuinely capable and 'performing familiarity' is one of the most important — and hardest — talent assessment challenges in IT services right now.",
    options: [
      { value: 1, label: "I'm going largely on trust and their self-representation — I haven't assessed this specifically" },
      { value: 2, label: "I have a general sense but it's based on informal observation, not a structured view" },
      { value: 3, label: "I have a reasonably clear picture, developed through deliberate conversations and work observations" },
      { value: 4, label: "I have a clear, evidence-based view of AI capability for each person in this group" },
    ]
  },
  {
    id: 13,
    pillar: 'team',
    text: "When a strong team member is visibly struggling to adapt to AI-augmented ways of working, my approach is:",
    context: "Leaders who say 'we haven't had this situation' likely aren't looking. The ability to distinguish a capability gap from a motivation gap — and respond differently to each — is a key leadership skill right now.",
    options: [
      { value: 1, label: "I haven't identified anyone in this situation — I'm not sure how I'd handle it" },
      { value: 2, label: "I'd give them general encouragement and point them to training resources" },
      { value: 3, label: "I'd have a direct conversation to understand the root cause and co-create a development plan" },
      { value: 4, label: "I have a structured approach to this — I've navigated it with specific people and have a playbook" },
    ]
  },
  {
    id: 14,
    pillar: 'team',
    text: "The way I structure opportunities for my team to experiment with AI — beyond individual tinkering — generates organisational learning rather than isolated personal skill-building:",
    context: "Individual experimentation doesn't compound. Shared retrospectives, team showcases, and structured experiment reviews do. Are you building collective capability or hoping your best people pull the rest along?",
    options: [
      { value: 1, label: "Experimentation is individual and informal — there's no structure around it" },
      { value: 2, label: "I encourage people to experiment but learning stays mostly within individuals" },
      { value: 3, label: "We have some shared learning mechanisms — team showcases or retrospectives — but they're not consistent" },
      { value: 4, label: "We have a defined rhythm for sharing AI experiments and learnings that the whole team participates in" },
    ]
  },
  {
    id: 15,
    pillar: 'team',
    text: "When a strong team member proposes an AI-driven process improvement that would reduce the team size needed for a delivery, I handle the tension between efficiency and team stability by:",
    context: "This is one of the hardest real dilemmas in IT services leadership today. How you navigate it reveals your values, commercial maturity, and ability to have honest conversations with your team about AI's implications.",
    options: [
      { value: 1, label: "I'd likely avoid implementing it to protect team stability and client relationships" },
      { value: 2, label: "I'd want to implement it but haven't yet worked out how to manage the people dimension" },
      { value: 3, label: "I'd implement it thoughtfully, with a plan for the affected team members, and have those conversations directly" },
      { value: 4, label: "I've navigated exactly this — I have a clear framework and can point to how I've handled it" },
    ]
  },

  // ── PILLAR 4: Managing Clients Through AI ────────────────────────────────
  {
    id: 16,
    pillar: 'clients',
    text: "A client's internal team has started using AI tools and is now questioning why our team's velocity isn't matching what they see internally. My preparation for this conversation is:",
    context: "Clients are becoming AI-literate faster than many vendor teams and they're asking uncomfortable questions. Leaders who haven't prepared for this are at serious relationship risk.",
    options: [
      { value: 1, label: "I haven't prepared for this — it would catch me off-guard" },
      { value: 2, label: "I'd draw on our relationship and explain our approach generally, but don't have specifics ready" },
      { value: 3, label: "I have a general narrative about our AI journey — though it's not yet tied to specific metrics" },
      { value: 4, label: "I'm fully prepared — I have data, examples, and a forward roadmap to walk them through" },
    ]
  },
  {
    id: 17,
    pillar: 'clients',
    text: "When my team uses AI tools in delivery, my handling of client concerns around IP, data privacy, and confidentiality — even when the client hasn't explicitly raised it — is:",
    context: "Leaders who proactively address AI data governance — rather than waiting for the client to raise it — are building a qualitatively different quality of trust relationship.",
    options: [
      { value: 1, label: "We wait for clients to raise these concerns before addressing them" },
      { value: 2, label: "We address it if asked, but it's not part of our standard delivery conversation" },
      { value: 3, label: "We raise it proactively in some client relationships — particularly higher-risk ones" },
      { value: 4, label: "This is standard in our onboarding and delivery governance for all AI-assisted work" },
    ]
  },
  {
    id: 18,
    pillar: 'clients',
    text: "When a client asks me to recommend an AI solution for a business problem in their domain, my ability to give a genuinely independent, well-reasoned recommendation — not defaulting to our partnerships or the most talked-about tool — is:",
    context: "Trusted advisor versus vendor. Clients are asking their IT services partners for AI guidance. Many get recommendations shaped more by commercial agreements than client need.",
    options: [
      { value: 1, label: "I'd default to our current partnerships and what our technical teams are already familiar with" },
      { value: 2, label: "I'd try to be balanced but I'm not confident I have enough independent depth to advise well" },
      { value: 3, label: "I have enough breadth to give a reasonably independent view — though I'm more confident in some domains than others" },
      { value: 4, label: "I can give a credible, genuinely independent recommendation — clients have told me this is one of my differentiators" },
    ]
  },
  {
    id: 19,
    pillar: 'clients',
    text: "Thinking about a client relationship where AI created friction — a failed initiative, an overblown promise, or a misalignment on realistic outcomes — how I handled or would handle it:",
    context: "Leaders who can't bring a concrete example to mind either haven't been engaging deeply enough with AI in client work, or aren't reflecting honestly on where things have gone wrong.",
    options: [
      { value: 1, label: "I haven't experienced this yet — I'm not sure how I'd approach it" },
      { value: 2, label: "I'd acknowledge it and manage the relationship, but don't have a structured approach" },
      { value: 3, label: "I've navigated something similar — I addressed it directly and extracted learnings from it" },
      { value: 4, label: "I have a clear approach to AI-specific client friction — including how to reset expectations and rebuild trust" },
    ]
  },
  {
    id: 20,
    pillar: 'clients',
    text: "My proactivity in helping clients build internal AI literacy and capability — not just delivering AI solutions to them, but thinking about their long-term ability to be a more sophisticated partner — is:",
    context: "Leaders who think this way are operating as genuine strategic partners. Those who don't are optimising for short-term delivery revenue at the cost of long-term account stickiness.",
    options: [
      { value: 1, label: "I focus on delivering what's in scope — client capability building isn't currently part of my mandate" },
      { value: 2, label: "I'd be open to it but haven't found a natural way to introduce it into client conversations" },
      { value: 3, label: "I've raised this with some clients and had meaningful conversations about their AI maturity" },
      { value: 4, label: "Helping clients build AI capability is a deliberate part of how I manage strategic accounts" },
    ]
  },

  // ── PILLAR 5: Leading with AI — Personal Practice ─────────────────────────
  {
    id: 21,
    pillar: 'personal',
    text: "Beyond occasional use, AI plays a role in how I personally prepare for important leadership moments — client escalations, team performance conversations, bid reviews, strategic planning:",
    context: "Many leaders use AI for low-stakes tasks. Fewer use it when the stakes are high — which is where it's most valuable and where doing so signals real conviction.",
    options: [
      { value: 1, label: "I don't currently use AI to prepare for leadership-critical moments" },
      { value: 2, label: "I use it occasionally for low-stakes tasks but not for consequential leadership moments" },
      { value: 3, label: "I use it regularly for important preparation — structuring arguments, stress-testing decisions, drafting key communications" },
      { value: 4, label: "AI-assisted preparation is a consistent part of how I approach every significant leadership moment" },
    ]
  },
  {
    id: 22,
    pillar: 'personal',
    text: "When I encounter an AI tool or capability I don't fully understand, my typical response — and how it compares to what I expect from my team — is:",
    context: "This surfaces the 'do as I say, not as I do' gap that undermines AI leadership credibility. It also measures intellectual humility — critical for navigating genuine technological uncertainty.",
    options: [
      { value: 1, label: "I tend to defer to my technical team — I hold myself to a different standard than I do them" },
      { value: 2, label: "I acknowledge the gap but don't actively close it — I expect more curiosity from my team than I model" },
      { value: 3, label: "I engage with it — I try to understand enough to have an informed view, similar to what I'd ask of my team" },
      { value: 4, label: "I actively explore it, document what I learn, and share it — I model the same intellectual curiosity I expect" },
    ]
  },
  {
    id: 23,
    pillar: 'personal',
    text: "My mental model of what 'good' looks like — in delivery, in client management, in team development — has changed specifically because of what I've learned about AI in the last 18 months:",
    context: "Real AI leadership means updating your priors. Adding AI as a feature on top of unchanged mental models isn't transformation — it's decoration.",
    options: [
      { value: 1, label: "My standards for good performance haven't materially changed — AI is a tool, not a redefinition of excellence" },
      { value: 2, label: "I've updated my thinking in some areas but my core benchmarks remain largely the same" },
      { value: 3, label: "AI has genuinely shifted what I consider excellent in several key areas — I'd describe this differently than I would have two years ago" },
      { value: 4, label: "My entire framework for evaluating excellence has been reshaped — I could articulate specifically how and why" },
    ]
  },
  {
    id: 24,
    pillar: 'personal',
    text: "Thinking about the most consequential decision I've made in the last 6 months — commercial, people, or delivery — AI-assisted thinking played a role in how I processed it:",
    context: "This distinguishes leaders who reach for AI when it genuinely matters from those who use it only for convenience. High-stakes decisions are where AI assistance has the most leverage.",
    options: [
      { value: 1, label: "It played no role — I processed that decision the same way I always have" },
      { value: 2, label: "It wasn't part of how I approached it, though I can see how it could have been useful" },
      { value: 3, label: "I used AI to help structure my thinking or pressure-test my reasoning at some point in the process" },
      { value: 4, label: "AI-assisted thinking was a deliberate and meaningful part of how I worked through that decision" },
    ]
  },
  {
    id: 25,
    pillar: 'personal',
    text: "If my team were asked to rate my AI leadership — my own visible practice, my encouragement of their experimentation, my awareness of what's happening in AI — I believe they would say:",
    context: "The gap between how leaders perceive their own AI leadership and how their teams experience it is one of the most revealing data points in any AI capability assessment.",
    options: [
      { value: 1, label: "They'd say AI isn't something I visibly model or actively lead on" },
      { value: 2, label: "They'd say I support it but it's not something I demonstrate personally and consistently" },
      { value: 3, label: "They'd say I'm engaged and credible — I ask good questions and show genuine curiosity" },
      { value: 4, label: "They'd say I'm a visible AI leader — I'm the person they point to when asked who sets the tone" },
    ]
  },
];

// ─── Scoring helpers ───────────────────────────────────────────────────────
const calculateResults = (answers) => {
  const pillarRaw = {};
  PILLARS.forEach(p => { pillarRaw[p.id] = 0; });

  questions.forEach((q) => {
    const val = answers[q.id] || 1;
    pillarRaw[q.pillar] += val;
  });

  const totalRaw   = Object.values(pillarRaw).reduce((a, b) => a + b, 0);
  const maxPossible = questions.length * 4; // 25 × 4 = 100
  const percentageScore = Math.round((totalRaw / maxPossible) * 100);

  return { pillarRaw, totalRaw, maxPossible, percentageScore, profile: getProfile(percentageScore) };
};

const getProfile = (score) => {
  if (score >= 85) return {
    name: 'The AI Catalyst',
    tagline: 'Driving AI-led transformation across your business, your team, and yourself.',
    color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50', border: 'border-green-200',
    summary: 'You are operating at the frontier of AI leadership in IT services. You have moved beyond personal practice and team enablement into genuinely reshaping how your business competes, how your clients think about AI, and how your team understands the future of their roles. Leaders at this level are rare — and they are the ones defining what the next era of IT services looks like.',
    strengths: [
      'Creating genuine competitive advantage through AI leadership, not just AI adoption',
      'Clients see you as a trusted AI advisor, not just a delivery partner',
      'Developing the next generation of AI-capable leaders in your organisation',
    ],
    focusAreas: [
      'Identify the 1–2 pillars where you scored lowest — even Catalysts have blind spots',
      'Consider how you share and scale your AI leadership approach across your broader peer group',
      'Push into the most uncertain frontiers: pricing model transformation, AI governance at scale, client executive AI literacy',
    ],
    effilorHook: 'Effilor partners with AI Catalysts to design leadership programmes that propagate this capability across their organisations and client ecosystems.',
  };
  if (score >= 65) return {
    name: 'The AI Integrator',
    tagline: 'Embedding AI across delivery and team — a strong foundation, but the ceiling is higher.',
    color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50', border: 'border-blue-200',
    summary: 'You are leading with AI in meaningful, observable ways. Your team knows where you stand, your delivery processes have been updated, and you are engaging clients on AI with real confidence. The gap for leaders at this level is typically in the most strategically sophisticated areas: competitive positioning, commercial model evolution, and the trusted-advisor AI conversations that truly differentiate you.',
    strengths: [
      'You have moved from talking about AI to making structural changes because of it',
      'Your team sees your personal practice and feels permission to experiment themselves',
      'You are managing AI delivery risk more consciously than most of your peers',
    ],
    focusAreas: [
      'Develop a specific, differentiated AI narrative for your top 3 accounts — by industry and client context',
      'Revisit your commercial model: T&M billing, SLA design, and team sizing assumptions all need stress-testing',
      'Build a structured AI capability assessment for your mid-senior team — move beyond intuition to evidence',
    ],
    effilorHook: 'Effilor\'s strategic AI advisory work focuses on the transition from strong practitioner to market-differentiating AI leader.',
  };
  if (score >= 45) return {
    name: 'The AI Explorer',
    tagline: 'Experimenting individually, but not yet leading systemically.',
    color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50', border: 'border-yellow-200',
    summary: 'You are personally engaged with AI and you have real examples of using it thoughtfully. But your practice is largely individual. Your team, your delivery governance, your client relationships, and your commercial model have not been systematically reshaped to reflect what you know. This is the most common profile among experienced IT services leaders right now: genuine personal curiosity combined with organisational inertia.',
    strengths: [
      'Hands-on experience that gives you credibility when talking with your team',
      'Asking the right questions, even if the answers are still forming',
      'Enough AI fluency to recognise good advice from bad when you hear it',
    ],
    focusAreas: [
      'Translate your personal AI practice into team rituals — structured experimentation, shared learnings, updated review processes',
      'Audit your top 2 client relationships for AI-related risk and opportunity — IP concerns, competitive positioning, pricing exposure',
      'Update at least one delivery governance document to reflect AI-specific quality and security standards',
    ],
    effilorHook: 'Effilor works with leaders at this stage to build the organisational scaffolding that turns individual AI enthusiasm into team-wide capability.',
  };
  return {
    name: 'The AI Bystander',
    tagline: 'Watching from the sideline while the game changes around you.',
    color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50', border: 'border-orange-200',
    summary: 'You have a foundational awareness of AI and its relevance to IT services, but it has not yet translated into structured thinking, deliberate practice, or changes to how you lead. The risk here is not that you are uninformed — it is that the gap between awareness and action is widening faster than it appears. Clients, competitors, and your own team members are moving, and the cost of catching up increases every quarter.',
    strengths: [
      'You recognise AI as important — which is the necessary first step',
      'You have not made costly mistakes by rushing in without understanding',
      'You have significant headroom to grow quickly with the right focus',
    ],
    focusAreas: [
      'Commit to a 30-day personal AI practice — use it daily in your leadership work, not just for curiosity',
      'Have one structured conversation with your team this week about where AI already shows up in your delivery',
      'Pick one upcoming client conversation and prepare an AI-specific point of view before you walk in',
    ],
    effilorHook: 'Effilor\'s AI Leadership Accelerator is designed for exactly this transition — moving from awareness to structured practice in a way that sticks.',
  };
};

const getPillarLevel = (pct) => {
  if (pct >= 80) return { name: 'Strong',      color: 'bg-green-100 text-green-800' };
  if (pct >= 60) return { name: 'Developing',  color: 'bg-blue-100 text-blue-800' };
  if (pct >= 40) return { name: 'Emerging',    color: 'bg-yellow-100 text-yellow-800' };
  return              { name: 'Needs Focus', color: 'bg-red-100 text-red-800' };
};

// ─── PDF generation ────────────────────────────────────────────────────────
const generatePDF = (userData, answers) => {
  const doc = new jsPDF();
  const results = calculateResults(answers);
  const { pillarRaw, percentageScore, profile } = results;

  doc.setFontSize(22);
  doc.setTextColor(45, 45, 143); // NAVY
  doc.text('Effilor Consulting Services', 20, 20);

  doc.setFontSize(13);
  doc.setTextColor(107, 61, 122); // PURPLE
  doc.text('AI Mindset Assessment — Personalised Report', 20, 30);

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
  doc.text(`${percentageScore}%`, 20, 95);

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
  PILLARS.forEach((p) => {
    const raw = pillarRaw[p.id] || 0;
    const pct = Math.round((raw / p.maxRaw) * 100);
    const level = getPillarLevel(pct);
    doc.setTextColor(60);
    doc.text(`${p.label}: ${pct}%  [${level.name}]`, 20, y);
    y += 8;
  });

  y += 5;
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Focus Areas', 20, y);
  y += 8;
  doc.setFontSize(10);
  profile.focusAreas.forEach((fa) => {
    const lines = doc.splitTextToSize(`• ${fa}`, 170);
    doc.setTextColor(60);
    doc.text(lines, 20, y);
    y += lines.length * 5 + 3;
  });

  y += 5;
  doc.setFontSize(10);
  doc.setTextColor(107, 61, 122);
  doc.text('How Effilor can help:', 20, y);
  y += 6;
  doc.setTextColor(60);
  const hookLines = doc.splitTextToSize(profile.effilorHook, 170);
  doc.text(hookLines, 20, y);

  doc.save(`Effilor-AI-Mindset-${userData.name.replace(/\s+/g, '-')}.pdf`);
};

// ─── Shared Header ─────────────────────────────────────────────────────────
const Header = () => (
  <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 px-6 py-3 flex items-center justify-between">
    <img src={LOGO_URL} alt="Effilor Consulting Services" className="h-10 w-auto" />
    <span className="text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
      style={{ background: 'rgba(107,61,122,0.1)', color: PURPLE }}>
      AI Mindset Assessment
    </span>
  </div>
);

// ─── Main App ──────────────────────────────────────────────────────────────
const App = () => {
  const [currentScreen, setCurrentScreen]   = useState('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers]               = useState({});
  const [userData, setUserData]             = useState({ name: '', email: '', company: '', designation: '', phone: '' });
  const [submitting, setSubmitting]         = useState(false);
  const [submitError, setSubmitError]       = useState('');

  // ── Welcome screen ─────────────────────────────────────────────────────
  if (currentScreen === 'welcome') {
    const pillarsPreview = [
      { num: '01', label: 'Winning & Growing with AI',           desc: 'How AI changes the way you sell, price, scope, and defend accounts' },
      { num: '02', label: 'Delivering with AI',                  desc: 'How AI changes what you build, how you govern quality, and what risk looks like' },
      { num: '03', label: 'Building an AI-Ready Team',           desc: 'How you develop, assess, and lead people in an AI-shifting landscape' },
      { num: '04', label: 'Managing Clients Through AI',         desc: 'How AI is changing client trust, expectations, and the advisor relationship' },
      { num: '05', label: 'Leading with AI — Personal Practice', desc: 'Your own habits, credibility, and intellectual engagement with AI' },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900">
        <Header />
        <div className="max-w-4xl mx-auto px-4 pt-28 pb-20">

          {/* Hero */}
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-indigo-300 border border-indigo-500 rounded-full px-4 py-1.5 mb-6">
              For IT Services Leaders · 12–20 Years Experience
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
              Where do you <span className="italic text-purple-300">really</span><br />stand on AI leadership?
            </h1>
            <p className="text-lg text-indigo-200 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              Not a quiz about tools. Not a check-box on prompt engineering.
              A serious diagnostic across the five dimensions that are actually reshaping
              what effective IT services leadership looks like.
            </p>
            <div className="flex items-center justify-center gap-8 text-indigo-300 text-sm mb-12 flex-wrap">
              <span>📋 25 questions</span>
              <span>⏱ ~12 minutes</span>
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

          {/* Pillars */}
          <div className="mb-12">
            <p className="text-center text-indigo-300 text-sm font-semibold tracking-widest uppercase mb-8">
              Five dimensions this assessment covers
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pillarsPreview.map((p) => (
                <div key={p.num} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <p className="text-purple-300 text-xs font-bold tracking-widest uppercase mb-2">Pillar {p.num}</p>
                  <h3 className="text-white font-bold text-base mb-2 leading-snug">{p.label}</h3>
                  <p className="text-indigo-300 text-sm leading-relaxed font-light">{p.desc}</p>
                </div>
              ))}
              {/* Scale explainer card */}
              <div className="bg-purple-900/50 border border-purple-500/30 rounded-2xl p-5">
                <p className="text-purple-300 text-xs font-bold tracking-widest uppercase mb-3">How to answer</p>
                <div className="space-y-2 text-sm">
                  {[
                    { l: 'Not yet',    d: "Haven't thought about this structurally" },
                    { l: 'Aware',      d: 'Had informal conversations about it' },
                    { l: 'Practicing', d: 'Have a concrete example I could share' },
                    { l: 'Embedded',   d: 'My team/clients would confirm this' },
                  ].map(s => (
                    <div key={s.l} className="flex gap-2">
                      <span className="text-purple-300 font-semibold w-20 shrink-0">{s.l}</span>
                      <span className="text-indigo-300 font-light">{s.d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Questions screen ────────────────────────────────────────────────────
  if (currentScreen === 'questions') {
    const q        = questions[currentQuestion];
    const progress = Math.round(((currentQuestion) / questions.length) * 100);
    const pillarIdx = PILLARS.findIndex(p => p.id === q.pillar);
    const pillarLabel = PILLARS[pillarIdx]?.label || '';

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
        <div className="max-w-3xl mx-auto px-4 py-12 pt-24">

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span className="font-medium" style={{ color: PURPLE }}>
                Pillar {pillarIdx + 1} of {PILLARS.length}: {pillarLabel}
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
              Question {currentQuestion + 1}
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-5 leading-snug">
              {q.text}
            </h2>
            <div className="bg-indigo-50 border-l-4 rounded-r-xl p-4 mb-8" style={{ borderColor: NAVY }}>
              <p className="text-sm text-indigo-800 leading-relaxed italic font-light">{q.context}</p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {q.options.map((opt) => {
                const isSelected = answers[q.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleAnswer(opt.value)}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-150 flex items-start gap-4 group
                      ${isSelected
                        ? 'text-white shadow-lg scale-[1.01]'
                        : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-800'
                      }`}
                    style={isSelected
                      ? { background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})`, borderColor: NAVY }
                      : {}
                    }
                  >
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs transition-all
                      ${isSelected ? 'bg-white border-white text-purple-700' : 'border-gray-300 text-gray-400 group-hover:border-purple-400'}`}>
                      {opt.value}
                    </div>
                    <span className={`text-sm leading-relaxed font-medium ${isSelected ? 'text-white' : ''}`}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Back button */}
          <div className="flex justify-start">
            <button onClick={goBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {currentQuestion === 0 ? 'Back to Start' : 'Previous question'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Results screen ─────────────────────────────────────────────────────
  if (currentScreen === 'results') {
    const results = calculateResults(answers);
    const { pillarRaw, percentageScore, profile } = results;

    const radarData = PILLARS.map(p => ({
      pillar: p.short,
      score: Math.round((pillarRaw[p.id] / p.maxRaw) * 100),
    }));

    const barData = PILLARS.map(p => ({
      name: p.short,
      score: Math.round((pillarRaw[p.id] / p.maxRaw) * 100),
    }));

    const topPillar      = [...PILLARS].sort((a, b) => (pillarRaw[b.id] || 0) - (pillarRaw[a.id] || 0))[0];
    const weakestPillar  = [...PILLARS].sort((a, b) => (pillarRaw[a.id] || 0) - (pillarRaw[b.id] || 0))[0];

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 pt-24">

          {/* Hero score */}
          <div className="text-center mb-10 py-12 rounded-3xl text-white shadow-2xl"
            style={{ background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` }}>
            <p className="text-indigo-200 text-sm font-semibold tracking-widest uppercase mb-3">Your AI Mindset Profile</p>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">{profile.name}</h1>
            <p className="text-indigo-200 text-lg italic font-light mb-8 max-w-xl mx-auto">{profile.tagline}</p>
            <div className="inline-flex items-baseline gap-1 bg-white/15 border border-white/20 px-8 py-4 rounded-2xl">
              <span className="text-6xl font-extrabold">{percentageScore}</span>
              <span className="text-2xl text-white/50">/ 100</span>
            </div>
          </div>

          {/* Profile summary */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What this means for you</h2>
            <p className="text-gray-600 leading-relaxed">{profile.summary}</p>
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
                  <Tooltip formatter={(v) => [`${v}%`, 'Score']} />
                  <Bar dataKey="score" fill={PURPLE} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top strength & priority area */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className={`${profile.bgLight} border-2 ${profile.border} rounded-3xl p-6`}>
              <h3 className={`text-xl font-bold ${profile.textColor} mb-2`}>🎯 Your Strongest Pillar</h3>
              <p className="text-lg font-semibold text-gray-900 mb-1">{topPillar.label}</p>
              <p className={`${profile.textColor} font-bold text-2xl mb-3`}>
                {Math.round((pillarRaw[topPillar.id] / topPillar.maxRaw) * 100)}%
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">
                This is the dimension where you are furthest ahead. Use this as a foundation and a credibility anchor with your team and clients.
              </p>
            </div>
            <div className="bg-orange-50 border-2 border-orange-200 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-orange-800 mb-2">⚡ Priority Focus Area</h3>
              <p className="text-lg font-semibold text-gray-900 mb-1">{weakestPillar.label}</p>
              <p className="text-orange-700 font-bold text-2xl mb-3">
                {Math.round((pillarRaw[weakestPillar.id] / weakestPillar.maxRaw) * 100)}%
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">
                Focusing here will have the greatest impact on your overall AI leadership effectiveness.
              </p>
            </div>
          </div>

          {/* Detailed pillar breakdown */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Detailed Pillar Analysis</h3>
            <div className="space-y-6">
              {PILLARS.map((p) => {
                const raw = pillarRaw[p.id] || 0;
                const pct = Math.round((raw / p.maxRaw) * 100);
                const level = getPillarLevel(pct);
                return (
                  <div key={p.id} className="border-l-4 pl-6" style={{ borderColor: PURPLE }}>
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <h4 className="text-lg font-bold text-gray-900">{p.label}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${level.color}`}>{level.name}</span>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl font-bold" style={{ color: PURPLE }}>{pct}%</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${NAVY}, ${PURPLE})` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths & Focus areas */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-green-50 border-2 border-green-200 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-green-800 mb-4">✅ What's Working</h3>
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

          {/* Effilor hook */}
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

          {/* CTA to report form */}
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Want a personalised written report?</h3>
            <p className="text-gray-600 mb-6 font-light">
              Share your details and the Effilor team will prepare a detailed report — with specific
              recommendations for your profile — and deliver it within 48 hours.
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

          {/* Additional links */}
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

  // ── Email capture screen ────────────────────────────────────────────────
  if (currentScreen === 'email') {
    const handleEmailSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      setSubmitError('');

      try {
        const results = calculateResults(answers);
        const pillarSummary = PILLARS.map(p => ({
          pillar: p.label,
          score: `${Math.round((results.pillarRaw[p.id] / p.maxRaw) * 100)}%`,
        }));

        const answerDetail = questions.map(q => ({
          question: q.text,
          answer: q.options.find(o => o.value === answers[q.id])?.label || 'Not answered',
        }));

        const res = await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userData,
            profile:       results.profile.name,
            totalScore:    results.percentageScore,
            pillarSummary,
            answerDetail,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to submit. Please try again.');
        }

        // Trigger PDF download on success
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
        <div className="max-w-2xl mx-auto px-4 py-12 pt-24">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: `linear-gradient(135deg, ${NAVY}, ${PURPLE})` }}>
                <Download className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Get Your Personalised Report</h2>
              <p className="text-gray-600 font-light leading-relaxed">
                The Effilor team will prepare a detailed written report based on your results
                and have it with you within 48 hours. A PDF summary will also download immediately.
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-5">
              {[
                { field: 'name',        label: 'Full name',        placeholder: 'Rajiv Krishnamurthy',        type: 'text',  required: true },
                { field: 'designation', label: 'Designation',      placeholder: 'VP Engineering / BU Head',   type: 'text',  required: true },
                { field: 'company',     label: 'Organisation',     placeholder: 'Your company name',          type: 'text',  required: true },
                { field: 'email',       label: 'Work email',       placeholder: 'you@yourcompany.com',        type: 'email', required: true },
                { field: 'phone',       label: 'Phone (optional)', placeholder: '+91 98xxx xxxxx',            type: 'tel',   required: false },
              ].map(({ field, label, placeholder, type, required }) => (
                <div key={field}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {label} {required && <span style={{ color: PURPLE }}>*</span>}
                  </label>
                  <input
                    type={type}
                    required={required}
                    value={userData[field]}
                    onChange={(e) => setUserData({ ...userData, [field]: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none transition-colors bg-gray-50 text-gray-900"
                    style={{ '--tw-ring-color': PURPLE }}
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
                {submitting ? (
                  <><span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> Sending...</>
                ) : (
                  <><Download className="w-5 h-5" /> Request Full Report</>
                )}
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
              We respect your privacy. Your information is only used to send your report
              and will never be shared with third parties.
            </p>

            <div className="text-center mt-4">
              <button onClick={() => setCurrentScreen('results')}
                className="text-sm text-gray-400 hover:text-gray-600 underline">
                ← Back to my results
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Thank you screen ────────────────────────────────────────────────────
  if (currentScreen === 'thankyou') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-12 pt-24">
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
              <h3 className="text-xl font-bold text-gray-900 mb-4">What's Next?</h3>
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
              At Effilor Consulting Services, we specialise in Growth & Strategy,
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

