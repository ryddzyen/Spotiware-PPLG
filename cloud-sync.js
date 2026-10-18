// ===== cloud-sync.js : playlist + profil tersimpan di akun (Firestore), sama di semua perangkat =====
(() => {
    if (typeof firebase === 'undefined' || !firebase.firestore) return;
    const auth = firebase.auth();
    const db = firebase.firestore();
    const LIKED = LIKED_PLAYLIST_ID;
    const OWNER_KEY = 'spotiware_pl_owner';
    const syncedKey = (u) => 'spotiware_pl_synced_' + u;

    let uid = null, unsub = null, ready = false;
    let applying = false, pushing = false, again = false, timer = null;
    let synced = new Set(), dirty = new Set(), pendingDel = new Set(), sigs = {};

    const col = () => db.collection('users').doc(uid).collection('playlists');
    const sigOf = (p) => { const c = { ...p }; delete c.updatedAt; delete c.lastPlayedAt; return JSON.stringify(c); };
    const isBlank = (p) => !(p.songIds && p.songIds.length) && !p.description && !p.coverImage;
    const readSynced = () => { try { return new Set(JSON.parse(localStorage.getItem(syncedKey(uid))) || []); } catch (e) { return new Set(); } };
    const writeSynced = () => { try { localStorage.setItem(syncedKey(uid), JSON.stringify([...synced])); } catch (e) {} };
    function baseline() { sigs = {}; getPlaylists().forEach((p) => { sigs[p.id] = sigOf(p); }); }

    // ---------- tandai playlist yang berubah ----------
    function stamp(list) {
        const now = Date.now();
        list.forEach((p) => {
            const s = sigOf(p);
            if (sigs[p.id] !== s) { p.updatedAt = now; sigs[p.id] = s; dirty.add(p.id); }
        });
    }
    const _save = savePlaylists;
    savePlaylists = function (list) {
        if (!applying && uid) stamp(list);
        _save(list);
        if (!applying && uid) schedulePush();
    };

    // ---------- kirim ke cloud ----------
    function schedulePush() { clearTimeout(timer); timer = setTimeout(push, 1500); }

    async function push() {
        if (!uid || !ready) return;
        if (pushing) { again = true; return; }
        pushing = true;
        try {
            const list = getPlaylists();
            const ids = new Set(list.map((p) => p.id));
            const toSet = list.filter((p) => dirty.has(p.id) && !(p.id === LIKED && isBlank(p) && !synced.has(LIKED)));
            const toDel = [...new Set([...synced].filter((id) => !ids.has(id)).concat([...pendingDel]))];
            if (toSet.length || toDel.length) {
                const batch = db.batch();
                toSet.forEach((p) => {
                    const data = JSON.parse(JSON.stringify(p));
                    data.updatedAt = data.updatedAt || Date.now();
                    if (data.coverImage && data.coverImage.length > 700000) delete data.coverImage;
                    batch.set(col().doc(p.id), data);
                });
                toDel.forEach((id) => batch.delete(col().doc(id)));
                await batch.commit();
                toSet.forEach((p) => { synced.add(p.id); dirty.delete(p.id); });
                toDel.forEach((id) => { synced.delete(id); pendingDel.delete(id); });
                writeSynced();
            }
        } catch (err) { console.warn('Sync playlist gagal:', err); }
        pushing = false;
        if (again) { again = false; schedulePush(); }
    }

    // ---------- terima dari cloud ----------
    function applyRemote(remote) {
        const local = getPlaylists();
        const lMap = new Map(local.map((p) => [p.id, p]));
        const rMap = new Map(remote.map((p) => [p.id, p]));
        const out = [];
        let changed = false;

        rMap.forEach((r, id) => {
            const l = lMap.get(id);
            if (!l) {
                if (synced.has(id)) pendingDel.add(id);           // dihapus di perangkat ini -> hapus juga di cloud
                else { out.push(r); changed = true; }              // playlist baru dari perangkat lain
                return;
            }
            const lu = l.updatedAt || 0, ru = r.updatedAt || 0;
            if ((isBlank(l) && !isBlank(r)) || ru > lu) {          // versi cloud lebih baru
                out.push({ ...r, lastPlayedAt: l.lastPlayedAt || r.lastPlayedAt || Date.now() });
                changed = true;
            } else {
                out.push(l);
                if (lu > ru) dirty.add(id);                        // versi lokal lebih baru -> kirim
            }
        });
        lMap.forEach((l, id) => {
            if (rMap.has(id)) return;
            if (synced.has(id) && id !== LIKED) { synced.delete(id); changed = true; return; }   // dihapus di perangkat lain
            out.push(l);                                           // playlist baru di perangkat ini
            dirty.add(id);
        });

        remote.forEach((r) => { if (!pendingDel.has(r.id)) synced.add(r.id); });
        writeSynced();

        if (changed) {
            applying = true;
            try { savePlaylists(out); ensureLikedPlaylist(); } finally { applying = false; }
            baseline();
            renderPlaylistList();
            const v = document.getElementById('playlistDetailView');
            if (v && v.classList.contains('show') && pdCurrentPlaylistId &&
                !getPlaylists().some((p) => p.id === pdCurrentPlaylistId)) closePlaylistDetailView();
        }
        ready = true;
        const ids = new Set(getPlaylists().map((p) => p.id));
        if (dirty.size || pendingDel.size || [...synced].some((id) => !ids.has(id))) schedulePush();
    }

    function listen() {
        unsub = col().onSnapshot((snap) => {
            if (snap.metadata.fromCache || snap.metadata.hasPendingWrites) return;
            applyRemote(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }, (err) => console.warn('Sync playlist:', err));
    }

    function wipeLocal() {
        applying = true;
        try { savePlaylists([]); ensureLikedPlaylist(); } finally { applying = false; }
        baseline();
        try { renderPlaylistList(); } catch (e) {}
        const v = document.getElementById('playlistDetailView');
        if (v && v.classList.contains('show')) { try { closePlaylistDetailView(); } catch (e) {} }
    }

    // =====================================================
    // Profil: pulihkan dari cloud SEBELUM social.js menyinkronkan profil
    // =====================================================
    let restoreP = Promise.resolve();

    function idbBanner(userId, dataUrl) {
        return new Promise((resolve) => {
            const r = indexedDB.open('spotiware_profile', 1);
            r.onupgradeneeded = () => r.result.createObjectStore('banners');
            r.onerror = () => resolve();
            r.onsuccess = () => {
                const dbx = r.result;
                const g = dbx.transaction('banners').objectStore('banners').get(userId);
                g.onerror = () => resolve();
                g.onsuccess = async () => {
                    if (g.result) return resolve();            // sudah ada banner di perangkat ini
                    try {
                        const blob = await (await fetch(dataUrl)).blob();
                        const tx = dbx.transaction('banners', 'readwrite');
                        tx.objectStore('banners').put({ type: 'image', blob }, userId);
                        tx.oncomplete = () => resolve();
                        tx.onerror = () => resolve();
                    } catch (e) { resolve(); }
                };
            };
        });
    }

    async function restoreProfile(u) {
        let d;
        try {
            const s = await db.collection('users').doc(u.uid).get();
            if (!s.exists) return;
            d = s.data();
        } catch (e) { return; }
        const K = (n) => 'spotiware_profile_' + n + '_' + u.uid;
        const fill = (n, v) => { try { if (v && !localStorage.getItem(K(n))) localStorage.setItem(K(n), v); } catch (e) {} };
        fill('photo', d.photo);
        fill('bio', d.bio);
        fill('pronouns', d.pronouns);
        fill('username', d.username);
        fill('namecolor', d.nameColor);
        if (d.theme && d.theme.primary) fill('theme', JSON.stringify(d.theme));
        if (d.banner) await idbBanner(u.uid, d.banner);

        const photo = localStorage.getItem(K('photo'));
        const b = document.getElementById('profileAvatarBtn');
        if (b && photo) {
            b.querySelectorAll(':scope > img, :scope > i.fa-user').forEach((n) => n.remove());
            b.insertAdjacentHTML('afterbegin', '<img src="' + photo + '" alt="">');
        }
    }

    if (window.SpotiProfile && SpotiProfile.data) {
        const _data = SpotiProfile.data.bind(SpotiProfile);
        SpotiProfile.data = async () => { await restoreP; return _data(); };
    }

    // =====================================================
    // Login / logout
    // =====================================================
    auth.onAuthStateChanged((user) => {
        if (unsub) { unsub(); unsub = null; }
        clearTimeout(timer);
        dirty = new Set(); pendingDel = new Set(); ready = false;
        const prev = uid;
        uid = user ? user.uid : null;

        if (!user) {
            restoreP = Promise.resolve();
            if (prev) { wipeLocal(); try { localStorage.removeItem(OWNER_KEY); } catch (e) {} }
            return;
        }

        restoreP = restoreProfile(user);
        let owner = null;
        try { owner = localStorage.getItem(OWNER_KEY); } catch (e) {}
        synced = readSynced();
        if (owner && owner !== uid) {                         // data lokal milik akun lain -> ganti dengan milik akun ini
            wipeLocal();
            synced = new Set();
            try { localStorage.removeItem(syncedKey(uid)); } catch (e) {}
        }
        try { localStorage.setItem(OWNER_KEY, uid); } catch (e) {}
        baseline();
        listen();
    });

    // kirim perubahan terakhir sebelum logout
    document.addEventListener('click', (e) => {
        if (e.target.closest('[data-act="logout"]')) { clearTimeout(timer); push(); }
    }, true);
})();