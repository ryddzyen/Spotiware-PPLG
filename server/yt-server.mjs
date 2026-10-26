// yt-server.mjs — jalankan: node yt-server.mjs
// Pencarian: youtubei.js. Audio: yt-dlp mengunduh ke folder cache, server melayani dengan Range.
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { Innertube, UniversalCache } from 'youtubei.js';

const run = promisify(execFile);
const YTDLP = fileURLToPath(new URL(process.platform === 'win32' ? './yt-dlp_win/yt-dlp.exe' : './yt-dlp_linux', import.meta.url));
const CACHE_DIR = path.join(os.homedir(), 'spotiware-audio-cache') + path.sep;
fs.mkdirSync(CACHE_DIR, { recursive: true });
const PORT = process.env.PORT || 3001;
const STREAM_WHILE_DOWNLOADING = false;
const MAX_YTDLP = 2;                    // yt-dlp bersamaan: lebih banyak malah membuat semuanya lebih lambat di laptop
const DIRECT_STREAM = false;            // YouTube menolak (403) streaming langsung untuk klien TVHTML5
const YT_ARGS = process.env.YT_CLIENT ? ['--extractor-args', 'youtube:player_client=' + process.env.YT_CLIENT] : [];
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

// kalau pemanggilan ke YouTube gagal (jaringan tersendat), buat sesi baru lalu coba sekali lagi
async function retryYT(fn) {
    try { return await fn(); }
    catch (e) {
        console.log('[yt] gagal (' + e.message + '), membuat sesi baru lalu mencoba lagi');
        yt = null;
        await new Promise(r => setTimeout(r, 400));
        return await fn();
    }
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
    return h.length > 120;
}

const txt = v => (typeof v === 'string' ? v : (v && (v.text || v.name)) || '');
const lastThumb = th => { th = th || []; return th.length ? th[th.length - 1].url : ''; };
const fastThumb = url => /=w\d+-h\d+/.test(url || '') ? url.replace(/=w\d+-h\d+/, '=w544-h544') : (url || '');


// ambil URL cover dari berbagai bentuk data youtubei.js (array, objek MusicThumbnail, dst.)
function pickThumb(it) {
    const cands = [
        it && it.thumbnails,
        it && it.thumbnail,
        it && it.thumbnail && it.thumbnail.contents,
        it && it.thumbnail && it.thumbnail.thumbnails
    ];
    for (const c of cands) {
        if (Array.isArray(c) && c.length) {
            const u = c[c.length - 1] && c[c.length - 1].url;
            if (u) return fastThumb(u);
        }
    }
    return '';
}

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
            const thumb = pickThumb(it);
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

// ---------- Langkah 6: saran pencarian, beranda, album ----------
async function suggestions(q) {
    const t = await getYT();
    const res = await t.music.getSearchSuggestions(q);
    const out = [], seen = new Set();
    for (const sec of (res || [])) {
        for (const it of (sec.contents || [])) {
            const s = (txt(it.suggestion) || txt(it.title)).trim();
            if (s && !seen.has(s.toLowerCase())) { seen.add(s.toLowerCase()); out.push(s); }
        }
    }
    return out.slice(0, 8);
}

function mapHomeItem(it) {
    if (!it || !it.id) return null;
    const type = it.item_type || '';
    const thumb = pickThumb(it);
    if (type === 'song' || type === 'video') { const s = mapSong(it); return s ? { k: 's', ...s, thumb: s.thumb || thumb } : null; }
    const au = it.author;
    const sub = txt(it.subtitle) || (typeof au === 'string' ? au : (au && au.name) || '');
    if (type === 'playlist') return { k: 'p', id: String(it.id).replace(/^VL/, ''), title: txt(it.title), sub, thumb };
    if (type === 'artist') return { k: 'a', id: it.id, title: txt(it.name) || txt(it.title), sub: 'Artist', thumb };
    if (type === 'album') return { k: 'b', id: it.id, title: txt(it.title), sub, thumb };
    return null;
}

