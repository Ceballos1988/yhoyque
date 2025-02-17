const CACHE_NAME = "v49"; // Incrementa la versión al actualizar cambios

const urlsToCache = [
  "/",
  "/manifest.json",
  "/offline.html",
  "/shopping-lists",
  "/recipe-wall",
  "/profile",
  "/index.html",
  "/styles/main.css",
  "/img/Logo2.png",
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
  "/img/Logo2.png",
  "/img/hero.webp",
  "/img/imagen5.png",
  "/img/imagen1.png",
  "/img/download-app.png",
  "/img/ico-1.png",
  "/img/ico-2.png",
  "/img/ico-3.png",
  "/img/ico-4.png",
  "/img/ico-5.png",
  "/img/ico-6.png",
  "/img/offline.png",
  "https://res.cloudinary.com/dnlyti3zm/image/upload/v1738963346/volver_vfhz7r.png",
  "https://res.cloudinary.com/dnlyti3zm/image/upload/v1739476123/search_agsvwl.png",
  "/dist/index.html", // Asegurar que se cachea correctamente
  "/dist/offline.html",
  "/dist/manifest.json",
];

// 🔹 Instalación: Guarda archivos esenciales en caché
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// 🔹 Activación: Borra cachés antiguas
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
  self.clients.claim();
});

// 🔹 Intercepta las peticiones y gestiona el caché
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Solo manejar peticiones GET
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (request.url.startsWith(self.location.origin)) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Si la petición es de navegación (una página), mostrar offline.html
          if (request.mode === "navigate") {
            return caches.match("/offline.html").then((response) => {
              return response || new Response(
                `<h1 style="color:white; text-align:center;">Sin conexión</h1><p style="color:white; text-align:center;">No puedes acceder a esta página sin internet.</p>`,
                { headers: { "Content-Type": "text/html" } }
              );
            });
          } else if (request.destination === "image") {
            return caches.match("/img/recipe-null.png");
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
