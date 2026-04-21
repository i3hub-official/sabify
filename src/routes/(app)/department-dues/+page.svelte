<!-- src/routes/(app)/department-dues/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  import { CreditCard, CheckCircle, Clock, ArrowRight, Receipt } from 'lucide-svelte';
  let { data }: { data: PageData } = $props();

  function fmtMoney(k: number) { return `₦${(k / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`; }
  function fmtDate(d: string | Date | null) { return d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No deadline'; }
</script>

<svelte:head><title>Department Dues — Sabify</title></svelte:head>

<div class="dues-page">
  <div class="page-header">
    <h1 class="page-title">Department Dues</h1>
    <p class="page-sub">{data.department?.name ?? 'Your department'}</p>
  </div>

  {#if data.dues.length === 0}
    <div class="empty"><CreditCard size={32} /><p>No active dues for your department.</p></div>
  {:else}
    <div class="dues-list">
      {#each data.dues as due}
        {@const paid = due.payments?.some(p => p.status === 'SUCCESS')}
        <div class="due-card" class:due-card--paid={paid}>
          <div class="due-info">
            <div class="due-top">
              <span class="due-name">{due.title}</span>
              {#if paid}
                <span class="paid-badge"><CheckCircle size={12} /> Paid</span>
              {:else}
                <span class="unpaid-badge"><Clock size={12} /> Unpaid</span>
              {/if}
            </div>
            <div class="due-meta">
              <span class="due-amount">{fmtMoney(due.amount)}</span>
              <span>·</span>
              <span>Deadline: {fmtDate(due.deadline)}</span>
              <span>·</span>
              <span>{due.academicYear}</span>
            </div>
          </div>
          {#if !paid}
            <a href="/department-dues/pay?dueId={due.id}" class="pay-btn">
              Pay now <ArrowRight size={14} />
            </a>
          {:else}
            <a href="/department-dues/receipts" class="receipt-link">
              <Receipt size={15} /> Receipt
            </a>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .dues-page { display: flex; flex-direction: column; gap: 1.25rem; }
  .page-header { display: flex; flex-direction: column; gap: 3px; }
  .page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; }
  .page-sub { font-size: 0.813rem; color: var(--text-muted); }
  .empty { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem; color: var(--text-muted); text-align: center; }
  .dues-list { display: flex; flex-direction: column; gap: 10px; }
  .due-card { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1.125rem 1.25rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 1rem; flex-wrap: wrap; }
  .due-card--paid { border-color: color-mix(in srgb, var(--success) 30%, transparent); background: color-mix(in srgb, var(--success) 4%, var(--bg-secondary)); }
  .due-info { display: flex; flex-direction: column; gap: 0.375rem; flex: 1; }
  .due-top { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .due-name { font-size: 0.9375rem; font-weight: 600; color: var(--text-primary); }
  .paid-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 0.688rem; font-weight: 700; padding: 3px 8px; border-radius: 5px; background: color-mix(in srgb, var(--success) 12%, transparent); color: var(--success); border: 1px solid color-mix(in srgb, var(--success) 30%, transparent); }
  .unpaid-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 0.688rem; font-weight: 700; padding: 3px 8px; border-radius: 5px; background: color-mix(in srgb, var(--warning) 12%, transparent); color: var(--warning); border: 1px solid color-mix(in srgb, var(--warning) 30%, transparent); }
  .due-meta { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: var(--text-muted); flex-wrap: wrap; }
  .due-amount { font-weight: 700; color: var(--text-primary); font-size: 0.875rem; }
  .pay-btn { display: inline-flex; align-items: center; gap: 6px; padding: 0.625rem 1.125rem; background: var(--purple-primary); color: white; border-radius: 0.75rem; text-decoration: none; font-size: 0.875rem; font-weight: 700; white-space: nowrap; }
  .pay-btn:hover { background: var(--purple-primary-dark); }
  .receipt-link { display: inline-flex; align-items: center; gap: 6px; padding: 0.625rem 1rem; border: 1.5px solid var(--border); border-radius: 0.75rem; text-decoration: none; font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); white-space: nowrap; }
  .receipt-link:hover { border-color: var(--purple-primary); color: var(--purple-on-light); }
</style>