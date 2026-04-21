<!-- src/routes/(app)/department-dues/pay/+page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-svelte';
  let paying = $state(false); let done = $state(false);

  async function initPayment() {
    paying = true;
    // TODO: call Paystack/Flutterwave initialize endpoint
    // then redirect to payment gateway URL
    await new Promise(r => setTimeout(r, 1200));
    done = true; paying = false;
  }
</script>

<svelte:head><title>Pay Dues — Sabify</title></svelte:head>

<div class="pay-page">
  <a href="/department-dues" class="back-btn"><ArrowLeft size={16} /> Dues</a>
  <h1 class="page-title">Pay departmental dues</h1>

  {#if done}
    <div class="success-card">
      <ShieldCheck size={36} class="success-icon" />
      <h2>Payment recorded</h2>
      <p>Your QR receipt has been generated. Show it to the treasurer for instant verification.</p>
      <a href="/department-dues/receipts" class="view-receipt-btn">View receipt</a>
    </div>
  {:else}
    <div class="pay-card">
      <div class="pay-amount-row">
        <span class="pay-label">Amount due</span>
        <span class="pay-amount">₦5,000.00</span>
      </div>
      <div class="pay-meta">
        <div class="meta-row"><span>Due</span><span>400L Departmental Dues 2024/2025</span></div>
        <div class="meta-row"><span>Department</span><span>Computer Engineering</span></div>
        <div class="meta-row"><span>Academic year</span><span>2024/2025</span></div>
      </div>
      <div class="gateway-row">
        <span class="gateway-label">Pay via</span>
        <div class="gateway-options">
          <div class="gateway-opt gateway-opt--active">Paystack</div>
          <div class="gateway-opt">Flutterwave</div>
        </div>
      </div>
      <button class="pay-btn" onclick={initPayment} disabled={paying}>
        {#if paying}<span class="spinner"></span> Initializing…{:else}<CreditCard size={15} /> Pay ₦5,000.00 securely{/if}
      </button>
      <p class="pay-secure"><ShieldCheck size={13} /> Secured by Paystack · NDPR compliant</p>
    </div>
  {/if}
</div>

<style>
  .pay-page { display: flex; flex-direction: column; gap: 1.25rem; max-width: 480px; }
  .back-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 0.875rem; color: var(--text-secondary); text-decoration: none; padding: 6px 12px; border: 1px solid var(--border); border-radius: 8px; width: fit-content; }
  .back-btn:hover { border-color: var(--purple-primary); color: var(--purple-on-light); }
  .page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; }
  .pay-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 1.25rem; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
  .pay-amount-row { display: flex; align-items: baseline; justify-content: space-between; }
  .pay-label { font-size: 0.875rem; color: var(--text-muted); font-weight: 500; }
  .pay-amount { font-size: 2rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; }
  .pay-meta { display: flex; flex-direction: column; gap: 8px; padding: 1rem; background: var(--bg-primary); border-radius: 0.75rem; border: 1px solid var(--border); }
  .meta-row { display: flex; justify-content: space-between; font-size: 0.813rem; }
  .meta-row span:first-child { color: var(--text-muted); }
  .meta-row span:last-child  { color: var(--text-primary); font-weight: 500; }
  .gateway-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
  .gateway-label { font-size: 0.813rem; font-weight: 600; color: var(--text-secondary); }
  .gateway-options { display: flex; gap: 8px; }
  .gateway-opt { padding: 6px 14px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 0.813rem; font-weight: 600; color: var(--text-muted); cursor: pointer; }
  .gateway-opt--active { border-color: var(--purple-primary); color: var(--purple-on-light); background: var(--purple-light); }
  .pay-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 0.875rem; background: var(--purple-primary); color: white; border: none; border-radius: 0.875rem; font-size: 0.9375rem; font-weight: 700; cursor: pointer; font-family: inherit; }
  .pay-btn:hover:not(:disabled) { background: var(--purple-primary-dark); }
  .pay-btn:disabled { opacity: 0.65; cursor: not-allowed; }
  .pay-secure { display: flex; align-items: center; gap: 5px; justify-content: center; font-size: 0.688rem; color: var(--text-muted); }
  .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .success-card { background: var(--bg-secondary); border: 1px solid color-mix(in srgb, var(--success) 30%, transparent); border-radius: 1.25rem; padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; text-align: center; }
  :global(.success-icon) { color: var(--success); }
  .success-card h2 { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); }
  .success-card p  { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; }
  .view-receipt-btn { padding: 0.75rem 1.5rem; background: var(--purple-primary); color: white; border-radius: 0.75rem; text-decoration: none; font-size: 0.875rem; font-weight: 700; }
  .view-receipt-btn:hover { background: var(--purple-primary-dark); }
</style>