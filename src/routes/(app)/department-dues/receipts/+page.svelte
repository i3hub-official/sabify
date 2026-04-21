<!-- src/routes/(app)/department-dues/receipts/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  import { ArrowLeft, Download, QrCode, CheckCircle } from 'lucide-svelte';

  // In real app: load from +page.server.ts
  const receipts = [
    { id: 'SBF-2025-0xA3F9C1', due: '400L Departmental Dues 2024/2025', amount: 500000, paidAt: '2025-04-10T14:22:00Z', status: 'SUCCESS', department: 'Computer Engineering', matric: '2021/249011' },
    { id: 'SBF-2024-0xB7D201', due: '300L Departmental Dues 2023/2024', amount: 400000, paidAt: '2024-04-02T09:11:00Z', status: 'SUCCESS', department: 'Computer Engineering', matric: '2021/249011' },
  ];

  function fmtMoney(k: number) { return `₦${(k / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`; }
  function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }

  let activeReceipt = $state<typeof receipts[0] | null>(null);

  // Build a simple QR grid pattern (decorative)
  const QR_CELLS = [1,1,1,0,1,1,0,1,1,1,1,0,0,1,1,0,1,0,0,1,1,1,0,1,0];
</script>

<svelte:head><title>Receipts — Sabify</title></svelte:head>

