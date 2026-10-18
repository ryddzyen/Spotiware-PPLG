// ===== play-fix.js : shuffle playlist yang benar + lagu pilihan lebih cepat dimuat =====
(() => {
    const $ = (id) => document.getElementById(id);

    // =====================================================
    // 1. SHUFFLE + penanda playlist yang SEDANG diputar
    // =====================================================
    const shuffleBtn = $('shuffle');
    const plShuffle = $('playlistShuffleBtn');
    const plPlay = $('playlistPlayBtn');

    // playlist yang sedang diputar: 'loc:<id>' atau 'ext:<id>' (null = bukan dari playlist)
    let activeKey = null;
    let activeIds = new Set();
    const ctxSame = () => {
        if (!activeKey) return false;
        const ctx = currentContextList.map((s) => s.id);
        return ctx.length === activeIds.size && ctx.every((id) => activeIds.has(id));
    };
    const isActive = (key) => !!key && key === activeKey && playerBar.classList.contains('show') &&
        ctxSame() && activeIds.has(getCurrentSong().id);

    const detailKey = () => {
        const v = $('playlistDetailView');
        return (v && v.classList.contains('show') && pdCurrentPlaylistId) ? 'loc:' + pdCurrentPlaylistId : null;
    };

    // lagu yang sedang tampil di halaman playlist
    function shownSongs() {
        return [...document.querySelectorAll('#playlistTrackTableBody tr[data-song-id]')]
            .map((r) => songs.find((s) => s.id === parseInt(r.dataset.songId)))
            .filter(Boolean);
    }
    const sameSet = (a, b) => a.length === b.length && b.every((s) => a.some((x) => x.id === s.id));

    // lagu yang sedang diputar jadi urutan pertama, sisanya diacak
    function mixCurrentFirst() {
        const cur = getCurrentSong();
        order = [cur, ...shuffleSongs(order.filter((s) => s.id !== cur.id))];
        currentIndex = 0;
        preloadedPath = null;
        try { renderQueuePanel(); renderMobileSheet(); } catch (e) {}
    }

    // tombol shuffle (now bar) menyala -> sisa lagu diacak
    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', () => {
            if (songOnShuffle && !songOnRepeat && playerBar.classList.contains('show')) mixCurrentFirst();
        });
    }

    // semua pemutaran playlist lewat sini: catat playlist mana yang diputar
    const _play = playSongFromList;
    playSongFromList = function (songId, songList) {
        let key = window.__plKey || null;
        window.__plKey = null;
        if (!key) {   // klik lagu di halaman playlist yang sedang terbuka
            const dk = detailKey();
            if (dk && sameSet(songList, shownSongs())) key = dk;
        }
        activeKey = key;
        activeIds = new Set(songList.map((s) => s.id));
        _play(songId, songList);
        if (songOnShuffle && !songOnRepeat) mixCurrentFirst();
        updatePlaylistPlayIcon();
        window.dispatchEvent(new Event('spotiware:activepl'));
    };

    // ikon play/pause di halaman playlist: pause HANYA untuk playlist yang benar-benar diputar
    updatePlaylistPlayIcon = function () {
        const icon = document.querySelector('#playlistPlayBtn i');
        if (icon) {
            const on = !audio.paused && playerBar.classList.contains('show') && !!activeKey && activeKey === detailKey();
            icon.classList.toggle('fa-pause', on);
            icon.classList.toggle('fa-play', !on);
        }
        if (plShuffle) plShuffle.classList.toggle('active', songOnShuffle);
    };

    // tombol Play besar: kalau shuffle menyala, mulai dari lagu ACAK
    if (plPlay) {
        plPlay.addEventListener('click', (e) => {
            e.stopImmediatePropagation();
            const list = shownSongs();
            if (!list.length) return;
            const key = detailKey();
                        if (isActive(key)) { play.click(); return; }
            const first = songOnShuffle ? list[Math.floor(Math.random() * list.length)] : list[0];
            window.__plKey = key;
            playSongFromList(first.id, list);
        }, true);
    }

    // dipakai kotak riwayat beranda
    window.PlayKey = { is: isActive };
    ['play', 'pause', 'playing'].forEach((ev) => audio.addEventListener(ev, () => {
        updatePlaylistPlayIcon();
        window.dispatchEvent(new Event('spotiware:activepl'));
    }));

    // =====================================================
    // 2. LAGU PILIHAN LEBIH CEPAT DIMUAT
    // =====================================================

    // a) durasi lagu di tabel playlist dimuat satu per satu (bukan puluhan sekaligus),
    //    dan berhenti sementara kalau lagu utama sedang buffering
    const durQueue = [];
    let durBusy = false;

    function pumpDurations() {
        if (durBusy || !durQueue.length) return;
        if (!audio.paused && audio.readyState < 3) { setTimeout(pumpDurations, 400); return; }
        const job = durQueue.shift();
        if (!job.cell.isConnected) { pumpDurations(); return; }

        durBusy = true;
        const a = new Audio();
        a.preload = 'metadata';
        let finished = false;
        const finish = () => {
            if (finished) return;
            finished = true;
            clearTimeout(t);
            a.removeAttribute('src');
            a.load();
            durBusy = false;
            pumpDurations();
        };
        const t = setTimeout(() => { job.cell.textContent = '--:--'; finish(); }, 6000);
        a.addEventListener('loadedmetadata', () => {
            durationCache[job.path] = a.duration;
            job.cell.textContent = formatTime(a.duration);
            finish();
        });
        a.addEventListener('error', () => { job.cell.textContent = '--:--'; finish(); });
        a.src = job.path;
    }

    loadTrackDurations = function () {
        durQueue.length = 0;
        document.querySelectorAll('.track-duration[data-song-path]').forEach((cell) => {
            const path = cell.dataset.songPath;
            if (durationCache[path] !== undefined) { cell.textContent = formatTime(durationCache[path]); return; }
            durQueue.push({ cell, path });
        });
        pumpDurations();
    };

    // b) lagu berikutnya baru diunduh setelah lagu yang dipilih siap diputar
    const _preload = preloadNextTrack;
    let preloadWaiting = false;
    preloadNextTrack = function () {
        if (audio.readyState < 3) {
            if (preloadWaiting) return;
            preloadWaiting = true;
            audio.addEventListener('canplay', () => { preloadWaiting = false; _preload(); }, { once: true });
            return;
        }
        _preload();
    };

    // c) kursor di atas lagu (laptop): mulai mengunduh lebih awal
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const pre = new Audio();
        pre.preload = 'auto';
        pre.volume = 0;
        let want = null, timer = null;
        const SEL = '.music-card[data-song-id], .sr-row[data-id], #playlistTrackTableBody tr[data-song-id], .hv-row[data-song-id]';
        const idOf = (el) => parseInt(el.dataset.songId || el.dataset.id);

        document.addEventListener('pointerover', (e) => {
            const el = e.target.closest(SEL);
            if (!el) return;
            const song = songs.find((s) => s.id === idOf(el));
            if (!song || song.songPath === want) return;
            clearTimeout(timer);
            timer = setTimeout(() => {
                if (!audio.paused && audio.readyState < 3) return;   // lagu utama sedang buffering
                want = song.songPath;
                pre.src = song.songPath;
            }, 250);
        });
        document.addEventListener('pointerout', () => clearTimeout(timer));
        audio.addEventListener('playing', () => {      // sudah diputar -> lepas unduhan cadangan
            pre.removeAttribute('src');
            pre.load();
            want = null;
        });
    }

    // =====================================================
    // 3. HP: tombol Back bawaan HP menutup Now Playing layar penuh dengan benar
    // =====================================================
    const panel = document.querySelector('.now-playing-panel');
    if (panel) {
        const mobile = () => typeof isMobileView === 'function' && isMobileView();
        const closePanel = () => {
            panel.classList.remove('mobile-open');
            const bn = document.querySelector('.bottom-nav');
            if (bn) bn.style.display = '';
        };
        let pushed = false;

        // panel dibuka -> catat satu langkah riwayat; ditutup -> hapus langkah itu
        new MutationObserver(() => {
            const open = panel.classList.contains('mobile-open');
            if (open && !pushed && mobile()) { history.pushState({ np: 1 }, ''); pushed = true; }
            else if (!open && pushed) { pushed = false; if (history.state && history.state.np) history.back(); }
        }).observe(panel, { attributes: true, attributeFilter: ['class'] });

        // Back HP pertama kali hanya keluar dari layar penuh -> tutup panelnya juga
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement && panel.classList.contains('mobile-open')) closePanel();
        });

        // Back HP ketika tidak sedang layar penuh
        window.addEventListener('popstate', () => {
            if (panel.classList.contains('mobile-open')) {
                if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
                pushed = false;
                closePanel();
            }
        });
    }
})();