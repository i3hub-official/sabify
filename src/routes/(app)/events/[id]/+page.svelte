<!-- src/routes/(app)/events/[id]/+page.svelte -->
<script lang="ts">
  import { ArrowLeft, MapPin, Users, Calendar, Share2 } from 'lucide-svelte';
  // In real app, load via +page.server.ts from events table
  const event = {
    title: 'CEET Faculty Career Fair 2025',
    date: '2025-05-12T10:00:00Z',
    venue: 'CEET Auditorium',
    organizer: 'CEET SUG',
    category: 'CAREER',
    description: 'Connect with leading engineering firms. Bring your CV and dress professionally. Open to all engineering students across all levels.',
    rsvp: 124,
  };
</script>

<svelte:head><title>{event.title} — Sabify</title></svelte:head>

<div class="event-detail">
  <a href="/events" class="back-btn"><ArrowLeft size={16} /> Events</a>

  <div class="event-hero">
    <span class="cat-chip">{event.category}</span>
    <h1 class="event-title">{event.title}</h1>
    <div class="event-meta">
      <div class="meta-item"><Calendar size={14} />{new Date(event.date).toLocaleString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
      <div class="meta-item"><MapPin size={14} />{event.venue}</div>
      <div class="meta-item"><Users size={14} />{event.rsvp} attending</div>
    </div>
  </div>

  <div class="event-desc">
    <h2 class="desc-title">About this event</h2>
    <p>{event.description}</p>
  </div>

  <div class="event-actions">
    <button class="rsvp-btn">Mark as attending</button>
    <button class="share-btn"><Share2 size={15} /> Share</button>
  </div>
</div>

<style>
  .event-detail { display: flex; flex-direction: column; gap: 1.5rem; max-width: 720px; }
  .back-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 0.875rem; color: var(--text-secondary); text-decoration: none; padding: 6px 12px; border: 1px solid var(--border); border-radius: 8px; width: fit-content; }
  .back-btn:hover { border-color: var(--purple-primary); color: var(--purple-on-light); }
  .event-hero { display: flex; flex-direction: column; gap: 0.75rem; }
  .cat-chip { display: inline-block; font-size: 0.688rem; font-weight: 700; padding: 3px 10px; border-radius: 5px; background: var(--purple-light); color: var(--purple-on-light); width: fit-content; }
  .event-title { font-size: 1.75rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; line-height: 1.2; }
  .event-meta { display: flex; flex-direction: column; gap: 8px; }
  .meta-item { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: var(--text-secondary); }
  .event-desc { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 1rem; padding: 1.25rem; }
  .desc-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.625rem; }
  .event-desc p { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.7; }
  .event-actions { display: flex; gap: 10px; }
  .rsvp-btn { padding: 0.75rem 1.5rem; background: var(--purple-primary); color: white; border: none; border-radius: 0.75rem; font-size: 0.875rem; font-weight: 700; cursor: pointer; font-family: inherit; }
  .rsvp-btn:hover { background: var(--purple-primary-dark); }
  .share-btn { display: inline-flex; align-items: center; gap: 6px; padding: 0.75rem 1.25rem; background: var(--bg-secondary); border: 1.5px solid var(--border); border-radius: 0.75rem; font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); cursor: pointer; font-family: inherit; }
  .share-btn:hover { border-color: var(--purple-primary); color: var(--purple-on-light); }
</style>