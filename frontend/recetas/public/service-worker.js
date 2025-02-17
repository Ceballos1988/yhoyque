const CACHE_NAME = "v64"; // 🔹 Incrementar versión para forzar actualización
const API_CACHE = "api-cache"; // 🔹 Caché separada para las peticiones a la API

const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/offline.html", // 📌 Asegurar que se almacene en caché correctamente
  "/shopping-lists",
  "/recipe-wall",
  "/profile",
  "/styles/main.css",
  "/img/offline.png",
  "/img/icon-192x192.png",
  "/img/icon-512x512.png",
  "https://res.cloudinary.com/dnlyti3zm/image/upload/v1738963346/volver_vfhz7r.png",
  "https://res.cloudinary.com/dnlyti3zm/image/upload/v1739476123/search_agsvwl.png",
];

// 🔹 Instalación: Guarda archivos en caché con logs para depuración
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

  // Ignorar peticiones que no sean GET
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
        console.warn(`📌 No hay conexión. Intentando cargar desde caché: ${request.url}`);

        // 🔹 Si la solicitud es de tipo "navigate" (página) y no hay conexión:
        if (request.mode === "navigate") {
          console.warn(`🚨 No se pudo cargar ${request.url}, mostrando offline.html`);

          return caches.match(request) // Intenta cargar desde caché
            .then(response => response || caches.match("/offline.html")) // Si no está, usa offline.html
            .then(response => response || caches.match("/")) // 📌 Si tampoco está, intenta con la página principal
            .then(response => response || new Response(
              `<h1 style="color:white; text-align:center;">Sin conexión</h1>
               <p style="color:white; text-align:center;">
               No puedes acceder a esta página sin internet.</p>`,
              { headers: { "Content-Type": "text/html" } }
            ));
        }

        // 🔹 Si es una imagen y no está en caché, servir imagen de fallback
        if (request.destination === "image") {
          return caches.match("/img/offline.png");
        }

        // 🔹 Si no es una página o imagen, simplemente rechazar
        return new Response("No disponible sin conexión", { status: 503 });
      })
  );
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
