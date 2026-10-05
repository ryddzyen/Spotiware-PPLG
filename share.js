// ===== Share Playlist via Link + menu "..." (tanpa akun, tanpa backend) =====
// Cara kerja: isi playlist (nama, deskripsi, daftar ID lagu) di-encode ke bagian
// "#share=..." di URL. Siapa pun yang membuka link itu bisa melihat & memutar
// playlist-nya, dan bisa menyimpannya ke Library sendiri.
// Menu "..." di halaman playlist: Add to queue, Edit details, Delete, Copy link to playlist.
// Pasang SETELAH script.js:  <script src="share.js" defer></script>

(() => {
    const SHARE_PREFIX = '#share=';
    const SHARED_ID = 'shared_tmp';
    const MAX_SONGS = 300;

    let currentShared = null; // data playlist yang sedang dibuka lewat link (atau null)

    // ---------- Encode / decode ----------
    function toB64Url(str) {
        const bytes = new TextEncoder().encode(str);
        let bin = '';
        bytes.forEach(b => (bin += String.fromCharCode(b)));
        return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    function fromB64Url(s) {
        s = s.replace(/-/g, '+').replace(/_/g, '/');
        while (s.length % 4) s += '=';
        const bin = atob(s);
        const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
        return new TextDecoder().decode(bytes);
    }

    // Buang karakter HTML, karena nama playlist nanti dirender lewat innerHTML di script.js
    const clean = (str, max) => String(str || '').replace(/[<>"&]/g, '').trim().slice(0, max);

    function buildShareUrl(playlist) {
        const payload = {
            v: 1,
            n: playlist.name,
            d: playlist.description || '',
            s: playlist.songIds
        };
        return location.origin + location.pathname + SHARE_PREFIX + toB64Url(JSON.stringify(payload));
    }

    function parseShareHash() {
        if (!location.hash.startsWith(SHARE_PREFIX)) return null;
        try {
            const data = JSON.parse(fromB64Url(location.hash.slice(SHARE_PREFIX.length)));
            const validIds = new Set(songs.map(s => s.id));
            const ids = (Array.isArray(data.s) ? data.s : [])
                .map(Number)
                .filter((id, i, arr) => validIds.has(id) && arr.indexOf(id) === i)
                .slice(0, MAX_SONGS);
            return {
                id: SHARED_ID,
                name: clean(data.n, 60) || 'Shared Playlist',
                description: clean(data.d, 300),
                songIds: ids,
                shared: true
            };
        } catch (e) {
            return null;
        }
    }

    async function copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            let ok = false;
            try { ok = document.execCommand('copy'); } catch (_) {}
            ta.remove();
            return ok;
        }
    }

    // Playlist yang sedang terbuka (lokal atau hasil link)
    function getActivePlaylist() {
        return currentShared || getPlaylists().find(p => p.id === pdCurrentPlaylistId) || null;
    }

    // ---------- Tombol di toolbar detail playlist ----------
    const style = document.createElement('style');
    style.textContent = `
        .pd-pill-btn.pd-primary{ background: var(--yellow); color: black; border-color: transparent; }
        .pd-pill-btn.pd-primary:hover{ background: var(--gold); color: black; }
        .pd-more-btn{
            background: none;
            border: none;
            color: var(--gray-mid);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0.2rem 0.4rem;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: 0.2s;
        }
        .pd-more-btn:hover{ color: white; transform: scale(1.08); }
        .pd-more-btn.active{ color: var(--yellow); }
        #pdMoreMenu .context-menu-item.danger{ color: #ff7b87; }
        #pdMoreMenu .context-menu-item.danger i{ color: #ff7b87; }
        #pdMoreMenu .context-menu-item.hidden{ display: none; }
    `;
    document.head.appendChild(style);

    const addBtn = document.getElementById('pdAddSongsBtn');
    const spacer = document.querySelector('.playlist-toolbar-spacer');

    // Tombol "..." (di samping Add)
    const moreBtn = document.createElement('button');
    moreBtn.className = 'pd-more-btn';
    moreBtn.id = 'pdMoreBtn';
    moreBtn.title = 'More options';
    moreBtn.innerHTML = '<i class="fa-solid fa-ellipsis"></i>';
    const editBtn = document.getElementById('pdEditDetailsBtn');
if (editBtn) editBtn.after(moreBtn);

    // Tombol "Save to Library" (hanya muncul saat membuka playlist dari link)
    const saveSharedBtn = document.createElement('button');
    saveSharedBtn.className = 'pd-pill-btn pd-primary';
    saveSharedBtn.id = 'pdSaveSharedBtn';
    saveSharedBtn.style.display = 'none';
    saveSharedBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i> Save to Library';
    if (spacer) spacer.before(saveSharedBtn);

    // Menu dropdown (pakai gaya .context-menu bawaan)
    const moreMenu = document.createElement('div');
    moreMenu.className = 'context-menu';
    moreMenu.id = 'pdMoreMenu';
    moreMenu.innerHTML = `
        <div class="context-menu-item" id="pdMenuQueue"><i class="fa-solid fa-layer-group"></i> Add to queue</div>
        <div class="context-menu-item" id="pdMenuEdit"><i class="fa-solid fa-pen"></i> Edit details</div>
        <div class="context-menu-item danger" id="pdMenuDelete"><i class="fa-regular fa-circle-xmark"></i> Delete</div>
        <div class="context-menu-item" id="pdMenuCopyLink"><i class="fa-solid fa-link"></i> Copy link to playlist</div>
    `;
    document.body.appendChild(moreMenu);

    const menuEdit = moreMenu.querySelector('#pdMenuEdit');
    const menuDelete = moreMenu.querySelector('#pdMenuDelete');

    function closeMoreMenu() {
        moreMenu.classList.remove('show');
        moreBtn.classList.remove('active');
    }

    function openMoreMenu() {
        const playlist = getActivePlaylist();
        if (!playlist) return;

        // Edit & Delete tidak berlaku untuk Liked Songs dan playlist dari link
        const locked = !!playlist.shared || playlist.id === LIKED_PLAYLIST_ID;
        menuDelete.classList.toggle('hidden', locked);
        // Liked Songs masih boleh edit deskripsi/cover, tapi bukan playlist dari link
        menuEdit.classList.toggle('hidden', !!playlist.shared);

        moreMenu.classList.add('show');
        moreBtn.classList.add('active');

        const rect = moreBtn.getBoundingClientRect();
        const w = moreMenu.offsetWidth || 220;
        const h = moreMenu.offsetHeight || 160;
        const x = Math.min(rect.left, window.innerWidth - w - 8);
        let y = rect.bottom + 6;
        if (y + h > window.innerHeight - 8) y = Math.max(8, rect.top - h - 6);
        moreMenu.style.left = `${Math.max(8, x)}px`;
        moreMenu.style.top = `${y}px`;
    }

    moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (moreMenu.classList.contains('show')) closeMoreMenu();
        else openMoreMenu();
    });

    document.addEventListener('click', (e) => {
        if (moreMenu.classList.contains('show') && !moreMenu.contains(e.target) && e.target !== moreBtn && !moreBtn.contains(e.target)) {
            closeMoreMenu();
        }
    });
    window.addEventListener('scroll', closeMoreMenu, true);
    window.addEventListener('resize', closeMoreMenu);

    // --- Add to queue: semua lagu di playlist masuk antrean ---
    moreMenu.querySelector('#pdMenuQueue').addEventListener('click', () => {
        const playlist = getActivePlaylist();
        closeMoreMenu();
        if (!playlist) return;
        const list = getSongsInPlaylist(playlist);
        if (list.length === 0) {
            showToast('This playlist is empty');
            return;
        }
        list.forEach(s => queue.push(s));
        renderQueuePanel();
        renderMobileSheet();
        showToast('Added to Queue', isMobileView() ? 'Open' : null, () => openMobileSheet('queue'));
    });

    // --- Edit details: buka modal edit bawaan ---
    menuEdit.addEventListener('click', () => {
        closeMoreMenu();
        openEditDetailsModal();
    });

    // --- Delete: pakai modal konfirmasi bawaan ---
    menuDelete.addEventListener('click', () => {
        const playlist = getActivePlaylist();
        closeMoreMenu();
        if (!playlist || playlist.shared || playlist.id === LIKED_PLAYLIST_ID) return;
        openDeletePlaylistModal(playlist.id, playlist.name);
    });

    // Setelah playlist benar-benar dihapus, tutup halaman detailnya
    // (listener ini jalan setelah listener bawaan script.js yang menghapus data)
    document.getElementById('deletePlaylistModalConfirm')?.addEventListener('click', () => {
        if (pdCurrentPlaylistId && !getPlaylists().some(p => p.id === pdCurrentPlaylistId)) {
            pdCurrentPlaylistId = null;
            closePlaylistDetailView();
        }
    });

    // --- Copy link to playlist ---
    moreMenu.querySelector('#pdMenuCopyLink').addEventListener('click', async () => {
        const playlist = getActivePlaylist();
        closeMoreMenu();
        if (!playlist) return;
        if (playlist.songIds.length === 0) {
            showToast('Add some songs first, then share');
            return;
        }
        const url = buildShareUrl(playlist);
        const ok = await copyText(url);
        if (ok) showToast('Link copied');
        else window.prompt('Copy this link:', url);
    });

    saveSharedBtn.addEventListener('click', () => {
        if (!currentShared) return;
        const created = createPlaylist(currentShared.name);
        currentShared.songIds.forEach(id => addSongToPlaylist(created.id, id));
        if (currentShared.description) updatePlaylistDescription(created.id, currentShared.description);

        currentShared = null;
        history.replaceState(null, '', location.pathname + location.search);
        renderPlaylistList();
        showToast('Saved to Your Library');

        const saved = getPlaylists().find(p => p.id === created.id);
        if (saved) openPlaylistDetailView(saved, false);
    });

    // ---------- Bungkus fungsi bawaan script.js ----------
    const originalOpenDetail = openPlaylistDetailView;
    openPlaylistDetailView = function (playlist, isLiked) {
        closeMoreMenu();
        originalOpenDetail(playlist, isLiked);

        const typeEl = document.querySelector('.playlist-detail-type');
        const isShared = !!playlist.shared;
        if (!isShared) currentShared = null;

        if (typeEl) typeEl.textContent = isShared ? 'Shared playlist' : 'Playlist';
        saveSharedBtn.style.display = isShared ? 'flex' : 'none';

        // Liked Songs: tidak ada menu "..." sama sekali
        const isLikedPlaylist = playlist.id === LIKED_PLAYLIST_ID;
        moreBtn.style.display = isLikedPlaylist ? 'none' : 'flex';

        if (isShared) {
            // Mode baca-saja: sembunyikan edit/tambah lagu, cover tidak bisa diganti
            if (pdAddSongsBtn) pdAddSongsBtn.style.display = 'none';
            if (pdEditDetailsBtn) pdEditDetailsBtn.style.display = 'none';
            const cover = document.getElementById('playlistDetailCover');
            cover?.classList.add('no-edit');
            cover?.querySelector('.cover-upload-overlay')?.remove();
            pdCurrentPlaylistId = null; // supaya klik cover / edit tidak menyentuh data lokal
        }
    };

    const originalCloseDetail = closePlaylistDetailView;
    closePlaylistDetailView = function () {
        closeMoreMenu();
        originalCloseDetail();
        if (currentShared) {
            currentShared = null;
            if (location.hash.startsWith(SHARE_PREFIX)) {
                history.replaceState(null, '', location.pathname + location.search);
            }
        }
        saveSharedBtn.style.display = 'none';
    };

    // ---------- Buka link yang diterima ----------
    function openFromHash() {
        const shared = parseShareHash();
        if (!shared) {
            if (location.hash.startsWith(SHARE_PREFIX)) showToast('This link is invalid');
            return;
        }
        if (shared.songIds.length === 0) {
            showToast('This shared playlist is empty');
            return;
        }
        currentShared = shared;
        openPlaylistDetailView(shared, false);
    }

    window.addEventListener('hashchange', openFromHash);
    openFromHash();
})();