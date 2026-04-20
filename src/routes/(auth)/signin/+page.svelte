<script lang="ts">
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { authClient } from '$lib/auth-client';
  import { authStore } from '$lib/stores/auth';
  import {
    Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ArrowLeft,
    ChevronLeft, Home, Sparkles, ShieldCheck, Fingerprint,
    BookOpen, Zap
  } from 'lucide-svelte';

  let step         = $state<'identifier' | 'password'>('identifier');
  let formData     = $state({ identifier: '', password: '', rememberMe: false });
  let errors       = $state<Record<string, string>>({});
  let isLoading    = $state(false);
  let showPassword = $state(false);
  let touched      = $state<Record<string, boolean>>({});

  let visible = $state(!browser);

  $effect(() => {
    const unsub = authStore.subscribe(s => {
      if (s.user) goto('/dashboard', { replaceState: true });
      else visible = true;
    });
    return unsub;
  });

  const validateIdentifier = () => {
    const e: Record<string, string> = {};
    if (!formData.identifier.trim()) e.identifier = 'Required';
    else if (!formData.identifier.includes('@')) e.identifier = 'Enter a valid email address';
    return e;
  };

  const handleIdentifierSubmit = async (ev: Event) => {
    ev.preventDefault();
    const errs = validateIdentifier();
    if (Object.keys(errs).length) { errors = errs; touched.identifier = true; return; }
    errors = {};
    step = 'password';
  };

  const handlePasswordSubmit = async (ev: Event) => {
    ev.preventDefault();
    isLoading = true;
    errors = {};
    try {
      const resolveRes = await fetch('/api/login-resolver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: formData.identifier }),
      });
      if (!resolveRes.ok) { errors.submit = 'Account not found.'; return; }
      const { email } = await resolveRes.json();
      const { error } = await authClient.signIn.email({
        email,
        password: formData.password,
        dontRememberMe: !formData.rememberMe,
      });
      if (error) errors.submit = error.message ?? 'Invalid credentials.';
      else await goto('/dashboard');
    } catch {
      errors.submit = 'Sign in failed. Check your connection.';
    } finally {
      isLoading = false;
    }
  };

  const handlePasskeyLogin = async () => {
    isLoading = true;
    errors = {};
    try {
      const { error } = await authClient.signIn.passkey();
      if (error) errors.submit = error.message || 'Passkey authentication failed.';
      else await goto('/dashboard');
    } catch {
      errors.submit = 'An unexpected error occurred.';
    } finally {
      isLoading = false;
    }
  };

  const goBack = () => { step = 'identifier'; errors = {}; };
</script>

<svelte:head>
  <title>Sign in — Sabify</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
</svelte:head>

