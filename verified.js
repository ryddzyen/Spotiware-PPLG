// ===== verified.js : centang kuning untuk akun terverifikasi =====
(() => {
    const db = firebase.firestore();
    const BADGE = '<span class="vf-badge" title="Verified"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#FFD700"/><path d="M7 12.5l3.2 3.2L17 8.8" fill="none" stroke="#000" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';

    let ids = new Set();

    async function load() {
        try {
            const snap = await db.collection('verified').get();
            ids = new Set(snap.docs.map((d) => d.id));
        } catch (_) { ids = new Set(); }
        decorate();
    }

    function addBadge(el) {
        if (el && !el.querySelector('.vf-badge')) el.insertAdjacentHTML('beforeend', BADGE);
    }

    function decorate() {
        const me = firebase.auth().currentUser;
        if (me && ids.has(me.uid)) addBadge(document.getElementById('profileName'));

        // [elemen baris, atribut uid, elemen nama di dalamnya]
        [
            ['.sv-item[data-kind="profile"], .sv-card[data-kind="profile"]', 'id', '.sv-item-title, .sv-card-title'],
            ['.sd-prof[data-uid]', 'uid', '.sv-item-title'],
            ['.fv-row[data-uid]', 'uid', '.fv-name'],
            ['.msg-row[data-chat]', 'chat', '.msg-name'],
            ['.msg-row[data-prof]', 'prof', '.msg-name'],
            ['.msg-note[data-chat]', 'chat', '.msg-note-name'],
            ['.dm-msg[data-uid]', 'uid', '.dm-meta b'],
            ['.user-profile[data-uid]', 'uid', '#upName'],
            ['.dm-head[data-uid]', 'uid', '.dm-name']
        ].forEach(([rows, attr, name]) => {
            document.querySelectorAll(rows).forEach((row) => {
                if (ids.has(row.dataset[attr])) addBadge(row.querySelector(name));
            });
        });
    }

    // render ulang saat tampilan berubah (nama profil ditulis ulang, hasil search baru, dll)
    let raf = null;
    new MutationObserver(() => {
        if (raf) return;
        raf = requestAnimationFrame(() => { raf = null; decorate(); });
    }).observe(document.body, { childList: true, subtree: true });

    firebase.auth().onAuthStateChanged(load);
})();