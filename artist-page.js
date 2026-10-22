// artist-page.js — halaman artis bergaya playlist (tanpa "Verified" & "monthly listeners")
(function () {
    let origOpen = null, origClose = null;

    function injectStyle() {
        const css = document.createElement('style');
        css.textContent = `
            body.artist-page #playlistDetailCover{border-radius:50%;overflow:hidden;cursor:default}
            body.artist-page #playlistDetailCover .cover-upload-overlay{display:none!important}
            body.artist-page #ctxRemoveFromPlaylist{display:none!important}
            body.artist-page #playlistTrackTable .pd-list-only{display:none}
        `;
        document.head.appendChild(css);
    }

    function setMode(on) {
        document.body.classList.toggle('artist-page', on);
        const t = document.querySelector('.playlist-detail-type');
        if (t) t.textContent = on ? 'Artist' : 'Playlist';
    }

    window.openArtistPage = function (name) {
        const list = visibleSongs.filter(s => s.artists.includes(name));
        if (!list.length) return;
        const fake = { id: 'artist:' + name, name: name, songIds: list.map(s => s.id), description: '', __artist: true };

        window.openPlaylistDetailView(fake, false);
        setMode(true);

        const addBtn = document.getElementById('pdAddSongsBtn');
        const editBtn = document.getElementById('pdEditDetailsBtn');
        if (addBtn) addBtn.style.display = 'none';
        if (editBtn) editBtn.style.display = 'none';
        const desc = document.getElementById('playlistDetailDescription');
        if (desc) desc.textContent = '';
    };

    function init() {
        if (typeof window.openPlaylistDetailView !== 'function' || typeof window.closePlaylistDetailView !== 'function') {
            return setTimeout(init, 300);
        }
        injectStyle();

        origOpen = window.openPlaylistDetailView;
        window.openPlaylistDetailView = function (p) {
            if (!(p && p.__artist)) setMode(false);      // playlist biasa -> keluar dari mode artis
            return origOpen.apply(this, arguments);
        };

        origClose = window.closePlaylistDetailView;
        window.closePlaylistDetailView = function () {
            setMode(false);
            return origClose.apply(this, arguments);
        };

        // di halaman artis, klik foto tidak membuka pemilih file
        document.addEventListener('click', e => {
            if (document.body.classList.contains('artist-page') && e.target.closest('#playlistDetailCover')) {
                e.stopPropagation();
            }
        }, true);
    }

    init();
})();