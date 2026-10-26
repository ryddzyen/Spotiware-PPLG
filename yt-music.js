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
        try { d = await getJSON((isA ? '/artist?id=' : kind === 'b' ? '/album?id=' : '/playlist?id=') + encodeURIComponent(id), 600000); }
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
    const prefetch = (vids, hot) => {
        const now = Date.now(), win = hot ? 8000 : 120000;
        vids = (Array.isArray(vids) ? vids : [vids]).filter(v => {
            if (!v || prefetched.get(v) > now - win) return false;
            const s = songs.find(x => x.yt === v);
            return !(s && (s.dur > 600 || s.viaLocal));
        });
        if (mode !== 'yt' || !vids.length) return;
        vids.forEach(v => prefetched.set(v, now));
        fetch(SERVER + '/prefetch?id=' + encodeURIComponent(vids.join(',')) + (hot ? '&hot=1' : '')).catch(() => { });
    };

    // ---------- lagu YouTube -> format lagu Spotiware (hidden, tidak tercampur di koleksi) ----------
    // ---------- pakai file lokal kalau lagu YouTube ini ada di koleksi (tanpa pindah mode, tanpa API) ----------
    let localIdx = null;
    const titleKey = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[\(\[]\s*(feat|ft|with|prod)\b[^\)\]]*[\)\]]/g, ' ')     // (feat. X), (with X), [prod. X]
        .replace(/\s(feat|ft)\.?\s.*$/, ' ')
        .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
    const artistKeys = s => String(s || '').split(',')
        .map(a => a.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, ''))
        .filter(Boolean);

    function buildLocalIdx() {
        localIdx = new Map();
        songs.forEach(s => {
            if (s.external) return;                          // hanya lagu koleksi lokal
            const k = titleKey(s.songName);
            if (!k) return;
            if (!localIdx.has(k)) localIdx.set(k, []);
            localIdx.get(k).push({ path: s.songPath, a: artistKeys(s.songDes) });
        });
    }

    function localPathFor(m) {
        if (!localIdx) buildLocalIdx();
        const c = localIdx.get(titleKey(m.title));
        if (!c) return null;
        const ya = artistKeys(m.artist);
        const hit = c.find(x => x.a.some(a => ya.includes(a)));
        return hit ? hit.path : null;
    }

    function toSong(m) {
        const lp = localPathFor(m);
        return {
            id: idOf(m.id),
            songName: m.title,
            songDes: m.artist,
            songImage: m.thumb || 'img/pplglogo.png',
            songPath: lp || SERVER + '/audio?id=' + encodeURIComponent(m.id),   // file lokal kalau ada, kalau tidak server
            hidden: true,
            keyword: ['__yt__'],
            artists: m.artist.split(',').map(a => a.trim()).filter(Boolean),
            genre: 'YouTube',
            external: true,
            viaLocal: !!lp,
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
        if (mode === 'yt') loadHome();

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
            body.mode-yt.yt-typing .search-dropdown > :not(.ys){display:none!important}
            body.mode-yt.yt-typing .search-dropdown:not(:has(.ys)){display:none!important}
            body.yt-page #playlistDetailCover .cover-upload-overlay{display:none!important}
            body.yt-page #playlistDetailCover{cursor:default}
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

    // ---------- Langkah 6: Home, Genre, saran pencarian (Mode YouTube Music) ----------
    const GENRES = ['Pop', 'Hip-Hop', 'R&B', 'Rock', 'Indie', 'EDM', 'K-Pop', 'Lo-fi', 'Jazz', 'Dangdut',
        'Pop Indonesia', 'Indie Indonesia', 'Religi', 'Chill', 'Workout', 'Party'];
    let homeEl = null, homeTab = 'home', homeData = null, homeBusy = false, genreName = '', genreData = null;

    function homeCard(it, si) {
        return `<div class="yt-card${it.k === 'a' ? ' round' : ''}" data-hk="${it.k}" data-id="${esc(it.id)}" data-si="${si}">
            <img src="${esc(it.thumb || 'img/pplglogo.png')}" alt="" loading="lazy">
            <div class="yt-cn">${esc(it.title)}</div><div class="yt-cs">${esc(it.k === 's' ? it.artist : it.sub)}</div></div>`;
    }

    function genreHTML() {
        if (!genreName) {
            return '<div class="yh-genres">' + GENRES.map(g => {
                const hue = hash(g) % 360;
                return `<div class="yt-genre" data-g="${esc(g)}" style="background:hsl(${hue} 55% 36%)">${esc(g)}</div>`;
            }).join('') + '</div>';
        }
        let h = `<h3 class="yt-h2">${esc(genreName)}</h3>`;
        if (!genreData) return h + '<div class="yt-note">Memuat...</div>';
        const g = genreData;
        if (g.pls.length) h += '<h4 class="yt-h2">Playlists</h4><div class="yt-scroll">' +
            g.pls.map(p => homeCard({ k: 'p', id: p.id, title: p.title, sub: p.author || 'Playlist', thumb: p.thumb }, 0)).join('') + '</div>';
        if (g.songs.length) h += '<h4 class="yt-h2">Songs</h4>' + g.songs.map((s, i) => `
            <div class="yt-row" data-gi="${i}">
                <div class="yt-th"><img src="${esc(s.songImage)}" alt="" loading="lazy"><div class="yt-pl"><i class="fa-solid fa-play"></i></div></div>
                <div class="yt-info"><div class="yt-t">${esc(s.songName)}</div>
                    <div class="yt-s">Song • ${esc(s.songDes)}${s.dur ? ' • ' + fmt(s.dur) : ''}</div></div>
            </div>`).join('');
        if (!g.pls.length && !g.songs.length) h += '<div class="yt-note">Tidak ada hasil untuk genre ini.</div>';
        return h;
    }

    function renderHome() {
        if (!homeEl) return;
        const chips = '<div class="yh-chips">' +
            `<button type="button" class="yh-chip${homeTab === 'home' ? ' on' : ''}" data-t="home">Home</button>` +
            `<button type="button" class="yh-chip${homeTab === 'genre' ? ' on' : ''}" data-t="genre">${homeTab === 'genre' && genreName ? '‹ Genre' : 'Genre'}</button></div>`;
        let body = '';
        if (homeTab === 'genre') body = genreHTML();
        else if (homeBusy) body = '<div class="yt-note">Memuat beranda YouTube Music...</div>';
        else if (!homeData) body = '<div class="yt-note">Beranda YouTube Music tidak bisa dimuat. Pastikan laptop menyala dan server berjalan.<br>' +
            '<button type="button" class="ym-back yh-retry">Coba lagi</button> <button type="button" class="ym-back">Pakai Lagu Saya</button></div>';
        else body = homeData.sections.map((s, si) => `<div class="yh-sec"><h3 class="yt-h2">${esc(s.title)}</h3>` +
            `<div class="yt-scroll">${s.items.map(it => homeCard(it, si)).join('')}</div></div>`).join('');
        homeEl.innerHTML = chips + body;
    }

    async function loadHome(force) {
        if (mode !== 'yt' || homeBusy) return;
        if (homeData && !force) return;
        homeBusy = true;
        renderHome();
        try {
            const d = await getJSON('/home', 900000);
            homeData = d && Array.isArray(d.sections) && d.sections.length ? d : null;
        } catch (e) { homeData = null; }
        homeBusy = false;
        renderHome();
    }

    async function openGenre(g) {
        genreName = g;
        genreData = null;
        renderHome();
        const enc = encodeURIComponent(g + ' music');
        const [rp, rs] = await Promise.allSettled([getJSON('/search?q=' + enc + '&type=playlist'), getJSON('/search?q=' + enc)]);
        if (genreName !== g) return;                    // sudah pindah genre
        genreData = {
            pls: rp.status === 'fulfilled' && Array.isArray(rp.value) ? rp.value.slice(0, 12) : [],
            songs: rs.status === 'fulfilled' && Array.isArray(rs.value) ? register(rs.value) : []
        };
        renderHome();
    }

    function onHomeClick(e) {
        if (e.target.closest('.yh-retry')) return loadHome(true);
        if (e.target.closest('.ym-back')) return setMode('local');
        const tab = e.target.closest('.yh-chip');
        if (tab) { homeTab = tab.dataset.t; genreName = ''; genreData = null; renderHome(); if (homeTab === 'home') loadHome(); return; }
        const gt = e.target.closest('.yt-genre');
        if (gt) return openGenre(gt.dataset.g);
        const gr = e.target.closest('.yt-row[data-gi]');
        if (gr && genreData) {
            const s = genreData.songs[parseInt(gr.dataset.gi)];            if (s) { if (playerBar.classList.contains('show') && getCurrentSong().id === s.id) play.click(); else playRelated(s, genreData.songs); }

            return;
        }
        const c = e.target.closest('.yt-card[data-hk]');
        if (!c) return;
        if (c.dataset.hk === 's') {
            const sec = homeData && homeData.sections[parseInt(c.dataset.si)];
            if (!sec) return;
            const queue = register(sec.items.filter(x => x.k === 's'));    // satu rak = satu antrean
            return playSongFromList(idOf(c.dataset.id), queue);
        }
        openYtPage(c.dataset.hk, c.dataset.id);
    }

    function buildHome() {
        const right = document.querySelector('.main-right-part');
        if (!right || document.getElementById('ytHome')) return;
        homeEl = document.createElement('div');
        homeEl.id = 'ytHome';
        homeEl.className = 'music-section';       // ikut aturan hide/show halaman lain (playlist, pencarian)
        right.prepend(homeEl);
        homeEl.addEventListener('click', onHomeClick);
        renderHome();
    }

    // saran pencarian dari YouTube Music menggantikan saran lokal di dropdown (Mode YouTube Music)
    let sugQ = '', sugItems = [], sugTimer = null, sugTok = 0, sugVer = 0;

    function paintSug() {
        const inp = document.querySelector('.input-box'), dd = document.querySelector('.search-dropdown');
        const typing = mode === 'yt' && !!(inp && inp.value.trim());
        document.body.classList.toggle('yt-typing', typing);
        if (!typing || !sugItems.length || !dd || !dd.classList.contains('show')) return;
        if (dd.dataset.sv === String(sugVer) && dd.firstElementChild && dd.firstElementChild.classList.contains('ys')) return;
        dd.dataset.sv = String(sugVer);
        dd.innerHTML = sugItems.map(t => `
            <div class="sd-sug ys" data-text="${esc(t)}">
                <span class="sd-sug-icon"><i class="fa-solid fa-magnifying-glass"></i></span>
                <span class="sd-sug-text">${esc(t)}</span>
                <button type="button" class="sd-fill" data-act="fill" data-text="${esc(t)}" title="Use this search">
                    <i class="fa-solid fa-arrow-up" style="transform:rotate(-45deg)"></i>
                </button>
            </div>`).join('');
    }

    function mountSuggest() {
        // listener di window (fase capture) supaya jalan lebih dulu dari search.js yang menghentikan event input
        window.addEventListener('input', e => {
            const inp = e.target;
            if (!inp || !inp.classList || !inp.classList.contains('input-box')) return;
            const q = inp.value.trim();
            document.body.classList.toggle('yt-typing', mode === 'yt' && !!q);
            if (mode !== 'yt') return;
            clearTimeout(sugTimer);
            const my = ++sugTok;
            if (!q) { sugItems = []; sugQ = ''; sugVer++; return; }
            sugTimer = setTimeout(async () => {
                try {
                    const r = await getJSON('/suggest?q=' + encodeURIComponent(q), 120000);
                    if (my !== sugTok) return;
                    sugQ = q;
                    sugItems = Array.isArray(r) ? r.slice(0, 8) : [];
                    sugVer++;
                    paintSug();
                } catch (err) { }
            }, 200);
        }, true);
        const dd = document.querySelector('.search-dropdown');
        if (dd) new MutationObserver(paintSug).observe(dd, { childList: true });   // search.js menggambar ulang -> pasang lagi
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
        on('previoustrack', () => { if (typeof playPrevSong === 'function') playPrevSong(); });
    }

    // ---------- simpan lagu di memori browser supaya tidak tersendat saat jaringan jelek ----------
    const blobs = new Map();          // kode video -> { url, t }
    const pendingBlob = new Map();
    const BLOB_MAX = 6;               // maksimal 6 lagu di memori
    const BLOB_ON = false;            // true = unduh 2 lagu berikutnya penuh ke memori (tidak tersendat di jaringan jelek, tapi boros kuota)
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
        if (s.viaLocal) return Promise.resolve(false);
        if (!BLOB_ON) return Promise.resolve(false);
        if (s.dur > 600) return Promise.resolve(false);      // lagu panjang jangan diunduh ke memori HP
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

    // lagu yang akan diputar berikutnya menurut pemutar Spotiware (antrean pengguna dulu, lalu `order`, sudah termasuk shuffle)
    function upcoming(n) {
        const toS = x => (x && typeof x === 'object') ? x : songs.find(s => s.id === x);
        const out = [];
        try {
            if (typeof queue !== 'undefined' && Array.isArray(queue)) queue.slice(0, n).forEach(x => out.push(toS(x)));
            if (typeof order !== 'undefined' && Array.isArray(order) && order.length && typeof currentIndex === 'number') {
                for (let k = 1; out.length < n && k <= n; k++) out.push(toS(order[(currentIndex + k) % order.length]));
            }
        } catch (e) { }
        return out.filter(s => s && s.yt);
    }

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
                playRelated(s, list);               // lagu berikutnya = yang berkaitan, bukan sekadar ke bawah
            }
        });

        input.addEventListener('keydown', e => { if (e.key === 'Enter') run(input.value); });
        new MutationObserver(() => {
            if (view.classList.contains('show')) run(input.value);
            else { lastQ = ''; list = []; token++; block.innerHTML = ''; }
        }).observe(view, { attributes: true, attributeFilter: ['class'] });

        ['play', 'playing', 'pause', 'loadstart'].forEach(ev => audio.addEventListener(ev, markCurrent));
        watchAudioErrors();
        buildHome();
        mountSuggest();
        if (mode === 'yt') loadHome();

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
        audio.addEventListener('playing', () => {       // siapkan 2 lagu yang benar-benar akan diputar berikutnya
            try {
                const nx = upcoming(2);
                if (!nx.length) return;
                prefetch(nx.map(s => s.yt));                 // server mengunduh lebih dulu
                nx.reduce((p, s) => p.then(() => ensureBlob(s)), Promise.resolve());   // browser menyimpan satu per satu
            } catch (e) { }
        });
    }

    // halaman playlist/artis YouTube: klik cover tidak membuka pemilih foto
    document.addEventListener('click', e => {
        if (document.body.classList.contains('yt-page') && e.target.closest('#playlistDetailCover')) e.stopPropagation();
    }, true);

    // kursor berhenti 0,15 detik di lagu YouTube (atau jari menyentuhnya) -> server mulai menyiapkannya sebelum diklik
    let hotT = null;
    const hotId = el => {
        if (mode !== 'yt' || !el || !el.closest) return null;
        const r = el.closest('.yt-row[data-i], .yt-row[data-gi], .yt-card[data-hk="s"], #playlistTrackTableBody tr[data-song-id]');
        if (!r) return null;
        if (r.dataset.hk) return r.dataset.id;
        let s = null;
        if (r.dataset.i !== undefined) s = list[parseInt(r.dataset.i)];
        else if (r.dataset.gi !== undefined) s = genreData && genreData.songs[parseInt(r.dataset.gi)];
        else s = songs.find(x => x.id === parseInt(r.dataset.songId));
        return s && s.yt ? s.yt : null;
    };
    document.addEventListener('pointerover', e => {
        clearTimeout(hotT);
        const v = hotId(e.target);
        if (v) hotT = setTimeout(() => prefetch([v], true), 150);
    });
    document.addEventListener('pointerout', () => clearTimeout(hotT));
    document.addEventListener('pointerdown', e => { const v = hotId(e.target); if (v) prefetch([v], true); });

    // jaring pengaman: 30 detik sebelum lagu habis, pastikan lagu berikutnya sudah disiapkan (diulang kalau tadi gagal)
    let guardId = null;
    audio.addEventListener('timeupdate', () => {
        try {
            if (mode !== 'yt' || !audio.duration || audio.duration - audio.currentTime > 30) return;
            const cur = getCurrentSong();
            if (!cur || guardId === cur.id) return;
            guardId = cur.id;
            const nx = upcoming(1);
            if (!nx.length || blobs.has(nx[0].yt)) return;
            prefetched.delete(nx[0].yt);
            prefetch([nx[0].yt], true);
            ensureBlob(nx[0]);
        } catch (e) { }
    });

    // putar dari hasil pencarian / genre: lagu berikutnya = artis yang sama dulu, lalu radio YouTube Music
    let relToken = 0;
    async function playRelated(song, base) {
        const mine = new Set(song.artists || []);
        const sameArtist = base.filter(x => x.id !== song.id && (x.artists || []).some(a => mine.has(a)));
        const others = base.filter(x => x.id !== song.id && !sameArtist.includes(x));
        playSongFromList(song.id, [song, ...sameArtist, ...others]);      // langsung bunyi dengan antrean cepat

        const my = ++relToken;
        try {
            const d = await getJSON('/radio?id=' + encodeURIComponent(song.yt), 600000);
            if (my !== relToken || !Array.isArray(d) || !d.length) return;
            if (!playerBar.classList.contains('show') || getCurrentSong().id !== song.id) return;   // sudah pindah lagu
            if (typeof songOnShuffle !== 'undefined' && songOnShuffle) return;                      // shuffle: biarkan acak

            const rel = register(d);
            const seen = new Set([song.id]);
            const next = [];
            [...sameArtist.slice(0, 5), ...rel].forEach(x => { if (!seen.has(x.id)) { seen.add(x.id); next.push(x); } });

            order = [song, ...next];
            currentIndex = 0;
            currentContextList = [...order];
            try { preloadedPath = null; } catch (e) { }
            try { renderQueuePanel(); renderMobileSheet(); } catch (e) { }

            const nx = upcoming(2);                                   // siapkan 2 lagu berikutnya yang baru
            prefetch(nx.map(s => s.yt));
            nx.reduce((p, s) => p.then(() => ensureBlob(s)), Promise.resolve());
        } catch (e) { /* gagal: antrean cepat tetap dipakai */ }
    }

    // file lokal untuk lagu YouTube ini tidak ada / rusak -> otomatis pakai server YouTube Music
    audio.addEventListener('error', () => {
        try {
            const cur = getCurrentSong();
            if (!cur || !cur.viaLocal || !playerBar.classList.contains('show')) return;
            cur.viaLocal = false;
            cur.songPath = remoteUrl(cur.yt);
            audio.src = cur.songPath;
            audio.load();
            audio.play().catch(() => { });
        } catch (e) { }
    });

    // ---------- Mode YouTube Music: lagu berikutnya selalu dari YouTube Music ----------
    const AUTO_STAY_YT = true;     // true: lagu lokal di tengah playlist campuran juga dilewati. false: hanya akhir daftar yang disambung
    let autoBusy = false, autoFail = 0;

    function nextInLine() {
        try {
            if (typeof queue !== 'undefined' && queue.length) return queue[0];
            return order[currentIndex + 1];                  // undefined = akhir daftar
        } catch (e) { return undefined; }
    }

    async function ensureYtNext() {
        if (mode !== 'yt' || autoBusy || Date.now() - autoFail < 20000) return;
        if (!playerBar.classList.contains('show')) return;
        if (typeof songOnRepeat !== 'undefined' && songOnRepeat) return;
        const cur = getCurrentSong();
        if (!cur || !cur.yt) return;
        const nx = nextInLine();
        if (nx && nx.yt) return;                             // lagu berikutnya sudah dari YouTube
        if (nx && !AUTO_STAY_YT) return;

        autoBusy = true;
        try {
            let metas = [];
            try { const d = await getJSON('/radio?id=' + encodeURIComponent(cur.yt), 600000); if (Array.isArray(d)) metas = d; } catch (e) { }
            if (metas.length < 3) {                          // cadangan: lagu lain dari artis yang sama
                try {
                    const q = (cur.artists && cur.artists[0]) || cur.songDes;
                    const d = await getJSON('/search?q=' + encodeURIComponent(q), 600000);
                    if (Array.isArray(d)) metas = metas.concat(d);
                } catch (e) { }
            }
            if (!playerBar.classList.contains('show') || getCurrentSong().id !== cur.id) return;   // sudah pindah lagu

            const seen = new Set(order.map(s => s.id));
            seen.add(cur.id);
            try { playHistory.slice(0, 20).forEach(s => seen.add(s.id)); } catch (e) { }
            const rel = [];
            register(metas).forEach(s => { if (!seen.has(s.id)) { seen.add(s.id); rel.push(s); } });
            if (!rel.length) { autoFail = Date.now(); return; }

            const add = rel.slice(0, 25);
            order.splice(currentIndex + 1, 0, ...add);
            const ci = currentContextList.findIndex(s => s.id === cur.id);
            currentContextList.splice(ci >= 0 ? ci + 1 : currentContextList.length, 0, ...add);
            try { preloadedPath = null; renderQueuePanel(); renderMobileSheet(); } catch (e) { }

            const up = upcoming(2);
            prefetch(up.map(s => s.yt));
            up.reduce((p, s) => p.then(() => ensureBlob(s)), Promise.resolve());
        } catch (e) { autoFail = Date.now(); }
        finally { autoBusy = false; }
    }

    audio.addEventListener('playing', ensureYtNext);
    audio.addEventListener('timeupdate', () => {             // jaring pengaman 25 detik sebelum lagu habis
        if (audio.duration && audio.duration - audio.currentTime < 25) ensureYtNext();
    });

    window.YTMusic = { register, idOf, SERVER };
    init();
})();