<!-- src/routes/(app)/events/create/+page.svelte -->
<script lang="ts">
  import { ArrowLeft } from 'lucide-svelte';
  let title = $state(''); let venue = $state(''); let date = $state('');
  let category = $state('ACADEMIC'); let description = $state('');
  let submitting = $state(false); let success = $state(false);

  async function submit(e: Event) {
    e.preventDefault();
    submitting = true;
    await new Promise(r => setTimeout(r, 800)); // TODO: POST to API
    success = true; submitting = false;
  }
</script>

<svelte:head><title>Create Event — Sabify</title></svelte:head>

<div class="create-page">
  <a href="/events" class="back-btn"><ArrowLeft size={16} /> Events</a>
  <h1 class="page-title">Create event</h1>

  {#if success}
    <div class="success-msg">✓ Event created successfully!</div>
  {/if}

  <form class="create-form" onsubmit={submit}>
    <div class="form-field">
      <label class="form-label">Event title *</label>
      <input type="text" bind:value={title} class="form-input" placeholder="e.g. CEET Career Fair 2025" required />
    </div>
    <div class="form-row">
      <div class="form-field">
        <label class="form-label">Date & time *</label>
        <input type="datetime-local" bind:value={date} class="form-input" required />
      </div>
      <div class="form-field">
        <label class="form-label">Category *</label>
        <select bind:value={category} class="form-input">
          <option value="ACADEMIC">Academic</option>
          <option value="CAREER">Career</option>
          <option value="SOCIAL">Social</option>
        </select>
      </div>
    </div>
    <div class="form-field">
      <label class="form-label">Venue *</label>
      <input type="text" bind:value={venue} class="form-input" placeholder="e.g. CEET Auditorium" required />
    </div>
    <div class="form-field">
      <label class="form-label">Description</label>
      <textarea bind:value={description} class="form-input form-textarea" placeholder="Tell students what to expect…" rows="4"></textarea>
    </div>
    <button type="submit" class="submit-btn" disabled={submitting}>
      {submitting ? 'Creating…' : 'Create event'}
    </button>
  </form>
</div>

<style>
  .create-page { display: flex; flex-direction: column; gap: 1.25rem; max-width: 600px; }
  .back-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 0.875rem; color: var(--text-secondary); text-decoration: none; padding: 6px 12px; border: 1px solid var(--border); border-radius: 8px; width: fit-content; }
  .back-btn:hover { border-color: var(--purple-primary); color: var(--purple-on-light); }
  .page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; }
  .success-msg { padding: 0.875rem 1.125rem; background: color-mix(in srgb, var(--success) 10%, transparent); border: 1px solid color-mix(in srgb, var(--success) 30%, transparent); border-radius: 0.75rem; color: var(--success); font-size: 0.875rem; font-weight: 600; }
  .create-form { display: flex; flex-direction: column; gap: 1rem; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }
  .form-field { display: flex; flex-direction: column; gap: 0.375rem; }
  .form-label { font-size: 0.813rem; font-weight: 600; color: var(--text-secondary); }
  .form-input { padding: 0.7rem 0.875rem; border: 1.5px solid var(--border); border-radius: 0.625rem; font-size: 0.875rem; background: var(--bg-primary); color: var(--text-primary); outline: none; font-family: inherit; }
  .form-input:focus { border-color: var(--purple-primary); }
  .form-textarea { resize: vertical; min-height: 100px; }
  .submit-btn { padding: 0.75rem 1.5rem; background: var(--purple-primary); color: white; border: none; border-radius: 0.75rem; font-size: 0.875rem; font-weight: 700; cursor: pointer; font-family: inherit; align-self: flex-start; }
  .submit-btn:hover:not(:disabled) { background: var(--purple-primary-dark); }
  .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }
  @media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }
</style>