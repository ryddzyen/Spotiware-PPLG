// yt-server.mjs — jalankan: node yt-server.mjs
// Pencarian: youtubei.js. Audio: yt-dlp mengunduh ke folder cache, server melayani dengan Range.
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { Innertube, UniversalCache } from 'youtubei.js';

const run = promisify(execFile);
const YTDLP = fileURLToPath(new URL(process.platform === 'win32' ? './yt-dlp_win/yt-dlp.exe' : './yt-dlp_linux', import.meta.url));
const CACHE_DIR = path.join(os.homedir(), 'spotiware-audio-cache') + path.sep;
fs.mkdirSync(CACHE_DIR, { recursive: true });
const PORT = process.env.PORT || 3001;
const MAX_YTDLP = 3;
const CACHE_FILES = 150;                // simpan maksimal 150 lagu di disk
const MIME = { m4a: 'audio/mp4', mp4: 'audio/mp4', webm: 'audio/webm', opus: 'audio/ogg', ogg: 'audio/ogg', mp3: 'audio/mpeg' };

// domain yang boleh memanggil server ini (env ALLOWED_ORIGINS, pisahkan dengan koma)
const ALLOWED = (process.env.ALLOWED_ORIGINS || 'https://ryddzyen.github.io').split(',').map(s => s.trim()).filter(Boolean);
const isLocal = o => /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(o);
function corsFor(req) {
    const o = req.headers.origin;
    const h = {
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Range',
        'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
        'Vary': 'Origin'
    };
    if (o && (ALLOWED.includes(o) || isLocal(o))) h['Access-Control-Allow-Origin'] = o;
    return h;
}

let yt = null;
async function getYT() {
    if (!yt) yt = await Innertube.create({ cache: new UniversalCache(false), generate_session_locally: true });
    return yt;
}

// ---------- cover resolusi tinggi ----------
const thumbCache = new Map();
async function bestThumb(id, url) {
    url = url || '';
    if (/=w\d+-h\d+/.test(url)) return url.replace(/=w\d+-h\d+/, '=w544-h544');
    if (/ytimg\.com/.test(url) || !url) {
        if (thumbCache.has(id)) return thumbCache.get(id);
        let best = url;
        for (const f of ['maxresdefault', 'hqdefault']) {
            const u = `https://i.ytimg.com/vi/${id}/${f}.jpg`;
            try { const r = await fetch(u, { method: 'HEAD' }); if (r.ok) { best = u; break; } } catch (e) { }
        }
        thumbCache.set(id, best);
        return best;
    }
    return url;
}

async function search(q) {
    const t = await getYT();
    const res = await t.music.search(q, { type: 'song' });
    const out = [], seen = new Set();
    for (const shelf of (res.contents || [])) {
        for (const it of (shelf.contents || [])) {
            if (!it || !it.id || seen.has(it.id)) continue;
            if (it.item_type && !['song', 'video'].includes(it.item_type)) continue;
            seen.add(it.id);
            const th = it.thumbnails || [];
            out.push({
                id: it.id,
                title: it.title || it.name || 'Tanpa judul',
                artist: (it.artists || []).map(a => a.name).filter(Boolean).join(', ') || (it.author && it.author.name) || 'Unknown',
                thumb: th.length ? th[th.length - 1].url : '',
                duration: (it.duration && it.duration.seconds) || 0
            });
        }
    }
    const top = out.slice(0, 30);
    await Promise.all(top.map(async o => { o.thumb = await bestThumb(o.id, o.thumb); }));
    return top;
}

// ---------- Langkah 2: playlist, artis, pencarian playlist/artis ----------
const memoMap = new Map();
async function memo(key, ttl, fn) {            // hasil disimpan sebentar supaya YouTube tidak dipanggil berulang
    const c = memoMap.get(key);
    if (c && c.exp > Date.now()) return c.v;
    const v = await fn();
    if (memoMap.size > 200) memoMap.clear();
    memoMap.set(key, { v, exp: Date.now() + ttl });
    return v;
}

const hits = new Map();
function rateLimited(req) {                    // maksimal 60 permintaan/menit per alamat (selain /audio)
    const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    const now = Date.now();
    const h = (hits.get(ip) || []).filter(t => now - t < 60000);
    h.push(now);
    hits.set(ip, h);
    if (hits.size > 500) hits.clear();
    return h.length > 60;
}

const txt = v => (typeof v === 'string' ? v : (v && (v.text || v.name)) || '');
const lastThumb = th => { th = th || []; return th.length ? th[th.length - 1].url : ''; };
const fastThumb = url => /=w\d+-h\d+/.test(url || '') ? url.replace(/=w\d+-h\d+/, '=w544-h544') : (url || '');

