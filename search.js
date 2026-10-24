// ===== Pencarian ala Spotify: saran teks + daftar lagu kecil + hasil (All / Songs / Artists / Playlists / Profiles) + recent searches =====
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

    // ---------- Data artis: kategori Artists, Top result, artis mirip ----------
    const normT = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const wordsOf = (s) => normT(s).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    const hashStr = (str) => { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0; return h; };
    const STOP = new Set(['the', 'and', 'you', 'your', 'for', 'with', 'feat', 'of', 'to', 'in', 'on', 'a', 'i', 'me', 'my', 'it', 'is',
        'di', 'dan', 'yang', 'ke', 'aku', 'kamu', 'dia', 'ini', 'itu']);
    const artistsOf = (s) => s.artists || String(s.songDes || '').split(',').map((x) => x.trim()).filter(Boolean);

    function lev(a, b, max) {
        if (Math.abs(a.length - b.length) > max) return max + 1;
        let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
        for (let i = 1; i <= a.length; i++) {
            const row = [i]; let min = i;
            for (let j = 1; j <= b.length; j++) {
                row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
                if (row[j] < min) min = row[j];
            }
            if (min > max) return max + 1;
            prev = row;
        }
        return prev[b.length];
    }
    const nearWord = (w, k) => { const m = k.length >= 7 ? 2 : 1; return k.length >= 4 && lev(w, k, m) <= m; };

    let artistCache = null;
    function artistStats() {
        if (artistCache) return artistCache;
        const map = {};
        visibleSongs.forEach((s) => {
            const names = artistsOf(s);
            names.forEach((a) => {
                if (!a || a === 'Unknown') return;
                const o = map[a] || (map[a] = { name: a, songs: [], genre: s.genre || 'Lainnya', collab: {} });
                o.songs.push(s);
                names.forEach((b) => { if (b !== a) o.collab[b] = (o.collab[b] || 0) + 1; });
            });
        });
        artistCache = { list: Object.values(map), by: map };
        return artistCache;
    }

    const artistImg = (a) => (window.ARTIST_PHOTOS || {})[a.name] || (a.songs[0] && a.songs[0].songImage) || 'img/pplglogo.png';

    function artistScore(name, nq, toks) {
        const n = normT(name);
        if (n === nq) return 100;
        if (n.startsWith(nq)) return 90;
        if (n.includes(nq)) return 70;
        if (!toks.length) return 0;
        const nw = wordsOf(name);
        const hit = toks.filter((k) => nw.some((w) => w === k || w.startsWith(k) || nearWord(w, k))).length;
        return hit === toks.length ? 55 : 0;
    }

    // artis yang cocok + artis yang mirip (genre sama / pernah kolaborasi)
    function findArtists(raw) {
        const nq = normT(raw).trim();
        const qw = wordsOf(raw);
        let toks = qw.filter((w) => w.length >= 3 && !STOP.has(w));
        if (!toks.length) toks = qw;
        const st = artistStats();

        const matched = st.list.map((a) => ({ a, sc: artistScore(a.name, nq, toks) }))
            .filter((x) => x.sc > 0)
            .sort((x, y) => y.sc - x.sc || y.a.songs.length - x.a.songs.length);

        const list = [], seen = new Set();
        const add = (a) => { if (a && !seen.has(a.name)) { seen.add(a.name); list.push(a); } };
        matched.slice(0, 6).forEach((x) => add(x.a));
        matchSongs(raw).slice(0, 12).forEach((s) => artistsOf(s).forEach((n) => add(st.by[n])));
        list.slice(0, 2).forEach((sd) => {
            st.list.filter((a) => !seen.has(a.name) && a.songs.length >= 2 &&
                ((a.genre === sd.genre && sd.genre !== 'Lainnya') || sd.collab[a.name]))
                .sort((x, y) => ((sd.collab[y.name] || 0) * 10 + y.songs.length) - ((sd.collab[x.name] || 0) * 10 + x.songs.length))
                .slice(0, 10).forEach(add);
        });
        return { matched, list: list.slice(0, 24) };
    }

    function openArtist(name) {
        if (typeof window.openArtistPage === 'function') window.openArtistPage(name);
        else openShowAllView(name, visibleSongs.filter((s) => artistsOf(s).includes(name)));
    }

    function playArtist(name) {
        const list = visibleSongs.filter((s) => artistsOf(s).includes(name));
        if (list.length) playSongFromList(list[0].id, list);
    }

    function artistRowHTML(a) {
        return `
            <div class="sv-item" data-kind="artist" data-name="${esc(a.name)}">
                <div class="sv-item-img round"><img src="${esc(artistImg(a))}" alt="" loading="lazy"></div>
                <div class="sv-item-info">
                    <div class="sv-item-title">${esc(a.name)}</div>
                    <div class="sv-item-sub">Artist</div>
                </div>
            </div>`;
    }

    function artistCardHTML(a) {
        return `
            <div class="sv-card" data-kind="artist" data-name="${esc(a.name)}">
                <div class="sv-card-img round"><img src="${esc(artistImg(a))}" alt="" loading="lazy"></div>
                <div class="sv-card-title">${esc(a.name)}</div>
                <div class="sv-card-sub">Artist</div>
            </div>`;
    }

    function pickTop(AR, S) {
        if (AR.matched[0] && AR.matched[0].sc >= 70) return { type: 'artist', a: AR.matched[0].a };
        if (S[0]) return { type: 'song', s: S[0] };
        if (AR.matched[0]) return { type: 'artist', a: AR.matched[0].a };
        return null;
    }

    function topResultHTML(t) {
        if (t.type === 'artist') {
            const a = t.a;
            return `
                <div class="sv-top artist" data-name="${esc(a.name)}">
                    <img src="${esc(artistImg(a))}" alt="">
                    <div class="sv-top-name">${esc(a.name)}</div>
                    <div class="sv-top-sub">Artist</div>
                    <button type="button" class="sv-top-play" data-name="${esc(a.name)}" title="Play"><i class="fa-solid fa-play"></i></button>
                </div>`;
        }
        const s = t.s;
        return `
            <div class="sv-top song" data-song-id="${s.id}">
                <img src="${esc(s.songImage)}" alt="">
                <div class="sv-top-name">${esc(s.songName)}</div>
                <div class="sv-top-sub">Song • ${esc(s.songDes)}</div>
                <button type="button" class="sv-top-play" data-song-id="${s.id}" title="Play"><i class="fa-solid fa-play"></i></button>
            </div>`;
    }

    (function injectArtistStyle() {
        const css = document.createElement('style');
        css.textContent = `
            .sv-h{font-size:1.3rem;margin:1.2rem 0 .6rem}
            .sv-h-row{display:flex;align-items:center;justify-content:space-between}
            .sv-link{font-size:.8rem;font-weight:700;opacity:.7;cursor:pointer}
            .sv-link:hover{opacity:1;text-decoration:underline}
            .sv-topgrid{display:flex;gap:1.8rem;flex-wrap:wrap;align-items:flex-start}
            .sv-topcol{flex:0 0 400px;max-width:100%}
            .sv-songscol{flex:1 1 340px;min-width:0}
            @media (max-width:768px){.sv-topcol,.sv-songscol{flex-basis:100%}}
            .sv-top{position:relative;background:rgba(255,255,255,.07);border-radius:12px;padding:1.5rem;min-height:230px;box-sizing:border-box;cursor:pointer;transition:background .2s}
            .sv-top:hover{background:rgba(255,255,255,.14)}
            .sv-top img{width:120px;height:120px;object-fit:cover;border-radius:8px;display:block;margin-bottom:1.2rem;box-shadow:0 8px 24px rgba(0,0,0,.35)}
            .sv-top.artist img{border-radius:50%}
            .sv-top-name{font-size:2.2rem;font-weight:800;line-height:1.1;margin-bottom:.5rem;overflow:hidden;text-overflow:ellipsis;
                display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
            .sv-top-sub{font-size:.9rem;opacity:.75}
            .sv-top-play{position:absolute;right:1.2rem;bottom:1.2rem;width:52px;height:52px;border-radius:50%;border:none;
                background:var(--yellow,#1ed760);color:#000;font-size:1.15rem;cursor:pointer;
                display:flex;align-items:center;justify-content:center;box-shadow:0 8px 18px rgba(0,0,0,.4)}
            .sv-top-play:hover{transform:scale(1.06)}
        `;
        document.head.appendChild(css);
    })();

    // ---------- Recent searches (disimpan di localStorage) ----------
    const recentKey = () => 'spotiware_recent_searches_' + ((firebase.auth().currentUser || {}).uid || 'guest');
    try { localStorage.removeItem('spotiware_recent_searches'); } catch (e) {}

    function getRecents() {
        try { return JSON.parse(localStorage.getItem(recentKey())) || []; }
        catch (e) { return []; }
    }
    function saveRecents(list) {
        try { localStorage.setItem(recentKey(), JSON.stringify(list.slice(0, 10))); } catch (e) {}
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

    // ---------- Pencocokan lagu: ketat (untuk dropdown & mencari artis dari lagu) ----------
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

    // ---------- Pencocokan lagu: longgar + terkait (untuk halaman hasil) ----------
    function songScore(s, nq, toks) {
        const t = normT(s.songName), a = normT(s.songDes);
        const all = wordsOf(s.songName).concat(wordsOf(s.songDes));
        let sc = 0;
        if (t.includes(nq)) sc += t.startsWith(nq) ? 120 : 90;
        if (a.includes(nq)) sc += 80;
        let hit = 0;
        toks.forEach((k) => {
            let b = 0;
            if (all.includes(k)) b = 25;
            else if (all.some((w) => w.startsWith(k))) b = 18;
            else if (k.length >= 4 && (t.includes(k) || a.includes(k))) b = 14;
            else if (all.some((w) => nearWord(w, k))) b = 10;      // salah ketik kecil
            if (b) { hit++; sc += b; }
        });
        if (toks.length > 1 && hit === toks.length) sc += 30;
        return sc;
    }

    // hasil utama dulu, lalu lagu lain dari artis yang sama, artis mirip, dan satu genre
    function expandSongs(raw) {
        const nq = normT(raw).trim();
        const qw = wordsOf(raw);
        let toks = qw.filter((w) => w.length >= 3 && !STOP.has(w));
        if (!toks.length) toks = qw;

        const prim = [];
        songs.forEach((s) => {
            if (s.hidden) {      // lagu rahasia: hanya lewat keyword
                const keys = [].concat(s.keyword || s.songName).map(normT);
                if (keys.some((k) => k.includes(nq))) prim.push({ s, sc: 200 });
                return;
            }
            const sc = songScore(s, nq, toks);
            if (sc >= 10) prim.push({ s, sc });
        });
        prim.sort((a, b) => b.sc - a.sc || a.s.songName.localeCompare(b.s.songName));

        const out = [], seen = new Set();
        const push = (s) => { if (s && !seen.has(s.id)) { seen.add(s.id); out.push(s); } };
        prim.slice(0, 60).forEach((x) => push(x.s));
        if (!out.length) return out;

        const st = artistStats();

        // 1) lagu lain dari artis hasil teratas
        const names = [];
        out.slice(0, 5).forEach((s) => { const n = artistsOf(s)[0]; if (n && !names.includes(n)) names.push(n); });
        names.slice(0, 3).forEach((n) => visibleSongs.filter((s) => artistsOf(s).includes(n)).forEach(push));

        // 2) lagu dari artis yang mirip (genre sama / pernah kolaborasi)
        const base = st.by[names[0]];
        if (base) {
            st.list.filter((a) => a.name !== base.name && a.songs.length >= 2 &&
                ((a.genre === base.genre && base.genre !== 'Lainnya') || base.collab[a.name]))
                .sort((x, y) => ((base.collab[y.name] || 0) * 10 + y.songs.length) - ((base.collab[x.name] || 0) * 10 + x.songs.length))
                .slice(0, 5)
                .forEach((a) => a.songs.slice(0, 3).forEach(push));
        }

        // 3) sedikit lagu segenre (urutan stabil, tidak berubah-ubah)
        const g = out[0].genre;
        if (g && g !== 'Lainnya') {
            visibleSongs.filter((s) => s.genre === g && !seen.has(s.id))
                .sort((x, y) => hashStr(x.songName + nq) - hashStr(y.songName + nq))
                .slice(0, 12).forEach(push);
        }
        return out.slice(0, 120);
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

    // tombol play/pause di kartu Top result ikut berubah
    function syncTop() {
        const btn = document.querySelector('#svList .sv-top-play');
        if (!btn) return;
        const cid = currentId();
        let on = false;
        if (cid !== null && !audio.paused) {
            if (btn.dataset.name) {
                const cs = songs.find((s) => s.id === cid);
                on = !!cs && artistsOf(cs).includes(btn.dataset.name);
            } else {
                on = parseInt(btn.dataset.songId) === cid;
            }
        }
        const i = btn.querySelector('i');
        if (i) i.className = 'fa-solid ' + (on ? 'fa-pause' : 'fa-play');
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
        syncTop();
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

        // ---------- Ikon "berteman" di hasil profil + klik kanan ----------
    const FR_UI = {
        none:     ['fa-user-plus',  'Add friend', ''],
        sent:     ['fa-user-clock', 'Request sent (tap to cancel)', 'on'],
        received: ['fa-user-check', 'Accept friend request', 'on'],
        friends:  ['fa-user-check', 'Friends (tap to remove)', 'ok']
    };
    const FR_LABEL = { none: 'Add friend', sent: 'Cancel friend request', received: 'Accept friend request', friends: 'Remove friend' };

    function friendState(uid) {
        const me = firebase.auth().currentUser;
        if (!me || me.uid === uid || !window.Social || !Social.relationWith) return null;   // diri sendiri / belum login: tanpa ikon
        return Social.relationWith(uid);
    }

    function friendBtnHTML(uid) {
        const r = friendState(uid);
        if (!r) return '';
        const [icon, title, cls] = FR_UI[r.state];
        return `<button type="button" class="fr-add ${cls}" data-act="friend" data-uid="${esc(uid)}" title="${title}"><i class="fa-solid ${icon}"></i></button>`;
    }

    async function friendAction(uid) {
        const r = friendState(uid);
        if (!r) { showToast('Log in to add friends'); return; }
        try {
            if (r.state === 'none') { await Social.sendRequest(uid); showToast('Friend request sent'); }
            else if (r.state === 'sent') { await Social.core.removeFriendship(r.id); showToast('Request canceled'); }
            else if (r.state === 'received') { await Social.core.acceptRequest(r.id); showToast('You are now friends'); }
            else if (r.state === 'friends') { if (confirm('Remove this friend?')) await Social.core.removeFriendship(r.id); }
        } catch (err) { console.warn(err); showToast('Something went wrong'); }
    }

    function refreshFriendBtns() {
        document.querySelectorAll('.fr-add').forEach((b) => {
            const t = document.createElement('div');
            t.innerHTML = friendBtnHTML(b.dataset.uid);
            if (t.firstElementChild) b.replaceWith(t.firstElementChild);
        });
    }
    window.addEventListener('spotiware:friends', refreshFriendBtns);   // status berubah -> ikon ikut berubah

    // menu klik kanan pada orang
    const frMenu = document.createElement('div');
    frMenu.className = 'context-menu';
    frMenu.innerHTML = `
        <div class="context-menu-item" data-act="friend"><i class="fa-solid fa-user-plus"></i><span>Add friend</span></div>
        <div class="context-menu-item" data-act="view"><i class="fa-solid fa-user"></i><span>View profile</span></div>`;
    document.body.appendChild(frMenu);
    let frMenuUid = null;

    document.addEventListener('contextmenu', (e) => {
        const el = e.target.closest('.sv-item[data-kind="profile"], .sv-card[data-kind="profile"]');
        if (!el || !(dropdown.contains(el) || view.contains(el))) return;
        e.preventDefault();
        e.stopPropagation();
        frMenuUid = el.dataset.id;
        const r = friendState(frMenuUid);
        const row = frMenu.querySelector('[data-act="friend"]');
        if (r) {
            row.style.display = '';
            row.querySelector('span').textContent = FR_LABEL[r.state];
            row.querySelector('i').className = 'fa-solid ' + FR_UI[r.state][0];
        } else {
            row.style.display = 'none';
        }
        frMenu.classList.add('show');
        frMenu.style.left = Math.min(e.clientX, window.innerWidth - (frMenu.offsetWidth || 200) - 8) + 'px';
        frMenu.style.top = Math.min(e.clientY, window.innerHeight - (frMenu.offsetHeight || 100) - 8) + 'px';
    }, true);

    frMenu.addEventListener('click', (e) => {
        const it = e.target.closest('[data-act]');
        if (!it) return;
        const uid = frMenuUid;
        frMenu.classList.remove('show');
        if (it.dataset.act === 'friend') friendAction(uid);
        else if (window.Social) { closeDropdown(); Social.openProfile(uid); }
    });
    document.addEventListener('mousedown', (e) => { if (!frMenu.contains(e.target)) frMenu.classList.remove('show'); }, true);
    window.addEventListener('scroll', () => frMenu.classList.remove('show'), true);

        // urutan gabungan lagu + profil + playlist + artis: yang diawali kata kunci tampil lebih dulu
    function relScore(q, texts) {
        let best = 3;
        texts.forEach((t) => {
            t = String(t || '').toLowerCase();
            if (t.startsWith(q)) best = Math.min(best, 0);
            else if (t.split(/[\s._()-]+/).some((w) => w.startsWith(q))) best = Math.min(best, 1);
            else if (t.includes(q)) best = Math.min(best, 2);
        });
        return best;
    }
    function mixedHTML(raw, S, P, L, A) {
        A = A || [];
        const q = raw.toLowerCase().trim();
        const items = [];
        S.forEach((s, i) => items.push([relScore(q, [s.songName, s.songDes]), i * 4, rowHTML(s)]));
        P.forEach((u, i) => items.push([relScore(q, [u.displayName, u.username]), i * 4 + 1, userRowHTML(u)]));
        L.forEach((p, i) => items.push([relScore(q, [p.name]), i * 4 + 2, playlistRowHTML(p)]));
        A.forEach((a, i) => items.push([relScore(q, [a.name]), i * 4 + 3, artistRowHTML(a)]));
        return items.sort((a, b) => a[0] - b[0] || a[1] - b[1]).map((x) => x[2]);
    }

    // library yang sedang fullscreen -> kembali ke ukuran normal saat mulai mencari
    function leaveLibraryFull() {
        const m = document.querySelector('.main');
        if (m && m.classList.contains('library-expanded')) document.getElementById('libraryExpandBtn')?.click();
    }

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

    // jumlah maksimal baris per jenis di rekomendasi (ubah kalau mau lebih banyak)
    const DD_SONGS = 8, DD_OTHERS = 6, DD_ARTISTS = 3;
    let ddToken = 0;
    let ddItems = {};

    function paintDropdown(q, sug, S, P, L, loading, A) {
        A = A || [];
        if (!sug.length && !S.length && !P.length && !L.length && !A.length) {
            dropdown.innerHTML = loading
                ? '<div class="sd-empty">Searching…</div>'
                : `<div class="sd-empty">No results found for "${esc(q)}"</div>`;
            return;
        }
        const out = mixedHTML(q, S, P, L, A);
        dropdown.innerHTML =
            sug.map((t) => `
                <div class="sd-sug" data-text="${esc(t)}">
                    <span class="sd-sug-icon"><i class="fa-solid fa-magnifying-glass"></i></span>
                    <span class="sd-sug-text">${highlight(t, q)}</span>
                    <button type="button" class="sd-fill" data-act="fill" data-text="${esc(t)}" title="Use this search">
                        <i class="fa-solid fa-arrow-up" style="transform:rotate(-45deg)"></i>
                    </button>
                </div>`).join('') +
            (out.length ? '<div class="sd-divider"></div>' : '') +
            out.join('');
    }

    function renderDropdown(q) {
        const my = ++ddToken;
        const sug = suggestions(q);
        const S = matchSongs(q).slice(0, DD_SONGS);
        const A = findArtists(q).matched.slice(0, DD_ARTISTS).map((x) => x.a);
        dropdownList = S;
        ddItems = {};
        paintDropdown(q, sug, S, [], [], !!window.Social, A);   // lagu & artis langsung tampil, profil & playlist menyusul

        if (!window.Social) return;
        Promise.allSettled([Social.searchProfiles(q), Social.searchPlaylists(q)]).then(([pr, pl]) => {
            if (my !== ddToken || !dropdown.classList.contains('show')) return;
            const P = pr.status === 'fulfilled' ? pr.value.slice(0, DD_OTHERS) : [];
            const L = pl.status === 'fulfilled' ? pl.value.slice(0, DD_OTHERS) : [];
            if (!P.length && !L.length && (sug.length || S.length || A.length)) return;   // tidak ada tambahan, biarkan
            P.forEach((u) => { ddItems[u.id] = u; });
            L.forEach((p) => { ddItems[p.id] = p; });
            paintDropdown(q, sug, S, P, L, false, A);
        });
    }

    dropdown.addEventListener('click', (e) => {
        const fb = e.target.closest('[data-act="friend"]');
        if (fb) { e.stopPropagation(); friendAction(fb.dataset.uid); return; }
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

        // artis -> halaman artis
        const ar = e.target.closest('.sv-item[data-kind="artist"]');
        if (ar) {
            closeDropdown();
            input.blur();
            openArtist(ar.dataset.name);
            return;
        }

        const it = e.target.closest('.sv-item[data-kind]');
        if (it && window.Social) {
            const data = ddItems[it.dataset.id];
            closeDropdown();
            input.blur();
            if (it.dataset.kind === 'profile') {
                if (data) addRecent({ type: 'profile', id: data.id, name: data.displayName || data.username || 'User', username: data.username || '', photo: data.photo || null });
                Social.openProfile(it.dataset.id);
            } else if (data) {
                Social.openPublicPlaylist(data);
            }
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

    // ---------- Halaman hasil: All / Songs / Artists / Playlists / Profiles ----------
    const view = document.createElement('div');
    view.className = 'search-view';
    view.id = 'searchView';
    view.innerHTML = `
        <div class="sv-chips">
            <button type="button" class="sv-chip sv-chip-x" data-cat="all" title="Back to all"><i class="fa-solid fa-xmark"></i></button>
            <button type="button" class="sv-chip active" data-cat="all">All</button>
            <button type="button" class="sv-chip" data-cat="songs">Songs</button>
            <button type="button" class="sv-chip" data-cat="artists">Artists</button>
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
                ${friendBtnHTML(u.id)}
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
                ${friendBtnHTML(u.id)}
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

        // ===== Songs: hasil utama + lagu terkait =====
        if (category === 'songs') {
            resultList = expandSongs(q);
            svList.innerHTML = resultList.length
                ? resultList.map(rowHTML).join('')
                : `<div class="sd-empty">No results found for "${esc(q)}"<br><small>Please make sure your words are spelled correctly.</small></div>`;
            return;
        }

        // ===== Artists: yang cocok dulu, lalu artis yang mirip =====
        if (category === 'artists') {
            const AR = findArtists(q);
            if (!AR.list.length) {
                svList.innerHTML = `<div class="sd-empty">No artists found for "${esc(q)}"</div>`;
                return;
            }
            svList.innerHTML = isMobileView()
                ? AR.list.map(artistRowHTML).join('')
                : '<div class="sv-grid">' + AR.list.map(artistCardHTML).join('') + '</div>';
            return;
        }

        // ===== All: Top result + Songs, lalu campuran artis / lagu / playlist / profil (tanpa duplikat) =====
        if (category === 'all') {
            const S = expandSongs(q);
            let P = [], L = [], note = '';
            svList.innerHTML = '<div class="sd-empty">Searching…</div>';

            if (window.Social) {
                const [pr, pl] = await Promise.allSettled([Social.searchProfiles(q), Social.searchPlaylists(q)]);
                if (token !== searchToken) return;
                if (pr.status === 'fulfilled') P = pr.value;
                if (pl.status === 'fulfilled') L = pl.value;
                if ((pr.status === 'rejected' && pr.reason && pr.reason.message === 'login') ||
                    (pl.status === 'rejected' && pl.reason && pl.reason.message === 'login')) {
                    note = 'Log in to also search profiles and playlists.';
                }
            }

            resultList = S;
            P.forEach((u) => { cardItems[u.id] = u; });
            L.forEach((p) => { cardItems[p.id] = p; });

            const AR = findArtists(q);
            const top = pickTop(AR, S);
            const topArtist = top && top.type === 'artist' ? top.a.name : null;
            const topSongId = top && top.type === 'song' ? top.s.id : null;

            // kolom kanan: 4 lagu teratas (tanpa lagu yang sudah jadi top result)
            const sideSongs = S.filter((s) => s.id !== topSongId).slice(0, 4);
            const shown = new Set(sideSongs.map((s) => s.id));
            if (topSongId !== null) shown.add(topSongId);

            // sisanya: hanya yang belum tampil di atas
            const restS = S.filter((s) => !shown.has(s.id)).slice(0, 30);
            const restA = AR.list.filter((a) => a.name !== topArtist).slice(0, 8);
            const rest = mixedHTML(q, restS, P, L, restA).slice(0, 50);

            if (!top && !sideSongs.length && !rest.length) {
                svList.innerHTML = `<div class="sd-empty">No results found for "${esc(q)}"<br><small>${esc(note || 'Please make sure your words are spelled correctly.')}</small></div>`;
                return;
            }
            svList.innerHTML =
                '<div class="sv-topgrid">' +
                (top ? `<div class="sv-topcol"><h3 class="sv-h">Top result</h3>${topResultHTML(top)}</div>` : '') +
                (sideSongs.length
                    ? `<div class="sv-songscol"><div class="sv-h-row"><h3 class="sv-h">Songs</h3><span class="sv-link" data-cat="songs">Show all</span></div>${sideSongs.map(rowHTML).join('')}</div>`
                    : '') +
                '</div>' +
                (rest.length ? `<h3 class="sv-h">More results</h3>${rest.join('')}` : '') +
                (note ? `<div class="sd-empty"><small>${esc(note)}</small></div>` : '');
            syncTop();
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
        const fb = e.target.closest('[data-act="friend"]');
        if (fb) { e.stopPropagation(); friendAction(fb.dataset.uid); return; }

        // "Show all" di kolom Songs
        const lk = e.target.closest('.sv-link');
        if (lk) { setChip(lk.dataset.cat); renderResults(); return; }

        // tombol play/pause di kartu Top result
        const tp = e.target.closest('.sv-top-play');
        if (tp) {
            e.stopPropagation();
            if (tp.dataset.name) {
                const cid = currentId();
                const cs = cid !== null ? songs.find((s) => s.id === cid) : null;
                if (cs && artistsOf(cs).includes(tp.dataset.name)) play.click();   // jeda / lanjut
                else playArtist(tp.dataset.name);
            } else {
                const id = parseInt(tp.dataset.songId);
                if (id === currentId()) play.click();
                else { addRecent({ type: 'song', id }); playFromSearch(id); }
            }
            refreshRows();
            return;
        }
        // klik kartu Top result: artis -> halaman artis, lagu -> putar
        const top = e.target.closest('.sv-top');
        if (top) {
            if (top.dataset.name) return openArtist(top.dataset.name);
            const id = parseInt(top.dataset.songId);
            if (id === currentId()) play.click();
            else { addRecent({ type: 'song', id }); playFromSearch(id); }
            refreshRows();
            return;
        }
        // artis (kartu maupun baris)
        const arEl = e.target.closest('[data-kind="artist"]');
        if (arEl) return openArtist(arEl.dataset.name);

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

    

    audio.addEventListener('play', refreshRows);
    audio.addEventListener('pause', refreshRows);
    audio.addEventListener('playing', refreshRows);
    firebase.auth().onAuthStateChanged(() => { closeDropdown(); });
})();