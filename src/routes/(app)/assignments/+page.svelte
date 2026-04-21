<!-- src/routes/(app)/assignments/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  import { ClipboardList, CheckCircle, Clock, ArrowRight } from 'lucide-svelte';
  let { data }: { data: PageData } = $props();
  function fmtDate(d: string | Date) { return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }); }
</script>

<svelte:head><title>Assignments — Sabify</title></svelte:head>

<div class="page">
  <div class="page-header">
    <h1 class="page-title">Assignments</h1>
    <p class="page-sub">{data.assignments.length} assignments · track your physical submissions</p>
  </div>

  {#if data.assignments.length === 0}
    <div class="empty"><ClipboardList size={32} /><p>No assignments yet in your department.</p></div>
  {:else}
    <div class="asgn-list">
      {#each data.assignments as asgn}
        {@const submitted = asgn.submissions?.[0]?.status === 'SUBMITTED'}
        <a href="/past-questions/{asgn.id}" class="asgn-row">
          <div class="asgn-status-icon">
            {#if submitted}
              <CheckCircle size={20} class="icon-done" />
            {:else}
              <Clock size={20} class="icon-pending" />
            {/if}
          </div>
          <div class="asgn-info">
            <span class="asgn-title">{asgn.title}</span>
            <span class="asgn-meta">{asgn.course.code} · Uploaded {fmtDate(asgn.uploadedAt)}</span>
          </div>
          <span class="asgn-badge" class:asgn-badge--done={submitted}>
            {submitted ? 'Submitted' : 'Pending'}
          </span>
          <ArrowRight size={15} class="asgn-arrow" />
        </a>
      {/each}
    </div>
  {/if}
</div>

<style>
  .page { display: flex; flex-direction: column; gap: 1.25rem; }
  .page-header { display: flex; flex-direction: column; gap: 3px; }
  .page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; }
  .page-sub { font-size: 0.813rem; color: var(--text-muted); }
  .empty { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem; color: var(--text-muted); text-align: center; }
  .empty p { font-size: 0.875rem; }
  .asgn-list { display: flex; flex-direction: column; gap: 8px; }
  .asgn-row { display: flex; align-items: center; gap: 12px; padding: 1rem 1.125rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 0.875rem; text-decoration: none; transition: border-color 0.15s; }
  .asgn-row:hover { border-color: var(--purple-accent); }
  :global(.icon-done) { color: var(--success); }
  :global(.icon-pending) { color: var(--warning); }
  .asgn-info { flex: 1; min-width: 0; }
  .asgn-title { display: block; font-size: 0.875rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .asgn-meta { display: block; font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }
  .asgn-badge { font-size: 0.688rem; font-weight: 700; padding: 3px 8px; border-radius: 5px; background: color-mix(in srgb, var(--warning) 12%, transparent); color: var(--warning); border: 1px solid color-mix(in srgb, var(--warning) 30%, transparent); flex-shrink: 0; }
  .asgn-badge--done { background: color-mix(in srgb, var(--success) 12%, transparent); color: var(--success); border-color: color-mix(in srgb, var(--success) 30%, transparent); }
  :global(.asgn-arrow) { color: var(--text-muted); flex-shrink: 0; }
</style>