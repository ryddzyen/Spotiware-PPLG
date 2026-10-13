// ===== mobile-drawer.js : menu profil ala Spotify untuk HP =====
(() => {
    const mq = window.matchMedia('(max-width: 768px), (hover: none) and (pointer: coarse)');
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    const back = document.createElement('div');
    back.className = 'md-backdrop';
    const drawer = document.createElement('aside');
    drawer.className = 'md-drawer';
    document.body.append(back, drawer);

    async function fill() {
        const u = firebase.auth().currentUser;
        if (!u) return false;
        let d = null;
        try { d = window.SpotiProfile ? await SpotiProfile.data() : null; } catch (_) {}
        const name = d ? d.name : (u.displayName || 'User');
        const photo = d && d.photo;
        drawer.innerHTML = `
            <div class="md-head" data-act="profile">
                <div class="md-avatar">${photo ? `<img src="${esc(photo)}" alt="">` : '<i class="fa-solid fa-user"></i>'}</div>
                <div class="md-who">
                    <div class="md-name">${esc(name)}</div>
                    <div class="md-sub">View profile</div>
                </div>
            </div>
            <div class="md-item" data-act="history"><i class="fa-solid fa-clock-rotate-left"></i><span>Recents</span></div>
            <div class="md-item" data-act="settings"><i class="fa-solid fa-gear"></i><span>Settings</span></div>
            <div class="md-item" data-act="logout"><i class="fa-solid fa-right-from-bracket"></i><span>Log out</span></div>`;
        return true;
    }

    async function open() {
        if (!(await fill())) return;
        back.classList.add('show');
        drawer.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    function close() {
        back.classList.remove('show');
        drawer.classList.remove('show');
        document.body.style.overflow = '';
    }

    // cegat ketukan foto profil (hanya di HP)
    document.addEventListener('click', (e) => {
        if (!mq.matches || !e.target.closest('#profileAvatarBtn')) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        open();
    }, true);

    back.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    firebase.auth().onAuthStateChanged(close);

    drawer.addEventListener('click', (e) => {
        const it = e.target.closest('[data-act]');
        if (!it) return;
        const act = it.dataset.act;
        close();
        if (act === 'logout') { firebase.auth().signOut(); return; }
        // pakai menu profil lama yang tersembunyi, jadi semua fungsinya tetap sama
        const old = document.querySelector('#profileMenu .pm-item[data-act="' + act + '"]');
        if (old) old.click();
    });
})();