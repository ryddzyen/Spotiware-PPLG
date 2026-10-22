// artist-photos-apply.js — pakai foto dari window.ARTIST_PHOTOS di semua tampilan artis
(function () {
    const photo = n => (window.ARTIST_PHOTOS || {})[n] || null;

    function setImg(img, name) {
        const p = photo(name);
        if (!p || img.getAttribute('src') === p) return;
        if (!img.dataset.orig) img.dataset.orig = img.getAttribute('src') || '';
        img.onerror = () => { img.onerror = null; img.src = img.dataset.orig; };   // foto hilang -> kembali ke cover
        img.src = p;
    }

    function apply() {
        document.querySelectorAll('.hm-artist[data-artist] img, .hm-more-head[data-artist] img').forEach(img =>
            setImg(img, img.closest('[data-artist]').dataset.artist));
        document.querySelectorAll('.ob-artist[data-a] img').forEach(img =>
            setImg(img, img.closest('[data-a]').dataset.a));
    }

    function hookPage() {
        if (typeof window.openArtistPage !== 'function') return setTimeout(hookPage, 300);
        const orig = window.openArtistPage;
        window.openArtistPage = function (name) {
            orig.apply(this, arguments);
            const img = document.querySelector('#playlistDetailCover img');
            if (img) setImg(img, name);
        };
    }

    apply();
    hookPage();
    let t = null;
    new MutationObserver(() => { clearTimeout(t); t = setTimeout(apply, 80); })
        .observe(document.body, { childList: true, subtree: true });
})();