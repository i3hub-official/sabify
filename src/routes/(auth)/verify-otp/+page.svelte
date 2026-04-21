<script lang="ts">
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { authClient } from '$lib/auth-client';
  import { onDestroy } from 'svelte';
  import {
    ShieldCheck, AlertCircle, ArrowRight,
    ChevronLeft, Home, Sparkles, RefreshCw,
    MailCheck, BookOpen, Zap
  } from 'lucide-svelte';

  // Email passed from signup via query param or session
  const email = $derived($page.url.searchParams.get('email') ?? '');

  // ── OTP state ──────────────────────────────────────────
  let digits     = $state<string[]>(['', '', '', '', '', '']);
  let inputs     = $state<HTMLInputElement[]>([]);
  let errors     = $state<Record<string, string>>({});
  let isLoading  = $state(false);
  let isSuccess  = $state(false);
  let isResending = $state(false);
  let resendMsg  = $state('');

  // ── Resend cooldown ────────────────────────────────────
  const COOLDOWN = 60;
  let cooldown   = $state(0);
  let cdTimer: ReturnType<typeof setInterval> | null = null;

  // Start cooldown immediately on mount
  if (browser) startCooldown();

  function startCooldown() {
    cooldown = COOLDOWN;
    if (cdTimer) clearInterval(cdTimer);
    cdTimer = setInterval(() => {
      cooldown--;
      if (cooldown <= 0) { clearInterval(cdTimer!); cdTimer = null; cooldown = 0; }
    }, 1000);
  }

  onDestroy(() => { if (cdTimer) clearInterval(cdTimer); });

  // ── Derived OTP string ─────────────────────────────────
  const otp     = $derived(digits.join(''));
  const otpFull = $derived(otp.length === 6);

  // ── Input handlers ─────────────────────────────────────
  function onInput(i: number, e: Event) {
    const val = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(-1);
    digits[i] = val;
    errors.otp = '';
    if (val && i < 5) inputs[i + 1]?.focus();
    if (otpFull) handleVerify();
  }

  function onKeydown(i: number, e: KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      digits[i - 1] = '';
      inputs[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft'  && i > 0) inputs[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) inputs[i + 1]?.focus();
  }

  function onPaste(e: ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? '';
    text.split('').forEach((c, i) => { if (i < 6) digits[i] = c; });
    inputs[Math.min(text.length, 5)]?.focus();
    if (text.length === 6) handleVerify();
  }

  // ── Verify ─────────────────────────────────────────────
  async function handleVerify() {
    if (!otpFull) { errors.otp = 'Please enter all 6 digits.'; return; }
    isLoading = true;
    errors = {};
    try {
      // TODO: wire to Better-Auth email OTP verification
      const { error } = await authClient.emailOtp.verifyEmail({ email, otp });
      if (error) throw new Error(error.message ?? 'Invalid code');
      isSuccess = true;
      setTimeout(() => goto('/dashboard'), 2500);
    } catch (err: unknown) {
      errors.otp = err instanceof Error ? err.message : 'Invalid or expired code. Try again.';
      digits = ['', '', '', '', '', ''];
      inputs[0]?.focus();
    } finally {
      isLoading = false;
    }
  }

  // ── Resend ─────────────────────────────────────────────
  async function resendCode() {
    if (cooldown > 0 || isResending) return;
    isResending = true;
    resendMsg = '';
    try {
      await authClient.emailOtp.sendVerificationOtp({ email, type: 'email-verification' });
      resendMsg = 'New code sent!';
      startCooldown();
    } catch {
      resendMsg = 'Failed to resend. Please try again.';
    } finally {
      isResending = false;
    }
  }
</script>

<svelte:head>
  <title>Verify your email — Sabify</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
</svelte:head>

<div class="ov-page">

  <!-- ── Left brand panel ── -->
  <aside class="ov-panel">
    <div class="ov-panel-inner">
      <a href="/" class="ov-logo-link">
        <div class="ov-logo-mark">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M10 2L17 6V11C17 15.5 13.5 18.5 10 19C6.5 18.5 3 15.5 3 11V6L10 2Z"
              stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M7 10.5L9.5 13L13.5 8"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="ov-wordmark">Sabify</span>
      </a>

      <div class="ov-panel-hero">
        <div class="ov-panel-badge"><Sparkles size={13} /><span>Almost there</span></div>
        <h2 class="ov-panel-headline">One last<br/><em>step.</em></h2>
        <p class="ov-panel-desc">
          We sent a 6-digit code to your email. Enter it to verify your account and get started.
        </p>
      </div>

      <div class="ov-features">
        <div class="ov-feature-card">
          <div class="ov-feature-icon"><MailCheck size={17} /></div>
          <div><strong>Check your inbox</strong><span>Code sent to your registered email</span></div>
        </div>
        <div class="ov-feature-card">
          <div class="ov-feature-icon"><ShieldCheck size={17} /></div>
          <div><strong>Expires in 10 minutes</strong><span>Request a new one if it runs out</span></div>
        </div>
        <div class="ov-feature-card">
          <div class="ov-feature-icon"><BookOpen size={17} /></div>
          <div><strong>Access everything</strong><span>Past questions, dues, safety alerts</span></div>
        </div>
      </div>

      <div class="ov-panel-footer">
        <div class="ov-avatars">
          <div class="ov-avatar" style="background:#a78bfa"></div>
          <div class="ov-avatar" style="background:#7c3aed"></div>
          <div class="ov-avatar" style="background:#6d28d9"></div>
          <div class="ov-avatar" style="background:#5b21b6"></div>
          <div class="ov-avatar-count">+8k</div>
        </div>
        <p>Trusted by students across Nigeria</p>
      </div>
    </div>
    <div class="ov-panel-glow"></div>
  </aside>

  <!-- ── Right form panel ── -->
  <main class="ov-main">
    <div class="ov-form-shell">

      <a href="/" class="ov-back-home">
        <ChevronLeft size={17} /><Home size={13} /><span>Back to Home</span>
      </a>

      <!-- Mobile logo -->
      <div class="ov-mobile-brand">
        <div class="ov-logo-mark sm">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M10 2L17 6V11C17 15.5 13.5 18.5 10 19C6.5 18.5 3 15.5 3 11V6L10 2Z"
              stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M7 10.5L9.5 13L13.5 8"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="ov-wordmark inline">Sabify</span>
      </div>

      {#if isSuccess}
        <!-- ── Success state ── -->
        <div class="ov-success-shell">
          <div class="ov-success-icon">
            <ShieldCheck size={40} strokeWidth={1.5} />
          </div>
          <h1 class="ov-form-title">Email verified!</h1>
          <p class="ov-form-subtitle">Welcome to Sabify. Redirecting to your dashboard…</p>
          <div class="ov-redirect-bar"><div class="ov-redirect-fill"></div></div>
        </div>

      {:else}
        <div class="ov-form-header">
          <h1 class="ov-form-title">Verify your email</h1>
          <p class="ov-form-subtitle">
            Enter the 6-digit code sent to
            {#if email}
              <strong>{email}</strong>
            {:else}
              your email
            {/if}
          </p>
        </div>

        <div class="ov-card">

          <!-- Welcome banner -->
          <div class="ov-welcome-msg">
            <MailCheck size={19} />
            <div>
              <strong>Check your inbox</strong>
              <span>Didn't receive it? Check your spam folder</span>
            </div>
          </div>

          {#if errors.otp}
            <div class="ov-alert-error">
              <AlertCircle size={16} /><span>{errors.otp}</span>
            </div>
          {/if}

         <!-- OTP input boxes -->
<div class="ov-otp-row" onpaste={onPaste}>
  {#each digits as digit, i}
    <input
      type="text"
      inputmode="numeric"
      maxlength="1"
      value={digit}
      bind:this={inputs[i]}
      oninput={(e) => onInput(i, e)}
      onkeydown={(e) => onKeydown(i, e)}
      class="ov-otp-box"
      class:ov-otp-filled={digit !== ''}
      class:ov-otp-error={errors.otp}
      disabled={isLoading}
      aria-label="Digit {i + 1} of 6"
    />
  {/each}
</div>

          <p class="ov-otp-hint">Enter each digit — auto-submits when complete</p>

          <!-- Verify button (manual submit fallback) -->
         <button
  type="button"
  class="ov-btn-primary"
  onclick={handleVerify}
  disabled={isLoading || !otpFull}
>
            {#if isLoading}
              <span class="ov-spinner"></span> Verifying…
            {:else}
              <ShieldCheck size={16} /> Verify email <ArrowRight size={16} />
            {/if}
          </button>

          <!-- Resend -->
          <div class="ov-resend-row">
            {#if resendMsg}
              <span class="ov-resend-msg" class:ov-resend-ok={resendMsg === 'New code sent!'}>{resendMsg}</span>
            {:else if cooldown > 0}
              <span class="ov-resend-wait">
                <RefreshCw size={13} />
                Resend in {cooldown}s
              </span>
            {:else}
              <button type="button" class="ov-resend-btn" onclick={resendCode} disabled={isResending}>
                {#if isResending}
                  <span class="ov-mini-spinner"></span> Sending…
                {:else}
                  <RefreshCw size={13} /> Resend code
                {/if}
              </button>
            {/if}
          </div>

        </div>

        <p class="ov-footer-text">
          Wrong account? <a href="/signup" class="ov-link">Start over</a>
        </p>
      {/if}

    </div>
  </main>
</div>

<style>
  :global(.ov-page *) { font-family: 'DM Sans', system-ui, sans-serif; box-sizing: border-box; }

  .ov-page { display: flex; min-height: 100vh; background: var(--bg-primary); }

  /* ── Brand panel ── */
  .ov-panel { display: none; position: relative; width: 440px; flex-shrink: 0; background: linear-gradient(160deg, #1a0b2e 0%, #2d1b4e 50%, #1a0b2e 100%); overflow: hidden; }
  @media (min-width: 1024px) { .ov-panel { display: flex; } }
  .ov-panel-inner { position: relative; z-index: 2; display: flex; flex-direction: column; padding: 2.5rem; height: 100%; }
  .ov-panel-glow { position: absolute; inset: 0; z-index: 1; background: radial-gradient(ellipse 80% 60% at 50% 50%, rgba(106,44,145,0.25) 0%, transparent 70%); pointer-events: none; }

  .ov-logo-link { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; margin-bottom: 2.5rem; transition: opacity 0.2s; }
  .ov-logo-link:hover { opacity: 0.85; }
  .ov-logo-mark { width: 42px; height: 42px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
  .ov-logo-mark svg { width: 22px; height: 22px; }
  .ov-logo-mark.sm { width: 36px; height: 36px; border-radius: 10px; background: var(--purple-primary); border-color: transparent; color: white; }
  .ov-logo-mark.sm svg { width: 18px; height: 18px; }
  .ov-wordmark { font-size: 20px; font-weight: 800; letter-spacing: -0.04em; color: white; }
  .ov-wordmark.inline { color: var(--text-primary); }

  .ov-panel-badge { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.875rem; background: rgba(106,44,145,0.25); border: 1px solid rgba(106,44,145,0.4); border-radius: 100px; font-size: 0.75rem; color: #c4b5fd; margin-bottom: 1.5rem; width: fit-content; }
  .ov-panel-headline { font-family: 'DM Serif Display', Georgia, serif; font-size: 2.5rem; line-height: 1.2; color: white; margin-bottom: 1rem; }
  .ov-panel-headline em { color: #c4b5fd; font-style: italic; }
  .ov-panel-desc { font-size: 0.875rem; line-height: 1.65; color: rgba(196,181,253,0.82); margin-bottom: 2rem; }

  .ov-features { display: flex; flex-direction: column; gap: 0.875rem; margin-bottom: auto; }
  .ov-feature-card { display: flex; align-items: flex-start; gap: 0.875rem; padding: 0.875rem 1rem; background: rgba(255,255,255,0.05); border-radius: 1rem; transition: background 0.2s; }
  .ov-feature-card:hover { background: rgba(255,255,255,0.09); }
  .ov-feature-icon { width: 36px; height: 36px; background: rgba(106,44,145,0.25); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #c4b5fd; flex-shrink: 0; }
  .ov-feature-card strong { display: block; font-size: 0.813rem; font-weight: 600; color: white; margin-bottom: 0.2rem; }
  .ov-feature-card span { font-size: 0.75rem; color: rgba(196,181,253,0.8); line-height: 1.4; }

  .ov-panel-footer { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); }
  .ov-avatars { display: flex; align-items: center; margin-bottom: 0.625rem; }
  .ov-avatar { width: 30px; height: 30px; border-radius: 50%; border: 2px solid #2d1b4e; margin-left: -7px; }
  .ov-avatar:first-child { margin-left: 0; }
  .ov-avatar-count { width: 30px; height: 30px; border-radius: 50%; background: rgba(106,44,145,0.4); border: 2px solid #2d1b4e; display: flex; align-items: center; justify-content: center; font-size: 0.625rem; font-weight: 700; color: white; margin-left: -7px; }
  .ov-panel-footer p { font-size: 0.688rem; color: rgba(196,181,253,0.65); }

  /* ── Form side ── */
  .ov-main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem 1.25rem; min-height: 100vh; background: var(--bg-primary); }
  .ov-form-shell { width: 100%; max-width: 480px; display: flex; flex-direction: column; gap: 1.5rem; }

  .ov-back-home { display: inline-flex; align-items: center; gap: 0.5rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 100px; padding: 0.5rem 1rem; font-size: 0.813rem; font-weight: 500; color: var(--text-secondary); text-decoration: none; transition: all 0.2s; width: fit-content; }
  .ov-back-home:hover { border-color: var(--purple-primary); color: var(--purple-on-light); background: var(--purple-light); transform: translateX(-2px); }

  .ov-mobile-brand { display: none; align-items: center; gap: 8px; justify-content: center; }
  @media (max-width: 1023px) { .ov-mobile-brand { display: flex; } }

  .ov-form-header { text-align: center; }
  .ov-form-title { font-family: 'DM Serif Display', Georgia, serif; font-size: clamp(1.75rem, 4vw, 2.25rem); color: var(--text-primary); margin-bottom: 0.25rem; letter-spacing: -0.02em; }
  .ov-form-subtitle { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5; }
  .ov-form-subtitle strong { color: var(--text-primary); font-weight: 600; }

  .ov-card { background: var(--bg-secondary); border-radius: 1.5rem; border: 1px solid var(--border); padding: clamp(1.25rem, 5vw, 2rem); box-shadow: 0 20px 35px -12px rgba(0,0,0,0.12); display: flex; flex-direction: column; gap: 1.25rem; }

  /* Welcome banner */
  .ov-welcome-msg { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1rem; background: var(--purple-light); border-radius: 1rem; }
  .ov-welcome-msg :global(svg) { color: var(--purple-on-light); flex-shrink: 0; }
  .ov-welcome-msg strong { display: block; font-size: 0.875rem; font-weight: 700; color: var(--text-primary); }
  .ov-welcome-msg span { font-size: 0.75rem; color: var(--text-secondary); }

  /* Error */
  .ov-alert-error { display: flex; align-items: center; gap: 0.625rem; padding: 0.75rem 1rem; background: color-mix(in srgb, var(--error) 10%, transparent); border: 1px solid color-mix(in srgb, var(--error) 30%, transparent); border-radius: 0.75rem; color: var(--error); font-size: 0.813rem; }

  /* OTP boxes */
  .ov-otp-row { display: flex; gap: 0.625rem; justify-content: center; }
  .ov-otp-box {
    width: 52px; height: 60px;
    text-align: center;
    font-size: 1.5rem; font-weight: 700;
    font-family: 'DM Sans', sans-serif;
    color: var(--text-primary);
    background: var(--bg-primary);
    border: 2px solid var(--border);
    border-radius: 0.875rem;
    outline: none;
    transition: all 0.15s;
    caret-color: var(--purple-primary);
  }
  .ov-otp-box:focus { border-color: var(--purple-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--purple-primary) 12%, transparent); }
  .ov-otp-box.ov-otp-filled { border-color: var(--purple-primary); background: color-mix(in srgb, var(--purple-primary) 6%, var(--bg-primary)); }
  .ov-otp-box.ov-otp-error { border-color: var(--error); background: color-mix(in srgb, var(--error) 5%, var(--bg-primary)); }
  .ov-otp-box:disabled { opacity: 0.6; cursor: not-allowed; }

  .ov-otp-hint { text-align: center; font-size: 0.688rem; color: var(--text-muted); margin-top: -0.25rem; }

  /* Buttons */
  .ov-btn-primary { width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.8125rem 1.25rem; background: var(--purple-primary); color: white; border: none; border-radius: 0.75rem; font-size: 0.9375rem; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; box-shadow: 0 4px 14px color-mix(in srgb, var(--purple-primary) 35%, transparent); transition: all 0.2s; }
  .ov-btn-primary:hover:not(:disabled) { background: var(--purple-primary-dark); transform: translateY(-2px); box-shadow: 0 6px 20px color-mix(in srgb, var(--purple-primary) 45%, transparent); }
  .ov-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

  /* Resend */
  .ov-resend-row { display: flex; justify-content: center; align-items: center; gap: 0.375rem; font-size: 0.813rem; padding-top: 0.25rem; }
  .ov-resend-btn { background: none; border: none; font-size: 0.813rem; font-family: 'DM Sans', sans-serif; color: var(--purple-primary); font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.375rem 0.75rem; border-radius: 0.5rem; transition: background 0.15s; }
  .ov-resend-btn:hover { background: var(--purple-light); }
  .ov-resend-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .ov-resend-wait { color: var(--text-muted); display: inline-flex; align-items: center; gap: 0.375rem; }
  .ov-resend-msg { font-weight: 600; color: var(--text-muted); }
  .ov-resend-ok { color: var(--success); }

  /* Success */
  .ov-success-shell { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1rem; padding: 2rem; background: var(--bg-secondary); border-radius: 1.5rem; border: 1px solid var(--border); }
  .ov-success-icon { width: 80px; height: 80px; border-radius: 50%; background: color-mix(in srgb, var(--success) 12%, transparent); border: 1px solid color-mix(in srgb, var(--success) 30%, transparent); display: flex; align-items: center; justify-content: center; color: var(--success); animation: ov-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
  .ov-redirect-bar { width: 100%; height: 3px; background: var(--border); border-radius: 2px; overflow: hidden; margin-top: 0.5rem; }
  .ov-redirect-fill { height: 100%; background: var(--purple-primary); animation: ov-progress 2.5s linear forwards; }

  /* Spinners */
  .ov-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: ov-spin 0.6s linear infinite; flex-shrink: 0; }
  .ov-mini-spinner { width: 12px; height: 12px; border: 2px solid color-mix(in srgb, var(--purple-primary) 25%, transparent); border-top-color: var(--purple-primary); border-radius: 50%; animation: ov-spin 0.6s linear infinite; display: inline-block; }

  .ov-link { color: var(--purple-primary); font-weight: 500; text-decoration: none; }
  .ov-link:hover { text-decoration: underline; }
  .ov-footer-text { text-align: center; font-size: 0.875rem; color: var(--text-secondary); }

  @keyframes ov-spin { to { transform: rotate(360deg); } }
  @keyframes ov-pop { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes ov-progress { from { width: 0%; } to { width: 100%; } }

  @media (max-width: 640px) {
    .ov-main { padding: 1.5rem 1rem; align-items: flex-start; }
    .ov-form-shell { gap: 1.25rem; }
    .ov-card { padding: 1.25rem; border-radius: 1.25rem; }
    .ov-otp-box { width: 44px; height: 52px; font-size: 1.25rem; }
    .ov-back-home { font-size: 0.75rem; padding: 0.375rem 0.875rem; }
  }
</style>