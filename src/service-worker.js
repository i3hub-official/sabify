// src/service-worker.js (not static/sw.js)
/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
  ...build, // the app itself
  ...files  // everything in `static`
];

self.addEventListener('install', (event) => {
  // Create a new cache and add all files to it
  async function addFilesToCache() {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
  }

  event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
  // Remove previous cached data from disk
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key);
    }
  }

  event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
  // ignore POST requests etc
  if (event.request.method !== 'GET') return;

  async function respond() {
    const url = new URL(event.request.url);
    const cache = await caches.open(CACHE);

    // `build`/`files` can always be served from the cache
    if (ASSETS.includes(url.pathname)) {
      const response = await cache.match(url.pathname);
      if (response) return response;
    }

    // for everything else, try the network first, but
    // fall back to the cache if we're offline
    try {
      const response = await fetch(event.request);
      const isNotExtension = url.protocol === 'https:';
      const isSuccess = response.status === 200;

      if (isNotExtension && isSuccess) {
        cache.put(event.request, response.clone());
      }

      return response;
    } catch {
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) return cachedResponse;

      // if this is a navigation request, fall back to the app shell
      if (event.request.mode === 'navigate') {
        return cache.match('/');
      }

      // otherwise return error
      return new Response('Not found', { status: 404 });
    }
  }

  event.respondWith(respond());
});