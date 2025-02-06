/**
 * Nombre de la caché utilizada en la aplicación.
 * Asegúrate de cambiar la versión cada vez que hagas cambios importantes.
 */
const CACHE_NAME = "v13";

/**
 * Lista de archivos a cachear.
 */
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/offline.html",
  "/src/styles/index.css",
  "/img/icons/icon-192x192.png",
  "/img/icons/icon-512x512.png",
  "/img/fondo.svg",
  "/img/fondo-chico.svg",
  "/assets/index.css",
];

/**
 * Evento de instalación: Se encarga de cachear los archivos esenciales.
 */
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Instalando el service worker...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Archivos cacheados:", urlsToCache);
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

/**
 * Evento de activación: Elimina cachés antiguas cuando se actualiza el SW.
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
 * - Si la URL es de `/api/recipes` y es un método GET, intenta cargar desde caché y luego actualizarla con la red.
 * - Para otros recursos estáticos, usa caché si está disponible.
 */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // ❌ Evitar cachear solicitudes que no sean GET
  if (event.request.method !== "GET") {
    return;
  }

  // 🟢 Si es una API de recetas, intentar usar `stale-while-revalidate`
  if (url.pathname.startsWith("/api/recipes")) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            cache.put(event.request, response.clone()); // Guarda solo si es GET
            return response;
          })
          .catch(() => caches.match(event.request) || caches.match("/offline.html"));
      })
    );
    return;
  }

  // 🔵 Cacheo estándar para archivos estáticos
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request)
          .then((response) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
              return response;
            });
          })
          .catch(() => caches.match("/offline.html"))
      );
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
