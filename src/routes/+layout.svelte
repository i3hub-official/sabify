<!-- src/layout.svelte -->

<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	
	let { children } = $props();
	
	let theme: 'light' | 'dark' = 'light';
	
	onMount(() => {
		// Load saved theme
		const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		
		theme = savedTheme || (prefersDark ? 'dark' : 'light');
		applyTheme(theme);
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
</svelte:head>

<nav class="nav">
	<div class="nav-container">
		<div class="logo">
			<span class="logo-icon">⚔️</span>
			<span class="logo-text">Sabify</span>
			<span class="logo-badge">β</span>
		</div>
		<div class="nav-links">
			<a href="#vault">Vault</a>
			<a href="#pay">Pay</a>
			<a href="#shield">Shield</a>
			<a href="#contributors">Contributors</a>
		</div>
		<div class="nav-actions">
			<button class="theme-toggle" on:click={toggleTheme} aria-label="Toggle theme">
				{#if theme === 'light'}
					<span class="theme-icon">🌙</span>
				{:else}
					<span class="theme-icon">☀️</span>
				{/if}
			</button>
			<button class="btn-outline">Sign In (MOUAU)</button>
		</div>
	</div>
</nav>

{@render children()}

<footer class="footer">
	<div class="footer-container">
		<div class="footer-brand">
			<span class="logo-icon">⚔️</span>
			<span class="logo-text">Sabify</span>
			<p class="tagline">Not by might, but by Sabify.</p>
		</div>
		<div class="footer-links">
			<div class="footer-col">
				<h4>Product</h4>
				<a href="#vault">Knowledge Vault</a>
				<a href="#pay">Sabify Pay</a>
				<a href="#shield">Sabify Shield</a>
			</div>
			<div class="footer-col">
				<h4>Campus</h4>
				<a href="#">MOUAU</a>
				<a href="#">UNN (Coming)</a>
				<a href="#">UI (Coming)</a>
			</div>
			<div class="footer-col">
				<h4>Legal</h4>
				<a href="#">Privacy</a>
				<a href="#">Terms</a>
				<a href="#">Data Security</a>
			</div>
		</div>
	</div>
	<div class="footer-bottom">
		<p>Built for Nigerian students. 🇳🇬</p>
	</div>
</footer>

<style>
	.nav {
		position: sticky;
		top: 0;
		background: var(--bg-primary);
		border-bottom: 1px solid var(--border);
		backdrop-filter: blur(12px);
		z-index: 50;
	}

	.nav-container {
		max-width: 1280px;
		margin: 0 auto;
		padding: 1rem 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.logo-icon {
		font-size: 1.75rem;
	}

	.logo-text {
		background: linear-gradient(135deg, var(--purple-primary) 0%, var(--purple-accent) 100%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	.logo-badge {
		background: var(--purple-primary);
		font-size: 0.7rem;
		padding: 0.2rem 0.5rem;
		border-radius: 999px;
		font-weight: 500;
		color: white;
	}

	.nav-links {
		display: flex;
		gap: 2rem;
	}

	.nav-links a {
		color: var(--text-secondary);
		text-decoration: none;
		transition: color 0.2s;
	}

	.nav-links a:hover {
		color: var(--purple-primary);
	}

	.nav-actions {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.theme-toggle {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 999px;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 1.25rem;
		transition: all 0.2s;
	}

	.theme-toggle:hover {
		background: var(--purple-light);
		border-color: var(--purple-primary);
	}

	.btn-outline {
		background: transparent;
		border: 1px solid var(--purple-primary);
		color: var(--purple-primary);
		padding: 0.5rem 1.25rem;
		border-radius: 999px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-outline:hover {
		background: var(--purple-primary);
		color: white;
	}

	.footer {
		background: var(--bg-secondary);
		padding: 3rem 2rem 1rem;
		border-top: 1px solid var(--border);
	}

	.footer-container {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 3rem;
	}

	.footer-brand .logo-text {
		font-size: 1.5rem;
		font-weight: 700;
	}

	.tagline {
		margin-top: 0.5rem;
		font-size: 0.875rem;
		color: var(--text-muted);
	}

	.footer-links {
		display: flex;
		gap: 4rem;
		flex-wrap: wrap;
	}

	.footer-col h4 {
		margin-bottom: 1rem;
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	.footer-col a {
		display: block;
		color: var(--text-muted);
		text-decoration: none;
		font-size: 0.875rem;
		margin-bottom: 0.5rem;
		transition: color 0.2s;
	}

	.footer-col a:hover {
		color: var(--purple-primary);
	}

	.footer-bottom {
		text-align: center;
		margin-top: 3rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	@media (max-width: 768px) {
		.nav-links {
			display: none;
		}
		
		.footer-container {
			flex-direction: column;
			text-align: center;
		}
		
		.footer-links {
			justify-content: center;
		}
	}
</style>
