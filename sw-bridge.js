// ===== sw-bridge.js : beri tahu service worker lagu mana yang sudah didengarkan =====
(() => {
    if (!('serviceWorker' in navigator)) return;
    if (['localhost', '127.0.0.1'].includes(location.hostname)) return;   // service worker tidak aktif di localhost

    const sent = new Set();
    let timer = null;

    const send = (url) => navigator.serviceWorker.ready
        .then((reg) => { if (reg.active) reg.active.postMessage({ type: 'cache-song', url }); })
        .catch(() => {});

    audio.addEventListener('playing', () => {
        clearTimeout(timer);
        const src = audio.currentSrc;
        if (!src || sent.has(src)) return;
        // baru disimpan kalau benar-benar didengarkan (8 detik)
        timer = setTimeout(() => {
            if (!audio.paused && audio.currentSrc === src) { sent.add(src); send(src); }
        }, 8000);
    });
    audio.addEventListener('pause', () => clearTimeout(timer));
    audio.addEventListener('emptied', () => clearTimeout(timer));
})();