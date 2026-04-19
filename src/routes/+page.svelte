<!-- src/routes/page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { theme } from '$lib/stores/theme';
  import {
    BookOpen, FileText, ClipboardList, CreditCard, QrCode,
    Bell, Footprints, Calendar, Megaphone, Layers,
    ArrowRight, File, DollarSign, AlertTriangle,
    Library, Building2, GraduationCap
  } from 'lucide-svelte';
  import UniversityCTA from '$lib/components/UniversityCTA.svelte';

  onMount(() => {
    theme.init();
  });
</script>

<svelte:head>
  <title>Sabify — Not by might, but by Sabify</title>
  <meta name="description" content="The academic platform for Nigerian and West African university students. Past questions, departmental dues, campus safety, events, and more." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet" />
</svelte:head>


<!-- ── HERO ─────────────────────────────────────────────────────── -->
<section class="hero">
  <div class="hero-inner">
    <div class="hero-badge">
      <span class="badge-dot" aria-hidden="true"></span>
      <span>Launching across West Africa</span>
    </div>

    <h1 class="hero-title">
      Not by might,<br />
      <em>but by Sabify.</em>
    </h1>

    <p class="hero-subtitle">
      Past questions. Departmental dues. Campus safety. Events. Assignments. Textbooks.
      Everything your university never gave you.
    </p>

    <div class="hero-actions">
      <a href="/register" class="btn-primary">
        Get started <ArrowRight size={17} />
      </a>
      <a href="#problems" class="btn-secondary">See how it works</a>
    </div>
  </div>
</section>

<!-- ── REAL PROBLEMS ─────────────────────────────────────────────── -->
<section id="problems" class="section">
  <div class="container">
    <div class="section-header">
      <div class="section-label">Real problems. Real solutions.</div>
      <h2 class="section-title">What actually breaks at Nigerian universities</h2>
      <p class="section-subtitle">We asked students across West Africa. Here's what they said.</p>
    </div>

    <div class="problems-grid">
      <div class="problem-card">
        <div class="card-icon"><FileText size={24} /></div>
        <h3>"Who has last year's past question?"</h3>
        <p>No more chasing seniors at 2am. Every past test from every department, organized and searchable.</p>
        <span class="problem-tag">Solved → Centralized library</span>
      </div>
      <div class="problem-card">
        <div class="card-icon"><DollarSign size={24} /></div>
        <h3>"I paid my dues, where's my receipt?"</h3>
        <p>Departmental dues disappear into thin air. Get a tamper-proof QR receipt. Instant audit trail.</p>
        <span class="problem-tag">Solved → Digital receipts</span>
      </div>
      <div class="problem-card">
        <div class="card-icon"><AlertTriangle size={24} /></div>
        <h3>"No one told me the exam was rescheduled"</h3>
        <p>Important announcements get lost in WhatsApp groups. Get real-time alerts that actually reach you.</p>
        <span class="problem-tag">Solved → Campus alerts</span>
      </div>
      <div class="problem-card">
        <div class="card-icon"><ClipboardList size={24} /></div>
        <h3>"The lecturer said I never submitted"</h3>
        <p>Physical submissions have no proof. Timestamp your hand-in with photo evidence. End the blame game.</p>
        <span class="problem-tag">Solved → Submission logbook</span>
      </div>
      <div class="problem-card">
        <div class="card-icon"><Footprints size={24} /></div>
        <h3>"Walking back from library at 10pm is risky"</h3>
        <p>Share your walk with trusted friends. If you don't check in, they get notified. Campus safety, built in.</p>
        <span class="problem-tag">Solved → Safe-walk</span>
      </div>
      <div class="problem-card">
        <div class="card-icon"><Calendar size={24} /></div>
        <h3>"I missed the department's career talk"</h3>
        <p>Events get announced once on a notice board. Get every departmental lecture, seminar, and deadline in one calendar.</p>
        <span class="problem-tag">Solved → Events hub</span>
      </div>
    </div>
  </div>
</section>

