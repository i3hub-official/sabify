<!-- src/routes/(app)/past-questions/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { PageData } from './$types';
  import { Search, Filter, Upload, Download, Pin, Eye, ArrowRight } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();

  let search   = $state(data.search);
  let category = $state(data.category);
  let courseId = $state(data.courseId);

  function applyFilters() {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (courseId) params.set('course', courseId);
    if (search)   params.set('q', search);
    goto(`?${params.toString()}`);
  }

  function onSearchKey(e: KeyboardEvent) {
    if (e.key === 'Enter') applyFilters();
  }

  const categoryLabel: Record<string, string> = { TEST: 'Past Test', ASSIGNMENT: 'Assignment', TEXTBOOK: 'Textbook' };
  const categoryColor: Record<string, string>  = { TEST: 'chip-t', ASSIGNMENT: 'chip-a', TEXTBOOK: 'chip-b' };

  function fmtDate(d: string | Date) {
    return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  }
</script>

<svelte:head><title>Past Questions — Sabify</title></svelte:head>

<div class="pq-page">

  <div class="pq-header">
    <div>
      <h1 class="pq-title">Past Questions</h1>
      <p class="pq-sub">{data.department?.name ?? 'All departments'} · {data.documents.length} documents</p>
    </div>
    <a href="/library" class="upload-btn"><Upload size={15} /> Upload</a>
  </div>

  <!-- Filters -->
  <div class="pq-filters">
    <div class="search-wrap">
      <Search size={15} class="search-icon" />
      <input
        type="text"
        bind:value={search}
        onkeydown={onSearchKey}
        placeholder="Search documents, topics…"
        class="search-input"
      />
    </div>

    <select class="filter-sel" bind:value={category} onchange={applyFilters}>
      <option value="TEST">Past Tests</option>
      <option value="ASSIGNMENT">Assignments</option>
      <option value="TEXTBOOK">Textbooks</option>
    </select>

    <select class="filter-sel" bind:value={courseId} onchange={applyFilters}>
      <option value="">All courses</option>
      {#each data.courses as course}
        <option value={course.id}>{course.code} — {course.title}</option>
      {/each}
    </select>

    <button class="filter-btn" onclick={applyFilters}><Filter size={14} /> Apply</button>
  </div>

  <!-- Results -->
  {#if data.documents.length === 0}
    <div class="empty">
      <p>No documents found. Try a different filter or upload one!</p>
      <a href="/library" class="empty-cta">Upload document</a>
    </div>
  {:else}
    <div class="doc-grid">
      {#each data.documents as doc}
        <a href="/past-questions/{doc.id}" class="doc-card">
          <div class="doc-card-top">
            <span class="doc-chip {categoryColor[doc.category]}">{doc.category.charAt(0)}</span>
            {#if doc.isVerified}
              <span class="verified-badge">✓ Verified</span>
            {/if}
          </div>
          <div class="doc-title">{doc.title}</div>
          <div class="doc-course">{doc.course.code} · {doc.course.title}</div>
          <div class="doc-footer">
            <span class="doc-date">{fmtDate(doc.uploadedAt)}</span>
            <span class="doc-downloads"><Download size={11} /> {doc.downloadCount}</span>
          </div>
        </a>
      {/each}
    </div>
  {/if}

</div>

<style>
  .pq-page { display: flex; flex-direction: column; gap: 1.25rem; }

  .pq-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
  .pq-title { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; }
  .pq-sub { font-size: 0.813rem; color: var(--text-muted); margin-top: 2px; }
  .upload-btn { display: inline-flex; align-items: center; gap: 6px; padding: 0.625rem 1.125rem; background: var(--purple-primary); color: white; border-radius: 0.75rem; text-decoration: none; font-size: 0.875rem; font-weight: 600; white-space: nowrap; }
  .upload-btn:hover { background: var(--purple-primary-dark); }

  .pq-filters { display: flex; gap: 0.625rem; flex-wrap: wrap; }
  .search-wrap { position: relative; flex: 1; min-width: 200px; }
  :global(.search-icon) { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
  .search-input { width: 100%; padding: 0.625rem 0.75rem 0.625rem 2.25rem; border: 1.5px solid var(--border); border-radius: 0.625rem; font-size: 0.875rem; background: var(--bg-primary); color: var(--text-primary); outline: none; font-family: inherit; }
  .search-input:focus { border-color: var(--purple-primary); }
  .filter-sel { padding: 0.625rem 0.75rem; border: 1.5px solid var(--border); border-radius: 0.625rem; font-size: 0.875rem; background: var(--bg-primary); color: var(--text-primary); outline: none; font-family: inherit; cursor: pointer; }
  .filter-sel:focus { border-color: var(--purple-primary); }
  .filter-btn { display: inline-flex; align-items: center; gap: 6px; padding: 0.625rem 1rem; background: var(--bg-secondary); border: 1.5px solid var(--border); border-radius: 0.625rem; font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); cursor: pointer; font-family: inherit; }
  .filter-btn:hover { border-color: var(--purple-primary); color: var(--purple-on-light); }

  .empty { text-align: center; padding: 3rem 1rem; color: var(--text-muted); }
  .empty p { font-size: 0.875rem; margin-bottom: 1rem; }
  .empty-cta { display: inline-flex; padding: 0.625rem 1.25rem; background: var(--purple-primary); color: white; border-radius: 0.75rem; text-decoration: none; font-size: 0.875rem; font-weight: 600; }

  .doc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0.875rem; }
  .doc-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 1rem; padding: 1.125rem; text-decoration: none; display: flex; flex-direction: column; gap: 0.5rem; transition: border-color 0.15s, transform 0.15s; }
  .doc-card:hover { border-color: var(--purple-accent); transform: translateY(-2px); }
  .doc-card-top { display: flex; align-items: center; justify-content: space-between; }
  .doc-chip { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; }
  .chip-t { background: var(--purple-light); color: var(--purple-on-light); }
  .chip-a { background: #fefce8; color: #854d0e; }
  .chip-b { background: #eff6ff; color: #1d4ed8; }
  .verified-badge { font-size: 0.625rem; background: color-mix(in srgb, var(--success) 12%, transparent); color: var(--success); border: 1px solid color-mix(in srgb, var(--success) 30%, transparent); padding: 2px 6px; border-radius: 4px; font-weight: 600; }
  .doc-title { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); line-height: 1.4; flex: 1; }
  .doc-course { font-size: 0.75rem; color: var(--purple-primary); font-weight: 500; }
  .doc-footer { display: flex; align-items: center; justify-content: space-between; }
  .doc-date { font-size: 0.688rem; color: var(--text-muted); }
  .doc-downloads { display: flex; align-items: center; gap: 3px; font-size: 0.688rem; color: var(--text-muted); }
</style>