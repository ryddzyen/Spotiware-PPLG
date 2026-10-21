// home-tabs.js — tombol All | Music | Genre: transparan di paling atas, gelap + blur saat di-scroll
(function () {
    const TABS = [
        { id: 'all', label: 'All' },
        { id: 'music', label: 'Music' },
        { id: 'genre', label: 'Genre' }
    ];
    let current = 'all';
    let bar = null;

    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const mobile = () => typeof isMobileView === 'function' && isMobileView();

    function injectStyle() {
        const css = document.createElement('style');
        css.textContent = `
            .main-right-part.ht-has-bar{padding-top:0!important}
            .ht-bar{position:sticky;top:0;z-index:30;display:flex;gap:.6rem;
                margin:0;padding:12px 1.4rem 10px;box-sizing:border-box;
                background:transparent;
                transition:background-color .2s ease}
            .ht-bar.scrolled{background:rgba(18,18,18,.88);
                backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
            .ht-chip{background:rgba(255,255,255,.12);color:#fff;border:none;border-radius:2rem;padding:.5rem 1.1rem;font:inherit;font-size:.9rem;cursor:pointer}
            .ht-chip:hover{background:rgba(255,255,255,.22)}
            .ht-chip.active{background:#fff;color:#000}
            /* bar disembunyikan di halaman lain (playlist, pencarian, profil, dll) */
            .main-right-part:has(> .music-section.hide) > .ht-bar{display:none}
            #htMusicView,#htGenreView{display:none}
            body.ht-music #htMusicView,body.ht-genre #htGenreView{display:block}
            body.ht-music #htMusicView.hide,body.ht-genre #htGenreView.hide{display:none}
            body.ht-music .music-section:not(#htMusicView),
            body.ht-genre .music-section:not(#htGenreView){display:none!important}
            .ht-soon{padding:2rem 1rem;opacity:.7}
        `;
        document.head.appendChild(css);
    }

    // bar menempel rapat di atas card; latar muncul hanya saat halaman sudah di-scroll
    function setupBar(right) {
        right.classList.add('ht-has-bar');
        const fit = () => {
            const nav = document.querySelector('nav');
            bar.style.top = mobile() ? ((nav && nav.offsetHeight) || 0) + 'px' : '0px';
        };
        const check = () => {
            const y = mobile() ? (window.scrollY || 0) : right.scrollTop;
            bar.classList.toggle('scrolled', y > 4);
        };
        right.addEventListener('scroll', check, { passive: true });
        window.addEventListener('scroll', check, { passive: true });
        window.addEventListener('resize', () => { fit(); check(); });
        fit();
        check();
    }

    // sembunyikan chip "All" bawaan beranda lama (supaya tidak dobel dengan baris tombol baru)
    function hideOldAll() {
        document.querySelectorAll('.main *').forEach(el => {
            if (el.closest('.ht-bar')) return;
            if (el.children.length === 0 && el.textContent.trim() === 'All') {
                el.style.display = 'none';
            }
        });
    }

    function cardHTML(song) {
        return `
            <div class="music-card" data-song-id="${song.id}">
                <div class="music-card-art">
                    <img src="${esc(song.songImage)}" alt="${esc(song.songName)}" loading="lazy" decoding="async">
                    <div class="music-play-btn"><i class="fa-solid fa-circle-play"></i></div>
                </div>
                <div class="music-card-info">
                    <div class="music-card-text">
                        <div class="img-title">${esc(song.songName)}</div>
                        <div class="img-description">${esc(song.songDes)}</div>
                    </div>
                    <button class="card-more-btn" data-song-id="${song.id}" title="More"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                </div>
            </div>`;
    }

    function rowHTML(title, list) {
        return `
            <div class="ht-row" data-g="${esc(title)}">
                <div class="music-section-header">
                    <h2>${esc(title)}</h2>
                    <span class="show-all-link ht-all" data-g="${esc(title)}">Show all</span>
                </div>
                <div class="songs-wrapper">
                    <div class="songs">${list.slice(0, 20).map(cardHTML).join('')}</div>
                </div>
            </div>`;
    }

    function makeView(id, html) {
        const v = document.createElement('div');
        v.className = 'music-section';
        v.id = id;
        v.innerHTML = html;
        return v;
    }

    function buildGenreView() {
        const names = Object.keys(window.GENRE_ARTISTS).concat('Lainnya');
        const rows = names
            .map(g => ({ g, list: getSongsByGenre(g) }))
            .filter(x => x.list.length > 0)
            .map(x => rowHTML(x.g, x.list))
            .join('');
        const view = makeView('htGenreView', rows);

        view.addEventListener('click', e => {
            const all = e.target.closest('.ht-all');
            if (all) return openShowAllView(all.dataset.g, getSongsByGenre(all.dataset.g));

            const art = e.target.closest('.music-card-art');
            if (!art) return;
            const id = parseInt(art.closest('.music-card').dataset.songId);
            const g = art.closest('.ht-row').dataset.g;
            if (playerBar.classList.contains('show') && getCurrentSong().id === id) play.click();
            else playSongFromList(id, getSongsByGenre(g));
        });
        return view;
    }

    function setTab(id) {
        current = id;
        document.body.classList.toggle('ht-music', id === 'music');
        document.body.classList.toggle('ht-genre', id === 'genre');
        document.querySelectorAll('.ht-chip').forEach(c => c.classList.toggle('active', c.dataset.tab === id));
        closeShowAllView();
        closePlaylistDetailView();
        document.querySelector('.main-right-part')?.scrollTo({ top: 0 });
    }

    function init() {
        const right = document.querySelector('.main-right-part');
        const anchor = document.getElementById('section-4')?.closest('.music-section');
        if (!right || !anchor || typeof getSongsByGenre !== 'function' || typeof openShowAllView !== 'function') {
            return setTimeout(init, 300);   // tunggu script.js & genre-artist.js
        }

        injectStyle();

        bar = document.createElement('div');
        bar.className = 'ht-bar';
        bar.innerHTML = TABS.map(t => `<button class="ht-chip${t.id === 'all' ? ' active' : ''}" data-tab="${t.id}">${t.label}</button>`).join('');
        bar.addEventListener('click', e => {
            const chip = e.target.closest('.ht-chip');
            if (chip) setTab(chip.dataset.tab);
        });
        right.insertAdjacentElement('afterbegin', bar);
        setupBar(right);

        const musicView = makeView('htMusicView', '<div class="ht-soon">Tampilan Music akan hadir di langkah berikutnya.</div>');
        const genreView = buildGenreView();
        anchor.insertAdjacentElement('afterend', musicView);
        musicView.insertAdjacentElement('afterend', genreView);
        if (typeof attachCardMoreButtonEvents === 'function') attachCardMoreButtonEvents();

        // chip "All" lama: sembunyikan sekarang, dan lagi kalau beranda dirender ulang
        hideOldAll();
        let timer = null;
        new MutationObserver(() => {
            clearTimeout(timer);
            timer = setTimeout(hideOldAll, 80);
        }).observe(document.querySelector('.main') || right, { childList: true, subtree: true });

        // mengetik di pencarian -> otomatis kembali ke tab All
        document.querySelector('.input-box')?.addEventListener('input', e => {
            if (e.target.value.trim() && current !== 'all') setTab('all');
        });
        document.querySelector('.home-icon')?.addEventListener('click', () => setTab('all'));
        document.querySelector('.bottom-nav-item[data-target="home"]')?.addEventListener('click', () => setTab('all'));
    }

    init();
})();   