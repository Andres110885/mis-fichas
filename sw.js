// Service worker: permite instalar la app en el móvil y verla sin conexión.
const CACHE = "fichas-v1";
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

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // data.json: siempre red primero (para ver fichas nuevas), con copia en caché.
  if (url.pathname.endsWith("/data.json") || url.pathname.endsWith("data.json")) {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put("./data.json", copy));
        return res;
      }).catch(() => caches.match("./data.json"))
    );
    return;
  }

  // PDFs: red primero; si ya se vieron, quedan disponibles offline.
  if (url.pathname.toLowerCase().endsWith(".pdf")) {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Resto (app + CDN): caché primero, con respaldo de red.
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
