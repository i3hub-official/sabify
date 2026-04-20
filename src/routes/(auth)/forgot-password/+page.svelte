<script lang="ts">
  import {
    Mail, AlertCircle, ArrowRight, CheckCircle, ArrowLeft,
    Shield, Users, ChevronLeft, Home, Sparkles, KeyRound
  } from 'lucide-svelte';
  import { goto } from '$app/navigation';

  let email     = $state('');
  let errors    = $state<Record<string, string>>({});
  let isLoading = $state(false);
  let isSuccess = $state(false);

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email)) e.email = 'Please enter a valid email address';
    return e;
  };

  const handleSubmit = async (ev: Event) => {
    ev.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) { errors = errs; return; }
    isLoading = true;
    errors = {};
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to send reset email');
      isSuccess = true;
    } catch (err: unknown) {
      errors.submit = err instanceof Error ? err.message : 'An error occurred';
    } finally {
      isLoading = false;
    }
  };
</script>

<svelte:head>
  <title>Reset password — Sabify</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
</svelte:head>

<div class="fp-page">

  <!-- ── Left brand panel ── -->
  <aside class="fp-panel">
    <div class="fp-panel-inner">

      <div class="fp-panel-hero">
        <div class="fp-panel-badge"><Sparkles size={13} /><span>Account Recovery</span></div>
        <h2 class="fp-panel-headline">We've got<br/><em>your back.</em></h2>
        <p class="fp-panel-desc">
          Happens to the best of us. Enter your email and we'll send a secure link to get you back into your account in seconds.
        </p>
      </div>

      <div class="fp-features">
        <div class="fp-feature-card">
          <div class="fp-feature-icon"><Shield size={17} /></div>
          <div><strong>Secure Reset Link</strong><span>Expires in 15 minutes for your safety</span></div>
        </div>
        <div class="fp-feature-card">
          <div class="fp-feature-icon"><Mail size={17} /></div>
          <div><strong>Check Your Inbox</strong><span>Link sent instantly to your registered email</span></div>
        </div>
        <div class="fp-feature-card">
          <div class="fp-feature-icon"><Users size={17} /></div>
          <div><strong>Still Need Help?</strong><span>Contact support if you no longer have access</span></div>
        </div>
      </div>

      <div class="fp-panel-footer">
        <div class="fp-avatars">
          <div class="fp-avatar" style="background:#a78bfa"></div>
          <div class="fp-avatar" style="background:#7c3aed"></div>
          <div class="fp-avatar" style="background:#6d28d9"></div>
          <div class="fp-avatar" style="background:#5b21b6"></div>
          <div class="fp-avatar-count">+8k</div>
        </div>
        <p>Trusted by students across Nigeria</p>
      </div>
    </div>
    <div class="fp-panel-glow"></div>
  </aside>

  <!-- ── Right form panel ── -->
  <main class="fp-main">
    <div class="fp-form-shell">

      <a href="/" class="fp-back-home">
        <ChevronLeft size={17} /><Home size={13} /><span>Back to Home</span>
      </a>

      <!-- Mobile logo -->
      <div class="fp-mobile-brand">
        <div class="fp-logo-mark sm">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M10 2L17 6V11C17 15.5 13.5 18.5 10 19C6.5 18.5 3 15.5 3 11V6L10 2Z"
              stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M7 10.5L9.5 13L13.5 8"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <div class="fp-form-header">
        <h1 class="fp-form-title">{isSuccess ? 'Email sent!' : 'Reset password'}</h1>
        <p class="fp-form-subtitle">
          {isSuccess
            ? 'Check your inbox for the reset link'
            : "Enter your email and we'll send you a reset link"}
        </p>
      </div>

      <div class="fp-card">

        {#if isSuccess}
          <!-- ── Success state ── -->
          <div class="fp-success" style="animation: stepIn .35s ease both">
            <div class="fp-success-icon">
              <CheckCircle size={38} strokeWidth={1.5} />
            </div>
            <h3 class="fp-success-title">Check your email</h3>
            <p class="fp-success-body">We sent a password reset link to</p>
            <div class="fp-success-email">
              <Mail size={13} />
              <span>{email}</span>
            </div>
            <p class="fp-success-note">
              Didn't receive it? Check your spam folder or wait a minute before trying again.
            </p>
            <a href="/signin" class="fp-btn-primary">
              Return to Sign In <ArrowRight size={15} />
            </a>
            <button type="button" class="fp-btn-resend" onclick={() => { isSuccess = false; }}>
              Try a different email
            </button>
          </div>

        {:else}
          <!-- ── Form state ── -->
          <div style="animation: stepIn .35s ease both">

            <!-- Welcome message banner -->
            <div class="fp-welcome-msg">
              <KeyRound size={19} />
              <div>
                <strong>Forgot your password?</strong>
                <span>No worries — we'll help you get back in</span>
              </div>
            </div>

            {#if errors.submit}
              <div class="fp-alert-error">
                <AlertCircle size={17} /><span>{errors.submit}</span>
              </div>
            {/if}

            <form onsubmit={handleSubmit}>
              <div class="fp-field">
                <label class="fp-label" for="email">
                  Email address <span class="fp-req">*</span>
                </label>
                <div class="fp-input-wrap">
                  <span class="fp-input-icon"><Mail size={15} /></span>
                  <input
                    type="email"
                    id="email"
                    placeholder="you@university.edu.ng"
                    bind:value={email}
                    class="fp-input"
                    class:fp-input--err={errors.email}
                    autocomplete="email"
                  />
                </div>
                {#if errors.email}
                  <p class="fp-err">{errors.email}</p>
                {:else}
                  <p class="fp-hint">We'll send a secure reset link to this address</p>
                {/if}
              </div>

              <button type="submit" disabled={isLoading} class="fp-btn-primary">
                {#if isLoading}
                  <span class="fp-spinner"></span> Sending…
                {:else}
                  Send Reset Link <ArrowRight size={15} />
                {/if}
              </button>
            </form>

            <div class="fp-divider"><span>or</span></div>

            <a href="/signin" class="fp-btn-back">
              <ArrowLeft size={15} /> Back to Sign In
            </a>
          </div>
        {/if}

      </div>

      <p class="fp-footer-text">
        Don't have an account? <a href="/signup" class="fp-link">Create one</a>
      </p>
    </div>
  </main>
</div>

<style>
  :global(.fp-page *) { font-family: 'DM Sans', system-ui, sans-serif; box-sizing: border-box; }

  .fp-page { display: flex; min-height: 100vh; background: var(--bg-primary); }

  .fp-panel { display: none; position: relative; width: 440px; flex-shrink: 0; background: linear-gradient(160deg, #1a0b2e 0%, #2d1b4e 50%, #1a0b2e 100%); overflow: hidden; }
  @media (min-width: 1024px) { .fp-panel { display: flex; } }

  .fp-panel-inner { position: relative; z-index: 2; display: flex; flex-direction: column; padding: 2.5rem; height: 100%; }
  .fp-panel-glow { position: absolute; inset: 0; z-index: 1; background: radial-gradient(ellipse 80% 60% at 50% 50%, rgba(106,44,145,0.25) 0%, transparent 70%); pointer-events: none; }

  .rp-logo-link { display:inline-block; line-height:0; transition:opacity .2s; }
  .rp-logo-link:hover { opacity:.8; }
  .rp-logo { width:72px; height:72px; object-fit:contain; }

  .fp-logo-mark { width: 42px; height: 42px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
  .fp-logo-mark svg { width: 22px; height: 22px; }
  .fp-logo-mark.sm { width: 36px; height: 36px; border-radius: 10px; background: var(--purple-primary); border-color: transparent; color: white; }
  .fp-logo-mark.sm svg { width: 18px; height: 18px; }
  .fp-wordmark { font-size: 20px; font-weight: 800; letter-spacing: -0.04em; color: white; }
  .fp-wordmark.inline { color: var(--text-primary); }

  .fp-panel-badge { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.875rem; background: rgba(106,44,145,0.25); border: 1px solid rgba(106,44,145,0.4); border-radius: 100px; font-size: 0.75rem; color: #c4b5fd; margin-bottom: 1.5rem; width: fit-content; }
  .fp-panel-headline { font-family: 'DM Serif Display', Georgia, serif; font-size: 2.5rem; line-height: 1.2; color: white; margin-bottom: 1rem; }
  .fp-panel-headline em { color: #c4b5fd; font-style: italic; }
  .fp-panel-desc { font-size: 0.875rem; line-height: 1.65; color: rgba(196,181,253,0.82); margin-bottom: 2rem; }

  .fp-features { display: flex; flex-direction: column; gap: 0.875rem; margin-bottom: auto; }
  .fp-feature-card { display: flex; align-items: flex-start; gap: 0.875rem; padding: 0.875rem 1rem; background: rgba(255,255,255,0.05); border-radius: 1rem; transition: background 0.2s; }
  .fp-feature-card:hover { background: rgba(255,255,255,0.09); }
  .fp-feature-icon { width: 36px; height: 36px; background: rgba(106,44,145,0.25); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #c4b5fd; flex-shrink: 0; }
  .fp-feature-card strong { display: block; font-size: 0.813rem; font-weight: 600; color: white; margin-bottom: 0.2rem; }
  .fp-feature-card span { font-size: 0.75rem; color: rgba(196,181,253,0.8); line-height: 1.4; }

  .fp-panel-footer { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); }
  .fp-avatars { display: flex; align-items: center; margin-bottom: 0.625rem; }
  .fp-avatar { width: 30px; height: 30px; border-radius: 50%; border: 2px solid #2d1b4e; margin-left: -7px; }
  .fp-avatar:first-child { margin-left: 0; }
  .fp-avatar-count { width: 30px; height: 30px; border-radius: 50%; background: rgba(106,44,145,0.4); border: 2px solid #2d1b4e; display: flex; align-items: center; justify-content: center; font-size: 0.625rem; font-weight: 700; color: white; margin-left: -7px; }
  .fp-panel-footer p { font-size: 0.688rem; color: rgba(196,181,253,0.65); }

  .fp-main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem 1.25rem; min-height: 100vh; background: var(--bg-primary); }
  .fp-form-shell { width: 100%; max-width: 480px; display: flex; flex-direction: column; gap: 1.5rem; }

  .fp-back-home { display: inline-flex; align-items: center; gap: 0.5rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 100px; padding: 0.5rem 1rem; font-size: 0.813rem; font-weight: 500; color: var(--text-secondary); text-decoration: none; transition: all 0.2s; width: fit-content; }
  .fp-back-home:hover { border-color: var(--purple-primary); color: var(--purple-on-light); background: var(--purple-light); transform: translateX(-2px); }

  .fp-mobile-brand { display: none; align-items: center; gap: 8px; justify-content: center; }
  @media (max-width: 1023px) { .fp-mobile-brand { display: flex; } }

  .fp-form-header { text-align: center; }
  .fp-form-title { font-family: 'DM Serif Display', Georgia, serif; font-size: clamp(1.75rem, 4vw, 2.25rem); color: var(--text-primary); margin-bottom: 0.25rem; letter-spacing: -0.02em; }
  .fp-form-subtitle { font-size: 0.875rem; color: var(--text-secondary); }

  .fp-card { background: var(--bg-secondary); border-radius: 1.5rem; border: 1px solid var(--border); padding: clamp(1.25rem, 5vw, 2rem); box-shadow: 0 20px 35px -12px rgba(0,0,0,0.12); }

  .fp-welcome-msg { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1rem; background: var(--purple-light); border-radius: 1rem; margin-bottom: 1.5rem; }
  .fp-welcome-msg :global(svg) { color: var(--purple-on-light); flex-shrink: 0; }
  .fp-welcome-msg strong { display: block; font-size: 0.875rem; font-weight: 700; color: var(--text-primary); }
  .fp-welcome-msg span { font-size: 0.75rem; color: var(--text-secondary); }

  .fp-alert-error { display: flex; align-items: center; gap: 0.625rem; padding: 0.75rem 1rem; background: color-mix(in srgb, var(--error) 10%, transparent); border: 1px solid color-mix(in srgb, var(--error) 30%, transparent); border-radius: 0.75rem; color: var(--error); font-size: 0.813rem; margin-bottom: 1.25rem; }

  .fp-field { display: flex; flex-direction: column; gap: 0.375rem; margin-bottom: 1.25rem; }
  .fp-label { font-size: 0.813rem; font-weight: 600; color: var(--text-secondary); }
  .fp-req { color: var(--purple-primary); }
  .fp-hint { font-size: 0.688rem; color: var(--text-muted); }
  .fp-err { font-size: 0.75rem; color: var(--error); }

  .fp-input-wrap { position: relative; }
  .fp-input-icon { position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex; align-items: center; pointer-events: none; }
  .fp-input { width: 100%; padding: 0.75rem 0.875rem 0.75rem 2.625rem; border: 1.5px solid var(--border); border-radius: 0.75rem; font-size: 0.875rem; font-family: 'DM Sans', sans-serif; color: var(--text-primary); background: var(--bg-primary); transition: all 0.2s; outline: none; }
  .fp-input:hover { border-color: var(--purple-accent); }
  .fp-input:focus { border-color: var(--purple-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--purple-primary) 12%, transparent); }
  .fp-input--err { border-color: var(--error); background: color-mix(in srgb, var(--error) 5%, var(--bg-primary)); }

  .fp-btn-primary { width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.8125rem 1.25rem; background: var(--purple-primary); color: white; border: none; border-radius: 0.75rem; font-size: 0.9375rem; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; box-shadow: 0 4px 14px color-mix(in srgb, var(--purple-primary) 35%, transparent); transition: all 0.2s; text-decoration: none; }
  .fp-btn-primary:hover:not(:disabled) { background: var(--purple-primary-dark); transform: translateY(-2px); box-shadow: 0 6px 20px color-mix(in srgb, var(--purple-primary) 45%, transparent); }
  .fp-btn-primary:active:not(:disabled) { transform: translateY(0); }
  .fp-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }

  .fp-btn-back { width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: var(--bg-primary); border: 1.5px solid var(--border); border-radius: 0.75rem; font-size: 0.875rem; font-weight: 500; font-family: 'DM Sans', sans-serif; color: var(--text-secondary); text-decoration: none; transition: all 0.2s; }
  .fp-btn-back:hover { border-color: var(--purple-primary); color: var(--purple-on-light); background: var(--purple-light); }

  .fp-divider { position: relative; text-align: center; margin: 1.25rem 0; }
  .fp-divider::before { content: ''; position: absolute; left: 0; top: 50%; width: 100%; height: 1px; background: var(--border); }
  .fp-divider span { position: relative; background: var(--bg-secondary); padding: 0 0.875rem; font-size: 0.75rem; color: var(--text-muted); font-weight: 500; }

  .fp-success { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.75rem; }
  .fp-success-icon { width: 72px; height: 72px; background: color-mix(in srgb, var(--success) 12%, transparent); border: 1px solid color-mix(in srgb, var(--success) 30%, transparent); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--success); margin-bottom: 0.25rem; }
  .fp-success-title { font-family: 'DM Serif Display', Georgia, serif; font-size: 1.375rem; color: var(--text-primary); letter-spacing: -0.01em; margin: 0; }
  .fp-success-body { font-size: 0.875rem; color: var(--text-secondary); margin: 0; }
  .fp-success-email { display: inline-flex; align-items: center; gap: 0.5rem; background: var(--purple-light); border: 1px solid var(--purple-light-border); border-radius: 0.625rem; padding: 0.5rem 0.875rem; font-size: 0.813rem; font-weight: 600; color: var(--purple-on-light); }
  .fp-success-note { font-size: 0.75rem; color: var(--text-muted); line-height: 1.6; max-width: 300px; margin: 0.25rem 0 0.75rem; }
  .fp-success .fp-btn-primary { margin-top: 0.25rem; }
  .fp-btn-resend { background: none; border: none; font-size: 0.813rem; color: var(--text-muted); cursor: pointer; font-family: 'DM Sans', sans-serif; text-decoration: underline; padding: 0; transition: color 0.2s; }
  .fp-btn-resend:hover { color: var(--purple-primary); }

  .fp-link { color: var(--purple-primary); font-weight: 500; text-decoration: none; }
  .fp-link:hover { text-decoration: underline; }
  .fp-footer-text { text-align: center; font-size: 0.875rem; color: var(--text-secondary); }

  .fp-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; flex-shrink: 0; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes stepIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  @media (max-width: 640px) {
    .fp-main { padding: 1.5rem 1rem; align-items: flex-start; }
    .fp-form-shell { gap: 1.25rem; }
    .fp-card { border-radius: 1.25rem; }
    .fp-back-home { font-size: 0.75rem; padding: 0.375rem 0.875rem; }
  }
</style>