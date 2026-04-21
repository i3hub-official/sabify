<!-- src/routes/(app)/+layout.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { authClient } from '$lib/auth-client';
  import { authStore } from '$lib/stores/auth';
  import {
    LayoutDashboard, BookOpen, FileQuestion, Library,
    BookMarked, ClipboardList, Calendar, MapPin,
    CreditCard, Receipt, ShieldCheck, Settings,
    LogOut, Bell, ChevronRight, Menu, X
  } from 'lucide-svelte';

  let { children } = $props();

  let sidebarOpen = $state(false);

  const navItems = [
    { href: '/dashboard',         label: 'Dashboard',       icon: LayoutDashboard },
    { href: '/past-questions',    label: 'Past Questions',  icon: FileQuestion },
    { href: '/library',           label: 'Library',         icon: Library },
    { href: '/textbooks',         label: 'Textbooks',       icon: BookMarked },
    { href: '/assignments',       label: 'Assignments',     icon: ClipboardList },
    { href: '/timetable',         label: 'Timetable',       icon: Calendar },
    { href: '/events',            label: 'Events',          icon: Bell },
    { href: '/department-dues',   label: 'Dues',            icon: CreditCard },
    { href: '/payments',          label: 'Payments',        icon: Receipt },
    { href: '/verify-receipt',    label: 'Verify Receipt',  icon: ShieldCheck },
    { href: '/live-map',          label: 'Live Map',        icon: MapPin },
    { href: '/settings',          label: 'Settings',        icon: Settings },
  ];

  function isActive(href: string) {
    return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
  }

  async function signOut() {
    await authClient.signOut();
    goto('/signin');
  }
</script>

