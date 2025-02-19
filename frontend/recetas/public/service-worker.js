const CACHE_NAME = "v21"; // 🔹 Incrementar versión para forzar actualización

const urlsToCache = [
  "/", "/index.html", "/manifest.json", "/offline.html",
  "/shopping-lists", "/recipe-wall", "/styles/main.css",
  "/img/offline.png", "/img/icon-192x192.png", "/img/icon-512x512.png",
  "/img/Logo2.png", "/img/hero.webp", "/img/bg-hero.jpg",
  "/img/imagen1.png", "/img/download-app.png", "/img/imagen5.png",
  "/img/delete.png", "/img/edit.png", "/img/recipe-null.png", "/img/saved.svg"
];

// 🔹 Instalación: Guarda archivos en caché
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        await cache.addAll(urlsToCache);
      } catch (err) {
        console.error("❌ Error al agregar archivos a la caché:", err);
      }
    })
  );
  self.skipWaiting();
});

// 🔹 Activación: Borra cachés antiguas y activa inmediatamente el SW
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

// 🔹 Intercepta peticiones y maneja caché
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(async () => {
        if (request.mode === "navigate") {
          return caches.match("/offline.html").then(response => response || new Response(
            `<h1 style="color:white; text-align:center;">Sin conexión</h1>
             <p style="color:white; text-align:center;">
             No puedes acceder a esta página sin internet.</p>`,
            { headers: { "Content-Type": "text/html" } }
          ));
        }

        if (request.destination === "image") {
          return caches.match(request).then(response => response || caches.match("/img/offline.png"));
        }

        return new Response("No disponible sin conexión", { status: 503 });
      })
  );
});

// 🔹 Permitir activación inmediata del nuevo Service Worker
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// 🔹 Notificar a los clientes cuando haya una nueva versión del SW
self.addEventListener("activate", () => {
  self.clients.matchAll().then((clients) => {
    if (clients.length > 0) {
      clients.forEach(client => {
        client.postMessage({ type: "NEW_VERSION_AVAILABLE" });
      });
    }
  });
});
