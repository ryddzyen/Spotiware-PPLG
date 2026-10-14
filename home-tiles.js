// ===== home-tiles.js : tombol play + klik kanan di kotak riwayat playlist beranda =====
//  - playlist orang lain (atau salinannya di Library): Add/Remove library, Add to playlist, Add to queue, Add/Remove profile, Share link
//  - playlist sendiri: Add to queue, Edit details, Delete, Make public/private, Share link
(() => {
    const grid = document.getElementById('mhGrid');
    if (!grid) return;

    const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const me = () => firebase.auth().currentUser;
    const songById = (id) => songs.find((s) => s.id === id);

    // ---------- Jenis kotak: playlist sendiri / milik orang lain ----------
    function kindOf(tile) {
        if (tile.dataset.pid) {
            const p = getPlaylists().find((x) => x.id === tile.dataset.pid);
            if (!p) return null;
            if (p.savedFrom) {      // salinan playlist orang lain -> tetap dianggap milik orang lain
                return { type: 'other', item: {
                    id: p.savedFrom, name: p.name, description: p.description || '',
                    cover: p.coverImage || null, songIds: p.songIds,
                    ownerUid: p.savedFromOwnerUid || '', ownerName: p.savedFromOwner || ''
                } };
            }
            return { type: 'own', p };
        }
        if (tile.dataset.ext && window.RecentPL) {
            const x = RecentPL.list().find((i) => i.id === tile.dataset.ext);
            return x ? { type: 'other', item: x } : null;
        }
        return null;
    }

    function songsOf(k) {
        if (k.type === 'own') return getSongsInPlaylist(k.p);
        return (k.item.songIds || []).map(songById).filter(Boolean);
    }

    const savedCopy = (srcId) => getPlaylists().find((p) => p.savedFrom === srcId) || null;

    function ensureCopy(item) {
        const existing = savedCopy(item.id);
        if (existing) return existing;
        const list = (item.songIds || []).map(songById).filter(Boolean);
        const created = createPlaylist(item.name || 'Playlist');
        const all = getPlaylists();
        const p = all.find((x) => x.id === created.id);
        p.songIds = list.map((s) => s.id);
        p.addedDates = {};
        list.forEach((s) => { p.addedDates[s.id] = Date.now(); });
        if (item.description) p.description = item.description;
        if (item.cover) p.coverImage = item.cover;
        p.savedFrom = item.id;                       // penanda: playlist orang lain (hanya lihat & putar)
        p.savedFromOwner = item.ownerName || '';
        p.savedFromOwnerUid = item.ownerUid || '';
        savePlaylists(all);
        return p;
    }

    // ---------- Putar / jeda dari kotak ----------
    const sameSet = (a, b) => a.length === b.length && b.every((s) => a.some((x) => x.id === s.id));
    const isCtx = (list) => playerBar.classList.contains('show') && sameSet(currentContextList, list);

    const tileKey = (tile) => tile.dataset.pid ? 'loc:' + tile.dataset.pid : 'ext:' + tile.dataset.ext;

    function togglePlay(tile) {
        const k = kindOf(tile);
        if (!k) return;
        const list = songsOf(k);
        if (!list.length) { showToast('This playlist is empty'); return; }
        const key = tileKey(tile);
        if (window.PlayKey && PlayKey.is(key)) {
            play.click();
        } else {
            const first = songOnShuffle ? list[Math.floor(Math.random() * list.length)] : list[0];
            window.__plKey = key;
            playSongFromList(first.id, list);
        }
        setTimeout(refreshPlay, 80);
    }

    function refreshPlay() {
        grid.querySelectorAll('.mh-tile').forEach((tile) => {
            const btn = tile.querySelector('.mh-play');
            if (!btn) return;
            const on = !audio.paused && !!window.PlayKey && PlayKey.is(tileKey(tile));
            btn.classList.toggle('on', on);
            btn.title = on ? 'Pause' : 'Play';
            btn.querySelector('i').className = 'fa-solid ' + (on ? 'fa-pause' : 'fa-play');
        });
    }

    function enhance() {
        grid.querySelectorAll('.mh-tile').forEach((tile) => {
            if (tile.querySelector('.mh-play')) return;
            tile.insertAdjacentHTML('beforeend',
                '<button type="button" class="mh-play" title="Play"><i class="fa-solid fa-play"></i></button>');
        });
        refreshPlay();
    }
    new MutationObserver(enhance).observe(grid, { childList: true });   // hanya anak langsung, jadi tidak berulang
    audio.addEventListener('play', refreshPlay);
    audio.addEventListener('pause', refreshPlay);
    audio.addEventListener('playing', refreshPlay);
    window.addEventListener('spotiware:activepl', refreshPlay);
    enhance();

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.mh-play');
        if (!btn || !grid.contains(btn)) return;
        e.stopPropagation();       // jangan ikut membuka halaman playlist
        e.preventDefault();
        togglePlay(btn.closest('.mh-tile'));
    }, true);

    // ---------- Aksi umum ----------
    function queueAll(list) {
        if (!list.length) { showToast('This playlist is empty'); return; }
        list.forEach((s) => queue.push(s));
        preloadedPath = null;
        renderQueuePanel();
        renderMobileSheet();
        showToast(`Added ${list.length} song${list.length !== 1 ? 's' : ''} to Queue`,
            isMobileView() ? 'Open' : null, () => openMobileSheet('queue'));
    }

    function toB64Url(str) {
        const bytes = new TextEncoder().encode(str);
        let bin = '';
        bytes.forEach((b) => { bin += String.fromCharCode(b); });
        return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    async function shareLink(o) {
        if (!(o.songIds || []).length) { showToast('Add some songs first, then share'); return; }
        const url = location.origin + location.pathname + '#share=' + toB64Url(JSON.stringify({
            v: 1, n: o.name, d: o.description || '', s: o.songIds, o: o.ownerUid || '', on: o.ownerName || ''
        }));
        try { await navigator.clipboard.writeText(url); showToast('Link copied'); }
        catch (_) { window.prompt('Copy this link:', url); }
    }

    // ---------- Menu klik kanan ----------
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.id = 'htMenu';
    document.body.appendChild(menu);
    let cur = null;

    const row = (act, icon, label, danger) =>
        `<div class="context-menu-item" data-act="${act}"${danger ? ' style="color:#ff7b87"' : ''}>` +
        `<i class="${icon}"${danger ? ' style="color:#ff7b87"' : ''}></i><span>${label}</span></div>`;

    function openMenu(x, y, tile) {
        const k = kindOf(tile);
        if (!k) return;
        cur = k;
        let html;
        if (k.type === 'own') {
            html =
                row('queue', 'fa-solid fa-layer-group', 'Add to queue') +
                row('edit', 'fa-solid fa-pen', 'Edit details') +
                row('delete', 'fa-regular fa-circle-xmark', 'Delete', true) +
                row('visibility', k.p.isPublic ? 'fa-solid fa-lock' : 'fa-solid fa-lock-open',
                    k.p.isPublic ? 'Make private' : 'Make public') +
                row('share', 'fa-solid fa-link', 'Share link');
        } else {
            const copy = savedCopy(k.item.id);
            html =
                row('library', (copy ? 'fa-solid' : 'fa-regular') + ' fa-heart',
                    copy ? 'Remove from your library' : 'Add to your library') +
                row('playlist', 'fa-solid fa-plus', 'Add to playlist') +
                row('queue', 'fa-solid fa-layer-group', 'Add to queue') +
                row('profile', 'fa-regular fa-user',
                    copy && copy.isPublic ? 'Remove from profile' : 'Add to profile') +
                row('share', 'fa-solid fa-link', 'Share link');
        }
        menu.innerHTML = html;
        menu.classList.add('show');
        menu.style.left = Math.max(8, Math.min(x, window.innerWidth - (menu.offsetWidth || 220) - 8)) + 'px';
        menu.style.top = Math.max(8, Math.min(y, window.innerHeight - (menu.offsetHeight || 200) - 8)) + 'px';
    }
    const closeMenu = () => { menu.classList.remove('show'); };

    document.addEventListener('contextmenu', (e) => {
        const tile = e.target.closest('.mh-tile');
        if (!tile || !grid.contains(tile)) return;
        e.preventDefault();
        e.stopPropagation();
        openMenu(e.clientX, e.clientY, tile);
    }, true);

    document.addEventListener('mousedown', (e) => { if (!menu.contains(e.target)) closeMenu(); }, true);
    window.addEventListener('scroll', closeMenu, true);
    window.addEventListener('resize', closeMenu);

    menu.addEventListener('click', (e) => {
        const it = e.target.closest('[data-act]');
        if (!it || !cur) return;
        const k = cur;
        const act = it.dataset.act;
        closeMenu();

        if (act === 'queue') { queueAll(songsOf(k)); return; }

        if (k.type === 'own') {
            if (act === 'edit') { openPlaylistDetailView(k.p, false); openEditDetailsModal(); }
            if (act === 'delete') openDeletePlaylistModal(k.p.id, k.p.name);
            if (act === 'share') shareLink({
                name: k.p.name, description: k.p.description, songIds: k.p.songIds,
                ownerUid: me() ? me().uid : '', ownerName: me() ? (me().displayName || '') : ''
            });
            if (act === 'visibility') {
                if (!me()) { showToast('Log in to make playlists public'); return; }
                const all = getPlaylists();
                const p = all.find((x) => x.id === k.p.id);
                if (!p) return;
                p.isPublic = !p.isPublic;
                savePlaylists(all);
                showToast(p.isPublic ? 'Playlist is now public' : 'Playlist is now private');
                renderPlaylistList();
            }
            return;
        }

        // playlist orang lain
        const item = k.item;
        if (act === 'share') { shareLink(item); return; }
        if (act === 'playlist') {
            if (window.PlaylistPicker) PlaylistPicker.open((item.songIds || []).filter((id) => songById(id)), item.name);
            return;
        }
        if (!me()) { showToast('Log in first'); return; }
        if (act === 'library') {
            const c = savedCopy(item.id);
            if (c) { deletePlaylist(c.id); showToast('Removed from Your Library'); }
            else { ensureCopy(item); showToast('Added to Your Library'); }
            renderPlaylistList();
        }
        if (act === 'profile') {
            const c = ensureCopy(item);
            const all = getPlaylists();
            const p = all.find((x) => x.id === c.id);
            if (p) {
                p.isPublic = !p.isPublic;
                savePlaylists(all);
                showToast(p.isPublic ? 'Added to your profile' : 'Removed from your profile');
            }
            renderPlaylistList();
        }
    });

    // =====================================================
    // Jendela "Add to playlist" (dipakai juga oleh playlist-view.js)
    // =====================================================
    const picker = document.createElement('div');
    picker.className = 'modal-overlay';
    picker.id = 'ppModal';
    picker.innerHTML = `
        <div class="modal-box">
            <h3>Tambah ke Playlist</h3>
            <p id="ppSub" style="margin-bottom:0.8rem;"></p>
            <div id="ppList" class="add-to-playlist-list"></div>
            <div class="new-playlist-inline">
                <input type="text" id="ppNew" placeholder="Nama playlist baru" maxlength="60">
                <button type="button" id="ppCreate">Buat</button>
            </div>
            <button type="button" class="modal-close-btn" id="ppDone">Selesai</button>
        </div>`;
    document.body.appendChild(picker);

    const ppList = picker.querySelector('#ppList');
    const ppNew = picker.querySelector('#ppNew');
    let ppIds = [];

    function renderPicker() {
        try { ensureLikedPlaylist(); } catch (e) {}
        ppList.innerHTML = getPlaylists().filter((p) => !p.savedFrom).map((p) => {
            const done = ppIds.length > 0 && ppIds.every((id) => p.songIds.includes(id));
            const icon = p.id === LIKED_PLAYLIST_ID
                ? '<div class="add-to-playlist-icon liked"><i class="fa-solid fa-heart"></i></div>'
                : '<div class="add-to-playlist-icon"><i class="fa-solid fa-music"></i></div>';
            return `
                <div class="add-to-playlist-row pp-row" data-pid="${esc(p.id)}" style="cursor:pointer;">
                    <div class="add-to-playlist-left">${icon}<span class="add-to-playlist-name">${esc(p.name)}</span></div>
                    <button type="button" class="playlist-check-btn ${done ? 'checked' : ''}"><i class="fa-solid fa-check"></i></button>
                </div>`;
        }).join('');
    }

    function addAll(pid) {
        let n = 0;
        ppIds.forEach((id) => {
            const p = getPlaylists().find((x) => x.id === pid);
            if (p && !p.songIds.includes(id)) { addSongToPlaylist(pid, id); n++; }
        });
        return n;
    }

    ppList.addEventListener('click', (e) => {
        const r = e.target.closest('.pp-row');
        if (!r) return;
        const p = getPlaylists().find((x) => x.id === r.dataset.pid);
        if (!p) return;
        const n = addAll(p.id);
        showToast(n ? `Added ${n} song${n !== 1 ? 's' : ''} to ${p.name}` : `Already in ${p.name}`);
        renderPicker();
        renderPlaylistList();
    });

    picker.querySelector('#ppCreate').addEventListener('click', () => {
        const name = ppNew.value.trim();
        if (!name) return;
        const created = createPlaylist(name);
        const n = addAll(created.id);
        ppNew.value = '';
        showToast(`Added ${n} song${n !== 1 ? 's' : ''} to ${name}`);
        renderPicker();
        renderPlaylistList();
    });
    ppNew.addEventListener('keydown', (e) => { if (e.key === 'Enter') picker.querySelector('#ppCreate').click(); });
    picker.querySelector('#ppDone').addEventListener('click', () => picker.classList.remove('show'));
    picker.addEventListener('click', (e) => { if (e.target === picker) picker.classList.remove('show'); });

    window.PlaylistPicker = {
        open(ids, title) {
            ppIds = (ids || []).slice();
            if (!ppIds.length) { showToast('This playlist is empty'); return; }
            picker.querySelector('#ppSub').textContent =
                `${ppIds.length} song${ppIds.length !== 1 ? 's' : ''}` + (title ? ` from "${title}"` : '');
            ppNew.value = '';
            renderPicker();
            picker.classList.add('show');
        }
    };
})();