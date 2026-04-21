<!-- src/routes/(app)/settings/+page.svelte -->
<script lang="ts">
  import { authClient } from '$lib/auth-client';
  import { authStore } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { Sun, Moon, User, Lock, Bell, LogOut, Trash2, Save, ShieldCheck } from 'lucide-svelte';

  let user = $derived($authStore.user);

  // Profile
  let name  = $state(user?.name ?? '');
  let email = $state(user?.email ?? '');
  let savingProfile = $state(false);
  let profileMsg    = $state('');

  // Password
  let currentPw  = $state(''); let newPw = $state(''); let confirmPw = $state('');
  let savingPw   = $state(false); let pwMsg = $state('');

  // Notifications (stub)
  let notifAlerts    = $state(true);
  let notifDues      = $state(true);
  let notifUploads   = $state(false);

  // Theme
  function getTheme() { return typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'; }
  let theme = $state(getTheme());
  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);
  }

  async function saveProfile() {
    savingProfile = true; profileMsg = '';
    await new Promise(r => setTimeout(r, 700)); // TODO: PATCH /api/auth/update-user
    profileMsg = '✓ Profile updated.'; savingProfile = false;
  }

  async function savePassword() {
    pwMsg = '';
    if (newPw !== confirmPw) { pwMsg = "New passwords don't match."; return; }
    if (newPw.length < 6)    { pwMsg = 'Password must be at least 6 characters.'; return; }
    savingPw = true;
    const { error } = await authClient.changePassword({ currentPassword: currentPw, newPassword: newPw, revokeOtherSessions: true });
    savingPw = false;
    if (error) { pwMsg = error.message ?? 'Failed to update password.'; }
    else { pwMsg = '✓ Password updated.'; currentPw = ''; newPw = ''; confirmPw = ''; }
  }

  async function signOut() {
    await authClient.signOut();
    goto('/signin');
  }
</script>

<svelte:head><title>Settings — Sabify</title></svelte:head>

