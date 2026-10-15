// ===== addsongs-view.js : tombol "Add" di playlist -> halaman penuh "Add to this playlist" =====
(() => {
    const rightPart = document.querySelector('.main-right-part');
    const addBtn = document.getElementById('pdAddSongsBtn');
    if (!rightPart || !addBtn) return;

    const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const mobile = () => typeof isMobileView === 'function' && isMobileView();

    const el = document.createElement('div');
    el.className = 'addv';
    el.innerHTML = `
        <div class="addv-head">
            <button type="button" class="addv-back" title="Back"><i class="fa-solid fa-arrow-left"></i></button>
            <h2 class="addv-title">Add to this playlist</h2>
            <span class="addv-sub"></span>
            <span class="addv-gap"></span>
        </div>
        <div class="addv-chips">
            <button type="button" class="addv-chip active" data-c="songs">Songs</button>
            <button type="button" class="addv-chip" data-c="recent">Recently played</button>
            <button type="button" class="addv-chip" data-c="library">From your library</button>
        </div>
        <div class="addv-list"></div>
        <div class="addv-search">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="What would you like to add?" autocomplete="off" autocapitalize="none" spellcheck="false">
        </div>`;
    rightPart.prepend(el);

    const listEl = el.querySelector('.addv-list');
    const input = el.querySelector('.addv-search input');
    let chip = 'songs', query = '', list = [], open = false, pushed = false;

    const curPlaylist = () => getPlaylists().find((p) => p.id === pdCurrentPlaylistId) || null;

    // ---------- daftar lagu ----------
    function currentSongs() {
        const q = query.toLowerCase().trim();
        let pool;
        if (chip === 'recent') pool = playHistory.slice();
        else if (chip === 'library') {
            const seen = new Set();
            pool = [];
            getPlaylists().forEach((p) => p.songIds.forEach((id) => {
                if (seen.has(id)) return;
                seen.add(id);
                const s = songs.find((x) => x.id === id);
                if (s) pool.push(s);
            }));
        } else pool = q ? songs : visibleSongs.slice();   // lagu rahasia hanya muncul lewat keyword

        if (!q) return pool;
        const out = pool.filter((s) => {
            if (s.hidden && chip === 'songs') {
                return [].concat(s.keyword || s.songName).some((k) => String(k).toLowerCase().includes(q));
            }
            return s.songName.toLowerCase().includes(q) || s.songDes.toLowerCase().includes(q);
        });
        const rank = (s) => {
            const n = s.songName.toLowerCase(), a = s.songDes.toLowerCase();
            return n.startsWith(q) ? 0 : n.includes(q) ? 1 : a.startsWith(q) ? 2 : 3;
        };
        return out.map((s, i) => [s, i]).sort((x, y) => rank(x[0]) - rank(y[0]) || x[1] - y[1]).map((x) => x[0]);
    }

    function render() {
        const p = curPlaylist();
        const have = new Set(p ? p.songIds : []);
        list = currentSongs();
        if (!list.length) {
            listEl.innerHTML = `<div class="addv-empty">${
                chip === 'recent' ? 'Songs you play will show up here.' :
                chip === 'library' ? 'No songs in your library yet.' : 'No results found.'}</div>`;
            return;
        }
        listEl.innerHTML = list.map((s) => {
            const on = have.has(s.id);
            return `
                <div class="addv-row" data-id="${s.id}">
                    <div class="addv-cover" title="Play"><img src="${esc(s.songImage)}" alt="" loading="lazy"><i class="fa-solid fa-play"></i></div>
                    <div class="addv-info">
                        <div class="addv-t">${esc(s.songName)}</div>
                        <div class="addv-a">${esc(s.songDes)}</div>
                    </div>
                    <button type="button" class="addv-btn${on ? ' on' : ''}" title="${on ? 'Remove from playlist' : 'Add to playlist'}">
                        <i class="fa-solid ${on ? 'fa-check' : 'fa-plus'}"></i>
                    </button>
                </div>`;
        }).join('');
    }

    // ---------- interaksi ----------
    el.querySelector('.addv-chips').addEventListener('click', (e) => {
        const c = e.target.closest('.addv-chip');
        if (!c) return;
        chip = c.dataset.c;
        el.querySelectorAll('.addv-chip').forEach((x) => x.classList.toggle('active', x === c));
        render();
        listEl.scrollTop = 0;
    });

    input.addEventListener('input', () => { query = input.value; render(); listEl.scrollTop = 0; });

    listEl.addEventListener('click', (e) => {
        const row = e.target.closest('.addv-row');
        if (!row) return;
        const id = parseInt(row.dataset.id);

        if (e.target.closest('.addv-cover')) {             // ketuk cover = putar / jeda lagunya
            if (playerBar.classList.contains('show') && getCurrentSong().id === id) play.click();
            else playSongFromList(id, list.slice());
            return;
        }

        const b = e.target.closest('.addv-btn');           // ketuk ⊕ = tambah / hapus dari playlist
        if (!b) return;
        const p = curPlaylist();
        if (!p) return;
        if (p.songIds.includes(id)) removeSongFromPlaylist(p.id, id);
        else addSongToPlaylist(p.id, id);
        const now = curPlaylist();
        const on = !!(now && now.songIds.includes(id));
        b.classList.toggle('on', on);
        b.title = on ? 'Remove from playlist' : 'Add to playlist';
        b.querySelector('i').className = 'fa-solid ' + (on ? 'fa-check' : 'fa-plus');
    });

    // ---------- buka / tutup ----------
    function fit() {   // HP: kolom pencarian naik di atas keyboard
        if (!open || !mobile()) { el.style.bottom = ''; return; }
        const vv = window.visualViewport;
        const kb = vv ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
        el.style.bottom = kb + 'px';
    }
    if (window.visualViewport) {
        visualViewport.addEventListener('resize', fit);
        visualViewport.addEventListener('scroll', fit);
    }

    function show() {
        const p = curPlaylist();
        if (!p) return;
        chip = 'songs'; query = ''; input.value = '';
        el.querySelectorAll('.addv-chip').forEach((x) => x.classList.toggle('active', x.dataset.c === 'songs'));
        el.querySelector('.addv-sub').textContent = p.name;
        open = true;
        document.body.classList.add('addv-open');
        render();
        listEl.scrollTop = 0;
        rightPart.scrollTo({ top: 0 });
        if (mobile()) { history.pushState({ addv: 1 }, ''); pushed = true; }
        fit();
    }

    function teardown() {
        open = false;
        document.body.classList.remove('addv-open');
        el.style.bottom = '';
        input.blur();
    }

    function hide(fromPop) {
        if (!open) return;
        teardown();
        if (pushed) {
            pushed = false;
            if (!fromPop && history.state && history.state.addv) history.back();
        }
        const p = curPlaylist();
        if (p) openPlaylistDetailView(p, pdCurrentIsLiked);   // daftar lagu playlist diperbarui
        renderPlaylistList();
    }

    // tombol "Add" lama (panel kecil di kanan) diganti halaman ini
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#pdAddSongsBtn')) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        show();
    }, true);

    el.querySelector('.addv-back').addEventListener('click', () => hide(false));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) hide(false); });
    window.addEventListener('popstate', () => { if (open) hide(true); });   // tombol Back bawaan HP

    // pindah halaman (Home, pencarian, dll) -> halaman ini ikut tertutup
    const _closePD = closePlaylistDetailView;
    closePlaylistDetailView = function () {
        if (open) { teardown(); pushed = false; }
        _closePD();
    };
    firebase.auth().onAuthStateChanged(() => { if (open) { teardown(); pushed = false; } });
})();