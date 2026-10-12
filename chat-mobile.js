// ===== Obrolan di HP: sembunyikan menu bawah, kolom kirim di atas keyboard, nama diperkecil =====
(() => {
    const mq = window.matchMedia('(max-width: 768px), (hover: none) and (pointer: coarse)');
    const root = document.documentElement;
    const vv = window.visualViewport;
    let host = null, nameEl = null;

    const visible = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);

    // elemen "fixed" terdekat yang membungkus kolom pesan (panel obrolan atau kolom kirim itu sendiri)
    function fixedAncestor(el) {
        for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
            if (getComputedStyle(n).position === 'fixed') return n;
        }
        return null;
    }

    // cari teks nama di header obrolan
    function findName(name) {
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
        let n;
        while ((n = w.nextNode())) {
            if (n.children.length === 0 && n.tagName !== 'INPUT' && n.tagName !== 'TEXTAREA' &&
                n.textContent.trim() === name && n.getBoundingClientRect().top < 220 && visible(n)) return n;
        }
        return null;
    }

    function clear() {
        document.body.classList.remove('chat-open');
        if (host) { host.classList.remove('chat-host'); host = null; }
        if (nameEl) { nameEl.classList.remove('chat-name-sm'); nameEl = null; }
    }

    function update() {
        if (!mq.matches) { clear(); return; }
        const input = [...document.querySelectorAll('input[placeholder^="Message @"], textarea[placeholder^="Message @"]')].find(visible);
        if (!input) { clear(); return; }

        if (!document.body.classList.contains('chat-open')) document.body.classList.add('chat-open');

        const h = fixedAncestor(input);
        if (h !== host) {
            if (host) host.classList.remove('chat-host');
            host = h;
            if (host && !host.classList.contains('chat-host')) host.classList.add('chat-host');
        }

        const name = input.placeholder.replace(/^Message @/, '').trim();
        if (!nameEl || !nameEl.isConnected || nameEl.textContent.trim() !== name) {
            if (nameEl) nameEl.classList.remove('chat-name-sm');
            nameEl = findName(name);
            if (nameEl && !nameEl.classList.contains('chat-name-sm')) nameEl.classList.add('chat-name-sm');
        }
    }

    // tinggi keyboard -> variabel CSS --kb
    function updateKb() {
        const k = vv ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
        root.style.setProperty('--kb', k + 'px');
    }
    if (vv) {
        vv.addEventListener('resize', updateKb);
        vv.addEventListener('scroll', updateKb);
    }
    updateKb();

    let raf = null;
    new MutationObserver(() => {
        if (raf) return;
        raf = requestAnimationFrame(() => { raf = null; update(); });
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden'] });

    mq.addEventListener('change', update);
    update();
})();