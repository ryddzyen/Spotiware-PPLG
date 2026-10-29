// saved-in.js — HP: "Add to playlist" jadi sheet "Saved in" ala Spotify (Cancel / Done, perubahan baru diterapkan saat Done)
(function () {
    const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    let root = null, sheet = null, songId = null, initial = new Set(), sel = new Set(), sortMode = 'recents';
    const $ = q => sheet.querySelector(q);

    function injectStyle() {
        const css = document.createElement('style');
        css.textContent = `
            .si-backdrop{display:none;position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:4500}
            .si-sheet{display:none;position:fixed;left:0;right:0;bottom:0;height:92vh;background:#1f1f1f;color:#fff;
                border-radius:16px 16px 0 0;z-index:4510;flex-direction:column;overflow:hidden;
                transform:translateY(100%);transition:transform .25s ease}
            body.si-open{overflow:hidden}
            body.si-open .si-backdrop{display:block}
            body.si-open .si-sheet{display:flex}
            body.si-open .si-sheet.in{transform:none}
            .si-handle{width:3rem;height:.3rem;border-radius:1rem;background:#555;margin:.6rem auto .2rem;flex-shrink:0}
            .si-top{display:flex;justify-content:space-between;padding:.5rem 1.2rem .9rem;flex-shrink:0}
            .si-top button{background:none;border:none;color:#fff;font:inherit;font-weight:700;font-size:1rem;cursor:pointer;padding:.2rem 0}
            .si-title{display:flex;align-items:center;justify-content:space-between;padding:.2rem 1.2rem 1rem;flex-shrink:0}
            .si-title h3{font-size:1.6rem;font-weight:800;margin:0}
            .si-new{background:none;border:none;color:var(--yellow,#FFD700);font:inherit;font-weight:700;font-size:.95rem;cursor:pointer}
            .si-newrow{display:none;gap:.5rem;padding:0 1.2rem .9rem;flex-shrink:0}
            .si-newrow.show{display:flex}
            .si-newrow input{flex:1;min-width:0;padding:.7rem .8rem;border-radius:6px;border:1px solid #727272;background:#2a2a2a;color:#fff;font:inherit;font-size:.95rem;outline:none}
            .si-newrow input:focus{border-color:var(--yellow,#FFD700)}
            .si-newrow button{background:var(--yellow,#FFD700);color:#000;border:none;border-radius:6px;padding:0 1.1rem;font:inherit;font-weight:800;cursor:pointer}
            .si-scroll{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:0 1.2rem 7rem}
            .si-row{display:flex;align-items:center;gap:1rem;padding:.55rem 0;cursor:pointer;-webkit-tap-highlight-color:transparent}
            .si-cover{width:3.6rem;height:3.6rem;flex:0 0 3.6rem;border-radius:4px;overflow:hidden;background:#2f2f2f;color:var(--yellow,#FFD700);
                display:flex;align-items:center;justify-content:center;font-size:1.2rem}
            .si-cover.liked{background:linear-gradient(135deg,#450af5,#c4efd9);color:#fff}
            .si-cover.plus{background:#3a3a3a;color:#b3b3b3;font-size:1.4rem}
            .si-cover img{width:100%;height:100%;object-fit:cover;display:block}
            .si-info{flex:1;min-width:0}
            .si-name{font-size:1.05rem;line-height:1.3;word-break:normal;overflow-wrap:normal;hyphens:none;
                display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
            .si-sub{color:#9ca3af;font-size:.88rem;margin-top:.15rem}
            .si-tick{width:2.1rem;height:2.1rem;flex:0 0 2.1rem;border-radius:50%;border:2px solid #b3b3b3;background:none;color:#b3b3b3;
                font-size:.85rem;display:flex;align-items:center;justify-content:center;cursor:pointer}
            .si-tick.on{background:var(--yellow,#FFD700);border-color:var(--yellow,#FFD700);color:#000}
            .si-find{display:flex;gap:.6rem;margin:.6rem 0 .5rem}
            .si-search{flex:1;min-width:0;display:flex;align-items:center;gap:.6rem;background:#2a2a2a;border-radius:6px;padding:0 .8rem;height:2.8rem}
            .si-search input{flex:1;min-width:0;background:none;border:none;outline:none;color:#fff;font:inherit;font-size:.95rem;font-weight:600}
            .si-sort{background:#2a2a2a;color:#fff;border:none;border-radius:6px;padding:0 1rem;font:inherit;font-weight:700;font-size:.9rem;cursor:pointer}
            .si-empty{color:#9ca3af;text-align:center;padding:1.5rem 0;font-size:.9rem}
            .si-float{display:none;position:absolute;left:50%;bottom:calc(1.2rem + env(safe-area-inset-bottom,0px));transform:translateX(-50%);
                background:var(--yellow,#FFD700);color:#000;border:none;border-radius:999px;padding:.95rem 2.2rem;
                font:inherit;font-weight:800;font-size:1rem;box-shadow:0 8px 20px rgba(0,0,0,.5);cursor:pointer}
            .si-float.show{display:block}
        `;
        document.head.appendChild(css);
    }

    const isDirty = () => sel.size !== initial.size || [...sel].some(id => !initial.has(id));

    function sorted(list, withLikedFirst) {
        return list.slice().sort((a, b) => {
            if (withLikedFirst) {
                if (a.id === LIKED_PLAYLIST_ID) return -1;
                if (b.id === LIKED_PLAYLIST_ID) return 1;
            }
            return sortMode === 'alpha'
                ? String(a.name).localeCompare(String(b.name))
                : getPlaylistTimestamp(b, 'lastPlayedAt') - getPlaylistTimestamp(a, 'lastPlayedAt');
        });
    }

    function rowHTML(p, on) {
        const liked = p.id === LIKED_PLAYLIST_ID;
        const src = getPlaylistCoverSrc(p);
        const cover = src ? `<img src="${esc(src)}" alt="">` : liked ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-solid fa-music"></i>';
        const n = p.songIds.length;
        return `<div class="si-row" data-id="${esc(p.id)}">
            <div class="si-cover${liked ? ' liked' : ''}">${cover}</div>
            <div class="si-info"><div class="si-name">${esc(liked ? 'Liked Songs' : p.name)}</div><div class="si-sub">${n} song${n !== 1 ? 's' : ''}</div></div>
            <button type="button" class="si-tick${on ? ' on' : ''}"><i class="fa-solid ${on ? 'fa-check' : 'fa-plus'}"></i></button></div>`;
    }

    function render() {
        const q = ($('.si-search input').value || '').toLowerCase().trim();
        const all = getPlaylists();
        const saved = sorted(all.filter(p => sel.has(p.id)), true);
        let rest = sorted(all.filter(p => !sel.has(p.id)), true);
        if (q) rest = rest.filter(p => (p.id === LIKED_PLAYLIST_ID ? 'liked songs' : String(p.name)).toLowerCase().includes(q));

        $('#siSaved').innerHTML = saved.map(p => rowHTML(p, true)).join('');
        $('#siRest').innerHTML = (rest.map(p => rowHTML(p, false)).join('') ||
            (q ? '<div class="si-empty">Playlist tidak ditemukan.</div>' : '')) +
            '<div class="si-row si-newbtn"><div class="si-cover plus"><i class="fa-solid fa-plus"></i></div><div class="si-info"><div class="si-name">New playlist</div></div></div>';
        $('.si-sort').textContent = sortMode === 'alpha' ? 'A–Z' : 'Recents';
        $('.si-float').classList.toggle('show', isDirty());
    }

    function apply() {
        const add = [], rem = [];
        getPlaylists().forEach(p => {
            const had = initial.has(p.id), now = sel.has(p.id);
            if (now && !had) add.push(p);
            if (!now && had) rem.push(p);
        });
        if (!add.length && !rem.length) return;
        add.forEach(p => addSongToPlaylist(p.id, songId));
        rem.forEach(p => removeSongFromPlaylist(p.id, songId));
        try { renderPlaylistList(); } catch (e) { }
        try { updateNowBarLikeIcon(); } catch (e) { }
        try { syncTrackLikeButtons(songId); } catch (e) { }
        try { window.SpotiSearch && SpotiSearch.refreshRows && SpotiSearch.refreshRows(); } catch (e) { }
        const nm = p => (p.id === LIKED_PLAYLIST_ID ? 'Liked Songs' : p.name);
        let msg = 'Playlists updated';
        if (add.length && !rem.length) msg = add.length === 1 ? 'Added to ' + nm(add[0]) : 'Saved in ' + add.length + ' playlists';
        else if (rem.length && !add.length) msg = rem.length === 1 ? 'Removed from ' + nm(rem[0]) : 'Removed from ' + rem.length + ' playlists';
        try { showToast(msg); } catch (e) { }
    }

    function close(save) {
        if (save) apply();
        if (!sheet) return;
        sheet.classList.remove('in');
        setTimeout(() => document.body.classList.remove('si-open'), 250);
    }

    function toggleNew(show) {
        const row = $('.si-newrow');
        row.classList.toggle('show', show === undefined ? !row.classList.contains('show') : show);
        if (row.classList.contains('show')) setTimeout(() => row.querySelector('input').focus(), 50);
    }

    function createNew() {
        const inp = $('.si-newrow input');
        const p = createPlaylist(inp.value.trim() || 'Playlist Baru');
        sel.add(p.id);                         // playlist baru langsung ikut terpilih
        inp.value = '';
        toggleNew(false);
        try { renderPlaylistList(); } catch (e) { }
        render();
    }

    function build() {
        root = document.createElement('div');
        root.innerHTML = `
            <div class="si-backdrop"></div>
            <div class="si-sheet">
                <div class="si-handle"></div>
                <div class="si-top"><button type="button" class="si-cancel">Cancel</button><button type="button" class="si-done">Done</button></div>
                <div class="si-title"><h3>Saved in</h3><button type="button" class="si-new">New playlist</button></div>
                <div class="si-newrow"><input type="text" placeholder="Nama playlist"><button type="button" class="si-create">Buat</button></div>
                <div class="si-scroll">
                    <div id="siSaved"></div>
                    <div class="si-find">
                        <div class="si-search"><i class="fa-solid fa-magnifying-glass"></i><input type="text" placeholder="Find playlist"></div>
                        <button type="button" class="si-sort">Recents</button>
                    </div>
                    <div id="siRest"></div>
                </div>
                <button type="button" class="si-float">Done</button>
            </div>`;
        document.body.appendChild(root);
        sheet = root.querySelector('.si-sheet');

        root.querySelector('.si-backdrop').addEventListener('click', () => close(false));
        $('.si-cancel').addEventListener('click', () => close(false));
        $('.si-done').addEventListener('click', () => close(true));
        $('.si-float').addEventListener('click', () => close(true));
        $('.si-new').addEventListener('click', () => toggleNew());
        $('.si-create').addEventListener('click', createNew);
        $('.si-newrow input').addEventListener('keydown', e => { if (e.key === 'Enter') createNew(); });
        $('.si-search input').addEventListener('input', render);
        $('.si-sort').addEventListener('click', () => { sortMode = sortMode === 'alpha' ? 'recents' : 'alpha'; render(); });
        $('.si-scroll').addEventListener('click', e => {
            if (e.target.closest('.si-newbtn')) { toggleNew(true); return; }
            const row = e.target.closest('.si-row[data-id]');
            if (!row) return;
            const id = row.dataset.id;
            if (sel.has(id)) sel.delete(id); else sel.add(id);
            render();
        });
    }

    function openSheet(id) {
        if (!sheet) build();
        try { ensureLikedPlaylist(); } catch (e) { }
        songId = id;
        initial = new Set(getPlaylists().filter(p => p.songIds.includes(id)).map(p => p.id));
        sel = new Set(initial);
        $('.si-search input').value = '';
        $('.si-newrow').classList.remove('show');
        render();
        $('.si-scroll').scrollTop = 0;
        document.body.classList.add('si-open');
        requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.add('in')));
    }

    function init() {
        if (typeof openAddToPlaylistModal !== 'function' || typeof isMobileView !== 'function' ||
            typeof getPlaylists !== 'function') return setTimeout(init, 300);
        injectStyle();
        const _open = openAddToPlaylistModal;
        openAddToPlaylistModal = function (id) {
            if (isMobileView()) return openSheet(id);       // HP: sheet "Saved in". Laptop: modal lama
            return _open.apply(this, arguments);
        };
    }

    init();
})();