<div class="si-page" class:si-page--hidden={!visible}>

  <aside class="si-panel">
    <div class="si-panel-inner">
     <div class="si-panel-hero">
        <div class="si-panel-badge"><Sparkles size={13} /><span>Welcome back</span></div>
        <h2 class="si-panel-headline">Your campus,<br/><em>in your pocket.</em></h2>
        <p class="si-panel-desc">Past questions, dues, safety alerts — one place for every Nigerian student.</p>
      </div>
      <div class="si-features">
        <div class="si-feature-card">
          <div class="si-feature-icon"><BookOpen size={17} /></div>
          <div><strong>Past Questions</strong><span>Study smarter with verified exam papers</span></div>
        </div>
        <div class="si-feature-card">
          <div class="si-feature-icon"><Zap size={17} /></div>
          <div><strong>Pay Dues Instantly</strong><span>Association dues without the stress</span></div>
        </div>
        <div class="si-feature-card">
          <div class="si-feature-icon"><ShieldCheck size={17} /></div>
          <div><strong>Campus Shield</strong><span>Safety alerts and verified reports</span></div>
        </div>
      </div>
      <div class="si-panel-footer">
        <div class="si-avatars">
          <div class="si-avatar" style="background:#a78bfa"></div>
          <div class="si-avatar" style="background:#7c3aed"></div>
          <div class="si-avatar" style="background:#6d28d9"></div>
          <div class="si-avatar" style="background:#5b21b6"></div>
          <div class="si-avatar-count">+8k</div>
        </div>
        <p>Trusted by students across Nigeria</p>
      </div>
    </div>
    <div class="si-panel-glow"></div>
  </aside>

  <main class="si-main">
    <div class="si-form-shell">

      <a href="/" class="si-back-home">
        <ChevronLeft size={17} /><Home size={13} /><span>Back to Home</span>
      </a>

      <div class="si-mobile-brand">
        <div class="si-logo-mark sm">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M10 2L17 6V11C17 15.5 13.5 18.5 10 19C6.5 18.5 3 15.5 3 11V6L10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M7 10.5L9.5 13L13.5 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <div class="si-form-header">
        <h1 class="si-form-title">Welcome back</h1>
        <p class="si-form-subtitle">{step === 'identifier' ? 'Sign in to your Sabify account' : 'Enter your credentials'}</p>
      </div>

      <div class="si-card">
        {#if errors.submit}
          <div class="si-alert-error"><AlertCircle size={17} /><span>{errors.submit}</span></div>
        {/if}

        <div class="si-steps">
          <div class="si-step-dot" class:active={step === 'identifier'} class:done={step === 'password'}></div>
          <div class="si-step-line" class:filled={step === 'password'}></div>
          <div class="si-step-dot" class:active={step === 'password'}></div>
        </div>

        {#if step === 'identifier'}
          <div class="si-step-body">
            <div class="si-welcome-msg">
              <Mail size={19} />
              <div><strong>Sign in securely</strong><span>Use the email you signed up with</span></div>
            </div>
            <form onsubmit={handleIdentifierSubmit}>
              <div class="si-field">
                <label class="si-label" for="identifier">Email address <span class="si-req">*</span></label>
                <div class="si-input-wrap">
                  <span class="si-input-icon"><Mail size={15} /></span>
                  <input type="email" id="identifier" placeholder="you@university.edu.ng"
                    bind:value={formData.identifier}
                    onblur={() => { touched.identifier = true; errors.identifier = validateIdentifier().identifier ?? ''; }}
                    class="si-input" class:si-input--err={errors.identifier && touched.identifier}
                    autocomplete="email" />
                </div>
                {#if errors.identifier && touched.identifier}
                  <p class="si-err">{errors.identifier}</p>
                {:else}
                  <p class="si-hint">Your university or personal email</p>
                {/if}
              </div>
              <div class="si-actions">
                <button type="submit" class="si-btn-next si-btn-next--full">Continue <ArrowRight size={15} /></button>
              </div>
            </form>
          </div>
        {/if}

        {#if step === 'password'}
          <div class="si-step-body">
            <div class="si-welcome-msg">
              <Fingerprint size={19} />
              <div><strong>Verify your identity</strong><span>Enter your password to continue</span></div>
            </div>
            <div class="si-email-badge">
              <Mail size={13} />
              <span class="si-badge-email">{formData.identifier}</span>
              <button type="button" class="si-badge-edit" onclick={goBack}>Edit</button>
            </div>
            <form onsubmit={handlePasswordSubmit}>
              <div class="si-field">
                <div class="si-label-row">
                  <label class="si-label" for="password">Password <span class="si-req">*</span></label>
                  <a href="/forgot-password" class="si-link si-forgot">Forgot password?</a>
                </div>
                <div class="si-input-wrap">
                  <span class="si-input-icon"><Lock size={15} /></span>
                  <input type={showPassword ? 'text' : 'password'} id="password" placeholder="••••••••"
                    bind:value={formData.password}
                    onblur={() => { touched.password = true; }}
                    class="si-input si-input--toggle"
                    class:si-input--err={errors.password && touched.password}
                    autocomplete="current-password" />
                  <button type="button" class="si-eye-btn"
                    onclick={() => (showPassword = !showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {#if showPassword}<EyeOff size={15} />{:else}<Eye size={15} />{/if}
                  </button>
                </div>
                {#if errors.password && touched.password}
                  <p class="si-err">{errors.password}</p>
                {:else}
                  <p class="si-hint">Minimum 6 characters</p>
                {/if}
              </div>
              <label class="si-remember">
                <input type="checkbox" bind:checked={formData.rememberMe} class="si-checkbox" />
                <span>Remember me for 30 days</span>
              </label>
              <div class="si-actions">
                <button type="button" class="si-btn-back" onclick={goBack}><ArrowLeft size={15} /> Back</button>
                <button type="submit" class="si-btn-next" disabled={isLoading}>
                  {#if isLoading}<span class="si-spinner"></span> Signing in…
                  {:else}<ShieldCheck size={15} /> Sign in <ArrowRight size={15} />{/if}
                </button>
              </div>
            </form>
            {#if typeof window !== 'undefined' && window.PublicKeyCredential}
              <div class="si-passkey-divider"><span>or continue with</span></div>
              <button type="button" class="si-passkey-btn" disabled={isLoading} onclick={handlePasskeyLogin}>
                {#if isLoading}<span class="si-spinner si-spinner--dark"></span>
                {:else}<Fingerprint size={17} /><span>Sign in with Passkey</span>{/if}
              </button>
            {/if}
          </div>
        {/if}
      </div>

      <p class="si-footer-text">Don't have an account? <a href="/signup" class="si-link">Create one</a></p>
    </div>
  </main>
</div>

<style>
  :global(.si-page *) { font-family: 'DM Sans', system-ui, sans-serif; box-sizing: border-box; }

  .si-page { display: flex; min-height: 100vh; background: var(--bg-primary); }
  .si-page--hidden { opacity: 0; pointer-events: none; }

  .si-panel { display: none; position: relative; width: 440px; flex-shrink: 0; background: linear-gradient(160deg, #1a0b2e 0%, #2d1b4e 50%, #1a0b2e 100%); overflow: hidden; }
  @media (min-width: 1024px) { .si-panel { display: flex; } }
  .si-panel-inner { position: relative; z-index: 2; display: flex; flex-direction: column; padding: 2.5rem; height: 100%; }
  .si-panel-glow { position: absolute; inset: 0; z-index: 1; background: radial-gradient(ellipse 80% 60% at 50% 50%, rgba(106,44,145,0.25) 0%, transparent 70%); pointer-events: none; }

  .rp-logo-link { display:inline-block; line-height:0; transition:opacity .2s; }
  .rp-logo-link:hover { opacity:.8; }
  .rp-logo { width:72px; height:72px; object-fit:contain; }

  .si-logo-mark { width: 42px; height: 42px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
  .si-logo-mark svg { width: 22px; height: 22px; }
  .si-logo-mark.sm { width: 36px; height: 36px; border-radius: 10px; background: var(--purple-primary); border-color: transparent; color: white; }
  .si-logo-mark.sm svg { width: 18px; height: 18px; }

  .si-wordmark { font-size: 20px; font-weight: 800; letter-spacing: -0.04em; color: white; }
  .si-wordmark.inline { color: var(--text-primary); }

  .si-panel-badge { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.875rem; background: rgba(106,44,145,0.25); border: 1px solid rgba(106,44,145,0.4); border-radius: 100px; font-size: 0.75rem; color: #c4b5fd; margin-bottom: 1.5rem; width: fit-content; }
  .si-panel-headline { font-family: 'DM Serif Display', Georgia, serif; font-size: 2.5rem; line-height: 1.2; color: white; margin-bottom: 1rem; }
  .si-panel-headline em { color: #c4b5fd; font-style: italic; }
  .si-panel-desc { font-size: 0.875rem; line-height: 1.65; color: rgba(196,181,253,0.82); margin-bottom: 2rem; }

  .si-features { display: flex; flex-direction: column; gap: 0.875rem; margin-bottom: auto; }
  .si-feature-card { display: flex; align-items: flex-start; gap: 0.875rem; padding: 0.875rem 1rem; background: rgba(255,255,255,0.05); border-radius: 1rem; transition: background 0.2s; }
  .si-feature-card:hover { background: rgba(255,255,255,0.09); }
  .si-feature-icon { width: 36px; height: 36px; background: rgba(106,44,145,0.25); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #c4b5fd; flex-shrink: 0; }
  .si-feature-card strong { display: block; font-size: 0.813rem; font-weight: 600; color: white; margin-bottom: 0.2rem; }
  .si-feature-card span { font-size: 0.75rem; color: rgba(196,181,253,0.8); line-height: 1.4; }

  .si-panel-footer { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); }
  .si-avatars { display: flex; align-items: center; margin-bottom: 0.625rem; }
  .si-avatar { width: 30px; height: 30px; border-radius: 50%; border: 2px solid #2d1b4e; margin-left: -7px; }
  .si-avatar:first-child { margin-left: 0; }
  .si-avatar-count { width: 30px; height: 30px; border-radius: 50%; background: rgba(106,44,145,0.4); border: 2px solid #2d1b4e; display: flex; align-items: center; justify-content: center; font-size: 0.625rem; font-weight: 700; color: white; margin-left: -7px; }
  .si-panel-footer p { font-size: 0.688rem; color: rgba(196,181,253,0.65); }

  .si-main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem 1.25rem; min-height: 100vh; background: var(--bg-primary); }
  .si-form-shell { width: 100%; max-width: 500px; display: flex; flex-direction: column; gap: 1.5rem; }

  .si-back-home { display: inline-flex; align-items: center; gap: 0.5rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 100px; padding: 0.5rem 1rem; font-size: 0.813rem; font-weight: 500; color: var(--text-secondary); text-decoration: none; transition: all 0.2s; width: fit-content; }
  .si-back-home:hover { border-color: var(--purple-primary); color: var(--purple-on-light); background: var(--purple-light); transform: translateX(-2px); }

  .si-mobile-brand { display: none; align-items: center; gap: 8px; justify-content: center; }
  @media (max-width: 1023px) { .si-mobile-brand { display: flex; } }

  .si-form-header { text-align: center; }
  .si-form-title { font-family: 'DM Serif Display', Georgia, serif; font-size: clamp(1.75rem, 4vw, 2.25rem); color: var(--text-primary); margin-bottom: 0.25rem; letter-spacing: -0.02em; }
  .si-form-subtitle { font-size: 0.875rem; color: var(--text-secondary); }

  .si-card { background: var(--bg-secondary); border-radius: 1.5rem; border: 1px solid var(--border); padding: clamp(1.25rem, 5vw, 2rem); box-shadow: 0 20px 35px -12px rgba(0,0,0,0.12); }

  .si-steps { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.75rem; }
  .si-step-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); flex-shrink: 0; transition: all 0.3s ease; }
  .si-step-dot.active { background: var(--purple-primary); width: 24px; border-radius: 4px; box-shadow: 0 0 0 3px color-mix(in srgb, var(--purple-primary) 20%, transparent); }
  .si-step-dot.done { background: var(--purple-primary-dark); }
  .si-step-line { flex: 1; height: 2px; background: var(--border); border-radius: 1px; transition: background 0.4s ease; }
  .si-step-line.filled { background: var(--purple-primary-dark); }

  .si-welcome-msg { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1rem; background: var(--purple-light); border-radius: 1rem; margin-bottom: 1.5rem; }
  .si-welcome-msg :global(svg) { color: var(--purple-on-light); flex-shrink: 0; }
  .si-welcome-msg strong { display: block; font-size: 0.875rem; font-weight: 700; color: var(--text-primary); }
  .si-welcome-msg span { font-size: 0.75rem; color: var(--text-secondary); }

  .si-alert-error { display: flex; align-items: center; gap: 0.625rem; padding: 0.75rem 1rem; background: color-mix(in srgb, var(--error) 10%, transparent); border: 1px solid color-mix(in srgb, var(--error) 30%, transparent); border-radius: 0.75rem; color: var(--error); font-size: 0.813rem; margin-bottom: 1.5rem; }

  .si-email-badge { display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem 0.875rem; background: var(--purple-light); border: 1px solid var(--purple-light-border); border-radius: 0.75rem; margin-bottom: 1.25rem; color: var(--purple-on-light); }
  .si-badge-email { font-size: 0.813rem; font-weight: 500; color: var(--text-primary); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .si-badge-edit { background: none; border: none; font-size: 0.75rem; font-weight: 600; color: var(--purple-on-light); cursor: pointer; padding: 0.25rem 0.5rem; border-radius: 0.5rem; transition: background 0.2s; }
  .si-badge-edit:hover { background: color-mix(in srgb, var(--purple-primary) 12%, transparent); }

  .si-step-body { display: flex; flex-direction: column; }
  .si-field { display: flex; flex-direction: column; gap: 0.375rem; margin-bottom: 1.125rem; }
  .si-label-row { display: flex; align-items: center; justify-content: space-between; }
  .si-label { font-size: 0.813rem; font-weight: 600; color: var(--text-secondary); }
  .si-req { color: var(--purple-primary); }
  .si-hint { font-size: 0.688rem; color: var(--text-muted); }
  .si-forgot { font-size: 0.75rem; }

  .si-input-wrap { position: relative; }
  .si-input-icon { position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); display: flex; align-items: center; pointer-events: none; }
  .si-input { width: 100%; padding: 0.75rem 0.875rem 0.75rem 2.625rem; border: 1.5px solid var(--border); border-radius: 0.75rem; font-size: 0.875rem; font-family: 'DM Sans', sans-serif; color: var(--text-primary); background: var(--bg-primary); transition: all 0.2s; outline: none; }
  .si-input:hover { border-color: var(--purple-accent); }
  .si-input:focus { border-color: var(--purple-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--purple-primary) 12%, transparent); }
  .si-input--err { border-color: var(--error); background: color-mix(in srgb, var(--error) 5%, var(--bg-primary)); }
  .si-input--toggle { padding-right: 2.75rem; }

  .si-eye-btn { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 0.25rem; transition: color 0.2s; display: flex; }
  .si-eye-btn:hover { color: var(--purple-primary); }
  .si-err { font-size: 0.75rem; color: var(--error); }

  .si-remember { display: flex; align-items: center; gap: 0.5rem; font-size: 0.813rem; color: var(--text-secondary); cursor: pointer; margin-bottom: 1.5rem; }
  .si-checkbox { width: 16px; height: 16px; accent-color: var(--purple-primary); cursor: pointer; flex-shrink: 0; }

  .si-actions { display: flex; gap: 0.75rem; align-items: center; }
  .si-btn-back { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.75rem 1.125rem; background: var(--bg-primary); border: 1.5px solid var(--border); border-radius: 0.75rem; font-size: 0.875rem; font-weight: 500; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
  .si-btn-back:hover { border-color: var(--purple-primary); color: var(--purple-on-light); background: var(--purple-light); transform: translateX(-2px); }

  .si-btn-next { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.8125rem 1.25rem; background: var(--purple-primary); color: white; border: none; border-radius: 0.75rem; font-size: 0.9375rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 14px color-mix(in srgb, var(--purple-primary) 35%, transparent); transition: all 0.2s; }
  .si-btn-next:hover:not(:disabled) { background: var(--purple-primary-dark); transform: translateY(-2px); box-shadow: 0 6px 20px color-mix(in srgb, var(--purple-primary) 45%, transparent); }
  .si-btn-next:active:not(:disabled) { transform: translateY(0); }
  .si-btn-next:disabled { opacity: 0.65; cursor: not-allowed; }
  .si-btn-next--full { width: 100%; }

  .si-passkey-divider { position: relative; text-align: center; margin: 1.25rem 0 1rem; }
  .si-passkey-divider::before { content: ''; position: absolute; left: 0; top: 50%; width: 100%; height: 1px; background: var(--border); }
  .si-passkey-divider span { position: relative; background: var(--bg-secondary); padding: 0 0.75rem; font-size: 0.75rem; color: var(--text-muted); }
  .si-passkey-btn { width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 0.625rem; padding: 0.8125rem 1.25rem; background: var(--bg-primary); border: 1.5px solid var(--border); border-radius: 0.75rem; font-size: 0.875rem; font-weight: 600; color: var(--text-primary); cursor: pointer; transition: all 0.2s; }
  .si-passkey-btn:hover { border-color: var(--purple-primary); background: var(--purple-light); color: var(--purple-on-light); transform: translateY(-1px); }

  .si-link { color: var(--purple-primary); font-weight: 500; text-decoration: none; }
  .si-link:hover { text-decoration: underline; }
  .si-footer-text { text-align: center; font-size: 0.875rem; color: var(--text-secondary); }

  .si-spinner { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; flex-shrink: 0; }
  .si-spinner--dark { border-color: color-mix(in srgb, var(--purple-primary) 25%, transparent); border-top-color: var(--purple-primary); }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 640px) {
    .si-main { padding: 1.5rem 1rem; align-items: flex-start; }
    .si-form-shell { gap: 1.25rem; }
    .si-card { border-radius: 1.25rem; padding: 1.25rem; }
    .si-actions { flex-direction: column-reverse; }
    .si-btn-back, .si-btn-next { width: 100%; justify-content: center; }
    .si-back-home { font-size: 0.75rem; padding: 0.375rem 0.875rem; }
  }
</style>