<!-- ── FLEXIBLE STRUCTURE ─────────────────────────────────────────── -->
<section class="section">
  <div class="container">
    <div class="section-header">
      <div class="section-label">Built for every university</div>
      <h2 class="section-title">One platform. Any structure.</h2>
      <p class="section-subtitle">Faculty, College, Department, Level — whatever your university calls it, Sabify adapts.</p>
    </div>
    <div class="three-grid">
      <div class="feature-card center">
        <div class="card-icon card-icon-center"><Building2 size={24} /></div>
        <h3>Faculty</h3>
        <p>For universities that organize by Faculty → Department</p>
        <span class="example-tag">Faculty of Science → Computer Science</span>
      </div>
      <div class="feature-card center">
        <div class="card-icon card-icon-center"><GraduationCap size={24} /></div>
        <h3>College</h3>
        <p>For universities that organize by College → Department</p>
        <span class="example-tag">College of Engineering → Electrical Eng.</span>
      </div>
      <div class="feature-card center">
        <div class="card-icon card-icon-center"><Layers size={24} /></div>
        <h3>Levels &amp; more</h3>
        <p>100L to 500L. Even custom hierarchies your school uses.</p>
        <span class="example-tag">Department → Level → Course</span>
      </div>
    </div>
  </div>
</section>

<!-- ── EVENTS HUB ─────────────────────────────────────────────────── -->
<section id="events" class="section">
  <div class="container">
    <div class="section-header">
      <div class="section-label">Never miss what matters</div>
      <h2 class="section-title">Events Hub</h2>
      <p class="section-subtitle">Departmental lectures. Exam schedules. Career fairs. Socials. Everything in one place.</p>
    </div>
    <div class="three-grid">
      <div class="feature-card">
        <div class="card-icon"><Calendar size={24} /></div>
        <h3>University calendar</h3>
        <p>Every lecture, test, and deadline from your faculty or college. Automatically synced.</p>
      </div>
      <div class="feature-card">
        <div class="card-icon"><Megaphone size={24} /></div>
        <h3>Student union events</h3>
        <p>Cultural day. Sports fiesta. Career fairs. Never hear about it the day after.</p>
      </div>
      <div class="feature-card">
        <div class="card-icon"><Bell size={24} /></div>
        <h3>Smart reminders</h3>
        <p>Get notified 24 hours before any event. No more "I forgot" excuses.</p>
      </div>
    </div>
  </div>
</section>

<!-- ── VAULT ──────────────────────────────────────────────────────── -->
<section id="vault" class="section">
  <div class="container">
    <div class="section-header">
      <div class="section-label">Stop begging for past questions</div>
      <h2 class="section-title">Study materials library</h2>
      <p class="section-subtitle">Past tests. Assignment prompts. Textbooks. Organized by your university's structure.</p>
    </div>
    <div class="three-grid">
      <div class="feature-card">
        <div class="card-icon"><BookOpen size={24} /></div>
        <h3>Past questions <span class="type-sym type-t">[T]</span></h3>
        <p>Years of exams from your department. Searchable. Downloadable. No more WhatsApp scavenger hunts.</p>
      </div>
      <div class="feature-card">
        <div class="card-icon"><File size={24} /></div>
        <h3>Assignment prompts <span class="type-sym type-a">[A]</span></h3>
        <p>Every assignment from every course. Submit with timestamped proof. No more "missing script" disputes.</p>
      </div>
      <div class="feature-card">
        <div class="card-icon"><Library size={24} /></div>
        <h3>Textbooks &amp; handouts <span class="type-sym type-b">[B]</span></h3>
        <p>OCR-powered. Search inside scanned handouts. Pin for offline access. Your library, anywhere.</p>
      </div>
    </div>
  </div>
</section>

