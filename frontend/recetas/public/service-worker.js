const CACHE_NAME = "v32";  // Nueva versión para forzar actualización

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
  "/img/edit.png"
];

// Evento de instalación: Cachea los archivos esenciales
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Instalando...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Cacheando archivos esenciales...");
      return cache.addAll(urlsToCache);
    }).catch(err => console.error("[Service Worker] Error al cachear:", err))
  );
  self.skipWaiting();
});

// Activación del Service Worker: Limpia cachés antiguas
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activando...");
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

// Manejo de peticiones
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Solo manejar peticiones GET
  if (request.method !== "GET") return;

  // Diferenciar entre navegación y otros recursos
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match("/offline.html").then((cachedOffline) => {
        return fetch(request).catch(() => cachedOffline);
      })
    );
  } else {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              // Cachea solo recursos del mismo dominio y Cloudinary
              if (
                request.url.startsWith(self.location.origin) ||
                request.url.includes("res.cloudinary.com")
              ) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            });
          })
          .catch(() => {
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
