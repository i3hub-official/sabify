<script lang="ts">
  import { onMount } from 'svelte';
  import { theme } from '$lib/stores/theme';
  import { 
    BookOpen, FileText, ClipboardList, CreditCard, QrCode, 
    Shield, Bell, Footprints, Calendar, Megaphone, Layers,
    ArrowRight, File, DollarSign, AlertTriangle, 
    Send, Library, Users, MapPin, Clock, Building2, GraduationCap
  } from 'lucide-svelte';

  onMount(() => {
    theme.init();
  });
</script>

<svelte:head>
  <title>Sabify — Not by might, but by Sabify</title>
  <meta name="description" content="The academic platform for Nigerian and West African university students. Past questions, departmental dues, campus safety, events, and more." />
</svelte:head>

<!-- HERO -->
<section class="hero">
  <div class="hero-inner">
    <div class="hero-badge">
      <span class="badge-dot"></span>
      <span>Launching across West Africa</span>
    </div>

    <h1 class="hero-title">
      Not by might,<br />
      <em>but by Sabify.</em>
    </h1>

    <p class="hero-subtitle">
      Past questions. Departmental dues. Campus safety. Events. Assignments. Textbooks. Everything your university never gave you.
    </p>

    <div class="hero-actions">
      <a href="/signup" class="btn-primary">
        Join the waitlist <ArrowRight size={18} />
      </a>
      <a href="#problems" class="btn-secondary">See how it works</a>
    </div>
  </div>
</section>

<!-- REAL PROBLEMS WE SOLVE -->
<section id="problems" class="section">
  <div class="container">
    <div class="section-header">
      <div class="section-label">Real problems. Real solutions.</div>
      <h2 class="section-title">What actually breaks at Nigerian universities</h2>
      <p class="section-subtitle">We asked students across West Africa. Here's what they said.</p>
    </div>

    <div class="problems-grid">
      <div class="problem-card">
        <div class="problem-icon"><FileText size={28} /></div>
        <h3>"Who has last year's past question?"</h3>
        <p>No more chasing seniors at 2am. Every past test from every department, organized and searchable.</p>
        <div class="problem-tag">Solved → Centralized library</div>
      </div>

      <div class="problem-card">
        <div class="problem-icon"><DollarSign size={28} /></div>
        <h3>"I paid my dues, where's my receipt?"</h3>
        <p>Departmental dues disappear into thin air. Get a tamper-proof QR receipt. Instant audit trail.</p>
        <div class="problem-tag">Solved → Digital receipts</div>
      </div>

      <div class="problem-card">
        <div class="problem-icon"><AlertTriangle size={28} /></div>
        <h3>"No one told me the exam was rescheduled"</h3>
        <p>Important announcements get lost in WhatsApp groups. Get real-time alerts that actually reach you.</p>
        <div class="problem-tag">Solved → Campus alerts</div>
      </div>

      <div class="problem-card">
        <div class="problem-icon"><ClipboardList size={28} /></div>
        <h3>"The lecturer said I never submitted"</h3>
        <p>Physical submissions have no proof. Timestamp your hand-in with photo evidence. End the blame game.</p>
        <div class="problem-tag">Solved → Submission logbook</div>
      </div>

      <div class="problem-card">
        <div class="problem-icon"><Footprints size={28} /></div>
        <h3>"Walking back from library at 10pm is risky"</h3>
        <p>Share your walk with trusted friends. If you don't check in, they get notified. Campus safety, built in.</p>
        <div class="problem-tag">Solved → Safe-walk</div>
      </div>

      <div class="problem-card">
        <div class="problem-icon"><Calendar size={28} /></div>
        <h3>"I missed the department's career talk"</h3>
        <p>Events get announced once on a notice board. Get every departmental lecture, seminar, and deadline in one calendar.</p>
        <div class="problem-tag">Solved → Events hub</div>
      </div>
    </div>
  </div>
</section>

