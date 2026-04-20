<script lang="ts">
  import { onMount } from 'svelte';

  let dots = $state(0);

  onMount(() => {
    const interval = setInterval(() => {
      dots = (dots + 1) % 4;
    }, 500);
    return () => clearInterval(interval);
  });
</script>

<svelte:head>
  <title>Sabify — Under Maintenance</title>
</svelte:head>

<div class="maintenance-wrap">
  <!-- Ambient background shapes -->
  <div class="bg-shape s1"></div>
  <div class="bg-shape s2"></div>
  <div class="bg-shape s3"></div>

  <!-- Animated grid overlay -->
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
        </div>

    <!-- Animated wrench icon -->
    <div class="icon-wrap" aria-hidden="true">
      <svg class="wrench" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
      <div class="icon-ring r1"></div>
      <div class="icon-ring r2"></div>
    </div>

    <!-- Heading -->
    <h1>We'll be right back<span class="dots">{'.'.repeat(dots)}</span></h1>

    <p class="subtitle">
      Sabify is undergoing scheduled maintenance to bring you a better and
      safer campus experience.
    </p>

    <!-- Status bar -->
    <div class="status-bar">
      <div class="status-label">
        <span class="status-dot"></span>
        <span>Maintenance in progress</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill"></div>
      </div>
    </div>

    <!-- Info chips -->
    <div class="chips">
      <div class="chip">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        Back shortly
      </div>
      <div class="chip">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        Your data is safe
      </div>
      <div class="chip">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
        </svg>
        Improvements coming
      </div>
    </div>

    <p class="footer-note">
      For urgent safety matters, please contact our maintenance team at: <br /><span class="email">
        maintenance@sabify.com
      </span>
    </p>
  </div>
</div>

