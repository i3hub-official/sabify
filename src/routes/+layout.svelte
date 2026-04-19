<script lang="ts">
	import './layout.css';
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';
	import { Sun, Moon } from 'lucide-svelte';

	import ShutdownPage from '$lib/components/ShutdownPage.svelte';
	import MaintenancePage from '$lib/components/MaintenancePage.svelte';
	import CookieNotice from '$lib/components/CookieNotice.svelte';

	const SHUTDOWN_MODE = env.PUBLIC_SHUTDOWN_MODE === 'true';
	const MAINTENANCE_MODE = env.PUBLIC_MAINTENANCE_MODE === 'true';

	let { children } = $props();



	// Theme
	let theme: 'light' | 'dark' = $state('light');

	function getInitialTheme(): 'light' | 'dark' {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
			if (saved) return saved;
			return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		}
		return 'light';
	}

	const initialTheme = getInitialTheme();
	theme = initialTheme;

	if (typeof document !== 'undefined') {
		document.documentElement.classList.remove('light', 'dark');
		document.documentElement.classList.add(initialTheme);
	}

	onMount(() => {
		const metaThemeColor = document.querySelector('meta[name="theme-color"]');
		if (metaThemeColor) {
			metaThemeColor.setAttribute('content', theme === 'dark' ? '#1E1B2E' : '#7C3AED');
		}
	});

	function applyTheme(newTheme: 'light' | 'dark') {
		theme = newTheme;
		document.documentElement.classList.remove('light', 'dark');
		document.documentElement.classList.add(newTheme);
		localStorage.setItem('theme', newTheme);

		const metaThemeColor = document.querySelector('meta[name="theme-color"]');
		if (metaThemeColor) {
			metaThemeColor.setAttribute('content', newTheme === 'dark' ? '#1E1B2E' : '#7C3AED');
		}
	}

	function toggleTheme() {
		applyTheme(theme === 'light' ? 'dark' : 'light');
	}
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
	<meta name="theme-color" content="#7C3AED" />

		<link rel="apple-touch-icon" href="/icons/icon-192.png" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	<meta name="apple-mobile-web-app-title" content="Sabify" />

	<title>Sabify | Built for every university</title>
	<meta
		name="description"
		content="Faculty, College, Department, Level — whatever your university calls it, Sabify adapts."
	/>
	<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
</svelte:head>


<!-- Full Edge-to-Edge Navigation -->
<nav class="nav">
	<div class="nav-inner">
		<a href="/" class="nav-brand">
			<div class="logo-mark" aria-hidden="true">
				<svg viewBox="0 0 20 20" fill="none">
					<path
						d="M10 2L17 6V11C17 15.5 13.5 18.5 10 19C6.5 18.5 3 15.5 3 11V6L10 2Z"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linejoin="round"
					/>
					<path
						d="M7 10.5L9.5 13L13.5 8"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</div>
			<span class="brand-name">Sabify</span>
		</a>

		<div class="nav-actions">
			<a href="/signin" class="btn-ghost-nav">Sign in</a>
			<a href="/signup" class="btn-primary-nav">Get started</a>
			<button class="theme-toggle" on:click={toggleTheme} aria-label="Toggle theme">
				{#if theme === 'light'}
					<Sun size={18} />
				{:else}
					<Moon size={18} />
				{/if}
			</button>
		</div>
	</div>
</nav>

<!-- Page content -->
{#if SHUTDOWN_MODE}
	<ShutdownPage />
{:else if MAINTENANCE_MODE}
	<MaintenancePage />
{:else}
	{@render children()}
{/if}

<CookieNotice />

<style>
	/* PWA toast */
	.pwa-toast {
		position: fixed;
		bottom: 24px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 9999;
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 12px 20px;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 14px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
		font-size: 14px;
		color: var(--text-primary);
	}

	/* ── True Full-Width Edge-to-Edge Nav ── */
.nav {
    /* Critical Fix: Span exactly from edge to edge */
    width: 100%;
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    
    z-index: 100;
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(12px);
    
    /* Optional: subtle transparency to see content behind it */
    background: color-mix(in srgb, var(--bg-primary), transparent 10%);
}

.nav-inner {
    /* Use 100% width so it stretches on all screens */
    width: 100%;
    
    /* If you want the content to stay centered on huge monitors: 
       max-width: 1440px; 
       margin: 0 auto; 
    */
    
    padding: 0 32px;
    height: 68px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

/* Fix for content being hidden behind the fixed nav */
body {
    padding-top: 68px;
}

/* Adjust padding for mobile to keep the edges clean */
@media (max-width: 640px) {
    .nav-inner {
        padding: 0 16px;
    }
}

		.nav-brand {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
	}

	.logo-mark {
		width: 34px;
		height: 34px;
		background: var(--purple-primary);
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: white;
	}

	.logo-mark svg {
		width: 19px;
		height: 19px;
	}

	.brand-name {
		font-weight: 800;
		font-size: 19px;
		letter-spacing: -0.04em;
		color: var(--text-primary);
	}

	.nav-actions {
		display: flex;
		gap: 12px;
		align-items: center;
	}

	.theme-toggle {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 999px;
		width: 38px;
		height: 38px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
		color: var(--text-secondary);
	}

	.theme-toggle:hover {
		background: var(--purple-light);
		border-color: var(--purple-primary);
		color: var(--purple-primary);
		transform: scale(1.05);
	}

	.btn-ghost-nav {
		font-size: 14.5px;
		font-weight: 500;
		color: var(--text-secondary);
		text-decoration: none;
		padding: 8px 18px;
		border: 1px solid var(--border);
		border-radius: 10px;
		transition: all 0.15s;
	}

	.btn-ghost-nav:hover {
		background: var(--bg-secondary);
		border-color: var(--purple-accent);
	}

	.btn-primary-nav {
		font-size: 14.5px;
		font-weight: 700;
		color: white;
		text-decoration: none;
		padding: 8px 18px;
		background: var(--purple-primary);
		border-radius: 10px;
		transition: background 0.15s;
	}

	.btn-primary-nav:hover {
		background: var(--purple-primary-dark);
	}
</style>
