const CACHE_NAME = "v27";  // Incrementa la versión para asegurar actualización del caché

const urlsToCache = [
  "/", 
  "/manifest.json",
  "/offline.html",
  "/index.html",  
  "/styles/main.css",
  "/img/icon-192x192.png",
  "/img/icon-512x512.png",
  "/img/volver.png",
  "/img/abrir.png",
  "/img/delete.png",
  "/img/search.png",
  "/img/filtro.png",
  "/img/orden.png",
  "/img/recipe-null.png",  // Imagen por defecto para errores
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

  if (request.method !== "GET") return;  // Ignora solicitudes que no sean GET

  const requestURL = new URL(request.url);

  // Manejo específico para imágenes
  if (request.destination === "image") {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log(`[Service Worker] Imagen servida desde caché: ${request.url}`);
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => caches.match("/img/recipe-null.png"));  // Imagen por defecto si no hay conexión
      })
    );
    return;
  }

  // Cachear solicitudes a la API (recetas y listas de compras)
  if (requestURL.pathname.startsWith("/api/recipes") || requestURL.pathname.startsWith("/api/shopping-lists")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        try {
          const response = await fetch(request);
          cache.put(request, response.clone());  // Guarda la respuesta en caché para uso offline
          return response;
        } catch {
          console.warn("[Service Worker] Sin conexión, usando datos cacheados:", request.url);
          return caches.match(request) || caches.match("/offline.html");
        }
      })
    );
    return;
  }

  // Cacheo estándar para archivos estáticos y recursos de la app
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, response.clone());
          return response;
        });
      }).catch(() => {
        // Si es una navegación (ruta de React), mostrar index.html
        if (request.mode === "navigate") {
          return caches.match("/index.html");
        }
        // Mostrar página offline si no hay nada en caché
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
