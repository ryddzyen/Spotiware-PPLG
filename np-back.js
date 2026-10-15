// ===== np-back.js : tombol Back HP menutup Now Playing layar penuh dengan benar =====
(() => {
    const panel = document.querySelector('.now-playing-panel');
    if (!panel) return;
    const mobile = () => typeof isMobileView === 'function' && isMobileView();
    const isOpen = () => panel.classList.contains('mobile-open');
    let pushed = false, fromPop = false;

    function closePanel() {
        panel.classList.remove('mobile-open');
        const bn = document.querySelector('.bottom-nav');
        if (bn) bn.style.display = '';
    }

    // panel dibuka -> catat 1 langkah riwayat; ditutup -> hapus langkah itu
    new MutationObserver(() => {
        if (isOpen()) {
            if (!pushed && mobile()) { history.pushState({ np: 1 }, ''); pushed = true; }
        } else if (pushed) {
            pushed = false;
            if (fromPop) fromPop = false;
            else if (history.state && history.state.np) history.back();
        }
    }).observe(panel, { attributes: true, attributeFilter: ['class'] });

    // Back HP pertama kali hanya keluar dari layar penuh -> tutup panelnya juga
    const onFs = () => {
        const fs = document.fullscreenElement || document.webkitFullscreenElement;
        if (!fs && isOpen() && mobile()) closePanel();
    };
    document.addEventListener('fullscreenchange', onFs);
    document.addEventListener('webkitfullscreenchange', onFs);

    // Back HP saat tidak sedang layar penuh
    window.addEventListener('popstate', () => {
        if (!isOpen()) return;
        fromPop = true;
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        closePanel();
    });
})();