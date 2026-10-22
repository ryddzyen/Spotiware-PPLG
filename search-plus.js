// search-plus.js — hasil pencarian lebih banyak & toleran, tetap sesuai konteks
(function () {
    const STOP = new Set(['the', 'and', 'you', 'your', 'for', 'with', 'feat', 'of', 'to', 'in', 'on', 'a', 'i', 'me', 'my', 'it', 'is',
        'di', 'dan', 'yang', 'ke', 'aku', 'kamu', 'dia', 'ini', 'itu']);
    const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const words = s => norm(s).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    const hash = str => { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0; return h; };

    function lev(a, b, max) {
        if (Math.abs(a.length - b.length) > max) return max + 1;
        let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
        for (let i = 1; i <= a.length; i++) {
            const cur = [i]; let rowMin = i;
            for (let j = 1; j <= b.length; j++) {
                cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
                if (cur[j] < rowMin) rowMin = cur[j];
            }
            if (rowMin > max) return max + 1;
            prev = cur;
        }
        return prev[b.length];
    }

    function score(s, q, toks) {
        const t = norm(s.songName), a = norm(s.songDes);
        const tw = words(s.songName), aw = words(s.songDes), all = tw.concat(aw);
        let sc = 0;
        if (t.includes(q)) sc += t.startsWith(q) ? 120 : 90;
        if (a.includes(q)) sc += 80;
        let hit = 0;
        toks.forEach(k => {
            let best = 0;
            if (all.includes(k)) best = 25;
            else if (all.some(w => w.startsWith(k))) best = 18;
            else if (k.length >= 4 && (t.includes(k) || a.includes(k))) best = 14;
            else if (k.length >= 4) {
                const m = k.length >= 7 ? 2 : 1;
                if (all.some(w => lev(w, k, m) <= m)) best = 10;      // salah ketik kecil
            }
            if (best) { hit++; sc += best; }
        });
        if (toks.length > 1 && hit === toks.length) sc += 30;
        return sc;
    }

    function expand(raw) {
        const q = norm(raw).trim();
        const qw = words(raw);
        let toks = qw.filter(w => w.length >= 3 && !STOP.has(w));
        if (!toks.length) toks = qw;

        const primary = [];
        songs.forEach(s => {
            if (s.hidden) {      // lagu rahasia: hanya lewat keyword (aturan lama)
                const keys = [].concat(s.keyword || s.songName).map(norm);
                if (keys.some(k => k.includes(q))) primary.push({ s, sc: 200 });
                return;
            }
            const sc = score(s, q, toks);
            if (sc >= 10) primary.push({ s, sc });
        });
        primary.sort((a, b) => b.sc - a.sc || a.s.songName.localeCompare(b.s.songName));

        const out = [], seen = new Set();
        const push = s => { if (s && !seen.has(s.id)) { seen.add(s.id); out.push(s); } };
        primary.slice(0, 80).forEach(x => push(x.s));
        if (!out.length) return out;

        // terkait 1: lagu lain dari artis hasil teratas
        const artists = [];
        out.slice(0, 5).forEach(s => { const a = s.artists && s.artists[0]; if (a && !artists.includes(a)) artists.push(a); });
        artists.slice(0, 3).forEach(a => visibleSongs.filter(s => s.artists.includes(a)).forEach(push));

        // terkait 2: sedikit lagu dari genre yang sama (urutan stabil, tidak berubah-ubah tiap ketikan)
        const g = out[0].genre;
        if (g && g !== 'Lainnya') {
            visibleSongs.filter(s => s.genre === g && !seen.has(s.id))
                .sort((x, y) => hash(x.songName + q) - hash(y.songName + q))
                .slice(0, 12).forEach(push);
        }
        return out.slice(0, 120);
    }

    function init() {
        if (typeof window.renderSongs !== 'function' || typeof visibleSongs === 'undefined') return setTimeout(init, 300);
        const orig = window.renderSongs;
        window.renderSongs = function (list, options) {
            const input = document.querySelector('.input-box');
            const q = input ? input.value.trim() : '';
            const opts = options || {};
            if (q && !opts.playlistId && list !== homeSongsOrder) list = expand(q);
            return orig.call(this, list, opts);
        };
    }

    init();
})();