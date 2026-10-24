// yt-server.mjs — jalankan: node yt-server.mjs
// Pencarian: youtubei.js. Audio: yt-dlp mengunduh ke folder audio-cache, server melayani dengan Range.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { Innertube, UniversalCache } from 'youtubei.js';

const run = promisify(execFile);
const YTDLP = fileURLToPath(new URL(process.platform === 'win32' ? './yt-dlp.exe' : './yt-dlp_linux', import.meta.url));
const CACHE_DIR = fileURLToPath(new URL('./audio-cache/', import.meta.url));
fs.mkdirSync(CACHE_DIR, { recursive: true });
const PORT = process.env.PORT || 3001;
const MAX_YTDLP = 2;                    // maksimal proses yt-dlp bersamaan
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
            if (st.size > 0) return { file, length: st.size, mime: MIME[ext] };
        } catch (e) { }
    }
    return null;
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

// ---------- layani audio dari disk (mendukung Range) ----------
async function serveAudio(req, res, id) {
    const a = await getAudio(id);
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

const json = (res, code, obj) => { res.writeHead(code, { ...res.cors, 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };

let prefetching = false;     // maksimal 1 prefetch sekaligus supaya klik lagu tidak antre

const server = http.createServer(async (req, res) => {
    res.cors = corsFor(req);
    const u = new URL(req.url, 'http://x');
    if (req.method === 'OPTIONS') { res.writeHead(204, res.cors); return res.end(); }

    try {
        if (u.pathname === '/' || u.pathname === '/health') return json(res, 200, { ok: true });

        if (u.pathname === '/prefetch') {
            const id = u.searchParams.get('id');
            if (id && /^[\w-]{6,20}$/.test(id) && !prefetching && !findCached(id)) {
                prefetching = true;
                getAudio(id).catch(() => { }).finally(() => { prefetching = false; });
            }
            res.writeHead(204, res.cors);
            return res.end();
        }

        if (u.pathname === '/search') {
            const q = (u.searchParams.get('q') || '').trim();
            if (!q) return json(res, 400, { error: 'q kosong' });
            return json(res, 200, await search(q));
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