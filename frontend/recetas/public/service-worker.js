const CACHE_NAME = "v44"; // Incrementa el número de versión para forzar una actualización

const urlsToCache = [
  "/",
  "/manifest.json",
  "/offline.html",
  "/shopping-lists",
  "/recipe-wall",
  "/profile",
  "/index.html",
  "/styles/main.css",
  "/img/icon-192x192.png",
  "/img/volver.png",
  "/img/icon-512x512.png",
  "/img/abrir.png",
  "/img/delete.png",
  "/img/search.png",
  "/img/filtro.png",
  "/img/orden.png",
  "/img/cerrar.png",
  "/img/recipe-null.png",
  "/img/heart-filled.svg",
  "/img/heart-outline.svg",
  "/img/edit.png",
  "/img/offline.png",
  "https://res.cloudinary.com/dnlyti3zm/image/upload/v1738963346/volver_vfhz7r.png"
];

// 🔹 Instalación: Almacena los archivos en la caché
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Activa el Service Worker inmediatamente
});

// 🔹 Activación: Elimina versiones antiguas del caché
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
  self.clients.claim(); // Toma control de todas las páginas inmediatamente
});

// 🔹 Manejo de las solicitudes de red
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Ignorar peticiones que no sean GET
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          // Guardar en caché las páginas de recetas navegadas dinámicamente
          if (
            request.url.includes("/api/recipes") || // API de recetas
            request.url.includes("/recipe-wall") // Página de RecipeWall
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Si falla la red, devolver contenido alternativo
          if (request.mode === "navigate") {
            return caches.match("/index.html"); // Mantener la SPA funcionando
          } else if (request.destination === "image") {
            return caches.match("/img/recipe-null.png"); // Imagen por defecto
          } else {
            return caches.match("/offline.html");
          }
        });
    })
  );
});


// 🔹 Permitir que el nuevo Service Worker se active inmediatamente
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
