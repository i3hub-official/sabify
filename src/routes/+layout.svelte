<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { Sun, Moon } from 'lucide-svelte';
	
	let { children } = $props();
	
	// Use $state for reactive state in Svelte 5
	let theme: 'light' | 'dark' = $state('light');
	
	// Apply theme immediately before mount
	function getInitialTheme(): 'light' | 'dark' {
		// Check if we're in the browser
		if (typeof window !== 'undefined') {
			const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
			if (savedTheme) return savedTheme;
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			return prefersDark ? 'dark' : 'light';
		}
		return 'light';
	}
	
	// Apply theme synchronously before render
	const initialTheme = getInitialTheme();
	theme = initialTheme;
	
	// Apply to document immediately (runs before first paint)
	if (typeof document !== 'undefined') {
		document.documentElement.classList.remove('light', 'dark');
		document.documentElement.classList.add(initialTheme);
	}
	
	onMount(() => {
		// Update meta theme-color after mount
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
		
		// Update meta theme-color
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
	<link rel="manifest" href="/manifest.webmanifest" />
	<link rel="apple-touch-icon" href="/icons/icon-192.png" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	<meta name="theme-color" content="#7C3AED" />
</svelte:head>

<!-- NAVIGATION (from landing page) -->
<nav class="nav">
	<div class="nav-inner">
		<a href="/" class="nav-brand">
			<div class="logo-mark" aria-hidden="true">
				<svg viewBox="0 0 20 20" fill="none">
					<path d="M10 2L17 6V11C17 15.5 13.5 18.5 10 19C6.5 18.5 3 15.5 3 11V6L10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
					<path d="M7 10.5L9.5 13L13.5 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</div>
			<span class="brand-name">Sabify</span>
		</a>

		<div class="nav-links">
			<a href="#vault">Vault</a>
			<a href="#pay">Pay</a>
			<a href="#shield">Shield</a>
			<a href="#universities">Universities</a>
		</div>

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

{@render children()}

<style>
	.nav {
		position: sticky;
		top: 0;
		z-index: 100;
		background: var(--bg-primary);
		border-bottom: 1px solid var(--border);
		backdrop-filter: blur(8px);
	}
	
	.nav-inner {
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 28px;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: space-between;
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
		font-size: 18px;
		letter-spacing: -0.04em;
		color: var(--text-primary);
	}
	
	.nav-links {
		display: flex;
		gap: 24px;
	}
	
	.nav-links a {
		font-size: 14px;
		font-weight: 500;
		color: var(--text-secondary);
		text-decoration: none;
		transition: color 0.15s;
	}
	
	.nav-links a:hover {
		color: var(--text-primary);
	}
	
	.nav-actions {
		display: flex;
		gap: 8px;
		align-items: center;
	}
	
	.theme-toggle {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 999px;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		color: var(--text-secondary);
	}
	
	.theme-toggle:hover {
		background: var(--purple-light);
		border-color: var(--purple-primary);
		color: var(--purple-primary);
	}
	
	.btn-ghost-nav {
		font-size: 14px;
		font-weight: 500;
		color: var(--text-secondary);
		text-decoration: none;
		padding: 8px 16px;
		border: 1px solid var(--border);
		border-radius: 10px;
		transition: border-color 0.15s, background 0.15s;
	}
	
	.btn-ghost-nav:hover {
		background: var(--bg-secondary);
		border-color: var(--purple-accent);
	}
	
	.btn-primary-nav {
		font-size: 14px;
		font-weight: 700;
		color: white;
		text-decoration: none;
		padding: 8px 16px;
		background: var(--purple-primary);
		border-radius: 10px;
		transition: background 0.15s;
	}
	
	.btn-primary-nav:hover {
		background: var(--purple-primary-dark, #6d28d9);
	}
	
	@media (max-width: 768px) {
		.nav-links {
			display: none;
		}
	}
</style>