<!-- src/routes/(app)/payments/+page.svelte -->
<script lang="ts">
  import { Receipt, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-svelte';

  // In real app: load via +page.server.ts from prisma
  const payments = [
    { id: 1, ref: 'SBF-2025-0xA3F9C1', due: '400L Departmental Dues 2024/2025', amount: 500000, status: 'SUCCESS', paidAt: '2025-04-10T14:22:00Z', gateway: 'Paystack' },
    { id: 2, ref: 'SBF-2025-0xC1A002', due: 'Computer Engineering Association Dues', amount: 200000, status: 'PENDING', paidAt: '2025-04-15T09:00:00Z', gateway: 'Flutterwave' },
    { id: 3, ref: 'SBF-2024-0xB7D201', due: '300L Departmental Dues 2023/2024', amount: 400000, status: 'SUCCESS', paidAt: '2024-04-02T09:11:00Z', gateway: 'Paystack' },
    { id: 4, ref: 'SBF-2024-0xD00F33', due: 'Faculty Levy 2023/2024', amount: 150000, status: 'FAILED', paidAt: '2024-03-18T16:45:00Z', gateway: 'Paystack' },
  ];

  function fmtMoney(k: number) { return `₦${(k/100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`; }
  function fmtDate(d: string)   { return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }); }

  const total = payments.filter(p => p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0);
</script>

<svelte:head><title>Payments — Sabify</title></svelte:head>

<div class="payments-page">
  <div class="page-header">
    <h1 class="page-title">Payment history</h1>
    <p class="page-sub">{payments.length} transactions · Total paid: {fmtMoney(total)}</p>
  </div>

  <!-- Summary strip -->
  <div class="summary-strip">
    <div class="summary-item">
      <span class="summary-n">{payments.filter(p => p.status === 'SUCCESS').length}</span>
      <span class="summary-l">Successful</span>
    </div>
    <div class="summary-div"></div>
    <div class="summary-item">
      <span class="summary-n">{payments.filter(p => p.status === 'PENDING').length}</span>
      <span class="summary-l">Pending</span>
    </div>
    <div class="summary-div"></div>
    <div class="summary-item">
      <span class="summary-n">{fmtMoney(total)}</span>
      <span class="summary-l">Total paid</span>
    </div>
  </div>

  <!-- Transaction list -->
  <div class="tx-list">
    {#each payments as p}
      <div class="tx-row">
        <div class="tx-icon">
          {#if p.status === 'SUCCESS'}
            <CheckCircle size={20} class="icon-success" />
          {:else if p.status === 'FAILED'}
            <XCircle size={20} class="icon-failed" />
          {:else}
            <Clock size={20} class="icon-pending" />
          {/if}
        </div>
        <div class="tx-info">
          <span class="tx-due">{p.due}</span>
          <span class="tx-meta">
            <span class="tx-ref">{p.ref}</span>
            <span>·</span>
            <span>{p.gateway}</span>
            <span>·</span>
            <span>{fmtDate(p.paidAt)}</span>
          </span>
        </div>
        <div class="tx-right">
          <span class="tx-amount">{fmtMoney(p.amount)}</span>
          <span class="tx-badge tx-badge-{p.status.toLowerCase()}">{p.status}</span>
        </div>
        {#if p.status === 'SUCCESS'}
          <a href="/department-dues/receipts" class="tx-receipt" title="View receipt">
            <Receipt size={15} />
          </a>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .payments-page { display: flex; flex-direction: column; gap: 1.25rem; }
  .page-header { display: flex; flex-direction: column; gap: 3px; }
  .page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; }
  .page-sub { font-size: 0.813rem; color: var(--text-muted); }

  .summary-strip { display: flex; align-items: center; gap: 0; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 1rem; overflow: hidden; }
  .summary-item { flex: 1; padding: 1rem; text-align: center; display: flex; flex-direction: column; gap: 3px; }
  .summary-div { width: 1px; background: var(--border); align-self: stretch; }
  .summary-n { font-size: 1.25rem; font-weight: 800; color: var(--purple-primary); letter-spacing: -0.03em; }
  .summary-l { font-size: 0.688rem; color: var(--text-muted); font-family: 'DM Mono', monospace; letter-spacing: 0.04em; }

  .tx-list { display: flex; flex-direction: column; gap: 8px; }
  .tx-row { display: flex; align-items: center; gap: 12px; padding: 1rem 1.125rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 0.875rem; }
  :global(.icon-success) { color: var(--success); }
  :global(.icon-failed)  { color: var(--error); }
  :global(.icon-pending) { color: var(--warning); }
  .tx-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
  .tx-due { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tx-meta { display: flex; align-items: center; gap: 6px; font-size: 0.688rem; color: var(--text-muted); flex-wrap: wrap; }
  .tx-ref { font-family: 'DM Mono', monospace; color: var(--purple-primary); }
  .tx-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
  .tx-amount { font-size: 0.9375rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
  .tx-badge { font-size: 0.625rem; font-weight: 700; padding: 2px 7px; border-radius: 4px; letter-spacing: 0.04em; }
  .tx-badge-success { background: color-mix(in srgb, var(--success) 12%, transparent); color: var(--success); border: 1px solid color-mix(in srgb, var(--success) 30%, transparent); }
  .tx-badge-failed  { background: color-mix(in srgb, var(--error) 12%, transparent);   color: var(--error);   border: 1px solid color-mix(in srgb, var(--error) 30%, transparent); }
  .tx-badge-pending { background: color-mix(in srgb, var(--warning) 12%, transparent); color: var(--warning); border: 1px solid color-mix(in srgb, var(--warning) 30%, transparent); }
  .tx-receipt { display: flex; align-items: center; padding: 6px; border-radius: 7px; color: var(--text-muted); transition: all 0.15s; }
  .tx-receipt:hover { background: var(--purple-light); color: var(--purple-on-light); }
</style>