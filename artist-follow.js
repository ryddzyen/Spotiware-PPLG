// artist-follow.js — Follow artis: tombol di hasil pencarian & halaman artis, tampil di Your Library
(function () {
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const uid = () => (typeof accountUid !== 'undefined' && accountUid) ? accountUid : 'guest';
    const KEY = () => 'spotiware_follow_artists:' + uid();

    const getList = () => { try { return JSON.parse(localStorage.getItem(KEY())) || []; } catch (e) { return []; } };
    const saveList = l => { try { localStorage.setItem(KEY(), JSON.stringify(l)); } catch (e) { } };
    const isF = n => getList().some(x => x.n === n);

    function toggle(n) {
        let l = getList();
        const was = l.some(x => x.n === n);
        l = was ? l.filter(x => x.n !== n) : [{ n, t: Date.now() }, ...l];
        saveList(l);
        if (typeof showToast === 'function') showToast(was ? 'Removed from Your Library' : 'Added to Your Library');
        syncButtons();
        patchLibrary();
    }

    function imgOf(name) {
        const p = (window.ARTIST_PHOTOS || {})[name];
        if (p) return p;
        const s = visibleSongs.find(v => (v.artists || String(v.songDes || '').split(',').map(x => x.trim())).includes(name));
        return s ? s.songImage : 'img/pplglogo.png';
    }

    function injectStyle() {
        const css = document.createElement('style');
        css.textContent = `
            .af-btn{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.45);border-radius:2rem;padding:.4rem 1rem;
                font:inherit;font-size:.82rem;font-weight:700;cursor:pointer;flex:0 0 auto}
            .af-btn:hover{border-color:#fff;transform:scale(1.04)}
            .af-btn.on{border-color:#fff;background:rgba(255,255,255,.12)}
            #svList .sv-item .af-btn{margin-left:auto}
            #svList .sv-card .af-btn{margin-top:.6rem}
            #svList .sv-top .af-btn{position:absolute;top:1rem;right:1rem}
            .af-page{display:none}
            body.artist-page .af-page{display:inline-flex;align-items:center;margin-left:.4rem}
            .af-lib .playlist-thumb{border-radius:50%}
        `;
        document.head.appendChild(css);
    }

    // ---------- tombol di hasil pencarian ----------
    function btnHTML(name) {
        const f = isF(name);
        return `<button type="button" class="af-btn${f ? ' on' : ''}" data-artist="${esc(name)}">${f ? 'Following' : 'Follow'}</button>`;
    }

    function decorate() {
        document.querySelectorAll('#svList .sv-item[data-kind="artist"], #svList .sv-card[data-kind="artist"], #svList .sv-top.artist')
            .forEach(el => {
                if (el.querySelector('.af-btn') || !el.dataset.name) return;
                el.insertAdjacentHTML('beforeend', btnHTML(el.dataset.name));
            });
    }

    function syncButtons() {
        document.querySelectorAll('.af-btn').forEach(b => {
            const f = isF(b.dataset.artist);
            b.classList.toggle('on', f);
            b.textContent = f ? 'Following' : 'Follow';
        });
    }

    // klik tombol: jangan ikut membuka halaman artis
    document.addEventListener('click', e => {
        const b = e.target.closest('.af-btn');
        if (b) {
            e.stopPropagation();
            e.preventDefault();
            toggle(b.dataset.artist);
            return;
        }
        // klik baris artis di Your Library -> halaman artis
        const row = e.target.closest('.af-lib');
        if (row) {
            e.stopPropagation();
            if (typeof window.openArtistPage === 'function') window.openArtistPage(row.dataset.artist);
        }
    }, true);

    // ---------- Your Library ----------
    function rowHTML(x) {
        return `
            <div class="history-item playlist-item af-lib" data-artist="${esc(x.n)}">
                <img class="playlist-thumb" src="${esc(imgOf(x.n))}" alt="">
                <div class="history-info">
                    <div class="history-title">${esc(x.n)}</div>
                    <div class="history-artist">Artist</div>
                </div>
            </div>`;
    }

    function wanted() {
        let l = getList();
        if (typeof libraryFilterQuery === 'string' && libraryFilterQuery) {
            l = l.filter(x => x.n.toLowerCase().includes(libraryFilterQuery));
        }
        return l;
    }

    function patchLibrary() {
        const el = document.getElementById('playlistList');
        if (!el) return;
        el.querySelectorAll('.af-lib').forEach(n => n.remove());
        const l = wanted();
        if (!l.length) return;
        const html = l.map(rowHTML).join('');
        const liked = el.querySelector('.liked-songs');
        if (liked) liked.insertAdjacentHTML('afterend', html);
        else el.insertAdjacentHTML('afterbegin', html);
    }

    // ---------- tombol di halaman artis ----------
    function pageButton(name) {
        const tb = document.querySelector('.playlist-detail-toolbar');
        if (!tb) return;
        let b = tb.querySelector('.af-page');
        if (!b) {
            b = document.createElement('button');
            b.type = 'button';
            b.className = 'af-btn af-page';
            const sh = document.getElementById('playlistShuffleBtn');
            if (sh) sh.insertAdjacentElement('afterend', b); else tb.appendChild(b);
        }
        b.dataset.artist = name;
        const f = isF(name);
        b.classList.toggle('on', f);
        b.textContent = f ? 'Following' : 'Follow';
    }

    function hookArtistPage() {
        if (typeof window.openArtistPage !== 'function') return setTimeout(hookArtistPage, 300);
        const orig = window.openArtistPage;
        window.openArtistPage = function (name) {
            const r = orig.apply(this, arguments);
            pageButton(name);
            return r;
        };
    }

    function init() {
        if (typeof window.renderPlaylistList !== 'function' || typeof visibleSongs === 'undefined') return setTimeout(init, 300);
        injectStyle();

        // setiap Your Library dirender ulang, tambahkan artis yang di-follow
        const orig = window.renderPlaylistList;
        window.renderPlaylistList = function () {
            const r = orig.apply(this, arguments);
            patchLibrary();
            return r;
        };
        patchLibrary();
        hookArtistPage();

        // jaga-jaga kalau file lain merender ulang daftar / hasil pencarian
        let t = null;
        new MutationObserver(() => {
            clearTimeout(t);
            t = setTimeout(() => {
                decorate();
                const el = document.getElementById('playlistList');
                if (el && el.querySelectorAll('.af-lib').length !== wanted().length) patchLibrary();
            }, 80);
        }).observe(document.body, { childList: true, subtree: true });

        window.addEventListener('spotiware:account-changed', () => { patchLibrary(); syncButtons(); });
        decorate();
    }

    init();
})();