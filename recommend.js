// recommend.js — Tahap 2b: rekomendasi dari selera + riwayat + Liked Songs
(function () {
    const shuf = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const add = (o, k, v) => { if (k) o[k] = (o[k] || 0) + v; };

    function profile() {
        const g = {}, a = {};

        // 1) pilihan awal (onboarding)
        const p = window.Prefs && Prefs.get();
        if (p) {
            (p.genres || []).forEach(x => add(g, x, 3));
            (p.artists || []).forEach(x => {
                add(a, x, 5);
                const s = visibleSongs.find(v => v.artists.includes(x));
                if (s) add(g, s.genre, 1);
            });
        }

        // 2) riwayat putar (yang terbaru bobotnya lebih besar)
        try {
            playHistory.slice(0, 30).forEach((s, i) => {
                const w = 1 + (30 - i) / 30;
                add(g, s.genre, w);
                s.artists.forEach(x => add(a, x, w * 1.5));
            });
        } catch (e) { }

        // 3) Liked Songs
        try {
            const liked = getPlaylists().find(x => x.id === LIKED_PLAYLIST_ID);
            (liked ? liked.songIds : []).forEach(id => {
                const s = songs.find(v => v.id === id);
                if (!s || !s.genre) return;
                add(g, s.genre, 2);
                s.artists.forEach(x => add(a, x, 3));
            });
        } catch (e) { }

        const has = Object.keys(g).length > 0 || Object.keys(a).length > 0;
        return { g, a, has };
    }

    const scoreSong = (s, P) => {
        let am = 0;
        s.artists.forEach(x => { am = Math.max(am, P.a[x] || 0); });
        return (P.g[s.genre] || 0) + am;
    };

    function recommended(n) {
        const P = profile();
        if (!P.has) return shuf(visibleSongs).slice(0, n);

        const ranked = visibleSongs
            .map(s => ({ s, v: scoreSong(s, P) + Math.random() * 3 }))
            .sort((x, y) => y.v - x.v);

        const out = [], perArtist = {};
        for (const { s } of ranked) {
            const k = s.artists[0] || '';
            if ((perArtist[k] || 0) >= 3) continue;      // variasi: maksimal 3 lagu per artis
            perArtist[k] = (perArtist[k] || 0) + 1;
            out.push(s);
            if (out.length >= n) break;
        }
        return shuf(out.slice(0, 8)).concat(out.slice(8));   // beberapa teratas diacak sedikit
    }

    // artis dari genre favorit yang belum pernah dipilih / didengar
    function suggested(stats, excludeNames) {
        const P = profile();
        const pool = stats.filter(a => !excludeNames.has(a.name));
        if (!P.has) return shuf(pool).slice(0, 12);
        const fresh = pool.filter(a => !(P.a[a.name] > 0));
        return (fresh.length >= 6 ? fresh : pool)
            .map(a => ({ a, v: (P.g[a.genre] || 0) + Math.random() * 2 }))
            .sort((x, y) => y.v - x.v)
            .slice(0, 12).map(x => x.a);
    }

    // artis contoh untuk baris "More like": yang paling sering dipilih / didengar
    function seeds(stats) {
        const P = profile();
        if (!P.has) return null;
        const top = stats
            .filter(a => a.songs.length >= 2 && a.genre !== 'Lainnya' && P.a[a.name] > 0)
            .sort((x, y) => P.a[y.name] - P.a[x.name])
            .slice(0, 6);
        return top.length ? shuf(top).slice(0, 2) : null;
    }

    window.Reco = { profile, recommended, suggested, seeds };
    window.getRecommendedSongs = n => recommended(n);     // dipakai home-music.js
})();