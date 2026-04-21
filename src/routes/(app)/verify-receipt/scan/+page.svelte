<!-- src/routes/(app)/verify-receipt/scan/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import jsQR from 'jsqr';
  import { Camera, X, ArrowLeft } from 'lucide-svelte';

  let videoEl    = $state<HTMLVideoElement | null>(null);
  let camStream  = $state<MediaStream | null>(null);
  let scanning   = $state(false);
  let camError   = $state('');
  let scanCanvas: HTMLCanvasElement;
  let interval:   ReturnType<typeof setInterval> | null = null;

  function extractRef(raw: string): string {
    try {
      const url = new URL(raw);
      const ref = url.searchParams.get('transaction_ref');
      if (ref) return ref.trim();
    } catch {}
    return raw.trim();
  }

  async function startCamera() {
    camError = '';
    try {
      camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      scanning  = true;
      await new Promise(r => setTimeout(r, 100));
      if (videoEl) {
        videoEl.srcObject = camStream;
        await videoEl.play();
        startScan();
      }
    } catch {
      camError = 'Camera access denied. Please allow camera access in your browser settings.';
    }
  }

  function startScan() {
    scanCanvas = document.createElement('canvas');
    interval = setInterval(() => {
      if (!videoEl || videoEl.readyState !== 4) return;
      scanCanvas.width  = videoEl.videoWidth;
      scanCanvas.height = videoEl.videoHeight;
      const ctx = scanCanvas.getContext('2d')!;
      ctx.drawImage(videoEl, 0, 0);
      const img  = ctx.getImageData(0, 0, scanCanvas.width, scanCanvas.height);
      const code = jsQR(img.data, img.width, img.height);
      if (code?.data) {
        stopCamera();
        const ref = extractRef(code.data);
        goto(`/verify-receipt/${encodeURIComponent(ref)}`);
      }
    }, 300);
  }

  function stopCamera() {
    if (interval)   clearInterval(interval);
    if (camStream)  camStream.getTracks().forEach(t => t.stop());
    camStream = null;
    scanning  = false;
  }

  onMount(startCamera);
  onDestroy(stopCamera);
</script>

<svelte:head><title>Scan Receipt — Sabify</title></svelte:head>

<div class="scan-page">
  <a href="/verify-receipt" class="back-btn" onclick={stopCamera}><ArrowLeft size={16} /> Back</a>
  <h1 class="page-title">Scan QR receipt</h1>
  <p class="page-sub">Point the camera at the student's Sabify QR receipt code.</p>

  {#if camError}
    <div class="cam-error">{camError}</div>
  {:else if scanning}
    <div class="cam-frame">
      <!-- svelte-ignore a11y-media-has-caption -->
      <video bind:this={videoEl} playsinline autoplay class="cam-video"></video>
      <div class="scan-overlay">
        <div class="scan-reticle"></div>
        <p class="scan-hint">Align the QR code within the frame</p>
      </div>
    </div>
    <button class="stop-btn" onclick={stopCamera}><X size={14} /> Cancel scan</button>
  {:else}
    <div class="cam-loading">
      <Camera size={32} />
      <p>Starting camera…</p>
    </div>
  {/if}
</div>

<style>
  .scan-page { display: flex; flex-direction: column; gap: 1.25rem; max-width: 520px; }
  .back-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 0.875rem; color: var(--text-secondary); text-decoration: none; padding: 6px 12px; border: 1px solid var(--border); border-radius: 8px; width: fit-content; }
  .back-btn:hover { border-color: var(--purple-primary); color: var(--purple-on-light); }
  .page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; }
  .page-sub { font-size: 0.875rem; color: var(--text-muted); }
  .cam-error { padding: 1rem; background: color-mix(in srgb, var(--error) 10%, transparent); border: 1px solid color-mix(in srgb, var(--error) 30%, transparent); border-radius: 0.875rem; color: var(--error); font-size: 0.875rem; }
  .cam-frame { position: relative; border-radius: 1.25rem; overflow: hidden; background: #000; aspect-ratio: 4/3; }
  .cam-video { width: 100%; height: 100%; object-fit: cover; display: block; }
  .scan-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; }
  .scan-reticle { width: 200px; height: 200px; border: 2.5px solid var(--purple-primary); border-radius: 1rem; box-shadow: 0 0 0 9999px rgba(0,0,0,0.5); }
  .scan-hint { font-size: 0.813rem; color: white; background: rgba(0,0,0,0.5); padding: 6px 14px; border-radius: 999px; }
  .stop-btn { display: inline-flex; align-items: center; gap: 6px; padding: 0.75rem 1.25rem; background: color-mix(in srgb, var(--error) 10%, transparent); border: 1px solid color-mix(in srgb, var(--error) 30%, transparent); color: var(--error); border-radius: 0.75rem; font-size: 0.875rem; font-weight: 600; cursor: pointer; font-family: inherit; align-self: flex-start; }
  .cam-loading { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem; color: var(--text-muted); background: var(--bg-secondary); border-radius: 1.25rem; border: 1px solid var(--border); }
  .cam-loading p { font-size: 0.875rem; }
</style>