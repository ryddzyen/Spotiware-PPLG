// ===== recent-playlists.js : riwayat playlist orang lain yang diputar (tampil di kotak beranda) =====
(() => {
    const db = firebase.firestore();
    const MAX = 8;
    const seen = {};     // playlist orang lain yang pernah muncul (hasil pencarian / dibuka)
    const me = () => firebase.auth().currentUser;
    const key = () => 'spotiware_recent_playlists_' + (me() ? me().uid : 'guest');

    const read = () => { try { return JSON.parse(localStorage.getItem(key())) || []; } catch (e) { return []; } };
    const write = (l) => { try { localStorage.setItem(key(), JSON.stringify(l.slice(0, MAX))); } catch (e) {} };
    const notify = () => window.dispatchEvent(new Event('spotiware:recent-playlists'));

    function slim(p) {
        return {
            id: p.id,
            name: p.name || 'Playlist',
            description: String(p.description || '').slice(0, 300),
            cover: (p.cover && p.cover.length < 60000) ? p.cover : null,   // foto terlalu besar tidak disimpan
            songIds: p.songIds || [],
            ownerUid: p.ownerUid || '',
            ownerName: p.ownerName || '',
            ownerUsername: p.ownerUsername || ''
        };
    }

    function remember(list) {
        (Array.isArray(list) ? list : [list]).forEach((p) => { if (p && p.id) seen[p.id] = slim(p); });
    }

    function record(p) {
        if (!p || (me() && p.ownerUid === me().uid)) return;   // playlist sendiri sudah ada di Library
        const item = slim(p);
        item.t = Date.now();
        write([item].concat(read().filter((x) => x.id !== item.id)));
        notify();
    }

    // ---------- Tangkap playlist yang muncul ----------
    function patchSocial() {
        if (!window.Social || Social.__rpPatched) return;
        Social.__rpPatched = true;

        const sp = Social.searchPlaylists;
        Social.searchPlaylists = async (...a) => { const r = await sp(...a); remember(r); return r; };

        const op = Social.openPublicPlaylist;
        Social.openPublicPlaylist = (item) => { remember(item); return op(item); };
    }
    patchSocial();
    window.addEventListener('load', patchSocial);

    // playlist orang yang dibuka dari mana pun (profil, link, pencarian): ambil datanya dari Firestore
    const _open = openPlaylistDetailView;
    openPlaylistDetailView = function (pl, isLiked) {
        _open(pl, isLiked);
        if (pl && String(pl.id).startsWith('pub_')) {
            const id = pl.id.slice(4);
            if (!seen[id]) {
                db.collection('publicPlaylists').doc(id).get()
                    .then((s) => { if (s.exists) remember({ id, ...s.data() }); })
                    .catch(() => {});
            }
        }
    };

    // ---------- Catat saat lagu dari playlist orang diputar ----------
    let validIds = null;
    const isSong = (id) => {
        if (!validIds) validIds = new Set(songs.map((s) => s.id));
        return validIds.has(id);
    };
    const sameSet = (a, b) => a.length === b.length && b.every((x) => a.includes(x));

    const _play = playSongFromList;
    playSongFromList = function (songId, songList) {
        _play(songId, songList);
        try {
            const ids = (songList || []).map((s) => s.id);
            if (!ids.length) return;
            let hit = null;
            Object.keys(seen).forEach((k) => {
                const it = seen[k];
                if (it.ownerUid && sameSet(ids, (it.songIds || []).filter(isSong))) hit = it;
            });
            if (hit) record(hit);
        } catch (e) { console.warn(e); }
    };

    // ---------- Dipakai kotak beranda ----------
    async function openRecent(id) {
        const stored = read().find((x) => x.id === id);
        if (!stored) return;
        let item = stored;
        try {
            const s = await db.collection('publicPlaylists').doc(id).get();
            if (!s.exists) {
                write(read().filter((x) => x.id !== id));
                notify();
                showToast('This playlist is no longer available');
                return;
            }
            item = { id, ...s.data() };
        } catch (e) { /* offline: pakai data tersimpan */ }
        if (window.Social) Social.openPublicPlaylist(item);
    }

    window.RecentPL = { list: read, open: openRecent };
    firebase.auth().onAuthStateChanged(notify);
})();