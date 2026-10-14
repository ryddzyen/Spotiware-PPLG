// ===== Tampilan HP: Home (All + 8 playlist terakhir), halaman Search, halaman Friends (inbox) =====
(() => {
    const input = document.querySelector('.input-box');
    const bar = document.querySelector('.search-bar');
    const rightPart = document.querySelector('.main-right-part');
    const navHome = document.querySelector('.bottom-nav-item[data-target="home"]');
    const navSearch = document.querySelector('.bottom-nav-item[data-target="search"]');
    const navLibrary = document.querySelector('.bottom-nav-item[data-target="library"]');
    const navInbox = document.querySelector('.bottom-nav-item[data-target="inbox"]');
    if (!input || !bar || !rightPart || !navSearch || !navInbox) return;

    const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const S = () => window.SpotiSearch;

    // ---------- tombol back di navbar (hanya tampil saat mode search di HP) ----------
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'm-back';
    back.innerHTML = '<i class="fa-solid fa-arrow-left"></i>';
    bar.parentNode.insertBefore(back, bar);

    // ---------- Home: chip "All" + 8 playlist yang terakhir dibuka ----------
    const homeBlock = document.createElement('div');
    homeBlock.className = 'music-section mh-section';   // ikut aturan .music-section.hide
    homeBlock.innerHTML = `
        <div class="mh-chips"><button type="button" class="sv-chip active">All</button></div>
        <div class="mh-grid" id="mhGrid"></div>`;
    rightPart.prepend(homeBlock);
    const mhGrid = homeBlock.querySelector('#mhGrid');

    // (a) playlist Library + playlist orang lain yang pernah diputar, digabung dan diurutkan waktu terakhir
    function renderHomeGrid() {
        try { ensureLikedPlaylist(); } catch (e) {}
        const mine = getPlaylists();
        const copied = new Set(mine.map((p) => p.savedFrom).filter(Boolean));

        const lib = mine.filter((p) => p.id !== LIKED_PLAYLIST_ID).map((p) => ({ t: getPlaylistTimestamp(p, 'lastPlayedAt'), p }));
        const ext = (window.RecentPL ? RecentPL.list() : [])
            .filter((x) => !copied.has(x.id))            // sudah disimpan ke Library -> jangan dobel
            .map((x) => ({ t: x.t || 0, x }));

        const list = lib.concat(ext).sort((a, b) => b.t - a.t).slice(0, 8);

        mhGrid.innerHTML = list.map((e) => {
            if (e.x) {
                const src = (window.Social && Social.coverOf) ? Social.coverOf(e.x) : null;
                const img = src ? `<img src="${esc(src)}" alt="">` : '<i class="fa-solid fa-music"></i>';
                return `
                    <div class="mh-tile" data-ext="${esc(e.x.id)}">
                        <div class="mh-cover">${img}</div>
                        <div class="mh-name">${esc(e.x.name)}</div>
                    </div>`;
            }
            const p = e.p;
            const liked = p.id === LIKED_PLAYLIST_ID;
            const src = getPlaylistCoverSrc(p);
            const img = src ? `<img src="${esc(src)}" alt="">`
                : liked ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-solid fa-music"></i>';
            return `
                <div class="mh-tile" data-pid="${esc(p.id)}">
                    <div class="mh-cover${liked ? ' liked' : ''}">${img}</div>
                    <div class="mh-name">${esc(liked ? 'Liked Songs' : p.name)}</div>
                </div>`;
        }).join('');
    }

    // (b) klik kotak: playlist orang lain dibuka lewat RecentPL, playlist Library seperti biasa
    mhGrid.addEventListener('click', (e) => {
        const tile = e.target.closest('.mh-tile');
        if (!tile) return;
        if (tile.dataset.ext) { if (window.RecentPL) RecentPL.open(tile.dataset.ext); return; }
        const p = getPlaylists().find((x) => x.id === tile.dataset.pid);
        if (p) openPlaylistDetailView(p, p.id === LIKED_PLAYLIST_ID);
    });

    // ---------- Halaman Search (kolom kosong): rekomendasi + recent diputar ----------
    const msPage = document.createElement('div');
    msPage.className = 'm-page';
    msPage.id = 'msPage';
    msPage.innerHTML = `
        <h2 class="ms-h">Recommended for you</h2>
        <div id="msRec"></div>
        <h2 class="ms-h">Recent</h2>
        <div id="msRecent"></div>`;
    rightPart.prepend(msPage);

    let msRecommended = [];
    let msFresh = true;

    function renderSearchPage() {
        const rowHTML = S() ? S().rowHTML : () => '';
        if (msFresh || !msRecommended.length) {
            msRecommended = shuffleSongs(visibleSongs).slice(0, 12);
            msFresh = false;
        }
        msPage.querySelector('#msRec').innerHTML = msRecommended.map((s) => rowHTML(s)).join('');

        const hist = playHistory.slice(0, 30);
        msPage.querySelector('#msRecent').innerHTML = hist.length
            ? hist.map((s) => rowHTML(s)).join('')
            : '<div class="sd-empty">Songs you play will show up here.</div>';
    }
    if (S()) S().bindRows(msPage);

    // ---------- Halaman Friends (inbox) ----------
    const miPage = document.createElement('div');
    miPage.className = 'm-page';
    miPage.id = 'miPage';
    miPage.innerHTML = `<h1 class="mi-title">Friends</h1><div class="inbox-list" id="miList"></div>`;
    rightPart.prepend(miPage);
    const miList = miPage.querySelector('#miList');

    function renderInbox() {
        if (window.Chat && Chat.renderMessages) Chat.renderMessages(miPage);
        else if (window.Social && Social.renderInbox) Social.renderInbox(miList, true);
    }

    // ---------- helper tampil / sembunyi ----------
    function resetSides() {
        if (typeof mainLeftPart !== 'undefined' && mainLeftPart) mainLeftPart.classList.remove('mobile-show');
        rightPart.classList.remove('mobile-hide');
    }

    function hideSections() {
        document.querySelectorAll('.music-section').forEach((s) => s.classList.add('hide'));
    }

    function showSearchPage() {
        closePlaylistDetailView();
        closeShowAllView();
        hideSections();
        resetSides();
        renderSearchPage();
        msPage.classList.add('show');
        window.scrollTo({ top: 0 });
        rightPart.scrollTo({ top: 0 });
    }

    function showInbox() {
        closePlaylistDetailView();
        closeShowAllView();
        hideSections();
        resetSides();
        miPage.classList.add('show');
        renderInbox();
        window.scrollTo({ top: 0 });
        rightPart.scrollTo({ top: 0 });
    }

    // keluar dari mode search (bar pencarian disembunyikan lagi, teks dikosongkan)
    function leaveSearchMode() {
        document.body.classList.remove('m-search');
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // ---------- bottom nav ----------
    navSearch.addEventListener('click', () => {
        document.body.classList.add('m-search');
        msFresh = true;
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));   // -> event 'search-cleared'
        if (!msPage.classList.contains('show')) showSearchPage();
    });

    navHome?.addEventListener('click', leaveSearchMode);

    navLibrary?.addEventListener('click', () => {
        leaveSearchMode();
        msPage.classList.remove('show');
        miPage.classList.remove('show');
    });

    navInbox.addEventListener('click', () => {
        leaveSearchMode();
        showInbox();
    });

    back.addEventListener('click', () => {
        if (input.value.trim()) {
            input.value = '';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.blur();
        } else {
            navHome?.click();
        }
    });

    // kolom pencarian dikosongkan (mode search aktif) -> tampilkan halaman Search
    window.addEventListener('spotiware:search-cleared', () => {
        if (isMobileView() && document.body.classList.contains('m-search')) showSearchPage();
    });

    // titik merah di menu Friends kalau ada permintaan masuk
    window.addEventListener('spotiware:friends', () => {
        const n = (window.Social && Social.pendingCount) ? Social.pendingCount() : 0;
        navInbox.classList.toggle('has-notif', n > 0);
        if (miPage.classList.contains('show')) renderInbox();
    });

    // recent diputar ikut ter-update
    window.addEventListener('spotiware:history', () => {
        if (msPage.classList.contains('show')) renderSearchPage();
    });

    // ---------- tutup halaman ini saat pindah view lain ----------
    const _closePD = closePlaylistDetailView;
    closePlaylistDetailView = function () {
        msPage.classList.remove('show');
        miPage.classList.remove('show');
        _closePD();
        renderHomeGrid();   // urutan playlist terakhir dibuka ikut ter-update
    };

    const _renderPL = renderPlaylistList;
    renderPlaylistList = function () {
        _renderPL();
        renderHomeGrid();
    };

    function updateInboxDot() {
        const req = (window.Social && Social.pendingCount) ? Social.pendingCount() : 0;
        const unread = (window.Chat && Chat.unreadCount) ? Chat.unreadCount() : 0;
        navInbox.classList.toggle('has-notif', req + unread > 0);
    }
    window.addEventListener('spotiware:friends', () => {
        updateInboxDot();
        if (miPage.classList.contains('show')) renderInbox();
    });
    window.addEventListener('spotiware:chats', updateInboxDot);

    // (c) kotak beranda ikut diperbarui saat riwayat playlist berubah / akun berganti
    window.addEventListener('spotiware:recent-playlists', renderHomeGrid);
    firebase.auth().onAuthStateChanged(renderHomeGrid);

    renderHomeGrid();
})();