<!-- ── PAY ────────────────────────────────────────────────────────── -->
<section id="pay" class="section">
  <div class="container">
    <div class="section-header">
      <div class="section-label">Pay once. Prove forever.</div>
      <h2 class="section-title">Sabify Pay</h2>
      <p class="section-subtitle">Departmental dues, faculty levies, student union fees. Digital receipts. No more "I paid" arguments.</p>
    </div>
    <div class="two-grid">
      <div class="feature-card">
        <div class="card-icon"><CreditCard size={24} /></div>
        <h3>Pay any due</h3>
        <p>Paystack and Flutterwave. Pay once. Get your QR receipt instantly.</p>
      </div>
      <div class="feature-card">
        <div class="card-icon"><QrCode size={24} /></div>
        <h3>Tamper-proof receipts</h3>
        <p>Verifiable by any department or faculty treasurer. Audits become instant, not painful.</p>
      </div>
    </div>
  </div>
</section>

<!-- ── SHIELD ─────────────────────────────────────────────────────── -->
<section id="shield" class="section">
  <div class="container">
    <div class="section-header">
      <div class="section-label">Campus safety, digital</div>
      <h2 class="section-title">Sabify Shield</h2>
      <p class="section-subtitle">Real-time alerts. Safe-walk check-in. Your digital bodyguard.</p>
    </div>
    <div class="two-grid">
      <div class="feature-card">
        <div class="card-icon"><Bell size={24} /></div>
        <h3>Emergency alerts</h3>
        <p>Encrypted campus-wide notifications. Security incidents. Power outages. Exam changes. Instant.</p>
      </div>
      <div class="feature-card">
        <div class="card-icon"><Footprints size={24} /></div>
        <h3>Safe-walk</h3>
        <p>Share your live location with 3 trusted friends. Auto-notify if you don't check in by ETA.</p>
      </div>
    </div>
  </div>
</section>

<!-- ── CTA (University dropdown) ─────────────────────────────────── -->
<UniversityCTA />

<!-- ── FOOTER ─────────────────────────────────────────────────────── -->
<footer class="footer">
  <div class="container footer-inner">
    <div class="footer-brand">
      <div class="logo-mark logo-mark-sm" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="none">
          <path d="M10 2L17 6V11C17 15.5 13.5 18.5 10 19C6.5 18.5 3 15.5 3 11V6L10 2Z"
            stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M7 10.5L9.5 13L13.5 8"
            stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div>
        <div class="footer-name">Sabify</div>
        <div class="footer-motto">Not by might, but by Sabify.</div>
      </div>
    </div>
    <div class="footer-links">
      <a href="/privacy">Privacy</a>
      <a href="/docs">Docs</a>
      <a href="https://github.com" rel="noopener noreferrer">GitHub</a>
    </div>
    <div class="footer-legal">NDPR compliant · 2025</div>
  </div>
</footer>

