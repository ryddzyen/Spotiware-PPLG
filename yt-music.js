// yt-music.js — Langkah 1: sakelar mode LAGU SAYA / YOUTUBE MUSIC. Array songs lokal tidak diubah strukturnya.
(function () {
    const LOCAL = ['127.0.0.1', 'localhost'].includes(location.hostname);
    const SERVER = LOCAL ? 'http://127.0.0.1:3001' : 'https://desktop-e3bkb1b.tail4eac99.ts.net';
    const ID_BASE = 20000000000;
    const CACHE_KEY = 'spotiware_yt_cache';
    const CACHE_MAX = 800;
    const MODE_KEY = 'spotiware_mode';          // 'local' | 'yt'

    let mode = 'local';
    try { mode = localStorage.getItem(MODE_KEY) === 'yt' ? 'yt' : 'local'; } catch (e) { }
    let block = null, seg = null, list = [], lastQ = '', token = 0, lastWarn = 0;
    let arts = [], pls = [];
    let curList = [];      // antrean yang sedang aktif (hasil pencarian atau isi playlist/artist)

    // permintaan ke server dengan cache singkat (tidak mengulang pencarian yang sama)
    const memo = new Map();
    async function getJSON(path, ttl) {
        const hit = memo.get(path);
        if (hit && hit.exp > Date.now()) return hit.v;
        const res = await fetch(SERVER + path);
        if (!res.ok) throw new Error('status ' + res.status);
        const v = await res.json();
        if (memo.size > 60) memo.clear();
        memo.set(path, { v, exp: Date.now() + (ttl || 300000) });
        return v;
    }

    function card(kind, o) {
        const name = kind === 'a' ? o.name : o.title;
        const sub = kind === 'a' ? 'Artist' : 'Playlist' + (o.author ? ' • ' + o.author : '');
        return `<div class="yt-card${kind === 'a' ? ' round' : ''}" data-k="${kind}" data-id="${esc(o.id)}">
            <img src="${esc(o.thumb || 'img/pplglogo.png')}" alt="" loading="lazy">
            <div class="yt-cn">${esc(name)}</div><div class="yt-cs">${esc(sub)}</div></div>`;
    }

    // halaman artis / playlist YouTube: memakai tampilan playlist Spotiware yang sudah ada
    async function openYtPage(kind, id) {
        const isA = kind === 'a';
        toast('Memuat ' + (isA ? 'artis' : 'playlist') + '...');
        let d;
        try { d = await getJSON((isA ? '/artist?id=' : '/playlist?id=') + encodeURIComponent(id), 600000); }
        catch (e) { toast(e.message === 'status 429' ? 'Terlalu banyak permintaan, coba sebentar lagi' : 'Gagal memuat dari YouTube Music'); return; }
        if (!d || !Array.isArray(d.songs) || !d.songs.length) { toast('Tidak ada lagu di sini'); return; }

        const items = register(d.songs);
        curList = items;
        prefetch(items.slice(0, 4).map(s => s.yt));      // siapkan 4 lagu pertama playlist
        // isi durasi dari data YouTube supaya kolom durasi tidak memicu pengambilan audio per lagu
        if (typeof durationCache !== 'undefined') {
            items.forEach(s => { if (durationCache[s.songPath] === undefined) durationCache[s.songPath] = s.dur || 0; });
        }

        const fake = {
            id: 'yt:' + id,
            name: isA ? (d.name || 'Artist') : (d.title || 'Playlist'),
            songIds: items.map(s => s.id),
            description: isA ? '' : (d.author ? 'By ' + d.author : ''),
            coverImage: d.thumb || '',
            __artist: isA,
            __yt: true
        };
        document.body.classList.add('yt-page');
        window.openPlaylistDetailView(fake, false);

        const add = document.getElementById('pdAddSongsBtn'), ed = document.getElementById('pdEditDetailsBtn');
        if (add) add.style.display = 'none';
        if (ed) ed.style.display = 'none';
        if (isA) {
            document.body.classList.add('artist-page');       // foto bulat, label "Artist"
            const t = document.querySelector('.playlist-detail-type');
            if (t) t.textContent = 'Artist';
        }
    }
    const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
    const idOf = vid => ID_BASE + hash(vid);
    const fmt = sec => (!sec || sec < 0) ? '' : Math.floor(sec / 60) + ':' + String(Math.floor(sec % 60)).padStart(2, '0');
    const toast = (t, label, fn) => { if (typeof showToast === 'function') showToast(t, label, fn); };
    const prefetched = new Map();
    const prefetch = vids => {
        const now = Date.now();
        vids = (Array.isArray(vids) ? vids : [vids]).filter(v => v && !(prefetched.get(v) > now - 120000));
        if (mode !== 'yt' || !vids.length) return;
        vids.forEach(v => prefetched.set(v, now));
        fetch(SERVER + '/prefetch?id=' + encodeURIComponent(vids.join(','))).catch(() => { });
    };

    // ---------- lagu YouTube -> format lagu Spotiware (hidden, tidak tercampur di koleksi) ----------
    function toSong(m) {
        return {
            id: idOf(m.id),
            songName: m.title,
            songDes: m.artist,
            songImage: m.thumb || 'img/pplglogo.png',
            songPath: SERVER + '/audio?id=' + encodeURIComponent(m.id),   // alamat tetap, tidak kedaluwarsa
            hidden: true,
            keyword: ['__yt__'],
            artists: m.artist.split(',').map(a => a.trim()).filter(Boolean),
            genre: 'YouTube',
            external: true,
            yt: m.id,
            dur: m.duration || 0
        };
    }

    // ---------- cache supaya Liked Songs / playlist / riwayat tetap utuh setelah refresh ----------
    const loadCache = () => { try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; } catch (e) { return {}; } };
    function saveCache(c) {
        const keys = Object.keys(c);
        if (keys.length > CACHE_MAX) {
            const keep = new Set();
            try { getPlaylists().forEach(p => p.songIds.forEach(i => keep.add(String(i)))); } catch (e) { }
            keys.filter(k => !keep.has(k)).slice(0, keys.length - CACHE_MAX).forEach(k => delete c[k]);
        }
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch (e) { }
    }

    function register(metas) {
        const cache = loadCache();
        const out = metas.map(m => {
            const s = toSong(m);
            cache[s.id] = m;
            const ex = songs.find(x => x.id === s.id);
            if (ex) return ex;
            songs.push(s);
            return s;
        });
        saveCache(cache);
        return out;
    }

    function restoreCache() {
        Object.values(loadCache()).forEach(m => {
            const s = toSong(m);
            if (!songs.some(x => x.id === s.id)) songs.push(s);
        });
        try { playHistory = loadSavedHistory(); renderHistory(); renderPlaylistList(); } catch (e) { }
    }

    // ---------- cek server ----------
    async function ping() {
        const ctl = new AbortController();
        const t = setTimeout(() => ctl.abort(), 4000);
        try {
            const r = await fetch(SERVER + '/health', { signal: ctl.signal });
            clearTimeout(t);
            return r.ok;
        } catch (e) { clearTimeout(t); return false; }
    }

    // ---------- sakelar mode ----------
    function applyMode() {
        document.body.classList.toggle('mode-yt', mode === 'yt');
        if (seg) {
            seg.classList.toggle('on', mode === 'yt');
            seg.querySelector('i').className = mode === 'yt' ? 'fa-brands fa-youtube' : 'fa-solid fa-music';
            seg.title = mode === 'yt'
                ? 'Mode YouTube Music (klik untuk ke Lagu Saya)'
                : 'Mode Lagu Saya (klik untuk ke YouTube Music)';
        }
    }

    async function setMode(m) {
        if (m === mode) return;
        if (m === 'yt') {
            toast('Menghubungi server YouTube Music...');
            const ok = await ping();
            if (!ok) {
                const stay = confirm(
                    'Server YouTube Music tidak bisa dihubungi.\n(Laptop mati, server belum jalan, atau Tailscale terputus.)\n\n' +
                    'OK = tetap di Mode Lagu Saya\nBatal = tetap pindah ke Mode YouTube Music');
                if (stay) { toast('Tetap di Mode Lagu Saya'); return; }
            }
        }
        mode = m;
        try { localStorage.setItem(MODE_KEY, mode); } catch (e) { }
        applyMode();
        lastQ = '';
        list = [];
        token++;
        if (block) block.innerHTML = '';
        toast(mode === 'yt' ? 'Mode YouTube Music aktif' : 'Mode Lagu Saya aktif');

        const view = document.getElementById('searchView');
        const input = document.querySelector('.input-box');
        if (mode === 'yt' && view && view.classList.contains('show') && input) run(input.value);
    }

    function buildToggle() {
        const bar = document.querySelector('.search-bar');
        if (!bar || document.getElementById('ymSeg')) return;
        const browse = bar.querySelector('.browse');
        seg = document.createElement('button');
        seg.type = 'button';
        seg.id = 'ymSeg';
        seg.className = 'ym-btn';
        seg.innerHTML = '<i class="fa-solid fa-music"></i>';
        bar.insertBefore(seg, browse || null);
        seg.addEventListener('click', e => {
            e.stopPropagation();
            setMode(mode === 'yt' ? 'local' : 'yt');
        });
    }

    // ---------- tampilan ----------
    function injectStyle() {
        const css = document.createElement('style');
        css.textContent = `
            .ym-btn{flex:0 0 auto;width:34px;height:34px;border-radius:50%;border:none;background:rgba(255,255,255,.12);
                color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;margin:0 .3rem;font-size:.95rem}
            .ym-btn:hover{background:rgba(255,255,255,.22)}
            .ym-btn.on{background:#fff;color:#e62117}

            /* Mode Lagu Saya: blok YouTube disembunyikan. Mode YouTube Music: hasil lokal disembunyikan */
            body:not(.mode-yt) #ytBlock{display:none!important}
            body.mode-yt #searchView .sv-chips,body.mode-yt #searchView #svList{display:none!important}

            #ytBlock{padding:0 1.4rem 2rem}
            #ytBlock .yt-h{font-size:1.3rem;margin:1.4rem 0 .6rem}
            #ytBlock .yt-note{font-size:.85rem;opacity:.85;padding:.6rem 0;line-height:1.6}
            #ytBlock .ym-back{margin-top:.6rem;display:inline-block;background:#fff;color:#000;border:none;border-radius:2rem;padding:.5rem 1.1rem;font:inherit;font-weight:700;cursor:pointer}
            .yt-row{display:flex;align-items:center;gap:.8rem;padding:.45rem .5rem;border-radius:6px;cursor:pointer}
            .yt-row:hover{background:rgba(255,255,255,.1)}
            .yt-th{position:relative;width:48px;height:48px;flex:0 0 48px}
            .yt-th img{width:100%;height:100%;object-fit:cover;border-radius:4px;background:#2f2f2f}
            .yt-pl{position:absolute;inset:0;border-radius:4px;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;color:#fff;font-size:.85rem}
            .yt-row:hover .yt-pl,.yt-row.cur .yt-pl{display:flex}
            .yt-info{flex:1;min-width:0}
            .yt-t{font-size:.95rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
            .yt-row.cur .yt-t{color:var(--yellow,#1ed760)}
            .yt-s{font-size:.8rem;opacity:.65;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        `;
        document.head.appendChild(css);
    }

    function render(note) {
        if (!block) return;
        block.innerHTML = '<h3 class="yt-h">YouTube Music</h3>' +
            (note ? `<div class="yt-note">${note}</div>` : '') +
            (arts.length ? '<h4 class="yt-h2">Artists</h4><div class="yt-scroll">' + arts.map(a => card('a', a)).join('') + '</div>' : '') +
            (pls.length ? '<h4 class="yt-h2">Playlists</h4><div class="yt-scroll">' + pls.map(p => card('p', p)).join('') + '</div>' : '') +
            (list.length ? '<h4 class="yt-h2">Songs</h4>' : '') +
            list.map((s, i) => `
                <div class="yt-row" data-i="${i}">
                    <div class="yt-th"><img src="${esc(s.songImage)}" alt="" loading="lazy"><div class="yt-pl"><i class="fa-solid fa-play"></i></div></div>
                    <div class="yt-info"><div class="yt-t">${esc(s.songName)}</div>
                        <div class="yt-s">Song • ${esc(s.songDes)}${s.dur ? ' • ' + fmt(s.dur) : ''}</div></div>
                </div>`).join('');
        markCurrent();
    }

    function markCurrent() {
        if (!block || typeof getCurrentSong !== 'function') return;
        const cur = playerBar.classList.contains('show') ? getCurrentSong().id : null;
        block.querySelectorAll('.yt-row').forEach(r => {
            const s = list[parseInt(r.dataset.i)];
            const on = s && s.id === cur;
            r.classList.toggle('cur', on);
            const i = r.querySelector('.yt-pl i');
            if (i) i.className = 'fa-solid ' + (on && !audio.paused ? 'fa-pause' : 'fa-play');
        });
    }

    // ---------- pencarian (hanya Mode YouTube Music) ----------
    async function run(q) {
        if (mode !== 'yt') return;                       // Mode Lagu Saya: tidak ada request ke server
        q = (q || '').trim();
        if (!q || !block) return;
        if (q === lastQ && (list.length || arts.length || pls.length)) return;
        lastQ = q;
        const my = ++token;
        list = []; arts = []; pls = [];
        render('Mencari di YouTube Music...');

        const enc = encodeURIComponent(q);
        const [rs, ra, rp] = await Promise.allSettled([
            getJSON('/search?q=' + enc),
            getJSON('/search?q=' + enc + '&type=artist'),
            getJSON('/search?q=' + enc + '&type=playlist')
        ]);
        if (my !== token) return;

        if (rs.status !== 'fulfilled' || !Array.isArray(rs.value)) {
            lastQ = '';
            const msg = rs.status === 'rejected' ? String(rs.reason && rs.reason.message) : '';
            if (msg === 'status 429') {
                render('Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.');
            } else if (rs.status === 'rejected' && !/^status 4/.test(msg)) {
                render('Server YouTube Music tidak bisa dihubungi. Pastikan laptop menyala dan server berjalan.<br>' +
                    '<button type="button" class="ym-back">Beralih ke Mode Lagu Saya</button>');
            } else {
                render('Pencarian YouTube Music gagal. Lihat pesan di terminal server.');
            }
            return;
        }
        list = register(rs.value);
        curList = list;
        prefetch(list.slice(0, 4).map(s => s.yt));      // siapkan 4 hasil teratas di server
        arts = ra.status === 'fulfilled' && Array.isArray(ra.value) ? ra.value.slice(0, 12) : [];
        pls = rp.status === 'fulfilled' && Array.isArray(rp.value) ? rp.value.slice(0, 12) : [];
        render(list.length || arts.length || pls.length ? '' : 'Tidak ada hasil dari YouTube Music.');
    }

    // lagu YouTube gagal diputar -> cek server, tawarkan pindah ke Mode Lagu Saya (maksimal 1x per menit)
    function watchAudioErrors() {
        audio.addEventListener('error', () => {
            if (mode !== 'yt' || !playerBar.classList.contains('show')) return;
            const cur = getCurrentSong();
            if (!cur || !cur.external) return;
            setTimeout(async () => {
                if (Date.now() - lastWarn < 60000) return;
                if (await ping()) return;
                lastWarn = Date.now();
                toast('Server YouTube Music tidak merespons', 'Pakai Lagu Saya', () => setMode('local'));
            }, 1500);
        });
    }

    function setupMediaSession() {
        if (!('mediaSession' in navigator)) return;
        audio.addEventListener('playing', () => {
            try {
                const s = getCurrentSong();
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: s.songName,
                    artist: s.songDes,
                    artwork: [{ src: s.songImage, sizes: '512x512' }]
                });
            } catch (e) { }
        });
        const on = (a, f) => { try { navigator.mediaSession.setActionHandler(a, f); } catch (e) { } };
        on('play', () => audio.play());
        on('pause', () => audio.pause());
        on('nexttrack', () => { if (typeof playNextSong === 'function') playNextSong(); });
        on('previoustrack', () => { if (typeof playPreviousSong === 'function') playPreviousSong(); });
    }

    // ---------- simpan lagu di memori browser supaya tidak tersendat saat jaringan jelek ----------
    const blobs = new Map();          // kode video -> { url, t }
    const pendingBlob = new Map();
    const BLOB_MAX = 6;               // maksimal 6 lagu di memori
    const remoteUrl = vid => SERVER + '/audio?id=' + encodeURIComponent(vid);

    function trimBlobs() {
        if (blobs.size <= BLOB_MAX) return;
        let cur = null;
        try { cur = getCurrentSong().yt; } catch (e) { }
        const old = [...blobs.entries()].filter(([k]) => k !== cur).sort((a, b) => a[1].t - b[1].t);
        while (blobs.size > BLOB_MAX && old.length) {
            const [k, v] = old.shift();
            URL.revokeObjectURL(v.url);
            blobs.delete(k);
            const s = songs.find(x => x.yt === k);
            if (s) s.songPath = remoteUrl(k);        // kembalikan ke alamat server
        }
    }

    function ensureBlob(s) {
        if (!s || !s.yt) return Promise.resolve(false);
        if (blobs.has(s.yt)) {
            const b = blobs.get(s.yt);
            b.t = Date.now();
            s.songPath = b.url;
            return Promise.resolve(true);
        }
        if (pendingBlob.has(s.yt)) return pendingBlob.get(s.yt);
        const p = (async () => {
            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    const r = await fetch(remoteUrl(s.yt));
                    if (!r.ok) throw new Error('status ' + r.status);
                    const b = await r.blob();
                    if (!b.size) throw new Error('kosong');
                    const url = URL.createObjectURL(b);
                    blobs.set(s.yt, { url, t: Date.now() });
                    s.songPath = url;
                    trimBlobs();
                    return true;
                } catch (e) { await new Promise(r => setTimeout(r, 1500)); }
            }
            return false;                             // gagal: pemutar tetap memakai alamat server
        })().finally(() => pendingBlob.delete(s.yt));
        pendingBlob.set(s.yt, p);
        return p;
    }
    let playToken = 0;

    function init() {
        const view = document.getElementById('searchView');
        const input = document.querySelector('.input-box');
        if (!view || !input || typeof songs === 'undefined' || typeof playSongFromList !== 'function') return setTimeout(init, 300);

        injectStyle();
        restoreCache();
        audio.preload = 'auto';
        buildToggle();
        applyMode();

        block = document.createElement('div');
        block.id = 'ytBlock';
        view.appendChild(block);

        block.addEventListener('click', e => {
            if (e.target.closest('.ym-back')) return setMode('local');
            const kc = e.target.closest('.yt-card');
            if (kc) return openYtPage(kc.dataset.k, kc.dataset.id);
            const row = e.target.closest('.yt-row');
            if (!row) return;
            const s = list[parseInt(row.dataset.i)];
            if (!s) return;
            if (playerBar.classList.contains('show') && getCurrentSong().id === s.id) play.click();
            else {
                if (blobs.has(s.yt)) s.songPath = blobs.get(s.yt).url;     // sudah ada di memori: pakai itu
                playSongFromList(s.id, list);       // kalau belum, putar langsung lewat server (mulai bunyi sambil diunduh)
            }
        });

        input.addEventListener('keydown', e => { if (e.key === 'Enter') run(input.value); });
        new MutationObserver(() => {
            if (view.classList.contains('show')) run(input.value);
            else { lastQ = ''; list = []; token++; block.innerHTML = ''; }
        }).observe(view, { attributes: true, attributeFilter: ['class'] });

        ['play', 'playing', 'pause', 'loadstart'].forEach(ev => audio.addEventListener(ev, markCurrent));
        watchAudioErrors();

        // penanda halaman YouTube dilepas saat pindah ke halaman lain
        const _open = window.openPlaylistDetailView, _close = window.closePlaylistDetailView;
        window.openPlaylistDetailView = function (p) {
            if (!(p && p.__yt)) document.body.classList.remove('yt-page');
            return _open.apply(this, arguments);
        };
        window.closePlaylistDetailView = function () {
            document.body.classList.remove('yt-page');
            return _close.apply(this, arguments);
        };
        setupMediaSession();
        // saat lagu mulai main, siapkan lagu berikutnya di antrean
        audio.addEventListener('playing', () => {       // siapkan 2 lagu berikutnya di antrean aktif
            try {
                const cur = getCurrentSong();
                const i = curList.findIndex(s => s.id === cur.id);
                if (i >= 0) {
                    const nx = curList.slice(i + 1, i + 3);
                    prefetch(nx.map(s => s.yt));                 // server mengunduh lebih dulu
                    nx.reduce((p, s) => p.then(() => ensureBlob(s)), Promise.resolve());   // browser menyimpan satu per satu
                }
            } catch (e) { }
        });
    }

    init();
})();