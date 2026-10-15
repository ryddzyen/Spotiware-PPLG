// ===== playlist-mobile.js : halaman playlist di HP ala Spotify =====
(() => {
    const view = document.getElementById('playlistDetailView');
    const header = view && view.querySelector('.playlist-detail-header');
    if (!view || !header) return;

    const $ = (id) => document.getElementById(id);
    const mobile = () => typeof isMobileView === 'function' && isMobileView();

    const bar = document.createElement('div');
    bar.className = 'pdm-bar';
    bar.innerHTML = `
        <button type="button" class="pdm-back" title="Back"><i class="fa-solid fa-arrow-left"></i></button>
        <div class="pdm-title"></div>
        <button type="button" class="pdm-play" title="Play"><i class="fa-solid fa-play"></i></button>`;
    document.body.appendChild(bar);
    const titleEl = bar.querySelector('.pdm-title');
    const playI = bar.querySelector('.pdm-play i');

    bar.querySelector('.pdm-back').addEventListener('click', () => $('playlistDetailBackBtn')?.click());
    bar.querySelector('.pdm-play').addEventListener('click', () => $('playlistPlayBtn')?.click());

    let raf = null;
    function update() {
        raf = null;
        const on = mobile() && view.classList.contains('show');
        document.body.classList.toggle('pdm-on', on);
        if (!on) {
            header.style.removeProperty('--pd-p');
            bar.style.removeProperty('--pd-bar');
            bar.classList.remove('solid');
            return;
        }
        titleEl.textContent = $('playlistDetailTitle').textContent;

        const cover = $('playlistDetailCover');
        const h = (cover && cover.offsetHeight) || 200;
        const y = Math.max(window.scrollY || 0, 0);
        const p = Math.min(1, y / (h * 0.85));                       // 0 = di atas, 1 = cover sudah hilang
        header.style.setProperty('--pd-p', p.toFixed(3));
        bar.style.setProperty('--pd-bar', Math.min(1, Math.max(0, (p - 0.55) / 0.45)).toFixed(3));
        bar.classList.toggle('solid', p > 0.92);

        const src = $('playlistPlayBtn') && $('playlistPlayBtn').querySelector('i');
        if (src) playI.className = src.className;                   // ikon play / pause ikut tombol utama
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(update); };

    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    ['play', 'pause', 'playing'].forEach((ev) => audio.addEventListener(ev, kick));
    window.addEventListener('spotiware:activepl', kick);
    new MutationObserver(kick).observe(view, { attributes: true, attributeFilter: ['class'] });
    new MutationObserver(kick).observe($('playlistDetailTitle'), { childList: true, characterData: true, subtree: true });
    const pb = $('playlistPlayBtn');
    if (pb) new MutationObserver(kick).observe(pb, { attributes: true, subtree: true, attributeFilter: ['class'] });
    kick();
})();