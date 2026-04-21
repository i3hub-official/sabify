<!-- src/routes/(app)/dashboard/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  import { FileQuestion, BookMarked, ClipboardList, CreditCard, Bell, Pin, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();

  const categoryLabel: Record<string, string> = { TEST: 'Past Test', ASSIGNMENT: 'Assignment', TEXTBOOK: 'Textbook' };
  const categoryColor: Record<string, string> = { TEST: 'chip-t', ASSIGNMENT: 'chip-a', TEXTBOOK: 'chip-b' };

  // CGPA ring maths
  const cgpa     = data.cgpa ?? 0;
  const maxCgpa  = 5;
  const r        = 44;
  const circ     = 2 * Math.PI * r;
  const progress = circ - (cgpa / maxCgpa) * circ;
</script>

<svelte:head><title>Dashboard — Sabify</title></svelte:head>

<div class="dash">

  <!-- ── HUD row ── -->
  <div class="hud-row">

    <!-- CGPA Ring -->
    <div class="hud-card hud-cgpa">
      <div class="hud-cgpa-ring">
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r={r} fill="none" stroke="var(--border)" stroke-width="8"/>
          <circle cx="55" cy="55" r={r} fill="none" stroke="var(--purple-primary)" stroke-width="8"
            stroke-linecap="round" stroke-dasharray={circ} stroke-dashoffset={progress}
            transform="rotate(-90 55 55)"/>
          <text x="55" y="51" text-anchor="middle" font-size="18" font-weight="800"
            fill="var(--text-primary)" font-family="'DM Sans', sans-serif">
            {cgpa > 0 ? cgpa.toFixed(2) : '—'}
          </text>
          <text x="55" y="66" text-anchor="middle" font-size="10"
            fill="var(--text-muted)" font-family="'DM Sans', sans-serif">CGPA</text>
        </svg>
      </div>
      <div class="hud-cgpa-info">
        <div class="hud-label">Academic standing</div>
        <div class="hud-value">{data.user?.name?.split(' ')[0] ?? 'Student'}</div>
        <div class="hud-sub">
          {cgpa >= 4.5 ? 'First Class' : cgpa >= 3.5 ? 'Second Class Upper' : cgpa >= 2.5 ? 'Second Class Lower' : cgpa > 0 ? 'Third Class' : 'No grades yet'}
        </div>
        <a href="/settings#cgpa" class="hud-link">Update grades <ArrowRight size={13} /></a>
      </div>
    </div>

    <!-- Shield status -->
    <div class="hud-card hud-shield" class:hud-shield--alert={data.latestAlert?.severity === 'URGENT'}>
      <div class="hud-shield-top">
        <div class="shield-pulse" class:shield-pulse--red={data.latestAlert?.severity === 'URGENT'}>
          <div class="pulse-dot"></div>
        </div>
        <span class="shield-status-text">
          {data.latestAlert?.severity === 'URGENT' ? 'Active alert' : 'Campus quiet'}
        </span>
      </div>
      <div class="shield-icon-wrap">
        {#if data.latestAlert?.severity === 'URGENT'}
          <AlertTriangle size={32} class="shield-icon-alert" />
        {:else}
          <ShieldCheck size={32} class="shield-icon-ok" />
        {/if}
      </div>
      <div class="shield-label">Sabify Shield</div>
      {#if data.latestAlert}
        <div class="shield-alert-text">{data.latestAlert.title}</div>
      {:else}
        <div class="shield-alert-text">No active alerts</div>
      {/if}
    </div>

    <!-- Quick stats -->
    <div class="hud-card hud-stats">
      <div class="stat-item">
        <FileQuestion size={18} class="stat-icon" />
        <div class="stat-info">
          <span class="stat-n">{data.recentUploads.filter(d => d.category === 'TEST').length}</span>
          <span class="stat-l">New tests this week</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <Pin size={18} class="stat-icon" />
        <div class="stat-info">
          <span class="stat-n">{data.pinnedDocs.length}</span>
          <span class="stat-l">Pinned for offline</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <CreditCard size={18} class="stat-icon" />
        <div class="stat-info">
          <span class="stat-n">{data.pendingDues.length}</span>
          <span class="stat-l">Pending dues</span>
        </div>
      </div>
    </div>

  </div>

  <!-- ── Pending dues banner ── -->
  {#if data.pendingDues.length > 0}
    <div class="dues-banner">
      <CreditCard size={17} />
      <span>You have <strong>{data.pendingDues.length}</strong> unpaid {data.pendingDues.length === 1 ? 'due' : 'dues'} —</span>
      <a href="/department-dues/pay" class="dues-link">Pay now <ArrowRight size={13} /></a>
    </div>
  {/if}

  <!-- ── Two-column content ── -->
  <div class="dash-grid">

    <!-- Recent uploads -->
    <section class="dash-section">
      <div class="section-head">
        <h2 class="section-title">Recent in your department</h2>
        <a href="/past-questions" class="section-more">See all <ArrowRight size={13} /></a>
      </div>
      {#if data.recentUploads.length === 0}
        <div class="empty-state">
          <BookMarked size={28} />
          <p>No documents yet. Be the first to upload!</p>
          <a href="/library" class="empty-cta">Browse library</a>
        </div>
      {:else}
        <div class="doc-list">
          {#each data.recentUploads as doc}
            <a href="/past-questions/{doc.id}" class="doc-row">
              <span class="doc-chip {categoryColor[doc.category]}">{doc.category.charAt(0)}</span>
              <div class="doc-info">
                <span class="doc-name">{doc.title}</span>
                <span class="doc-meta">{doc.course.code} · {categoryLabel[doc.category]}</span>
              </div>
              <ArrowRight size={14} class="doc-arrow" />
            </a>
          {/each}
        </div>
      {/if}
    </section>

    <!-- Pinned docs -->
    <section class="dash-section">
      <div class="section-head">
        <h2 class="section-title">Pinned for offline</h2>
        <a href="/library" class="section-more">Library <ArrowRight size={13} /></a>
      </div>
      {#if data.pinnedDocs.length === 0}
        <div class="empty-state">
          <Pin size={28} />
          <p>No pinned documents yet. Pin files to read offline.</p>
        </div>
      {:else}
        <div class="doc-list">
          {#each data.pinnedDocs as pin}
            <a href="/past-questions/{pin.document.id}" class="doc-row">
              <span class="doc-chip {categoryColor[pin.document.category]}">{pin.document.category.charAt(0)}</span>
              <div class="doc-info">
                <span class="doc-name">{pin.document.title}</span>
                <span class="doc-meta">{pin.document.course.code}</span>
              </div>
              <ArrowRight size={14} class="doc-arrow" />
            </a>
          {/each}
        </div>
      {/if}
    </section>

  </div>

  <!-- ── Quick nav cards ── -->
  <div class="quick-nav">
    <a href="/past-questions" class="qnav-card">
      <FileQuestion size={22} class="qnav-icon" />
      <span class="qnav-label">Past Questions</span>
    </a>
    <a href="/assignments" class="qnav-card">
      <ClipboardList size={22} class="qnav-icon" />
      <span class="qnav-label">Assignments</span>
    </a>
    <a href="/department-dues" class="qnav-card">
      <CreditCard size={22} class="qnav-icon" />
      <span class="qnav-label">Pay Dues</span>
    </a>
    <a href="/events" class="qnav-card">
      <Bell size={22} class="qnav-icon" />
      <span class="qnav-label">Events</span>
    </a>
  </div>

</div>

<style>
  .dash { display: flex; flex-direction: column; gap: 1.5rem; }

  /* ── HUD row ── */
  .hud-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
  @media (max-width: 900px) { .hud-row { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 580px) { .hud-row { grid-template-columns: 1fr; } }

  .hud-card {
    background: var(--bg-secondary); border: 1px solid var(--border);
    border-radius: 1.25rem; padding: 1.25rem;
  }

  /* CGPA */
  .hud-cgpa { display: flex; align-items: center; gap: 1rem; }
  .hud-cgpa-ring { flex-shrink: 0; }
  .hud-cgpa-info { display: flex; flex-direction: column; gap: 0.25rem; }
  .hud-label { font-size: 0.688rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
  .hud-value { font-size: 1.25rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; }
  .hud-sub { font-size: 0.75rem; color: var(--purple-primary); font-weight: 600; }
  .hud-link { display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--purple-primary); text-decoration: none; margin-top: 0.5rem; font-weight: 500; }
  .hud-link:hover { text-decoration: underline; }

  /* Shield */
  .hud-shield { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; text-align: center; }
  .hud-shield--alert { border-color: var(--error); background: color-mix(in srgb, var(--error) 5%, var(--bg-secondary)); }
  .hud-shield-top { display: flex; align-items: center; gap: 7px; }
  .shield-pulse { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; animation: pulse-g 2.5s ease-in-out infinite; }
  .shield-pulse--red { background: var(--error); animation: pulse-r 1.2s ease-in-out infinite; }
  @keyframes pulse-g { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes pulse-r { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .shield-status-text { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); }
  :global(.shield-icon-ok) { color: #22c55e; }
  :global(.shield-icon-alert) { color: var(--error); }
  .shield-label { font-size: 0.813rem; font-weight: 700; color: var(--text-primary); }
  .shield-alert-text { font-size: 0.75rem; color: var(--text-muted); max-width: 160px; text-align: center; line-height: 1.4; }

  /* Stats */
  .hud-stats { display: flex; flex-direction: column; gap: 0; }
  .stat-item { display: flex; align-items: center; gap: 10px; padding: 0.625rem 0; }
  :global(.stat-icon) { color: var(--purple-primary); flex-shrink: 0; }
  .stat-info { display: flex; flex-direction: column; }
  .stat-n { font-size: 1.125rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }
  .stat-l { font-size: 0.75rem; color: var(--text-muted); }
  .stat-divider { height: 1px; background: var(--border); }

  /* ── Dues banner ── */
  .dues-banner {
    display: flex; align-items: center; gap: 8px;
    padding: 0.875rem 1.25rem; border-radius: 0.875rem;
    background: color-mix(in srgb, var(--warning) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--warning) 30%, transparent);
    color: var(--warning); font-size: 0.875rem; flex-wrap: wrap;
  }
  .dues-banner strong { font-weight: 700; }
  .dues-link { display: inline-flex; align-items: center; gap: 4px; color: var(--warning); font-weight: 700; text-decoration: none; margin-left: auto; }
  .dues-link:hover { text-decoration: underline; }

  /* ── Dash grid ── */
  .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  @media (max-width: 700px) { .dash-grid { grid-template-columns: 1fr; } }

  .dash-section { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 1.25rem; padding: 1.25rem; }
  .section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
  .section-title { font-size: 0.9375rem; font-weight: 700; color: var(--text-primary); }
  .section-more { display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--purple-primary); text-decoration: none; font-weight: 500; }
  .section-more:hover { text-decoration: underline; }

  .empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1.5rem 0; color: var(--text-muted); text-align: center; }
  .empty-state p { font-size: 0.813rem; }
  .empty-cta { font-size: 0.813rem; color: var(--purple-primary); text-decoration: none; font-weight: 600; }

  .doc-list { display: flex; flex-direction: column; gap: 6px; }
  .doc-row {
    display: flex; align-items: center; gap: 10px;
    padding: 0.625rem 0.75rem; border-radius: 0.75rem;
    background: var(--bg-primary); border: 1px solid var(--border);
    text-decoration: none; transition: border-color 0.15s;
  }
  .doc-row:hover { border-color: var(--purple-accent); }
  .doc-chip { width: 26px; height: 26px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 0.688rem; font-weight: 700; flex-shrink: 0; }
  .chip-t { background: var(--purple-light); color: var(--purple-on-light); }
  .chip-a { background: #fefce8; color: #854d0e; }
  .chip-b { background: #eff6ff; color: #1d4ed8; }
  :global(html.dark) .chip-a { background: #2d2400; color: #fbbf24; }
  :global(html.dark) .chip-b { background: #0c1a2e; color: #60a5fa; }
  .doc-info { flex: 1; min-width: 0; }
  .doc-name { display: block; font-size: 0.813rem; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .doc-meta { display: block; font-size: 0.688rem; color: var(--text-muted); margin-top: 1px; }
  :global(.doc-arrow) { color: var(--text-muted); flex-shrink: 0; }

  /* ── Quick nav ── */
  .quick-nav { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
  @media (max-width: 580px) { .quick-nav { grid-template-columns: repeat(2, 1fr); } }
  .qnav-card {
    display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
    padding: 1.25rem 0.75rem; border-radius: 1rem;
    background: var(--bg-secondary); border: 1px solid var(--border);
    text-decoration: none; transition: all 0.15s;
  }
  .qnav-card:hover { border-color: var(--purple-accent); background: var(--purple-light); }
  :global(.qnav-icon) { color: var(--purple-primary); }
  .qnav-label { font-size: 0.813rem; font-weight: 600; color: var(--text-secondary); text-align: center; }
</style>