async function homeFeed() {
    const t = await getYT();
    const feed = await t.music.getHomeFeed();
    const out = [];
    for (const sec of (feed.sections || [])) {
        const title = txt(sec.header && sec.header.title);
        const items = (sec.contents || []).map(mapHomeItem).filter(Boolean).slice(0, 20);
        if (title && items.length) out.push({ title, items });
    }
    return { sections: out.slice(0, 8) };
}

async function albumSongs(id) {
    const t = await getYT();
    const al = await t.music.getAlbum(id);
    const head = al.header || {};
    const au = head.author;
    const author = typeof au === 'string' ? au : (au && au.name) || '';
    const thumb = fastThumb(lastThumb(head.thumbnails) || (head.thumbnail && lastThumb(head.thumbnail.contents)) || '');
    const songs = (al.contents || []).map(mapSong).filter(Boolean).slice(0, 100)
        .map(s => ({ ...s, thumb: s.thumb || thumb, artist: s.artist === 'Unknown' ? (author || 'Unknown') : s.artist }));
    return { id, title: txt(head.title) || 'Album', author, thumb, songs };
}
// ---------- lagu berikutnya yang berkaitan (radio YouTube Music) ----------
function mapPanel(it) {
    const id = it && (it.video_id || it.id);
    if (!id) return null;
    const arts = (it.artists || []).map(a => a && a.name).filter(Boolean);
    const au = it.author;
    return {
        id,
        title: txt(it.title) || 'Tanpa judul',
        artist: arts.join(', ') || (typeof au === 'string' ? au : (au && au.name) || '') || 'Unknown',
        thumb: pickThumb(it),
        duration: (it.duration && it.duration.seconds) || 0
    };
}

async function radioSongs(id) {
    const t = await getYT();
    const up = await t.music.getUpNext(id);
    return (up.contents || []).map(mapPanel).filter(x => x && x.id !== id).slice(0, 40);
}

