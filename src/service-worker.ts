/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE_NAME   = `sabify-${version}`;
const STATIC_CACHE = `sabify-static-${version}`;

// Assets to pre-cache on install
const PRECACHE = [
  ...build,
  ...files,
];

// Routes to cache at runtime (network-first for fresh data, cache fallback for offline)
const RUNTIME_CACHE_PATTERNS = [
  /^\/dashboard/,
  /^\/past-questions/,
  /^\/library/,
  /^\/textbooks/,
  /^\/assignments/,
  /^\/timetable/,
  /^\/department-dues/,
  /^\/events/,
  /^\/settings/,
];

// API routes — always network, never cache
const SKIP_CACHE_PATTERNS = [
  /^\/api\//,
  /^\/auth\//,
];

// ── Install ──────────────────────────────────────────────────────
sw.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE);
    }).then(() => sw.skipWaiting())
  );
});

// ── Activate — clean up old caches ───────────────────────────────
sw.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => sw.clients.claim())
  );
});

// ── Fetch — network-first with cache fallback ─────────────────────
sw.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests from our origin
  if (request.method !== 'GET' || url.origin !== location.origin) return;

  // Skip API and auth routes — always go to network
  if (SKIP_CACHE_PATTERNS.some((p) => p.test(url.pathname))) return;

  // Static assets — cache-first (they have content hashes)
  if (PRECACHE.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached ?? fetch(request))
    );
    return;
  }

  // App routes and uploaded docs — network-first, cache fallback
  const isRuntimeRoute = RUNTIME_CACHE_PATTERNS.some((p) => p.test(url.pathname));
  const isUpload       = url.pathname.startsWith('/uploads/');

  if (isRuntimeRoute || isUpload) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          }
          return response;
        })
        .catch(async () => {
          // Network failed — serve from cache (offline mode)
          const cached = await caches.match(request);
          if (cached) return cached;
          // Fallback for navigation requests
          if (request.headers.get('Accept')?.includes('text/html')) {
            const offlinePage = await caches.match('/offline');
            if (offlinePage) return offlinePage;
          }
          return new Response('Offline — content not available', { status: 503 });
        })
    );
  }
});

// ── Push notifications (Sabify Shield alerts) ─────────────────────
sw.addEventListener('push', (event) => {
  if (!event.data) return;
  let payload: { title: string; body: string; severity: string };
  try { payload = event.data.json(); }
  catch { return; }

  const options: NotificationOptions = {
    body: payload.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    tag: `sabify-alert-${Date.now()}`,
    requireInteraction: payload.severity === 'URGENT',
    data: { url: '/dashboard' },
  };

  event.waitUntil(
    sw.registration.showNotification(`Sabify Shield: ${payload.title}`, options)
  );
});

// ── Notification click — open app ─────────────────────────────────
sw.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data?.url ?? '/dashboard') as string;
  event.waitUntil(
    sw.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const existing = clientList.find((c) => c.url.includes(location.origin));
      if (existing) {
        existing.focus();
        (existing as WindowClient).navigate(targetUrl);
      } else {
        sw.clients.openWindow(targetUrl);
      }
    })
  );
});