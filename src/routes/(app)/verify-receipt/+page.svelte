<!-- src/routes/(app)/verify-receipt/+page.svelte -->
<script lang="ts">
  import { ShieldCheck, QrCode, Search, ArrowRight } from 'lucide-svelte';
  let manualRef = $state('');
  let searching = $state(false);

  function goSearch() {
    if (!manualRef.trim()) return;
    window.location.href = `/verify-receipt/${encodeURIComponent(manualRef.trim())}`;
  }
</script>

<svelte:head><title>Verify Receipt — Sabify</title></svelte:head>

<div class="verify-page">
  <div class="page-header">
    <h1 class="page-title">Verify Receipt</h1>
    <p class="page-sub">For department administrators and auditors. Check if a payment receipt is authentic.</p>
  </div>

  <div class="verify-grid">
    <a href="/verify-receipt/scan" class="verify-card verify-card--primary">
      <div class="vc-icon"><QrCode size={32} /></div>
      <h2 class="vc-title">Scan QR code</h2>
      <p class="vc-desc">Use your device camera to scan a student's QR receipt for instant verification.</p>
      <span class="vc-cta">Open scanner <ArrowRight size={14} /></span>
    </a>

    <div class="verify-card">
      <div class="vc-icon vc-icon--muted"><Search size={32} /></div>
      <h2 class="vc-title">Enter ref number</h2>
      <p class="vc-desc">Manually type the receipt reference number to verify it.</p>
      <div class="vc-input-row">
        <input
          type="text"
          bind:value={manualRef}
          placeholder="e.g. SBF-2025-0xA3F9C1"
          class="vc-input"
          onkeydown={(e) => e.key === 'Enter' && goSearch()}
        />
        <button class="vc-search-btn" onclick={goSearch} disabled={!manualRef.trim()}>
          <Search size={15} />
        </button>
      </div>
    </div>
  </div>

  <div class="verify-info">
    <ShieldCheck size={16} class="info-icon" />
    <p>All Sabify receipts are cryptographically signed. A valid receipt confirms a real payment — it cannot be forged or reused.</p>
  </div>
</div>

<style>
  .verify-page { display: flex; flex-direction: column; gap: 1.5rem; max-width: 720px; }
  .page-header { display: flex; flex-direction: column; gap: 4px; }
  .page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; }
  .page-sub { font-size: 0.875rem; color: var(--text-muted); line-height: 1.5; }

  .verify-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  @media (max-width: 580px) { .verify-grid { grid-template-columns: 1fr; } }

  .verify-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 1.25rem; padding: 1.75rem; display: flex; flex-direction: column; gap: 0.75rem; text-decoration: none; transition: border-color 0.15s; }
  .verify-card:hover { border-color: var(--purple-accent); }
  .verify-card--primary { background: var(--purple-light); border-color: var(--purple-light-border); }
  .verify-card--primary:hover { border-color: var(--purple-primary); }

  .vc-icon { color: var(--purple-primary); }
  .vc-icon--muted { color: var(--text-muted); }
  .vc-title { font-size: 1.125rem; font-weight: 700; color: var(--text-primary); }
  .vc-desc { font-size: 0.813rem; color: var(--text-secondary); line-height: 1.6; flex: 1; }
  .vc-cta { display: inline-flex; align-items: center; gap: 5px; font-size: 0.813rem; font-weight: 700; color: var(--purple-primary); }

  .vc-input-row { display: flex; gap: 7px; }
  .vc-input { flex: 1; padding: 0.625rem 0.875rem; border: 1.5px solid var(--border); border-radius: 0.625rem; font-size: 0.875rem; background: var(--bg-primary); color: var(--text-primary); outline: none; font-family: 'DM Mono', monospace; font-size: 0.813rem; }
  .vc-input:focus { border-color: var(--purple-primary); }
  .vc-search-btn { padding: 0.625rem 0.875rem; background: var(--purple-primary); color: white; border: none; border-radius: 0.625rem; cursor: pointer; display: flex; align-items: center; }
  .vc-search-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .verify-info { display: flex; align-items: flex-start; gap: 9px; padding: 0.875rem 1.125rem; background: color-mix(in srgb, var(--success) 7%, transparent); border: 1px solid color-mix(in srgb, var(--success) 25%, transparent); border-radius: 0.875rem; }
  :global(.info-icon) { color: var(--success); flex-shrink: 0; margin-top: 1px; }
  .verify-info p { font-size: 0.813rem; color: var(--text-secondary); line-height: 1.6; }
</style>