// ---------- unduh audio dengan yt-dlp ke folder cache ----------
let active = 0;
const procs = new Map();     // kode video -> { p (proses yt-dlp), low (prefetch?), killed }
const demand = new Map();    // kode video -> jumlah permintaan klik yang masih menunggu
const waitersHi = [], waitersLo = [];
async function limit(fn, low = false) {            // low = prefetch (selalu menyisakan 1 slot untuk lagu yang diklik)
    const cap = low ? MAX_YTDLP - 1 : MAX_YTDLP;
    while (active >= cap) await new Promise(r => (low ? waitersLo : waitersHi).push(r));
    active++;
    try { return await fn(); }
    finally { active--; const w = waitersHi.shift() || waitersLo.shift(); if (w) w(); }
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
function getAudio(id, low = false) {
    const c = findCached(id);
    if (c) return Promise.resolve(c);
    if (!inflight.has(id)) inflight.set(id, download(id, low).finally(() => inflight.delete(id)));
    return inflight.get(id);
}


const sizes = new Map();         // kode video -> ukuran total file (dari yt-dlp, sebelum unduhan)
const cancelled = () => Object.assign(new Error('dibatalkan'), { cancelled: true });

// matikan yt-dlp beserta anak prosesnya (node.exe) di Windows
function killTree(p) {
    try {
        if (process.platform === 'win32' && p.pid) {
            spawn('taskkill', ['/pid', String(p.pid), '/T', '/F'], { windowsHide: true });
        } else {
            p.kill();
        }
    } catch (e) { }
}

function runYtdlp(id, low) {
    return new Promise((resolve, reject) => {
        if (!low && !demand.has(id)) return reject(cancelled());     // sudah tidak ditunggu siapa pun
        const p = spawn(YTDLP, [
            '--js-runtimes', 'node',
            ...YT_ARGS,
            '-f', 'bestaudio[ext=m4a]/bestaudio',
            '--no-playlist', '--no-warnings', '--no-progress',
            '--fixup', 'never',
            '--no-simulate', '--print', 'before_dl:SIZE:%(filesize)s',
            '-o', path.join(CACHE_DIR, id + '.%(ext)s'),
            'https://www.youtube.com/watch?v=' + id
        ], { windowsHide: true });
        const ent = { p, low, killed: false };
        procs.set(id, ent);
        let out = '', err = '';
        const timer = setTimeout(() => killTree(p), 300000);
        p.stdout.on('data', d => {
            out += d;
            const m = /SIZE:(\d+)/.exec(out);
            if (m) sizes.set(id, parseInt(m[1]));
        });
        p.stderr.on('data', d => { err += d; });
        p.on('error', e => { clearTimeout(timer); procs.delete(id); reject(e); });
        p.on('close', code => {
            clearTimeout(timer);
            procs.delete(id);
            if (ent.killed) return reject(cancelled());
            if (code === 0) return resolve();
            const e = new Error('keluar dengan kode ' + code);
            e.stderr = err;
            reject(e);
        });
    });
}

// klik lagu: hentikan prefetch supaya lagu yang diklik mendapat slot dan CPU
function prioritize(id) {
    prefetchQueue.length = 0;
    for (const [pid, ent] of procs) {
        if (pid === id) ent.low = false;
        else if (ent.low) { ent.killed = true; killTree(ent.p); }
    }
}

async function download(id, low = false) {
    const t0 = Date.now();
    let lastErr = null;
    for (let attempt = 1; attempt <= 2; attempt++) {        // coba ulang sekali kalau gagal
        try {
            sizes.delete(id);
            let tRun = Date.now();
            await limit(() => { tRun = Date.now(); return runYtdlp(id, low); }, low);
            const c = findCached(id);
            if (!c) throw new Error('file audio tidak terbentuk');
                        console.log('[audio]', id, 'siap (' + c.mime + ', ' + c.length + ' byte) antre ' + (tRun - t0) + ' ms + unduh ' + (Date.now() - tRun) + ' ms');
            pruneCache();
            return c;
        } catch (e) {
            if (e.cancelled) { console.log('[audio]', id, 'dibatalkan'); throw e; }
            if (e.code === 'ENOENT') throw new Error('yt-dlp tidak ditemukan (' + YTDLP + ')');
            lastErr = new Error('yt-dlp gagal: ' + String(e.stderr || e.message).trim().split('\n').pop());
            console.log('[audio]', id, 'percobaan', attempt, 'gagal:', lastErr.message);
        }
    }
    throw lastErr;
}

// ---------- STREAMING MURNI: URL langsung dari yt-dlp, lalu diteruskan per-Range ke browser ----------
const CHUNK = 8 * 1024 * 1024;
const DEFAULT_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const directCache = new Map();       // kode video -> { url, mime, length, ua, exp }
const directInflight = new Map();    // permintaan bersamaan untuk lagu yang sama hanya menjalankan yt-dlp sekali

async function probeLength(url, ua) {
    const r = await fetch(url, { headers: { Range: 'bytes=0-1', 'User-Agent': ua } });
    try { r.body && r.body.cancel(); } catch (e) { }
    if (!r.ok && r.status !== 206) throw new Error('probe upstream ' + r.status);
    const m = /\/(\d+)$/.exec(r.headers.get('content-range') || '');
    if (m) return parseInt(m[1]);
    const cl = parseInt(r.headers.get('content-length') || '0');
    if (cl > 2) return cl;
    throw new Error('ukuran audio tidak diketahui');
}

async function resolveDirect(id, low) {
    const t0 = Date.now();
    let stdout;
    try {
        ({ stdout } = await limit(() => run(YTDLP, [
            '--js-runtimes', 'node',
            '-f', 'bestaudio[ext=m4a]/bestaudio',
            '--dump-single-json', '--no-playlist', '--no-warnings',
            'https://www.youtube.com/watch?v=' + id
        ], { maxBuffer: 50 * 1024 * 1024, timeout: 60000, windowsHide: true }), low));
    } catch (e) {
        if (e.code === 'ENOENT') throw new Error('yt-dlp tidak ditemukan (' + YTDLP + ')');
        throw new Error('yt-dlp gagal: ' + String(e.stderr || e.message).trim().split('\n').pop());
    }
    const j = JSON.parse(stdout);
    if (!j.url) throw new Error('yt-dlp tidak memberi URL audio');
    const ua = (j.http_headers && j.http_headers['User-Agent']) || DEFAULT_UA;

    // ukuran total yang akurat: clen di URL YouTube, lalu filesize dari yt-dlp, terakhir tanya langsung
    let clen = 0, expire = 0;
    try {
        const q = new URL(j.url).searchParams;
        clen = parseInt(q.get('clen')) || 0;
        expire = parseInt(q.get('expire')) || 0;
    } catch (e) { }
    const length = clen || Number(j.filesize) || await probeLength(j.url, ua);
    const mime = j.ext === 'm4a' ? 'audio/mp4' : j.ext === 'webm' ? 'audio/webm' : 'audio/mpeg';

    let exp = Date.now() + 20 * 60 * 1000;
    if (expire && expire * 1000 - Date.now() > 15 * 60 * 1000) {
        exp = Math.min(expire * 1000 - 10 * 60 * 1000, Date.now() + 5 * 60 * 60 * 1000);
    }
    const hdr = { ...(j.http_headers || {}) };
    delete hdr['Accept-Encoding'];                    // audio tidak dikompres, biarkan fetch yang mengurus
    let cl = '?', pot = false;
    try { const q = new URL(j.url).searchParams; cl = q.get('c') || '?'; pot = q.has('pot'); } catch (e) { }
    console.log('[audio]', id, 'klien:', cl, '| pot:', pot, '| format:', j.format_id);
    const entry = { url: j.url, mime, length, ua, hdr, exp, t: Date.now() };
    if (directCache.size > 300) directCache.clear();
    directCache.set(id, entry);
    console.log('[audio]', id, 'URL langsung siap (' + mime + ', ' + length + ' byte) dalam ' + (Date.now() - t0) + ' ms');
    return entry;
}

function audioInfo(id, low = false) {
    const c = directCache.get(id);
    if (c && c.exp > Date.now()) return Promise.resolve(c);
    if (!directInflight.has(id)) {
        directInflight.set(id, resolveDirect(id, low).finally(() => directInflight.delete(id)));
    }
    return directInflight.get(id);
}

// ambil satu potongan dari server YouTube; kalau gagal (URL kedaluwarsa), ambil URL baru lalu coba sekali lagi
// ambil satu potongan dari server YouTube.
// gangguan jaringan sesaat: ulangi URL yang sama (murah). 403/URL mati: baru ambil URL baru lewat yt-dlp (mahal, 5-10 detik)
async function fetchPart(id, a, from, to, signal) {
    let renewed = false, netRetry = 0;
    for (let attempt = 0; attempt < 4; attempt++) {
        try {
            const up = await fetch(a.url, {
                headers: { ...(a.hdr || {}), Range: `bytes=${from}-${to}`, 'User-Agent': a.ua },
                signal
            });
            const okFull = up.status === 200 && from === 0 && to >= a.length - 1;
            if (up.status !== 206 && !okFull) {
                try { up.body && up.body.cancel(); } catch (e2) { }
                const err = new Error('upstream ' + up.status);
                err.status = up.status;
                throw err;
            }
            if (!up.body) throw new Error('upstream tanpa isi');
            return { up, a };
        } catch (e) {
            if (signal.aborted) throw e;
            const why = e.status ? e.message
                : e.message + ' (' + ((e.cause && (e.cause.code || e.cause.message)) || '?') + ')';
            if (e.status === 403 && Date.now() - (a.t || 0) < 90000) throw e;   // URL masih baru: 403 bukan karena kedaluwarsa, ambil URL baru tidak membantu
            if (!e.status && netRetry < 2) {
                netRetry++;
                console.log('[audio]', id, 'gangguan jaringan:', why, '- coba lagi URL yang sama');
                await new Promise(r => setTimeout(r, 400 * netRetry));
                continue;
            }
            if (renewed) throw e;
            renewed = true;
            console.log('[audio]', id, 'potongan gagal:', why, '- ambil URL baru');
            directCache.delete(id);
            a = await audioInfo(id);
        }
    }
    throw new Error('gagal mengambil potongan audio');
}

let directFails = 0, directOffUntil = 0;     // streaming langsung ditolak berturut-turut -> matikan sementara

// cara lama: yt-dlp mengunduh ke folder cache, lalu dilayani dari disk
async function serveViaDownload(req, res, id) {
    demand.set(id, (demand.get(id) || 0) + 1);
    res.on('close', () => {
        const n = (demand.get(id) || 1) - 1;
        if (n > 0) demand.set(id, n); else demand.delete(id);
    });
    prioritize(id);
    const a = await getAudio(id);
    return serveFile(req, res, a);
}

async function streamUpstream(req, res, id) {
    const ctl = new AbortController();
    res.on('close', () => { if (!res.writableFinished) ctl.abort(); });   // browser pindah lagu / seek = normal
    if (Date.now() < directOffUntil) return serveViaDownload(req, res, id);

    let a = await audioInfo(id);
    if (ctl.signal.aborted) return;
    const total = a.length;

    // baca header Range: bytes=N-M | bytes=N- | bytes=-N
    let start = 0, end = total - 1, partial = false;
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (m && (m[1] !== '' || m[2] !== '')) {
        partial = true;
        if (m[1] === '') start = Math.max(0, total - parseInt(m[2]));
        else {
            start = parseInt(m[1]);
            if (m[2] !== '') end = Math.min(end, parseInt(m[2]));
        }
    }
    if (start >= total || start > end) {
        res.writeHead(416, { ...res.cors, 'Content-Range': 'bytes */' + total });
        return res.end();
    }

    console.log('[range]', id, 'bytes', start + '-' + end, 'dari', total);
    const head = {
        ...res.cors,
        'Content-Type': a.mime,
        'Content-Length': end - start + 1,       // persis jumlah byte yang akan dikirim
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, max-age=3600'
    };
    if (partial) head['Content-Range'] = `bytes ${start}-${end}/${total}`;
    const status = partial ? 206 : 200;

    if (req.method === 'HEAD') { res.writeHead(status, head); return res.end(); }

    // potongan pertama diambil SEBELUM header dikirim, supaya kalau gagal browser menerima 502, bukan koneksi menggantung
    let first;
    try {
        first = await fetchPart(id, a, start, Math.min(end, start + CHUNK - 1), ctl.signal);
        directFails = 0;
    } catch (e) {
        if (ctl.signal.aborted) return;
        directFails++;
        console.log('[audio]', id, 'streaming langsung ditolak (' + e.message + '), pakai unduhan lewat yt-dlp');
        if (directFails >= 2) {
            directOffUntil = Date.now() + 30 * 60 * 1000;
            console.log('[audio] streaming langsung dimatikan 30 menit, semua lagu diunduh lewat yt-dlp');
        }
        directCache.delete(id);
        return serveViaDownload(req, res, id);
    }
    a = first.a;
    res.writeHead(status, head);

    let pos = start;
    try {
        while (pos <= end && !ctl.signal.aborted) {
            const g = first || await fetchPart(id, a, pos, Math.min(end, pos + CHUNK - 1), ctl.signal);
            first = null;
            a = g.a;
            const before = pos;
            for await (const chunk of Readable.fromWeb(g.up.body)) {
                pos += chunk.length;
                if (!res.write(chunk)) await waitDrain(res);     // hormati buffer browser: tidak mendahului pemutaran
                if (ctl.signal.aborted) break;
            }
            if (pos === before && !ctl.signal.aborted) throw new Error('upstream mengirim data kosong');
        }
        if (!ctl.signal.aborted) res.end();
    } catch (e) {
        if (ctl.signal.aborted) return;
        console.log('[audio]', id, 'stream terputus:', e.message);
        res.destroy();
    }
}

// ---------- layani audio (file selesai: Range penuh; file masih diunduh: kirim sambil jalan) ----------
async function serveAudio(req, res, id) {
    const cached = findCached(id);
    if (cached) return serveFile(req, res, cached);
    if (!DIRECT_STREAM) return serveViaDownload(req, res, id);     // satu kali yt-dlp saja
    return streamUpstream(req, res, id);
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

    // kalau ukuran total diketahui, beri tahu browser supaya lagu bisa digeser
    const total = cur.final ? cur.size : (sizes.get(id) || 0);
    const head = { ...res.cors, 'Content-Type': cur.mime, 'Cache-Control': 'no-store' };
    if (total > 0) {
        head['Accept-Ranges'] = 'bytes';
        head['Content-Length'] = total;
        if (req.headers.range) {
            head['Content-Range'] = `bytes 0-${total - 1}/${total}`;
            res.writeHead(206, head);
        } else res.writeHead(200, head);
    } else {
        res.writeHead(200, head);
    }

    let pos = 0, lastData = Date.now();
    while (!closed) {
        if (total > 0 && pos >= total) break;                  // semua byte sudah terkirim
        const c = findCached(id) || findPart(id);
        if (c && c.size > pos) {
            try {
                const want = Math.min(c.size - pos, 256 * 1024, total > 0 ? total - pos : Infinity);
                const buf = await readChunk(c.file, pos, want);
                if (buf.length) {
                    pos += buf.length;
                    lastData = Date.now();
                    if (!res.write(buf)) await waitDrain(res);
                    continue;
                }
            } catch (e) { /* file baru saja di-rename jadi final: coba lagi */ }
        }
        if (c && c.final && pos >= c.size) {                   // file akhir sudah terkirim penuh
            if (total > 0 && pos < total) { res.destroy(); return; }   // ukuran tidak cocok: putuskan, jangan menggantung
            break;
        }
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
    while (prefetchWorkers < 1 && prefetchQueue.length) {      // dua lagu disiapkan bersamaan
        prefetchWorkers++;
        (async () => {
            while (prefetchQueue.length) {
                const id = prefetchQueue.shift();
                if (findCached(id)) continue;
                try { await getAudio(id, true); } catch (e) { }
            }
            prefetchWorkers--;
        })();
    }
}

// ---------- Import Spotify: baca daftar lagu playlist publik + cocokkan satu per satu ke YouTube Music ----------
function findKey(o, key, depth = 0) {              // cari properti bernama `key` di mana pun dalam JSON
    if (!o || typeof o !== 'object' || depth > 12) return null;
    if (Array.isArray(o[key])) return o[key];
    for (const k of Object.keys(o)) {
        const r = findKey(o[k], key, depth + 1);
        if (r) return r;
    }
    return null;
}

async function spotifyPlaylist(url) {
    const m = /playlist\/([A-Za-z0-9]{10,40})/.exec(url || '');
    if (!m) throw new Error('link playlist Spotify tidak valid');
    const r = await fetch('https://open.spotify.com/embed/playlist/' + m[1], {
        headers: { 'User-Agent': DEFAULT_UA, 'Accept-Language': 'en-US,en;q=0.9' }
    });
    if (!r.ok) throw new Error('Spotify membalas ' + r.status + ' (playlist privat atau tidak ada?)');
    const html = await r.text();
    const sm = /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/.exec(html);
    if (!sm) throw new Error('format halaman Spotify tidak dikenali');
    let data;
    try { data = JSON.parse(sm[1]); } catch (e) { throw new Error('data halaman Spotify rusak'); }
    const list = findKey(data, 'trackList');
    if (!list || !list.length) throw new Error('daftar lagu tidak ditemukan di halaman Spotify');
    let name = 'Playlist Spotify';
    try {
        const ent = data.props.pageProps.state.data.entity;
        name = txt(ent.name) || txt(ent.title) || name;
    } catch (e) { }
    const tracks = list.map(t => ({
        title: String(t.title || '').trim(),
        artist: String(t.subtitle || '').replace(/\u00a0/g, ' ').trim()
    })).filter(t => t.title).slice(0, 300);
    return { name, tracks };
}

const normM = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[\(\[][^\)\]]*[\)\]]/g, ' ').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