function mapSong(it) {
    if (!it || !it.id) return null;
    if (it.item_type && !['song', 'video'].includes(it.item_type)) return null;
    return {
        id: it.id,
        title: txt(it.title) || txt(it.name) || 'Tanpa judul',
        artist: (it.artists || []).map(a => a.name).filter(Boolean).join(', ') || (it.author && it.author.name) || 'Unknown',
        thumb: fastThumb(lastThumb(it.thumbnails)),
        duration: (it.duration && it.duration.seconds) || 0
    };
}

async function searchOther(q, type) {          // type: 'playlist' | 'artist'
    const t = await getYT();
    const res = await t.music.search(q, { type });
    const out = [], seen = new Set();
    for (const shelf of (res.contents || [])) {
        for (const it of (shelf.contents || [])) {
            if (!it || !it.id || seen.has(it.id) || it.item_type !== type) continue;
            seen.add(it.id);
            const thumb = fastThumb(lastThumb(it.thumbnails));
            if (type === 'artist') {
                out.push({ id: it.id, name: txt(it.name) || txt(it.title) || 'Unknown', thumb, subs: it.subscribers || '' });
            } else {
                const au = it.author;
                out.push({
                    id: String(it.id).replace(/^VL/, ''),
                    title: txt(it.title) || txt(it.name) || 'Playlist',
                    author: typeof au === 'string' ? au : (au && au.name) || '',
                    thumb,
                    count: it.item_count || ''
                });
            }
        }
    }
    return out.slice(0, 20);
}

async function playlistSongs(id) {
    const t = await getYT();
    let pl = await t.music.getPlaylist(id);
    const head = pl.header || {};
    let items = pl.items || [];
    for (let i = 0; i < 3 && pl.has_continuation && items.length < 300; i++) {   // halaman berikutnya
        try { pl = await pl.getContinuation(); items = items.concat(pl.items || []); } catch (e) { break; }
    }
    const songs = items.map(mapSong).filter(Boolean).slice(0, 300);
    const au = head.author;
    return {
        id,
        title: txt(head.title) || 'Playlist',
        author: typeof au === 'string' ? au : (au && au.name) || '',
        thumb: fastThumb(lastThumb(head.thumbnails) || (head.thumbnail && lastThumb(head.thumbnail.contents)) || (songs[0] && songs[0].thumb) || ''),
        songs
    };
}

async function artistInfo(id) {
    const t = await getYT();
    const a = await t.music.getArtist(id);
    const head = a.header || {};
    const name = txt(head.title) || 'Artist';
    let items = [];
    try {                                      // semua lagu artis, kalau tersedia
        const all = await a.getAllSongs();
        if (all && Array.isArray(all.contents)) items = all.contents;
    } catch (e) { }
    if (!items.length) {                       // cadangan: daftar lagu teratas di halaman artis
        for (const s of (a.sections || [])) {
            if (s.type === 'MusicShelf' && Array.isArray(s.contents) && s.contents.length) { items = s.contents; break; }
        }
    }
    const songs = items.map(mapSong).filter(Boolean).slice(0, 100)
        .map(s => s.artist === 'Unknown' ? { ...s, artist: name } : s);
    return {
        id,
        name,
        thumb: fastThumb(lastThumb(head.thumbnails) || (head.thumbnail && lastThumb(head.thumbnail.contents)) || (songs[0] && songs[0].thumb) || ''),
        songs
    };
}

// ---------- unduh audio dengan yt-dlp ke folder cache ----------
let active = 0;
const waiters = [];
async function limit(fn) {
    if (active >= MAX_YTDLP) await new Promise(r => waiters.push(r));
    active++;
    try { return await fn(); }
    finally { active--; const w = waiters.shift(); if (w) w(); }
}

