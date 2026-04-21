<!-- src/routes/(app)/library/[slug]/+page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { ArrowLeft, FileQuestion, BookMarked, ClipboardList } from 'lucide-svelte';
  // In real app, load from +page.server.ts using slug to find department/category
  const slug = $derived($page.params.slug);
</script>

<svelte:head><title>Library — Sabify</title></svelte:head>

<div class="slug-page">
  <a href="/library" class="back-btn"><ArrowLeft size={16} /> Library</a>
  <h1 class="page-title">Browse: {slug.replace(/-/g, ' ')}</h1>

  <div class="slug-nav">
    <a href="/past-questions?category=TEST"       class="slug-card">
      <FileQuestion size={24} class="slug-icon" />
      <div>
        <strong>Past Tests</strong>
        <span>Filter by course and year</span>
      </div>
    </a>
    <a href="/past-questions?category=ASSIGNMENT"  class="slug-card">
      <ClipboardList size={24} class="slug-icon" />
      <div>
        <strong>Assignments</strong>
        <span>With submission tracking</span>
      </div>
    </a>
    <a href="/textbooks" class="slug-card">
      <BookMarked size={24} class="slug-icon" />
      <div>
        <strong>Textbooks</strong>
        <span>Verified departmental texts</span>
      </div>
    </a>
  </div>
</div>

<style>
  .slug-page { display: flex; flex-direction: column; gap: 1.25rem; }
  .back-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 0.875rem; color: var(--text-secondary); text-decoration: none; padding: 6px 12px; border: 1px solid var(--border); border-radius: 8px; width: fit-content; }
  .back-btn:hover { border-color: var(--purple-primary); color: var(--purple-on-light); }
  .page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; text-transform: capitalize; }
  .slug-nav { display: flex; flex-direction: column; gap: 10px; }
  .slug-card { display: flex; align-items: center; gap: 1rem; padding: 1.125rem 1.25rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 1rem; text-decoration: none; transition: border-color 0.15s; }
  .slug-card:hover { border-color: var(--purple-accent); }
  :global(.slug-icon) { color: var(--purple-primary); flex-shrink: 0; }
  .slug-card strong { display: block; font-size: 0.9375rem; font-weight: 700; color: var(--text-primary); }
  .slug-card span { font-size: 0.813rem; color: var(--text-muted); }
</style>