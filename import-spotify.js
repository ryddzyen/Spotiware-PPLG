// import-spotify.js — Import playlist Spotify: baca daftar lagu, cocokkan ke YouTube Music satu per satu, simpan jadi playlist
(function () {
    let overlay = null, ctl = null, running = false, view = 'setup', state = {};
    const MAX = 300;
    const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const server = () => (window.YTMusic && YTMusic.SERVER) || '';
    const toast = t => { try { showToast(t); } catch (e) { } };
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    function injectStyle() {
        const css = document.createElement('style');
        css.textContent = `
            .isp{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;padding:1rem}
            .isp-box{background:#181818;color:#fff;border-radius:14px;width:min(560px,100%);max-height:90vh;overflow-y:auto;padding:1.4rem 1.6rem}
            .isp-box h2{margin:0 0 .3rem;font-size:1.3rem}
            .isp-box p{margin:0 0 1rem;opacity:.7;font-size:.88rem;line-height:1.5}
            .isp-box input,.isp-box textarea{width:100%;box-sizing:border-box;padding:.65rem .8rem;border-radius:6px;border:1px solid #727272;background:rgba(0,0,0,.4);color:#fff;font:inherit;font-size:.9rem;outline:none;margin-bottom:.6rem}
            .isp-box textarea{min-height:130px;resize:vertical}
            .isp-box input:focus,.isp-box textarea:focus{border-color:var(--yellow,#FFD700)}
            .isp-or{text-align:center;opacity:.6;font-size:.8rem;margin:.6rem 0}
            .isp-err{color:#ff8a80;font-size:.82rem;line-height:1.5;margin:.2rem 0 .4rem}
            .isp-row{display:flex;gap:.6rem;justify-content:flex-end;margin-top:.8rem;flex-wrap:wrap}
            .isp-b{background:transparent;color:#fff;border:1px solid #727272;border-radius:2rem;padding:.55rem 1.2rem;font:inherit;font-weight:700;font-size:.85rem;cursor:pointer}
            .isp-b:hover{border-color:#fff}
            .isp-main{background:var(--yellow,#FFD700);color:#000;border-color:transparent}
            .isp-bar{height:8px;background:rgba(255,255,255,.15);border-radius:8px;overflow:hidden;margin:1rem 0 .6rem}
            .isp-bar i{display:block;height:100%;width:0;background:var(--yellow,#FFD700);transition:width .3s}
            .isp-txt{font-size:.88rem;opacity:.85;line-height:1.6}
            .isp-miss{max-height:180px;overflow-y:auto;font-size:.82rem;opacity:.8;margin-top:.6rem;padding-left:1.1rem}
        `;
        document.head.appendChild(css);
    }

    function parseText(txt) {
        return String(txt || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(l => {
            const i = l.lastIndexOf(' - ');
            return i > 0 ? { title: l.slice(0, i).trim(), artist: l.slice(i + 3).trim() } : { title: l, artist: '' };
        }).slice(0, MAX);
    }

    async function getJSON(path, signal) {
        const r = await fetch(server() + path, { signal });
        if (!r.ok) { const e = new Error('status ' + r.status); e.status = r.status; throw e; }
        return r.json();
    }

    async function matchOne(t, signal) {
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                return await getJSON('/match?title=' + encodeURIComponent(t.title) + '&artist=' + encodeURIComponent(t.artist), signal);
            } catch (e) {
                if (signal.aborted) throw e;
                if (attempt === 1) throw e;
                await sleep(e.status === 429 ? 8000 : 1000);      // kena batas: tunggu lebih lama, lalu coba sekali lagi
            }
        }
    }

    // ---------- tampilan ----------
    function render() {
        if (!overlay) return;
        let h = '<div class="isp-box">';
        if (view === 'setup') {
            h += `<h2>Import dari Spotify</h2>
                <p>Tempel link playlist Spotify yang publik. Lagunya dicari satu per satu di YouTube Music, jadi untuk playlist besar butuh beberapa menit.</p>
                <input id="ispName" placeholder="Nama playlist (opsional)" value="${esc(state.name || '')}">
                <input id="ispLink" placeholder="https://open.spotify.com/playlist/..." value="${esc(state.link || '')}">
                <div class="isp-row" style="margin-top:0"><button class="isp-b isp-main" id="ispFetch">Ambil dari link</button></div>
                ${state.err ? `<div class="isp-err">${state.err}</div>` : ''}
                <div class="isp-or">atau tempel daftar lagu manual</div>
                <textarea id="ispText" placeholder="Satu lagu per baris, formatnya:&#10;Judul - Artis">${esc(state.text || '')}</textarea>
                <div class="isp-row"><button class="isp-b" id="ispCancel">Tutup</button><button class="isp-b isp-main" id="ispManual">Cocokkan daftar</button></div>`;
        } else if (view === 'run') {
            const p = state.total ? Math.round(state.done / state.total * 100) : 0;
            h += `<h2>Mencocokkan lagu...</h2>
                <div class="isp-bar"><i style="width:${p}%"></i></div>
                <div class="isp-txt">${state.done} / ${state.total} diproses<br>${state.found} ketemu · ${state.missing} tidak ketemu</div>
                <div class="isp-row"><button class="isp-b" id="ispStop">Berhenti dan simpan yang sudah ketemu</button></div>`;
        } else {
            h += `<h2>${esc(state.title)}</h2>
                <div class="isp-txt">${state.msg}</div>
                ${state.missList && state.missList.length ? `<div class="isp-txt" style="margin-top:.8rem">Tidak ditemukan di YouTube Music:</div><ul class="isp-miss">${state.missList.map(m => `<li>${esc(m)}</li>`).join('')}</ul>` : ''}
                <div class="isp-row">
                    <button class="isp-b" id="ispCancel">Tutup</button>
                    ${state.plId ? '<button class="isp-b" id="ispOpenPl">Buka playlist</button><button class="isp-b isp-main" id="ispPlay">Putar</button>' : ''}
                </div>`;
        }
        overlay.innerHTML = h + '</div>';
    }

    function close() {
        if (running && ctl) ctl.abort();
        overlay && overlay.remove();
        overlay = null;
    }

    function open() {
        if (overlay) return;
        if (!window.YTMusic) { toast('Fitur YouTube Music belum siap, coba lagi sebentar'); return; }
        view = 'setup';
        state = {};
        overlay = document.createElement('div');
        overlay.className = 'isp';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', onClick);
        render();
    }

    // ---------- proses ----------
    async function run(name, tracks) {
        running = true;
        ctl = new AbortController();
        const found = [], missList = [], seen = new Set();
        let fails = 0, stopped = '', approx = 0;
        view = 'run';
        state = { total: tracks.length, done: 0, found: 0, missing: 0 };
        render();

        for (let i = 0; i < tracks.length; i++) {
            if (ctl.signal.aborted) break;
            const t = tracks[i];
            try {
                const d = await matchOne(t, ctl.signal);
                fails = 0;
                if (d && d.found && d.song) {
                    if (!seen.has(d.song.id)) { seen.add(d.song.id); found.push(d.song); if (d.approx) approx++; }
                } else missList.push(t.title + (t.artist ? ' - ' + t.artist : ''));
            } catch (e) {
                if (ctl.signal.aborted) break;
                missList.push(t.title + (t.artist ? ' - ' + t.artist : ''));
                if (++fails >= 4) { stopped = 'Server YouTube Music tidak bisa dihubungi, proses dihentikan.'; break; }
            }
            state.done = i + 1;
            state.found = found.length;
            state.missing = missList.length;
            if (overlay) render();
        }
        running = false;
        if (!overlay) return;                         // modal ditutup di tengah jalan

        const aborted = ctl.signal.aborted;
        if (!found.length) {
            view = 'done';
            state = { title: 'Tidak ada lagu yang cocok', msg: stopped || 'Tidak satu pun lagu ditemukan di YouTube Music.', missList: missList.slice(0, 100) };
            return render();
        }

        const items = YTMusic.register(found);
        const pl = createPlaylist(name || 'Import Spotify');
        const all = getPlaylists();
        const p = all.find(x => x.id === pl.id);
        const now = Date.now();
        p.songIds = items.map(s => s.id);
        p.addedDates = {};
        items.forEach(s => { p.addedDates[s.id] = now; });
        p.description = 'Diimpor dari Spotify';
        savePlaylists(all);
        try { renderPlaylistList(); } catch (e) { }

        view = 'done';
        state = {
            title: stopped || aborted ? 'Disimpan sebagian' : 'Selesai',
            msg: (stopped ? esc(stopped) + '<br>' : '') +
                `${items.length} lagu masuk ke playlist <b>${esc(p.name)}</b>.` +
                (approx ? `<br>${approx} lagu dicocokkan berdasarkan judul saja (artisnya mungkin beda).` : '') +
                (missList.length ? `<br>${missList.length} lagu tidak ditemukan.` : ''),
            missList: missList.slice(0, 100),
            plId: p.id
        };
        render();
    }

    async function fromLink() {
        const link = (overlay.querySelector('#ispLink').value || '').trim();
        const name = (overlay.querySelector('#ispName').value || '').trim();
        state = { name, link, text: overlay.querySelector('#ispText').value, err: '' };
        if (!/spotify\.com\/.*playlist\//.test(link)) { state.err = 'Itu bukan link playlist Spotify.'; return render(); }
        const btn = overlay.querySelector('#ispFetch');
        btn.disabled = true; btn.textContent = 'Membaca playlist...';
        try {
            const d = await getJSON('/spotify-list?url=' + encodeURIComponent(link));
            if (!d || !Array.isArray(d.tracks) || !d.tracks.length) throw new Error('daftar kosong');
            run(name || d.name, d.tracks.slice(0, MAX));
        } catch (e) {
            state.err = 'Tidak bisa membaca link itu (' + esc(e.message) + '). Pastikan playlist publik dan server menyala, atau tempel daftar lagu manual di bawah.';
            render();
        }
    }

    function fromText() {
        const name = (overlay.querySelector('#ispName').value || '').trim();
        const tracks = parseText(overlay.querySelector('#ispText').value);
        state = { name, link: overlay.querySelector('#ispLink').value, text: overlay.querySelector('#ispText').value, err: '' };
        if (!tracks.length) { state.err = 'Daftar lagu masih kosong.'; return render(); }
        run(name, tracks);
    }

    function onClick(e) {
        const id = e.target.id;
        if (id === 'ispFetch') return fromLink();
        if (id === 'ispManual') return fromText();
        if (id === 'ispStop') { if (ctl) ctl.abort(); return; }
        if (id === 'ispCancel' || e.target === overlay) return close();
        if (id === 'ispOpenPl' || id === 'ispPlay') {
            const p = getPlaylists().find(x => x.id === state.plId);
            if (!p) return;
            close();
            if (id === 'ispOpenPl') return openPlaylistDetailView(p, false);
            const list = getSongsInPlaylist(p);
            if (list.length) playSongFromList(list[0].id, list);
        }
    }

    // ---------- tombol pembuka ----------
    function addEntry() {
        const plus = document.getElementById('newPlaylistBtn');
        if (plus && !document.getElementById('ispOpen')) {
            const b = document.createElement('button');
            b.type = 'button';
            b.id = 'ispOpen';
            b.className = plus.className;
            b.title = 'Import dari Spotify';
            b.innerHTML = '<i class="fa-brands fa-spotify"></i>';
            plus.insertAdjacentElement('afterend', b);
            b.addEventListener('click', open);
        }
        const cm = document.getElementById('createMenuPlaylist');
        if (cm && !document.getElementById('createMenuSpotify')) {
            const c = cm.cloneNode(true);
            c.id = 'createMenuSpotify';
            const ic = c.querySelector('i');
            if (ic) ic.className = 'fa-brands fa-spotify';
            const leaf = [...c.querySelectorAll('*')].find(el => el.tagName !== 'I' && !el.children.length && el.textContent.trim());
            if (leaf) leaf.textContent = 'Import dari Spotify';
            else { [...c.childNodes].forEach(n => { if (n.nodeType === 3) n.remove(); }); c.append(' Import dari Spotify'); }
            cm.insertAdjacentElement('afterend', c);
            c.addEventListener('click', () => { try { closeCreateMenu(); } catch (e) { } open(); });
        }
        if (!document.getElementById('ispOpen')) setTimeout(addEntry, 400);
    }

    function init() {
        if (typeof createPlaylist !== 'function' || typeof getPlaylists !== 'function') return setTimeout(init, 300);
        injectStyle();
        addEntry();
    }
    init();
})();