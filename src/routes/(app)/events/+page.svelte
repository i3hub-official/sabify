<!-- src/routes/(app)/events/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  import { Calendar, MapPin, Users, ArrowRight, Plus } from 'lucide-svelte';
  let { data }: { data: PageData } = $props();

  const catColor: Record<string, string> = { CAREER: 'chip-career', ACADEMIC: 'chip-acad', SOCIAL: 'chip-social' };
  const catLabel: Record<string, string> = { CAREER: 'Career', ACADEMIC: 'Academic', SOCIAL: 'Social' };

  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
</script>

<svelte:head><title>Events — Sabify</title></svelte:head>

<div class="events-page">
  <div class="page-header">
    <div>
      <h1 class="page-title">Events</h1>
      <p class="page-sub">{data.events.length} upcoming events on your campus</p>
    </div>
    <a href="/events/create" class="create-btn"><Plus size={15} /> Create event</a>
  </div>

  <div class="events-list">
    {#each data.events as ev}
      <a href="/events/{ev.id}" class="event-card">
        <div class="event-date-col">
          <span class="event-day">{new Date(ev.date).getDate()}</span>
          <span class="event-month">{new Date(ev.date).toLocaleString('en-NG', { month: 'short' })}</span>
        </div>
        <div class="event-body">
          <div class="event-top">
            <span class="event-chip {catColor[ev.category]}">{catLabel[ev.category]}</span>
          </div>
          <div class="event-title">{ev.title}</div>
          <div class="event-meta">
            <span><MapPin size={11} /> {ev.venue}</span>
            <span>·</span>
            <span>{ev.organizer}</span>
            {#if ev.rsvp > 0}
              <span>·</span>
              <span><Users size={11} /> {ev.rsvp}</span>
            {/if}
          </div>
        </div>
        <ArrowRight size={16} class="event-arrow" />
      </a>
    {/each}
  </div>
</div>

<style>
  .events-page { display: flex; flex-direction: column; gap: 1.25rem; }
  .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
  .page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; }
  .page-sub { font-size: 0.813rem; color: var(--text-muted); margin-top: 2px; }
  .create-btn { display: inline-flex; align-items: center; gap: 6px; padding: 0.625rem 1.125rem; background: var(--purple-primary); color: white; border-radius: 0.75rem; text-decoration: none; font-size: 0.875rem; font-weight: 600; white-space: nowrap; }
  .create-btn:hover { background: var(--purple-primary-dark); }
  .events-list { display: flex; flex-direction: column; gap: 10px; }
  .event-card { display: flex; align-items: center; gap: 1rem; padding: 1.125rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 1rem; text-decoration: none; transition: border-color 0.15s; }
  .event-card:hover { border-color: var(--purple-accent); }
  .event-date-col { display: flex; flex-direction: column; align-items: center; width: 44px; flex-shrink: 0; }
  .event-day { font-size: 1.5rem; font-weight: 800; color: var(--purple-primary); letter-spacing: -0.03em; line-height: 1; }
  .event-month { font-size: 0.688rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
  .event-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.375rem; }
  .event-top { display: flex; gap: 6px; }
  .event-chip { font-size: 0.625rem; font-weight: 700; padding: 2px 7px; border-radius: 4px; }
  .chip-career { background: #eff6ff; color: #1d4ed8; }
  .chip-acad   { background: var(--purple-light); color: var(--purple-on-light); }
  .chip-social { background: #f0fdf4; color: #15803d; }
  :global(html.dark) .chip-career { background: #0c1a2e; color: #60a5fa; }
  :global(html.dark) .chip-social { background: #052e16; color: #86efac; }
  .event-title { font-size: 0.9375rem; font-weight: 600; color: var(--text-primary); line-height: 1.3; }
  .event-meta { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: var(--text-muted); flex-wrap: wrap; }
  :global(.event-arrow) { color: var(--text-muted); flex-shrink: 0; }
</style>