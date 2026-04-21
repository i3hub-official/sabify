<!-- src/routes/(app)/textbooks/+page.svelte -->
<script lang="ts">
  import { BookMarked, Search, Download, ArrowRight } from 'lucide-svelte';
  // Load via +page.server.ts in real app
  const textbooks = [
    { id: 1, title: 'Sedra & Smith — Microelectronic Circuits 7th Ed.', course: { code: 'CPE 303', title: 'Electronic Circuits' }, fileUrl: '#', downloadCount: 342, isVerified: true },
    { id: 2, title: 'Hayt — Engineering Electromagnetics 8th Ed.',       course: { code: 'CPE 401', title: 'Electromagnetics' },   fileUrl: '#', downloadCount: 218, isVerified: true },
    { id: 3, title: 'Proakis & Manolakis — Digital Signal Processing',   course: { code: 'CPE 411', title: 'Digital Signal Processing' }, fileUrl: '#', downloadCount: 189, isVerified: false },
    { id: 4, title: 'Tanenbaum — Computer Networks 5th Ed.',             course: { code: 'CPE 403', title: 'Communication Systems' }, fileUrl: '#', downloadCount: 156, isVerified: true },
  ];
  let search = $state('');
  const filtered = $derived(
    search ? textbooks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.course.code.toLowerCase().includes(search.toLowerCase()))
           : textbooks
  );
</script>

<svelte:head><title>Textbooks — Sabify</title></svelte:head>

<div class="tb-page">
  <div class="page-header">
    <h1 class="page-title">Textbooks</h1>
    <p class="page-sub">{textbooks.length} textbooks & handouts in your department</p>
  </div>

  <div class="search-row">
    <div class="search-wrap">
      <Search size={15} class="search-icon" />
      <input type="text" bind:value={search} placeholder="Search textbooks…" class="search-input" />
    </div>
  </div>

  <div class="tb-list">
    {#each filtered as book}
      <a href="/textbooks/{book.id}" class="tb-row">
        <div class="tb-cover">
          <BookMarked size={22} class="tb-cover-icon" />
        </div>
        <div class="tb-info">
          <span class="tb-title">{book.title}</span>
          <span class="tb-meta">{book.course.code} · {book.course.title}</span>
          <div class="tb-tags">
            {#if book.isVerified}<span class="tag-verified">✓ Verified</span>{/if}
            <span class="tag-dl"><Download size={11} /> {book.downloadCount}</span>
          </div>
        </div>
        <ArrowRight size={15} class="tb-arrow" />
      </a>
    {/each}
    {#if filtered.length === 0}
      <div class="empty">No textbooks match your search.</div>
    {/if}
  </div>
</div>

<style>
  .tb-page { display: flex; flex-direction: column; gap: 1.25rem; }
  .page-header { display: flex; flex-direction: column; gap: 3px; }
  .page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; }
  .page-sub { font-size: 0.813rem; color: var(--text-muted); }
  .search-row { display: flex; }
  .search-wrap { position: relative; width: 100%; max-width: 400px; }
  :global(.search-icon) { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
  .search-input { width: 100%; padding: 0.625rem 0.75rem 0.625rem 2.25rem; border: 1.5px solid var(--border); border-radius: 0.625rem; font-size: 0.875rem; background: var(--bg-primary); color: var(--text-primary); outline: none; font-family: inherit; }
  .search-input:focus { border-color: var(--purple-primary); }
  .tb-list { display: flex; flex-direction: column; gap: 8px; }
  .tb-row { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.125rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 0.875rem; text-decoration: none; transition: border-color 0.15s; }
  .tb-row:hover { border-color: var(--purple-accent); }
  .tb-cover { width: 48px; height: 48px; border-radius: 10px; background: var(--purple-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  :global(.tb-cover-icon) { color: var(--purple-on-light); }
  .tb-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
  .tb-title { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tb-meta { font-size: 0.75rem; color: var(--text-muted); }
  .tb-tags { display: flex; align-items: center; gap: 7px; margin-top: 2px; }
  .tag-verified { font-size: 0.625rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: color-mix(in srgb, var(--success) 12%, transparent); color: var(--success); border: 1px solid color-mix(in srgb, var(--success) 25%, transparent); }
  .tag-dl { display: flex; align-items: center; gap: 3px; font-size: 0.625rem; color: var(--text-muted); }
  :global(.tb-arrow) { color: var(--text-muted); flex-shrink: 0; }
  .empty { text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.875rem; }
</style>