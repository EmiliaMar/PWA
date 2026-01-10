"use strict";

// service worker configuration

const CACHE_NAME = "booktracker-v1.4.0";
const OFFLINE_URL = "/offline.html";

// files to cache immediately on install
const PRECACHE_URLS = [
  "/PWA/",
  "/PWA/index.html",
  "/PWA/offline.html",
  "/PWA/manifest.json",
  "/PWA/css/style.css",
  "/PWA/js/utils.js",
  "/PWA/js/db.js",
  "/PWA/js/books.js",
  "/PWA/js/quotes.js",
  "/PWA/js/stats.js",
  "/PWA/js/app.js",
  "/PWA/assets/192.png",
  "/PWA/assets/512.png",
];

// install event - cache files
self.addEventListener("install", (event) => {
  console.log("[sw] installing service worker...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[sw] caching app shell");
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log("[sw] installation complete");
        return self.skipWaiting(); // activate immediately
      })
  );
});

// activate event - cleanup old caches
self.addEventListener("activate", (event) => {
  console.log("[sw] activating service worker...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[sw] deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("[sw] activation complete");
        return self.clients.claim(); // take control immediately
      })
  );
});

// fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // skip chrome extensions and other protocols
  if (!event.request.url.startsWith("http")) {
    return;
  }

  event.respondWith(
    caches
      .match(event.request)
      .then((cachedResponse) => {
        // cache hit - return cached response
        if (cachedResponse) {
          console.log("[sw] serving from cache:", event.request.url);
          return cachedResponse;
        }

        // cache miss - fetch from network
        console.log("[sw] fetching from network:", event.request.url);

        return fetch(event.request)
          .then((networkResponse) => {
            // don't cache non-successful responses
            if (
              !networkResponse ||
              networkResponse.status !== 200 ||
              networkResponse.type === "opaque"
            ) {
              return networkResponse;
            }

            // clone response (can only be consumed once)
            const responseToCache = networkResponse.clone();

            // cache the fetched response for future use
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return networkResponse;
          })
          .catch(() => {
            // network failed - serve offline page for navigation requests
            if (event.request.mode === "navigate") {
              return caches.match(OFFLINE_URL);
            }

            // for other requests, just fail
            return new Response("offline", {
              status: 503,
              statusText: "service unavailable",
            });
          });
      })
  );
});
// message event - handle messages from app
self.addEventListener("message", (event) => {
  console.log("[sw] received message:", event.data);

  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }

  if (event.data.action === "clearCache") {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});