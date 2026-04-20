<!-- src/lib/components/UniversityCTA.svelte -->
<script lang="ts">
  import { allUniversities, searchAllUniversities } from '$lib/stores/universities';
  import type { University } from '$lib/types/university';

  // ── State ─────────────────────────────────────────────────────────
  let searchQuery   = $state('');
  let showDropdown  = $state(false);
  let selectedUniversity: University | null = $state(null);
  let logoError     = $state(false);

  // ── Derived ───────────────────────────────────────────────────────
  const filteredUniversities = $derived(
    searchQuery
      ? searchAllUniversities(searchQuery).slice(0, 10)
      : allUniversities.slice(0, 10)
  );

  // Reset logo error whenever a new university is picked
  $effect(() => {
    if (selectedUniversity) logoError = false;
  });

  // ── Helpers ───────────────────────────────────────────────────────
  function getLogoPath(uni: University | null): string | null {
    if (!uni) return null;
    const slug = uni.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);
    return `/uni-icons/${slug}.png`;
  }

  function selectUniversity(uni: University) {
    selectedUniversity = uni;
    searchQuery  = `${uni.name} (${uni.acronym})`;
    showDropdown = false;
  }

  function clearUniversity() {
    selectedUniversity = null;
    searchQuery        = '';
    showDropdown       = false;
  }

  function handleGetStarted() {
    if (!selectedUniversity) return;
    // Navigate to register with university pre-selected
    window.location.href = `/signup?university=${selectedUniversity.id}`;
  }

  // Close dropdown when clicking outside
  function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.university-search')) {
      showDropdown = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<section class="cta">
  <div class="container cta-inner">

    <div class="cta-text">
      <h2 class="cta-title">
        Your university could be <em>next.</em>
      </h2>
      <p class="cta-subtitle">
        Sabify is rolling out across Nigerian universities.
        Find yours and get started — or join the list if we're not there yet.
      </p>
    </div>

    <div class="cta-form">

      <!-- University search input -->
      <div class="university-search">
        <div class="input-wrapper">
          <!-- Search icon -->
          <svg class="input-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="5" stroke="currentColor" stroke-width="1.5"/>
            <path d="M12.5 12.5L16 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>

          <input
            type="text"
            bind:value={searchQuery}
            on:focus={() => (showDropdown = true)}
            on:input={() => (showDropdown = true)}
            placeholder="Search for your university…"
            class="form-input"
            autocomplete="off"
            aria-label="Search universities"
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
          />

          {#if selectedUniversity}
            <button
              type="button"
              class="clear-btn"
              on:click={clearUniversity}
              aria-label="Clear university selection"
            >
              <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          {/if}
        </div>

        <!-- Dropdown list -->
        {#if showDropdown && filteredUniversities.length > 0}
          <div class="dropdown" role="listbox" aria-label="University options">
            {#each filteredUniversities as uni (uni.id)}
              <button
                type="button"
                class="dropdown-item"
                role="option"
                aria-selected={selectedUniversity?.id === uni.id}
                on:click={() => selectUniversity(uni)}
              >
                <span class="dropdown-acronym">{uni.acronym}</span>
                <span class="dropdown-name">{uni.name}</span>
                {#if !uni.active}
                  <span class="dropdown-soon">soon</span>
                {/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Selected university card -->
      {#if selectedUniversity}
        <div class="uni-card" aria-live="polite">
          <div class="uni-card-logo">
            {#if !logoError}
              <img
                src={getLogoPath(selectedUniversity)}
                alt={selectedUniversity.acronym}
                on:error={() => (logoError = true)}
              />
            {:else}
              <span
                class="uni-initials"
                class:sm={selectedUniversity.acronym.length > 3}
              >
                {selectedUniversity.acronym.slice(0, 2)}
              </span>
            {/if}
          </div>
          <div class="uni-card-info">
            <span class="uni-card-name">{selectedUniversity.name}</span>
            <span class="uni-card-acronym">{selectedUniversity.acronym}</span>
          </div>
          <!-- Check icon -->
          <svg class="uni-card-check" viewBox="0 0 16 16" fill="none" width="16" height="16" aria-hidden="true">
            <circle cx="8" cy="8" r="7" fill="#22c55e" fill-opacity="0.15" stroke="#22c55e" stroke-width="1.2"/>
            <path d="M5 8l2 2 4-4" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      {/if}

      <button
        class="btn-primary"
        disabled={!selectedUniversity}
        on:click={handleGetStarted}
      >
        {selectedUniversity ? `Get started at ${selectedUniversity.acronym} →` : 'Get started →'}
      </button>

      <p class="cta-note">
        {#if selectedUniversity && !selectedUniversity.active}
          We're not at {selectedUniversity.acronym} yet — you'll be notified when we launch there.
        {:else}
          MOUAU is live now. More universities launching soon.
        {/if}
      </p>
    </div>

  </div>
</section>

<style>
  /* ── Section shell ────────────────────────────────── */
  .cta {
    padding: 80px 28px;
    border-top: 1px solid var(--border);
    background: var(--bg-secondary);
  }
  .cta-inner {
    max-width: 1100px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }

  /* ── Text block ───────────────────────────────────── */
  .cta-title {
    font-weight: 900;
    font-size: clamp(28px, 3.5vw, 42px);
    letter-spacing: -0.04em;
    line-height: 1.08;
    color: var(--text-primary);
    margin-bottom: 14px;
  }
  .cta-title em {
    font-style: normal;
    color: var(--purple-primary);
    font-family: 'Instrument Serif', Georgia, serif;
    font-weight: 400;
    font-size: 1.04em;
  }
  .cta-subtitle {
    font-size: 16px;
    color: var(--text-secondary);
    line-height: 1.7;
  }

  /* ── Form block ───────────────────────────────────── */
  .cta-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* ── Search input ─────────────────────────────────── */
  .university-search { position: relative; }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  .input-icon {
    position: absolute;
    left: 14px;
    width: 17px; height: 17px;
    color: var(--text-muted);
    pointer-events: none;
    flex-shrink: 0;
  }
  .form-input {
    width: 100%;
    height: 48px;
    padding: 0 40px 0 42px;
    border: 1.5px solid var(--border);
    border-radius: 12px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .form-input::placeholder { color: var(--text-muted); }
  .form-input:focus {
    border-color: var(--purple-primary);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--purple-primary) 15%, transparent);
  }

  .clear-btn {
    position: absolute;
    right: 12px;
    background: none; border: none;
    color: var(--text-muted); cursor: pointer;
    display: flex; align-items: center;
    padding: 4px; border-radius: 5px;
    transition: color 0.15s, background 0.15s;
  }
  .clear-btn:hover { color: var(--text-primary); background: var(--bg-secondary); }

  /* ── Dropdown ─────────────────────────────────────── */
  .dropdown {
    position: absolute;
    top: calc(100% + 5px);
    left: 0; right: 0;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 12px;
    max-height: 220px;
    overflow-y: auto;
    z-index: 20;
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  }
  .dropdown-item {
    width: 100%;
    padding: 10px 14px;
    text-align: left;
    background: none; border: none;
    cursor: pointer;
    display: flex;
    gap: 10px;
    align-items: baseline;
    transition: background 0.12s;
  }
  .dropdown-item:hover { background: var(--bg-secondary); }
  .dropdown-item[aria-selected="true"] { background: var(--purple-light); }
  .dropdown-acronym {
    font-weight: 700;
    color: var(--purple-primary);
    font-size: 12px;
    font-family: 'Geist Mono', monospace;
    min-width: 60px;
    flex-shrink: 0;
  }
  .dropdown-name {
    font-size: 13px;
    color: var(--text-primary);
    flex: 1;
  }
  .dropdown-soon {
    font-size: 10px;
    font-family: 'Geist Mono', monospace;
    color: var(--text-muted);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 5px;
    padding: 1px 6px;
    flex-shrink: 0;
  }

  /* ── University card ──────────────────────────────── */
  .uni-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    border-radius: 14px;
    background: var(--bg-primary);
    border: 1px solid rgba(124, 58, 237, 0.25);
    animation: slide-in 0.15s ease;
  }
  @keyframes slide-in {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .uni-card-logo {
    width: 48px; height: 48px;
    border-radius: 10px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
  }
  .uni-card-logo img {
    width: 100%; height: 100%;
    object-fit: contain;
    padding: 4px;
  }
  .uni-initials {
    font-size: 14px; font-weight: 700;
    color: var(--purple-primary);
  }
  .uni-initials.sm { font-size: 11px; }
  .uni-card-info {
    flex: 1;
    display: flex; flex-direction: column;
    gap: 2px; min-width: 0;
  }
  .uni-card-name {
    font-size: 13px; font-weight: 600;
    color: var(--text-primary); line-height: 1.3;
  }
  .uni-card-acronym {
    font-size: 11px; color: var(--purple-primary);
    font-weight: 700; font-family: 'Geist Mono', monospace;
  }

  /* ── CTA button ───────────────────────────────────── */
  .btn-primary {
    height: 48px;
    background: var(--purple-primary);
    color: white; border: none;
    border-radius: 12px;
    font-size: 15px; font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s, opacity 0.15s;
    letter-spacing: -0.01em;
  }
  .btn-primary:hover:not(:disabled) {
    background: var(--purple-primary-dark, #6d28d9);
  }
  .btn-primary:active:not(:disabled) { transform: scale(0.98); }
  .btn-primary:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* ── Note ─────────────────────────────────────────── */
  .cta-note {
    font-size: 12px;
    color: var(--text-muted);
    text-align: center;
    font-family: 'Geist Mono', monospace;
    line-height: 1.5;
  }

  /* ── Responsive ───────────────────────────────────── */
  @media (max-width: 768px) {
    .cta { padding: 60px 20px; }
    .cta-inner {
      grid-template-columns: 1fr;
      gap: 36px;
    }
  }
</style>