<!-- HOW IT WORKS - FLEXIBLE STRUCTURE -->
<section class="section">
  <div class="container">
    <div class="section-header">
      <div class="section-label">Built for every university</div>
      <h2 class="section-title">One platform. Any structure.</h2>
      <p class="section-subtitle">Faculty, College, Department, Level — whatever your university calls it, Sabify adapts.</p>
    </div>

    <div class="structure-grid">
      <div class="structure-card">
        <div class="structure-icon"><Building2 size={28} /></div>
        <h3>Faculty</h3>
        <p>For universities that organize by Faculty → Department</p>
        <div class="structure-example">Example: Faculty of Science → Computer Science</div>
      </div>
      <div class="structure-card">
        <div class="structure-icon"><GraduationCap size={28} /></div>
        <h3>College</h3>
        <p>For universities that organize by College → Department</p>
        <div class="structure-example">Example: College of Engineering → Electrical Eng.</div>
      </div>
      <div class="structure-card">
        <div class="structure-icon"><Layers size={28} /></div>
        <h3>Levels & More</h3>
        <p>100L to 500L. Even custom hierarchies your school uses.</p>
        <div class="structure-example">Example: Department → Level → Course</div>
      </div>
    </div>
  </div>
</section>

<!-- EVENTS HUB -->
<section id="events" class="section">
  <div class="container">
    <div class="section-header">
      <div class="section-label">Never miss what matters</div>
      <h2 class="section-title">Events Hub</h2>
      <p class="section-subtitle">Departmental lectures. Exam schedules. Career fairs. Socials. Everything in one place.</p>
    </div>

    <div class="feature-grid">
      <div class="feature-card">
        <div class="feature-icon"><Calendar size={32} /></div>
        <h3>University Calendar</h3>
        <p>Every lecture, test, and deadline from your faculty or college. Automatically synced.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon"><Megaphone size={32} /></div>
        <h3>Student Union Events</h3>
        <p>Cultural day. Sports fiesta. Career fairs. Never hear about it the day after.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon"><Clock size={32} /></div>
        <h3>Smart Reminders</h3>
        <p>Get notified 24 hours before any event. No more "I forgot" excuses.</p>
      </div>
    </div>
  </div>
</section>

<!-- STUDY MATERIALS LIBRARY -->
<section class="section">
  <div class="container">
    <div class="section-header">
      <div class="section-label">Stop begging for past questions</div>
      <h2 class="section-title">Study Materials Library</h2>
      <p class="section-subtitle">Past tests. Assignment prompts. Textbooks. Organized by your university's structure.</p>
    </div>

    <div class="feature-grid">
      <div class="feature-card">
        <div class="feature-icon"><BookOpen size={32} /></div>
        <h3>Past Questions [T]</h3>
        <p>Years of exams from your department. Searchable. Downloadable. No more WhatsApp scavenger hunts.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon"><File size={32} /></div>
        <h3>Assignment Prompts [A]</h3>
        <p>Every assignment from every course. Submit with timestamped proof. No more "missing script" disputes.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon"><Library size={32} /></div>
        <h3>Textbooks & Handouts [B]</h3>
        <p>OCR-powered. Search inside scanned handouts. Pin for offline access. Your library, anywhere.</p>
      </div>
    </div>
  </div>
</section>

<!-- SABIFY PAY -->
<section class="section">
  <div class="container">
    <div class="section-header">
      <div class="section-label">Pay once. Prove forever.</div>
      <h2 class="section-title">Sabify Pay</h2>
      <p class="section-subtitle">Departmental dues, faculty levies, student union fees. Digital receipts. No more "I paid" arguments.</p>
    </div>

    <div class="feature-grid">
      <div class="feature-card">
        <div class="feature-icon"><CreditCard size={32} /></div>
        <h3>Pay Any Due</h3>
        <p>Paystack and Flutterwave. Pay once. Get your QR receipt instantly.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon"><QrCode size={32} /></div>
        <h3>Tamper-Proof Receipts</h3>
        <p>Verifiable by any department or faculty treasurer. Audits become instant, not painful.</p>
      </div>
    </div>
  </div>
</section>

