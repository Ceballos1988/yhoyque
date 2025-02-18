const CACHE_NAME = "v65"; // 🔹 Incrementa la versión para forzar actualización
const API_CACHE = "api-cache"; // 🔹 Caché separada para las peticiones a la API

const urlsToCache = [
  "/", 
  "/index.html",
  "/manifest.json",
  "/offline.html", // 📌 Asegurar que se almacene en caché correctamente
  "/shopping-lists",
  "/recipe-wall",
  "/styles/main.css",
  "/src/main.jsx", // 📌 Cachear explícitamente el archivo principal de React
  "/img/offline.png",
  "/img/icon-192x192.png",
  "/img/icon-512x512.png",
  "/img/Logo2.png",
  "/img/delete.png",
  "/img/edit.png",
  "/img/recipe-null.png",
  "/img/volver.png",
  "/img/search.png",
  "/img/filtro.png",
  "/img/orden.png",
  "/img/cerrar.png",
  "/img/heart-filled.svg",
  "/img/heart-outline.svg",
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
  "https://res.cloudinary.com/dnlyti3zm/image/upload/v1739476123/search_agsvwl.png"
];

// 🔹 Instalación: Guarda archivos en caché con logs
self.addEventListener("install", (event) => {
  console.log("🛠️ Instalando Service Worker...");

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log("📥 Intentando guardar en caché los archivos:", urlsToCache);
        
        try {
          await cache.addAll(urlsToCache);
          console.log("✅ Archivos guardados en caché correctamente.");
        } catch (err) {
          console.error("❌ Error al agregar archivos a la caché:", err);
        }
      })
  );

  self.skipWaiting();
});

// 🔹 Activación: Borra cachés antiguas y activa inmediatamente el SW
self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker activado.");

  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
            console.log(`🗑️ Eliminando caché antigua: ${cacheName}`);
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

  // ❌ Evitar cachear archivos de Vite (no sirven en producción)
  if (request.url.includes("@vite/") || request.url.includes("vite/client")) {
    console.warn("⏭️ Ignorando archivo de Vite:", request.url);
    return;
  }

  // ✅ Si la petición es GET, manejar con caché
  if (request.method === "GET") {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log(`📂 Sirviendo desde caché: ${request.url}`);
          return cachedResponse;
        }

        return fetch(request)
          .then((networkResponse) => {
            if (request.url.startsWith(self.location.origin)) {
              return caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse.clone());
                return networkResponse;
              });
            }
            return networkResponse;
          })
          .catch(async () => {
            console.warn(`📌 No hay conexión. Intentando cargar desde caché: ${request.url}`);

            // 🔹 Si es una navegación (página) y no hay conexión, mostrar offline.html
            if (request.mode === "navigate") {
              console.warn(`🚨 No se pudo cargar ${request.url}, mostrando offline.html`);
              return caches.match("/offline.html");
            }

            // 🔹 Si es una imagen, servir imagen de fallback
            if (request.destination === "image") {
              return caches.match("/img/offline.png");
            }

            return new Response("No disponible sin conexión", { status: 503 });
          });
      })
    );
  }
});

// 🔹 Permitir activación inmediata del nuevo Service Worker
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("⏭️ Activando nueva versión del Service Worker...");
    self.skipWaiting();
  }
});

// 🔹 Notificar a los clientes cuando haya una nueva versión del SW
self.addEventListener("updatefound", () => {
  console.log("🔄 Nueva versión del Service Worker detectada.");
  self.clients.matchAll().then((clients) => {
    clients.forEach(client => {
      client.postMessage({ type: "NEW_VERSION_AVAILABLE" });
    });
  });
});
