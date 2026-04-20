<!-- src/routes/(auth)/reset-password/page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onDestroy } from 'svelte';
  import {
    Lock, Eye, EyeOff, Check, AlertCircle,
    ShieldCheck, ArrowRight, Home, ChevronLeft
  } from 'lucide-svelte';

  // Token from URL: /reset-password?token=xxx
  const token = $derived($page.url.searchParams.get('token') ?? '');

  // ── Form state ──────────────────────────────────────────
  let password        = $state('');
  let confirmPassword = $state('');
  let showPassword    = $state(false);
  let showConfirm     = $state(false);
  let touched         = $state<Record<string, boolean>>({});
  let errors          = $state<Record<string, string>>({});
  let isLoading       = $state(false);
  let submitError     = $state('');
  let success         = $state(false);

  // ── Cooldown (prevent spam on error) ───────────────────
  const COOLDOWN_SECS = 30;
  let cooldown = $state(0);
  let cdTimer: ReturnType<typeof setInterval> | null = null;

  function startCooldown() {
    cooldown = COOLDOWN_SECS;
    cdTimer = setInterval(() => {
      cooldown--;
      if (cooldown <= 0) { clearInterval(cdTimer!); cdTimer = null; cooldown = 0; }
    }, 1000);
  }

  onDestroy(() => { if (cdTimer) clearInterval(cdTimer); });

  // ── Validation ──────────────────────────────────────────
  function validate() {
    const e: Record<string, string> = {};
    if (!password)                e.password = 'Password is required';
    else if (password.length < 8) e.password = 'At least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      e.password = 'Must contain uppercase, lowercase, and number';
    if (!confirmPassword)              e.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  }

  function blurField(field: string) {
    touched[field] = true;
    errors[field] = validate()[field] || '';
  }

  // ── Submit ──────────────────────────────────────────────
  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (cooldown > 0 || isLoading) return;
    touched = { password: true, confirmPassword: true };
    const errs = validate();
    if (Object.keys(errs).length > 0) { errors = errs; return; }
    isLoading   = true;
    submitError = '';
    try {
      const res = await fetch('/api/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Reset failed');
      success = true;
      setTimeout(() => goto('/signin'), 4000);
    } catch (err: unknown) {
      submitError = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      startCooldown();
    } finally {
      isLoading = false;
    }
  }

  // ── Password strength ───────────────────────────────────
  const strength = $derived(() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8)              s++;
    if (/[a-z]/.test(password))            s++;
    if (/[A-Z]/.test(password))            s++;
    if (/\d/.test(password))               s++;
    if (/[^a-zA-Z0-9]/.test(password))     s++;
    return s;
  });

  const strengthMeta = $derived(() => {
    const s = strength();
    if (s <= 1) return { label:'Weak',   color:'#dc2626', width:'20%'  };
    if (s <= 2) return { label:'Fair',   color:'#f59e0b', width:'45%'  };
    if (s <= 3) return { label:'Good',   color:'#6a2c91', width:'70%'  };
    return            { label:'Strong', color:'#1a0b2e', width:'100%' };
  });

  // ── Cooldown ring geometry ──────────────────────────────
  const circumference = 2 * Math.PI * 10;
  const ringOffset    = $derived(
    cooldown > 0
      ? circumference - (cooldown / COOLDOWN_SECS) * circumference
      : circumference
  );

  const tokenMissing = $derived(!token);
</script>

<svelte:head>
  <title>Reset Password — Sabify</title>
</svelte:head>

