// nav-history.js — laptop: tombol back/forward di bar atas + tampilan tetap setelah refresh
(function () {
    const KEY = 'spotiware_nav';
    const STORE = sessionStorage;     // ganti ke localStorage supaya tampilan juga diingat setelah tab ditutup
    const q = s => document.querySelector(s);
    const shown = s => { const e = q(s); return !!(e && e.classList.contains('show')); };
    const dsOf = (s, k, d) => { const e = q(s); return (e && e.dataset[k]) || d; };
    const mobile = () => typeof isMobileView === 'function' && isMobileView();

    let stack = [], idx = 0, restoring = true, started = false, lastSig = '', uid = 'guest', btnB = null, btnF = null;

    function injectStyle() {
        const css = document.createElement('style');
        css.textContent = `
            .nav-bf{display:flex;gap:.4rem;margin-left:.5rem;flex-shrink:0}
            .nbf-btn{width:2.4rem;height:2.4rem;border-radius:50%;border:none;background:#1f1f1f;color:#b3b3b3;font-size:.95rem;
                display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.2s}
            .nbf-btn:hover:not(:disabled){color:#000;background:var(--yellow,#FFD700);transform:scale(1.05)}
            .nbf-btn:disabled{opacity:.35;cursor:default}
            body.ambient-on .nbf-btn,body.has-wallpaper .nbf-btn{background:rgba(31,31,31,var(--card-alpha,.68));border:1px solid rgba(255,255,255,.85)}
            @media (max-width:768px),(hover:none) and (pointer:coarse){.nav-bf{display:none}}
        `;
        document.head.appendChild(css);
    }

    function buildButtons() {
        const wrap = document.createElement('div');
        wrap.className = 'nav-bf';
        wrap.innerHTML = `
            <button type="button" class="nbf-btn" id="nbfBack" title="Go back" disabled><i class="fa-solid fa-chevron-left"></i></button>
            <button type="button" class="nbf-btn" id="nbfFwd" title="Go forward" disabled><i class="fa-solid fa-chevron-right"></i></button>`;
        q('.left-half').insertBefore(wrap, q('.home-icon'));
        btnB = wrap.querySelector('#nbfBack');
        btnF = wrap.querySelector('#nbfFwd');
        btnB.addEventListener('click', () => history.back());
        btnF.addEventListener('click', () => history.forward());
    }

    const updateBtns = () => {
        if (!btnB) return;
        btnB.disabled = idx <= 0;
        btnF.disabled = idx >= stack.length - 1;
    };
    const save = () => { try { STORE.setItem(KEY, JSON.stringify({ uid, stack, idx })); } catch (e) { } };

    // ---- halaman apa yang sedang tampil? ----
    function current() {
        if (shown('.settings-view')) return { v: 'settings' };
        if (shown('.history-view')) return { v: 'history' };
        if (shown('.fl-view')) return { v: 'me' };
        if (shown('.user-profile')) return { v: 'user', uid: dsOf('.user-profile', 'uid', '') };
        if (shown('.profile-view:not(.user-profile)')) return { v: 'me' };
        if (shown('#playlistDetailView')) {
            const id = String(typeof pdCurrentPlaylistId !== 'undefined' ? pdCurrentPlaylistId : '');
            if (id.startsWith('artist:')) return { v: 'artist', n: id.slice(7) };
            if (id.startsWith('yt:') && window.__ytPage) return { v: 'yt', k: window.__ytPage.kind, id: window.__ytPage.id };
            if (id.startsWith('pub_')) return { v: 'pub', id: id.slice(4) };
            if (id && id !== 'null' && id !== 'undefined') return { v: 'pl', id };
        }
        if (shown('#searchView')) return { v: 'search', q: window.__lastQ || '', c: dsOf('#searchView .sv-chip.active', 'cat', 'all') };
        const yt = document.body.classList.contains('mode-yt');
        const t = yt ? dsOf('#ytHome .yh-chip.on', 't', 'home')
            : document.body.classList.contains('ht-music') ? 'music'
            : document.body.classList.contains('ht-genre') ? 'genre' : 'all';
        return { v: 'home', t, y: yt ? 1 : 0 };
    }

    // ---- tampilkan lagi halaman yang dicatat ----
    async function go(s) {
        restoring = true;
        try {
            if (['me', 'user', 'settings', 'history', 'pub'].includes(s.v) && uid === 'guest') s = { v: 'home', t: 'all', y: 0 };
            const clickMenu = act => q('#profileMenu .pm-item[data-act="' + act + '"]')?.click();

            if (s.v === 'home') {
                try { goHome(); } catch (e) { }
                const yt = document.body.classList.contains('mode-yt');
                if (s.t && (yt ? 1 : 0) === (s.y || 0)) {
                    q(yt ? '#ytHome .yh-chip[data-t="' + s.t + '"]' : '.ht-chip[data-tab="' + s.t + '"]')?.click();
                }
            } else if (s.v === 'pl') {
                const p = getPlaylists().find(x => x.id === s.id);
                if (p) openPlaylistDetailView(p, p.id === LIKED_PLAYLIST_ID); else goHome();
            } else if (s.v === 'artist') {
                if (typeof window.openArtistPage === 'function') window.openArtistPage(s.n);
            } else if (s.v === 'yt') {
                if (window.YTMusic && YTMusic.openPage) await YTMusic.openPage(s.k, s.id);
            } else if (s.v === 'pub') {
                const d = await firebase.firestore().collection('publicPlaylists').doc(s.id).get();
                if (d.exists && window.Social) Social.openPublicPlaylist({ id: d.id, ...d.data() }); else goHome();
            } else if (s.v === 'user') {
                if (window.Social) await Social.openProfile(s.uid);
            } else if (s.v === 'me') clickMenu('profile');
            else if (s.v === 'settings') clickMenu('settings');
            else if (s.v === 'history') clickMenu('history');
            else if (s.v === 'search') {
                if (window.SpotiSearch && SpotiSearch.restore && s.q) SpotiSearch.restore(s.q, s.c); else goHome();
            }
        } catch (e) { console.warn('nav-history:', e); }
        setTimeout(() => {                                   // catat apa yang benar-benar tampil
            const c = current();
            stack[idx] = c;
            lastSig = JSON.stringify(c);
            restoring = false;
            save();
            updateBtns();
        }, 500);
    }

    // ---- catat perpindahan halaman ----
    function tick() {
        if (restoring || mobile()) return;
        const s = current(), sig = JSON.stringify(s);
        if (sig === lastSig) return;
        lastSig = sig;
        const prev = stack[idx];
        // pindah tab Home, atau ganti kategori hasil pencarian yang sama: perbarui entri ini, jangan tambah entri baru
        const same = prev && prev.v === s.v && (s.v === 'home' || (s.v === 'search' && prev.q === s.q));
        if (same) { stack[idx] = s; history.replaceState({ swIdx: idx }, ''); }
        else {
            stack = stack.slice(0, idx + 1);
            stack.push(s);
            idx = stack.length - 1;
            history.pushState({ swIdx: idx }, '');
        }
        save();
        updateBtns();
    }

    window.addEventListener('popstate', e => {
        if (mobile()) return;
        const i = e.state && e.state.swIdx;
        if (typeof i !== 'number' || !stack[i]) return;
        idx = i;
        save();
        go(stack[i]);
        updateBtns();
    });

    function start() {
        let saved = null;
        try { saved = JSON.parse(STORE.getItem(KEY)); } catch (e) { }
        const fromLink = location.hash.startsWith('#share=');
        if (!mobile() && !fromLink && saved && saved.uid === uid && Array.isArray(saved.stack) && saved.stack.length) {
            stack = saved.stack;
            const hi = history.state && history.state.swIdx;
            idx = Math.min(typeof hi === 'number' ? hi : saved.idx, stack.length - 1);
            history.replaceState({ swIdx: idx }, '');
            updateBtns();
            go(stack[idx]);
        } else {
            stack = [current()];
            idx = 0;
            history.replaceState({ swIdx: 0 }, '');
            lastSig = JSON.stringify(stack[0]);
            restoring = false;
            save();
            updateBtns();
        }
    }

    function rebase() {                                     // ganti akun: riwayat dimulai dari awal
        stack = [current()];
        idx = 0;
        history.replaceState({ swIdx: 0 }, '');
        lastSig = JSON.stringify(stack[0]);
        restoring = false;
        save();
        updateBtns();
    }

    function init() {
        if (typeof goHome !== 'function' || typeof openPlaylistDetailView !== 'function' || !window.Social ||
            !window.SpotiSearch || !q('.ht-chip') || !q('.left-half') || !q('.home-icon') || !window.firebase) return setTimeout(init, 300);
        injectStyle();
        buildButtons();
        firebase.auth().onAuthStateChanged(u => {
            uid = u ? u.uid : 'guest';
            if (!started) { started = true; setTimeout(start, 900); }   // tunggu sinkron akun & playlist selesai
            else { restoring = true; setTimeout(rebase, 900); }
        });
        setInterval(tick, 300);
    }
    init();
})();