async function matchOne(title, artist) {
    const t = await getYT();
    const res = await t.music.search((title + ' ' + artist).trim(), { type: 'song' });
    const cands = [];
    for (const shelf of (res.contents || [])) {
        for (const it of (shelf.contents || [])) {
            const s = mapSong(it);
            if (s) cands.push(s);
            if (cands.length >= 8) break;
        }
        if (cands.length >= 8) break;
    }
    const nt = normM(title), na = normM(String(artist).split(',')[0]);
    let best = null, bestScore = 0;
    for (const c of cands) {
        const ct = normM(c.title);
        const ts = ct === nt ? 3 : (ct && nt && (ct.includes(nt) || nt.includes(ct))) ? 2 : 0;
        const as = na && normM(c.artist).includes(na) ? 2 : 0;
        const sc = ts * 10 + as;
        if (ts >= 2 && sc > bestScore) { best = { c, ts, as }; bestScore = sc; }
    }
    if (!best) return { found: false };
    return { found: true, approx: best.as < 2, song: best.c };      // approx: judul cocok tapi artis tidak jelas
}

let matchChain = Promise.resolve();
function throttled(fn) {                               // satu pencarian sekali jalan, jeda 350 ms antar pencarian
    const p = matchChain.then(fn);
    matchChain = p.catch(() => { }).then(() => sleep(350));
    return p;
}