<!-- SABIFY SHIELD -->
<section class="section">
  <div class="container">
    <div class="section-header">
      <div class="section-label">Campus safety, digital</div>
      <h2 class="section-title">Sabify Shield</h2>
      <p class="section-subtitle">Real-time alerts. Safe-walk check-in. Your digital bodyguard.</p>
    </div>

    <div class="feature-grid">
      <div class="feature-card">
        <div class="feature-icon"><Bell size={32} /></div>
        <h3>Emergency Alerts</h3>
        <p>Encrypted campus-wide notifications. Security incidents. Power outages. Exam changes. Instant.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon"><Footprints size={32} /></div>
        <h3>Safe-Walk</h3>
        <p>Share your live location with 3 trusted friends. Auto-notify if you don't check in by ETA.</p>
      </div>
    </div>
  </div>
</section>

<!-- UNIVERSITIES COMING -->
<section class="section">
  <div class="container">
    <div class="section-header">
      <div class="section-label">Expanding across West Africa</div>
      <h2 class="section-title">Coming to a campus near you</h2>
      <p class="section-subtitle">One template. Every university. Your school could be next.</p>
    </div>

    <div class="universities-grid">
      <div class="university-card">
        <div class="university-status live">
          <span class="status-dot"></span>
          Live
        </div>
        <div class="university-name">MOUAU</div>
        <div class="university-full">Michael Okpara University of Agriculture</div>
      </div>
      <div class="university-card coming">
        <div class="university-status">Coming</div>
        <div class="university-name">UNN</div>
        <div class="university-full">University of Nigeria, Nsukka</div>
      </div>
      <div class="university-card coming">
        <div class="university-status">Coming</div>
        <div class="university-name">UI</div>
        <div class="university-full">University of Ibadan</div>
      </div>
      <div class="university-card coming">
        <div class="university-status">Coming</div>
        <div class="university-name">FUTO</div>
        <div class="university-full">Federal University of Technology, Owerri</div>
      </div>
      <div class="university-card coming">
        <div class="university-status">Coming</div>
        <div class="university-name">UNILAG</div>
        <div class="university-full">University of Lagos</div>
      </div>
      <div class="university-card coming">
        <div class="university-status">Coming</div>
        <div class="university-name">KNUST</div>
        <div class="university-full">Kwame Nkrumah University of Science and Technology</div>
      </div>
    </div>
  </div>
</section>

<!-- WAITLIST CTA -->
<section class="cta">
  <div class="container cta-inner">
    <h2 class="cta-title">Your university could be <em>next</em></h2>
    <p class="cta-subtitle">Join the waitlist. Be first when we launch at your school.</p>
    <div class="cta-form">
      <input type="email" placeholder="your.email@university.edu" class="email-input" />
      <select class="university-select">
        <option value="">Select your university</option>
        <option value="mouau">MOUAU</option>
        <option value="unn">UNN</option>
        <option value="ui">UI</option>
        <option value="futo">FUTO</option>
        <option value="unilag">UNILAG</option>
        <option value="knust">KNUST</option>
        <option value="other">Other (not listed)</option>
      </select>
      <button class="btn-primary">Join waitlist →</button>
    </div>
    <p class="cta-note">No spam. Just launch updates for your university.</p>
  </div>
</section>

