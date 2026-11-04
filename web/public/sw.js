// Service worker for the installed app: caches the app shell only. API data, the live stream and
// ingest never go through it, so nothing private is stored on the device.
const CACHE = "mycelium-shell-v1";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.add("/")));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

function keep(req, res) {
  if (res.ok) caches.open(CACHE).then((c) => c.put(req, res));
}

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  if (e.request.mode === "navigate") {
    // Network first so a deploy shows at once; the cached shell opens the app when offline.
    e.respondWith(fetch(e.request).then((res) => { keep("/", res.clone()); return res; }).catch(() => caches.match("/")));
    return;
  }
  // shortcut: hashed assets from old deploys stay cached until CACHE is bumped; prune them if the cache grows.
  if (url.pathname.startsWith("/assets/")) {
    e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => { keep(e.request, res.clone()); return res; })));
  }
});
