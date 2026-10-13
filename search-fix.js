// ===== search-fix.js : rekomendasi pencarian di HP menempel di bawah search bar =====
(() => {
    const mq = window.matchMedia('(max-width: 768px), (hover: none) and (pointer: coarse)');
    const nav = document.querySelector('nav');
    const dd = document.querySelector('.search-dropdown');
    if (!dd || !nav) return;

    function place() {
        if (!mq.matches || !dd.classList.contains('show')) return;
        dd.style.top = Math.max(0, nav.getBoundingClientRect().bottom) + 'px';
    }

    function sync() {
        const open = mq.matches && dd.classList.contains('show');
        if (open) {
            window.scrollTo(0, 0);                 // search bar kembali ke atas dulu
            document.body.classList.add('sd-lock'); // lalu halaman di belakangnya dikunci
            place();
        } else {
            document.body.classList.remove('sd-lock');
        }
    }

    new MutationObserver(sync).observe(dd, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('scroll', place, { passive: true });
    window.addEventListener('resize', place);
    if (window.visualViewport) {
        visualViewport.addEventListener('resize', place);
        visualViewport.addEventListener('scroll', place);
    }
    mq.addEventListener('change', sync);
})();