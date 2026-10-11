// ===== mobile-ui.js : bar atas ala Spotify (sudah login) + Library HP =====
// Pasang setelah mobile.js:  <script src="mobile-ui.js" defer></script>
(() => {
    const left = document.querySelector('.left-half');
    if (!left || typeof firebase === 'undefined') return;

    // ---------- elemen di bar atas (ditampilkan lewat CSS di friends.css) ----------
    left.insertAdjacentHTML('beforeend', `
        <div class="m-nav-chips"><button type="button" class="mn-chip active">All</button></div>
        <div class="m-nav-lib">
            <h1 class="mn-title">Your Library</h1>
            <button type="button" class="mn-ic" id="mnLibSearch" title="Search in Your Library"><i class="fa-solid fa-magnifying-glass"></i></button>
            <button type="button" class="mn-ic" id="mnLibPlus" title="Create playlist"><i class="fa-solid fa-plus"></i></button>
        </div>`);

    left.querySelector('.mn-chip').addEventListener('click', () => { try { goHome(); } catch (e) {} });
    document.getElementById('mnLibSearch').addEventListener('click', () => document.getElementById('libraryFilterBtn')?.click());
    document.getElementById('mnLibPlus').addEventListener('click', () => document.getElementById('newPlaylistBtn')?.click());

    firebase.auth().onAuthStateChanged((u) => document.body.classList.toggle('m-logged', !!u));

    // ---------- Library: chip "By you" (hanya playlist buatan sendiri) ----------
    const tabs = document.querySelector('.library-tabs');
    let onlyMine = false;

    function applyMine() {
        const list = getPlaylists();
        document.querySelectorAll('#playlistList .playlist-item[data-playlist-id]').forEach((el) => {
            const p = list.find((x) => x.id === el.dataset.playlistId);
            el.style.display = (onlyMine && p && p.savedFrom) ? 'none' : '';
        });
    }
    if (tabs) {
        const byYou = document.createElement('button');
        byYou.type = 'button';
        byYou.className = 'library-tab';
        byYou.textContent = 'By you';
        tabs.appendChild(byYou);
        byYou.addEventListener('click', () => {
            onlyMine = !onlyMine;
            byYou.classList.toggle('active', onlyMine);
            applyMine();
        });
    }
    const _render = renderPlaylistList;
    renderPlaylistList = function () { _render(); applyMine(); };

    // ---------- Library: tombol ganti tampilan list <-> grid (kanan) ----------
    const toolbar = document.querySelector('.library-toolbar');
    if (toolbar) {
        const vb = document.createElement('button');
        vb.type = 'button';
        vb.className = 'm-lib-view';
        vb.title = 'Change layout';
        vb.innerHTML = '<i class="fa-solid fa-table-cells-large"></i>';
        toolbar.appendChild(vb);
        vb.addEventListener('click', () => {
            const isGrid = libraryViewMode === 'gridlarge';
            document.querySelector(`.view-icon-btn[data-view="${isGrid ? 'list' : 'gridlarge'}"]`)?.click();
            vb.querySelector('i').className = 'fa-solid ' + (isGrid ? 'fa-table-cells-large' : 'fa-list');
        });
    }
})();