<style>
  :global(body) {
    font-family: 'Geist', system-ui, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    -webkit-font-smoothing: antialiased;
  }
  :root {
    --mono: 'Geist Mono', monospace;
    --serif: 'Instrument Serif', Georgia, serif;
    --radius-card: 20px;
    --radius-sm: 12px;
  }

  /* ── Nav ───────────────────────────────────────────── */
  .nav {
    position: sticky; top: 0; z-index: 100;
    background: var(--bg-primary); border-bottom: 1px solid var(--border);
    backdrop-filter: blur(8px);
  }
  .nav-inner {
    max-width: 1100px; margin: 0 auto; padding: 0 28px;
    height: 60px; display: flex; align-items: center; justify-content: space-between;
  }
  .nav-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .logo-mark {
    width: 34px; height: 34px; background: var(--purple-primary);
    border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .logo-mark svg { width: 19px; height: 19px; }
  .logo-mark-sm { width: 28px; height: 28px; border-radius: 8px; }
  .logo-mark-sm svg { width: 15px; height: 15px; }
  .brand-name { font-weight: 800; font-size: 18px; letter-spacing: -0.04em; color: var(--text-primary); }
  .nav-links { display: flex; gap: 24px; }
  .nav-links a { font-size: 14px; font-weight: 500; color: var(--text-secondary); text-decoration: none; transition: color 0.15s; }
  .nav-links a:hover { color: var(--text-primary); }
  .nav-actions { display: flex; gap: 8px; align-items: center; }
  .btn-ghost-nav {
    font-size: 14px; font-weight: 500; color: var(--text-secondary);
    text-decoration: none; padding: 8px 16px;
    border: 1px solid var(--border); border-radius: var(--radius-sm);
    transition: border-color 0.15s, background 0.15s;
  }
  .btn-ghost-nav:hover { background: var(--bg-secondary); border-color: var(--purple-accent); }
  .btn-primary-nav {
    font-size: 14px; font-weight: 700; color: white;
    text-decoration: none; padding: 8px 16px;
    background: var(--purple-primary); border-radius: var(--radius-sm);
    transition: background 0.15s;
  }
  .btn-primary-nav:hover { background: var(--purple-primary-dark, #6d28d9); }

  /* ── Hero ──────────────────────────────────────────── */
  .hero { padding: 88px 28px 80px; text-align: center; }
  .hero-inner { max-width: 760px; margin: 0 auto; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--purple-light); border: 1px solid var(--purple-accent);
    border-radius: 999px; padding: 5px 14px; margin-bottom: 32px;
    font-size: 13px; font-weight: 500; color: var(--purple-primary);
  }
  .badge-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--purple-primary); animation: pulse 2.5s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
  .hero-title {
    font-weight: 900; font-size: clamp(44px, 6vw, 70px);
    letter-spacing: -0.045em; line-height: 1.05;
    color: var(--text-primary); margin-bottom: 20px;
  }
  .hero-title em {
    font-style: normal; color: var(--purple-primary);
    font-family: var(--serif); font-weight: 400; font-size: 1.02em;
  }
  .hero-subtitle {
    font-size: 18px; color: var(--text-secondary);
    max-width: 580px; margin: 0 auto 36px; line-height: 1.6;
  }
  .hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 13px 24px; border-radius: var(--radius-sm);
    font-size: 15px; font-weight: 700; text-decoration: none;
    background: var(--purple-primary); color: white;
    transition: background 0.15s, transform 0.1s;
  }
  .btn-primary:hover { background: var(--purple-primary-dark, #6d28d9); }
  .btn-primary:active { transform: scale(0.98); }
  .btn-secondary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 24px; border-radius: var(--radius-sm);
    font-size: 15px; font-weight: 600; text-decoration: none;
    background: transparent; color: var(--text-secondary);
    border: 1.5px solid var(--border); transition: border-color 0.15s, background 0.15s;
  }
  .btn-secondary:hover { border-color: var(--purple-accent); background: var(--bg-secondary); }

  /* ── Layout ────────────────────────────────────────── */
  .container { max-width: 1100px; margin: 0 auto; padding: 0 28px; }
  .section { padding: 80px 0; border-top: 1px solid var(--border); }
  .section-header { margin-bottom: 48px; }
  .section-label {
    font-family: var(--mono); font-size: 11px; font-weight: 500;
    color: var(--purple-primary); letter-spacing: 0.1em;
    text-transform: uppercase; margin-bottom: 12px;
  }
  .section-title {
    font-weight: 800; font-size: clamp(28px, 3.5vw, 42px);
    letter-spacing: -0.03em; line-height: 1.1;
    color: var(--text-primary); margin-bottom: 14px;
  }
  .section-subtitle {
    font-size: 17px; color: var(--text-secondary); max-width: 560px; line-height: 1.65;
  }

  /* ── Grids ─────────────────────────────────────────── */
  .problems-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; }
  .three-grid    { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
  .two-grid      { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; }

  /* ── Cards ─────────────────────────────────────────── */
  .problem-card, .feature-card {
    background: var(--bg-secondary); border: 1px solid var(--border);
    border-radius: var(--radius-card); padding: 28px;
    transition: border-color 0.2s, transform 0.2s;
  }
  .problem-card:hover, .feature-card:hover { border-color: var(--purple-accent); transform: translateY(-2px); }
  .feature-card.center { text-align: center; }
  .card-icon { color: var(--purple-primary); margin-bottom: 16px; display: flex; }
  .card-icon-center { justify-content: center; }
  .problem-card h3, .feature-card h3 {
    font-size: 17px; font-weight: 700; letter-spacing: -0.015em;
    color: var(--text-primary); margin-bottom: 8px; line-height: 1.3;
  }
  .problem-card p, .feature-card p {
    font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 14px;
  }
  .feature-card p { margin-bottom: 0; }
  .problem-tag {
    display: inline-block; font-family: var(--mono); font-size: 11px; font-weight: 500;
    color: var(--purple-primary); background: var(--purple-light); padding: 4px 10px; border-radius: 6px;
  }
  .example-tag {
    display: inline-block; font-family: var(--mono); font-size: 11px;
    color: var(--purple-primary); background: var(--purple-light);
    padding: 5px 12px; border-radius: 8px; margin-top: 4px;
  }

  /* Type symbols */
  .type-sym {
    font-family: var(--mono); font-size: 12px; font-weight: 600;
    padding: 2px 6px; border-radius: 5px; vertical-align: middle; margin-left: 4px;
  }
  .type-t { background: var(--purple-light); color: var(--purple-primary); }
  .type-a { background: #fefce8; color: #854d0e; }
  .type-b { background: #eff6ff; color: #1d4ed8; }
  :global(.dark) .type-a { background: #2d2400; color: #fbbf24; }
  :global(.dark) .type-b { background: #0c1a2e; color: #60a5fa; }

  /* ── Universities ──────────────────────────────────── */
  .universities-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; }
  .uni-card {
    border-radius: 18px; padding: 22px;
    border: 1px solid var(--border); background: var(--bg-secondary);
    transition: transform 0.2s;
  }
  .uni-card:hover { transform: translateY(-2px); }
  .uni-live { background: var(--purple-primary); border-color: var(--purple-primary); }
  .uni-coming { opacity: 0.72; }
  .uni-status {
    font-family: var(--mono); font-size: 10px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.08em;
    margin-bottom: 12px; display: flex; align-items: center; gap: 6px;
    color: rgba(255,255,255,0.75);
  }
  .uni-status-dim {
    font-family: var(--mono); font-size: 10px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.08em;
    margin-bottom: 12px; color: var(--text-muted);
  }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; animation: pulse 2.5s ease-in-out infinite; }
  .uni-name { font-weight: 800; font-size: 26px; letter-spacing: -0.03em; color: white; margin-bottom: 5px; }
  .uni-name-dim { font-weight: 800; font-size: 26px; letter-spacing: -0.03em; color: var(--text-primary); margin-bottom: 5px; }
  .uni-full { font-size: 12px; color: rgba(255,255,255,0.65); line-height: 1.4; }
  .uni-full-dim { font-size: 12px; color: var(--text-muted); line-height: 1.4; }

  /* ── Footer ────────────────────────────────────────── */
  .footer { padding: 24px 0; border-top: 1px solid var(--border); background: var(--bg-primary); }
  .footer-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
  .footer-brand { display: flex; align-items: center; gap: 12px; }
  .footer-name { font-weight: 800; font-size: 15px; letter-spacing: -0.03em; color: var(--text-primary); }
  .footer-motto { font-family: var(--serif); font-style: italic; font-size: 12px; color: var(--text-muted); margin-top: 1px; }
  .footer-links { display: flex; gap: 20px; }
  .footer-links a { font-size: 13px; color: var(--text-muted); text-decoration: none; font-weight: 500; transition: color 0.15s; }
  .footer-links a:hover { color: var(--text-primary); }
  .footer-legal { font-family: var(--mono); font-size: 11px; color: var(--text-muted); }

  /* ── Responsive ────────────────────────────────────── */
  @media (max-width: 768px) {
    .nav-links { display: none; }
    .hero { padding: 60px 20px 52px; }
    .section { padding: 56px 0; }
    .problems-grid, .three-grid, .two-grid, .universities-grid { grid-template-columns: 1fr; }
    .footer-inner { flex-direction: column; align-items: flex-start; }
  }
</style>