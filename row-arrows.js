// row-arrows.js — panah geser kiri/kanan untuk semua baris di tab All, Music, Genre
(function () {
    const SEL = ['#htAllView', '#htMusicView', '#htGenreView']
        .flatMap(v => [v + ' .songs', v + ' .hm-scroll']).join(',');

    function injectStyle() {
        const css = document.createElement('style');
        css.textContent = `
            .ra-host{position:relative}
            .ra-btn{position:absolute;top:42%;transform:translateY(-50%);z-index:5;width:38px;height:38px;border-radius:50%;
                border:none;background:rgba(18,18,18,.88);color:#fff;display:none;align-items:center;justify-content:center;
                cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.55)}
            .ra-btn:hover{background:#000;transform:translateY(-50%) scale(1.06)}
            .ra-btn.l{left:6px}.ra-btn.r{right:6px}
            @media (hover:none){.ra-btn{display:none!important}}
        `;
        document.head.appendChild(css);
    }

    function hostOf(sc) {
        if (sc.classList.contains('songs') && sc.closest('.songs-wrapper')) return sc.closest('.songs-wrapper');
        if (sc.parentElement && sc.parentElement.classList.contains('ra-wrap')) return sc.parentElement;
        const w = document.createElement('div');
        w.className = 'ra-wrap';
        sc.parentNode.insertBefore(w, sc);
        w.appendChild(sc);
        return w;
    }

    function mkBtn(side) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ra-btn ' + side;
        b.innerHTML = `<i class="fa-solid fa-chevron-${side === 'l' ? 'left' : 'right'}"></i>`;
        return b;
    }

    function attach(sc) {
        if (sc.dataset.ra) return;
        sc.dataset.ra = '1';
        const host = hostOf(sc);
        host.classList.add('ra-host');
        const prev = mkBtn('l'), next = mkBtn('r');
        host.append(prev, next);

        const step = () => Math.max(sc.clientWidth * 0.8, 300);
        prev.addEventListener('click', () => sc.scrollBy({ left: -step(), behavior: 'smooth' }));
        next.addEventListener('click', () => sc.scrollBy({ left: step(), behavior: 'smooth' }));

        const upd = () => {
            const max = sc.scrollWidth - sc.clientWidth;
            prev.style.display = sc.scrollLeft > 4 ? 'flex' : 'none';
            next.style.display = (max > 4 && sc.scrollLeft < max - 4) ? 'flex' : 'none';
        };
        sc.addEventListener('scroll', upd, { passive: true });
        new ResizeObserver(upd).observe(sc);
        new MutationObserver(upd).observe(sc, { childList: true });
        sc.addEventListener('load', upd, true);   // gambar selesai dimuat -> lebar berubah
        upd();
    }

    function scan() { document.querySelectorAll(SEL).forEach(attach); }

    function init() {
        if (!document.getElementById('htAllView') && !document.getElementById('htMusicView')) return setTimeout(init, 300);
        injectStyle();
        scan();
        let t = null;
        new MutationObserver(() => { clearTimeout(t); t = setTimeout(scan, 100); })
            .observe(document.body, { childList: true, subtree: true });
    }

    init();
})();