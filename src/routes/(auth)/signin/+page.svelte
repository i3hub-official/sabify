<script lang="ts">
  import { onMount } from 'svelte';
  import { theme } from '$lib/stores/theme';
  import { Mail, Lock, ArrowRight, Eye, EyeOff, LogIn } from 'lucide-svelte';

  onMount(() => {
    theme.init();
  });

  let email = $state('');
  let password = $state('');
  let showPassword = $state(false);
  let isLoading = $state(false);
  let errorMessage = $state('');
  let successMessage = $state('');

  async function handleSubmit() {
    errorMessage = '';
    successMessage = '';
    isLoading = true;

    if (!email || !password) {
      errorMessage = 'Please enter both email and password';
      isLoading = false;
      return;
    }

    try {
      // TODO: Connect to Better-Auth signin
      console.log('Signing in:', { email, password });
      await new Promise(resolve => setTimeout(resolve, 1000));
      successMessage = 'Sign in successful! Redirecting...';
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch (error) {
      errorMessage = 'Invalid email or password. Please try again.';
    }

    isLoading = false;
  }
</script>

<svelte:head>
  <title>Sign in — Sabify</title>
  <meta name="description" content="Sign in to your Sabify account. Access past questions, pay dues, and stay safe on campus." />
</svelte:head>

<div class="auth-container">
  <div class="auth-card">
    <div class="auth-header">
      <div class="logo">
        <div class="logo-mark">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M10 2L17 6V11C17 15.5 13.5 18.5 10 19C6.5 18.5 3 15.5 3 11V6L10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M7 10.5L9.5 13L13.5 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="logo-text">Sabify</span>
      </div>
      <h1 class="auth-title">Welcome back</h1>
      <p class="auth-subtitle">Sign in to access your academic fortress</p>
    </div>

    {#if errorMessage}
      <div class="message error">
        <span>⚠️</span>
        <span>{errorMessage}</span>
      </div>
    {/if}

    {#if successMessage}
      <div class="message success">
        <span>✓</span>
        <span>{successMessage}</span>
      </div>
    {/if}

    <form on:submit|preventDefault={handleSubmit} class="auth-form">
      <div class="form-group">
        <label class="form-label">Email address</label>
        <div class="input-wrapper">
          <Mail size={18} class="input-icon" />
          <input 
            type="email" 
            bind:value={email}
            placeholder="you@university.edu.ng"
            class="form-input"
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Password</label>
        <div class="input-wrapper">
          <Lock size={18} class="input-icon" />
          <input 
            type={showPassword ? 'text' : 'password'}
            bind:value={password}
            placeholder="••••••••"
            class="form-input"
            disabled={isLoading}
            required
          />
          <button 
            type="button"
            class="password-toggle"
            on:click={() => showPassword = !showPassword}
          >
            {#if showPassword}
              <EyeOff size={18} />
            {:else}
              <Eye size={18} />
            {/if}
          </button>
        </div>
      </div>

      <div class="forgot-link">
        <a href="/reset-password">Forgot password?</a>
      </div>

      <button type="submit" class="submit-btn" disabled={isLoading}>
        {#if isLoading}
          <span class="loading-spinner"></span>
          <span>Signing in...</span>
        {:else}
          <LogIn size={18} />
          <span>Sign in</span>
          <ArrowRight size={18} />
        {/if}
      </button>
    </form>

    <div class="divider">
      <span class="divider-line"></span>
      <span class="divider-text">or</span>
      <span class="divider-line"></span>
    </div>

    <button class="google-btn" disabled={isLoading}>
      <svg viewBox="0 0 24 24" width="18" height="18">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      <span>Continue with Google</span>
    </button>

    <div class="toggle-mode">
      <span class="toggle-text">Don't have an account?</span>
      <a href="/signup" class="toggle-link">Sign up</a>
    </div>
  </div>
</div>

<style>
  .auth-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    background: var(--bg-primary);
  }

  .auth-card {
    max-width: 440px;
    width: 100%;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 40px 32px;
    transition: all 0.2s;
  }

  .auth-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 24px;
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

  .logo-text {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, var(--purple-primary) 0%, var(--purple-accent) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .auth-title {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .auth-subtitle {
    font-size: 14px;
    color: var(--text-secondary);
  }

  .message {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-radius: 12px;
    margin-bottom: 24px;
    font-size: 14px;
  }

  .message.error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
  }

  .message.success {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    color: #22c55e;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-icon {
    position: absolute;
    left: 14px;
    color: var(--text-muted);
    pointer-events: none;
  }

  .form-input {
    width: 100%;
    padding: 12px 12px 12px 42px;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 12px;
    font-size: 14px;
    color: var(--text-primary);
    transition: all 0.15s;
  }

  .form-input:focus {
    outline: none;
    border-color: var(--purple-primary);
  }

  .form-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .password-toggle {
    position: absolute;
    right: 14px;
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
  }

  .password-toggle:hover {
    color: var(--text-secondary);
  }

  .forgot-link {
    text-align: right;
  }

  .forgot-link a {
    font-size: 12px;
    color: var(--purple-primary);
    text-decoration: none;
  }

  .forgot-link a:hover {
    text-decoration: underline;
  }

  .submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 20px;
    background: var(--purple-primary);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    margin-top: 8px;
  }

  .submit-btn:hover:not(:disabled) {
    background: var(--purple-primary-dark, #6d28d9);
    transform: scale(0.98);
  }

  .submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .loading-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 24px 0;
  }

  .divider-line {
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .divider-text {
    font-size: 12px;
    color: var(--text-muted);
  }

  .google-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 12px 20px;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.15s;
  }

  .google-btn:hover:not(:disabled) {
    background: var(--bg-secondary);
    border-color: var(--purple-accent);
  }

  .toggle-mode {
    text-align: center;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
  }

  .toggle-text {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .toggle-link {
    background: none;
    border: none;
    color: var(--purple-primary);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    margin-left: 6px;
    text-decoration: none;
  }

  .toggle-link:hover {
    text-decoration: underline;
  }

  @media (max-width: 480px) {
    .auth-card {
      padding: 32px 24px;
    }

    .auth-title {
      font-size: 24px;
    }
  }
</style>