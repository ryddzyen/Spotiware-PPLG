// play-icons.js — sinkronkan ikon play/pause di SEMUA kartu lagu (Music, All, Genre, Show all, dll)
(function () {
    function sync() {
        if (typeof audio === 'undefined' || typeof getCurrentSong !== 'function') return;
        const cur = playerBar.classList.contains('show') ? getCurrentSong().id : null;
        const playing = !audio.paused;

        document.querySelectorAll('.music-card[data-song-id]').forEach(card => {
            const isCur = cur !== null && parseInt(card.dataset.songId) === cur;
            const icon = card.querySelector('.music-play-btn i');
            if (icon) {
                const showPause = isCur && playing;
                icon.classList.toggle('fa-circle-pause', showPause);
                icon.classList.toggle('fa-circle-play', !showPause);
            }
            card.classList.toggle('is-current', isCur);
        });
    }

    function init() {
        if (typeof audio === 'undefined' || typeof playerBar === 'undefined') return setTimeout(init, 300);

        ['play', 'playing', 'pause', 'ended', 'loadstart'].forEach(ev => audio.addEventListener(ev, sync));

        // kartu yang baru dibuat / dirender ulang ikut disinkronkan
        let timer = null;
        const root = document.querySelector('.main-right-part') || document.body;
        new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(sync, 60); })
            .observe(root, { childList: true, subtree: true });

        // tombol play ikut tampil terus di kartu yang sedang diputar
        const css = document.createElement('style');
        css.textContent = '.music-card.is-current .music-play-btn{opacity:1}';
        document.head.appendChild(css);

        sync();
    }

    init();
})();