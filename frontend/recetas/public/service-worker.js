/**
 * Nombre de la caché utilizada en la aplicación.
 * Asegúrate de cambiar la versión cada vez que hagas cambios importantes.
 */
const CACHE_NAME = "v23";  // Incrementa la versión para asegurarte de que se actualice el caché

/**
 * Lista de archivos a cachear.
 */
const urlsToCache = [
  "/", 
  "/manifest.json",
  "/offline.html",
  "/styles/main.css",
  "/img/icon-192x192.png",
  "/img/icon-512x512.png",
  "/recipe-wall",
  "/shopping-lists",
  "/img/volver.png",
  "/img/delete.png",
  "/img/recipe-null.png",
  "/img/heart-filled.svg",
  "/img/heart-outline.svg",
  "/img/search.png"
];


/**
 * Evento de instalación: Se encarga de cachear los archivos esenciales.
 */
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Instalando el service worker...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        urlsToCache.map((url) => {
          return cache.add(url).catch((err) => {
            console.error(`[Service Worker] Error al cachear ${url}:`, err);
          });
        })
      );
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

  // Cachear todas las solicitudes a la API para que estén disponibles sin conexión
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        try {
          const response = await fetch(event.request);
          cache.put(event.request, response.clone()); // Guarda la respuesta actualizada
          return response;
        } catch  {
          console.warn("[Service Worker] Sin conexión, usando datos cacheados:", event.request.url);
          return caches.match(event.request) || caches.match("/offline.html");  // Usa datos cacheados si no hay conexión
        }
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