function findCached(id) {
    let names;
    try { names = fs.readdirSync(CACHE_DIR); } catch (e) { return null; }
    for (const f of names) {
        if (!f.startsWith(id + '.')) continue;
        const ext = path.extname(f).slice(1).toLowerCase();
        if (!MIME[ext]) continue;                         // lewati file .part / .ytdl (belum selesai)
        const file = path.join(CACHE_DIR, f);
        try {
            const st = fs.statSync(file);
            if (st.size > 0) return { file, length: st.size, size: st.size, mime: MIME[ext], final: true };
        } catch (e) { }
    }
    return null;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// file yang sedang diunduh yt-dlp (berakhiran .part)
function findPart(id) {
    let names;
    try { names = fs.readdirSync(CACHE_DIR); } catch (e) { return null; }
    for (const f of names) {
        if (!f.startsWith(id + '.') || !f.endsWith('.part')) continue;
        const ext = path.extname(f.slice(0, -5)).slice(1).toLowerCase();
        const file = path.join(CACHE_DIR, f);
        try {
            const st = fs.statSync(file);
            return { file, size: st.size, mime: MIME[ext] || 'audio/mp4', final: false };
        } catch (e) { }
    }
    return null;
}

async function readChunk(file, pos, len) {
    const fh = await fs.promises.open(file, 'r');
    try {
        const buf = Buffer.alloc(len);
        const { bytesRead } = await fh.read(buf, 0, len, pos);
        return buf.subarray(0, bytesRead);
    } finally { await fh.close(); }
}

function pruneCache() {
    try {
        const files = fs.readdirSync(CACHE_DIR).map(f => {
            const p = path.join(CACHE_DIR, f);
            return { p, t: fs.statSync(p).mtimeMs };
        }).sort((a, b) => b.t - a.t);
        files.slice(CACHE_FILES).forEach(x => { try { fs.unlinkSync(x.p); } catch (e) { } });
    } catch (e) { }
}

const inflight = new Map();      // lagu yang sama diminta berkali-kali hanya diunduh sekali
function getAudio(id) {
    const c = findCached(id);
    if (c) return Promise.resolve(c);
    if (!inflight.has(id)) inflight.set(id, download(id).finally(() => inflight.delete(id)));
    return inflight.get(id);
}

async function download(id) {
    const t0 = Date.now();
    let lastErr = null;
    for (let attempt = 1; attempt <= 2; attempt++) {        // coba ulang sekali kalau gagal
        try {
            await limit(() => run(YTDLP, [
                '--js-runtimes', 'node',
                '-f', 'bestaudio[ext=m4a]/bestaudio',
                '--no-playlist', '--no-warnings', '--no-progress',
                '-o', path.join(CACHE_DIR, id + '.%(ext)s'),
                'https://www.youtube.com/watch?v=' + id
            ], { timeout: 120000, maxBuffer: 10 * 1024 * 1024 }));
            const c = findCached(id);
            if (!c) throw new Error('file audio tidak terbentuk');
            console.log('[audio]', id, 'siap (' + c.mime + ', ' + c.length + ' byte) dalam ' + (Date.now() - t0) + ' ms');
            pruneCache();
            return c;
        } catch (e) {
            if (e.code === 'ENOENT') throw new Error('yt-dlp tidak ditemukan (' + YTDLP + ')');
            lastErr = new Error('yt-dlp gagal: ' + String(e.stderr || e.message).trim().split('\n').pop());
            console.log('[audio]', id, 'percobaan', attempt, 'gagal:', lastErr.message);
        }
    }
    throw lastErr;
}

// ---------- layani audio (file selesai: Range penuh; file masih diunduh: kirim sambil jalan) ----------
async function serveAudio(req, res, id) {
    let a = findCached(id);
    if (!a) {
        const job = getAudio(id);                 // mulai unduhan (atau gabung kalau sudah berjalan)
        job.catch(() => { });
        const m0 = /^bytes=(\d*)-/.exec(req.headers.range || '');
        const from = m0 && m0[1] !== '' ? parseInt(m0[1]) : 0;
        if (from === 0 && req.method !== 'HEAD') return serveGrowing(req, res, id, job);
        a = await job;                            // permintaan loncat ke tengah lagu: tunggu sampai selesai
    }
    return serveFile(req, res, a);
}

async function serveFile(req, res, a) {
    const total = a.length;
    let start = 0, end = total - 1;
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (m) {
        if (m[1] === '' && m[2] !== '') start = Math.max(0, total - parseInt(m[2]));   // bytes=-N
        else {
            if (m[1] !== '') start = parseInt(m[1]);
            if (m[2] !== '') end = Math.min(end, parseInt(m[2]));
        }
    }
    if (start >= total || start > end) {
        res.writeHead(416, { ...res.cors, 'Content-Range': 'bytes */' + total });
        return res.end();
    }
    res.writeHead(206, {
        ...res.cors,
        'Content-Type': a.mime,
        'Content-Length': end - start + 1,
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, max-age=3600'
    });
    if (req.method === 'HEAD') return res.end();
    try { await pipeline(fs.createReadStream(a.file, { start, end }), res); }
    catch (e) { /* browser memutus koneksi (seek/ganti lagu): abaikan */ }
}

// tunggu buffer kosong atau koneksi ditutup, lalu lepas kedua pendengar (supaya tidak menumpuk)
function waitDrain(res) {
    return new Promise(resolve => {
        const done = () => { res.off('drain', done); res.off('close', done); resolve(); };
        res.once('drain', done);
        res.once('close', done);
    });
}

async function serveGrowing(req, res, id, job) {
    let closed = false, done = false, failed = false;
    res.on('close', () => { closed = true; });
    job.then(() => { done = true; }, () => { failed = true; });

    // tunggu sampai ada data awal (sekitar 64 KB) atau unduhan selesai
    const t0 = Date.now();
    let cur = null;
    while (!closed && !failed) {
        cur = findCached(id) || findPart(id);
        if (cur && cur.size > 64 * 1024) break;
        if (done && cur) break;
        if (Date.now() - t0 > 120000) break;
        await sleep(150);
    }
    if (closed) return;
    if (failed || !cur) await job;                // melempar error aslinya, dibalas 502 oleh handler

    res.writeHead(200, { ...res.cors, 'Content-Type': cur.mime, 'Cache-Control': 'no-store' });
    let pos = 0, lastData = Date.now();
    while (!closed) {
        const c = findCached(id) || findPart(id);
        if (c && c.size > pos) {
            try {
                const buf = await readChunk(c.file, pos, Math.min(c.size - pos, 256 * 1024));
                if (buf.length) {
                    pos += buf.length;
                    lastData = Date.now();
                    if (!res.write(buf)) await waitDrain(res);
                    continue;
                }
            } catch (e) { /* file baru saja di-rename jadi final: coba lagi */ }
        }
        if (c && c.final && pos >= c.size) break;           // file akhir sudah terkirim penuh
        if (failed) { res.destroy(); return; }
        if (Date.now() - lastData > 60000) break;
        await sleep(120);
    }
    if (!closed) res.end();
}

const json = (res, code, obj) => { res.writeHead(code, { ...res.cors, 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };

const prefetchQueue = [];
let prefetchWorkers = 0;
function pumpPrefetch() {
    while (prefetchWorkers < 2 && prefetchQueue.length) {      // dua lagu disiapkan bersamaan
        prefetchWorkers++;
        (async () => {
            while (prefetchQueue.length) {
                const id = prefetchQueue.shift();
                if (findCached(id)) continue;
                try { await getAudio(id); } catch (e) { }
            }
            prefetchWorkers--;
        })();
    }
}

const server = http.createServer(async (req, res) => {
    res.cors = corsFor(req);
    if (req.method === 'OPTIONS') { res.writeHead(204, res.cors); return res.end(); }
    const u = new URL(req.url, 'http://x');
    if (u.pathname !== '/audio' && u.pathname !== '/prefetch' && u.pathname !== '/health' && rateLimited(req)) {
        res.writeHead(429, { ...res.cors, 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'terlalu banyak permintaan, coba sebentar lagi' }));
    }

    try {
        if (u.pathname === '/' || u.pathname === '/health') return json(res, 200, { ok: true });

        if (u.pathname === '/prefetch') {
            const ids = (u.searchParams.get('id') || '').split(',').filter(x => /^[\w-]{6,20}$/.test(x)).slice(0, 5);
            prefetchQueue.length = 0;                    // permintaan terbaru menggantikan antrean lama
            for (const x of ids) if (!findCached(x)) prefetchQueue.push(x);
            pumpPrefetch();
            res.writeHead(204, res.cors);
            return res.end();
        }

        if (u.pathname === '/search') {
            const q = (u.searchParams.get('q') || '').trim();
            if (!q) return json(res, 400, { error: 'q kosong' });
            const type = u.searchParams.get('type') || 'song';
            if (type === 'playlist' || type === 'artist') {
                return json(res, 200, await memo('s:' + type + ':' + q.toLowerCase(), 5 * 60 * 1000, () => searchOther(q, type)));
            }
            return json(res, 200, await search(q));       // pencarian lagu: perilaku lama tidak berubah
        }

        if (u.pathname === '/playlist') {
            const id = (u.searchParams.get('id') || '').replace(/^VL/, '');
            if (!/^[\w-]{2,64}$/.test(id)) return json(res, 400, { error: 'id tidak valid' });
            return json(res, 200, await memo('pl:' + id, 10 * 60 * 1000, () => playlistSongs(id)));
        }

        if (u.pathname === '/artist') {
            const id = u.searchParams.get('id') || '';
            if (!/^[\w-]{10,40}$/.test(id)) return json(res, 400, { error: 'id tidak valid' });
            return json(res, 200, await memo('ar:' + id, 10 * 60 * 1000, () => artistInfo(id)));
        }

        if (u.pathname === '/audio') {
            const id = u.searchParams.get('id');
            if (!id || !/^[\w-]{6,20}$/.test(id)) return json(res, 400, { error: 'id tidak valid' });
            return await serveAudio(req, res, id);
        }

        json(res, 404, { error: 'tidak ditemukan' });
    } catch (e) {
        if (e.name === 'AbortError' || res.destroyed) return;
        console.log('[error]', u.pathname, e.message);
        if (!res.headersSent) json(res, 502, { error: e.message });
        else res.destroy();
    }
});
server.keepAliveTimeout = 120000;
server.headersTimeout = 125000;
server.listen(PORT, '127.0.0.1', () => console.log('Server YouTube Music siap di port ' + PORT));