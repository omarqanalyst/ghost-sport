// Offline (PRD R9): the whole app is stored when this worker installs (the build
// writes the file list below), so it opens with no network after one visit.
// Media the user picks never goes through here (it lives in IndexedDB as blobs).
const CACHE = "ghost-sport-1795408840134"
const ASSETS = ["./assets/analysis.worker-B15h0Jl8.js","./assets/compare-Oik8R2Go.js","./assets/index-BBQr5PcI.css","./assets/index-CfBvl3xq.js","./assets/smooth-FKP8MA2t.js","./assets/src-BsZ3al1O.js","./icon-192.png","./icon-512.png","./index.html","./manifest.webmanifest","./markers.sealed.json","./voice/1.wav","./voice/2.wav","./voice/3.wav","./voice/4.wav","./voice/5.wav","./voice/6.wav","./voice/7.wav","./voice/8.wav"]
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', ...ASSETS])).then(() => self.skipWaiting()))
})
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})
self.addEventListener('fetch', (e) => {
  const req = e.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== location.origin || req.headers.has('range')) return
  if (req.mode === 'navigate') {
    // Network first for the page itself, the stored copy when offline.
    e.respondWith(fetch(req).catch(() => caches.match('./', { ignoreSearch: true })))
    return
  }
  e.respondWith(
    caches.open(CACHE).then(async (c) => {
      const hit = await c.match(req, { ignoreSearch: true })
      const net = fetch(req)
        .then((res) => {
          if (res.ok) c.put(req, res.clone())
          return res
        })
        .catch(() => hit)
      return hit || net
    }),
  )
})
