// yt-music.js — YouTube Music lewat server lokal (youtubei.js). Array songs lokal tidak diubah strukturnya.
(function () {
    const SERVER = 'http://127.0.0.1:3001';
    const ID_BASE = 20000000000;
    const CACHE_KEY = 'spotiware_yt_cache';
    const CACHE_MAX = 800;
    let block = null, list = [], lastQ = '', token = 0;

    const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
    const idOf = vid => ID_BASE + hash(vid);
    const fmt = sec => (!sec || sec < 0) ? '' : Math.floor(sec / 60) + ':' + String(Math.floor(sec % 60)).padStart(2, '0');

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

    // ---------- tampilan ----------
    function injectStyle() {
        const css = document.createElement('style');
        css.textContent = `
            #ytBlock{padding:0 1.4rem 2rem}
            #ytBlock .yt-h{font-size:1.3rem;margin:1.4rem 0 .6rem}
            #ytBlock .yt-note{font-size:.85rem;opacity:.75;padding:.6rem 0;line-height:1.5}
            #ytBlock code{background:rgba(255,255,255,.12);padding:.1rem .4rem;border-radius:4px}
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

    // ---------- pencarian ----------
    async function run(q) {
        q = (q || '').trim();
        if (!q || !block) return;
        if (q === lastQ && list.length) return;
        lastQ = q;
        const my = ++token;
        list = [];
        render('Mencari di YouTube Music...');

        let data = null, down = false;
        try {
            const res = await fetch(SERVER + '/search?q=' + encodeURIComponent(q));
            if (res.ok) data = await res.json(); else down = res.status === 502;
        } catch (e) { down = true; }
        if (my !== token) return;

        if (!Array.isArray(data)) {
            lastQ = '';
            render(down
                ? 'Server YouTube Music belum jalan. Jalankan <code>node yt-server.mjs</code> di terminal.'
                : 'Pencarian YouTube Music gagal. Lihat pesan di terminal server.');
            return;
        }
        list = register(data);
        render(list.length ? '' : 'Tidak ada hasil dari YouTube Music.');
    }

    function init() {
        const view = document.getElementById('searchView');
        const input = document.querySelector('.input-box');
        if (!view || !input || typeof songs === 'undefined' || typeof playSongFromList !== 'function') return setTimeout(init, 300);

        injectStyle();
        restoreCache();

        block = document.createElement('div');
        block.id = 'ytBlock';
        view.appendChild(block);

        // klik lagu: seluruh hasil jadi antrean, jadi next/previous berpindah antar lagu YouTube
        block.addEventListener('click', e => {
            const row = e.target.closest('.yt-row');
            if (!row) return;
            const s = list[parseInt(row.dataset.i)];
            if (!s) return;
            if (playerBar.classList.contains('show') && getCurrentSong().id === s.id) play.click();
            else playSongFromList(s.id, list);
        });

        input.addEventListener('keydown', e => { if (e.key === 'Enter') run(input.value); });
        new MutationObserver(() => {
            if (view.classList.contains('show')) run(input.value);
            else { lastQ = ''; list = []; token++; block.innerHTML = ''; }
        }).observe(view, { attributes: true, attributeFilter: ['class'] });

        ['play', 'playing', 'pause', 'loadstart'].forEach(ev => audio.addEventListener(ev, markCurrent));
    }

    init();
})();