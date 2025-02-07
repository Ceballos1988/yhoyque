const CACHE_NAME = "v30";  // Incrementa la versión para forzar la actualización del caché

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

// Evento de instalación: Cachea los archivos esenciales
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Instalando el service worker...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }).catch(err => {
      console.error("[Service Worker] Error al cachear archivos:", err);
    })
  );
  self.skipWaiting();  // Activa el SW inmediatamente
});

// Activación del Service Worker: Limpia cachés antiguas
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
  self.clients.claim();  // Controla todas las páginas abiertas
});

// Manejo de peticiones: Cache First, luego red para recursos externos
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Solo manejar peticiones GET
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;  // Devuelve desde el caché si está disponible
      }

      return fetch(request)
        .then((networkResponse) => {
          // Solo cachea las respuestas que son del mismo origen
          if (request.url.startsWith(self.location.origin)) {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse.clone());
              return networkResponse;
            });
          }
          return networkResponse;  // Para recursos externos, solo devuelve la respuesta
        })
        .catch(() => {
          // Si no hay conexión y no hay en caché, muestra la página offline
          if (request.mode === "navigate") {
            return caches.match("/offline.html");
          }
          // Para imágenes o recursos que no están cacheados, muestra un placeholder
          if (request.destination === "image") {
            return caches.match("/img/recipe-null.png");
          }
        });
    })
  );
});

// Permite forzar la actualización del Service Worker manualmente
self.addEventListener("message", (event) => {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});