<div class="rp-page">
  <!-- Background blobs for visual depth -->
  <div class="rp-blob rp-blob--1"></div>
  <div class="rp-blob rp-blob--2"></div>

  <div class="rp-shell">

     <div class="si-mobile-brand">
        <div class="si-logo-mark sm">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M10 2L17 6V11C17 15.5 13.5 18.5 10 19C6.5 18.5 3 15.5 3 11V6L10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M7 10.5L9.5 13L13.5 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

    <!-- ── SUCCESS ── -->
    {#if success}
      <div class="rp-card rp-card--success">
        <div class="rp-success-icon-wrap">
          <div class="rp-success-ring"></div>
          <div class="rp-success-icon"><ShieldCheck size={32} /></div>
        </div>
        <h1 class="rp-title">Password updated!</h1>
        <p class="rp-success-desc">Your password has been reset successfully. You'll be redirected to sign in shortly.</p>
        <div class="rp-redirect-bar"><div class="rp-redirect-fill"></div></div>
        <button class="rp-btn rp-btn--primary rp-btn--full" onclick={() => goto('/signin')}>
          Sign in now <ArrowRight size={15} />
        </button>
      </div>

    <!-- ── INVALID TOKEN ── -->
    {:else if tokenMissing}
      <div class="rp-card">
        <div class="rp-invalid-icon"><AlertCircle size={36} /></div>
        <h1 class="rp-title">Invalid reset link</h1>
        <p class="rp-subtitle">This link is missing a token. It may have been copied incorrectly or already used.</p>
        <div class="rp-invalid-actions">
          <button class="rp-btn rp-btn--primary rp-btn--full" onclick={() => goto('/forgot-password')}>
            Request a new link <ArrowRight size={15} />
          </button>
          <button class="rp-btn rp-btn--ghost rp-btn--full" onclick={() => goto('/signin')}>
            Back to sign in
          </button>
        </div>
      </div>

    <!-- ── FORM ── -->
    {:else}
      <div class="rp-card">

        <div class="rp-card-header">
          <div class="rp-lock-icon"><Lock size={22} /></div>
          <div>
            <h1 class="rp-title">Set new password</h1>
            <p class="rp-subtitle">Choose something strong that you haven't used before</p>
          </div>
        </div>

        {#if submitError}
          <div class="rp-alert-error">
            <AlertCircle size={16} /><span>{submitError}</span>
          </div>
        {/if}

        <form onsubmit={handleSubmit} class="rp-form">

          <!-- New password -->
          <div class="rp-field">
            <label class="rp-label" for="rp-password">
              New Password <span class="rp-req">*</span>
            </label>
            <div class="rp-input-wrap">
              <span class="rp-ico"><Lock size={15} /></span>
              <input
                id="rp-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                bind:value={password}
                onblur={() => blurField('password')}
                class="rp-input rp-input--toggle {errors.password && touched.password ? 'rp-input--err' : ''}"
              />
              <button type="button" class="rp-eye" onclick={() => showPassword = !showPassword}>
                {#if showPassword}<EyeOff size={15} />{:else}<Eye size={15} />{/if}
              </button>
            </div>
            {#if errors.password && touched.password}
              <p class="rp-err"><AlertCircle size={12} />{errors.password}</p>
            {:else if password}
              <div class="rp-strength">
                <div class="rp-strength-track">
                  <div class="rp-strength-fill" style="width:{strengthMeta().width};background:{strengthMeta().color}"></div>
                </div>
                <span class="rp-strength-label" style="color:{strengthMeta().color}">{strengthMeta().label}</span>
              </div>
              <div class="rp-hints">
                {#each [
                  [password.length >= 8,         '8+ chars' ],
                  [/[A-Z]/.test(password),        'Uppercase'],
                  [/[a-z]/.test(password),        'Lowercase'],
                  [/\d/.test(password),            'Number'  ],
                  [/[^a-zA-Z0-9]/.test(password), 'Symbol'  ],
                ] as [ok, lbl]}
                  <span class="rp-hint {ok ? 'rp-hint--ok' : 'rp-hint--no'}">
                    {#if ok}<Check size={9} />{/if}{lbl}
                  </span>
                {/each}
              </div>
            {/if}
          </div>

          <!-- Confirm password -->
          <div class="rp-field">
            <label class="rp-label" for="rp-confirm">
              Confirm Password <span class="rp-req">*</span>
            </label>
            <div class="rp-input-wrap">
              <span class="rp-ico"><Lock size={15} /></span>
              <input
                id="rp-confirm"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat your password"
                bind:value={confirmPassword}
                onblur={() => blurField('confirmPassword')}
                class="rp-input rp-input--toggle {errors.confirmPassword && touched.confirmPassword ? 'rp-input--err' : ''}"
              />
              <button type="button" class="rp-eye" onclick={() => showConfirm = !showConfirm}>
                {#if showConfirm}<EyeOff size={15} />{:else}<Eye size={15} />{/if}
              </button>
            </div>
            {#if errors.confirmPassword && touched.confirmPassword}
              <p class="rp-err"><AlertCircle size={12} />{errors.confirmPassword}</p>
            {:else if confirmPassword && password === confirmPassword}
              <p class="rp-match"><Check size={12} /> Passwords match</p>
            {/if}
          </div>

          <!-- Submit -->
          <button
            type="submit"
            class="rp-btn rp-btn--primary rp-btn--full rp-btn--submit"
            disabled={isLoading || cooldown > 0}>
            {#if isLoading}
              <span class="rp-spinner"></span>Updating password…
            {:else if cooldown > 0}
              <span class="rp-cd-ring">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="2.5"/>
                  <circle cx="12" cy="12" r="10" fill="none" stroke="white" stroke-width="2.5"
                    stroke-dasharray={circumference}
                    stroke-dashoffset={ringOffset}
                    stroke-linecap="round"
                    transform="rotate(-90 12 12)" />
                </svg>
                <span class="rp-cd-num">{cooldown}</span>
              </span>
              Try again in {cooldown}s
            {:else}
              <ShieldCheck size={16} />Reset password
            {/if}
          </button>

        </form>
      </div>
    {/if}

    <div class="rp-footer">
      <p>Remember your password? <a href="/signin" class="rp-link">Sign in</a></p>
    </div>

    <a href="/" class="rp-home-btn">
      <ChevronLeft size={13} /><Home size={13} /><span>Back to Home</span>
    </a>

  </div>
</div>

<style>
  :global(.rp-page *) { font-family: 'DM Sans', system-ui, sans-serif; box-sizing: border-box; }

  .rp-page {
    min-height: 100vh;
    background: var(--bg-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.25rem;
    position: relative;
    overflow: hidden;
  }

  .rp-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(90px);
    pointer-events: none;
    z-index: 0;
  }
  .rp-blob--1 {
    width: 420px;
    height: 420px;
    background: radial-gradient(circle, var(--purple-primary) 0%, transparent 70%);
    opacity: 0.08;
    top: -120px;
    right: -80px;
    animation: rp-float 9s ease-in-out infinite;
  }
  .rp-blob--2 {
    width: 320px;
    height: 320px;
    background: radial-gradient(circle, var(--purple-accent) 0%, transparent 70%);
    opacity: 0.06;
    bottom: -80px;
    left: -60px;
    animation: rp-float 11s ease-in-out infinite reverse;
  }

  .rp-shell {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 440px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .rp-logo-link { display:inline-block; line-height:0; transition:opacity .2s; }
  .rp-logo-link:hover { opacity:.8; }
  .rp-logo { width:72px; height:72px; object-fit:contain; }

  .rp-logo-mark {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--purple-primary) 0%, var(--purple-primary-dark) 100%);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 6px 16px rgba(106,44,145,0.25);
  }
  .rp-logo-mark svg { width: 24px; height: 24px; }

  .rp-wordmark {
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.04em;
    background: linear-gradient(135deg, var(--purple-primary) 0%, var(--purple-primary-dark) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .rp-card {
    width: 100%;
    background: var(--bg-secondary);
    border-radius: 1.5rem;
    border: 1px solid var(--border);
    box-shadow: 0 24px 48px -12px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.04);
    padding: clamp(1.5rem, 5vw, 2rem);
    display: flex;
    flex-direction: column;
    gap: 1.375rem;
    animation: rp-rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .rp-card-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  .rp-lock-icon {
    width: 48px;
    height: 48px;
    border-radius: 1rem;
    flex-shrink: 0;
    background: linear-gradient(135deg, var(--purple-primary-dark) 0%, var(--purple-primary) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #c4b5fd;
    box-shadow: 0 6px 16px rgba(106,44,145,0.25);
  }

  .rp-title {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: clamp(1.4rem, 4vw, 1.75rem);
    color: var(--text-primary);
    letter-spacing: -0.02em;
    margin: 0;
    line-height: 1.2;
  }

  .rp-subtitle {
    font-size: 0.8125rem;
    color: var(--text-secondary);
    margin: 0.25rem 0 0;
    line-height: 1.5;
  }

  .rp-alert-error {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.75rem 1rem;
    background: color-mix(in srgb, var(--error) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--error) 30%, transparent);
    border-radius: 0.75rem;
    color: var(--error);
    font-size: 0.8125rem;
  }

  .rp-form {
    display: flex;
    flex-direction: column;
    gap: 1.125rem;
  }

  .rp-field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .rp-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .rp-req {
    color: var(--purple-primary);
  }

  .rp-input-wrap {
    position: relative;
  }

  .rp-ico {
    position: absolute;
    left: 0.875rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    display: flex;
    align-items: center;
    pointer-events: none;
  }

  .rp-input {
    width: 100%;
    padding: 0.75rem 0.875rem 0.75rem 2.5rem;
    border: 1.5px solid var(--border);
    border-radius: 0.75rem;
    font-size: 0.875rem;
    font-family: 'DM Sans', sans-serif;
    color: var(--text-primary);
    background: var(--bg-primary);
    transition: all 0.2s;
    outline: none;
  }
  .rp-input:hover { border-color: var(--purple-accent); }
  .rp-input:focus {
    border-color: var(--purple-primary);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--purple-primary) 12%, transparent);
  }
  .rp-input--err {
    border-color: var(--error);
    background: color-mix(in srgb, var(--error) 5%, var(--bg-primary));
  }
  .rp-input--toggle { padding-right: 2.75rem; }

  .rp-eye {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-muted);
    display: flex;
    padding: 0.25rem;
    transition: color 0.2s;
  }
  .rp-eye:hover { color: var(--purple-primary); }

  .rp-strength {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin-top: 0.25rem;
  }
  .rp-strength-track {
    flex: 1;
    height: 4px;
    background: var(--border);
    border-radius: 2px;
    overflow: hidden;
  }
  .rp-strength-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.35s ease, background 0.35s ease;
  }
  .rp-strength-label {
    font-size: 0.6875rem;
    font-weight: 700;
    min-width: 44px;
    text-align: right;
  }

  .rp-hints {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin-top: 0.375rem;
  }
  .rp-hint {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.6875rem;
    font-weight: 500;
    padding: 0.2rem 0.625rem;
    border-radius: 100px;
    transition: all 0.2s;
  }
  .rp-hint--ok {
    background: var(--purple-light);
    color: var(--purple-primary);
    border: 1px solid color-mix(in srgb, var(--purple-primary) 25%, transparent);
  }
  .rp-hint--no {
    background: var(--bg-tertiary);
    color: var(--text-muted);
    border: 1px solid var(--border-light);
  }

  .rp-err {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.75rem;
    color: var(--error);
    margin: 0;
  }

  .rp-match {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.75rem;
    color: var(--success);
    font-weight: 500;
    margin: 0;
  }

  .rp-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.8125rem 1.25rem;
    border-radius: 0.75rem;
    font-size: 0.9rem;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }
  .rp-btn--full { width: 100%; }
  .rp-btn--primary {
    background: var(--purple-primary);
    color: white;
    box-shadow: 0 4px 14px color-mix(in srgb, var(--purple-primary) 35%, transparent);
  }
  .rp-btn--primary:hover:not(:disabled) {
    background: var(--purple-primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px color-mix(in srgb, var(--purple-primary) 45%, transparent);
  }
  .rp-btn--primary:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }
  .rp-btn--ghost {
    background: var(--bg-primary);
    color: var(--text-secondary);
    border: 1.5px solid var(--border);
  }
  .rp-btn--ghost:hover {
    border-color: var(--purple-primary);
    color: var(--purple-primary);
    background: var(--purple-light);
  }
  .rp-btn--submit { margin-top: 0.25rem; }

  .rp-cd-ring {
    position: relative;
    width: 18px;
    height: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .rp-cd-ring svg {
    position: absolute;
    inset: 0;
  }
  .rp-cd-num {
    font-size: 0.55rem;
    font-weight: 800;
    color: white;
    position: relative;
    z-index: 1;
    line-height: 1;
  }

  .rp-spinner {
    width: 15px;
    height: 15px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: rp-spin 0.55s linear infinite;
    flex-shrink: 0;
  }

  /* Success state */
  .rp-card--success {
    align-items: center;
    text-align: center;
    padding: 2.5rem 2rem;
    background: linear-gradient(160deg, var(--purple-primary-dark) 0%, var(--purple-primary) 100%);
    border-color: transparent;
  }
  .rp-card--success .rp-title { color: white; }
  .rp-success-desc {
    color: rgba(196,181,253,0.85);
    font-size: 0.875rem;
    line-height: 1.6;
    margin: 0;
  }
  .rp-success-icon-wrap {
    position: relative;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.5rem;
  }
  .rp-success-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid rgba(196,181,253,0.3);
    animation: rp-pulse-ring 2s ease-out infinite;
  }
  .rp-success-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, #fff 0%, var(--purple-light) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--purple-primary);
    box-shadow: 0 0 32px rgba(106,44,145,0.5);
    animation: rp-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  .rp-redirect-bar {
    width: 100%;
    height: 3px;
    background: rgba(255,255,255,0.1);
    border-radius: 2px;
    overflow: hidden;
  }
  .rp-redirect-fill {
    height: 100%;
    background: #c4b5fd;
    animation: rp-progress 4s linear forwards;
  }
  .rp-card--success .rp-btn--primary {
    background: white;
    color: var(--purple-primary);
    box-shadow: 0 4px 14px rgba(0,0,0,0.2);
  }
  .rp-card--success .rp-btn--primary:hover {
    background: var(--purple-light);
  }

  /* Invalid token */
  .rp-invalid-icon {
    display: flex;
    justify-content: center;
    color: var(--warning);
  }
  .rp-invalid-actions {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .rp-footer {
    animation: rp-rise 0.5s 0.15s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .rp-footer p {
    font-size: 0.8125rem;
    color: var(--text-secondary);
    margin: 0;
    text-align: center;
  }

  .rp-link {
    color: var(--purple-primary);
    font-weight: 600;
    text-decoration: none;
  }
  .rp-link:hover { text-decoration: underline; }

  .rp-home-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 100px;
    padding: 0.5rem 1rem;
    font-size: 0.813rem;
    font-weight: 500;
    color: var(--text-secondary);
    text-decoration: none;
    transition: all 0.2s;
  }
  .rp-home-btn:hover {
    border-color: var(--purple-primary);
    color: var(--purple-primary);
    background: var(--purple-light);
    transform: translateX(-2px);
  }

  @keyframes rp-rise {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes rp-float {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(16px, 16px); }
  }
  @keyframes rp-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes rp-pop {
    from { transform: scale(0); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  @keyframes rp-pulse-ring {
    0% { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(1.5); opacity: 0; }
  }
  @keyframes rp-progress {
    from { width: 0%; }
    to { width: 100%; }
  }

  @media (max-width: 480px) {
    .rp-card { border-radius: 1.25rem; }
    .rp-card-header { flex-direction: column; gap: 0.75rem; align-items: center; text-align: center; }
    .rp-home-btn { font-size: 0.75rem; padding: 0.375rem 0.875rem; }
  }
</style>