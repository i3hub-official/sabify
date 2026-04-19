<script lang="ts">
  // No dynamic state needed for shutdown — it's a static informational page
</script>

<svelte:head>
  <title>Sabify — Service Discontinued</title>
</svelte:head>

<div class="shutdown-wrap">
  <div class="bg-shape s1"></div>
  <div class="bg-shape s2"></div>
  <div class="grid-overlay" aria-hidden="true"></div>

  <div class="card">
    <!-- Logo -->
    <div class="logo">
      <div class="logo-mark">
        <svg viewBox="0 0 20 20" fill="none" width="36" height="36">
          <path d="M10 2L17 6V11C17 15.5 13.5 18.5 10 19C6.5 18.5 3 15.5 3 11V6L10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M7 10.5L9.5 13L13.5 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <span>Sabify</span>
    </div>

    <!-- Icon -->
    <div class="icon-wrap" aria-hidden="true">
      <svg class="power-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
        <line x1="12" y1="2" x2="12" y2="12"/>
      </svg>
      <div class="icon-ring r1"></div>
      <div class="icon-ring r2"></div>
    </div>

    <!-- Heading -->
    <div class="tag">Service Notice</div>
    <h1>Sabify has been<br /><em>discontinued</em></h1>

    <p class="subtitle">
      As of today, the Sabify platform is no longer in service. We sincerely
      thank everyone who was part of our community safety network.
    </p>

    <!-- Info blocks -->
    <div class="info-grid">
      <div class="info-block">
        <div class="info-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div>
          <div class="info-title">Support</div>
          <div class="info-body">For data requests or questions, email <span class="email">support@sabify.app</span></div>
        </div>
      </div>

      <div class="info-block">
        <div class="info-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div>
          <div class="info-title">Your Data</div>
          <div class="info-body">All user data will be securely deleted within 30 days per our privacy policy.</div>
        </div>
      </div>

      <div class="info-block">
        <div class="info-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div>
          <div class="info-title">Emergencies</div>
          <div class="info-body">For urgent safety matters, always contact your local emergency services.</div>
        </div>
      </div>
    </div>

    <p class="footer-note">
      &copy; 2026 Sabify. Thank you for keeping your community safe.
    </p>
  </div>
</div>

<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* Inherit body styles from layout.css - no font override needed */
  
  :root {
    --ink: #1a0b2e;
  }

  @keyframes drift {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50%       { transform: translateY(-20px) rotate(3deg); }
  }
  @keyframes drift2 {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50%       { transform: translateY(14px) rotate(-2deg); }
  }
  @keyframes ringOut {
    0%   { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
    100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── LAYOUT ─────────────────────────────────────────────────────────── */
  .shutdown-wrap {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-primary);
    position: relative;
    overflow: hidden;
    padding: 2rem;
  }

  /* ── BACKGROUND ──────────────────────────────────────────────────────── */
  .bg-shape {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }
  .bg-shape.s1 {
    width: 550px; height: 550px;
    background: radial-gradient(ellipse, rgba(124, 58, 237, 0.12) 0%, transparent 70%);
    top: -180px; right: -80px;
    animation: drift 16s ease-in-out infinite;
  }
  .bg-shape.s2 {
    width: 400px; height: 400px;
    background: radial-gradient(ellipse, rgba(124, 58, 237, 0.07) 0%, transparent 70%);
    bottom: -130px; left: -80px;
    animation: drift2 13s ease-in-out infinite;
  }
  .grid-overlay {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(124, 58, 237, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124, 58, 237, 0.04) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
  }

  /* ── CARD ────────────────────────────────────────────────────────────── */
  .card {
    position: relative; z-index: 1;
    background: var(--bg-primary);
    border: 1px solid rgba(124, 58, 237, 0.12);
    border-radius: 2rem;
    padding: 3.5rem 3rem;
    max-width: 520px; width: 100%;
    text-align: center;
    box-shadow:
      0 32px 80px rgba(124, 58, 237, 0.1),
      0 4px 16px rgba(0,0,0,0.04);
    animation: fadeUp .8s ease both;
  }

  /* ── LOGO ────────────────────────────────────────────────────────────── */
  .logo {
    display: inline-flex;
    align-items: center;
    gap: .625rem;
    margin-bottom: 2.25rem;
    font-size: 1.375rem;
    font-weight: 800;
    color: var(--text-primary);
    letter-spacing: -.02em;
    opacity: 0.7;
  }
  .logo-mark {
    width: 40px;
    height: 40px;
    background: var(--purple-primary);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }
  .logo-mark svg {
    width: 22px;
    height: 22px;
  }

  /* ── ICON ────────────────────────────────────────────────────────────── */
  .icon-wrap {
    position: relative;
    width: 80px; height: 80px;
    margin: 0 auto 1.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .power-icon {
    color: var(--text-muted);
    position: relative; z-index: 1;
  }
  .icon-ring {
    position: absolute;
    top: 50%; left: 50%;
    border-radius: 50%;
    border: 1.5px solid rgba(148, 163, 184, 0.2);
    animation: ringOut 4s ease-out infinite;
  }
  .icon-ring.r1 { width: 56px; height: 56px; animation-delay: 0s; }
  .icon-ring.r2 { width: 72px; height: 72px; animation-delay: 1.5s; }

  /* ── HEADING ─────────────────────────────────────────────────────────── */
  .tag {
    display: inline-block;
    background: var(--purple-light);
    border: 1px solid rgba(124, 58, 237, 0.14);
    border-radius: 99px;
    padding: .3rem .875rem;
    font-size: .7rem; font-weight: 700;
    color: var(--purple-primary);
    letter-spacing: .07em; text-transform: uppercase;
    margin-bottom: 1rem;
  }
  h1 {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.15;
    margin-bottom: 1rem;
  }
  h1 em { 
    color: var(--text-muted); 
    font-style: italic; 
  }

  .subtitle {
    font-size: .9375rem;
    line-height: 1.75;
    color: var(--text-secondary);
    margin-bottom: 2.25rem;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }

  /* ── INFO GRID ───────────────────────────────────────────────────────── */
  .info-grid {
    display: flex;
    flex-direction: column;
    gap: .75rem;
    margin-bottom: 2.25rem;
    text-align: left;
  }
  .info-block {
    display: flex;
    align-items: flex-start;
    gap: .875rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 1rem;
    padding: 1rem 1.25rem;
  }
  .info-icon {
    flex-shrink: 0;
    width: 32px; height: 32px;
    border-radius: 8px;
    background: var(--purple-light);
    display: flex; align-items: center; justify-content: center;
    color: var(--purple-primary);
    margin-top: .1rem;
  }
  .info-title {
    font-size: .8125rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: .2rem;
  }
  .info-body {
    font-size: .8rem;
    color: var(--text-secondary);
    line-height: 1.6;
  }
  .email {
    color: var(--purple-primary);
    font-weight: 600;
  }

  /* ── FOOTER ──────────────────────────────────────────────────────────── */
  .footer-note {
    font-size: .75rem;
    color: var(--text-muted);
    line-height: 1.6;
  }

  /* ── RESPONSIVE ──────────────────────────────────────────────────────── */
  @media (max-width: 480px) {
    .card { padding: 2.5rem 1.75rem; border-radius: 1.5rem; }
  }
</style>