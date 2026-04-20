<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import {
    LayoutDashboard, BookOpen, Calendar, MapPin,
    FileQuestion, Library, BookMarked, ShieldCheck,
    CreditCard, Users, CalendarDays, Settings,
    LogOut, ChevronLeft, ChevronRight, Menu, X,
    Bell
  } from 'lucide-svelte';

  let { children } = $props();

  // ── Auth guard ─────────────────────────────────────────
  let authChecked = $state(!browser);

  $effect(() => {
    const unsub = authStore.subscribe(s => {
      if (s.loading) return;
      if (!s.user) {
        goto('/signin', { replaceState: true });
      } else {
        authChecked = true;
      }
    });
    return unsub;
  });

  // ── Sidebar state ──────────────────────────────────────
  let collapsed  = $state(false);
  let mobileOpen = $state(false);

  const currentPath = $derived($page.url.pathname);

  function isActive(href: string) {
    return currentPath === href || currentPath.startsWith(href + '/');
  }

  // ── Nav items ──────────────────────────────────────────
  const navGroups = [
    {
      label: 'Main',
      items: [
        { href: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard'       },
        { href: '/assignments',     icon: BookOpen,        label: 'Assignments'     },
        { href: '/timetable',       icon: Calendar,        label: 'Timetable'       },
        { href: '/live-map',        icon: MapPin,          label: 'Live Map'        },
      ]
    },
    {
      label: 'Academics',
      items: [
        { href: '/past-questions',  icon: FileQuestion,    label: 'Past Questions'  },
        { href: '/library',         icon: Library,         label: 'Library'         },
        { href: '/textbooks',       icon: BookMarked,      label: 'Textbooks'       },
      ]
    },
    {
      label: 'Campus',
      items: [
        { href: '/department-dues', icon: CreditCard,      label: 'Dept Dues'       },
        { href: '/payments',        icon: CreditCard,      label: 'Payments'        },
        { href: '/events',          icon: CalendarDays,    label: 'Events'          },
        { href: '/verify-receipt',  icon: ShieldCheck,     label: 'Verify Receipt'  },
      ]
    },
    {
      label: 'Account',
      items: [
        { href: '/settings',        icon: Settings,        label: 'Settings'        },
      ]
    }
  ];

  async function handleSignOut() {
    await authStore.signOut();
    goto('/signin');
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<!-- Mobile overlay -->
{#if mobileOpen}
  <div
    class="sb-overlay"
    role="button"
    tabindex="-1"
    aria-label="Close menu"
    on:click={() => (mobileOpen = false)}
    on:keydown={(e) => e.key === 'Enter' && (mobileOpen = false)}
  ></div>
{/if}

{#if authChecked}
  <div class="sb-shell" class:sb-shell--collapsed={collapsed}>

    <!-- ── Sidebar ── -->
    <aside class="sb-sidebar" class:sb-sidebar--open={mobileOpen}>
      <div class="sb-sidebar-inner">

        <!-- Logo -->
        <div class="sb-logo">
          <a href="/dashboard" class="sb-logo-link">
            <div class="sb-logo-mark">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M10 2L17 6V11C17 15.5 13.5 18.5 10 19C6.5 18.5 3 15.5 3 11V6L10 2Z"
                  stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                <path d="M7 10.5L9.5 13L13.5 8"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            {#if !collapsed}
              <span class="sb-logo-text">Sabify</span>
            {/if}
          </a>
          <button
            class="sb-collapse-btn"
            on:click={() => (collapsed = !collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {#if collapsed}<ChevronRight size={16} />{:else}<ChevronLeft size={16} />{/if}
          </button>
        </div>

        <!-- Nav -->
        <nav class="sb-nav">
          {#each navGroups as group}
            <div class="sb-nav-group">
              {#if !collapsed}
                <span class="sb-nav-group-label">{group.label}</span>
              {/if}
              {#each group.items as item}
                <a
                  href={item.href}
                  class="sb-nav-item"
                  class:sb-nav-item--active={isActive(item.href)}
                  on:click={() => (mobileOpen = false)}
                  title={collapsed ? item.label : undefined}
                >
                  <span class="sb-nav-icon"><svelte:component this={item.icon} size={18} /></span>
                  {#if !collapsed}
                    <span class="sb-nav-label">{item.label}</span>
                  {/if}
                </a>
              {/each}
            </div>
          {/each}
        </nav>

        <!-- Bottom: user + signout -->
        <div class="sb-sidebar-footer">
          {#if $authStore.user}
            <div class="sb-user" title={collapsed ? $authStore.user.email : undefined}>
              <div class="sb-user-avatar">
                {($authStore.user.name ?? $authStore.user.email ?? '?')[0].toUpperCase()}
              </div>
              {#if !collapsed}
                <div class="sb-user-info">
                  <span class="sb-user-name">{$authStore.user.name ?? 'Student'}</span>
                  <span class="sb-user-email">{$authStore.user.email}</span>
                </div>
              {/if}
            </div>
          {/if}
          <button
            class="sb-signout-btn"
            on:click={handleSignOut}
            title={collapsed ? 'Sign out' : undefined}
          >
            <LogOut size={16} />
            {#if !collapsed}<span>Sign out</span>{/if}
          </button>
        </div>
      </div>
    </aside>

    <!-- ── Main content ── -->
    <div class="sb-main">

      <!-- Top bar (mobile) -->
      <header class="sb-topbar">
        <button class="sb-menu-btn" on:click={() => (mobileOpen = !mobileOpen)} aria-label="Toggle menu">
          {#if mobileOpen}<X size={20} />{:else}<Menu size={20} />{/if}
        </button>
        <a href="/dashboard" class="sb-topbar-logo">
          <div class="sb-logo-mark sm">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M10 2L17 6V11C17 15.5 13.5 18.5 10 19C6.5 18.5 3 15.5 3 11V6L10 2Z"
                stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              <path d="M7 10.5L9.5 13L13.5 8"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="sb-logo-text">Sabify</span>
        </a>
        <div class="sb-topbar-actions">
          <button class="sb-icon-btn" aria-label="Notifications">
            <Bell size={18} />
          </button>
        </div>
      </header>

      <!-- Page content -->
      <div class="sb-content">
        {@render children()}
      </div>
    </div>

  </div>
{/if}

<style>
  * { box-sizing: border-box; }

  /* ── Shell ── */
  .sb-shell {
    display: flex;
    min-height: 100vh;
    background: var(--bg-primary);
    font-family: 'DM Sans', system-ui, sans-serif;
  }

  /* ── Overlay (mobile) ── */
  .sb-overlay {
    position: fixed; inset: 0; z-index: 40;
    background: rgba(0,0,0,0.45);
    cursor: pointer;
  }

  /* ── Sidebar ── */
  .sb-sidebar {
    width: 240px;
    flex-shrink: 0;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
    transition: width 0.2s ease;
    z-index: 50;
  }

  .sb-shell--collapsed .sb-sidebar { width: 64px; }

  .sb-sidebar-inner {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }
  .sb-sidebar-inner::-webkit-scrollbar { display: none; }

  /* Logo row */
  .sb-logo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0.875rem;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .sb-logo-link {
    display: flex; align-items: center; gap: 10px;
    text-decoration: none; overflow: hidden;
  }
  .sb-logo-mark {
    width: 34px; height: 34px; flex-shrink: 0;
    background: var(--purple-primary);
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    color: white;
  }
  .sb-logo-mark svg { width: 18px; height: 18px; }
  .sb-logo-mark.sm { width: 30px; height: 30px; border-radius: 8px; }
  .sb-logo-mark.sm svg { width: 16px; height: 16px; }
  .sb-logo-text {
    font-size: 17px; font-weight: 800; letter-spacing: -0.04em;
    color: var(--text-primary); white-space: nowrap;
  }

  .sb-collapse-btn {
    background: none; border: none; cursor: pointer;
    color: var(--text-muted); padding: 0.25rem;
    border-radius: 6px; display: flex; align-items: center;
    transition: all 0.15s; flex-shrink: 0;
  }
  .sb-collapse-btn:hover { background: var(--bg-tertiary); color: var(--text-primary); }

  /* Nav */
  .sb-nav { flex: 1; padding: 0.75rem 0.5rem; display: flex; flex-direction: column; gap: 0.25rem; }

  .sb-nav-group { margin-bottom: 0.5rem; }

  .sb-nav-group-label {
    font-size: 0.625rem; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text-muted);
    padding: 0.375rem 0.625rem 0.25rem;
    display: block; white-space: nowrap;
  }

  .sb-nav-item {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.625rem 0.75rem;
    border-radius: 0.625rem;
    text-decoration: none;
    font-size: 0.875rem; font-weight: 500;
    color: var(--text-secondary);
    transition: all 0.15s;
    white-space: nowrap; overflow: hidden;
  }
  .sb-nav-item:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }
  .sb-nav-item--active {
    background: var(--purple-light);
    color: var(--purple-on-light);
    font-weight: 600;
  }
  .sb-nav-icon { flex-shrink: 0; display: flex; align-items: center; }
  .sb-nav-label { overflow: hidden; text-overflow: ellipsis; }

  /* Sidebar footer */
  .sb-sidebar-footer {
    border-top: 1px solid var(--border);
    padding: 0.75rem 0.5rem;
    display: flex; flex-direction: column; gap: 0.5rem;
    flex-shrink: 0;
  }

  .sb-user {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.5rem 0.625rem;
    border-radius: 0.625rem;
    overflow: hidden;
  }
  .sb-user-avatar {
    width: 32px; height: 32px; flex-shrink: 0;
    border-radius: 50%;
    background: var(--purple-primary);
    color: white;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.875rem; font-weight: 700;
  }
  .sb-user-info { overflow: hidden; }
  .sb-user-name { font-size: 0.813rem; font-weight: 600; color: var(--text-primary); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .sb-user-email { font-size: 0.688rem; color: var(--text-muted); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .sb-signout-btn {
    display: flex; align-items: center; gap: 0.625rem;
    width: 100%; padding: 0.625rem 0.75rem;
    background: none; border: none; cursor: pointer;
    border-radius: 0.625rem;
    font-size: 0.875rem; font-weight: 500;
    color: var(--text-muted);
    transition: all 0.15s;
    font-family: inherit;
    white-space: nowrap; overflow: hidden;
  }
  .sb-signout-btn:hover { background: color-mix(in srgb, var(--error) 10%, transparent); color: var(--error); }

  /* ── Main ── */
  .sb-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

  /* Top bar (mobile) */
  .sb-topbar {
    display: none;
    align-items: center;
    gap: 0.75rem;
    padding: 0 1rem;
    height: 56px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 30;
    flex-shrink: 0;
  }
  .sb-menu-btn {
    background: none; border: none; cursor: pointer;
    color: var(--text-secondary); padding: 0.25rem;
    display: flex; align-items: center; border-radius: 6px;
    transition: all 0.15s;
  }
  .sb-menu-btn:hover { background: var(--bg-tertiary); color: var(--text-primary); }

  .sb-topbar-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; flex: 1; }
  .sb-topbar-actions { display: flex; align-items: center; gap: 0.5rem; }

  .sb-icon-btn {
    background: none; border: none; cursor: pointer;
    color: var(--text-secondary); padding: 0.375rem;
    border-radius: 8px; display: flex; align-items: center;
    transition: all 0.15s;
  }
  .sb-icon-btn:hover { background: var(--bg-tertiary); color: var(--text-primary); }

  /* Page content */
  .sb-content { flex: 1; padding: 2rem; overflow-y: auto; }

  /* ── Responsive ── */
  @media (max-width: 1023px) {
    .sb-sidebar {
      position: fixed; top: 0; left: 0; bottom: 0;
      transform: translateX(-100%);
      transition: transform 0.25s ease;
      height: 100vh;
      width: 240px !important; /* override collapsed on mobile */
    }
    .sb-sidebar--open { transform: translateX(0); }
    .sb-collapse-btn { display: none; }
    .sb-topbar { display: flex; }
    .sb-content { padding: 1.25rem 1rem; }
  }
</style>