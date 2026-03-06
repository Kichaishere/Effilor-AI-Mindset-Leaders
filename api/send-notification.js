// api/send-notification.js
// Vercel Serverless Function — runs server-side, keeps API key safe
// Matches the pattern of /api/send-notification.js in effilor-growth-mindset

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userData, profile, totalScore, pillarSummary, answerDetail } = req.body;

  if (!userData?.email || !userData?.name) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // ── Build plain-text email body ──────────────────────────────────────────
  const pillarLines = pillarSummary
    .map(p => `  • ${p.pillar}: ${p.score}`)
    .join('\n');

  const answerLines = answerDetail
    .map((a, i) => `  Q${i + 1}. ${a.question.substring(0, 90)}...\n       → ${a.answer}`)
    .join('\n\n');

  const emailText = `
AI Mindset Assessment — New Submission
=======================================

CONTACT DETAILS
Name:         ${userData.name}
Designation:  ${userData.designation || '—'}
Organisation: ${userData.company || '—'}
Email:        ${userData.email}
Phone:        ${userData.phone || 'Not provided'}
Submitted:    ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST

ASSESSMENT RESULT
Profile:      ${profile}
Total Score:  ${totalScore}%

PILLAR SCORES
${pillarLines}

FULL ANSWER BREAKDOWN
${answerLines}

---
Submitted via Effilor AI Mindset Assessment
  `.trim();

  // ── HTML version ─────────────────────────────────────────────────────────
  const pillarHtml = pillarSummary
    .map(p => `<tr><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;">${p.pillar}</td><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;font-weight:700;color:#6B3D7A;">${p.score}</td></tr>`)
    .join('');

  const answerHtml = answerDetail
    .map((a, i) => `
      <div style="margin-bottom:16px;padding:14px;background:#f9f9f9;border-radius:8px;border-left:3px solid #2D2D8F;">
        <p style="margin:0 0 6px;font-size:13px;color:#555;">Q${i + 1}. ${a.question}</p>
        <p style="margin:0;font-size:13px;font-weight:600;color:#2D2D8F;">→ ${a.answer}</p>
      </div>`)
    .join('');

  const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Inter,sans-serif;max-width:700px;margin:0 auto;color:#1a1a2e;">

  <div style="background:linear-gradient(135deg,#2D2D8F,#6B3D7A);padding:32px;border-radius:12px 12px 0 0;text-align:center;">
    <h1 style="color:white;margin:0;font-size:22px;">AI Mindset Assessment</h1>
    <p style="color:rgba(255,255,255,0.75);margin:8px 0 0;font-size:14px;">New submission — action required</p>
  </div>

  <div style="background:white;padding:32px;border:1px solid #e8e6f0;border-top:none;">

    <h2 style="color:#2D2D8F;font-size:18px;margin-bottom:16px;">Contact Details</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
      <tr><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;color:#888;width:140px;">Name</td><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;font-weight:600;">${userData.name}</td></tr>
      <tr><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;color:#888;">Designation</td><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;">${userData.designation || '—'}</td></tr>
      <tr><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;color:#888;">Organisation</td><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;">${userData.company || '—'}</td></tr>
      <tr><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;color:#888;">Email</td><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;"><a href="mailto:${userData.email}" style="color:#6B3D7A;">${userData.email}</a></td></tr>
      <tr><td style="padding:6px 12px;color:#888;">Phone</td><td style="padding:6px 12px;">${userData.phone || 'Not provided'}</td></tr>
    </table>

    <h2 style="color:#2D2D8F;font-size:18px;margin-bottom:8px;">Assessment Result</h2>
    <div style="background:linear-gradient(135deg,#2D2D8F,#6B3D7A);color:white;padding:20px 24px;border-radius:12px;margin-bottom:28px;">
      <p style="margin:0 0 6px;font-size:13px;opacity:0.75;text-transform:uppercase;letter-spacing:0.1em;">Profile</p>
      <p style="margin:0 0 12px;font-size:24px;font-weight:800;">${profile}</p>
      <p style="margin:0;font-size:13px;opacity:0.75;">Overall Score: <strong style="font-size:20px;opacity:1;">${totalScore}%</strong></p>
    </div>

    <h2 style="color:#2D2D8F;font-size:18px;margin-bottom:12px;">Pillar Scores</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
      <tr style="background:#f8f7f4;"><th style="padding:8px 12px;text-align:left;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.05em;">Pillar</th><th style="padding:8px 12px;text-align:left;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.05em;">Score</th></tr>
      ${pillarHtml}
    </table>

    <h2 style="color:#2D2D8F;font-size:18px;margin-bottom:12px;">Full Answer Breakdown</h2>
    ${answerHtml}

  </div>

  <div style="background:#f8f7f4;padding:20px;border-radius:0 0 12px 12px;text-align:center;border:1px solid #e8e6f0;border-top:none;">
    <p style="margin:0;font-size:12px;color:#aaa;">Effilor AI Mindset Assessment · ${new Date().toLocaleDateString('en-IN')}</p>
  </div>

</body>
</html>
  `.trim();

  // ── Call Sender API ───────────────────────────────────────────────────────
  const SENDER_API_KEY = process.env.SENDER_API_KEY;

  if (!SENDER_API_KEY) {
    // In development without a key: log and succeed silently
    console.log('=== SENDER API KEY NOT SET — logging submission ===');
    console.log({ userData, profile, totalScore, pillarSummary });
    return res.status(200).json({ ok: true, dev: true });
  }

  try {
    const senderRes = await fetch('https://api.sender.net/v2/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDER_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        from: {
          name: 'Effilor AI Assessment',
          email: 'assessment@effilor.com', // ← must be verified in your Sender account
        },
        to: [
          {
            name: 'Krishna',
            email: 'krishnaswamy.subramanian@effilor.com',
          },
        ],
        reply_to: userData.email,
        subject: `AI Mindset: ${userData.name} (${userData.company || 'unknown org'}) — ${profile} · ${totalScore}%`,
        text: emailText,
        html: emailHtml,
      }),
    });

    if (!senderRes.ok) {
      const errBody = await senderRes.json().catch(() => ({}));
      console.error('Sender API error:', errBody);
      return res.status(500).json({ message: errBody?.message || 'Email send failed' });
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('Sender fetch error:', err);
    return res.status(500).json({ message: 'Internal error sending email' });
  }
}

