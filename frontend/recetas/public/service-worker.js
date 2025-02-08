const CACHE_NAME = "v41";

const urlsToCache = [
  "/", 
  "/manifest.json",
  "/offline.html",
  "/index.html",
  "/styles/main.css",
  "/app-recetas/frontend/recetas/public/img/icon-192x192.png",
  "/app-recetas/frontend/recetas/public/img/volver.png",
  "/app-recetas/frontend/recetas/public/img/icon-512x512.png",
  "/app-recetas/frontend/recetas/public/img/abrir.png",
  "/app-recetas/frontend/recetas/public/img/delete.png",
  "/app-recetas/frontend/recetas/public/img/search.png",
  "/app-recetas/frontend/recetas/public/img/filtro.png",
  "/app-recetas/frontend/recetas/public/img/orden.png",
  "/app-recetas/frontend/recetas/public/img/heart-filled.svg",
  "/app-recetas/frontend/recetas/public/img/heart-outline.svg",
  "/app-recetas/frontend/recetas/public/img/edit.png",
  "/app-recetas/frontend/recetas/public/img/recipe-null.png",
  "/app-recetas/frontend/recetas/public/img/offline.png",
  "https://res.cloudinary.com/dnlyti3zm/image/upload/v1738963346/volver_vfhz7r.png"
];

// Cachear recursos iniciales durante la instalación
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Limpiar cachés antiguos durante la activación
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        })
      )
    )
  );
  self.clients.claim();
});

// Manejar las solicitudes
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/offline.html"))
    );
  } else {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request)
          .then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              if (
                request.url.startsWith(self.location.origin) ||
                request.url.includes("res.cloudinary.com") ||
                request.url.includes("yhoyque.onrender.com/api/shopping-lists")
              ) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            });
          })
          .catch(() => {
            if (request.destination === "image") {
              // Verificar si es una de las imágenes con ruta absoluta que falló
              const fallbackImage = urlsToCache.find(url => request.url.endsWith(url.split('/').pop()));
              return caches.match(fallbackImage || "/app-recetas/frontend/recetas/public/img/recipe-null.png");
            }
          });
      })
    );
  }
});
