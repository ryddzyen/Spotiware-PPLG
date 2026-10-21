// home-music.js — tab Music (+ dipakai juga oleh tab All lewat window.HomeMusic)
(function () {
    const COLORS = ['#8ee9d6', '#ff9f7a', '#9defb3', '#8aa6e8', '#f2b8d6', '#f5d77a', '#b9a6f0', '#7fd0f0'];
    const rows = {};          // key -> daftar lagu (untuk Show all & putar)
    const radioLists = {};    // artis -> daftar lagu radio yang sedang diputar
    let activeRadio = null;
    let styled = false;

    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const shuf = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const R = () => window.Reco;

    // cadangan kalau recommend.js belum dimuat
    window.getRecommendedSongs = window.getRecommendedSongs || (n => shuf(visibleSongs).slice(0, n));

    function injectStyle() {
        if (styled) return;
        styled = true;
        const css = document.createElement('style');
        css.textContent = `
            .hm .hm-sub{font-size:.8rem;opacity:.7;margin:1.4rem 0 -.2rem;padding:0 .2rem}
            .hm .hm-scroll{display:flex;gap:1.2rem;overflow-x:auto;padding:.4rem .2rem 1rem;scrollbar-width:none}
            .hm .hm-scroll::-webkit-scrollbar{display:none}
            .hm .hm-radio{flex:0 0 auto;width:170px;cursor:pointer}
            .hm .hm-radio-art{height:170px;border-radius:8px;padding:10px;box-sizing:border-box;position:relative;overflow:hidden;color:#000}
            .hm .hm-radio-art small{font-weight:700;letter-spacing:.08em;font-size:.65rem}
            .hm .hm-radio-art b{position:absolute;left:10px;bottom:10px;right:58px;font-size:1.25rem;line-height:1.1}
            .hm .hm-radio-art img{position:absolute;right:-18px;top:30px;width:110px;height:110px;border-radius:50%;object-fit:cover;opacity:.95}
            .hm .hm-play{position:absolute;right:10px;bottom:10px;width:40px;height:40px;border-radius:50%;
                background:var(--yellow,#1ed760);color:#000;display:flex;align-items:center;justify-content:center;
                opacity:0;transform:translateY(6px);transition:opacity .2s,transform .2s;box-shadow:0 6px 14px rgba(0,0,0,.35);z-index:2}
            .hm .hm-radio:hover .hm-play,.hm .hm-radio.playing .hm-play{opacity:1;transform:none}
            @media (hover:none){.hm .hm-play{opacity:1;transform:none}}
            .hm .hm-radio p{margin:.5rem 0 0;font-size:.8rem;opacity:.7;line-height:1.3}
            .hm .hm-artist{flex:0 0 auto;width:150px;text-align:center;cursor:pointer}
            .hm .hm-artist img{width:150px;height:150px;border-radius:50%;object-fit:cover;background:#2f2f2f}
            .hm .hm-artist span{display:block;margin-top:.5rem;font-size:.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
            .hm .hm-artist small{opacity:.6;font-size:.78rem}
            .hm .hm-more-head{display:flex;align-items:center;gap:.8rem}
            .hm .hm-more-head img{width:44px;height:44px;border-radius:50%;object-fit:cover}
            .hm .hm-more-head small{display:block;font-size:.75rem;opacity:.7}
            .hm .hm-more-head h2{margin:0}
        `;
        document.head.appendChild(css);
    }

    function songCard(song) {
        return `
            <div class="music-card" data-song-id="${song.id}">
                <div class="music-card-art">
                    <img src="${esc(song.songImage)}" alt="${esc(song.songName)}" loading="lazy" decoding="async">
                    <div class="music-play-btn"><i class="fa-solid fa-circle-play"></i></div>
                </div>
                <div class="music-card-info">
                    <div class="music-card-text">
                        <div class="img-title">${esc(song.songName)}</div>
                        <div class="img-description">${esc(song.songDes)}</div>
                    </div>
                    <button class="card-more-btn" data-song-id="${song.id}" title="More"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                </div>
            </div>`;
    }

    function songRow(key, title, list, headHTML) {
        rows[key] = list;
        return `
            <div class="ht-row" data-key="${key}">
                <div class="music-section-header">
                    ${headHTML || `<h2>${esc(title)}</h2>`}
                    <span class="show-all-link hm-all" data-key="${key}" data-title="${esc(title)}">Show all</span>
                </div>
                <div class="songs-wrapper"><div class="songs">${list.slice(0, 20).map(songCard).join('')}</div></div>
            </div>`;
    }

    // ---- data artis ----
    function artistStats() {
        const map = {};
        visibleSongs.forEach(s => s.artists.forEach(a => {
            if (!a || a === 'Unknown') return;
            (map[a] = map[a] || { name: a, songs: [], genre: s.genre });
            map[a].songs.push(s);
        }));
        return Object.values(map);
    }
    const artistImg = a => (a.songs[0] && a.songs[0].songImage) || 'img/pplglogo.png';

    function radioCard(a, i, all) {
        const mates = shuf(all.filter(x => x.genre === a.genre && x.name !== a.name)).slice(0, 3).map(x => x.name);
        return `
            <div class="hm-radio" data-artist="${esc(a.name)}">
                <div class="hm-radio-art" style="background:${COLORS[i % COLORS.length]}">
                    <small>RADIO</small>
                    <img src="${esc(artistImg(a))}" alt="">
                    <b>${esc(a.name)}</b>
                    <div class="hm-play"><i class="fa-solid fa-play"></i></div>
                </div>
                <p>With ${esc(mates.join(', ') || a.name)} and more</p>
            </div>`;
    }

    function artistCard(a) {
        return `
            <div class="hm-artist" data-artist="${esc(a.name)}">
                <img loading="lazy" src="${esc(artistImg(a))}" alt="">
                <span>${esc(a.name)}</span>
                <small>Artist</small>
            </div>`;
    }

    function moreLike(key, a) {
        const list = shuf(visibleSongs.filter(s => s.genre === a.genre && !s.artists.includes(a.name))).slice(0, 30);
        if (list.length < 6) return '';
        const head = `<div class="hm-more-head"><img src="${esc(artistImg(a))}" alt=""><div><small>More like</small><h2>${esc(a.name)}</h2></div></div>`;
        return songRow(key, 'More like ' + a.name, list, head);
    }

    function radioPlaylist(name) {
        const art = visibleSongs.filter(s => s.artists.includes(name));
        if (!art.length) return [];
        const genre = art[0].genre;
        const rest = shuf(visibleSongs.filter(s => s.genre === genre && !art.includes(s))).slice(0, 40);
        return [shuf(art)[0], ...shuf([...art, ...rest])];
    }

    // prefix: pembeda kunci antar tampilan | afterArtists: HTML tambahan setelah "Popular artists"
    function build(prefix, afterArtists) {
        prefix = prefix || '';
        const stats = artistStats();
        const byCount = [...stats].sort((a, b) => b.songs.length - a.songs.length || a.name.localeCompare(b.name));
        const popular = byCount.filter(a => a.songs.length >= 2).slice(0, 12);
        const popNames = new Set(popular.map(a => a.name));

        // Suggested artists: dipersonalisasi kalau ada selera/riwayat
        const suggested = R() && R().suggested
            ? R().suggested(stats, popNames)
            : shuf(stats.filter(a => !popNames.has(a.name))).slice(0, 12);

        // More like: pakai artis yang paling sering dipilih/didengar
        const base = shuf(stats.filter(a => a.songs.length >= 2 && a.genre !== 'Lainnya'));
        const seeds = R() && R().seeds ? R().seeds(stats) : null;
        const pickable = seeds ? [...seeds, ...base.filter(x => !seeds.includes(x))] : base;

        let html = '';
        html += songRow(prefix + 'rec', 'Recommended for you', window.getRecommendedSongs(30));
        html += `<div class="ht-row"><div class="music-section-header"><h2>Popular radio</h2></div>
                 <div class="hm-scroll">${popular.slice(0, 8).map((a, i) => radioCard(a, i, stats)).join('')}</div></div>`;
        html += `<div class="ht-row"><div class="music-section-header"><h2>Popular artists</h2></div>
                 <div class="hm-scroll">${popular.map(artistCard).join('')}</div></div>`;
        html += afterArtists || '';
        html += `<div class="ht-row" data-blk="sug"><div class="hm-sub">Inspired by your recent activity</div>
                 <div class="music-section-header"><h2>Suggested artists</h2></div>
                 <div class="hm-scroll">${suggested.map(artistCard).join('')}</div></div>`;
        if (pickable[0]) html += moreLike(prefix + 'more1', pickable[0]);
        if (pickable[1]) html += moreLike(prefix + 'more2', pickable[1]);
        return html;
    }

    // hitung ulang baris yang dipersonalisasi (Recommended, Suggested, More like) tanpa menyentuh yang lain
    function refresh() {
        [['htMusicView', 'm_'], ['htAllView', 'a_']].forEach(([id, prefix]) => {
            const view = document.getElementById(id);
            if (!view) return;
            const tmp = document.createElement('div');
            tmp.innerHTML = build(prefix);
            tmp.querySelectorAll('[data-key],[data-blk]').forEach(n => {
                const k = n.dataset.key;
                const dynamic = k ? /(rec|more1|more2)$/.test(k) : n.dataset.blk === 'sug';
                if (!dynamic) return;
                const old = view.querySelector(k ? `.ht-row[data-key="${k}"]` : '.ht-row[data-blk="sug"]');
                if (old) old.replaceWith(n);
            });
        });
        if (typeof attachCardMoreButtonEvents === 'function') attachCardMoreButtonEvents();
        syncRadio();
    }

    // ikon play/pause di kartu radio
    function syncRadio() {
        document.querySelectorAll('.hm-radio').forEach(el => {
            const n = el.dataset.artist;
            const on = activeRadio === n && playerBar.classList.contains('show') && !audio.paused &&
                (radioLists[n] || []).some(s => s.id === getCurrentSong().id);
            const icon = el.querySelector('.hm-play i');
            if (icon) icon.className = on ? 'fa-solid fa-pause' : 'fa-solid fa-play';
            el.classList.toggle('playing', on);
        });
    }

    function wire(view) {
        view.addEventListener('click', e => {
            const radio = e.target.closest('.hm-radio');
            if (radio) {
                const n = radio.dataset.artist;
                const inThisRadio = activeRadio === n && playerBar.classList.contains('show') &&
                    (radioLists[n] || []).some(s => s.id === getCurrentSong().id);
                if (inThisRadio) { play.click(); return; }          // jeda / lanjut
                const list = radioPlaylist(n);
                if (list.length) { activeRadio = n; radioLists[n] = list; playSongFromList(list[0].id, list); }
                return;
            }
            const artist = e.target.closest('.hm-artist');
            if (artist) {
                const n = artist.dataset.artist;
                return openShowAllView(n, visibleSongs.filter(s => s.artists.includes(n)));
            }
            const all = e.target.closest('.hm-all');
            if (all) return openShowAllView(all.dataset.title, rows[all.dataset.key] || []);

            const art = e.target.closest('.music-card-art');
            if (!art) return;
            const id = parseInt(art.closest('.music-card').dataset.songId);
            const list = rows[art.closest('.ht-row').dataset.key] || [];
            if (playerBar.classList.contains('show') && getCurrentSong().id === id) play.click();
            else playSongFromList(id, list);
        });
    }

    window.HomeMusic = { injectStyle, build, wire, syncRadio, refresh };

    function init() {
        const view = document.getElementById('htMusicView');
        if (!view || typeof getSongsByGenre !== 'function' || typeof openShowAllView !== 'function') {
            return setTimeout(init, 300);   // tunggu home-tabs.js
        }
        injectStyle();
        view.classList.add('hm');
        view.innerHTML = build('m_');
        wire(view);
        if (typeof attachCardMoreButtonEvents === 'function') attachCardMoreButtonEvents();
        audio.addEventListener('play', syncRadio);
        audio.addEventListener('pause', syncRadio);

        // selera berubah / akun berganti -> hitung ulang baris yang dipersonalisasi
        window.addEventListener('spotiware:prefs', () => setTimeout(refresh, 100));
        window.addEventListener('spotiware:account-changed', () => setTimeout(refresh, 600));
    }

    init();
})();