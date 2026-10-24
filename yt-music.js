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

    const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
    const idOf = vid => ID_BASE + hash(vid);
    const fmt = sec => (!sec || sec < 0) ? '' : Math.floor(sec / 60) + ':' + String(Math.floor(sec % 60)).padStart(2, '0');
    const toast = (t, label, fn) => { if (typeof showToast === 'function') showToast(t, label, fn); };

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
        if (seg) seg.querySelectorAll('button[data-m]').forEach(b => b.classList.toggle('on', b.dataset.m === mode));
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
        const host = document.querySelector('nav .right-half') || document.querySelector('nav');
        if (!host || document.getElementById('ymSeg')) return;
        seg = document.createElement('div');
        seg.id = 'ymSeg';
        seg.className = 'ym-seg';
        seg.innerHTML =
            '<button type="button" data-m="local" title="Mode Lagu Saya"><i class="fa-solid fa-music"></i><span>Lagu Saya</span></button>' +
            '<button type="button" data-m="yt" title="Mode YouTube Music"><i class="fa-brands fa-youtube"></i><span>YouTube Music</span></button>';
        host.insertBefore(seg, host.firstChild);
        seg.addEventListener('click', e => {
            const b = e.target.closest('button[data-m]');
            if (b) setMode(b.dataset.m);
        });
    }

    // ---------- tampilan ----------
    function injectStyle() {
        const css = document.createElement('style');
        css.textContent = `
            .ym-seg{display:flex;gap:2px;padding:3px;border-radius:2rem;background:rgba(255,255,255,.1);margin-right:.8rem;flex:0 0 auto}
            .ym-seg button{display:flex;align-items:center;gap:.4rem;background:transparent;color:#fff;border:none;border-radius:2rem;
                padding:.35rem .8rem;font:inherit;font-size:.78rem;cursor:pointer;white-space:nowrap}
            .ym-seg button:hover{background:rgba(255,255,255,.14)}
            .ym-seg button.on{background:#fff;color:#000}
            @media (max-width:768px){.ym-seg button span{display:none}.ym-seg button{padding:.4rem .6rem}.ym-seg{margin-right:.4rem}}

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
        if (q === lastQ && list.length) return;
        lastQ = q;
        const my = ++token;
        list = [];
        render('Mencari di YouTube Music...');

        let data = null, down = false;
        try {
            const res = await fetch(SERVER + '/search?q=' + encodeURIComponent(q));
            if (res.ok) data = await res.json(); else down = res.status === 502 || res.status >= 500;
        } catch (e) { down = true; }
        if (my !== token) return;

        if (!Array.isArray(data)) {
            lastQ = '';
            render(down
                ? 'Server YouTube Music tidak bisa dihubungi. Pastikan laptop menyala dan server berjalan.<br>' +
                  '<button type="button" class="ym-back">Beralih ke Mode Lagu Saya</button>'
                : 'Pencarian YouTube Music gagal. Lihat pesan di terminal server.');
            return;
        }
        list = register(data);
        render(list.length ? '' : 'Tidak ada hasil dari YouTube Music.');
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
            const row = e.target.closest('.yt-row');
            if (!row) return;
            const s = list[parseInt(row.dataset.i)];
            if (!s) return;
            if (playerBar.classList.contains('show') && getCurrentSong().id === s.id) play.click();
            else playSongFromList(s.id, list);       // seluruh hasil jadi antrean: Next/Previous tetap jalan
        });

        input.addEventListener('keydown', e => { if (e.key === 'Enter') run(input.value); });
        new MutationObserver(() => {
            if (view.classList.contains('show')) run(input.value);
            else { lastQ = ''; list = []; token++; block.innerHTML = ''; }
        }).observe(view, { attributes: true, attributeFilter: ['class'] });

        ['play', 'playing', 'pause', 'loadstart'].forEach(ev => audio.addEventListener(ev, markCurrent));
        watchAudioErrors();
    }

    init();
})();