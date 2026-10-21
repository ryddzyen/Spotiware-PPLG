// onboarding.js — Tahap 2a: pilih genre & artis favorit (disimpan per akun)
(function () {
    const MIN_GENRE = 3, MIN_ARTIST = 3, MAX_ARTIST_SHOWN = 18;
    let step = 1, selGenres = new Set(), selArtists = new Set(), overlay = null;

    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const uid = () => (typeof accountUid !== 'undefined' && accountUid) ? accountUid : 'guest';
    const KEY = () => 'spotiware_prefs:' + uid();

    function getPrefs() {
        try { return JSON.parse(localStorage.getItem(KEY())); } catch (e) { return null; }
    }
    function savePrefs(p) {
        try { localStorage.setItem(KEY(), JSON.stringify(p)); } catch (e) { }
        window.dispatchEvent(new Event('spotiware:prefs'));
    }

    function injectStyle() {
        const css = document.createElement('style');
        css.textContent = `
            .ob{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;padding:1rem}
            .ob-box{background:#181818;border-radius:14px;width:min(760px,100%);max-height:90vh;display:flex;flex-direction:column;overflow:hidden;color:#fff}
            .ob-head{padding:1.4rem 1.6rem .4rem}
            .ob-head h2{margin:0 0 .3rem;font-size:1.4rem}
            .ob-head p{margin:0;opacity:.7;font-size:.9rem}
            .ob-body{padding:1rem 1.6rem;overflow-y:auto}
            .ob-chips{display:flex;flex-wrap:wrap;gap:.6rem}
            .ob-chip{background:rgba(255,255,255,.1);color:#fff;border:2px solid transparent;border-radius:2rem;padding:.6rem 1.1rem;font:inherit;font-size:.95rem;cursor:pointer}
            .ob-chip:hover{background:rgba(255,255,255,.18)}
            .ob-chip.on{background:#fff;color:#000}
            .ob-artists{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:1rem}
            .ob-artist{text-align:center;cursor:pointer;position:relative}
            .ob-artist img{width:100%;aspect-ratio:1;border-radius:50%;object-fit:cover;background:#2f2f2f;border:3px solid transparent;box-sizing:border-box}
            .ob-artist.on img{border-color:#fff}
            .ob-artist span{display:block;margin-top:.4rem;font-size:.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
            .ob-artist .ob-tick{position:absolute;top:2px;right:8px;width:24px;height:24px;border-radius:50%;background:#fff;color:#000;display:none;align-items:center;justify-content:center;font-size:.75rem}
            .ob-artist.on .ob-tick{display:flex}
            .ob-foot{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem 1.6rem;border-top:1px solid rgba(255,255,255,.1)}
            .ob-skip{background:none;border:none;color:#b3b3b3;font:inherit;cursor:pointer}
            .ob-skip:hover{color:#fff}
            .ob-next{background:#fff;color:#000;border:none;border-radius:2rem;padding:.65rem 1.6rem;font:inherit;font-weight:700;cursor:pointer}
            .ob-next:disabled{opacity:.35;cursor:not-allowed}
            .ob-count{font-size:.85rem;opacity:.7;flex:1;text-align:center}
            .ht-prefs-btn{margin-left:auto;background:transparent;color:#fff;border:1px solid rgba(255,255,255,.35);border-radius:2rem;padding:.45rem 1rem;font:inherit;font-size:.82rem;cursor:pointer}
            .ht-prefs-btn:hover{background:rgba(255,255,255,.15)}
        `;
        document.head.appendChild(css);
    }

    function genreList() {
        return Object.keys(window.GENRE_ARTISTS || {}).filter(g => getSongsByGenre(g).length > 0);
    }

    function artistList() {
        const map = {};
        visibleSongs.forEach(s => {
            if (!selGenres.has(s.genre)) return;
            s.artists.forEach(a => { if (a && a !== 'Unknown') (map[a] = map[a] || { name: a, img: s.songImage, n: 0 }).n++; });
        });
        return Object.values(map).filter(a => a.n >= 2)
            .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name)).slice(0, MAX_ARTIST_SHOWN);
    }

    function render() {
        const isG = step === 1;
        const need = isG ? MIN_GENRE : MIN_ARTIST;
        const have = isG ? selGenres.size : selArtists.size;

        const body = isG
            ? `<div class="ob-chips">${genreList().map(g =>
                `<button class="ob-chip${selGenres.has(g) ? ' on' : ''}" data-g="${esc(g)}">${esc(g)}</button>`).join('')}</div>`
            : `<div class="ob-artists">${artistList().map(a =>
                `<div class="ob-artist${selArtists.has(a.name) ? ' on' : ''}" data-a="${esc(a.name)}">
                    <img src="${esc(a.img)}" alt="" loading="lazy"><div class="ob-tick"><i class="fa-solid fa-check"></i></div>
                    <span>${esc(a.name)}</span></div>`).join('')}</div>`;

        overlay.innerHTML = `
            <div class="ob-box">
                <div class="ob-head">
                    <h2>${isG ? 'Pilih genre yang kamu suka' : 'Pilih artis favoritmu'}</h2>
                    <p>${isG ? `Pilih minimal ${MIN_GENRE} genre.` : `Pilih minimal ${MIN_ARTIST} artis.`}</p>
                </div>
                <div class="ob-body">${body}</div>
                <div class="ob-foot">
                    <button class="ob-skip" id="obSkip">Lewati</button>
                    <div class="ob-count">${have} dipilih${have < need ? ` · kurang ${need - have}` : ''}</div>
                    <button class="ob-next" id="obNext"${have < need ? ' disabled' : ''}>${isG ? 'Lanjut' : 'Selesai'}</button>
                </div>
            </div>`;
    }

    function close() { overlay?.remove(); overlay = null; }

    function open() {
        if (overlay) return;
        const old = getPrefs();
        selGenres = new Set(old && old.genres || []);
        selArtists = new Set(old && old.artists || []);
        step = 1;

        overlay = document.createElement('div');
        overlay.className = 'ob';
        document.body.appendChild(overlay);

        overlay.addEventListener('click', e => {
            const chip = e.target.closest('.ob-chip');
            if (chip) {
                const g = chip.dataset.g;
                selGenres.has(g) ? selGenres.delete(g) : selGenres.add(g);
                return render();
            }
            const art = e.target.closest('.ob-artist');
            if (art) {
                const a = art.dataset.a;
                selArtists.has(a) ? selArtists.delete(a) : selArtists.add(a);
                return render();
            }
            if (e.target.id === 'obSkip') {
                savePrefs({ skipped: true, genres: [...selGenres], artists: [...selArtists] });
                return close();
            }
            if (e.target.id === 'obNext') {
                if (step === 1) {
                    step = 2;
                    // buang artis lama yang genre-nya sudah tidak dipilih
                    const valid = new Set(artistList().map(a => a.name));
                    selArtists = new Set([...selArtists].filter(a => valid.has(a)));
                    return render();
                }
                savePrefs({ genres: [...selGenres], artists: [...selArtists] });
                close();
            }
        });
        render();
    }

    function checkAndShow() {
        const p = getPrefs();
        if (!p) open();
    }

    function addButton() {
        const bar = document.querySelector('.ht-bar');
        if (!bar) return setTimeout(addButton, 400);
        if (bar.querySelector('.ht-prefs-btn')) return;
        const b = document.createElement('button');
        b.className = 'ht-prefs-btn';
        b.textContent = 'Atur selera';
        b.addEventListener('click', open);
        bar.appendChild(b);
    }

    window.Prefs = { get: getPrefs, open };

    function init() {
        if (typeof getSongsByGenre !== 'function' || !window.GENRE_ARTISTS) return setTimeout(init, 300);
        injectStyle();
        addButton();
        setTimeout(checkAndShow, 1500);   // beri waktu login Firebase menentukan akun
        window.addEventListener('spotiware:account-changed', () => setTimeout(() => { if (!overlay) checkAndShow(); }, 400));
    }

    init();
})();