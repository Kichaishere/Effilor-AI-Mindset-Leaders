# effilor-ai-mindset

AI Mindset Assessment for IT Services Leaders — Effilor Consulting Services

**Companion to:** https://github.com/Effilor/effilor-growth-mindset  
**Built with:** Vite + React + Tailwind CSS + Recharts (same stack as growth-mindset)

---

## What this does

| Step | What happens |
|------|-------------|
| 1 | Visitor takes 25-question assessment across 5 pillars — no sign-up required |
| 2 | Instant results: profile, radar chart, pillar scores, strengths, focus areas |
| 3 | Optional: fill in name / designation / org / email / phone to request a full report |
| 4 | `/api/send-notification` fires — sends full submission to krishnaswamy.subramanian@effilor.com via Sender |
| 5 | PDF summary downloads client-side immediately; Krishna sends personalised report within 48h |

## The Five Pillars

1. **Winning & Growing with AI** — competitive positioning, proposals, pricing models  
2. **Delivering with AI** — governance, quality, managed services, build vs buy  
3. **Building an AI-Ready Team** — hiring, capability assessment, team development  
4. **Managing Clients Through AI** — trust, IP, advisor vs vendor, client literacy  
5. **Leading with AI — Personal Practice** — own habits, modelling, mental model evolution  

## Setup

```bash
git clone https://github.com/Effilor/effilor-ai-mindset.git
cd effilor-ai-mindset
npm install
```

Copy the Effilor logo into `/public/effilor-logo.jpg`

```bash
cp .env.local.example .env.local
# Edit .env.local and add your Sender API key
npm run dev
```

## Sender configuration

1. Log in to [app.sender.net](https://app.sender.net) → Settings → API → Create key
2. Verify `assessment@effilor.com` as an approved sender domain
3. Add `SENDER_API_KEY=your_key` to `.env.local` locally, and to Vercel Environment Variables for production

> The API key lives **server-side only** in `/api/send-notification.js` — it is never exposed to the browser.

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or: GitHub → Vercel dashboard → New Project → Import → add `SENDER_API_KEY` env var → Deploy.

## File structure

```
effilor-ai-mindset/
├── api/
│   └── send-notification.js   # Serverless function — Sender API call
├── public/
│   └── effilor-logo.jpg        # ← copy here
├── src/
│   ├── App.jsx                 # All screens + questions + scoring + PDF
│   ├── main.jsx                # Entry point
│   └── index.css               # Tailwind directives
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Profiles & scoring

| Score | Profile |
|-------|---------|
| 85–100% | The AI Catalyst |
| 65–84%  | The AI Integrator |
| 45–64%  | The AI Explorer |
| 0–44%   | The AI Bystander |

Max score: 25 questions × 4 = 100 points.
