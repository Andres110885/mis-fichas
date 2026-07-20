// Service worker: permite instalar la app en el móvil y usarla sin conexión.
// Estrategia:
//  - La página (index.html) y data.json: RED primero -> siempre ves la última
//    versión y las fichas nuevas cuando hay internet; si no hay, tira de caché.
//  - PDFs: red primero; los ya vistos quedan disponibles offline.
//  - Recursos estáticos (visor PDF, iconos): caché primero (rápido).
const CACHE = "fichas-v2";
const SHELL = ["./", "./index.html", "./manifest.webmanifest",
  "./assets/icon-192.png", "./assets/icon-512.png",
  "./assets/pdfjs/pdf.min.js", "./assets/pdfjs/pdf.worker.min.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function networkFirst(req, fallbackKey) {
  return fetch(req).then((res) => {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(fallbackKey || req, copy));
    return res;
  }).catch(() => caches.match(fallbackKey || req).then((h) => h || caches.match("./index.html")));
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Navegaciones (abrir la app) y el propio index.html -> red primero
  if (req.mode === "navigate" ||
      url.pathname.endsWith("/") || url.pathname.endsWith("/index.html")) {
    e.respondWith(networkFirst(req, "./index.html"));
    return;
  }

  // Índice de fichas -> red primero (ver fichas nuevas al instante)
  if (url.pathname.endsWith("data.json")) {
    e.respondWith(networkFirst(req, "./data.json"));
    return;
  }

  // PDFs -> red primero; quedan cacheados tras verlos una vez
  if (url.pathname.toLowerCase().endsWith(".pdf")) {
    e.respondWith(networkFirst(req));
    return;
  }

  // Resto (visor PDF, iconos, fuentes): caché primero
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (url.origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }).catch(() => hit))
  );
});
