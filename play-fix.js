// ===== play-fix.js : shuffle playlist yang benar + lagu pilihan lebih cepat dimuat =====
(() => {
    const $ = (id) => document.getElementById(id);

    // =====================================================
    // 1. SHUFFLE
    // =====================================================
    const shuffleBtn = $('shuffle');
    const plShuffle = $('playlistShuffleBtn');

    // lagu yang sedang diputar jadi urutan pertama, sisanya diacak
    // -> SEMUA lagu playlist terputar dulu sebelum autoplay pindah ke lagu lain
    function mixCurrentFirst() {
        const cur = getCurrentSong();
        order = [cur, ...shuffleSongs(order.filter((s) => s.id !== cur.id))];
        currentIndex = 0;
        preloadedPath = null;
        try { renderQueuePanel(); renderMobileSheet(); } catch (e) {}
    }

    // jalan SETELAH handler shuffle bawaan (script.js), jadi berlaku untuk semua tombol shuffle
    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', () => {
            if (songOnShuffle && !songOnRepeat && playerBar.classList.contains('show')) mixCurrentFirst();
        });
    }

    // shuffle sedang menyala lalu memutar playlist / lagu lain -> urutannya ikut diacak
    const _play = playSongFromList;
    playSongFromList = function (songId, songList) {
        _play(songId, songList);
        if (songOnShuffle && !songOnRepeat) mixCurrentFirst();
    };

    // lagu yang sedang tampil di halaman playlist
    function shownSongs() {
        return [...document.querySelectorAll('#playlistTrackTableBody tr[data-song-id]')]
            .map((r) => songs.find((s) => s.id === parseInt(r.dataset.songId)))
            .filter(Boolean);
    }
    const sameSet = (a, b) => a.length === b.length && b.every((s) => a.some((x) => x.id === s.id));

    // tombol shuffle di samping play (dipasang di fase capture supaya mengalahkan handler lama)
    if (plShuffle) {
        plShuffle.addEventListener('click', (e) => {
            e.stopImmediatePropagation();
            const list = shownSongs();
            if (!list.length) { showToast('This playlist is empty'); return; }

            // playlist ini sedang diputar -> cukup nyalakan / matikan shuffle
            const active = playerBar.classList.contains('show') && sameSet(currentContextList, list);
            if (active) { shuffleBtn.click(); return; }

            // belum diputar -> mulai dari lagu ACAK di dalam playlist, shuffle menyala
            const pick = list[Math.floor(Math.random() * list.length)];
            playSongFromList(pick.id, list);
            if (!songOnShuffle) shuffleBtn.click();
        }, true);
    }

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
})();