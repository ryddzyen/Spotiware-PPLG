// yt-server.mjs — jalankan: node yt-server.mjs
// Pencarian: youtubei.js. Ambil URL audio: yt-dlp. Streaming: proxy dengan dukungan Range.
import http from 'node:http';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { Innertube, UniversalCache } from 'youtubei.js';

const run = promisify(execFile);
const YTDLP = fileURLToPath(new URL('./yt-dlp.exe', import.meta.url));   // yt-dlp.exe di folder yang sama
const PORT = 3001;
const CHUNK = 2 * 1024 * 1024;          // ukuran potongan per permintaan ke YouTube
const DEFAULT_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

let yt = null;
async function getYT() {
    if (!yt) yt = await Innertube.create({ cache: new UniversalCache(false), generate_session_locally: true });
    return yt;
}

// naikkan resolusi cover: gambar album (googleusercontent) atau thumbnail video (ytimg)
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

// ---------- ambil info audio lewat yt-dlp ----------
const urlCache = new Map();
const inflight = new Map();    // permintaan bersamaan untuk lagu yang sama hanya menjalankan yt-dlp sekali

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

async function resolveAudio(id) {
    let stdout;
    try {
        ({ stdout } = await run(YTDLP, [
            '--js-runtimes', 'node',
            '-f', 'bestaudio[ext=m4a]/bestaudio',
            '--dump-single-json', '--no-playlist', '--no-warnings',
            'https://www.youtube.com/watch?v=' + id
        ], { maxBuffer: 50 * 1024 * 1024, timeout: 60000 }));
    } catch (e) {
        if (e.code === 'ENOENT') throw new Error('yt-dlp.exe tidak ditemukan di folder proyek (' + YTDLP + ')');
        const msg = String(e.stderr || e.message).trim().split('\n').pop();
        throw new Error('yt-dlp gagal: ' + msg);
    }
    const j = JSON.parse(stdout);
    if (!j.url) throw new Error('yt-dlp tidak memberi URL audio');
    const ua = (j.http_headers && j.http_headers['User-Agent']) || DEFAULT_UA;
    const length = Number(j.filesize) || await probeLength(j.url, ua);
    const mime = j.ext === 'm4a' ? 'audio/mp4' : j.ext === 'webm' ? 'audio/webm' : 'audio/mpeg';
    const entry = { url: j.url, mime, length, ua, exp: Date.now() + 20 * 60 * 1000 };
    urlCache.set(id, entry);
    console.log('[audio]', id, 'via yt-dlp (' + mime + ', ' + length + ' byte)');
    return entry;
}

function audioInfo(id) {
    const c = urlCache.get(id);
    if (c && c.exp > Date.now()) return Promise.resolve(c);
    if (!inflight.has(id)) {
        inflight.set(id, resolveAudio(id).finally(() => inflight.delete(id)));
    }
    return inflight.get(id);
}

// ---------- stream audio ke browser (mendukung Range) ----------
async function streamAudio(req, res, id) {
    const ctl = new AbortController();
    res.on('close', () => { if (!res.writableFinished) ctl.abort(); });   // browser membatalkan = normal

    let lastErr = null;
    for (let attempt = 0; attempt < 2; attempt++) {     // percobaan ke-2 memakai URL baru
        if (ctl.signal.aborted) return;
        const a = await audioInfo(id);

        // baca header Range dari browser
        let start = 0, end = a.length - 1;
        const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
        if (m) {
            if (m[1] === '' && m[2] !== '') start = Math.max(0, a.length - parseInt(m[2]));   // bytes=-N
            else {
                if (m[1] !== '') start = parseInt(m[1]);
                if (m[2] !== '') end = Math.min(end, parseInt(m[2]));
            }
        }
        if (start >= a.length || start > end) {
            res.writeHead(416, { ...CORS, 'Content-Range': 'bytes */' + a.length });
            return res.end();
        }
        end = Math.min(end, start + CHUNK - 1);         // potong per CHUNK, browser akan minta lanjutannya

        let up;
        try {
            up = await fetch(a.url, {
                headers: { Range: `bytes=${start}-${end}`, 'User-Agent': a.ua },
                signal: ctl.signal
            });
            if (up.status !== 206 && up.status !== 200) throw new Error('upstream ' + up.status);
        } catch (e) {
            if (ctl.signal.aborted) return;
            lastErr = e;
            console.log('[audio]', id, 'upstream gagal:', e.message, '- ambil URL baru');
            urlCache.delete(id);
            continue;
        }

        res.writeHead(206, {
            ...CORS,
            'Content-Type': a.mime,
            'Content-Length': end - start + 1,
            'Content-Range': `bytes ${start}-${end}/${a.length}`,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'no-store'
        });
        if (!up.body) return res.end();
        try { await pipeline(Readable.fromWeb(up.body), res); }
        catch (e) { /* koneksi diputus browser (seek/ganti lagu): abaikan */ }
        return;
    }
    throw lastErr || new Error('gagal mengambil audio');
}

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Range',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges'
};
const json = (res, code, obj) => { res.writeHead(code, { ...CORS, 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };

http.createServer(async (req, res) => {
    const u = new URL(req.url, 'http://x');
    if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }

    try {
        if (u.pathname === '/search') {
            const q = (u.searchParams.get('q') || '').trim();
            if (!q) return json(res, 400, { error: 'q kosong' });
            return json(res, 200, await search(q));
        }

        if (u.pathname === '/audio') {
            const id = u.searchParams.get('id');
            if (!id || !/^[\w-]{6,20}$/.test(id)) return json(res, 400, { error: 'id tidak valid' });
            return await streamAudio(req, res, id);
        }

        json(res, 404, { error: 'tidak ditemukan' });
    } catch (e) {
        if (e.name === 'AbortError' || res.destroyed) return;
        console.log('[error]', u.pathname, e.message);
        if (!res.headersSent) json(res, 502, { error: e.message });
        else res.destroy();
    }
}).listen(PORT, '127.0.0.1', () => console.log('Server YouTube Music siap: http://127.0.0.1:' + PORT));