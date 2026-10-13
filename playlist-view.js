// ===== playlist-view.js : tampilan playlist milik ORANG LAIN =====
// Tampil hanya saat membuka playlist publik orang lain. Playlist sendiri tidak diubah.
(() => {
    const db = firebase.firestore();
    const $ = (id) => document.getElementById(id);
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    const shuffleBtn = $('playlistShuffleBtn');
    const detailView = $('playlistDetailView');
    if (!shuffleBtn || !detailView) return;

    let item = null;     // data playlist orang yang sedang dibuka
    let curId = null;
    let raf = null;

    // ---------- Tombol baru di toolbar: love + titik 3 ----------
    const heart = document.createElement('i');
    heart.id = 'pvHeart';
    heart.className = 'fa-regular fa-heart playlist-toolbar-icon pv-only';
    heart.title = 'Save to your library';

    const more = document.createElement('i');
    more.id = 'pvMore';
    more.className = 'fa-solid fa-ellipsis playlist-toolbar-icon pv-only';
    more.title = 'More options';
    shuffleBtn.after(heart, more);

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.id = 'pvMenu';
    menu.innerHTML = `
        <div class="context-menu-item" data-act="library"><i class="fa-regular fa-heart"></i><span>Add to your library</span></div>
        <div class="context-menu-item" data-act="queue"><i class="fa-solid fa-layer-group"></i><span>Add to queue</span></div>
        <div class="context-menu-item" data-act="profile"><i class="fa-regular fa-user"></i><span>Add to your profile</span></div>
        <div class="context-menu-item" data-act="share"><i class="fa-solid fa-link"></i><span>Share link</span></div>`;
    document.body.appendChild(menu);

    // ---------- Data ----------
    const me = () => firebase.auth().currentUser;
    const isMine = () => !!(item && me() && item.ownerUid === me().uid);
    const songsOf = () => ((item && item.songIds) || []).map((id) => songs.find((s) => s.id === id)).filter(Boolean);
    const savedCopy = () => (item ? getPlaylists().find((p) => p.savedFrom === item.id) || null : null);

    async function load(docId) {
        const s = await db.collection('publicPlaylists').doc(docId).get();
        return s.exists ? { id: docId, ...s.data() } : null;
    }

    // salinan playlist ini di Library sendiri (dibuat kalau belum ada)
    function ensureCopy() {
        const existing = savedCopy();
        if (existing) return existing;
        const list = songsOf();
        const created = createPlaylist(item.name || 'Playlist');
        const all = getPlaylists();
        const p = all.find((x) => x.id === created.id);
        p.songIds = list.map((s) => s.id);
        p.addedDates = {};
        list.forEach((s) => { p.addedDates[s.id] = Date.now(); });
        if (item.description) p.description = item.description;
        if (item.cover) p.coverImage = item.cover;
        p.savedFrom = item.id;
        p.savedFromOwner = item.ownerName || '';
        savePlaylists(all);
        return p;
    }

    // ---------- Aksi ----------
    function refresh() {
        const on = !!savedCopy();
        heart.className = (on ? 'fa-solid' : 'fa-regular') + ' fa-heart playlist-toolbar-icon pv-only' + (on ? ' active' : '');
        heart.title = on ? 'Remove from your library' : 'Save to your library';
    }

    function toggleLibrary() {
        if (!item || isMine()) return;
        if (!me()) { showToast('Log in first'); return; }
        const c = savedCopy();
        if (c) { deletePlaylist(c.id); showToast('Removed from Your Library'); }
        else { ensureCopy(); showToast('Added to Your Library'); }
        renderPlaylistList();
        refresh();
    }

    function addToProfile() {
        if (!item || isMine()) return;
        if (!me()) { showToast('Log in first'); return; }
        const c = ensureCopy();
        const all = getPlaylists();
        const p = all.find((x) => x.id === c.id);
        if (p && p.isPublic) { showToast('Already on your profile'); }
        else if (p) { p.isPublic = true; savePlaylists(all); showToast('Added to your profile'); }
        renderPlaylistList();
        refresh();
    }

    function addToQueue() {
        const list = songsOf();
        if (!list.length) { showToast('This playlist is empty'); return; }
        list.forEach((s) => queue.push(s));
        preloadedPath = null;
        renderQueuePanel();
        renderMobileSheet();
        showToast('Added to Queue', isMobileView() ? 'Open' : null, () => openMobileSheet('queue'));
    }

    // link yang bisa dibuka siapa saja (format sama dengan "Copy link to playlist" di share.js)
    function toB64Url(str) {
        const bytes = new TextEncoder().encode(str);
        let bin = '';
        bytes.forEach((b) => { bin += String.fromCharCode(b); });
        return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    async function shareLink() {
        if (!songsOf().length) { showToast('This playlist is empty'); return; }
        const url = location.origin + location.pathname + '#share=' +
            toB64Url(JSON.stringify({ v: 1, n: item.name, d: item.description || '', s: item.songIds || [] }));
        try {
            await navigator.clipboard.writeText(url);
            showToast('Link copied');
        } catch (_) {
            window.prompt('Copy this link:', url);
        }
    }

    // ---------- Menu titik 3 ----------
    more.addEventListener('click', (e) => {
        e.stopPropagation();
        if (menu.classList.contains('show')) { menu.classList.remove('show'); return; }
        const mine = isMine();
        const saved = !!savedCopy();
        const lib = menu.querySelector('[data-act="library"]');
        lib.style.display = mine ? 'none' : '';
        lib.querySelector('span').textContent = saved ? 'Remove from your library' : 'Add to your library';
        lib.querySelector('i').className = (saved ? 'fa-solid' : 'fa-regular') + ' fa-heart';
        menu.querySelector('[data-act="profile"]').style.display = mine ? 'none' : '';

        menu.classList.add('show');
        const r = more.getBoundingClientRect();
        menu.style.left = Math.max(8, Math.min(r.left, window.innerWidth - (menu.offsetWidth || 220) - 8)) + 'px';
        menu.style.top = (r.bottom + 6) + 'px';
    });

    menu.addEventListener('click', (e) => {
        const it = e.target.closest('[data-act]');
        if (!it) return;
        menu.classList.remove('show');
        const a = it.dataset.act;
        if (a === 'library') toggleLibrary();
        if (a === 'queue') addToQueue();
        if (a === 'profile') addToProfile();
        if (a === 'share') shareLink();
    });

    heart.addEventListener('click', toggleLibrary);

    document.addEventListener('mousedown', (e) => {
        if (!menu.contains(e.target) && e.target !== more) menu.classList.remove('show');
    }, true);
    window.addEventListener('scroll', () => menu.classList.remove('show'), true);

    // nama pembuat playlist -> buka profilnya
    document.addEventListener('click', (e) => {
        const a = e.target.closest('.pv-owner');
        if (!a) return;
        e.preventDefault();
        if (window.Social) Social.openProfile(a.dataset.uid);
    });

    // ---------- Deteksi: sedang membuka playlist orang lain? ----------
    function decorate() {
        const type = document.querySelector('.playlist-detail-type');
        if (type) type.textContent = 'Public Playlist';
        const desc = $('playlistDetailDescription');
        if (!desc || desc.querySelector('.pv-owner')) return;
        desc.innerHTML = (item.description ? esc(item.description) + ' • ' : '') +
            'By <a href="#" class="pv-owner" data-uid="' + esc(item.ownerUid) + '">' + esc(item.ownerName || 'Unknown') + '</a>';
    }

    async function sync() {
        const pub = detailView.classList.contains('show') &&
            document.body.classList.contains('pd-readonly') &&
            typeof pdCurrentPlaylistId === 'string' && pdCurrentPlaylistId.startsWith('pub_');
        document.body.classList.toggle('pv-public', pub);

        if (!pub) { curId = null; item = null; menu.classList.remove('show'); document.body.classList.remove('pv-mine'); return; }

        const docId = pdCurrentPlaylistId.slice(4);
        if (docId !== curId) {
            curId = docId;
            item = null;
            try { item = await load(docId); } catch (_) {}
            if (curId !== docId) return;      // pengguna sudah pindah halaman
        }
        if (!item) return;
        document.body.classList.toggle('pv-mine', isMine());
        decorate();
        refresh();
    }

    const kick = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => { raf = null; sync(); });
    };
    new MutationObserver(kick).observe(detailView, { attributes: true, attributeFilter: ['class'] });
    new MutationObserver(kick).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    new MutationObserver(kick).observe($('playlistDetailTitle'), { childList: true, characterData: true, subtree: true });
    firebase.auth().onAuthStateChanged(kick);
})();