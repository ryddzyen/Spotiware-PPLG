// ===== link-guard.js : playlist dari link tidak tertutup oleh proses login otomatis =====
(() => {
    const p = new URLSearchParams(location.search);
    if (!p.get('playlist') && !location.hash.startsWith('#share=')) return;   // hanya untuk halaman yang dibuka dari link

    let guard = true;
    const stop = () => { guard = false; };
    ['pointerdown', 'keydown', 'touchstart'].forEach((ev) =>
        window.addEventListener(ev, stop, { once: true, capture: true }));
    setTimeout(stop, 10000);

    const shown = () => {
        const v = document.getElementById('playlistDetailView');
        return !!v && v.classList.contains('show');
    };

    ['closePlaylistDetailView', 'closeShowAllView', 'goHome'].forEach((name) => {
        const orig = window[name];
        if (typeof orig !== 'function') return;
        window[name] = function (...args) {
            if (guard && shown()) return;      // abaikan penutupan otomatis
            return orig.apply(this, args);
        };
    });
})();