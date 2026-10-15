// ===== sw.js : cache lagu yang sudah pernah diputar + cover =====
const AUDIO = 'spotiware-audio-v1';
const IMG = 'spotiware-img-v1';
const MAX_SONGS = 40;      // maksimal lagu di cache (sekitar 4 MB per lagu). Ubah kalau perlu.
const DEV = ['localhost', '127.0.0.1'].includes(self.location.hostname);

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
    e.waitUntil((async () => {
        // hanya hapus cache lama MILIK Spotiware (origin github.io dipakai bersama proyek lain)
        for (const k of await caches.keys()) {
            if (k.startsWith('spotiware-') && k !== AUDIO && k !== IMG) await caches.delete(k);
        }
        await self.clients.claim();
    })());
});

// lagu dari cache: dukung permintaan Range (seek / buffering) seperti server asli
async function fromCache(req, hit) {
    const blob = await hit.blob();
    const size = blob.size;
    const type = hit.headers.get('Content-Type') || 'audio/mpeg';
    const range = req.headers.get('range');
    const full = () => new Response(blob, {
        status: 200,
        headers: { 'Content-Type': type, 'Content-Length': String(size), 'Accept-Ranges': 'bytes' }
    });
    if (!range) return full();

    const m = /bytes=(\d*)-(\d*)/.exec(range);
    if (!m) return full();
    let start, end;
    if (m[1] === '') {                                   // "bytes=-500" = 500 byte terakhir
        start = Math.max(0, size - parseInt(m[2], 10));
        end = size - 1;
    } else {
        start = parseInt(m[1], 10);
        end = m[2] === '' ? size - 1 : Math.min(parseInt(m[2], 10), size - 1);
    }
    if (isNaN(start) || isNaN(end) || start >= size || start > end) {
        return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + size } });
    }
    return new Response(blob.slice(start, end + 1, type), {
        status: 206,
        headers: {
            'Content-Type': type,
            'Content-Length': String(end - start + 1),
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Accept-Ranges': 'bytes'
        }
    });
}

async function trim(cache) {
    const keys = await cache.keys();                     // urutan = yang paling lama disimpan di depan
    for (let i = 0; i < keys.length - MAX_SONGS; i++) await cache.delete(keys[i]);
}

async function cacheSong(u) {
    const url = new URL(u, self.location.href);
    url.hash = '';
    if (url.origin !== self.location.origin || !/\.mp3$/i.test(url.pathname)) return;
    const cache = await caches.open(AUDIO);
    if (await cache.match(url.href)) return;
    try {
        const res = await fetch(url.href);               // unduh penuh (tanpa Range)
        if (res.status !== 200) return;
        await cache.put(url.href, res);
        await trim(cache);
    } catch (_) {}
}

// halaman memberi tahu: "lagu ini sudah didengarkan, simpan"
self.addEventListener('message', (e) => {
    const d = e.data || {};
    if (DEV || d.type !== 'cache-song' || !d.url) return;
    e.waitUntil(cacheSong(d.url));
});

self.addEventListener('fetch', (e) => {
    if (DEV) return;
    const req = e.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

    // lagu: dari cache kalau ada, kalau tidak dari jaringan seperti biasa
    if (/\.mp3$/i.test(url.pathname)) {
        e.respondWith((async () => {
            const cache = await caches.open(AUDIO);
            const hit = await cache.match(req.url);
            return hit ? fromCache(req, hit) : fetch(req);
        })());
        return;
    }

    // gambar / cover: tampilkan dari cache, sambil memperbarui di belakang layar
    if (/\.(webp|avif|png|jpe?g|gif|svg)$/i.test(url.pathname)) {
        e.respondWith((async () => {
            const cache = await caches.open(IMG);
            const hit = await cache.match(req);
            const refresh = fetch(req)
                .then((res) => { if (res && res.ok) cache.put(req, res.clone()); return res; })
                .catch(() => null);
            if (hit) { e.waitUntil(refresh); return hit; }
            return (await refresh) || Response.error();
        })());
    }
});