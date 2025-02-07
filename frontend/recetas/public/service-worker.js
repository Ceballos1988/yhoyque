const CACHE_NAME = "v31";  // Incrementa la versión para forzar la actualización del caché

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
      console.log("[Service Worker] Cacheando archivos...");
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

// Manejo de peticiones
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Solo manejar peticiones GET
  if (request.method !== "GET") return;

  // Diferenciar entre navegación y otros recursos
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        return cachedResponse || fetch(request).catch(() => caches.match("/offline.html"));
      })
    );
  } else {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;  // Devuelve desde el caché si está disponible
        }

        return fetch(request)
          .then((networkResponse) => {
            // Cachea solo recursos del mismo origen
            if (request.url.startsWith(self.location.origin)) {
              return caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse.clone());
                return networkResponse;
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Para imágenes que no están en caché, muestra un placeholder
            if (request.destination === "image") {
              return caches.match("/img/recipe-null.png");
            }
          });
      })
    );
  }
});

// Permite forzar la actualización del Service Worker manualmente
self.addEventListener("message", (event) => {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});
