// Sembunyikan kursor custom saat pointer di atas scrollbar bawaan browser / pemilih warna
(() => {
    const body = document.body;
    const root = document.documentElement;
    let pickerOpenedAt = 0;

    const hide = () => body.classList.add('cursor-hide-sprite');
    const show = () => body.classList.remove('cursor-hide-sprite');

    // pointer berada di area scrollbar sebuah elemen?
    function overElementScrollbar(e) {
        let el = e.target;
        while (el && el.nodeType === 1 && el !== root) {
            const r = el.getBoundingClientRect();
            const sbw = el.offsetWidth - el.clientLeft * 2 - el.clientWidth;    // lebar scrollbar vertikal
            const sbh = el.offsetHeight - el.clientTop * 2 - el.clientHeight;   // tinggi scrollbar horizontal
            if (sbw > 0 && e.clientX >= r.right - el.clientLeft - sbw - 1 && e.clientX <= r.right) return true;
            if (sbh > 0 && e.clientY >= r.bottom - el.clientTop - sbh - 1 && e.clientY <= r.bottom) return true;
            el = el.parentElement;
        }
        return false;
    }

    // pointer berada di area scrollbar jendela (halaman)?
    function overViewportScrollbar(e) {
        return e.clientX >= root.clientWidth || e.clientY >= root.clientHeight;
    }

    function onMove(e) {
        if (overViewportScrollbar(e) || overElementScrollbar(e)) hide();
        else show();

        // pemilih warna sudah tertutup -> kursor custom kembali
        if (body.classList.contains('cursor-picker') && Date.now() - pickerOpenedAt > 800) {
            body.classList.remove('cursor-picker');
        }
    }
    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('pointermove', onMove, true);

    // scrollbar jendela tidak mengirim mousemove, tapi pointer dianggap "keluar" dari halaman
    document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) hide(); }, true);
    root.addEventListener('mouseleave', hide);
    window.addEventListener('blur', hide);
    window.addEventListener('focus', show);

    // pemilih warna (Primary / Accent / warna nama)
    document.addEventListener('click', (e) => {
        if (e.target.closest('input[type="color"], .pfe-swatch')) {
            pickerOpenedAt = Date.now();
            body.classList.add('cursor-picker');
        }
    }, true);
    document.addEventListener('input', (e) => {
        if (e.target.matches('input[type="color"]')) body.classList.add('cursor-picker');
    }, true);
    document.addEventListener('change', (e) => {
        if (e.target.matches('input[type="color"]')) body.classList.remove('cursor-picker');
    }, true);
})();