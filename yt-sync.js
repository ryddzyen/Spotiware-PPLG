// yt-sync.js — sinkron metadata lagu YouTube (yang ada di playlist / Liked Songs) ke Firestore
(() => {
    if (typeof firebase === 'undefined' || !firebase.firestore) return;
    const auth = firebase.auth(), db = firebase.firestore();
    const ID_BASE = 20000000000;
    let uid = null, timer = null, busy = false;

    const col = () => db.collection('users').doc(uid).collection('ytsongs');
    const pk = () => 'spotiware_ytsync_pushed:' + uid;
    const readPushed = () => { try { return new Set(JSON.parse(localStorage.getItem(pk())) || []); } catch (e) { return new Set(); } };
    const writePushed = (s) => { try { localStorage.setItem(pk(), JSON.stringify([...s])); } catch (e) { } };
    const cache = () => { try { return JSON.parse(localStorage.getItem('spotiware_yt_cache')) || {}; } catch (e) { return {}; } };

    function usedIds() {
        const ids = new Set();
        getPlaylists().forEach((p) => (p.songIds || []).forEach((i) => { if (i >= ID_BASE) ids.add(i); }));
        return ids;
    }

    function schedule() { clearTimeout(timer); timer = setTimeout(push, 2500); }

    // kirim metadata lagu YouTube yang sudah ada di playlist tapi belum ada di cloud
    async function push() {
        if (!uid || busy) return;
        busy = true;
        let more = false;
        try {
            const pushed = readPushed(), c = cache();
            const todo = [...usedIds()].filter((i) => !pushed.has(i) && c[i]).slice(0, 400);
            if (todo.length) {
                const b = db.batch();
                todo.forEach((i) => {
                    const m = c[i];
                    b.set(col().doc(String(i)), { id: m.id, title: m.title, artist: m.artist, thumb: m.thumb || '', duration: m.duration || 0 });
                });
                await b.commit();
                todo.forEach((i) => pushed.add(i));
                writePushed(pushed);
                more = todo.length === 400;
            }
        } catch (e) { console.warn('Sync lagu YouTube gagal:', e); }
        busy = false;
        if (more) schedule();
    }

    // ambil metadata dari cloud, daftarkan ke songs[] supaya playlist & Liked Songs tampil utuh di perangkat ini
    async function pull() {
        if (!window.YTMusic) return setTimeout(pull, 400);      // tunggu yt-music.js
        try {
            const snap = await col().get();
            if (snap.empty) return;
            const metas = snap.docs.map((d) => d.data()).filter((m) => m && m.id && m.title);
            const pushed = readPushed();
            YTMusic.register(metas);
            metas.forEach((m) => pushed.add(YTMusic.idOf(m.id)));
            writePushed(pushed);

            renderPlaylistList();
            renderHistory();
            const v = document.getElementById('playlistDetailView');
            if (v && v.classList.contains('show') && pdCurrentPlaylistId && !String(pdCurrentPlaylistId).startsWith('yt:')) {
                const p = getPlaylists().find((x) => x.id === pdCurrentPlaylistId);
                if (p) openPlaylistDetailView(p, pdCurrentIsLiked);
            }
        } catch (e) { console.warn('Ambil lagu YouTube dari cloud gagal:', e); }
    }

    // setiap playlist / Liked Songs berubah, jadwalkan pengiriman
    const _save = savePlaylists;
    savePlaylists = function (list) { _save(list); if (uid) schedule(); };

    auth.onAuthStateChanged((user) => {
        uid = user ? user.uid : null;
        if (uid) pull().then(push);
    });
})();