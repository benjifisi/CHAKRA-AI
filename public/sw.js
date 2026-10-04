/**
 * Chandra Asri PetroHub - Service Worker
 * Offline Access for Critical SOPs & OPLs in Plant Field Environments
 * Cache Name: cap-petrohub-offline-v1
 */

const CACHE_NAME = 'cap-petrohub-offline-v1';
const DATA_CACHE_NAME = 'cap-petrohub-field-data-v1';

// Essential App Shell resources to precache immediately
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/pdf.worker.min.mjs'
];

// Critical Field Endpoints to cache for offline plant use
const FIELD_ENDPOINTS = [
  '/api/critical-field-docs',
  '/api/dataset-overview'
];

// Install Event: Precache Application Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Precaching App Shell & Core Assets');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Some assets skipped precaching:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clear outdated caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME && name !== DATA_CACHE_NAME) {
            console.log('[ServiceWorker] Removing legacy cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Intelligent routing for intermittent plant connectivity
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-GET requests or browser extension requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Strategy 1: Critical Field API Endpoints (Network First, Cache Fallback)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If valid response, clone into data cache
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DATA_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          console.log('[ServiceWorker] Network unavailable. Serving cached field data for:', url.pathname);
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Synthetic fallback if offline and not in cache
          return new Response(
            JSON.stringify({
              offline: true,
              message: 'Operating in offline field mode. Cached data served where available.'
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // Strategy 2: HTML Page Navigations (Network First, Fallback to cached index.html)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedIndex = await caches.match('/index.html');
        if (cachedIndex) return cachedIndex;
        return caches.match('/');
      })
    );
    return;
  }

  // Strategy 3: Static Assets, Scripts, Images, CSS (Stale-While-Revalidate)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Network failed, nothing to do if cachedResponse already exists
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// Message Listener for On-Demand Field Pre-Caching (Triggered from UI)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PRECACHE_CRITICAL_DOCS') {
    event.waitUntil(
      caches.open(DATA_CACHE_NAME).then(async (cache) => {
        console.log('[ServiceWorker] Explicit offline sync requested for Critical SOPs & OPLs');
        const results = await Promise.allSettled(
          FIELD_ENDPOINTS.map(async (endpoint) => {
            const res = await fetch(endpoint);
            if (res.ok) {
              await cache.put(endpoint, res);
            }
          })
        );
        
        // Notify client that pre-caching finished
        event.source.postMessage({
          type: 'PRECACHE_COMPLETE',
          success: results.every((r) => r.status === 'fulfilled')
        });
      })
    );
  }
});
