const CACHE_NAME = "v35";

const urlsToCache = [
  "/", 
  "/manifest.json",
  "/offline.html",
  "/index.html",
  "/styles/main.css",
  "/img/icon-192x192.png",
  "/img/icon-512x512.png",
  "/img/abrir.png",
  "/img/delete.png",
  "/img/search.png",
  "/img/filtro.png",
  "/img/orden.png",
  "/img/heart-filled.svg",
  "/img/heart-outline.svg",
  "/img/edit.png",
  "/img/recipe-null.png",
  "/img/offline.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(cacheNames.map((cacheName) => {
        if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
      }))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/offline.html")));
  } else {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            if (
              request.url.startsWith(self.location.origin) ||
              request.url.includes("res.cloudinary.com") ||
              request.url.includes("yhoyque.onrender.com/api")
            ) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        }).catch(() => {
          if (request.destination === "image") {
            return caches.match("/img/recipe-null.png");
          }
        });
      })
    );
  }
});
