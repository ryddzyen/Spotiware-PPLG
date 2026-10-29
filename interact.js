// interact.js — Langkah 8: nama artis bisa diklik di semua tempat + play/pause & klik kanan di kartu playlist (beranda & Library)
(function () {
    const q = s => document.querySelector(s);
    const toast = t => { try { showToast(t); } catch (e) { } };

    function injectStyle() {
        const css = document.createElement('style');
        css.textContent = `
            .ar-link{cursor:pointer}
            .ar-link:hover{text-decoration:underline;color:#fff}
            .hr-tile{position:relative}
            .hr-tile .pl-play{right:.7rem;bottom:auto;top:50%;margin-top:-20px;width:40px;height:40px;transform:translateY(6px)}
            .hr-tile:hover .pl-play,.hr-tile .pl-play.on{opacity:1;transform:none}
            .hr-tile:hover span{padding-right:3.4rem}
            .hr-art{position:relative}
            .hr-card:hover .hr-art .pl-play,.hr-art .pl-play.on{opacity:1;transform:none}
            @media (hover:none){.hr-tile .pl-play{display:none}}
        `;
        document.head.appendChild(css);
    }

    // ---------- 1. nama artis jadi link ----------
    const SEL = ['.img-description', '.t-artist', 'td.pd-compact-only', '.sr-sub', '.sv-top-sub', '.np-artist', '.img-des-info',
        '.mp-artist', '.queue-item-artist', '.sheet-item-artist', '.hv-artist', '.hr-sub', '.yt-s', '.yt-cs', '.history-artist',
        '.add-songs-row-artist'].join(',');
    let known = null, knownN = -1;

    function knownArtists() {
        if (known && knownN === songs.length) return known;
        known = new Set();
        songs.forEach(s => {
            const list = (s.artists && s.artists.length) ? s.artists : String(s.songDes || '').split(',').map(x => x.trim()).filter(Boolean);
            list.forEach(a => { if (a && a !== 'Unknown') known.add(a); });
        });
        knownN = songs.length;
        return known;
    }

    function linkify(el) {
        if (el.childElementCount) return;                        // sudah diproses, atau berisi elemen lain
        const text = el.textContent;
        if (!text.trim() || el.__arNone === text) return;
        const set = knownArtists();
        const parts = text.split(/(\s*,\s*|\s+•\s+)/);
        if (!parts.some(p => set.has(p.trim()))) { el.__arNone = text; return; }
        const frag = document.createDocumentFragment();
        parts.forEach(p => {
            const name = p.trim();
            if (name && set.has(name)) {
                const i = p.indexOf(name);
                if (i) frag.appendChild(document.createTextNode(p.slice(0, i)));
                const s = document.createElement('span');
                s.className = 'ar-link';
                s.dataset.artist = name;
                s.textContent = name;
                frag.appendChild(s);
                const rest = p.slice(i + name.length);
                if (rest) frag.appendChild(document.createTextNode(rest));
            } else frag.appendChild(document.createTextNode(p));
        });
        el.textContent = '';
        el.appendChild(frag);
    }

    function openArtist(name) {
        const yt = document.body.classList.contains('mode-yt');
        if (yt && window.YTMusic && YTMusic.artistByName) return YTMusic.artistByName(name);
        if (visibleSongs.some(s => (s.artists || []).includes(name)) && typeof window.openArtistPage === 'function') return window.openArtistPage(name);
        if (window.YTMusic && YTMusic.artistByName && songs.some(s => s.external && (s.artists || []).includes(name))) return YTMusic.artistByName(name);
        toast('Artis ini tidak ada di koleksimu');
    }

    document.addEventListener('click', e => {
        const a = e.target.closest && e.target.closest('.ar-link');
        if (!a) return;
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();                            // jangan ikut memutar lagu / membuka kartu
        if (a.closest('.mobile-sheet')) { try { closeMobileSheet(); } catch (err) { } }
        if (document.fullscreenElement || a.closest('.now-playing-panel.mobile-open')) q('#npBackBtn')?.click();
        openArtist(a.dataset.artist);
    }, true);

    // ---------- 2. kartu playlist: play/pause + klik kanan ----------
    const PLAY = '<button type="button" class="pl-play" data-pl-play="1" title="Play"><i class="fa-solid fa-play"></i></button>';

    function decoratePlaylists() {
        if (!window.PLX) return;
        document.querySelectorAll('#htAllView .hr-tile[data-id]:not([data-pl]), #htAllView .hr-card[data-type="playlist"]:not([data-pl])')
            .forEach(el => {
                el.dataset.pl = 'loc:' + el.dataset.id;
                const host = el.classList.contains('hr-card') ? el.querySelector('.hr-art') : el;
                if (host && !host.querySelector('.pl-play')) host.insertAdjacentHTML('beforeend', PLAY);
            });
        // daftar di Your Library: hanya klik kanan (tombol play bawaannya sudah ada)
        document.querySelectorAll('.main-left-part .playlist-item[data-playlist-id]:not([data-pl])')
            .forEach(el => { el.dataset.pl = 'loc:' + el.dataset.playlistId; });
        PLX.syncPlayIcons();
    }

    // ---------- pemicu: halaman digambar ulang ----------
    let scanT = null;
    function scan() {
        scanT = null;
        document.querySelectorAll(SEL).forEach(linkify);
        decoratePlaylists();
    }
    function schedule() { if (!scanT) scanT = setTimeout(scan, 120); }

    function init() {
        if (typeof songs === 'undefined' || typeof visibleSongs === 'undefined' || !window.PLX) return setTimeout(init, 300);
        injectStyle();
        new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
        scan();
    }
    init();
})();