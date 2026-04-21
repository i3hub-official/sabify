<!-- src/routes/(app)/timetable/+page.svelte -->
<script lang="ts">
  import { Calendar } from 'lucide-svelte';

  // Stub data — replace with DB when timetable model is added
  const days   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const hours  = ['8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm'];
  const classes = [
    { day: 'Mon', hour: '8am',  code: 'CPE 411', title: 'Digital Signal Processing', venue: 'LT1', color: 'purple' },
    { day: 'Mon', hour: '10am', code: 'CPE 403', title: 'Communication Systems',     venue: 'LT2', color: 'blue'   },
    { day: 'Tue', hour: '9am',  code: 'CPE 305', title: 'Microprocessors',           venue: 'Lab', color: 'green'  },
    { day: 'Wed', hour: '8am',  code: 'CPE 411', title: 'Digital Signal Processing', venue: 'LT1', color: 'purple' },
    { day: 'Thu', hour: '11am', code: 'CPE 401', title: 'Electromagnetics',          venue: 'LT3', color: 'amber'  },
    { day: 'Fri', hour: '2pm',  code: 'CPE 305', title: 'Microprocessors Lab',       venue: 'Lab', color: 'green'  },
  ];

  function getClass(day: string, hour: string) {
    return classes.find(c => c.day === day && c.hour === hour);
  }
</script>

<svelte:head><title>Timetable — Sabify</title></svelte:head>

<div class="tt-page">
  <div class="page-header">
    <h1 class="page-title">Timetable</h1>
    <p class="page-sub">2024/2025 · Second Semester · 400L</p>
  </div>

  <div class="tt-wrap">
    <table class="tt-table">
      <thead>
        <tr>
          <th class="tt-th tt-th-time"></th>
          {#each days as day}
            <th class="tt-th">{day}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each hours as hour}
          <tr>
            <td class="tt-time">{hour}</td>
            {#each days as day}
              {@const cls = getClass(day, hour)}
              <td class="tt-cell">
                {#if cls}
                  <div class="tt-class tt-class-{cls.color}">
                    <span class="tt-code">{cls.code}</span>
                    <span class="tt-name">{cls.title}</span>
                    <span class="tt-venue">{cls.venue}</span>
                  </div>
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .tt-page { display: flex; flex-direction: column; gap: 1.25rem; }
  .page-header { display: flex; flex-direction: column; gap: 3px; }
  .page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; }
  .page-sub { font-size: 0.813rem; color: var(--text-muted); }
  .tt-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 1rem; }
  .tt-table { width: 100%; border-collapse: collapse; min-width: 600px; }
  .tt-th { padding: 0.75rem 0.5rem; font-size: 0.813rem; font-weight: 700; color: var(--text-secondary); text-align: center; border-bottom: 1px solid var(--border); background: var(--bg-secondary); }
  .tt-th-time { width: 52px; }
  .tt-time { padding: 0.5rem; font-size: 0.688rem; color: var(--text-muted); font-weight: 500; text-align: right; vertical-align: top; border-bottom: 1px solid var(--border); white-space: nowrap; background: var(--bg-secondary); }
  .tt-cell { padding: 4px; vertical-align: top; border-bottom: 1px solid var(--border); border-left: 1px solid var(--border); min-height: 52px; min-width: 100px; }
  .tt-class { border-radius: 7px; padding: 6px 8px; display: flex; flex-direction: column; gap: 1px; }
  .tt-code { font-size: 0.688rem; font-weight: 700; }
  .tt-name { font-size: 0.625rem; line-height: 1.3; opacity: 0.85; }
  .tt-venue { font-size: 0.563rem; opacity: 0.7; margin-top: 2px; }
  .tt-class-purple { background: var(--purple-light); color: var(--purple-on-light); }
  .tt-class-blue   { background: #eff6ff; color: #1d4ed8; }
  .tt-class-green  { background: #f0fdf4; color: #15803d; }
  .tt-class-amber  { background: #fffbeb; color: #b45309; }
  :global(html.dark) .tt-class-blue  { background: #0c1a2e; color: #60a5fa; }
  :global(html.dark) .tt-class-green { background: #052e16; color: #86efac; }
  :global(html.dark) .tt-class-amber { background: #1c1300; color: #fcd34d; }
</style>