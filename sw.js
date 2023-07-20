"use strict";

const cacheVersion = 2; // Forces cache reload on increment
const cacheName = "oc-cache";
const offlinePageURL = "offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      await cache.add(new Request(offlinePageURL, { cache: "reload" })); // Forces network load if available
    })(),
  );
  self.skipWaiting().catch(console.error);
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
      }
    })(),
  );
  self.clients.claim().catch(console.error);
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }
          return await fetch(event.request);
        } catch (error) {
          const cache = await caches.open(cacheName);
          return await cache.match(offlinePageURL);
        }
      })(),
    );
  }
});