const capHits = new Map();
function capped(req, max, windowMs) {                  // batas per alamat untuk endpoint import (URL Funnel itu publik)
    const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    const now = Date.now();
    const h = (capHits.get(ip) || []).filter(x => now - x < windowMs);
    h.push(now);
    capHits.set(ip, h);
    if (capHits.size > 300) capHits.clear();
    return h.length > max;
}

const server = http.createServer(async (req, res) => {
    res.cors = corsFor(req);
    if (req.method === 'OPTIONS') { res.writeHead(204, res.cors); return res.end(); }
    const u = new URL(req.url, 'http://x');
    if (u.pathname !== '/audio' && u.pathname !== '/prefetch' && u.pathname !== '/health' &&
        u.pathname !== '/match' && u.pathname !== '/spotify-list' && rateLimited(req)) {
        res.writeHead(429, { ...res.cors, 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'terlalu banyak permintaan, coba sebentar lagi' }));
    }

    try {
        if (u.pathname === '/' || u.pathname === '/health') return json(res, 200, { ok: true });

        if (u.pathname === '/prefetch') {
            const ids = (u.searchParams.get('id') || '').split(',').filter(x => /^[\w-]{6,20}$/.test(x)).slice(0, 2);
            if (u.searchParams.get('hot') === '1') {      // kursor di atas lagu: taruh paling depan, antrean lain tidak dibuang
                for (const x of ids.reverse()) {
                    if (findCached(x) || procs.has(x) || inflight.has(x)) continue;
                    const k = prefetchQueue.indexOf(x);
                    if (k >= 0) prefetchQueue.splice(k, 1);
                    prefetchQueue.unshift(x);
                }
                if (prefetchQueue.length > 8) prefetchQueue.length = 8;
            } else {
                prefetchQueue.length = 0;                 // permintaan terbaru menggantikan antrean lama
                for (const x of ids) if (!findCached(x)) prefetchQueue.push(x);
            }
            pumpPrefetch();
            res.writeHead(204, res.cors);
            return res.end();
        }

        if (u.pathname === '/search') {
            const q = (u.searchParams.get('q') || '').trim();
            if (!q) return json(res, 400, { error: 'q kosong' });
            const type = u.searchParams.get('type') || 'song';
            if (type === 'playlist' || type === 'artist') {
                return json(res, 200, await memo('s:' + type + ':' + q.toLowerCase(), 5 * 60 * 1000, () => retryYT(() => searchOther(q, type))));
            }
            return json(res, 200, await retryYT(() => search(q)));
        }

        if (u.pathname === '/playlist') {
            const id = (u.searchParams.get('id') || '').replace(/^VL/, '');
            if (!/^[\w-]{2,64}$/.test(id)) return json(res, 400, { error: 'id tidak valid' });
            return json(res, 200, await memo('pl:' + id, 10 * 60 * 1000, () => retryYT(() => playlistSongs(id))));
        }

        if (u.pathname === '/artist') {
            const id = u.searchParams.get('id') || '';
            if (!/^[\w-]{10,40}$/.test(id)) return json(res, 400, { error: 'id tidak valid' });
            return json(res, 200, await memo('ar:' + id, 10 * 60 * 1000, () => retryYT(() => artistInfo(id))));
        }

        if (u.pathname === '/audio') {
            const id = u.searchParams.get('id');
            if (!id || !/^[\w-]{6,20}$/.test(id)) return json(res, 400, { error: 'id tidak valid' });
            return await serveAudio(req, res, id);
        }

        if (u.pathname === '/suggest') {
            const q = (u.searchParams.get('q') || '').trim().slice(0, 80);
            if (!q) return json(res, 200, []);
            return json(res, 200, await memo('sg:' + q.toLowerCase(), 2 * 60 * 1000, () => suggestions(q)));
        }

        if (u.pathname === '/home') {
            return json(res, 200, await memo('home', 15 * 60 * 1000, () => homeFeed()));
        }

        if (u.pathname === '/album') {
            const id = u.searchParams.get('id') || '';
            if (!/^[\w-]{6,40}$/.test(id)) return json(res, 400, { error: 'id tidak valid' });
            return json(res, 200, await memo('al:' + id, 10 * 60 * 1000, () => albumSongs(id)));
        }

        if (u.pathname === '/radio') {
            const id = u.searchParams.get('id') || '';
            if (!/^[\w-]{6,20}$/.test(id)) return json(res, 400, { error: 'id tidak valid' });
            return json(res, 200, await memo('rd:' + id, 10 * 60 * 1000, () => retryYT(() => radioSongs(id))));
        }

        if (u.pathname === '/spotify-list') {
            if (capped(req, 20, 10 * 60 * 1000)) return json(res, 429, { error: 'terlalu banyak permintaan, coba lagi nanti' });
            const url = (u.searchParams.get('url') || '').trim().slice(0, 300);
            if (!/^https?:\/\/(open\.)?spotify\.com\//.test(url)) return json(res, 400, { error: 'bukan link Spotify' });
            return json(res, 200, await memo('sp:' + url, 10 * 60 * 1000, () => spotifyPlaylist(url)));
        }

        if (u.pathname === '/match') {
            if (capped(req, 400, 10 * 60 * 1000)) return json(res, 429, { error: 'terlalu banyak permintaan, coba lagi nanti' });
            const title = (u.searchParams.get('title') || '').trim().slice(0, 150);
            const artist = (u.searchParams.get('artist') || '').trim().slice(0, 150);
            if (!title) return json(res, 400, { error: 'title kosong' });
            return json(res, 200, await throttled(() => retryYT(() => matchOne(title, artist))));
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