<div class="receipts-page">
  <div class="page-header">
    <a href="/department-dues" class="back-btn"><ArrowLeft size={16} /> Dues</a>
    <h1 class="page-title">Payment receipts</h1>
    <p class="page-sub">{receipts.length} receipts · all transactions</p>
  </div>

  <div class="receipts-grid">

    <!-- Receipt list -->
    <div class="receipt-list">
      {#each receipts as r}
        <button
          class="receipt-row"
          class:receipt-row--active={activeReceipt?.id === r.id}
          onclick={() => activeReceipt = r}
        >
          <div class="receipt-check"><CheckCircle size={18} /></div>
          <div class="receipt-info">
            <span class="receipt-due">{r.due}</span>
            <span class="receipt-meta">{fmtMoney(r.amount)} · {fmtDate(r.paidAt)}</span>
          </div>
          <span class="receipt-ref">{r.id.slice(-8)}</span>
        </button>
      {/each}
    </div>

    <!-- Ticket preview -->
    {#if activeReceipt}
      <div class="ticket-wrap">
        <div class="ticket">
          <div class="ticket-header">
            <div class="ticket-brand">
              <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                <path d="M10 2L17 6V11C17 15.5 13.5 18.5 10 19C6.5 18.5 3 15.5 3 11V6L10 2Z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
                <path d="M7 10.5L9.5 13L13.5 8" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>Sabify Pay</span>
            </div>
            <span class="ticket-verified">✓ Verified</span>
          </div>

          <div class="ticket-ref">REF # {activeReceipt.id}</div>
          <div class="ticket-amount">{fmtMoney(activeReceipt.amount)}</div>
          <div class="ticket-desc">{activeReceipt.due}</div>

          <div class="ticket-divider"></div>

          <div class="ticket-footer">
            <div class="qr-grid" aria-label="QR code receipt">
              {#each QR_CELLS as cell}
                <div class="qr-cell" style="background:{cell ? '#a78bfa' : 'transparent'}"></div>
              {/each}
            </div>
            <div class="ticket-meta">
              <div><span>Matric</span><span>{activeReceipt.matric}</span></div>
              <div><span>Dept</span><span>{activeReceipt.department}</span></div>
              <div><span>Date</span><span>{fmtDate(activeReceipt.paidAt)}</span></div>
            </div>
          </div>
        </div>

        <button class="download-btn" onclick={() => window.print()}>
          <Download size={15} /> Download receipt
        </button>
      </div>
    {:else}
      <div class="ticket-placeholder">
        <QrCode size={36} />
        <p>Select a receipt to view the QR ticket</p>
      </div>
    {/if}

  </div>
</div>

<style>
  .receipts-page { display: flex; flex-direction: column; gap: 1.25rem; }
  .page-header { display: flex; flex-direction: column; gap: 4px; }
  .back-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 0.875rem; color: var(--text-secondary); text-decoration: none; padding: 6px 12px; border: 1px solid var(--border); border-radius: 8px; width: fit-content; margin-bottom: 4px; }
  .back-btn:hover { border-color: var(--purple-primary); color: var(--purple-on-light); }
  .page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; }
  .page-sub { font-size: 0.813rem; color: var(--text-muted); }

  .receipts-grid { display: grid; grid-template-columns: 1fr 380px; gap: 1.25rem; align-items: start; }
  @media (max-width: 780px) { .receipts-grid { grid-template-columns: 1fr; } }

  .receipt-list { display: flex; flex-direction: column; gap: 8px; }
  .receipt-row {
    display: flex; align-items: center; gap: 12px;
    padding: 1rem 1.125rem; background: var(--bg-secondary);
    border: 1px solid var(--border); border-radius: 0.875rem;
    cursor: pointer; text-align: left; width: 100%; font-family: inherit;
    transition: border-color 0.15s;
  }
  .receipt-row:hover { border-color: var(--purple-accent); }
  .receipt-row--active { border-color: var(--purple-primary); background: var(--purple-light); }
  .receipt-check { color: var(--success); flex-shrink: 0; }
  .receipt-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .receipt-due { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
  .receipt-meta { font-size: 0.75rem; color: var(--text-muted); }
  .receipt-ref { font-size: 0.688rem; font-family: 'DM Mono', monospace; color: var(--purple-primary); flex-shrink: 0; }

  /* Ticket */
  .ticket-wrap { display: flex; flex-direction: column; gap: 0.875rem; position: sticky; top: 80px; }
  .ticket {
    background: #0d0d0d; border-radius: 1.25rem;
    padding: 1.5rem; border: 1px solid #1f1f1f;
    display: flex; flex-direction: column; gap: 0.75rem;
  }
  .ticket-header { display: flex; align-items: center; justify-content: space-between; }
  .ticket-brand { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; font-weight: 700; color: white; }
  .ticket-verified { font-size: 0.688rem; font-weight: 700; color: #a78bfa; }
  .ticket-ref { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #a78bfa; letter-spacing: 0.05em; }
  .ticket-amount { font-size: 2rem; font-weight: 800; color: white; letter-spacing: -0.03em; line-height: 1; }
  .ticket-desc { font-size: 0.75rem; color: #52525b; }
  .ticket-divider { border: none; border-top: 1px dashed #282828; }
  .ticket-footer { display: flex; align-items: center; gap: 1.25rem; }
  .qr-grid { width: 60px; height: 60px; display: grid; grid-template-columns: repeat(5,1fr); gap: 2px; padding: 5px; border: 1.5px solid #a78bfa; border-radius: 8px; flex-shrink: 0; }
  .qr-cell { border-radius: 1px; }
  .ticket-meta { display: flex; flex-direction: column; gap: 5px; flex: 1; }
  .ticket-meta div { display: flex; justify-content: space-between; font-size: 0.688rem; }
  .ticket-meta span:first-child { color: #52525b; }
  .ticket-meta span:last-child  { color: #d4d4d4; font-weight: 500; font-family: 'DM Mono', monospace; }

  .download-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 0.75rem; background: var(--purple-primary); color: white; border: none; border-radius: 0.75rem; font-size: 0.875rem; font-weight: 700; cursor: pointer; font-family: inherit; }
  .download-btn:hover { background: var(--purple-primary-dark); }

  .ticket-placeholder { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem; background: var(--bg-secondary); border: 1px dashed var(--border); border-radius: 1.25rem; color: var(--text-muted); text-align: center; }
  .ticket-placeholder p { font-size: 0.875rem; }
</style>