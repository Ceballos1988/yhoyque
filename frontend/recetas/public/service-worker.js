/**
 * Nombre de la caché utilizada en la aplicación.
 * Asegúrate de cambiar la versión cada vez que hagas cambios importantes.
 */
const CACHE_NAME = "v16";  // Incrementa la versión para asegurarte de que se actualice el caché

/**
 * Lista de archivos a cachear.
 */
const urlsToCache = [
  "/", 
  "/index.html",
  "/recipe-wall",
  "/profile",
  "/shopping-lists",
  "/manifest.json",
  "/offline.html",
  "/src/styles/index.css",
  "/assets/index.css",
  "/img/icon-192x192.png",
  "/img/icon-512x512.png",
  "/img/fondo.svg",
  "/img/fondo-chico.svg",
  "/img/hero.webp",
  "/img/recipe-null.png",
  "/img/abrir.png",         // Imágenes adicionales
  "/img/volver.png",
  "/img/delete.png",
  "/img/pause.png",
  "/img/play.png",
  "/img/favorito.png",
  "/img/no-favorito.png"
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
  self.skipWaiting();  // Forzar la activación inmediata del nuevo SW
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
  self.clients.claim();  // Tomar el control de todas las páginas inmediatamente
});

/**
 * Manejo de peticiones:
 * - Cache First para recursos estáticos.
 * - Stale-While-Revalidate para APIs (intenta mostrar datos cacheados mientras actualiza en segundo plano).
 */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Evitar cachear solicitudes que no sean GET
  if (event.request.method !== "GET") {
    return;
  }

  // Manejar todas las APIs de tu backend para que funcionen offline
  if (url.origin === "https://yhoyque.onrender.com") {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            cache.put(event.request, response.clone());  // Actualiza el caché con la nueva respuesta
            return response;
          })
          .catch(() => caches.match(event.request) || caches.match("/offline.html"));  // Muestra datos cacheados si no hay conexión
      })
    );
    return;
  }

  // Cacheo estándar para archivos estáticos
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||  // Devuelve desde el caché si está disponible
        fetch(event.request)
          .then((response) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());  // Almacena en caché la nueva respuesta
              return response;
            });
          })
          .catch(() => caches.match("/offline.html"))  // Si no hay caché ni conexión, muestra la página offline
      );
    })
  );
});

/**
 * Permite forzar la actualización del Service Worker manualmente.
 */
self.addEventListener("message", (event) => {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();  // Forzar la activación del nuevo Service Worker
  }
});