<div class="settings-page">
  <h1 class="page-title">Settings</h1>

  <!-- Profile -->
  <div class="settings-card">
    <div class="card-header"><User size={18} class="card-header-icon" /><h2 class="card-title">Profile</h2></div>
    <div class="form-fields">
      <div class="form-field">
        <label class="form-label">Full name</label>
        <input type="text" bind:value={name} class="form-input" placeholder="Your name" />
      </div>
      <div class="form-field">
        <label class="form-label">Email address</label>
        <input type="email" bind:value={email} class="form-input" placeholder="your@email.com" />
      </div>
    </div>
    {#if profileMsg}<div class="form-msg" class:form-msg--err={!profileMsg.startsWith('✓')}>{profileMsg}</div>{/if}
    <button class="save-btn" onclick={saveProfile} disabled={savingProfile}>
      {#if savingProfile}Saving…{:else}<Save size={14} /> Save profile{/if}
    </button>
  </div>

  <!-- Password -->
  <div class="settings-card" id="password">
    <div class="card-header"><Lock size={18} class="card-header-icon" /><h2 class="card-title">Change password</h2></div>
    <div class="form-fields">
      <div class="form-field">
        <label class="form-label">Current password</label>
        <input type="password" bind:value={currentPw} class="form-input" placeholder="••••••••" />
      </div>
      <div class="form-field">
        <label class="form-label">New password</label>
        <input type="password" bind:value={newPw} class="form-input" placeholder="Min. 6 characters" />
      </div>
      <div class="form-field">
        <label class="form-label">Confirm new password</label>
        <input type="password" bind:value={confirmPw} class="form-input" placeholder="Repeat new password" />
      </div>
    </div>
    {#if pwMsg}<div class="form-msg" class:form-msg--err={!pwMsg.startsWith('✓')}>{pwMsg}</div>{/if}
    <button class="save-btn" onclick={savePassword} disabled={savingPw}>
      {#if savingPw}Updating…{:else}<ShieldCheck size={14} /> Update password{/if}
    </button>
  </div>

  <!-- Notifications -->
  <div class="settings-card">
    <div class="card-header"><Bell size={18} class="card-header-icon" /><h2 class="card-title">Notifications</h2></div>
    <div class="toggle-list">
      <div class="toggle-row">
        <div class="toggle-info"><span class="toggle-label">Campus safety alerts</span><span class="toggle-sub">Receive Shield broadcasts immediately</span></div>
        <label class="toggle-switch"><input type="checkbox" bind:checked={notifAlerts} /><span class="toggle-thumb"></span></label>
      </div>
      <div class="toggle-row">
        <div class="toggle-info"><span class="toggle-label">Dues reminders</span><span class="toggle-sub">Get reminded before payment deadlines</span></div>
        <label class="toggle-switch"><input type="checkbox" bind:checked={notifDues} /><span class="toggle-thumb"></span></label>
      </div>
      <div class="toggle-row">
        <div class="toggle-info"><span class="toggle-label">New uploads in your department</span><span class="toggle-sub">Be notified when someone uploads to your department vault</span></div>
        <label class="toggle-switch"><input type="checkbox" bind:checked={notifUploads} /><span class="toggle-thumb"></span></label>
      </div>
    </div>
  </div>

  <!-- Appearance -->
  <div class="settings-card">
    <div class="card-header">
      {#if theme === 'dark'}<Moon size={18} class="card-header-icon" />{:else}<Sun size={18} class="card-header-icon" />{/if}
      <h2 class="card-title">Appearance</h2>
    </div>
    <div class="theme-row">
      <div>
        <span class="toggle-label">Theme</span>
        <span class="toggle-sub">Currently: {theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
      </div>
      <button class="theme-btn" onclick={toggleTheme}>
        {#if theme === 'dark'}<Sun size={16} /> Switch to light{:else}<Moon size={16} /> Switch to dark{/if}
      </button>
    </div>
  </div>

  <!-- Danger zone -->
  <div class="settings-card settings-card--danger">
    <div class="card-header"><LogOut size={18} class="card-header-icon card-header-icon--danger" /><h2 class="card-title">Account</h2></div>
    <div class="danger-row">
      <div>
        <span class="toggle-label">Sign out</span>
        <span class="toggle-sub">Sign out of this device</span>
      </div>
      <button class="danger-btn" onclick={signOut}><LogOut size={14} /> Sign out</button>
    </div>
    <div class="danger-row">
      <div>
        <span class="toggle-label danger-label">Delete account</span>
        <span class="toggle-sub">Permanently delete your account and all data. This cannot be undone.</span>
      </div>
      <button class="danger-btn danger-btn--delete"><Trash2 size={14} /> Delete account</button>
    </div>
  </div>

</div>

<style>
  .settings-page { display: flex; flex-direction: column; gap: 1.25rem; max-width: 640px; }
  .page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; }

  .settings-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 1.25rem; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.125rem; }
  .settings-card--danger { border-color: color-mix(in srgb, var(--error) 25%, transparent); }

  .card-header { display: flex; align-items: center; gap: 9px; }
  :global(.card-header-icon) { color: var(--purple-primary); flex-shrink: 0; }
  :global(.card-header-icon--danger) { color: var(--error); }
  .card-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); }

  .form-fields { display: flex; flex-direction: column; gap: 0.875rem; }
  .form-field { display: flex; flex-direction: column; gap: 0.375rem; }
  .form-label { font-size: 0.813rem; font-weight: 600; color: var(--text-secondary); }
  .form-input { padding: 0.7rem 0.875rem; border: 1.5px solid var(--border); border-radius: 0.625rem; font-size: 0.875rem; background: var(--bg-primary); color: var(--text-primary); outline: none; font-family: inherit; }
  .form-input:focus { border-color: var(--purple-primary); }

  .form-msg { font-size: 0.813rem; padding: 0.625rem 0.875rem; border-radius: 0.625rem; }
  .form-msg:not(.form-msg--err) { background: color-mix(in srgb, var(--success) 10%, transparent); border: 1px solid color-mix(in srgb, var(--success) 25%, transparent); color: var(--success); }
  .form-msg--err { background: color-mix(in srgb, var(--error) 10%, transparent); border: 1px solid color-mix(in srgb, var(--error) 25%, transparent); color: var(--error); }

  .save-btn { display: inline-flex; align-items: center; gap: 6px; padding: 0.625rem 1.25rem; background: var(--purple-primary); color: white; border: none; border-radius: 0.625rem; font-size: 0.875rem; font-weight: 700; cursor: pointer; font-family: inherit; align-self: flex-start; }
  .save-btn:hover:not(:disabled) { background: var(--purple-primary-dark); }
  .save-btn:disabled { opacity: 0.65; cursor: not-allowed; }

  /* Toggle rows */
  .toggle-list { display: flex; flex-direction: column; gap: 0; }
  .toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.875rem 0; border-bottom: 1px solid var(--border); }
  .toggle-row:last-child { border-bottom: none; }
  .toggle-info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
  .toggle-label { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
  .toggle-sub { font-size: 0.75rem; color: var(--text-muted); line-height: 1.4; }

  /* Custom toggle switch */
  .toggle-switch { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
  .toggle-switch input { opacity: 0; width: 0; height: 0; }
  .toggle-thumb { position: absolute; inset: 0; background: var(--border); border-radius: 12px; cursor: pointer; transition: background 0.2s; }
  .toggle-thumb::before { content: ''; position: absolute; width: 18px; height: 18px; left: 3px; top: 3px; background: white; border-radius: 50%; transition: transform 0.2s; }
  .toggle-switch input:checked + .toggle-thumb { background: var(--purple-primary); }
  .toggle-switch input:checked + .toggle-thumb::before { transform: translateX(20px); }

  /* Theme row */
  .theme-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
  .theme-btn { display: inline-flex; align-items: center; gap: 6px; padding: 0.625rem 1rem; border: 1.5px solid var(--border); border-radius: 0.625rem; font-size: 0.813rem; font-weight: 600; color: var(--text-secondary); background: var(--bg-primary); cursor: pointer; font-family: inherit; transition: all 0.15s; }
  .theme-btn:hover { border-color: var(--purple-primary); color: var(--purple-on-light); }

  /* Danger zone */
  .danger-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.875rem 0; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
  .danger-row:last-child { border-bottom: none; }
  .danger-label { color: var(--error) !important; }
  .danger-btn { display: inline-flex; align-items: center; gap: 6px; padding: 0.625rem 1rem; border: 1.5px solid var(--border); border-radius: 0.625rem; font-size: 0.813rem; font-weight: 600; color: var(--text-secondary); background: var(--bg-primary); cursor: pointer; font-family: inherit; white-space: nowrap; transition: all 0.15s; }
  .danger-btn:hover { border-color: var(--error); color: var(--error); }
  .danger-btn--delete { border-color: color-mix(in srgb, var(--error) 40%, transparent); color: var(--error); }
  .danger-btn--delete:hover { background: color-mix(in srgb, var(--error) 8%, transparent); }
</style>