<div class="app-shell">
  <!-- Sidebar -->
  <aside class="sidebar" class:sidebar--open={sidebarOpen}>
    <div class="sidebar-inner">
      <div class="sidebar-header">
        <a href="/dashboard" class="sidebar-brand" onclick={() => sidebarOpen = false}>
          <div class="sidebar-logo">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M10 2L17 6V11C17 15.5 13.5 18.5 10 19C6.5 18.5 3 15.5 3 11V6L10 2Z"
                stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              <path d="M7 10.5L9.5 13L13.5 8"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="sidebar-brand-name">Sabify</span>
        </a>
        <button class="sidebar-close" onclick={() => sidebarOpen = false}>
          <X size={18} />
        </button>
      </div>

      <nav class="sidebar-nav">
        {#each navItems as item}
          <a
            href={item.href}
            class="nav-item"
            class:nav-item--active={isActive(item.href)}
            onclick={() => sidebarOpen = false}
          >
            <span class="nav-icon"><item.icon size={17} /></span>
            <span class="nav-label">{item.label}</span>
            {#if isActive(item.href)}
              <span class="nav-indicator"><ChevronRight size={13} /></span>
            {/if}
          </a>
        {/each}
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="user-avatar">
            {($authStore.user?.name ?? 'U').charAt(0).toUpperCase()}
          </div>
          <div class="user-info">
            <span class="user-name">{$authStore.user?.name ?? 'Student'}</span>
            <span class="user-email">{$authStore.user?.email ?? ''}</span>
          </div>
        </div>
        <button class="signout-btn" onclick={signOut}>
          <LogOut size={16} />
        </button>
      </div>
    </div>
  </aside>

  <!-- Overlay (mobile) -->
  {#if sidebarOpen}
    <div class="overlay" onclick={() => sidebarOpen = false} role="presentation"></div>
  {/if}

  <!-- Main content -->
  <div class="app-main">
    <!-- Top bar -->
    <header class="app-topbar">
      <button class="menu-btn" onclick={() => sidebarOpen = !sidebarOpen} aria-label="Open menu">
        <Menu size={20} />
      </button>
      <div class="topbar-title">
        {navItems.find(n => isActive(n.href))?.label ?? 'Sabify'}
      </div>
      <div class="topbar-actions">
        <a href="/settings" class="topbar-avatar">
          {($authStore.user?.name ?? 'U').charAt(0).toUpperCase()}
        </a>
      </div>
    </header>

    <main class="app-content">
      {@render children()}
    </main>
  </div>
</div>

<style>
  :global(*, *::before, *::after) { box-sizing: border-box; margin: 0; padding: 0; }
  :global(body) { font-family: 'DM Sans', system-ui, sans-serif; background: var(--bg-primary); color: var(--text-primary); }

  .app-shell { display: flex; min-height: 100vh; background: var(--bg-primary); }

  /* ── Sidebar ── */
  .sidebar {
    width: 240px; flex-shrink: 0;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 50;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
  }
  @media (min-width: 1024px) {
    .sidebar { transform: translateX(0); position: sticky; height: 100vh; top: 0; }
  }
  .sidebar--open { transform: translateX(0); }

  .sidebar-inner { display: flex; flex-direction: column; height: 100%; overflow: hidden; }

  .sidebar-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.25rem 1rem; border-bottom: 1px solid var(--border);
  }
  .sidebar-brand { display: flex; align-items: center; gap: 9px; text-decoration: none; }
  .sidebar-logo {
    width: 32px; height: 32px; background: var(--purple-primary);
    border-radius: 9px; display: flex; align-items: center; justify-content: center;
    color: white; flex-shrink: 0;
  }
  .sidebar-logo svg { width: 17px; height: 17px; }
  .sidebar-brand-name { font-weight: 800; font-size: 17px; letter-spacing: -0.04em; color: var(--text-primary); }
  .sidebar-close { background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; padding: 4px; }
  @media (min-width: 1024px) { .sidebar-close { display: none; } }

  .sidebar-nav { flex: 1; overflow-y: auto; padding: 0.75rem 0.625rem; display: flex; flex-direction: column; gap: 2px; }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 0.625rem 0.75rem; border-radius: 0.625rem;
    text-decoration: none; font-size: 0.875rem; font-weight: 500;
    color: var(--text-secondary); transition: all 0.15s;
  }
  .nav-item:hover { background: var(--bg-tertiary); color: var(--text-primary); }
  .nav-item--active { background: var(--purple-light); color: var(--purple-on-light); font-weight: 600; }
  .nav-icon { display: flex; flex-shrink: 0; }
  .nav-label { flex: 1; }
  .nav-indicator { display: flex; color: var(--purple-primary); }

  .sidebar-footer {
    padding: 0.875rem; border-top: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
  }
  .sidebar-user { display: flex; align-items: center; gap: 9px; flex: 1; min-width: 0; }
  .user-avatar {
    width: 34px; height: 34px; border-radius: 50%;
    background: var(--purple-primary); color: white;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.875rem; font-weight: 700; flex-shrink: 0;
  }
  .user-info { flex: 1; min-width: 0; }
  .user-name { display: block; font-size: 0.813rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .user-email { display: block; font-size: 0.688rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .signout-btn { background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; padding: 6px; border-radius: 8px; transition: all 0.15s; }
  .signout-btn:hover { background: var(--bg-tertiary); color: var(--error); }

  /* ── Main ── */
  .app-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
  @media (min-width: 1024px) { .app-main { margin-left: 0; } }

  .app-topbar {
    height: 56px; border-bottom: 1px solid var(--border);
    background: var(--bg-primary); display: flex; align-items: center;
    padding: 0 1.25rem; gap: 12px; position: sticky; top: 0; z-index: 40;
  }
  .menu-btn { background: none; border: none; cursor: pointer; color: var(--text-secondary); display: flex; padding: 6px; border-radius: 8px; }
  .menu-btn:hover { background: var(--bg-secondary); color: var(--text-primary); }
  @media (min-width: 1024px) { .menu-btn { display: none; } }
  .topbar-title { flex: 1; font-weight: 700; font-size: 1rem; color: var(--text-primary); }
  .topbar-actions { display: flex; align-items: center; gap: 8px; }
  .topbar-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--purple-primary); color: white;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.813rem; font-weight: 700; text-decoration: none;
  }

  .app-content { flex: 1; padding: 1.5rem; max-width: 1200px; width: 100%; margin: 0 auto; }
  @media (max-width: 640px) { .app-content { padding: 1rem; } }

  /* Overlay */
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 49; }
</style>