<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* Inherit body styles from layout.css - no font override needed */
  .maintenance-wrap {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-primary);
    position: relative;
    overflow: hidden;
    padding: 2rem;
  }

  /* ── BACKGROUND SHAPES ─────────────────────────────────────────────── */
  .bg-shape {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }
  .bg-shape.s1 {
    width: 600px; height: 600px;
    background: radial-gradient(ellipse, rgba(124, 58, 237, 0.12) 0%, transparent 70%);
    top: -200px; right: -100px;
    animation: drift 14s ease-in-out infinite;
  }
  .bg-shape.s2 {
    width: 450px; height: 450px;
    background: radial-gradient(ellipse, rgba(124, 58, 237, 0.08) 0%, transparent 70%);
    bottom: -150px; left: -100px;
    animation: drift2 11s ease-in-out infinite;
  }
  .bg-shape.s3 {
    width: 250px; height: 250px;
    background: radial-gradient(ellipse, rgba(167, 139, 250, 0.1) 0%, transparent 70%);
    top: 40%; left: 10%;
    animation: drift 17s ease-in-out infinite reverse;
  }

  /* ── GRID OVERLAY ──────────────────────────────────────────────────── */
  .grid-overlay {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(124, 58, 237, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124, 58, 237, 0.04) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
  }

  /* ── CARD ──────────────────────────────────────────────────────────── */
  .card {
    position: relative; z-index: 1;
    background: var(--bg-primary);
    border: 1px solid rgba(124, 58, 237, 0.12);
    border-radius: 2rem;
    padding: 3.5rem 3rem;
    max-width: 520px; width: 100%;
    text-align: center;
    box-shadow:
      0 32px 80px rgba(124, 58, 237, 0.12),
      0 4px 16px rgba(0,0,0,0.04);
    animation: fadeUp .8s ease both;
  }

  /* ── LOGO ──────────────────────────────────────────────────────────── */
  .logo {
    display: inline-flex;
    align-items: center;
    gap: .625rem;
    margin-bottom: 2.5rem;
    font-size: 1.375rem;
    font-weight: 800;
    color: var(--text-primary);
    letter-spacing: -.02em;
  }
  .logo-mark {
    width: 40px;
    height: 40px;
    background: var(--purple-primary);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }
  .logo-mark svg {
    width: 22px;
    height: 22px;
  }

  /* ── ICON ──────────────────────────────────────────────────────────── */
  .icon-wrap {
    position: relative;
    width: 80px; height: 80px;
    margin: 0 auto 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .wrench {
    color: var(--purple-primary);
    position: relative; z-index: 1;
    animation: wrenchWiggle 3s ease-in-out infinite;
  }
  .icon-ring {
    position: absolute;
    top: 50%; left: 50%;
    border-radius: 50%;
    border: 1.5px solid rgba(124, 58, 237, 0.25);
    animation: ringOut 3s ease-out infinite;
  }
  .icon-ring.r1 { width: 56px; height: 56px; animation-delay: 0s; }
  .icon-ring.r2 { width: 72px; height: 72px; animation-delay: 1s; }

  /* ── HEADING ───────────────────────────────────────────────────────── */
  h1 {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.15;
    margin-bottom: 1rem;
  }
  .dots {
    display: inline-block;
    min-width: 1.5ch;
    text-align: left;
    color: var(--purple-primary);
  }

  .subtitle {
    font-size: .9375rem;
    line-height: 1.75;
    color: var(--text-secondary);
    margin-bottom: 2.25rem;
    max-width: 380px;
    margin-left: auto;
    margin-right: auto;
  }

  /* ── STATUS BAR ────────────────────────────────────────────────────── */
  .status-bar {
    background: var(--purple-light);
    border-radius: 1rem;
    padding: 1rem 1.25rem;
    margin-bottom: 1.75rem;
    text-align: left;
  }
  .status-label {
    display: flex;
    align-items: center;
    gap: .5rem;
    font-size: .8rem;
    font-weight: 600;
    color: var(--purple-primary);
    margin-bottom: .75rem;
    letter-spacing: .03em;
  }
  .status-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--purple-primary);
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: .5; transform: scale(1.4); }
  }
  .progress-track {
    height: 6px;
    background: rgba(124, 58, 237, 0.15);
    border-radius: 99px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    width: 30%;
    background: linear-gradient(90deg, transparent, var(--purple-primary), var(--purple-accent), transparent);
    border-radius: 99px;
    animation: marquee 1.6s ease-in-out infinite;
  }

  /* ── CHIPS ─────────────────────────────────────────────────────────── */
  .chips {
    display: flex;
    gap: .625rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 2rem;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: .375rem;
    background: rgba(124, 58, 237, 0.06);
    border: 1px solid rgba(124, 58, 237, 0.14);
    border-radius: 99px;
    padding: .375rem .875rem;
    font-size: .75rem;
    font-weight: 600;
    color: var(--purple-primary);
    letter-spacing: .02em;
  }

  /* ── FOOTER NOTE ───────────────────────────────────────────────────── */
  .footer-note {
    font-size: .75rem;
    color: var(--text-muted);
    line-height: 1.6;
  }

  /* ── ANIMATIONS ────────────────────────────────────────────────────── */
  @keyframes drift {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50%       { transform: translateY(-20px) rotate(3deg); }
  }
  @keyframes drift2 {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50%       { transform: translateY(14px) rotate(-2deg); }
  }
  @keyframes ringOut {
    0%   { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
    100% { transform: translate(-50%, -50%) scale(2);   opacity: 0; }
  }
  @keyframes marquee {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(400%); }
  }
  @keyframes wrenchWiggle {
    0%, 100% { transform: rotate(0deg); }
    20%       { transform: rotate(-15deg); }
    40%       { transform: rotate(12deg); }
    60%       { transform: rotate(-8deg); }
    80%       { transform: rotate(5deg); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── RESPONSIVE ────────────────────────────────────────────────────── */
  @media (max-width: 480px) {
    .card { padding: 2.5rem 1.75rem; border-radius: 1.5rem; }
    .chips { gap: .5rem; }
  }
</style>