<!-- src/routes/(app)/live-map/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { MapPin, Navigation, Users, AlertTriangle, Footprints } from 'lucide-svelte';

  let mapContainer: HTMLDivElement;
  let watching    = $state(false);
  let position    = $state<{ lat: number; lng: number } | null>(null);
  let watchId:    number;
  let checkedIn   = $state(false);

  const safeWalkContacts = ['Chukwuemeka O.', 'Adaeze N.'];

  function startWatch() {
    if (!navigator.geolocation) return;
    watching = true;
    watchId  = navigator.geolocation.watchPosition(
      (pos) => { position = { lat: pos.coords.latitude, lng: pos.coords.longitude }; },
      () => { watching = false; },
      { enableHighAccuracy: true }
    );
  }

  function stopWatch() {
    navigator.geolocation.clearWatch(watchId);
    watching = false;
  }

  function checkIn() { checkedIn = true; }

  onMount(startWatch);
  onDestroy(stopWatch);
</script>

<svelte:head><title>Live Map — Sabify</title></svelte:head>

<div class="map-page">
  <div class="page-header">
    <h1 class="page-title">Live Map</h1>
    <p class="page-sub">Campus location, safe-walk check-in, and real-time movement sharing.</p>
  </div>

  <!-- Map placeholder — swap for Leaflet/Mapbox when API key is available -->
  <div class="map-box" bind:this={mapContainer}>
    <div class="map-placeholder">
      <MapPin size={40} class="map-pin-icon" />
      <p>Map requires Mapbox or Leaflet integration.</p>
      {#if position}
        <code class="map-coords">{position.lat.toFixed(5)}, {position.lng.toFixed(5)}</code>
      {:else if watching}
        <span class="map-locating">Locating…</span>
      {/if}
    </div>
  </div>

  <!-- Safe-walk panel -->
  <div class="safewalk-card">
    <div class="sw-header">
      <Footprints size={18} class="sw-icon" />
      <div>
        <h2 class="sw-title">Safe-Walk</h2>
        <p class="sw-sub">Share your journey with trusted contacts. They'll be notified if you don't check in.</p>
      </div>
    </div>

    <div class="sw-contacts">
      {#each safeWalkContacts as contact}
        <div class="sw-contact">
          <div class="sw-avatar">{contact.charAt(0)}</div>
          <span>{contact}</span>
          <span class="sw-contact-status">Watching</span>
        </div>
      {/each}
    </div>

    {#if checkedIn}
      <div class="sw-checkin-done">✓ Checked in safely — contacts notified.</div>
    {:else}
      <button class="sw-checkin-btn" onclick={checkIn}>
        <Navigation size={15} /> Check in safely
      </button>
    {/if}
  </div>

  <!-- Current alerts -->
  <div class="alert-panel">
    <div class="alert-row alert-row--info">
      <AlertTriangle size={16} />
      <span>No active safety alerts on campus right now.</span>
    </div>
  </div>
</div>

<style>
  .map-page { display: flex; flex-direction: column; gap: 1.25rem; }
  .page-header { display: flex; flex-direction: column; gap: 3px; }
  .page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; }
  .page-sub { font-size: 0.813rem; color: var(--text-muted); }

  .map-box { border: 1px solid var(--border); border-radius: 1.25rem; overflow: hidden; height: 340px; background: var(--bg-secondary); }
  .map-placeholder { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; color: var(--text-muted); }
  :global(.map-pin-icon) { color: var(--purple-primary); }
  .map-placeholder p { font-size: 0.875rem; }
  .map-coords { font-family: 'DM Mono', monospace; font-size: 0.813rem; color: var(--purple-primary); background: var(--purple-light); padding: 4px 10px; border-radius: 6px; }
  .map-locating { font-size: 0.813rem; color: var(--text-muted); animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  .safewalk-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 1.25rem; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
  .sw-header { display: flex; align-items: flex-start; gap: 0.875rem; }
  :global(.sw-icon) { color: var(--purple-primary); margin-top: 2px; flex-shrink: 0; }
  .sw-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
  .sw-sub { font-size: 0.813rem; color: var(--text-muted); line-height: 1.5; margin-top: 2px; }
  .sw-contacts { display: flex; flex-direction: column; gap: 8px; }
  .sw-contact { display: flex; align-items: center; gap: 10px; padding: 0.625rem 0.875rem; background: var(--bg-primary); border: 1px solid var(--border); border-radius: 0.625rem; }
  .sw-avatar { width: 30px; height: 30px; border-radius: 50%; background: var(--purple-primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.813rem; font-weight: 700; flex-shrink: 0; }
  .sw-contact span:nth-child(2) { flex: 1; font-size: 0.875rem; font-weight: 500; color: var(--text-primary); }
  .sw-contact-status { font-size: 0.688rem; color: var(--success); font-weight: 600; background: color-mix(in srgb, var(--success) 10%, transparent); padding: 2px 7px; border-radius: 4px; }
  .sw-checkin-done { padding: 0.875rem; background: color-mix(in srgb, var(--success) 10%, transparent); border: 1px solid color-mix(in srgb, var(--success) 30%, transparent); border-radius: 0.75rem; color: var(--success); font-size: 0.875rem; font-weight: 600; text-align: center; }
  .sw-checkin-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 0.75rem 1.5rem; background: var(--purple-primary); color: white; border: none; border-radius: 0.75rem; font-size: 0.875rem; font-weight: 700; cursor: pointer; font-family: inherit; }
  .sw-checkin-btn:hover { background: var(--purple-primary-dark); }

  .alert-panel { display: flex; flex-direction: column; gap: 8px; }
  .alert-row { display: flex; align-items: center; gap: 9px; padding: 0.875rem 1rem; border-radius: 0.875rem; font-size: 0.875rem; }
  .alert-row--info { background: color-mix(in srgb, var(--success) 7%, transparent); border: 1px solid color-mix(in srgb, var(--success) 25%, transparent); color: var(--success); }
</style>