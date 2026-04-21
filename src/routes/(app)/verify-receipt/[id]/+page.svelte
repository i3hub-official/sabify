<!-- src/routes/(app)/verify-receipt/[id]/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  import { CheckCircle, XCircle, AlertTriangle, ArrowLeft, ShieldCheck } from 'lucide-svelte';
  let { data }: { data: PageData } = $props();

  function fmtMoney(k: number) { return `₦${(k / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`; }
  function fmtDate(d: string | Date | null) { return d ? new Date(d as string).toLocaleString('en-NG', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'; }

  const QR_CELLS = [1,1,1,0,1,1,0,1,1,1,1,0,0,1,1,0,1,0,0,1,1,1,0,1,0];
</script>

<svelte:head><title>Receipt Verification — Sabify</title></svelte:head>

<div class="result-page">
  <a href="/verify-receipt" class="back-btn"><ArrowLeft size={16} /> Verify another</a>

  <!-- Status banner -->
  {#if data.status === 'VALID'}
    <div class="status-banner status-banner--valid">
      <CheckCircle size={28} />
      <div>
        <strong>Receipt is valid</strong>
        <span>This payment has been verified as authentic and successful.</span>
      </div>
    </div>
  {:else if data.status === 'INVALID'}
    <div class="status-banner status-banner--invalid">
      <XCircle size={28} />
      <div>
        <strong>Receipt is not valid</strong>
        <span>This transaction was not completed successfully. Payment status: {data.payment?.status}.</span>
      </div>
    </div>
  {:else}
    <div class="status-banner status-banner--notfound">
      <AlertTriangle size={28} />
      <div>
        <strong>Receipt not found</strong>
        <span>No payment record matches reference <code>{data.ref}</code>. It may be forged or incorrectly entered.</span>
      </div>
    </div>
  {/if}

  {#if data.payment}
    <div class="result-grid">

      <!-- Details card -->
      <div class="detail-card">
        <h2 class="detail-title">Payment details</h2>
        <div class="detail-rows">
          <div class="detail-row"><span>Reference</span><code>{data.payment.reference}</code></div>
          <div class="detail-row"><span>Amount</span><span class="detail-val--bold">{fmtMoney(data.payment.amount)}</span></div>
          <div class="detail-row"><span>Due</span><span>{data.payment.due.title}</span></div>
          <div class="detail-row"><span>Department</span><span>{data.payment.due.department.name}</span></div>
          <div class="detail-row"><span>Academic year</span><span>{data.payment.due.academicYear}</span></div>
          <div class="detail-row"><span>Student</span><span>{data.payment.user.name}</span></div>
          <div class="detail-row"><span>Matric</span><code>{data.payment.user.matricNumber}</code></div>
          <div class="detail-row"><span>Paid at</span><span>{fmtDate(data.payment.paidAt)}</span></div>
        </div>
      </div>

      <!-- QR ticket -->
      {#if data.status === 'VALID'}
        <div class="ticket">
          <div class="ticket-top">
            <div class="ticket-brand">
              <ShieldCheck size={16} />
              <span>Sabify Pay · Verified</span>
            </div>
          </div>
          <div class="ticket-ref">{data.payment.reference}</div>
          <div class="ticket-amount">{fmtMoney(data.payment.amount)}</div>
          <div class="ticket-desc">{data.payment.due.title}</div>
          <div class="ticket-divider"></div>
          <div class="ticket-footer">
            <div class="qr-grid">
              {#each QR_CELLS as cell}
                <div class="qr-cell" style="background:{cell ? '#a78bfa' : 'transparent'}"></div>
              {/each}
            </div>
            <div class="ticket-meta">
              <div><span>Student</span><span>{data.payment.user.name}</span></div>
              <div><span>Matric</span><span>{data.payment.user.matricNumber}</span></div>
              <div><span>Dept</span><span>{data.payment.due.department.name}</span></div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .result-page { display: flex; flex-direction: column; gap: 1.5rem; max-width: 760px; }
  .back-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 0.875rem; color: var(--text-secondary); text-decoration: none; padding: 6px 12px; border: 1px solid var(--border); border-radius: 8px; width: fit-content; }
  .back-btn:hover { border-color: var(--purple-primary); color: var(--purple-on-light); }

  .status-banner { display: flex; align-items: flex-start; gap: 1rem; padding: 1.25rem 1.5rem; border-radius: 1rem; }
  .status-banner div { display: flex; flex-direction: column; gap: 3px; }
  .status-banner strong { font-size: 1rem; font-weight: 700; }
  .status-banner span { font-size: 0.875rem; line-height: 1.5; }
  .status-banner--valid    { background: color-mix(in srgb, var(--success) 10%, transparent); border: 1px solid color-mix(in srgb, var(--success) 30%, transparent); color: var(--success); }
  .status-banner--invalid  { background: color-mix(in srgb, var(--error) 10%, transparent);   border: 1px solid color-mix(in srgb, var(--error) 30%, transparent);   color: var(--error); }
  .status-banner--notfound { background: color-mix(in srgb, var(--warning) 10%, transparent); border: 1px solid color-mix(in srgb, var(--warning) 30%, transparent); color: var(--warning); }

  .result-grid { display: grid; grid-template-columns: 1fr 320px; gap: 1.25rem; align-items: start; }
  @media (max-width: 680px) { .result-grid { grid-template-columns: 1fr; } }

  .detail-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 1.25rem; padding: 1.5rem; }
  .detail-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1rem; }
  .detail-rows { display: flex; flex-direction: column; gap: 0; }
  .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 0.625rem 0; border-bottom: 1px solid var(--border); font-size: 0.875rem; gap: 1rem; flex-wrap: wrap; }
  .detail-row:last-child { border-bottom: none; }
  .detail-row span:first-child { color: var(--text-muted); flex-shrink: 0; }
  .detail-row span:last-child, .detail-row code { color: var(--text-primary); font-weight: 500; text-align: right; }
  .detail-row code { font-family: 'DM Mono', monospace; font-size: 0.813rem; color: var(--purple-primary); }
  .detail-val--bold { font-weight: 800 !important; font-size: 1rem !important; color: var(--text-primary) !important; }

  /* Ticket */
  .ticket { background: #0d0d0d; border-radius: 1.25rem; padding: 1.5rem; border: 1px solid #1f1f1f; display: flex; flex-direction: column; gap: 0.75rem; }
  .ticket-top { display: flex; align-items: center; justify-content: space-between; }
  .ticket-brand { display: flex; align-items: center; gap: 7px; font-size: 0.813rem; font-weight: 700; color: #a78bfa; }
  .ticket-ref { font-family: 'DM Mono', monospace; font-size: 0.688rem; color: #a78bfa; letter-spacing: 0.05em; }
  .ticket-amount { font-size: 1.75rem; font-weight: 800; color: white; letter-spacing: -0.03em; line-height: 1; }
  .ticket-desc { font-size: 0.75rem; color: #52525b; }
  .ticket-divider { border: none; border-top: 1px dashed #282828; }
  .ticket-footer { display: flex; align-items: center; gap: 1rem; }
  .qr-grid { width: 56px; height: 56px; display: grid; grid-template-columns: repeat(5,1fr); gap: 2px; padding: 4px; border: 1.5px solid #a78bfa; border-radius: 7px; flex-shrink: 0; }
  .qr-cell { border-radius: 1px; }
  .ticket-meta { display: flex; flex-direction: column; gap: 5px; flex: 1; }
  .ticket-meta div { display: flex; justify-content: space-between; font-size: 0.625rem; }
  .ticket-meta span:first-child { color: #52525b; }
  .ticket-meta span:last-child  { color: #d4d4d4; font-weight: 500; font-family: 'DM Mono', monospace; }
</style>