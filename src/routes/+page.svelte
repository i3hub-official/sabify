<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { theme } from '$lib/stores/theme';
  import { onMount } from 'svelte';
  
  let email = '';
  let showWaitlistSuccess = false;
  
  onMount(() => {
    theme.init();
  });
  
  async function joinWaitlist() {
    if (!email) return;
    // TODO: Connect to waitlist DB
    console.log('Waitlist signup:', email);
    showWaitlistSuccess = true;
    email = '';
    setTimeout(() => showWaitlistSuccess = false, 3000);
  }
</script>

<svelte:head>
  <title>Sabify – The Academic Fortress for Nigerian University Students</title>
</svelte:head>

<!-- HERO -->
<section class="hero">
  <div class="hero-container">
    <div class="hero-badge">
      <span>🔥 First deployment: MOUAU</span>
    </div>
    <h1 class="hero-title">
      Not by might,<br />
      <span class="hero-accent">but by Sabify.</span>
    </h1>
    <p class="hero-description">
      The first all-in-one academic platform for Nigerian university students.<br />
      Knowledge Vault • Sabify Pay • Sabify Shield — in one digital fortress.
    </p>
    
    <div class="hero-cta">
      <input 
        type="email" 
        placeholder="mouau.edu.ng email" 
        bind:value={email}
        class="email-input"
      />
      <button class="btn-primary" on:click={joinWaitlist}>
        Join Waitlist
        <span class="arrow">→</span>
      </button>
    </div>
    
    {#if showWaitlistSuccess}
      <div class="success-message">
        ✓ You're on the list! MOUAU launch updates coming.
      </div>
    {/if}
    
    <div class="hero-stats">
      <div class="stat">
        <span class="stat-number">0</span>
        <span class="stat-label">Documents in Vault</span>
      </div>
      <div class="stat-divider">•</div>
      <div class="stat">
        <span class="stat-number">0</span>
        <span class="stat-label">Departments Ready</span>
      </div>
      <div class="stat-divider">•</div>
      <div class="stat">
        <span class="stat-number">24/7</span>
        <span class="stat-label">Shield Active</span>
      </div>
    </div>
  </div>
</section>

<!-- KNOWLEDGE VAULT -->
<section id="vault" class="section">
  <div class="container">
    <div class="section-label">01 — The Foundation</div>
    <h2 class="section-title">Knowledge Vault</h2>
    <p class="section-subtitle">
      Past tests [T] • Assignment prompts [A] • Textbooks [B]<br />
      Triple-indexed. OCR-powered. Offline-ready.
    </p>
    
    <div class="features-grid">
      <div class="feature-card">
        <div class="card-icon">📄</div>
        <h3>Past Tests [T]</h3>
        <p>10 years of MOUAU exams, organized by College → Department → Course. No more "my uncle's friend's brother has last year's paper."</p>
        <div class="card-tag">Community-sourced</div>
      </div>
      
      <div class="feature-card">
        <div class="card-icon">📝</div>
        <h3>Assignment Prompts [A]</h3>
        <p>Never miss a deadline. Digital logbook tracks physical submissions with timestamped photo proof. End "missing script" disputes.</p>
        <div class="card-tag">Dispute-proof</div>
      </div>
      
      <div class="feature-card">
        <div class="card-icon">📚</div>
        <h3>Textbooks [B]</h3>
        <p>Scan physical handouts → OCR makes them searchable. Pin for offline access. Your library, anywhere.</p>
        <div class="card-tag">Offline-first</div>
      </div>
    </div>
  </div>
</section>

<style>
  .hero {
    padding: 5rem 2rem 4rem;
    text-align: center;
  }

  .hero-container {
    max-width: 900px;
    margin: 0 auto;
  }

  .hero-badge {
    display: inline-block;
    background: var(--purple-light);
    border: 1px solid var(--purple-accent);
    padding: 0.25rem 1rem;
    border-radius: 999px;
    font-size: 0.875rem;
    margin-bottom: 2rem;
    color: var(--purple-primary);
  }

  .hero-title {
    font-size: 4rem;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 1.5rem;
  }

  .hero-accent {
    background: linear-gradient(135deg, var(--purple-primary) 0%, var(--purple-accent) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .hero-description {
    font-size: 1.25rem;
    color: var(--text-secondary);
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  .hero-cta {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 3rem;
  }

  .email-input {
    padding: 0.875rem 1.5rem;
    border-radius: 999px;
    border: 1px solid var(--border);
    width: 300px;
    font-size: 1rem;
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  .email-input:focus {
    outline: none;
    border-color: var(--purple-primary);
    ring: 2px solid var(--purple-light);
  }

  .btn-primary {
    background: var(--purple-primary);
    border: none;
    padding: 0.875rem 2rem;
    border-radius: 999px;
    font-weight: 700;
    font-size: 1rem;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
  }

  .btn-primary:hover {
    background: var(--purple-primary-dark);
    transform: scale(1.02);
  }

  .arrow {
    font-size: 1.25rem;
  }

  .success-message {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid var(--success);
    padding: 0.75rem;
    border-radius: 12px;
    margin-top: 1rem;
    display: inline-block;
    color: var(--success);
  }

  .hero-stats {
    display: flex;
    justify-content: center;
    gap: 2rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border);
  }

  .stat {
    display: flex;
    flex-direction: column;
  }

  .stat-number {
    font-size: 2rem;
    font-weight: 800;
    color: var(--purple-primary);
  }

  .stat-label {
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  .stat-divider {
    color: var(--border);
  }

  .section {
    padding: 5rem 2rem;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .section-label {
    color: var(--purple-primary);
    font-weight: 600;
    margin-bottom: 1rem;
    letter-spacing: 2px;
  }

  .section-title {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 1rem;
  }

  .section-subtitle {
    font-size: 1.25rem;
    color: var(--text-secondary);
    margin-bottom: 3rem;
    line-height: 1.5;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .feature-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 2rem;
    transition: all 0.2s;
  }

  .feature-card:hover {
    transform: translateY(-4px);
    border-color: var(--purple-primary);
    box-shadow: 0 12px 24px rgba(124, 58, 237, 0.1);
  }

  .card-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .feature-card h3 {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
  }

  .feature-card p {
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: 1rem;
  }

  .card-tag {
    display: inline-block;
    background: var(--purple-light);
    color: var(--purple-primary);
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    .hero-title {
      font-size: 2.5rem;
    }
    
    .hero-cta {
      flex-direction: column;
      align-items: center;
    }
    
    .email-input {
      width: 100%;
    }
    
    .section-title {
      font-size: 2rem;
    }
  }
</style>