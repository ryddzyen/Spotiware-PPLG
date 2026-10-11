// ===== plx.js : aksi playlist + love ala Spotify =====
// - Hover playlist -> tombol play/pause kuning
// - Titik 3 (⋮) + klik kanan di playlist: Add to your library, Add to your playlist, Add to queue, Share link
// - Hasil pencarian "All": playlist punya love (langsung masuk Library)
// - Love di LAGU -> muncul modal "Tambah ke Playlist" (Liked Songs / playlist lain)
// Pasang PALING AKHIR (setelah social.js, friends.js, mobile.js):  <script src="plx.js" defer></script>
(() => {
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const myUid = () => (window.firebase && firebase.auth().currentUser) ? firebase.auth().currentUser.uid : null;
    const stop = (e) => { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); };

    // ---------- style ----------
    const style = document.createElement('style');
    style.textContent = `
        .sv-card-img, .pf-pl-cover, .sv-item-img { position: relative; }

        /* tombol play kuning (kartu) */
        .pl-play {
            position: absolute; right: 8px; bottom: 8px; z-index: 3;
            width: 46px; height: 46px; border: 0; border-radius: 50%;
            background: var(--yellow, #ffd60a); color: #000; font-size: 1.05rem;
            display: grid; place-items: center; cursor: pointer;
            opacity: 0; transform: translateY(8px); transition: opacity .2s, transform .2s;
            box-shadow: 0 8px 18px rgba(0, 0, 0, .45);
        }
        .pl-play i { margin-left: 2px; }
        .pl-play.on i { margin-left: 0; }
        .sv-card:hover .pl-play, .pf-pl-card:hover .pl-play, .pl-play.on, .pl-play:focus-visible { opacity: 1; transform: none; }

        /* tombol play di baris kecil: menimpa cover */
        .sv-item .sv-item-img .pl-play {
            inset: 0; right: auto; bottom: auto; width: 100%; height: 100%;
            border-radius: inherit; background: rgba(0, 0, 0, .55); color: var(--yellow, #ffd60a);
            box-shadow: none; transform: none; font-size: 1rem;
        }
        .sv-item:hover .sv-item-img .pl-play, .sv-item .sv-item-img .pl-play.on { opacity: 1; }
        .sv-item .sv-item-info { flex: 1; min-width: 0; }

        /* tile grid Home */
        .mh-tile { position: relative; }
        .mh-tile .pl-play { right: .8rem; bottom: auto; top: 50%; margin-top: -20px; width: 40px; height: 40px; transform: translateY(6px); }
        .mh-tile:hover .pl-play, .mh-tile .pl-play.on { opacity: 1; transform: none; }
        @media (hover: none) { .mh-tile .pl-play { display: none; } }

        /* titik 3 */
        .sv-card .pl-more { display: none !important; }
        .pl-more, .pl-heart {
            flex-shrink: 0; width: 38px; height: 38px; border: 0; border-radius: 50%;
            background: none; color: #b3b3b3; font-size: 1.05rem; cursor: pointer;
            display: grid; place-items: center;
        }
        .pl-more:hover, .pl-heart:hover { color: #fff; }
        .pl-heart.liked { color: var(--yellow, #ffd60a); }
        .sv-card-img .pl-more, .pf-pl-cover .pl-more {
            position: absolute; top: 8px; right: 8px; z-index: 3; width: 34px; height: 34px;
            background: rgba(0, 0, 0, .62); color: #fff;
            opacity: 0; transition: opacity .2s;
        }
        .sv-card:hover .pl-more, .pf-pl-card:hover .pl-more, .pl-more:focus-visible { opacity: 1; }
        @media (hover: none) {
            .pl-play, .sv-card-img .pl-more, .pf-pl-cover .pl-more { opacity: 1; transform: none; }
            .sv-item .sv-item-img .pl-play { opacity: 0; }
        }

        /* foto profil lebih besar */
        .profile-view .pf-avatar {
            width: clamp(220px, 22vw, 340px) !important;
            height: clamp(220px, 22vw, 340px) !important;
        }
        @media (max-width: 768px) {
            .profile-view .pf-avatar { width: clamp(150px, 42vw, 200px) !important; height: clamp(150px, 42vw, 200px) !important; }
        }
    `;
    document.head.appendChild(style);

    // =====================================================
    // Registry playlist: key = 'pub:<docId>' (playlist publik) | 'loc:<id>' (playlist sendiri)
    // =====================================================
    const items = {};
    let playingKey = null;

    const getItem = (key) => {
        if (!key) return null;
        if (key.startsWith('loc:')) return getPlaylists().find((p) => p.id === key.slice(4)) || null;
        return items[key] || null;
    };
    const songsOf = (it) => ((it && it.songIds) || []).map((id) => songs.find((s) => s.id === id)).filter(Boolean);
    const coverOfItem = (it) => (window.Social && Social.coverOf)
        ? Social.coverOf({ cover: it.cover || it.coverImage, songIds: it.songIds })
        : (it.cover || it.coverImage || null);

    const isOwn = (key, it) => key.startsWith('loc:') || !!(it && it.ownerUid && it.ownerUid === myUid());
    const inLibrary = (key, it) => isOwn(key, it) || getPlaylists().some((p) => p.savedFrom === key);

    // semua hasil searchPlaylists otomatis terdaftar
    if (window.Social && Social.searchPlaylists) {
        const _sp = Social.searchPlaylists;
        Social.searchPlaylists = async (q) => {
            const res = await _sp(q);
            res.forEach((it) => { items['pub:' + it.id] = it; });
            return res;
        };
    }

    // =====================================================
    // Dekorasi elemen playlist (play, titik 3, love)
    // =====================================================
    const playBtn = (key) => `<button type="button" class="pl-play" data-pl-play="1" title="Play"><i class="fa-solid fa-play"></i></button>`;
    const moreBtn = '<button type="button" class="pl-more" title="More"><i class="fa-solid fa-ellipsis-vertical"></i></button>';
    const heartHTML = (saved) => `<button type="button" class="pl-heart${saved ? ' liked' : ''}" title="${saved ? 'Remove from Your Library' : 'Save to Your Library'}"><i class="${saved ? 'fa-solid' : 'fa-regular'} fa-heart"></i></button>`;

    function decorate(el, key, item) {
        if (!el || el.dataset.pl) return;
        items[key] = items[key] || item;
        el.dataset.pl = key;
        if (el.classList.contains('mh-tile')) {          // tile grid Home
            el.insertAdjacentHTML('beforeend', playBtn(key));
            syncPlayIcons();
            return;
        }
        const isRow = el.classList.contains('sv-item');
        const cover = el.querySelector('.pf-pl-cover, .sv-card-img, .sv-item-img');
        if (cover && !cover.querySelector('.pl-play')) cover.insertAdjacentHTML('beforeend', playBtn(key));
        if (isRow) {
            el.insertAdjacentHTML('beforeend', moreBtn);
            if (!isOwn(key, item)) el.insertAdjacentHTML('beforeend', heartHTML(inLibrary(key, item)));
        } else if (cover && !el.classList.contains('sv-card')) {
            // kartu di hasil pencarian (kategori Playlists) tanpa titik 3, klik kanan tetap bisa
            cover.insertAdjacentHTML('beforeend', moreBtn);
        }
        syncPlayIcons();
    }

    // hasil pencarian dirender ulang lewat innerHTML -> dekorasi otomatis
    function decorateSearch(root) {
        root.querySelectorAll('.sv-card[data-kind="playlist"], .sv-item[data-kind="playlist"]').forEach((el) => {
            if (el.dataset.pl) return;
            const key = 'pub:' + el.dataset.id;
            const it = items[key];
            if (it) decorate(el, key, it);
        });
    }
    const svList = document.getElementById('svList');
    if (svList) new MutationObserver(() => decorateSearch(svList)).observe(svList, { childList: true });

    // tile grid Home (dibuat mobile.js) ikut dapat tombol play
    const mhGrid = document.getElementById('mhGrid');
    function decorateTiles() {
        if (!mhGrid) return;
        mhGrid.querySelectorAll('.mh-tile').forEach((el) => {
            if (!el.dataset.pl && el.dataset.pid) decorate(el, 'loc:' + el.dataset.pid, null);
        });
    }
    if (mhGrid) {
        new MutationObserver(decorateTiles).observe(mhGrid, { childList: true });
        decorateTiles();
    }

    // =====================================================
    // Play / pause playlist
    // =====================================================
    function isPlayingKey(key) {
        const it = getItem(key);
        if (!it || playingKey !== key || audio.paused || !playerBar.classList.contains('show')) return false;
        const cur = getCurrentSong().id;
        return songsOf(it).some((s) => s.id === cur);
    }
    function syncPlayIcons() {
        document.querySelectorAll('[data-pl] .pl-play').forEach((b) => {
            const on = isPlayingKey(b.closest('[data-pl]').dataset.pl);
            b.classList.toggle('on', on);
            b.title = on ? 'Pause' : 'Play';
            b.querySelector('i').className = 'fa-solid ' + (on ? 'fa-pause' : 'fa-play');
        });
    }
    function playKey(key) {
        const it = getItem(key);
        const list = songsOf(it);
        if (!list.length) { showToast('This playlist is empty'); return; }
        const sameList = playingKey === key && playerBar.classList.contains('show') &&
            list.some((s) => s.id === getCurrentSong().id);
        if (sameList) play.click();
        else {
            playingKey = key;
            playSongFromList(list[0].id, list);
            if (key.startsWith('loc:')) {                 // urutan "baru diputar" di Home
                try { touchPlaylistPlayed(key.slice(4)); renderPlaylistList(); } catch (e) {}
            }
        }
        setTimeout(syncPlayIcons, 50);
    }
    ['play', 'pause', 'playing'].forEach((ev) => audio.addEventListener(ev, syncPlayIcons));

    // =====================================================
    // Aksi: library, playlist saya, queue, share
    // =====================================================
    function saveToLibrary(key) {
        const it = getItem(key);
        if (!it) return;
        if (inLibrary(key, it)) { showToast('Already in Your Library'); return; }
        const created = createPlaylist(it.name);
        const list = getPlaylists();
        const p = list.find((x) => x.id === created.id);
        if (!p) return;
        const now = Date.now();
        p.songIds = songsOf(it).map((s) => s.id);
        p.addedDates = {};
        p.songIds.forEach((id) => { p.addedDates[id] = now; });
        if (it.description) p.description = it.description;
        const cover = it.cover || it.coverImage;
        if (cover) p.coverImage = cover;
        p.savedFrom = key;
        savePlaylists(list);
        renderPlaylistList();
        syncHearts();
        showToast('Added to Your Library');
    }

    function removeFromLibrary(key) {
        savePlaylists(getPlaylists().filter((p) => p.savedFrom !== key));
        renderPlaylistList();
        syncHearts();
        showToast('Removed from Your Library');
    }

    function toggleLibrary(key) {
        const it = getItem(key);
        if (!it || isOwn(key, it)) return;
        if (inLibrary(key, it)) removeFromLibrary(key); else saveToLibrary(key);
    }

    function syncHearts() {
        document.querySelectorAll('[data-pl] .pl-heart').forEach((h) => {
            const key = h.closest('[data-pl]').dataset.pl;
            const saved = inLibrary(key, getItem(key));
            h.classList.toggle('liked', saved);
            h.title = saved ? 'Remove from Your Library' : 'Save to Your Library';
            h.querySelector('i').className = (saved ? 'fa-solid' : 'fa-regular') + ' fa-heart';
        });
    }
    const _renderPL = renderPlaylistList;
    renderPlaylistList = function () { _renderPL(); syncHearts(); };

    function addToQueue(key) {
        const list = songsOf(getItem(key));
        if (!list.length) { showToast('This playlist is empty'); return; }
        list.forEach((s) => queue.push(s));
        preloadedPath = null;
        renderQueuePanel();
        renderMobileSheet();
        showToast('Added to Queue', isMobileView() ? 'Open' : null, () => openMobileSheet('queue'));
    }

    function toB64Url(str) {
        const bytes = new TextEncoder().encode(str);
        let bin = '';
        bytes.forEach((b) => { bin += String.fromCharCode(b); });
        return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    async function shareLink(key) {
        const it = getItem(key);
        if (!it) return;
        if (!(it.songIds || []).length) { showToast('Add some songs first, then share'); return; }
        const url = location.origin + location.pathname + '#share=' +
            toB64Url(JSON.stringify({ v: 1, n: it.name, d: it.description || '', s: it.songIds }));
        let ok = false;
        try { await navigator.clipboard.writeText(url); ok = true; } catch (e) {}
        if (ok) showToast('Link copied'); else window.prompt('Copy this link:', url);
    }

    // ----- modal "Add to your playlist" -----
    const pick = document.createElement('div');
    pick.className = 'modal-overlay';
    pick.id = 'plxPick';
    pick.innerHTML = `
        <div class="modal-box">
            <h3>Add to your playlist</h3>
            <div id="plxPickList" class="add-to-playlist-list"></div>
            <button type="button" class="modal-secondary-btn" id="plxPickCancel" style="margin-top:1rem;">Cancel</button>
        </div>`;
    document.body.appendChild(pick);
    let pickKey = null;

    function openPick(key) {
        pickKey = key;
        ensureLikedPlaylist();
        const srcId = key.startsWith('loc:') ? key.slice(4) : null;
        const lists = getPlaylists().filter((p) => p.id !== srcId);
        pick.querySelector('#plxPickList').innerHTML = lists.map((p) => `
            <div class="add-to-playlist-row" data-pid="${esc(p.id)}" style="cursor:pointer;">
                <div class="add-to-playlist-left">
                    <div class="add-to-playlist-icon${p.id === LIKED_PLAYLIST_ID ? ' liked' : ''}"><i class="fa-solid ${p.id === LIKED_PLAYLIST_ID ? 'fa-heart' : 'fa-music'}"></i></div>
                    <span class="add-to-playlist-name">${esc(p.name)}</span>
                </div>
            </div>`).join('') || '<div class="history-empty">No playlists yet.</div>';
        pick.classList.add('show');
    }
    const closePick = () => { pick.classList.remove('show'); pickKey = null; };
    pick.querySelector('#plxPickCancel').addEventListener('click', closePick);
    pick.addEventListener('click', (e) => { if (e.target === pick) closePick(); });
    pick.querySelector('#plxPickList').addEventListener('click', (e) => {
        const row = e.target.closest('.add-to-playlist-row');
        if (!row || !pickKey) return;
        const target = getPlaylists().find((p) => p.id === row.dataset.pid);
        if (!target) return;
        let n = 0;
        songsOf(getItem(pickKey)).forEach((s) => {
            if (!target.songIds.includes(s.id)) { addSongToPlaylist(target.id, s.id); n++; }
        });
        renderPlaylistList();
        closePick();
        showToast(n ? `Added ${n} song${n !== 1 ? 's' : ''} to ${target.name}` : 'Songs already in that playlist');
    });

    // ----- menu (titik 3 / klik kanan) -----
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.id = 'plxMenu';
    menu.innerHTML = `
        <div class="context-menu-item" data-m="lib"><i class="fa-regular fa-square-plus"></i> <span>Add to your library</span></div>
        <div class="context-menu-item" data-m="pl"><i class="fa-solid fa-plus"></i> Add to your playlist</div>
        <div class="context-menu-item" data-m="queue"><i class="fa-solid fa-layer-group"></i> Add to queue</div>
        <div class="context-menu-item" data-m="share"><i class="fa-solid fa-link"></i> Share link</div>`;
    document.body.appendChild(menu);
    let menuKey = null;

    function openMenu(x, y, key) {
        const it = getItem(key);
        if (!it) return;
        menuKey = key;
        const libItem = menu.querySelector('[data-m="lib"]');
        libItem.style.display = isOwn(key, it) ? 'none' : 'flex';
        libItem.querySelector('span').textContent = inLibrary(key, it) ? 'Remove from your library' : 'Add to your library';
        menu.classList.add('show');
        const w = menu.offsetWidth || 230, h = menu.offsetHeight || 180;
        menu.style.left = Math.max(8, Math.min(x, window.innerWidth - w - 8)) + 'px';
        menu.style.top = Math.max(8, Math.min(y, window.innerHeight - h - 8)) + 'px';
    }
    const closeMenu = () => { menu.classList.remove('show'); menuKey = null; };

    menu.addEventListener('click', (e) => {
        const it = e.target.closest('[data-m]');
        if (!it || !menuKey) return;
        const key = menuKey;
        closeMenu();
        switch (it.dataset.m) {
            case 'lib': toggleLibrary(key); break;
            case 'pl': openPick(key); break;
            case 'queue': addToQueue(key); break;
            case 'share': shareLink(key); break;
        }
    });
    window.addEventListener('scroll', closeMenu, true);
    window.addEventListener('resize', closeMenu);

    // =====================================================
    // Klik (capture, supaya mengalahkan handler kartu lama)
    // =====================================================
    function openItem(key) {
        const it = getItem(key);
        if (!it) return;
        if (key.startsWith('loc:')) openPlaylistDetailView(it, false);
        else if (window.Social) Social.openPublicPlaylist(it);
    }

    document.addEventListener('click', (e) => {
        const t = e.target;
        if (menu.contains(t) || pick.contains(t)) return;
        if (menu.classList.contains('show')) closeMenu();

        // --- love pada LAGU -> "Tambah ke Playlist" ---
        const sr = t.closest('.sr-add');
        if (sr) {
            stop(e);
            const row = sr.closest('.sr-row');
            if (row) openAddToPlaylistModal(parseInt(row.dataset.id));
            return;
        }
        if (t.closest('#nowBarLikeBtn, #miniPopupLikeBtn')) {
            stop(e);
            openAddToPlaylistModal(getCurrentSong().id);
            return;
        }

        // --- playlist ---
        const play_ = t.closest('.pl-play');
        if (play_) { stop(e); playKey(play_.closest('[data-pl]').dataset.pl); return; }

        const more = t.closest('.pl-more');
        if (more) {
            stop(e);
            const r = more.getBoundingClientRect();
            openMenu(r.left, r.bottom + 4, more.closest('[data-pl]').dataset.pl);
            return;
        }

        const heart = t.closest('.pl-heart');
        if (heart) { stop(e); toggleLibrary(heart.closest('[data-pl]').dataset.pl); return; }

        // baris playlist di dropdown pencarian: buka playlist
        const ddRow = t.closest('.search-dropdown [data-pl]');
        if (ddRow) {
            stop(e);
            document.querySelector('.search-dropdown')?.classList.remove('show');
            document.querySelector('.input-box')?.blur();
            openItem(ddRow.dataset.pl);
        }
    }, true);

    document.addEventListener('contextmenu', (e) => {
        const host = e.target.closest('[data-pl]');
        if (!host) return;
        stop(e);
        openMenu(e.clientX, e.clientY, host.dataset.pl);
    }, true);

    // refresh ikon love lagu setelah modal "Tambah ke Playlist" dipakai
    function refreshSongHearts() {
        try { updateNowBarLikeIcon(); } catch (e) {}
        try { updateMiniPlayerPopup(); } catch (e) {}
        try { window.SpotiSearch && SpotiSearch.refreshRows(); } catch (e) {}
    }
    document.getElementById('addToPlaylistList')?.addEventListener('click', (e) => {
        if (e.target.closest('.playlist-check-btn')) setTimeout(refreshSongHearts, 0);
    });
    document.getElementById('addToPlaylistCloseBtn')?.addEventListener('click', refreshSongHearts);

    // =====================================================
    // Playlist ikut muncul di dropdown search bar
    // =====================================================
    const dd = document.querySelector('.search-dropdown');
    const qInput = document.querySelector('.input-box');
    let ddTimer = null, ddTok = 0;

    function ddRowHTML(p) {
        const src = coverOfItem(p);
        const img = src ? `<img src="${esc(src)}" alt="" loading="lazy">` : '<i class="fa-solid fa-music"></i>';
        return `
            <div class="sv-item" data-kind="playlist" data-id="${esc(p.id)}">
                <div class="sv-item-img">${img}</div>
                <div class="sv-item-info">
                    <div class="sv-item-title">${esc(p.name)}</div>
                    <div class="sv-item-sub">Playlist • By ${esc(p.ownerName || 'Unknown')}</div>
                </div>
            </div>`;
    }

    async function fillDropdown(q) {
        const tok = ++ddTok;
        if (!window.Social || !dd) return;
        let res = [];
        try { res = await Social.searchPlaylists(q); } catch (e) { return; }
        if (tok !== ddTok || !qInput || qInput.value.trim() !== q || dd.querySelector('.plx-dd')) return;
        res = res.slice(0, 2);
        if (!res.length) return;
        const wrap = document.createElement('div');
        wrap.className = 'plx-dd';
        wrap.innerHTML = '<div class="sd-divider"></div>' + res.map(ddRowHTML).join('');
        dd.appendChild(wrap);
        wrap.querySelectorAll('.sv-item').forEach((el) => decorate(el, 'pub:' + el.dataset.id, items['pub:' + el.dataset.id]));
    }

    if (dd && qInput) {
        new MutationObserver(() => {
            const q = qInput.value.trim();
            if (!q || dd.querySelector('.plx-dd')) return;
            clearTimeout(ddTimer);
            ddTimer = setTimeout(() => fillDropdown(q), 250);
        }).observe(dd, { childList: true });
    }

    window.PLX = { decorate, set: (k, it) => { items[k] = it; }, playKey, syncPlayIcons, syncHearts };
})();