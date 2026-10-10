// ===== Pencarian ala Spotify: saran teks + daftar lagu kecil + hasil (kategori Songs) + recent searches =====
(() => {
    const input = document.querySelector('.input-box');
    const bar = document.querySelector('.search-bar');
    const rightPart = document.querySelector('.main-right-part');
    const nav = document.querySelector('nav');
    if (!input || !bar || !rightPart) return;

    const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    let dropdownList = [];
    let resultList = [];

    // Search bar pindah ke tengah navbar (CSS hanya berlaku di laptop/PC)
    function centerSearchBar(on) {
        document.body.classList.toggle('search-centered', on);
    }

    // ---------- Recent searches (disimpan di localStorage) ----------
    const RECENT_KEY = 'spotiware_recent_searches';

    function getRecents() {
        try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; }
        catch (e) { return []; }
    }
    function saveRecents(list) {
        try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 10))); } catch (e) {}
    }
    function addRecent(item) {
        const list = getRecents().filter((r) => {
            if (r.type !== item.type) return true;
            return item.type === 'song'
                ? r.id !== item.id
                : r.text.toLowerCase() !== item.text.toLowerCase();
        });
        list.unshift(item);
        saveRecents(list);
    }
    function removeRecent(index) {
        const list = getRecents();
        list.splice(index, 1);
        saveRecents(list);
    }

    // ---------- Pencocokan lagu (lagu rahasia tetap lewat keyword) ----------
    function matchSongs(raw) {
        const q = raw.toLowerCase().trim();
        if (!q) return [];
        const found = songs.filter((s) => {
            if (s.hidden) {
                const keys = [].concat(s.keyword || s.songName).map((k) => String(k).toLowerCase());
                return keys.some((k) => k.includes(q));
            }
            return s.songName.toLowerCase().includes(q) || s.songDes.toLowerCase().includes(q);
        });
        const rank = (s) => {
            const n = s.songName.toLowerCase(), a = s.songDes.toLowerCase();
            if (n.startsWith(q)) return 0;
            if (n.includes(q)) return 1;
            if (a.startsWith(q)) return 2;
            return 3;
        };
        return found.map((s, i) => [s, i])
            .sort((x, y) => rank(x[0]) - rank(y[0]) || x[1] - y[1])
            .map((x) => x[0]);
    }

    // ---------- Saran teks (judul & nama artis dari lagu yang terlihat) ----------
    function suggestions(raw) {
        const q = raw.toLowerCase().trim();
        const seen = new Set();
        const cands = [];
        const add = (t) => {
            t = t.trim();
            const k = t.toLowerCase();
            if (t && k.includes(q) && !seen.has(k)) { seen.add(k); cands.push(t); }
        };
        visibleSongs.forEach((s) => {
            add(s.songName);
            s.songDes.split(',').forEach(add);
        });
        cands.sort((a, b) => {
            const pa = a.toLowerCase().startsWith(q) ? 0 : 1;
            const pb = b.toLowerCase().startsWith(q) ? 0 : 1;
            return pa - pb || a.length - b.length;
        });
        return cands.slice(0, 4);
    }

    function highlight(text, raw) {
        const q = raw.toLowerCase().trim();
        const i = text.toLowerCase().indexOf(q);
        if (i < 0) return esc(text);
        return esc(text.slice(0, i)) + '<b>' + esc(text.slice(i, i + q.length)) + '</b>' + esc(text.slice(i + q.length));
    }

    // ---------- HTML baris lagu ----------
    function currentId() {
        return playerBar.classList.contains('show') ? getCurrentSong().id : null;
    }
    function isPlayingNow(id) {
        return id === currentId() && !audio.paused;
    }

    // gambar cover + ikon play/pause saat di-hover
    function coverHTML(s) {
        const playing = isPlayingNow(s.id);
        return `
            <div class="sr-cover" title="${playing ? 'Pause' : 'Play'} ${esc(s.songName)}">
                <img src="${esc(s.songImage)}" alt="" loading="lazy">
                <div class="sr-play"><i class="fa-solid ${playing ? 'fa-pause' : 'fa-play'}"></i></div>
            </div>`;
    }

    function rowHTML(s) {
        const liked = isSongLiked(s.id);
        return `
            <div class="sr-row${s.id === currentId() ? ' playing' : ''}" data-id="${s.id}">
                ${coverHTML(s)}
                <div class="sr-info">
                    <div class="sr-title">${esc(s.songName)}</div>
                    <div class="sr-sub">Song • ${esc(s.songDes)}</div>
                </div>
                <button type="button" class="sr-more" data-act="more" title="More">
                    <i class="fa-solid fa-ellipsis sr-more-h"></i>
                    <i class="fa-solid fa-ellipsis-vertical sr-more-v"></i>
                </button>
                <button type="button" class="sr-add${liked ? ' liked' : ''}" data-act="add"
                    title="${liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}">
                    <i class="${liked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                </button>
            </div>`;
    }

    // baris di daftar "Recent searches" (lagu): cover + info + tombol X
    function recentSongRowHTML(s, index) {
        return `
            <div class="sr-row${s.id === currentId() ? ' playing' : ''}" data-id="${s.id}">
                ${coverHTML(s)}
                <div class="sr-info">
                    <div class="sr-title">${esc(s.songName)}</div>
                    <div class="sr-sub">Song • ${esc(s.songDes)}</div>
                </div>
                <button type="button" class="sr-remove" data-act="remove" data-ri="${index}" title="Remove from recent searches">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>`;
    }

    // baris di daftar "Recent searches" (teks pencarian)
    function recentQueryRowHTML(text, index) {
        return `
            <div class="sd-sug" data-text="${esc(text)}">
                <span class="sd-sug-icon"><i class="fa-solid fa-clock-rotate-left"></i></span>
                <span class="sd-sug-text recent">${esc(text)}</span>
                <button type="button" class="sr-remove" data-act="remove" data-ri="${index}" title="Remove from recent searches">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>`;
    }

    function refreshRows() {
        const cur = currentId();
        document.querySelectorAll('.sr-row').forEach((row) => {
            const id = parseInt(row.dataset.id);
            row.classList.toggle('playing', id === cur);

            const playing = isPlayingNow(id);
            const playIcon = row.querySelector('.sr-play i');
            if (playIcon) playIcon.className = 'fa-solid ' + (playing ? 'fa-pause' : 'fa-play');
            const cover = row.querySelector('.sr-cover');
            const song = songs.find((s) => s.id === id);
            if (cover && song) cover.title = (playing ? 'Pause ' : 'Play ') + song.songName;

            const btn = row.querySelector('.sr-add');
            if (btn) {
                const liked = isSongLiked(id);
                btn.classList.toggle('liked', liked);
                btn.title = liked ? 'Remove from Liked Songs' : 'Save to Liked Songs';
                btn.querySelector('i').className = (liked ? 'fa-solid' : 'fa-regular') + ' fa-heart';
            }
        });
    }

    function playFromSearch(id) {
        const song = songs.find((s) => s.id === id);
        if (!song) return;
        const rest = shuffleSongs(visibleSongs.filter((s) => s.id !== id));
        playSongFromList(id, [song, ...rest]);
    }

    function bindRows(container, getList, onPlay) {
        // klik kiri: love / titik 3 / putar lagu
        container.addEventListener('click', (e) => {
            const row = e.target.closest('.sr-row');
            if (!row) return;
            const id = parseInt(row.dataset.id);
            const actEl = e.target.closest('[data-act]');
            const act = actEl ? actEl.dataset.act : null;

            if (act === 'remove') return;   // ditangani di handler dropdown

            if (act === 'add') {
                e.stopPropagation();
                toggleLikedSong(id);
                updateNowBarLikeIcon();
                refreshRows();
                return;
            }
            if (act === 'more') {
                e.stopPropagation();
                const rect = actEl.getBoundingClientRect();
                openSongContextMenu(rect.left, rect.bottom + 4, id);
                return;
            }

            // lagu yang sedang diputar: klik = play / pause
            if (id === currentId()) {
                play.click();
                refreshRows();
                return;
            }

            addRecent({ type: 'song', id });
            playFromSearch(id);
            refreshRows();
            if (onPlay) onPlay();
        });

        // klik kanan: menu yang sama dengan titik 3
        container.addEventListener('contextmenu', (e) => {
            const row = e.target.closest('.sr-row');
            if (!row) return;
            e.preventDefault();
            e.stopPropagation();
            openSongContextMenu(e.clientX, e.clientY, parseInt(row.dataset.id));
        });
    }

    // ---------- Tombol X + dropdown ----------
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'search-clear';
    clearBtn.title = 'Clear';
    clearBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    const browse = bar.querySelector('.browse');
    bar.insertBefore(clearBtn, browse);

    const dropdown = document.createElement('div');
    dropdown.className = 'search-dropdown';
    bar.appendChild(dropdown);

    function openDropdown() {
        if (isMobileView() && nav) dropdown.style.top = nav.getBoundingClientRect().bottom + 'px';
        else dropdown.style.top = '';
        dropdown.classList.add('show');
    }
    function closeDropdown() { dropdown.classList.remove('show'); }

    // isi dropdown saat kolom pencarian masih kosong
    function renderRecents() {
        const list = getRecents();
        dropdownList = [];
        const rows = [];

        list.forEach((r, i) => {
            if (r.type === 'song') {
                const s = songs.find((x) => x.id === r.id);
                if (!s) return;
                dropdownList.push(s);
                rows.push(recentSongRowHTML(s, i));
            } else if (r.type === 'query' && r.text) {
                rows.push(recentQueryRowHTML(r.text, i));
            }
        });

        if (!rows.length) return false;

        dropdown.innerHTML =
            '<div class="sd-head">Recent searches</div>' +
            rows.join('') +
            '<div class="sd-clear-recent">Clear recent searches</div>';
        return true;
    }

    function showRecents() {
        if (renderRecents()) openDropdown();
        else closeDropdown();
    }

    // isi dropdown saat user mengetik
    function renderDropdown(q) {
        const sug = suggestions(q);
        dropdownList = matchSongs(q).slice(0, 6);

        if (!sug.length && !dropdownList.length) {
            dropdown.innerHTML = `<div class="sd-empty">No results found for "${esc(q)}"</div>`;
            return;
        }
        dropdown.innerHTML =
            sug.map((t) => `
                <div class="sd-sug" data-text="${esc(t)}">
                    <span class="sd-sug-icon"><i class="fa-solid fa-magnifying-glass"></i></span>
                    <span class="sd-sug-text">${highlight(t, q)}</span>
                </div>`).join('') +
            (dropdownList.length ? '<div class="sd-divider"></div>' : '') +
            dropdownList.map(rowHTML).join('');
    }

    dropdown.addEventListener('click', (e) => {
        // hapus satu item recent
        const rm = e.target.closest('[data-act="remove"]');
        if (rm) {
            e.stopPropagation();   // supaya dropdown tidak ikut tertutup
            removeRecent(parseInt(rm.dataset.ri));
            showRecents();
            return;
        }
        // hapus semua recent
        if (e.target.closest('.sd-clear-recent')) {
            e.stopPropagation();
            saveRecents([]);
            closeDropdown();
            return;
        }
        const sug = e.target.closest('.sd-sug');
        if (sug) {
            input.value = sug.dataset.text;
            clearBtn.classList.add('show');
            bar.classList.add('has-text');
            openResults(input.value);
        }
    });
    bindRows(dropdown, () => dropdownList, () => { closeDropdown(); input.blur(); });

    // ---------- Halaman hasil (kategori Songs) ----------
    const view = document.createElement('div');
    view.className = 'search-view';
    view.id = 'searchView';
    view.innerHTML = `
        <div class="sv-chips"><button type="button" class="sv-chip active">Songs</button></div>
        <div class="sv-list" id="svList"></div>`;
    rightPart.prepend(view);
    const svList = view.querySelector('#svList');
    bindRows(svList, () => resultList);

    function openResults(raw) {
        const q = raw.trim();
        if (!q) return;
        addRecent({ type: 'query', text: q });
        closeDropdown();
        input.blur();

        closePlaylistDetailView();   // tutup view lain (playlist, profile, settings, dll)
        centerSearchBar(true);       // harus SETELAH closePlaylistDetailView
        document.querySelectorAll('.music-section').forEach((s) => s.classList.add('hide'));

        resultList = matchSongs(q);
        svList.innerHTML = resultList.length
            ? resultList.map(rowHTML).join('')
            : `<div class="sd-empty">No results found for "${esc(q)}"<br><small>Please make sure your words are spelled correctly.</small></div>`;

        view.classList.add('show');
        rightPart.scrollTo({ top: 0 });
        window.scrollTo({ top: 0 });

        const left = document.querySelector('.main-left-part');
        if (left) left.classList.remove('mobile-show');
        rightPart.classList.remove('mobile-hide');
        document.querySelectorAll('.bottom-nav-item').forEach((el) => el.classList.remove('active'));
        document.querySelector('.bottom-nav-item[data-target="home"]')?.classList.add('active');
    }

    function closeResults() {
        centerSearchBar(false);
        if (!view.classList.contains('show')) return;
        view.classList.remove('show');
        document.querySelectorAll('.music-section').forEach((s) => s.classList.remove('hide'));
    }

    // tutup hasil pencarian saat pindah ke view lain / Home
    const _closePD = closePlaylistDetailView;
    closePlaylistDetailView = function () {
        view.classList.remove('show');
        centerSearchBar(false);
        closeDropdown();
        _closePD();
    };

    // ---------- Event input ----------
    // Dicegat di fase capture supaya filter lama (yang menimpa kartu di Home) tidak jalan
    document.addEventListener('input', (e) => {
        if (e.target !== input) return;
        e.stopImmediatePropagation();

        const q = input.value.trim();
        clearBtn.classList.toggle('show', !!input.value);
        bar.classList.toggle('has-text', !!input.value);

        if (!q) { closeResults(); showRecents(); return; }
        renderDropdown(q);
        openDropdown();
    }, true);

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') openResults(input.value);
        if (e.key === 'Escape') closeDropdown();
    });

    function showDropdownForCurrentInput() {
        const q = input.value.trim();
        if (q) {
            renderDropdown(q);
            openDropdown();
        } else {
            showRecents();
        }
    }

    input.addEventListener('focus', showDropdownForCurrentInput);
    input.addEventListener('click', () => {
        if (!dropdown.classList.contains('show')) showDropdownForCurrentInput();
    });

    clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.classList.remove('show');
        bar.classList.remove('has-text');
        closeResults();
        input.focus();
        showRecents();
    });

    document.addEventListener('click', (e) => {
        if (!bar.contains(e.target)) closeDropdown();
    });

    // tombol home mengosongkan kolom pencarian
    document.querySelector('.home-icon')?.addEventListener('click', () => {
        clearBtn.classList.remove('show');
        bar.classList.remove('has-text');
    });

    // setelah pakai menu titik 3 / klik kanan (Save to Liked Songs, dll), ikon love ikut update
    document.getElementById('songContextMenu')?.addEventListener('click', () => {
        setTimeout(() => { refreshRows(); updateNowBarLikeIcon(); }, 0);
    });

    audio.addEventListener('play', refreshRows);
    audio.addEventListener('pause', refreshRows);
    audio.addEventListener('playing', refreshRows);
})();