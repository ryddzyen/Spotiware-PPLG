// mobile-extra.js — HP: chip All|Music|Genre di bar atas, "Go to queue", antrean dengan Shuffle + Timer, back playlist -> hasil pencarian
(function () {
    const mobile = () => typeof isMobileView === 'function' && isMobileView();
    const toast = t => { try { showToast(t); } catch (e) { } };
    const $ = id => document.getElementById(id);

    function injectStyle() {
        const css = document.createElement('style');
        css.textContent = `
            #ctxGoToQueue{display:none}
            @media (max-width:768px),(hover:none) and (pointer:coarse){
                #ctxGoToQueue{display:flex}
                body.m-logged .ht-bar{display:none!important}
                body.m-logged .main-right-part.ht-has-bar{padding-top:.6rem!important}
                body.mode-yt.m-logged #ytHome .yh-chips{display:none}
                .m-nav-chips .mc-chip{white-space:nowrap}
            }
            .qs-foot{display:none;flex-shrink:0;gap:.7rem;padding:.8rem 1rem calc(.8rem + env(safe-area-inset-bottom,0px));background:#1f1f1f;position:relative}
            .qs-foot.show{display:flex}
            .qs-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:.4rem;padding:.9rem 0;background:#2e2e2e;color:#fff;border:none;
                border-radius:8px;font:inherit;font-size:.9rem;cursor:pointer;-webkit-tap-highlight-color:transparent}
            .qs-btn i{font-size:1.4rem}
            .qs-btn.on{color:var(--yellow,#FFD700)}
            .qs-menu{display:none;position:absolute;left:1rem;right:1rem;bottom:calc(100% + .2rem);background:#2e2e2e;border-radius:10px;padding:.4rem 0;
                box-shadow:0 8px 24px rgba(0,0,0,.6);max-height:50vh;overflow-y:auto;z-index:5}
            .qs-menu.show{display:block}
            .qs-opt{padding:.85rem 1.2rem;font-size:1rem;cursor:pointer}
            .qs-opt:active{background:#3a3a3a}
            .qs-opt.on{color:var(--yellow,#FFD700);font-weight:700}
            .sheet-section-title i{margin-right:.5rem}
        `;
        document.head.appendChild(css);
    }

    // ---------- 1. chip All | Music | Genre di bar atas ----------
    function mountChips() {
        const wrap = document.querySelector('.m-nav-chips');
        if (!wrap || !document.querySelector('.ht-chip')) return false;     // tunggu mobile-ui.js & home-tabs.js
        if (wrap.dataset.mc) return true;
        wrap.dataset.mc = '1';
        const isYt = () => document.body.classList.contains('mode-yt');
        const defs = () => isYt() ? [['home', 'Home'], ['genre', 'Genre']] : [['all', 'All'], ['music', 'Music'], ['genre', 'Genre']];
        const activeTab = () => {
            if (isYt()) { const c = document.querySelector('#ytHome .yh-chip.on'); return (c && c.dataset.t) || 'home'; }
            return document.body.classList.contains('ht-music') ? 'music' : document.body.classList.contains('ht-genre') ? 'genre' : 'all';
        };
        let built = '', ytObs = null;
        function sync() {
            const m = isYt() ? 'yt' : 'local';
            if (built !== m) {                                           // mode berganti: bangun ulang chip-nya
                built = m;
                wrap.innerHTML = defs().map(([t, l]) => `<button type="button" class="mn-chip mc-chip" data-tab="${t}">${l}</button>`).join('');
            }
            const yh = document.getElementById('ytHome');
            if (yh && !ytObs) { ytObs = new MutationObserver(sync); ytObs.observe(yh, { childList: true }); }
            const t = activeTab();
            wrap.querySelectorAll('.mc-chip').forEach(c => c.classList.toggle('active', c.dataset.tab === t));
        }
        wrap.addEventListener('click', e => {
            const c = e.target.closest('.mc-chip');
            if (!c) return;
            // sedang di halaman lain (playlist, profil, dll) -> kembali ke beranda dulu
            if (document.querySelector('.main-right-part > .music-section.hide')) { try { goHome(); } catch (err) { } }
            const sel = isYt() ? '#ytHome .yh-chip[data-t="' + c.dataset.tab + '"]' : '.ht-chip[data-tab="' + c.dataset.tab + '"]';
            document.querySelector(sel)?.click();
            sync();
        });
        new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
        sync();
        return true;
    }

    // ---------- 2. menu Create & "Go to queue" ----------
    function tweakMenus() {
        ['createMenuQueue', 'createMenuHistory'].forEach(id => $(id)?.remove());
        const after = $('ctxAddToQueue');
        if (after && !$('ctxGoToQueue')) {
            const it = document.createElement('div');
            it.className = 'context-menu-item';
            it.id = 'ctxGoToQueue';
            it.innerHTML = '<i class="fa-solid fa-list-ol"></i> Go to queue';
            after.insertAdjacentElement('afterend', it);
            it.addEventListener('click', () => {
                try { closeSongContextMenu(); } catch (e) { }
                openMobileSheet('queue');
            });
        }
    }

    // ---------- 3. antrean: tombol Shuffle + Timer ----------
    let foot = null, menu = null, sleepT = null, sleepEnd = false, sleepLabel = '';

    function clearSleep() { clearTimeout(sleepT); sleepT = null; sleepEnd = false; sleepLabel = ''; }
    function fireSleep() {
        try { audio.pause(); } catch (e) { }
        clearSleep();
        toast('Timer selesai, musik dijeda');
        syncFoot();
    }
    // "End of track": jeda tepat sebelum lagu habis
    audio.addEventListener('timeupdate', () => {
        if (sleepEnd && audio.duration && audio.duration - audio.currentTime < 0.6) fireSleep();
    });

    function syncFoot() {
        if (!foot) return;
        let mode = null, sh = false;
        try { mode = mobileSheetMode; } catch (e) { }
        try { sh = songOnShuffle; } catch (e) { }
        const sheet = $('mobileSheet');
        const on = mode === 'queue' && sheet.classList.contains('show');
        foot.classList.toggle('show', on);
        if (!on) menu.classList.remove('show');
        foot.querySelector('#qsShuffle').classList.toggle('on', !!sh);
        foot.querySelector('#qsTimer').classList.toggle('on', !!(sleepT || sleepEnd));
        // ikon shuffle di judul "Shuffling from:"
        const body = $('mobileSheetBody');
        if (body) body.querySelectorAll('.sheet-section-title span:first-child').forEach(sp => {
            if (!sp.querySelector('i') && /Shuffling from/i.test(sp.textContent)) {
                sp.insertAdjacentHTML('afterbegin', '<i class="fa-solid fa-shuffle"></i>');
            }
        });
    }

    function openTimerMenu() {
        const opts = [5, 10, 15, 30, 45, 60];
        menu.innerHTML =
            opts.map(m => `<div class="qs-opt${sleepLabel === m + ' min' ? ' on' : ''}" data-m="${m}">${m} minutes</div>`).join('') +
            `<div class="qs-opt${sleepEnd ? ' on' : ''}" data-m="end">End of track</div>` +
            ((sleepT || sleepEnd) ? '<div class="qs-opt" data-m="off">Turn off timer</div>' : '');
        menu.classList.add('show');
    }

    function buildFoot() {
        const sheet = $('mobileSheet');
        if (!sheet || foot) return;
        foot = document.createElement('div');
        foot.className = 'qs-foot';
        foot.innerHTML = `
            <div class="qs-menu"></div>
            <button type="button" class="qs-btn" id="qsShuffle"><i class="fa-solid fa-shuffle"></i><span>Shuffle</span></button>
            <button type="button" class="qs-btn" id="qsTimer"><i class="fa-solid fa-stopwatch"></i><span>Timer</span></button>`;
        sheet.appendChild(foot);
        menu = foot.querySelector('.qs-menu');

        foot.querySelector('#qsShuffle').addEventListener('click', () => {
            menu.classList.remove('show');
            try { if (shuffle) shuffle.click(); } catch (e) { }
        });
        foot.querySelector('#qsTimer').addEventListener('click', () => {
            if (menu.classList.contains('show')) menu.classList.remove('show'); else openTimerMenu();
        });
        menu.addEventListener('click', e => {
            const o = e.target.closest('.qs-opt');
            if (!o) return;
            const v = o.dataset.m;
            clearSleep();
            if (v === 'off') toast('Timer dimatikan');
            else if (v === 'end') { sleepEnd = true; sleepLabel = 'end'; toast('Musik berhenti di akhir lagu ini'); }
            else { sleepT = setTimeout(fireSleep, parseInt(v) * 60000); sleepLabel = v + ' min'; toast('Timer ' + v + ' menit aktif'); }
            menu.classList.remove('show');
            syncFoot();
        });

        // sheet dibuka / ditutup / digambar ulang -> perbarui bar bawah
        new MutationObserver(syncFoot).observe(sheet, { attributes: true, attributeFilter: ['class'] });
        new MutationObserver(syncFoot).observe($('mobileSheetBody'), { childList: true });
        // shuffle ditekan dari mana pun (player, mini player, bar ini) -> antrean ikut digambar ulang
        try {
            if (shuffle) shuffle.addEventListener('click', () => setTimeout(() => { try { renderMobileSheet(); } catch (e) { } syncFoot(); }, 0));
        } catch (e) { }
    }

    // ---------- 4. tombol back playlist -> hasil pencarian ----------
    let seen = { kind: null, t: 0 }, origin = null;
    function snap() {
        const s = $('searchView'), m = $('msPage');
        if (s && s.classList.contains('show')) seen = { kind: 'results', t: Date.now() };
        else if (m && m.classList.contains('show')) seen = { kind: 'msearch', t: Date.now() };
    }

    function hookBack() {
        const _close = closePlaylistDetailView;
        closePlaylistDetailView = function () { snap(); origin = null; return _close.apply(this, arguments); };

        const _open = openPlaylistDetailView;
        openPlaylistDetailView = function () {
            const already = $('playlistDetailView') && $('playlistDetailView').classList.contains('show');
            if (!already) {                                   // dibuka dari halaman lain: catat asalnya
                snap();
                origin = (mobile() && seen.kind && Date.now() - seen.t < 700) ? seen.kind : null;
            }
            return _open.apply(this, arguments);
        };

        // tangkap klik tombol back (milik halaman playlist maupun bar atas HP) sebelum pemilik aslinya
        document.addEventListener('click', e => {
            if (!mobile() || !origin) return;
            if (!e.target.closest('#playlistDetailBackBtn, .pdm-back')) return;
            const o = origin;
            origin = null;
            e.stopImmediatePropagation();
            e.preventDefault();
            if (o === 'results' && window.SpotiSearch && SpotiSearch.reopen && SpotiSearch.reopen()) return;
            closePlaylistDetailView();                        // halaman Search (kolom kosong) atau hasil tidak bisa dibuka lagi
            document.querySelector('.bottom-nav-item[data-target="search"]')?.click();
        }, true);
    }

    function init() {
        if (typeof openMobileSheet !== 'function' || typeof openPlaylistDetailView !== 'function' ||
            typeof closePlaylistDetailView !== 'function' || !$('mobileSheet')) return setTimeout(init, 300);
        injectStyle();
        tweakMenus();
        buildFoot();
        hookBack();
    }
    init();

    let tries = 0;
    (function tryChips() { if (!mountChips() && ++tries < 30) setTimeout(tryChips, 400); })();
})();