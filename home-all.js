// home-all.js — tab All: tile kecil (atas) + Recommended, Popular radio, Popular artists, Recents, Suggested, More like
(function () {
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    let sig = '';

    function injectStyle() {
        const css = document.createElement('style');
        css.textContent = `
            #htAllView{display:none}
            body.ht-allhome:not(.ht-music):not(.ht-genre) #htAllView{display:block}
            body.ht-allhome:not(.ht-music):not(.ht-genre) #htAllView.hide{display:none}
            body.ht-allhome:not(.ht-music):not(.ht-genre) .music-section:not(#htAllView){display:none!important}

            /* tile kecil di paling atas */
            .hr-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:.6rem;padding:.4rem .2rem 1.2rem}
            body.np-hidden:has(.main-left-part.collapsed) .hr-grid{grid-template-columns:repeat(4,1fr)}
            .hr-tile{display:flex;align-items:center;gap:.7rem;background:rgba(255,255,255,.08);border-radius:6px;overflow:hidden;cursor:pointer;height:56px}
            .hr-tile:hover{background:rgba(255,255,255,.16)}
            .hr-tile img,.hr-tile .hr-ico{width:56px;height:56px;flex:0 0 56px;object-fit:cover}
            .hr-ico{display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#450af5,#c4efd9);color:#fff}
            .hr-ico.pl{background:#2f2f2f;color:#b3b3b3}
            .hr-tile span{min-width:0;max-width:30ch;font-weight:600;font-size:.88rem;line-height:1.25;padding-right:.6rem;
                white-space:normal;word-break:normal;overflow-wrap:normal;hyphens:none;
                display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
            #createMenuQueue,#createMenuHistory{display:none!important}

            /* kartu Recents */
            .hr-card{flex:0 0 auto;width:170px;cursor:pointer;border-radius:8px;padding:8px;box-sizing:border-box;transition:background .2s}
            .hr-card:hover{background:rgba(255,255,255,.08)}
            .hr-art{width:154px;height:154px;border-radius:6px;overflow:hidden;background:#2f2f2f;display:flex;align-items:center;justify-content:center}
            .hr-art img{width:100%;height:100%;object-fit:cover}
            .hr-art.liked{background:linear-gradient(135deg,#450af5,#c4efd9);color:#fff;font-size:2.2rem}
            .hr-art.pl{font-size:2rem;color:#b3b3b3}
            .hr-name{margin-top:.5rem;font-weight:600;font-size:.92rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
            .hr-sub{font-size:.8rem;opacity:.65;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        `;
        document.head.appendChild(css);
    }

    // ---------- data ----------
    function playlistsRecent() {
        ensureLikedPlaylist();
        const pls = getPlaylists();
        const liked = pls.find(p => p.id === LIKED_PLAYLIST_ID);
        const others = pls.filter(p => p.id !== LIKED_PLAYLIST_ID)
            .sort((a, b) => getPlaylistTimestamp(b, 'lastPlayedAt') - getPlaylistTimestamp(a, 'lastPlayedAt'));
        return { liked, others };
    }

    // tile kecil: Liked Songs (kalau ada isinya) lalu playlist, maksimal 8
    function tileItems() {
        const { liked, others } = playlistsRecent();
        const out = [];
        if (liked && liked.songIds.length > 0) out.push(liked);
        others.forEach(p => out.push(p));
        return out.slice(0, 8);
    }

    // kartu Recents: lagu terakhir diputar, Liked Songs, playlist, lagu lain dari riwayat
    function cardItems() {
        const { liked, others } = playlistsRecent();
        const hist = playHistory.slice(0, 6);
        const out = [];
        if (hist[0]) out.push({ type: 'song', song: hist[0] });
        if (liked) out.push({ type: 'playlist', p: liked });
        others.slice(0, 6).forEach(p => out.push({ type: 'playlist', p }));
        hist.slice(1, 5).forEach(s => out.push({ type: 'song', song: s }));
        return out.slice(0, 12);
    }

    // ---------- tampilan ----------
    function tile(p) {
        const liked = p.id === LIKED_PLAYLIST_ID;
        const src = getPlaylistCoverSrc(p);
        const art = src
            ? `<img src="${esc(src)}" alt="" loading="lazy">`
            : `<div class="hr-ico${liked ? '' : ' pl'}"><i class="fa-solid ${liked ? 'fa-heart' : 'fa-music'}"></i></div>`;
        return `<div class="hr-tile" data-id="${esc(p.id)}">${art}<span>${esc(liked ? 'Liked Songs' : p.name)}</span></div>`;
    }

    function card(it) {
        if (it.type === 'song') {
            const s = it.song;
            return `<div class="hr-card" data-type="song" data-id="${s.id}">
                <div class="hr-art"><img src="${esc(s.songImage)}" alt="" loading="lazy"></div>
                <div class="hr-name">${esc(s.songName)}</div>
                <div class="hr-sub">${esc(s.songDes)}</div></div>`;
        }
        const p = it.p;
        const liked = p.id === LIKED_PLAYLIST_ID;
        const src = getPlaylistCoverSrc(p);
        const art = src
            ? `<div class="hr-art"><img src="${esc(src)}" alt="" loading="lazy"></div>`
            : liked
                ? `<div class="hr-art liked"><i class="fa-solid fa-heart"></i></div>`
                : `<div class="hr-art pl"><i class="fa-solid fa-music"></i></div>`;
        const n = p.songIds.length;
        return `<div class="hr-card" data-type="playlist" data-id="${esc(p.id)}">
            ${art}
            <div class="hr-name">${esc(liked ? 'Liked Songs' : p.name)}</div>
            <div class="hr-sub">Playlist • ${n} song${n !== 1 ? 's' : ''}</div></div>`;
    }

    function tilesHTML() {
        const tiles = tileItems();
        return `<div id="hrTop">${tiles.length ? `<div class="hr-grid">${tiles.map(tile).join('')}</div>` : ''}</div>`;
    }

    function recentsHTML() {
        return `<div class="ht-row" id="hrRecents">
            <div class="music-section-header">
                <h2>Recents</h2>
                <span class="show-all-link" id="hrShowAll">Show all</span>
            </div>
            <div class="hm-scroll">${cardItems().map(card).join('')}</div>
        </div>`;
    }

    const signature = () => JSON.stringify([
        tileItems().map(p => [p.id, p.name, p.songIds.length, !!p.coverImage, getPlaylistTimestamp(p, 'lastPlayedAt')]),
        cardItems().map(it => it.type === 'song' ? ['s', it.song.id] : ['p', it.p.id, it.p.name, it.p.songIds.length])
    ]);

    function refresh() {
        const s = signature();
        if (s === sig) return;
        sig = s;
        const top = document.getElementById('hrTop');
        const rec = document.getElementById('hrRecents');
        if (top) top.outerHTML = tilesHTML();
        if (rec) rec.outerHTML = recentsHTML();
    }

    // All hanya tampil kalau kolom pencarian kosong (hasil pencarian tetap pakai tampilan lama)
    function sync() {
        const input = document.querySelector('.input-box');
        document.body.classList.toggle('ht-allhome', !(input && input.value.trim()));
    }

    function init() {
        const anchor = document.getElementById('htMusicView');
        if (!anchor || !window.HomeMusic || typeof ensureLikedPlaylist !== 'function') {
            return setTimeout(init, 300);   // tunggu home-tabs.js & home-music.js
        }
        injectStyle();
        HomeMusic.injectStyle();

        const view = document.createElement('div');
        view.className = 'music-section hm';
        view.id = 'htAllView';
        sig = signature();
        // tile di paling atas; Recents disisipkan tepat setelah "Popular artists"
        view.innerHTML = tilesHTML() + HomeMusic.build('a_', recentsHTML());
        anchor.insertAdjacentElement('beforebegin', view);

        HomeMusic.wire(view);
        view.addEventListener('click', e => {
            const t = e.target.closest('.hr-tile');
            if (t) {
                const p = getPlaylists().find(x => x.id === t.dataset.id);
                if (p) openPlaylistDetailView(p, p.id === LIKED_PLAYLIST_ID);
                return;
            }
            if (e.target.closest('#hrShowAll')) {
                return openShowAllView('Recents', playHistory.length ? playHistory : visibleSongs.slice(0, 30));
            }
            const c = e.target.closest('.hr-card');
            if (!c) return;
            if (c.dataset.type === 'song') {
                const id = parseInt(c.dataset.id);
                if (playerBar.classList.contains('show') && getCurrentSong().id === id) play.click();
                else playSongFromList(id, playHistory.length ? playHistory : [songs.find(s => s.id === id)]);
            } else {
                const p = getPlaylists().find(x => x.id === c.dataset.id);
                if (p) openPlaylistDetailView(p, p.id === LIKED_PLAYLIST_ID);
            }
        });
        if (typeof attachCardMoreButtonEvents === 'function') attachCardMoreButtonEvents();

        sync();
        document.querySelector('.input-box')?.addEventListener('input', sync);
        const later = () => { sync(); setTimeout(sync, 50); };
        document.querySelector('.home-icon')?.addEventListener('click', later);
        document.querySelector('.bottom-nav-item[data-target="home"]')?.addEventListener('click', later);

        window.addEventListener('spotiware:account-changed', () => { sig = ''; refresh(); });
        window.addEventListener('spotiware:history', refresh);
        setInterval(() => { if (!document.hidden) refresh(); }, 2000);
        audio.addEventListener('play', HomeMusic.syncRadio);
        audio.addEventListener('pause', HomeMusic.syncRadio);
    }

    init();
})();