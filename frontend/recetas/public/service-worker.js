const CACHE_NAME = "v28";  // Incrementa la versión para asegurar actualización del caché

const urlsToCache = [
  "/",
  "/manifest.json",
  "/offline.html",
  "/index.html",
  "/styles/main.css",
  "/img/icon-192x192.png",
  "/img/icon-512x512.png",
  "https://res.cloudinary.com/dnlyti3zm/image/upload/v1738963346/volver_vfhz7r.png",
  "/img/abrir.png",
  "/img/delete.png",
  "/img/search.png",
  "/img/filtro.png",
  "/img/orden.png",
  "/img/recipe-null.png",
  "/img/heart-filled.svg",
  "/img/heart-outline.svg",
  "/img/edit.png"
];

/**
 * Evento de instalación: Cachea los archivos esenciales.
 */
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Instalando el service worker...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }).catch(err => {
      console.error("[Service Worker] Error al cachear archivos:", err);
    })
  );
  self.skipWaiting();
});

/**
 * Activación del Service Worker: Limpia cachés antiguas.
 */
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activando el service worker...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Eliminando caché antigua:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

/**
 * Manejo de peticiones:
 */
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).catch(() => {
        if (request.mode === "navigate") {
          return caches.match("/offline.html");
        }
        return caches.match("/offline.html");
      });
    })
  );
});


/**
 * Permite forzar la actualización del Service Worker manualmente.
 */
self.addEventListener("message", (event) => {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});
