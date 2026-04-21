<!-- src/routes/(app)/library/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  import { Upload, FileText, Star, Search, Filter } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();
  let uploading = $state(false);
  let success   = $state(false);
  let error     = $state('');
  let dragOver  = $state(false);
  let fileInput: HTMLInputElement;
  let selectedFile = $state<File | null>(null);

  function onDrop(e: DragEvent) {
    dragOver = false;
    const f = e.dataTransfer?.files[0];
    if (f) selectedFile = f;
  }

  function onFileChange(e: Event) {
    selectedFile = (e.target as HTMLInputElement).files?.[0] ?? null;
  }
</script>

<svelte:head><title>Library — Sabify</title></svelte:head>

<div class="lib-page">

  <div class="lib-header">
    <div>
      <h1 class="page-title">Knowledge Vault</h1>
      <p class="page-sub">Upload handouts, tests, and textbooks to earn Contributor Points.</p>
    </div>
    <div class="contrib-badge">
      <Star size={14} />
      <span>Contributor: +25 pts per upload</span>
    </div>
  </div>

  <!-- Upload form -->
  <div class="upload-card">
    <h2 class="upload-title">Upload a document</h2>
    <form method="POST" action="?/upload" enctype="multipart/form-data"
      use:enhance={() => {
        uploading = true;
        return async ({ result }) => {
          uploading = false;
          if (result.type === 'success') { success = true; selectedFile = null; }
          else error = 'Upload failed. Please try again.';
        };
      }}
    >
      <!-- Drop zone -->
      <div
        class="drop-zone"
        class:drop-zone--over={dragOver}
        role="button"
        tabindex="0"
        ondragover={(e) => { e.preventDefault(); dragOver = true; }}
        ondragleave={() => dragOver = false}
        ondrop={(e) => { e.preventDefault(); onDrop(e); }}
        onclick={() => fileInput.click()}
        onkeydown={(e) => e.key === 'Enter' && fileInput.click()}
      >
        {#if selectedFile}
          <FileText size={28} class="drop-icon-file" />
          <span class="drop-filename">{selectedFile.name}</span>
          <span class="drop-size">{(selectedFile.size / 1024).toFixed(0)} KB</span>
        {:else}
          <Upload size={28} class="drop-icon" />
          <span class="drop-label">Drop a file or click to browse</span>
          <span class="drop-hint">PDFs, images, Word docs · OCR-powered</span>
        {/if}
        <input bind:this={fileInput} type="file" name="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" class="sr-only" onchange={onFileChange} />
      </div>

      <div class="form-row">
        <div class="form-field">
          <label class="form-label">Document title</label>
          <input type="text" name="title" class="form-input" placeholder="e.g. CPE 411 Mid-Semester Test 2024" required />
        </div>
        <div class="form-field">
          <label class="form-label">Course</label>
          <select name="courseId" class="form-input" required>
            <option value="">Select course</option>
            {#each data.courses as course}
              <option value={course.id}>{course.code} — {course.title}</option>
            {/each}
          </select>
        </div>
        <div class="form-field">
          <label class="form-label">Category</label>
          <select name="category" class="form-input" required>
            <option value="">Select type</option>
            <option value="TEST">Past Test [T]</option>
            <option value="ASSIGNMENT">Assignment [A]</option>
            <option value="TEXTBOOK">Textbook / Handout [B]</option>
          </select>
        </div>
      </div>

      {#if error}
        <div class="upload-error">{error}</div>
      {/if}
      {#if success}
        <div class="upload-success">✓ Uploaded successfully! +25 contributor points earned.</div>
      {/if}

      <button type="submit" class="upload-submit" disabled={uploading || !selectedFile}>
        {#if uploading}Uploading…{:else}<Upload size={15} /> Upload to Vault{/if}
      </button>
    </form>
  </div>

  <!-- Recent uploads from department -->
  <div class="lib-recent">
    <h2 class="section-title">Recent in {data.department?.name ?? 'your department'}</h2>
    {#if data.docs.length === 0}
      <div class="empty">No documents yet — be the first to upload!</div>
    {:else}
      <div class="lib-grid">
        {#each data.docs as doc}
          <a href="/past-questions/{doc.id}" class="lib-card">
            <span class="lib-chip lib-chip-{doc.category.toLowerCase()}">{doc.category.charAt(0)}</span>
            <div class="lib-info">
              <span class="lib-name">{doc.title}</span>
              <span class="lib-meta">{doc.course.code} · {doc.uploader.name}</span>
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </div>

</div>

<style>
  .lib-page { display: flex; flex-direction: column; gap: 1.5rem; }
  .lib-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
  .page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; }
  .page-sub { font-size: 0.813rem; color: var(--text-muted); margin-top: 2px; }
  .contrib-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--purple-light); border: 1px solid var(--purple-light-border); border-radius: 999px; font-size: 0.75rem; font-weight: 600; color: var(--purple-on-light); }

  .upload-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 1.25rem; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.125rem; }
  .upload-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); }

  .drop-zone { border: 2px dashed var(--border); border-radius: 0.875rem; padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; cursor: pointer; transition: all 0.15s; text-align: center; }
  .drop-zone:hover, .drop-zone--over { border-color: var(--purple-primary); background: var(--purple-light); }
  :global(.drop-icon) { color: var(--text-muted); }
  :global(.drop-icon-file) { color: var(--purple-primary); }
  .drop-label { font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); }
  .drop-hint { font-size: 0.75rem; color: var(--text-muted); }
  .drop-filename { font-size: 0.875rem; font-weight: 600; color: var(--purple-primary); }
  .drop-size { font-size: 0.75rem; color: var(--text-muted); }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }

  .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.875rem; }
  .form-field { display: flex; flex-direction: column; gap: 0.375rem; }
  .form-label { font-size: 0.813rem; font-weight: 600; color: var(--text-secondary); }
  .form-input { padding: 0.625rem 0.875rem; border: 1.5px solid var(--border); border-radius: 0.625rem; font-size: 0.875rem; background: var(--bg-primary); color: var(--text-primary); outline: none; font-family: inherit; }
  .form-input:focus { border-color: var(--purple-primary); }

  .upload-error { padding: 0.75rem 1rem; background: color-mix(in srgb, var(--error) 10%, transparent); border: 1px solid color-mix(in srgb, var(--error) 30%, transparent); border-radius: 0.75rem; color: var(--error); font-size: 0.813rem; }
  .upload-success { padding: 0.75rem 1rem; background: color-mix(in srgb, var(--success) 10%, transparent); border: 1px solid color-mix(in srgb, var(--success) 30%, transparent); border-radius: 0.75rem; color: var(--success); font-size: 0.813rem; }

  .upload-submit { display: inline-flex; align-items: center; gap: 7px; padding: 0.75rem 1.5rem; background: var(--purple-primary); color: white; border: none; border-radius: 0.75rem; font-size: 0.875rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.15s; align-self: flex-start; }
  .upload-submit:hover:not(:disabled) { background: var(--purple-primary-dark); }
  .upload-submit:disabled { opacity: 0.6; cursor: not-allowed; }

  .lib-recent { display: flex; flex-direction: column; gap: 0.875rem; }
  .section-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
  .empty { font-size: 0.875rem; color: var(--text-muted); padding: 1.5rem 0; text-align: center; }
  .lib-grid { display: flex; flex-direction: column; gap: 6px; }
  .lib-card { display: flex; align-items: center; gap: 10px; padding: 0.75rem 1rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 0.75rem; text-decoration: none; transition: border-color 0.15s; }
  .lib-card:hover { border-color: var(--purple-accent); }
  .lib-chip { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; }
  .lib-chip-test { background: var(--purple-light); color: var(--purple-on-light); }
  .lib-chip-assignment { background: #fefce8; color: #854d0e; }
  .lib-chip-textbook { background: #eff6ff; color: #1d4ed8; }
  .lib-info { flex: 1; min-width: 0; }
  .lib-name { display: block; font-size: 0.875rem; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .lib-meta { display: block; font-size: 0.688rem; color: var(--text-muted); margin-top: 1px; }
</style>