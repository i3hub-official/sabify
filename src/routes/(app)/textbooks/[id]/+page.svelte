<!-- src/routes/(app)/textbooks/[id]/+page.svelte -->
<script lang="ts">
  import { ArrowLeft, Download, BookMarked } from 'lucide-svelte';
  // In real app: load from +page.server.ts
  const book = {
    id: 1, title: 'Sedra & Smith — Microelectronic Circuits 7th Ed.',
    course: { code: 'CPE 303', title: 'Electronic Circuits' },
    fileUrl: '#', downloadCount: 342, isVerified: true, fileSize: 24800000,
    mimeType: 'application/pdf',
    uploader: { name: 'Admin' },
    uploadedAt: '2024-09-01T00:00:00Z',
  };
</script>

<svelte:head><title>{book.title} — Sabify</title></svelte:head>

<div class="tb-detail">
  <a href="/textbooks" class="back-btn"><ArrowLeft size={16} /> Textbooks</a>

  <div class="tb-hero">
    <div class="tb-hero-cover"><BookMarked size={36} /></div>
    <div class="tb-hero-info">
      {#if book.isVerified}<span class="verified-tag">✓ Verified</span>{/if}
      <h1 class="tb-hero-title">{book.title}</h1>
      <div class="tb-hero-meta">
        <span>{book.course.code} · {book.course.title}</span>
        <span>·</span>
        <span>Uploaded by {book.uploader.name}</span>
        <span>·</span>
        <span>{(book.fileSize / 1024 / 1024).toFixed(1)} MB</span>
        <span>·</span>
        <span><Download size={11} /> {book.downloadCount} downloads</span>
      </div>
      <a href={book.fileUrl} download class="tb-download-btn">
        <Download size={15} /> Download textbook
      </a>
    </div>
  </div>

  <div class="pdf-embed">
    {#if book.mimeType === 'application/pdf'}
      <iframe src={book.fileUrl} title={book.title} class="pdf-frame"></iframe>
    {:else}
      <div class="no-preview">
        <BookMarked size={36} />
        <p>Preview not available. Download the file to read it.</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .tb-detail { display: flex; flex-direction: column; gap: 1.25rem; }
  .back-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 0.875rem; color: var(--text-secondary); text-decoration: none; padding: 6px 12px; border: 1px solid var(--border); border-radius: 8px; width: fit-content; }
  .back-btn:hover { border-color: var(--purple-primary); color: var(--purple-on-light); }
  .tb-hero { display: flex; align-items: flex-start; gap: 1.25rem; padding: 1.5rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 1.25rem; }
  .tb-hero-cover { width: 72px; height: 72px; border-radius: 14px; background: var(--purple-light); display: flex; align-items: center; justify-content: center; color: var(--purple-on-light); flex-shrink: 0; }
  .tb-hero-info { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
  .verified-tag { display: inline-block; font-size: 0.688rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: color-mix(in srgb, var(--success) 12%, transparent); color: var(--success); border: 1px solid color-mix(in srgb, var(--success) 25%, transparent); width: fit-content; }
  .tb-hero-title { font-size: 1.25rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; line-height: 1.3; }
  .tb-hero-meta { display: flex; align-items: center; gap: 7px; font-size: 0.75rem; color: var(--text-muted); flex-wrap: wrap; }
  .tb-download-btn { display: inline-flex; align-items: center; gap: 6px; padding: 0.625rem 1.125rem; background: var(--purple-primary); color: white; border-radius: 0.75rem; text-decoration: none; font-size: 0.875rem; font-weight: 700; width: fit-content; margin-top: 4px; }
  .tb-download-btn:hover { background: var(--purple-primary-dark); }
  .pdf-embed { border: 1px solid var(--border); border-radius: 1rem; overflow: hidden; }
  .pdf-frame { width: 100%; height: 70vh; border: none; display: block; }
  .no-preview { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 3rem; color: var(--text-muted); }
  .no-preview p { font-size: 0.875rem; }
</style>