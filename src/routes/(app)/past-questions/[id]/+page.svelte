<!-- src/routes/(app)/past-questions/[id]/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  import { Pin, Download, CheckCircle, ArrowLeft, BookOpen, FileText } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();
  let pinned    = $state(data.pinned);
  let submitted = $state(data.submission?.status === 'SUBMITTED');
  let showNote  = $state(false);
  let note      = $state('');

  const catLabel: Record<string, string> = { TEST: 'Past Test', ASSIGNMENT: 'Assignment', TEXTBOOK: 'Textbook' };
</script>

<svelte:head><title>{data.doc.title} — Sabify</title></svelte:head>

<div class="viewer-page">

  <div class="viewer-header">
    <a href="/past-questions" class="back-btn"><ArrowLeft size={16} /> Back</a>
    <div class="viewer-actions">
      <form method="POST" action="?/pin" use:enhance={() => () => { pinned = !pinned; }}>
        <button type="submit" class="action-btn" class:action-btn--active={pinned}>
          <Pin size={15} /> {pinned ? 'Pinned' : 'Pin offline'}
        </button>
      </form>
      <a href={data.doc.fileUrl} download class="action-btn action-btn--primary">
        <Download size={15} /> Download
      </a>
    </div>
  </div>

  <div class="viewer-meta">
    <span class="cat-chip cat-{data.doc.category.toLowerCase()}">{catLabel[data.doc.category]}</span>
    <h1 class="viewer-title">{data.doc.title}</h1>
    <div class="meta-row">
      <span>{data.doc.course.code} · {data.doc.course.title}</span>
      <span>·</span>
      <span>{data.doc.course.department.name}</span>
      <span>·</span>
      <span>Uploaded by {data.doc.uploader.name}</span>
      {#if data.doc.isVerified}
        <span class="verified">✓ Verified</span>
      {/if}
    </div>
  </div>

  <!-- PDF Embed -->
  <div class="pdf-wrap">
    {#if data.doc.mimeType === 'application/pdf'}
      <iframe src={data.doc.fileUrl} title={data.doc.title} class="pdf-frame"></iframe>
    {:else}
      <div class="no-preview">
        <FileText size={40} />
        <p>Preview not available for this file type.</p>
        <a href={data.doc.fileUrl} download class="action-btn action-btn--primary">
          <Download size={15} /> Download file
        </a>
      </div>
    {/if}
  </div>

  <!-- OCR text if available -->
  {#if data.doc.ocrText}
    <details class="ocr-section">
      <summary class="ocr-toggle"><BookOpen size={14} /> Extracted text (searchable)</summary>
      <pre class="ocr-text">{data.doc.ocrText}</pre>
    </details>
  {/if}

  <!-- Submission logbook (assignments only) -->
  {#if data.doc.category === 'ASSIGNMENT'}
    <div class="submission-section">
      <h2 class="sub-title">Submission logbook</h2>
      {#if submitted}
        <div class="sub-done">
          <CheckCircle size={18} /> Marked as submitted
          {#if data.submission?.note}
            <span class="sub-note">"{data.submission.note}"</span>
          {/if}
        </div>
      {:else}
        <p class="sub-hint">Mark this assignment as physically submitted to keep a timestamped record.</p>
        {#if showNote}
          <form method="POST" action="?/submit" use:enhance={() => () => { submitted = true; showNote = false; }}>
            <div class="sub-form">
              <input type="text" name="note" bind:value={note} placeholder="Optional: e.g. 'Submitted to Dr. Eze, 3rd floor'" class="sub-input" />
              <button type="submit" class="sub-btn">Mark as submitted</button>
            </div>
          </form>
        {:else}
          <button class="action-btn" onclick={() => showNote = true}><CheckCircle size={15} /> Mark as submitted</button>
        {/if}
      {/if}
    </div>
  {/if}

</div>

<style>
  .viewer-page { display: flex; flex-direction: column; gap: 1.25rem; }

  .viewer-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
  .back-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 0.875rem; color: var(--text-secondary); text-decoration: none; padding: 6px 12px; border: 1px solid var(--border); border-radius: 8px; }
  .back-btn:hover { border-color: var(--purple-primary); color: var(--purple-on-light); }
  .viewer-actions { display: flex; gap: 8px; }

  .action-btn { display: inline-flex; align-items: center; gap: 6px; padding: 0.625rem 1rem; border: 1.5px solid var(--border); border-radius: 0.625rem; font-size: 0.813rem; font-weight: 600; color: var(--text-secondary); background: var(--bg-secondary); cursor: pointer; text-decoration: none; font-family: inherit; transition: all 0.15s; }
  .action-btn:hover { border-color: var(--purple-primary); color: var(--purple-on-light); }
  .action-btn--active { background: var(--purple-light); border-color: var(--purple-primary); color: var(--purple-on-light); }
  .action-btn--primary { background: var(--purple-primary); color: white; border-color: var(--purple-primary); }
  .action-btn--primary:hover { background: var(--purple-primary-dark); }

  .viewer-meta { display: flex; flex-direction: column; gap: 0.5rem; }
  .cat-chip { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 5px; font-size: 0.688rem; font-weight: 700; width: fit-content; }
  .cat-test { background: var(--purple-light); color: var(--purple-on-light); }
  .cat-assignment { background: #fefce8; color: #854d0e; }
  .cat-textbook { background: #eff6ff; color: #1d4ed8; }
  .viewer-title { font-size: 1.375rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; line-height: 1.3; }
  .meta-row { display: flex; align-items: center; gap: 8px; font-size: 0.813rem; color: var(--text-muted); flex-wrap: wrap; }
  .verified { color: var(--success); font-weight: 600; font-size: 0.75rem; }

  .pdf-wrap { border: 1px solid var(--border); border-radius: 1rem; overflow: hidden; }
  .pdf-frame { width: 100%; height: 70vh; border: none; display: block; }
  .no-preview { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 3rem; color: var(--text-muted); }
  .no-preview p { font-size: 0.875rem; }

  .ocr-section { border: 1px solid var(--border); border-radius: 1rem; overflow: hidden; }
  .ocr-toggle { padding: 0.875rem 1.125rem; cursor: pointer; display: flex; align-items: center; gap: 7px; font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); list-style: none; background: var(--bg-secondary); }
  .ocr-toggle:hover { color: var(--text-primary); }
  .ocr-text { padding: 1rem 1.125rem; font-size: 0.813rem; color: var(--text-secondary); line-height: 1.7; white-space: pre-wrap; font-family: 'DM Mono', monospace; background: var(--bg-primary); max-height: 300px; overflow-y: auto; }

  .submission-section { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 1rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; }
  .sub-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
  .sub-done { display: flex; align-items: center; gap: 8px; color: var(--success); font-weight: 600; font-size: 0.875rem; flex-wrap: wrap; }
  .sub-note { color: var(--text-muted); font-style: italic; font-weight: 400; font-size: 0.813rem; }
  .sub-hint { font-size: 0.813rem; color: var(--text-muted); line-height: 1.5; }
  .sub-form { display: flex; gap: 8px; flex-wrap: wrap; }
  .sub-input { flex: 1; min-width: 200px; padding: 0.625rem 0.875rem; border: 1.5px solid var(--border); border-radius: 0.625rem; font-size: 0.875rem; background: var(--bg-primary); color: var(--text-primary); outline: none; font-family: inherit; }
  .sub-input:focus { border-color: var(--purple-primary); }
  .sub-btn { padding: 0.625rem 1.125rem; background: var(--purple-primary); color: white; border: none; border-radius: 0.625rem; font-size: 0.875rem; font-weight: 600; cursor: pointer; font-family: inherit; }
  .sub-btn:hover { background: var(--purple-primary-dark); }
</style>