// ===== Pencarian ala Spotify: saran teks + daftar lagu kecil + hasil (All / Songs / Playlists / Profiles) + recent searches =====
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
    // item: {type:'song', id} | {type:'query', text} | {type:'profile', id, name, username, photo}
    function addRecent(item) {
        const list = getRecents().filter((r) => {
            if (r.type !== item.type) return true;
            if (item.type === 'song' || item.type === 'profile') return r.id !== item.id;
            return String(r.text).toLowerCase() !== item.text.toLowerCase();
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

    // profil yang pernah dibuka lewat pencarian: hanya nama + username
    function recentProfileRowHTML(p, index) {
        const img = p.photo ? `<img src="${esc(p.photo)}" alt="">` : '<i class="fa-solid fa-user"></i>';
        return `
            <div class="sv-item sd-prof" data-uid="${esc(p.id)}">
                <div class="sv-item-img round">${img}</div>
                <div class="sv-item-info">
                    <div class="sv-item-title">${esc(p.name || 'User')}</div>
                    <div class="sv-item-sub">@${esc(p.username || '')}</div>
                </div>
                <button type="button" class="sr-remove" data-act="remove" data-ri="${index}" title="Remove from recent searches">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>`;
    }

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

    // Di HP dropdown dipindah ke <body> supaya tidak ke-crop oleh navbar
    // (navbar punya backdrop-filter yang membuat elemen fixed jadi relatif terhadap navbar).
    function openDropdown() {
        if (isMobileView()) {
            if (dropdown.parentNode !== document.body) document.body.appendChild(dropdown);
            dropdown.style.top = (nav ? nav.getBoundingClientRect().bottom : 0) + 'px';
        } else {
            if (dropdown.parentNode !== bar) bar.appendChild(dropdown);
            dropdown.style.top = '';
        }
        dropdown.classList.add('show');
    }
    function closeDropdown() { dropdown.classList.remove('show'); }

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
            } else if (r.type === 'profile' && r.id) {
                rows.push(recentProfileRowHTML(r, i));
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
                    <button type="button" class="sd-fill" data-act="fill" data-text="${esc(t)}" title="Use this search">
                        <i class="fa-solid fa-arrow-up" style="transform:rotate(-45deg)"></i>
                    </button>
                </div>`).join('') +
            (dropdownList.length ? '<div class="sd-divider"></div>' : '') +
            dropdownList.map(rowHTML).join('');
    }

    dropdown.addEventListener('click', (e) => {
        // hapus satu item recent
        const rm = e.target.closest('[data-act="remove"]');
        if (rm) {
            e.stopPropagation();
            removeRecent(parseInt(rm.dataset.ri));
            showRecents();
            return;
        }
        // panah ↖ (HP): isi kolom pencarian tanpa membuka hasil
        const fill = e.target.closest('[data-act="fill"]');
        if (fill) {
            e.stopPropagation();
            input.value = fill.dataset.text;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.focus();
            return;
        }
        if (e.target.closest('.sd-clear-recent')) {
            e.stopPropagation();
            saveRecents([]);
            closeDropdown();
            return;
        }
        // profil dari recent -> buka profil
        const prof = e.target.closest('.sd-prof');
        if (prof && window.Social) {
            const uid = prof.dataset.uid;
            const saved = getRecents().find((r) => r.type === 'profile' && r.id === uid);
            if (saved) addRecent(saved);   // naikkan ke paling atas
            closeDropdown();
            input.blur();
            Social.openProfile(uid);
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

    // ---------- Halaman hasil: All / Songs / Playlists / Profiles ----------
    const view = document.createElement('div');
    view.className = 'search-view';
    view.id = 'searchView';
    view.innerHTML = `
        <div class="sv-chips">
            <button type="button" class="sv-chip sv-chip-x" data-cat="all" title="Back to all"><i class="fa-solid fa-xmark"></i></button>
            <button type="button" class="sv-chip active" data-cat="all">All</button>
            <button type="button" class="sv-chip" data-cat="songs">Songs</button>
            <button type="button" class="sv-chip" data-cat="playlists">Playlists</button>
            <button type="button" class="sv-chip" data-cat="profiles">Profiles</button>
        </div>
        <div class="sv-list" id="svList"></div>`;
    rightPart.prepend(view);
    const svList = view.querySelector('#svList');
    bindRows(svList, () => resultList);

    let category = 'all';
    let lastQuery = '';
    let searchToken = 0;
    let cardItems = {};

    function setChip(cat) {
        category = cat;
        view.querySelectorAll('.sv-chip:not(.sv-chip-x)').forEach((c) => c.classList.toggle('active', c.dataset.cat === cat));
        view.querySelector('.sv-chips').classList.toggle('filtered', cat !== 'all');
    }

    // ----- kartu (grid, laptop) -----
    function userCardHTML(u) {
        const img = u.photo ? `<img src="${esc(u.photo)}" alt="" loading="lazy">` : '<i class="fa-solid fa-user"></i>';
        return `
            <div class="sv-card" data-kind="profile" data-id="${esc(u.id)}">
                <div class="sv-card-img round">${img}</div>
                <div class="sv-card-title">${esc(u.displayName || u.username || 'User')}</div>
                <div class="sv-card-sub">@${esc(u.username || '')}</div>
            </div>`;
    }

    function playlistCardHTML(p) {
        const src = Social.coverOf(p);
        const img = src ? `<img src="${esc(src)}" alt="" loading="lazy">` : '<i class="fa-solid fa-music"></i>';
        return `
            <div class="sv-card" data-kind="playlist" data-id="${esc(p.id)}">
                <div class="sv-card-img">${img}</div>
                <div class="sv-card-title">${esc(p.name)}</div>
                <div class="sv-card-sub">By ${esc(p.ownerName || 'Unknown')}</div>
            </div>`;
    }

    // ----- baris kecil (HP + tab All) -----
    function userRowHTML(u) {
        const img = u.photo ? `<img src="${esc(u.photo)}" alt="" loading="lazy">` : '<i class="fa-solid fa-user"></i>';
        return `
            <div class="sv-item" data-kind="profile" data-id="${esc(u.id)}">
                <div class="sv-item-img round">${img}</div>
                <div class="sv-item-info">
                    <div class="sv-item-title">${esc(u.displayName || u.username || 'User')}</div>
                    <div class="sv-item-sub">@${esc(u.username || '')}</div>
                </div>
            </div>`;
    }

    function playlistRowHTML(p) {
        const src = Social.coverOf(p);
        const img = src ? `<img src="${esc(src)}" alt="" loading="lazy">` : '<i class="fa-solid fa-music"></i>';
        return `
            <div class="sv-item" data-kind="playlist" data-id="${esc(p.id)}">
                <div class="sv-item-img">${img}</div>
                <div class="sv-item-info">
                    <div class="sv-item-title">${esc(p.name)}</div>
                    <div class="sv-item-sub">Playlist • By ${esc(p.ownerName || 'Unknown')}</div>
                </div>
            </div>`;
    }

    async function renderResults() {
        const q = lastQuery;
        const token = ++searchToken;
        cardItems = {};

        // ===== Songs =====
        if (category === 'songs') {
            resultList = matchSongs(q);
            svList.innerHTML = resultList.length
                ? resultList.map(rowHTML).join('')
                : `<div class="sd-empty">No results found for "${esc(q)}"<br><small>Please make sure your words are spelled correctly.</small></div>`;
            return;
        }

        // ===== All: campuran lagu + profil + playlist =====
        if (category === 'all') {
            const songsFound = matchSongs(q);
            let profs = [], pls = [], note = '';
            svList.innerHTML = '<div class="sd-empty">Searching…</div>';

            if (window.Social) {
                const [pr, pl] = await Promise.allSettled([Social.searchProfiles(q), Social.searchPlaylists(q)]);
                if (token !== searchToken) return;
                if (pr.status === 'fulfilled') profs = pr.value;
                if (pl.status === 'fulfilled') pls = pl.value;
                if ((pr.status === 'rejected' && pr.reason && pr.reason.message === 'login') ||
                    (pl.status === 'rejected' && pl.reason && pl.reason.message === 'login')) {
                    note = 'Log in to also search profiles and playlists.';
                }
            }

            const S = songsFound.slice(0, 8), P = profs.slice(0, 4), L = pls.slice(0, 4);
            resultList = S;
            P.forEach((u) => { cardItems[u.id] = u; });
            L.forEach((p) => { cardItems[p.id] = p; });

            const out = [];
            const max = Math.max(S.length, P.length, L.length);
            for (let i = 0; i < max; i++) {
                if (S[i]) out.push(rowHTML(S[i]));
                if (P[i]) out.push(userRowHTML(P[i]));
                if (L[i]) out.push(playlistRowHTML(L[i]));
            }

            if (!out.length) {
                svList.innerHTML = `<div class="sd-empty">No results found for "${esc(q)}"<br><small>${esc(note || 'Please make sure your words are spelled correctly.')}</small></div>`;
                return;
            }
            svList.innerHTML = out.join('') + (note ? `<div class="sd-empty"><small>${esc(note)}</small></div>` : '');
            return;
        }

        // ===== Playlists / Profiles =====
        svList.innerHTML = '<div class="sd-empty">Searching…</div>';
        let items;
        try {
            if (!window.Social) throw new Error('unavailable');
            items = category === 'profiles' ? await Social.searchProfiles(q) : await Social.searchPlaylists(q);
        } catch (err) {
            if (token !== searchToken) return;
            svList.innerHTML = `<div class="sd-empty">${err.message === 'login'
                ? 'Log in to search profiles and playlists.'
                : 'Could not load results. Check your connection and Firestore rules.'}</div>`;
            return;
        }
        if (token !== searchToken) return;

        if (!items.length) {
            svList.innerHTML = `<div class="sd-empty">No results found for "${esc(q)}"</div>`;
            return;
        }
        items.forEach((it) => { cardItems[it.id] = it; });

        if (isMobileView()) {
            // HP: baris kecil-kecil seperti Spotify
            svList.innerHTML = items.map(category === 'profiles' ? userRowHTML : playlistRowHTML).join('');
        } else {
            svList.innerHTML = '<div class="sv-grid">' +
                items.map(category === 'profiles' ? userCardHTML : playlistCardHTML).join('') + '</div>';
        }
    }

    view.querySelector('.sv-chips').addEventListener('click', (e) => {
        const chip = e.target.closest('.sv-chip');
        if (!chip) return;
        setChip(chip.dataset.cat);
        renderResults();
    });

    svList.addEventListener('click', (e) => {
        const card = e.target.closest('.sv-card, .sv-item');
        if (!card || !window.Social) return;
        const id = card.dataset.id;
        if (card.dataset.kind === 'profile') {
            const u = cardItems[id];
            if (u) {
                addRecent({
                    type: 'profile',
                    id: u.id,
                    name: u.displayName || u.username || 'User',
                    username: u.username || '',
                    photo: u.photo || null
                });
            }
            Social.openProfile(id);
        } else if (cardItems[id]) {
            Social.openPublicPlaylist(cardItems[id]);
        }
    });

    function openResults(raw, keepCategory) {
        const q = raw.trim();
        if (!q) return;
        if (!keepCategory) { addRecent({ type: 'query', text: q }); setChip('all'); }
        lastQuery = q;
        closeDropdown();
        input.blur();

        closePlaylistDetailView();   // tutup view lain (playlist, profile, settings, dll)
        centerSearchBar(true);       // harus SETELAH closePlaylistDetailView
        document.querySelectorAll('.music-section').forEach((s) => s.classList.add('hide'));

        view.classList.add('show');
        renderResults();
        rightPart.scrollTo({ top: 0 });
        window.scrollTo({ top: 0 });

        const left = document.querySelector('.main-left-part');
        if (left) left.classList.remove('mobile-show');
        rightPart.classList.remove('mobile-hide');
        if (!document.body.classList.contains('m-search')) {
            document.querySelectorAll('.bottom-nav-item').forEach((el) => el.classList.remove('active'));
            document.querySelector('.bottom-nav-item[data-target="home"]')?.classList.add('active');
        }
    }

    // dipakai tombol back di profil orang lain + halaman search HP
    window.SpotiSearch = {
        reopen() {
            if (!lastQuery) return false;
            openResults(lastQuery, true);
            return true;
        },
        rowHTML,
        bindRows,
        refreshRows
    };

    function closeResults() {
        centerSearchBar(false);
        if (view.classList.contains('show')) {
            view.classList.remove('show');
            document.querySelectorAll('.music-section').forEach((s) => s.classList.remove('hide'));
        }
        window.dispatchEvent(new Event('spotiware:search-cleared'));
    }

    // tutup hasil pencarian saat pindah ke view lain / Home
    const _closePD = closePlaylistDetailView;
    closePlaylistDetailView = function () {
        view.classList.remove('show');
        centerSearchBar(false);
        closeDropdown();
        _closePD();
    };

    // FIX: membuka playlist (mis. dari Your Library) saat hasil pencarian sedang tampil
    // -> hasil pencarian harus ditutup supaya playlist jadi halaman sendiri
    const _openPD = openPlaylistDetailView;
    openPlaylistDetailView = function (pl, isLiked) {
        if (view.classList.contains('show')) {
            view.classList.remove('show');
            centerSearchBar(false);
        }
        closeDropdown();
        _openPD(pl, isLiked);
    };

    // ---------- Event input ----------
    document.addEventListener('input', (e) => {
        if (e.target !== input) return;
        e.stopImmediatePropagation();

        const q = input.value.trim();
        clearBtn.classList.toggle('show', !!input.value);
        bar.classList.toggle('has-text', !!input.value);

        if (!q) {
            closeResults();
            // HP: kolom kosong = halaman Search (rekomendasi + recent), bukan dropdown
            if (isMobileView()) closeDropdown(); else showRecents();
            return;
        }
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
        } else if (isMobileView()) {
            closeDropdown();
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
        if (!isMobileView()) showRecents();
    });

    document.addEventListener('click', (e) => {
        if (!bar.contains(e.target) && !dropdown.contains(e.target)) closeDropdown();
    });

    document.querySelector('.home-icon')?.addEventListener('click', () => {
        clearBtn.classList.remove('show');
        bar.classList.remove('has-text');
    });

    document.getElementById('songContextMenu')?.addEventListener('click', () => {
        setTimeout(() => { refreshRows(); updateNowBarLikeIcon(); }, 0);
    });

    // ===== Playlist UI =====
// 1) tombol play/pause kuning saat kursor di playlist
// 2) menu titik 3 (⋮) + klik kanan di playlist
// 3) love di playlist = simpan ke Your Library
// 4) love di lagu = pilihan "Tambah ke Playlist"
(() => {
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    // playlist milik orang lain / hasil pencarian: id -> data
    const items = {};
    function remember(list) {
        (Array.isArray(list) ? list : [list]).forEach((p) => { if (p && p.id) items[p.id] = p; });
    }

    // otomatis mengingat playlist dari hasil pencarian
    function patchSocial() {
        if (!window.Social || Social.__plPatched) return;
        if (typeof Social.searchPlaylists === 'function') {
            const orig = Social.searchPlaylists.bind(Social);
            Social.searchPlaylists = async (...args) => {
                const res = await orig(...args);
                remember(res);
                return res;
            };
        }
        Social.__plPatched = true;
    }
    patchSocial();
    window.addEventListener('load', patchSocial);

    // ---------- Data ----------
    const isOwn = (id) => getPlaylists().some((p) => p.id === id);
    const findItem = (id) => getPlaylists().find((p) => p.id === id) || items[id] || null;
    const savedCopy = (id) => getPlaylists().find((p) => p.savedFrom === id) || null;
    const inLibrary = (id) => isOwn(id) || !!savedCopy(id);

    function songsOf(item) {
        const raw = item.songIds || item.songs || [];
        return raw
            .map((x) => songs.find((s) => s.id === (x && typeof x === 'object' ? x.id : x)))
            .filter(Boolean);
    }

    // ---------- Play / pause ----------
    function sameList(a, b) {
        if (a.length !== b.length) return false;
        const ids = new Set(a.map((s) => s.id));
        return b.every((s) => ids.has(s.id));
    }
    const isContext = (list) => playerBar.classList.contains('show') && sameList(currentContextList, list);
    function isPlaying(item) {
        const list = songsOf(item);
        return list.length > 0 && isContext(list) && !audio.paused;
    }

    function togglePlay(item) {
        const list = songsOf(item);
        if (!list.length) {
            if (!isOwn(item.id) && window.Social && typeof Social.openPublicPlaylist === 'function') {
                Social.openPublicPlaylist(item);
            } else {
                showToast('This playlist is empty');
            }
            return;
        }
        if (isContext(list)) play.click();
        else playSongFromList(list[0].id, list);
        setTimeout(refreshPlayIcons, 60);
    }

    function refreshPlayIcons() {
        document.querySelectorAll('.pl-hover-play').forEach((btn) => {
            const item = findItem(btn.dataset.plId);
            const on = !!item && isPlaying(item);
            btn.classList.toggle('on', on);
            btn.title = on ? 'Pause' : 'Play';
            btn.querySelector('i').className = 'fa-solid ' + (on ? 'fa-circle-pause' : 'fa-circle-play');
        });
    }
    audio.addEventListener('play', refreshPlayIcons);
    audio.addEventListener('pause', refreshPlayIcons);
    audio.addEventListener('playing', refreshPlayIcons);

    // ---------- Love playlist = simpan ke Your Library ----------
    function refreshHearts() {
        document.querySelectorAll('.pl-heart').forEach((btn) => {
            const saved = inLibrary(btn.dataset.plId);
            btn.classList.toggle('saved', saved);
            btn.title = saved ? 'Remove from Your Library' : 'Save to Your Library';
            btn.querySelector('i').className = (saved ? 'fa-solid' : 'fa-regular') + ' fa-heart';
        });
    }

    function toggleLibrary(item) {
        if (isOwn(item.id)) { showToast('Already in Your Library'); return; }

        const copy = savedCopy(item.id);
        if (copy) {
            deletePlaylist(copy.id);
            showToast('Removed from Your Library');
        } else {
            const list = songsOf(item);
            const created = createPlaylist(item.name || 'Playlist');
            const all = getPlaylists();
            const p = all.find((x) => x.id === created.id);
            if (p) {
                p.songIds = list.map((s) => s.id);
                p.addedDates = {};
                list.forEach((s) => { p.addedDates[s.id] = Date.now(); });
                if (item.description) p.description = item.description;
                if (item.coverImage) p.coverImage = item.coverImage;
                p.savedFrom = item.id;
                p.savedFromOwner = item.ownerName || '';
                savePlaylists(all);
            }
            showToast('Added to Your Library');
        }
        renderPlaylistList();
        refreshHearts();
    }

    // ---------- Add to queue ----------
    function addAllToQueue(item) {
        const list = songsOf(item);
        if (!list.length) { showToast('This playlist is empty'); return; }
        list.forEach((s) => queue.push(s));
        preloadedPath = null;
        renderQueuePanel();
        renderMobileSheet();
        showToast(`Added ${list.length} song${list.length !== 1 ? 's' : ''} to Queue`,
            isMobileView() ? 'Open' : null, () => openMobileSheet('queue'));
    }

    // ---------- Share link ----------
    async function copyLink(item) {
        const url = location.origin + location.pathname + '?playlist=' + encodeURIComponent(item.id);
        try {
            await navigator.clipboard.writeText(url);
        } catch (_) {
            const ta = document.createElement('textarea');
            ta.value = url;
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); } catch (__) {}
            ta.remove();
        }
        showToast('Link copied');
    }

    // ---------- Pilih playlist tujuan (Add to your playlist) ----------
    const picker = document.createElement('div');
    picker.className = 'modal-overlay';
    picker.id = 'plPickerModal';
    picker.innerHTML = `
        <div class="modal-box">
            <h3>Tambah ke Playlist</h3>
            <p class="pl-pick-sub" id="plPickSub"></p>
            <div id="plPickList" class="add-to-playlist-list"></div>
            <div class="new-playlist-inline">
                <input type="text" id="plPickNew" placeholder="Nama playlist baru">
                <button type="button" id="plPickCreate">Buat</button>
            </div>
            <button type="button" class="modal-close-btn" id="plPickDone">Konfirmasi</button>
        </div>`;
    document.body.appendChild(picker);

    let pickSongs = [];
    const pickList = picker.querySelector('#plPickList');
    const pickNew = picker.querySelector('#plPickNew');

    function renderPicker() {
        ensureLikedPlaylist();
        const ids = pickSongs.map((s) => s.id);
        pickList.innerHTML = getPlaylists().map((p) => {
            const done = ids.length > 0 && ids.every((id) => p.songIds.includes(id));
            const icon = p.id === LIKED_PLAYLIST_ID
                ? `<div class="add-to-playlist-icon liked"><i class="fa-solid fa-heart"></i></div>`
                : `<div class="add-to-playlist-icon"><i class="fa-solid fa-music"></i></div>`;
            return `
                <div class="add-to-playlist-row pl-pick-row" data-pid="${esc(p.id)}">
                    <div class="add-to-playlist-left">
                        ${icon}
                        <span class="add-to-playlist-name">${esc(p.name)}</span>
                    </div>
                    <button type="button" class="playlist-check-btn ${done ? 'checked' : ''}">
                        <i class="fa-solid fa-check"></i>
                    </button>
                </div>`;
        }).join('');
    }

    function addSongsTo(playlistId) {
        let added = 0;
        pickSongs.forEach((s) => {
            const p = getPlaylists().find((x) => x.id === playlistId);
            if (p && !p.songIds.includes(s.id)) { addSongToPlaylist(playlistId, s.id); added++; }
        });
        return added;
    }

    function openPicker(item) {
        pickSongs = songsOf(item);
        if (!pickSongs.length) { showToast('This playlist is empty'); return; }
        picker.querySelector('#plPickSub').textContent =
            `${pickSongs.length} song${pickSongs.length !== 1 ? 's' : ''} from "${item.name}"`;
        pickNew.value = '';
        renderPicker();
        picker.classList.add('show');
    }

    pickList.addEventListener('click', (e) => {
        const row = e.target.closest('.pl-pick-row');
        if (!row) return;
        const p = getPlaylists().find((x) => x.id === row.dataset.pid);
        if (!p) return;
        const added = addSongsTo(p.id);
        showToast(added ? `Added ${added} song${added !== 1 ? 's' : ''} to ${p.name}` : `Already in ${p.name}`);
        renderPicker();
        renderPlaylistList();
    });

    picker.querySelector('#plPickCreate').addEventListener('click', () => {
        const name = pickNew.value.trim();
        if (!name) return;
        const created = createPlaylist(name);
        const added = addSongsTo(created.id);
        pickNew.value = '';
        showToast(`Added ${added} song${added !== 1 ? 's' : ''} to ${name}`);
        renderPicker();
        renderPlaylistList();
    });
    pickNew.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') picker.querySelector('#plPickCreate').click();
    });
    picker.querySelector('#plPickDone').addEventListener('click', () => picker.classList.remove('show'));
    picker.addEventListener('click', (e) => { if (e.target === picker) picker.classList.remove('show'); });

    // ---------- Menu titik 3 / klik kanan ----------
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.id = 'plContextMenu';
    menu.innerHTML = `
        <div class="context-menu-item" data-act="library"><i class="fa-regular fa-heart"></i><span>Add to your library</span></div>
        <div class="context-menu-item" data-act="playlist"><i class="fa-solid fa-plus"></i><span>Add to your playlist</span></div>
        <div class="context-menu-item" data-act="queue"><i class="fa-solid fa-layer-group"></i><span>Add to queue</span></div>
        <div class="context-menu-item" data-act="share"><i class="fa-solid fa-link"></i><span>Share link</span></div>`;
    document.body.appendChild(menu);

    let menuItem = null;

    function openMenu(x, y, item) {
        menuItem = item;
        const lib = menu.querySelector('[data-act="library"]');
        if (isOwn(item.id)) {
            lib.style.display = 'none';          // playlist sendiri sudah ada di Library
        } else {
            lib.style.display = '';
            const saved = !!savedCopy(item.id);
            lib.querySelector('span').textContent = saved ? 'Remove from your library' : 'Add to your library';
            lib.querySelector('i').className = (saved ? 'fa-solid' : 'fa-regular') + ' fa-heart';
        }
        menu.classList.add('show');
        const w = menu.offsetWidth || 200, h = menu.offsetHeight || 150;
        menu.style.left = Math.max(8, Math.min(x, window.innerWidth - w - 8)) + 'px';
        menu.style.top = Math.max(8, Math.min(y, window.innerHeight - h - 8)) + 'px';
    }
    function closeMenu() {
        menu.classList.remove('show');
        menuItem = null;
    }

    menu.addEventListener('click', (e) => {
        const row = e.target.closest('[data-act]');
        if (!row || !menuItem) return;
        const item = menuItem;
        const act = row.dataset.act;
        closeMenu();
        if (act === 'library') toggleLibrary(item);
        if (act === 'playlist') openPicker(item);
        if (act === 'queue') addAllToQueue(item);
        if (act === 'share') copyLink(item);
    });
    document.addEventListener('mousedown', (e) => { if (!menu.contains(e.target)) closeMenu(); }, true);
    window.addEventListener('scroll', closeMenu, true);
    window.addEventListener('resize', closeMenu);

    // ---------- Pasang tombol ke setiap kartu / baris playlist ----------
    const SEL = '.sv-card[data-kind="playlist"], .sv-item[data-kind="playlist"], .pf-pl-card';
    const idOf = (el) => el.dataset.plId || el.dataset.id || '';

    function enhance(el) {
        if (el.dataset.plDone) return;
        const id = idOf(el);
        if (!id || !findItem(id)) return;
        el.dataset.plDone = '1';
        el.dataset.plId = id;

        const cover = el.querySelector('.sv-card-img, .sv-item-img, .pf-pl-cover');
        if (cover) {
            cover.insertAdjacentHTML('beforeend',
                `<button type="button" class="pl-hover-play" data-pl-id="${esc(id)}" title="Play"><i class="fa-solid fa-circle-play"></i></button>`);
        }

        if (el.classList.contains('sv-item')) {
            el.insertAdjacentHTML('beforeend', `
                <button type="button" class="pl-more" data-pl-id="${esc(id)}" title="More options"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                <button type="button" class="pl-heart" data-pl-id="${esc(id)}" title="Save to Your Library"><i class="fa-regular fa-heart"></i></button>`);
        } else {
            el.insertAdjacentHTML('beforeend',
                `<button type="button" class="pl-more card" data-pl-id="${esc(id)}" title="More options"><i class="fa-solid fa-ellipsis-vertical"></i></button>`);
        }
    }

    function scan() {
        document.querySelectorAll(SEL).forEach(enhance);
        refreshHearts();
        refreshPlayIcons();
    }

    let raf = null;
    const rightPart = document.querySelector('.main-right-part');
    if (rightPart) {
        new MutationObserver(() => {
            if (raf) return;
            raf = requestAnimationFrame(() => { raf = null; scan(); });
        }).observe(rightPart, { childList: true, subtree: true });
    }
    scan();

    // ---------- Klik ----------
    document.addEventListener('click', (e) => {
        const t = e.target;

        // love di LAGU -> pilihan "Tambah ke Playlist"
        const songHeart = t.closest('.sr-add, #nowBarLikeBtn, #miniPopupLikeBtn');
        if (songHeart) {
            let id;
            if (songHeart.classList.contains('sr-add')) {
                id = parseInt(songHeart.closest('.sr-row')?.dataset.id);
            } else if (playerBar.classList.contains('show')) {
                id = getCurrentSong().id;
            }
            if (id !== undefined && !isNaN(id)) {
                e.stopImmediatePropagation();
                e.preventDefault();
                openAddToPlaylistModal(id);
            }
            return;
        }

        const btn = t.closest('.pl-hover-play, .pl-heart, .pl-more');
        if (!btn) return;
        const item = findItem(btn.dataset.plId);
        if (!item) return;

        e.stopImmediatePropagation();
        e.preventDefault();

        if (btn.classList.contains('pl-hover-play')) togglePlay(item);
        else if (btn.classList.contains('pl-heart')) toggleLibrary(item);
        else {
            const r = btn.getBoundingClientRect();
            openMenu(r.left, r.bottom + 4, item);
        }
    }, true);

    // ---------- Klik kanan ----------
    document.addEventListener('contextmenu', (e) => {
        const el = e.target.closest(SEL);
        if (!el) return;
        const item = findItem(idOf(el));
        if (!item) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        openMenu(e.clientX, e.clientY, item);
    }, true);

    // ikon love lagu ikut berubah setelah modal "Tambah ke Playlist" dipakai
    function refreshSongHearts() {
        try { window.SpotiSearch && SpotiSearch.refreshRows(); } catch (_) {}
        try { updateNowBarLikeIcon(); } catch (_) {}
        try { updateMiniPlayerPopup(); } catch (_) {}
    }
    document.getElementById('addToPlaylistModal')?.addEventListener('click', () => setTimeout(refreshSongHearts, 0));

    window.PlaylistUI = { remember, scan };
})();

    audio.addEventListener('play', refreshRows);
    audio.addEventListener('pause', refreshRows);
    audio.addEventListener('playing', refreshRows);
})();