<style>
  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    -webkit-font-smoothing: antialiased;
  }

  .hero {
    padding: 80px 28px;
    text-align: center;
  }

  .hero-inner {
    max-width: 800px;
    margin: 0 auto;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--purple-light);
    border: 1px solid var(--purple-accent);
    border-radius: 999px;
    padding: 5px 14px;
    margin-bottom: 32px;
    font-size: 13px;
    font-weight: 500;
    color: var(--purple-primary);
  }

  .badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--purple-primary);
    animation: pulse 2.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }

  .hero-title {
    font-weight: 800;
    font-size: clamp(42px, 6vw, 68px);
    letter-spacing: -0.02em;
    line-height: 1.08;
    margin-bottom: 20px;
  }

  .hero-title em {
    font-style: normal;
    color: var(--purple-primary);
  }

  .hero-subtitle {
    font-size: 18px;
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto 36px;
    line-height: 1.5;
  }

  .hero-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .btn-primary, .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.15s;
  }

  .btn-primary {
    background: var(--purple-primary);
    color: white;
  }

  .btn-primary:hover {
    background: var(--purple-primary-dark, #6d28d9);
    transform: scale(0.98);
  }

  .btn-secondary {
    background: transparent;
    color: var(--text-secondary);
    border: 1.5px solid var(--border);
  }

  .btn-secondary:hover {
    border-color: var(--purple-accent);
    background: var(--bg-secondary);
  }

  .section {
    padding: 72px 0;
    border-top: 1px solid var(--border);
  }

  .container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 28px;
  }

  .section-header {
    margin-bottom: 48px;
  }

  .section-label {
    font-family: 'SF Mono', 'Menlo', monospace;
    font-size: 12px;
    font-weight: 500;
    color: var(--purple-primary);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .section-title {
    font-weight: 700;
    font-size: clamp(28px, 3.5vw, 42px);
    letter-spacing: -0.02em;
    line-height: 1.2;
    margin-bottom: 16px;
  }

  .section-subtitle {
    font-size: 17px;
    color: var(--text-secondary);
    max-width: 560px;
    line-height: 1.5;
  }

  .problems-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 20px;
  }

  .problem-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 28px;
    transition: all 0.2s;
  }

  .problem-card:hover {
    border-color: var(--purple-accent);
    transform: translateY(-2px);
  }

  .problem-icon {
    color: var(--purple-primary);
    margin-bottom: 16px;
  }

  .problem-card h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 10px;
    color: var(--text-primary);
  }

  .problem-card p {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: 14px;
  }

  .problem-tag {
    font-size: 12px;
    font-weight: 500;
    color: var(--purple-primary);
    background: var(--purple-light);
    display: inline-block;
    padding: 4px 10px;
    border-radius: 6px;
  }

  .structure-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }

  .structure-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 28px;
    text-align: center;
  }

  .structure-icon {
    color: var(--purple-primary);
    margin-bottom: 16px;
  }

  .structure-card h3 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .structure-card p {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 12px;
  }

  .structure-example {
    font-size: 12px;
    color: var(--purple-primary);
    background: var(--purple-light);
    padding: 6px 12px;
    border-radius: 8px;
    display: inline-block;
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  .feature-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 28px;
    transition: all 0.2s;
  }

  .feature-card:hover {
    border-color: var(--purple-accent);
    transform: translateY(-2px);
  }

  .feature-icon {
    color: var(--purple-primary);
    margin-bottom: 16px;
  }

  .feature-card h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .feature-card p {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .universities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .university-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
    transition: all 0.2s;
  }

  .university-card.live {
    background: var(--purple-light);
    border-color: var(--purple-primary);
  }

  .university-card.coming {
    opacity: 0.7;
  }

  .university-status {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--purple-primary);
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #22c55e;
    animation: pulse 2s ease-in-out infinite;
  }

  .university-name {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 6px;
  }

  .university-full {
    font-size: 12px;
    color: var(--text-muted);
  }

  .cta {
    padding: 80px 0;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border);
    text-align: center;
  }

  .cta-inner {
    max-width: 500px;
  }

  .cta-title {
    font-size: clamp(28px, 4vw, 38px);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 16px;
  }

  .cta-title em {
    color: var(--purple-primary);
    font-style: normal;
  }

  .cta-subtitle {
    font-size: 16px;
    color: var(--text-secondary);
    margin-bottom: 28px;
    line-height: 1.5;
  }

  .cta-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }

  .email-input, .university-select {
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 14px;
  }

  .email-input:focus, .university-select:focus {
    outline: none;
    border-color: var(--purple-primary);
  }

  .cta-note {
    font-size: 12px;
    color: var(--text-muted);
  }

  @media (min-width: 640px) {
    .cta-form {
      flex-direction: row;
    }
    
    .email-input, .university-select {
      flex: 1;
    }
  }

  @media (max-width: 768px) {
    .hero {
      padding: 56px 20px;
    }
    
    .section {
      padding: 48px 0;
    }
    
    .problems-grid, .structure-grid, .feature-grid, .universities-grid {
      grid-template-columns: 1fr;
    }
  }
</style>