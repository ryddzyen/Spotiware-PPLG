// add-popup.js — laptop: "Add to playlist" jadi popup ala Spotify (klik lingkaran = langsung tambah / hapus)
(function () {
    const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    let pop = null, songId = null, orderIds = [], pt = { x: 240, y: 240 };
    const toast = t => { try { showToast(t); } catch (e) { } };
    const $ = q => pop.querySelector(q);

    function injectStyle() {
        const css = document.createElement('style');
        css.textContent = `
            .ap-pop{display:none;position:fixed;z-index:5100;width:22rem;max-width:calc(100vw - 1rem);max-height:min(34rem,80vh);
                flex-direction:column;background:#282828;color:#fff;border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,.7);padding:.9rem .4rem .5rem}
            .ap-pop.show{display:flex}
            .ap-title{font-size:.85rem;font-weight:700;color:#d1d5db;padding:0 .9rem .6rem}
            .ap-search{display:flex;align-items:center;gap:.6rem;margin:0 .5rem .5rem;padding:0 .8rem;height:2.6rem;background:#3a3a3a;border-radius:6px}
            .ap-search i{color:#b3b3b3}
            .ap-search input{flex:1;min-width:0;background:none;border:none;outline:none;color:#fff;font:inherit;font-size:.9rem;font-weight:600}
            .ap-new{display:flex;align-items:center;gap:.9rem;padding:.6rem .8rem;margin:0 .3rem;border-radius:6px;cursor:pointer;font-weight:700}
            .ap-new:hover{background:#3a3a3a}
            .ap-sep{height:1px;background:#444;margin:.4rem .9rem}
            .ap-list{flex:1;min-height:0;overflow-y:auto;padding:0 .3rem}
            .ap-row{display:flex;align-items:center;gap:.8rem;padding:.4rem .5rem;border-radius:6px;cursor:pointer}
            .ap-row:hover{background:#3a3a3a}
            .ap-cover{width:3rem;height:3rem;flex:0 0 3rem;border-radius:4px;overflow:hidden;background:#2f2f2f;color:var(--yellow,#FFD700);
                display:flex;align-items:center;justify-content:center}
            .ap-cover.liked{background:linear-gradient(135deg,#450af5,#c4efd9);color:#fff}
            .ap-cover img{width:100%;height:100%;object-fit:cover;display:block}
            .ap-name{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600;font-size:.95rem}
            .ap-pin{color:var(--yellow,#FFD700);font-size:.8rem;transform:rotate(45deg)}
            .ap-tick{width:1.5rem;height:1.5rem;flex:0 0 1.5rem;border-radius:50%;border:2px solid #b3b3b3;display:flex;align-items:center;justify-content:center;font-size:.7rem;color:#000}
            .ap-tick.on{background:var(--yellow,#FFD700);border-color:var(--yellow,#FFD700)}
            .ap-empty{color:#9ca3af;text-align:center;padding:1.2rem 0;font-size:.85rem}
            .ap-foot{text-align:right;padding:.5rem 1rem .2rem}
            .ap-cancel{background:none;border:none;color:#b3b3b3;font:inherit;font-weight:700;cursor:pointer}
            .ap-cancel:hover{color:#fff}
        `;
        document.head.appendChild(css);
    }

    function afterChange() {
        try { renderPlaylistList(); } catch (e) { }
        try { updateNowBarLikeIcon(); } catch (e) { }
        try { syncTrackLikeButtons(songId); } catch (e) { }
        try { window.SpotiSearch && SpotiSearch.refreshRows && SpotiSearch.refreshRows(); } catch (e) { }
    }

    function render() {
        const q = ($('.ap-search input').value || '').toLowerCase().trim();
        const byId = new Map(getPlaylists().map(p => [p.id, p]));
        let ids = orderIds.filter(id => byId.has(id));
        if (q) ids = ids.filter(id => (id === LIKED_PLAYLIST_ID ? 'liked songs' : String(byId.get(id).name)).toLowerCase().includes(q));
        $('.ap-list').innerHTML = ids.map(id => {
            const p = byId.get(id), liked = id === LIKED_PLAYLIST_ID, on = p.songIds.includes(songId);
            const src = getPlaylistCoverSrc(p);
            const cover = src ? `<img src="${esc(src)}" alt="">` : liked ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-solid fa-music"></i>';
            return `<div class="ap-row" data-id="${esc(id)}">
                <div class="ap-cover${liked ? ' liked' : ''}">${cover}</div>
                <div class="ap-name">${esc(liked ? 'Liked Songs' : p.name)}</div>
                ${liked ? '<i class="fa-solid fa-thumbtack ap-pin"></i>' : ''}
                <span class="ap-tick${on ? ' on' : ''}">${on ? '<i class="fa-solid fa-check"></i>' : ''}</span></div>`;
        }).join('') || '<div class="ap-empty">Playlist tidak ditemukan.</div>';
    }

    function place() {
        const w = pop.offsetWidth, h = pop.offsetHeight;
        const x = Math.max(8, Math.min(pt.x + 8, window.innerWidth - w - 8));
        const y = Math.max(8, Math.min(pt.y + 8, window.innerHeight - h - 8));
        pop.style.left = x + 'px';
        pop.style.top = y + 'px';
    }

    function close() { if (pop) pop.classList.remove('show'); }

    function createNew() {
        const n = getPlaylists().filter(p => p.id !== LIKED_PLAYLIST_ID).length + 1;
        const p = createPlaylist('My Playlist #' + n);
        addSongToPlaylist(p.id, songId);
        orderIds.unshift(p.id);
        afterChange();
        toast('Added to ' + p.name);
        render();
    }

    function build() {
        injectStyle();
        pop = document.createElement('div');
        pop.className = 'ap-pop';
        pop.innerHTML = `
            <div class="ap-title">Add to playlist</div>
            <div class="ap-search"><i class="fa-solid fa-magnifying-glass"></i><input type="text" placeholder="Find a playlist"></div>
            <div class="ap-new"><i class="fa-solid fa-plus"></i><span>New playlist</span></div>
            <div class="ap-sep"></div>
            <div class="ap-list"></div>
            <div class="ap-foot"><button type="button" class="ap-cancel">Cancel</button></div>`;
        document.body.appendChild(pop);

        $('.ap-search input').addEventListener('input', render);
        $('.ap-new').addEventListener('click', createNew);
        $('.ap-cancel').addEventListener('click', close);
        $('.ap-list').addEventListener('click', e => {
            const row = e.target.closest('.ap-row');
            if (!row) return;
            const p = getPlaylists().find(x => x.id === row.dataset.id);
            if (!p) return;
            const nm = p.id === LIKED_PLAYLIST_ID ? 'Liked Songs' : p.name;
            if (p.songIds.includes(songId)) { removeSongFromPlaylist(p.id, songId); toast('Removed from ' + nm); }
            else { addSongToPlaylist(p.id, songId); toast('Added to ' + nm); }
            afterChange();
            render();
        });
    }

    function openPop(id) {
        if (!pop) build();
        try { ensureLikedPlaylist(); } catch (e) { }
        songId = id;
        const rank = p => p.songIds.includes(id) ? 0 : p.id === LIKED_PLAYLIST_ID ? 1 : 2;
        orderIds = getPlaylists().slice().sort((a, b) => rank(a) - rank(b) ||
            (rank(a) === 2 ? getPlaylistTimestamp(b, 'lastPlayedAt') - getPlaylistTimestamp(a, 'lastPlayedAt') : 0)).map(p => p.id);
        $('.ap-search input').value = '';
        render();
        pop.classList.add('show');
        place();
        setTimeout(() => $('.ap-search input').focus(), 0);
    }

    // popup muncul dekat tempat terakhir kamu mengklik
    document.addEventListener('pointerdown', e => {
        pt = { x: e.clientX, y: e.clientY };
        if (pop && pop.classList.contains('show') && !pop.contains(e.target)) close();
    }, true);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', close);

    function init() {
        if (typeof openAddToPlaylistModal !== 'function' || typeof isMobileView !== 'function' ||
            typeof getPlaylists !== 'function') return setTimeout(init, 300);
        const _open = openAddToPlaylistModal;
        openAddToPlaylistModal = function (id) {
            if (isMobileView()) return _open.apply(this, arguments);     // HP: sheet "Saved in"
            return openPop(id);
        };
    }

    init();
})();