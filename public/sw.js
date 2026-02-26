/// <reference lib="webworker" />

const CACHE_NAME = "the-arena-v3";

// Assets to pre-cache for offline shell
const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Install — pre-cache shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches and immediately take control
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — smart strategy per resource type
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin (partykit, fonts, etc.)
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Skip Next.js internal routes and API
  if (url.pathname.startsWith("/_next/") || url.pathname.startsWith("/api/")) {
    // Network-only for _next/data (RSC payloads) — never serve stale
    if (url.pathname.startsWith("/_next/data/")) return;

    // Static chunks — cache-first (fingerprinted, safe to cache forever)
    if (url.pathname.startsWith("/_next/static/")) {
      event.respondWith(
        caches.match(request).then(
          (cached) =>
            cached ||
            fetch(request).then((response) => {
              if (response.ok) {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
              }
              return response;
            })
        )
      );
      return;
    }
    return;
  }

  // Icons & images — cache-first
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2?)$/)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
      )
    );
    return;
  }

  // HTML page navigations — network-first, fall back to cached "/" shell
  // This fixes the PWA blank page on refresh: always try network first,
  // and if offline serve the root shell which Next.js can hydrate.
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          // Offline: serve cached page, or fall back to root shell
          caches.match(request).then((cached) => cached || caches.match("/"))
        )
    );
    return;
  }
});
