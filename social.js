// ===== Social: sinkron profil ke Firestore, pertemanan, inbox, playlist publik, pencarian =====
(() => {
    if (typeof firebase === 'undefined' || !firebase.firestore) {
        console.warn('Firestore belum dimuat (cek firebase-firestore-compat.js).');
        return;
    }
    const auth = firebase.auth();
    const db = firebase.firestore();
    const FV = firebase.firestore.FieldValue;
    const DEFAULT_THEME = { primary: '#3b2f00', accent: '#121212' };

    let me = null;
    let friendships = [];
    let unsubFriends = null;
    let friendsToken = 0;
    let viewUid = null;
    let lastSig = null;
    let syncTimer = null;
    const userCache = {};

    const rightPart = document.querySelector('.main-right-part');

    const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const pairId = (a, b) => [a, b].sort().join('_');
    const pubId = (pid) => me.uid + '_' + pid;
    const other = (f) => f.users.find((x) => x !== me.uid);

    function fillAvatar(el, src, icon) {
        el.innerHTML = '';
        if (src) {
            const img = document.createElement('img');
            img.alt = '';
            img.src = src;
            el.appendChild(img);
        } else {
            el.innerHTML = `<i class="fa-solid ${icon || 'fa-user'}"></i>`;
        }
    }

    function coverOf(p) {
        if (p.cover) return p.cover;
        const first = (p.songIds || [])[0];
        const s = songs.find((x) => x.id === first);
        return s ? s.songImage : null;
    }

    // =====================================================
    // 1. Sinkron profil sendiri ke Firestore
    // =====================================================
    function blobToBannerDataUrl(blob) {
        return new Promise((resolve) => {
            const url = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(url);
                const encode = (max, q) => {
                    const s = Math.min(1, max / Math.max(img.width, img.height));
                    const w = Math.round(img.width * s), h = Math.round(img.height * s);
                    const c = document.createElement('canvas');
                    c.width = w; c.height = h;
                    c.getContext('2d').drawImage(img, 0, 0, w, h);
                    return c.toDataURL('image/jpeg', q);
                };
                let out = encode(1000, 0.7);
                if (out.length > 600000) out = encode(700, 0.55);
                resolve(out.length > 650000 ? null : out);
            };
            img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
            img.src = url;
        });
    }

    async function syncMyProfile() {
        if (!me || !window.SpotiProfile) return;
        const d = await SpotiProfile.data();
        if (!d) return;
        let banner = null;
        if (d.banner && d.banner.type === 'image') banner = await blobToBannerDataUrl(d.banner.blob);
        try {
            await db.collection('users').doc(d.uid).set({
                uid: d.uid,
                displayName: d.name,
                nameLower: d.name.toLowerCase(),
                username: d.username,
                usernameLower: d.username.toLowerCase(),
                photo: d.photo || null,
                bio: d.bio || '',
                pronouns: d.pronouns || '',
                theme: d.theme,
                nameColor: d.nameColor || '',
                banner,
                updatedAt: FV.serverTimestamp()
            }, { merge: true });
        } catch (err) {
            console.warn('Gagal sinkron profil:', err);
        }
    }

    async function isUsernameFree(un) {
        if (!me) return true;
        const snap = await db.collection('users')
            .where('usernameLower', '==', un.toLowerCase()).limit(3).get();
        return snap.docs.every((d) => d.id === me.uid);
    }

    window.addEventListener('spotiware:profile-saved', () => {
        syncMyProfile();
        schedulePublishSync();
    });

    // =====================================================
    // 2. Playlist publik ("Make public")
    // =====================================================
    const publishedKey = () => 'spotiware_published_' + (me ? me.uid : '');
    const readPublished = () => {
        try { return JSON.parse(localStorage.getItem(publishedKey())) || []; } catch (e) { return []; }
    };
    const writePublished = (ids) => {
        try { localStorage.setItem(publishedKey(), JSON.stringify(ids)); } catch (e) {}
    };

    function schedulePublishSync() {
        clearTimeout(syncTimer);
        syncTimer = setTimeout(syncPublished, 900);
    }

    async function syncPublished() {
        if (!me || !window.SpotiProfile) return;
        const d = await SpotiProfile.data();
        if (!d) return;

        const local = getPlaylists().filter((p) => p.isPublic);
        const keep = new Set(local.map((p) => pubId(p.id)));
        const removed = readPublished().filter((id) => !keep.has(id));

        const sig = JSON.stringify([
            d.name, d.username, removed,
            local.map((p) => [p.id, p.name, p.description || '', p.songIds, p.coverImage || ''])
        ]);
        if (sig === lastSig) return;

        const batch = db.batch();
        local.forEach((p) => {
            batch.set(db.collection('publicPlaylists').doc(pubId(p.id)), {
                ownerUid: me.uid,
                ownerName: d.name,
                ownerUsername: d.username,
                playlistId: p.id,
                name: p.name,
                nameLower: p.name.toLowerCase(),
                description: p.description || '',
                cover: p.coverImage || null,
                songIds: p.songIds,
                updatedAt: FV.serverTimestamp()
            });
        });
        removed.forEach((id) => batch.delete(db.collection('publicPlaylists').doc(id)));

        try {
            await batch.commit();
            lastSig = sig;
            writePublished([...keep]);
        } catch (err) {
            console.warn('Gagal sinkron playlist publik:', err);
        }
    }

    const _savePlaylists = savePlaylists;
    savePlaylists = function (list) {
        _savePlaylists(list);
        schedulePublishSync();
    };

    function showVisibility(p) {
        const meta = document.getElementById('playlistDetailMeta');
        if (!meta) return;
        meta.textContent = meta.textContent.replace(/ • (Public|Private)$/, '');
        if (p && p.id !== LIKED_PLAYLIST_ID && !String(p.id).startsWith('pub_')) {
            meta.textContent += p.isPublic ? ' • Public' : ' • Private';
        }
    }

    function togglePublic() {
        if (!me) { showToast('Log in to make playlists public'); return; }
        if (pdCurrentIsLiked) { showToast("Liked Songs can't be made public"); return; }
        const list = getPlaylists();
        const p = list.find((x) => x.id === pdCurrentPlaylistId);
        if (!p) return;
        p.isPublic = !p.isPublic;
        savePlaylists(list);
        showVisibility(p);
        showToast(p.isPublic ? 'Playlist is now public' : 'Playlist is now private');
    }

    function currentPublicState() {
        const p = getPlaylists().find((x) => x.id === pdCurrentPlaylistId);
        return !!(p && p.isPublic);
    }

    // ---- tombol ". . ." di halaman playlist ----
    // FIX titik 3 dobel: kalau sudah ada tombol "..." di toolbar (mis. dari share.js),
    // jangan bikin baru. Pakai yang ada dan tambahkan "Make public/private" ke menunya.
    const toolbar = document.querySelector('.playlist-detail-toolbar');
    const existingIcon = toolbar ? toolbar.querySelector('.fa-ellipsis, .fa-ellipsis-h') : null;
    let moreBtn;
    let adopted = false;

    if (existingIcon) {
        moreBtn = existingIcon.closest('button') || existingIcon;
        adopted = true;
    } else {
        moreBtn = document.createElement('i');
        moreBtn.className = 'fa-solid fa-ellipsis playlist-toolbar-icon';
        moreBtn.id = 'pdMoreBtn';
        moreBtn.title = 'More options';
        document.getElementById('playlistShuffleBtn')?.insertAdjacentElement('afterend', moreBtn);
    }

    const plMenu = document.createElement('div');
    plMenu.className = 'context-menu';
    plMenu.id = 'plMoreMenu';
    plMenu.innerHTML = `
        <div class="context-menu-item" id="plMenuProfile">
            <i class="fa-solid fa-lock-open" id="plMenuProfileIcon"></i> <span id="plMenuProfileLabel">Make public</span>
        </div>`;
    document.body.appendChild(plMenu);

    function syncMenuLabels() {
        const pub = currentPublicState();
        document.getElementById('plMenuProfileLabel').textContent = pub ? 'Make private' : 'Make public';
        document.getElementById('plMenuProfileIcon').className = 'fa-solid ' + (pub ? 'fa-lock' : 'fa-lock-open');
    }

    function placeOurMenu() {
        syncMenuLabels();
        plMenu.classList.add('show');
        const r = moreBtn.getBoundingClientRect();
        plMenu.style.left = Math.min(r.left, window.innerWidth - plMenu.offsetWidth - 8) + 'px';
        plMenu.style.top = (r.bottom + 6) + 'px';
    }

    moreBtn.addEventListener('click', (e) => {
        if (!getPlaylists().find((x) => x.id === pdCurrentPlaylistId)) return;

        if (!adopted) {
            e.stopPropagation();
            placeOurMenu();
            return;
        }

        // tombol milik fitur lain: tunggu menunya muncul, lalu sisipkan item kita
        setTimeout(() => {
            const menu = document.querySelector('.context-menu.show:not(#plMoreMenu):not(#songContextMenu)');
            if (menu) {
                if (!menu.querySelector('#plMenuProfileInj')) {
                    const item = document.createElement('div');
                    item.className = 'context-menu-item';
                    item.id = 'plMenuProfileInj';
                    item.addEventListener('click', () => {
                        menu.classList.remove('show');
                        togglePublic();
                    });
                    menu.appendChild(item);
                }
                const pub = currentPublicState();
                menu.querySelector('#plMenuProfileInj').innerHTML =
                    `<i class="fa-solid ${pub ? 'fa-lock' : 'fa-lock-open'}"></i> ${pub ? 'Make private' : 'Make public'}`;
            } else {
                placeOurMenu();   // fallback kalau menu fitur lain bukan .context-menu
            }
        }, 0);
    });

    document.addEventListener('click', (e) => {
        if (!plMenu.contains(e.target) && !moreBtn.contains(e.target)) plMenu.classList.remove('show');
    });

    document.getElementById('plMenuProfile').addEventListener('click', () => {
        plMenu.classList.remove('show');
        togglePublic();
    });

    // =====================================================
    // 3. Pencarian profil & playlist publik
    // =====================================================
    // ambil dokumen koleksi (maks 500), disimpan 30 detik supaya hemat baca
    const colCache = {};
    async function loadAll(col) {
        const c = colCache[col];
        if (c && Date.now() - c.t < 30000) return c.docs;
        const s = await db.collection(col).limit(500).get();
        const docs = s.docs.map((d) => ({ id: d.id, ...d.data() }));
        colCache[col] = { t: Date.now(), docs };
        return docs;
    }

    // yang diawali kata kunci tampil lebih dulu, lalu yang hanya mengandung kata kunci
    function rankBy(list, q, getKeys) {
        const scored = [];
        list.forEach((x) => {
            const keys = getKeys(x).filter(Boolean).map((k) => String(k).toLowerCase());
            if (!keys.some((k) => k.includes(q))) return;
            scored.push([keys.some((k) => k.startsWith(q)) ? 0 : 1, x]);
        });
        return scored.sort((a, b) => a[0] - b[0]).map((s) => s[1]);
    }

    async function searchProfiles(raw) {
        if (!me) throw new Error('login');
        const q = raw.toLowerCase().trim().replace(/^@/, '');
        if (!q) return [];
        return rankBy(await loadAll('users'), q,
            (u) => [u.usernameLower, u.nameLower || (u.displayName || '').toLowerCase()]);
    }

    async function searchPlaylists(raw) {
        if (!me) throw new Error('login');
        const q = raw.toLowerCase().trim();
        if (!q) return [];
        return rankBy(await loadAll('publicPlaylists'), q,
            (p) => [p.nameLower, p.ownerName, p.ownerUsername]);
    }

    // =====================================================
    // 4. Pertemanan
    // =====================================================
    function relationWith(uid) {
        const f = friendships.find((x) => x.users.includes(uid));
        if (!f) return { state: 'none' };
        if (f.status === 'accepted') return { state: 'friends', id: f.id };
        return { state: f.requester === me.uid ? 'sent' : 'received', id: f.id };
    }

    const sendRequest = (uid) => db.collection('friendships').doc(pairId(me.uid, uid)).set({
        users: [me.uid, uid].sort(), requester: me.uid, status: 'pending', createdAt: FV.serverTimestamp()
    });
    const acceptRequest = (id) => db.collection('friendships').doc(id).update({ status: 'accepted' });
    const removeFriendship = (id) => db.collection('friendships').doc(id).delete();

    const pendingIn = () => me
        ? friendships.filter((f) => f.status === 'pending' && f.requester !== me.uid)
        : [];

    function startFriends() {
        unsubFriends = db.collection('friendships').where('users', 'array-contains', me.uid)
            .onSnapshot((snap) => {
                friendships = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                renderFriendsSection();
                refreshActions();
                updateBadge();
                if (friendsMenu.classList.contains('show')) renderInbox(fmList, false);
                window.dispatchEvent(new Event('spotiware:friends'));
            }, (err) => console.warn('Friendships:', err));
    }

    async function getUser(uid) {
        if (userCache[uid]) return userCache[uid];
        const s = await db.collection('users').doc(uid).get();
        const u = s.exists ? { id: uid, ...s.data() } : { id: uid, displayName: 'Unknown', username: '' };
        userCache[uid] = u;
        return u;
    }

    function frRow(u, actions) {
        const img = u.photo ? `<img src="${esc(u.photo)}" alt="">` : '<i class="fa-solid fa-user"></i>';
        return `
            <div class="fr-row" data-uid="${esc(u.id)}">
                <div class="fr-avatar">${img}</div>
                <div class="fr-info">
                    <div class="fr-name">${esc(u.displayName || 'User')}</div>
                    <div class="fr-sub">@${esc(u.username || '')}</div>
                </div>
                ${actions || ''}
            </div>`;
    }

    const reqActions = (fid) => `
        <div class="fr-actions">
            <button class="fr-btn primary" data-act="accept" data-fid="${esc(fid)}">Accept</button>
            <button class="fr-btn" data-act="decline" data-fid="${esc(fid)}">Decline</button>
        </div>`;

    // ---- Inbox: dipakai dropdown ikon teman (laptop) dan halaman Friends (HP) ----
    async function renderInbox(el, full) {
        if (!el) return;
        const tok = (el._tok = (el._tok || 0) + 1);
        if (!me) {
            el.innerHTML = '<div class="fr-empty">Log in to see your friend requests.</div>';
            return;
        }
        const incoming = pendingIn();
        const accepted = friendships.filter((f) => f.status === 'accepted');
        let inU = [], frU = [];
        try {
            [inU, frU] = await Promise.all([
                Promise.all(incoming.map((f) => getUser(other(f)))),
                full ? Promise.all(accepted.map((f) => getUser(other(f)))) : Promise.resolve([])
            ]);
        } catch (err) { console.warn(err); }
        if (tok !== el._tok) return;

        let html = '';
        if (full) html += `<h3 class="pf-label fr-title">Friend requests (${incoming.length})</h3>`;
        html += incoming.length
            ? inU.map((u, i) => frRow(u, reqActions(incoming[i].id))).join('')
            : '<div class="fr-empty">No new friend requests.</div>';
        if (full) {
            html += `<h3 class="pf-label fr-title">Friends (${accepted.length})</h3>`;
            html += accepted.length
                ? frU.map((u) => frRow(u)).join('')
                : '<div class="fr-empty">No friends yet. Search for a profile and send a request.</div>';
        }
        el.innerHTML = html;
    }

    // ---- ikon teman di navbar (laptop), di sebelah foto profil ----
    const friendsWrap = document.createElement('div');
    friendsWrap.className = 'friends-wrap';
    friendsWrap.style.display = 'none';
    friendsWrap.innerHTML = `
        <button type="button" class="friends-btn" id="friendsBtn" title="Friend requests">
            <i class="fa-solid fa-user-group"></i>
        </button>
        <div class="friends-menu" id="friendsMenu">
            <div class="fm-title">Friend requests</div>
            <div class="inbox-list" id="fmList"></div>
        </div>`;
    const profWrap = document.querySelector('.profile-wrap');
    if (profWrap && profWrap.parentNode) profWrap.parentNode.insertBefore(friendsWrap, profWrap);
    else document.querySelector('.right-half-p2')?.appendChild(friendsWrap);

    const friendsBtn = friendsWrap.querySelector('#friendsBtn');
    const friendsMenu = friendsWrap.querySelector('#friendsMenu');
    const fmList = friendsWrap.querySelector('#fmList');

    function updateBadge() {
        friendsBtn.classList.toggle('has-notif', pendingIn().length > 0);
    }

    friendsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('profileMenu')?.classList.remove('show');
        if (window.Chat && !isMobileView()) {
            friendsMenu.classList.remove('show');
            Chat.openFriends();
            return;
        }
        const open = friendsMenu.classList.toggle('show');
        if (open) renderInbox(fmList, false);
    });
    document.addEventListener('click', (e) => {
        if (!friendsWrap.contains(e.target)) friendsMenu.classList.remove('show');
    });

    // daftar teman + permintaan masuk di tab Main profil sendiri
    async function renderFriendsSection() {
        const main = document.getElementById('pfMain');
        if (!main) return;
        let sec = document.getElementById('pfFriends');
        if (!sec) {
            sec = document.createElement('div');
            sec.id = 'pfFriends';
            main.appendChild(sec);
        }
        if (!me) { sec.innerHTML = ''; return; }

        const token = ++friendsToken;
        const incoming = pendingIn();
        const accepted = friendships.filter((f) => f.status === 'accepted');

        let inUsers = [], frUsers = [];
        try {
            [inUsers, frUsers] = await Promise.all([
                Promise.all(incoming.map((f) => getUser(other(f)))),
                Promise.all(accepted.map((f) => getUser(other(f))))
            ]);
        } catch (err) { console.warn(err); }
        if (token !== friendsToken) return;

        let html = '';
        if (incoming.length) {
            html += `<h3 class="pf-label fr-title">Friend requests (${incoming.length})</h3>`;
            html += inUsers.map((u, i) => frRow(u, reqActions(incoming[i].id))).join('');
        }
        html += `<h3 class="pf-label fr-title">Friends (${accepted.length})</h3>`;
        html += accepted.length
            ? frUsers.map((u) => frRow(u)).join('')
            : '<div class="fr-empty">No friends yet. Search for a profile and send a request.</div>';
        sec.innerHTML = html;
    }

    document.addEventListener('click', async (e) => {
        const sec = e.target.closest('#pfFriends, .inbox-list');
        if (!sec) return;
        const btn = e.target.closest('[data-act]');
        if (btn) {
            e.stopPropagation();
            btn.disabled = true;
            try {
                if (btn.dataset.act === 'accept') { await acceptRequest(btn.dataset.fid); showToast('You are now friends'); }
                else await removeFriendship(btn.dataset.fid);
            } catch (err) { console.warn(err); showToast('Something went wrong'); }
            return;
        }
        const row = e.target.closest('.fr-row');
        if (row) {
            friendsMenu.classList.remove('show');
            openProfile(row.dataset.uid);
        }
    });

    // =====================================================
    // 5. Halaman profil orang lain
    // =====================================================
    const view = document.createElement('div');
    view.className = 'profile-view user-profile';
    view.innerHTML = `
        <div class="pf-banner empty" id="upBanner"></div>
        <button class="playlist-back-btn up-back" id="upBack" title="Back"><i class="fa-solid fa-arrow-left"></i></button>
        <div class="pf-bn-actions" id="upBn"></div>

        <div class="pf-head">
            <div class="pf-ident">
                <h1 class="pf-name" id="upName"></h1>
                <p class="pf-meta" id="upMeta"></p>
            </div>
            <div class="pf-avatar" id="upAvatar" style="cursor:default;"></div>
        </div>

        <div class="pf-actions" id="upActions"></div>

        <div class="pf-tabs">
            <button class="pf-tab active" data-tab="main">Main</button>
            <button class="pf-tab" data-tab="playlists">Playlists</button>
        </div>

        <div class="pf-panel" id="upMain">
            <h3 class="pf-label">Bio</h3>
            <p class="pf-bio" id="upBio"></p>
        </div>
        <div class="pf-panel" id="upPlaylists" style="display:none;">
            <div class="pf-pl-grid" id="upPlGrid"></div>
        </div>`;
    rightPart.prepend(view);

    function upSwitchTab(tab) {
        view.querySelectorAll('.pf-tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
        view.querySelector('#upMain').style.display = tab === 'main' ? 'block' : 'none';
        view.querySelector('#upPlaylists').style.display = tab === 'playlists' ? 'block' : 'none';
    }
    view.querySelectorAll('.pf-tab').forEach((b) => b.addEventListener('click', () => upSwitchTab(b.dataset.tab)));

    view.querySelector('#upBack').addEventListener('click', () => {
        if (!(window.SpotiSearch && SpotiSearch.reopen())) goHome();
    });

    function bnBtn(act, icon, title, fid) {
        return `<button type="button" class="bn-btn" data-act="${act}"${fid ? ` data-fid="${esc(fid)}"` : ''} title="${title}"><i class="fa-solid ${icon}"></i></button>`;
    }

    function bannerHTML(uid) {
        if (uid === me.uid) return '';
        const r = relationWith(uid);
        let h = '';
        if (r.state === 'friends') h += bnBtn('chat', 'fa-message', 'Message') + bnBtn('unfriend', 'fa-user-check', 'Friends (tap to unfriend)', r.id);
        else if (r.state === 'sent') h += bnBtn('cancel', 'fa-user-clock', 'Cancel request', r.id);
        else if (r.state === 'received') h += bnBtn('accept', 'fa-user-check', 'Accept', r.id) + bnBtn('decline', 'fa-user-xmark', 'Decline', r.id);
        else h += bnBtn('add', 'fa-user-plus', 'Add friend');
        return h + bnBtn('more', 'fa-ellipsis', 'More');
    }

    function refreshActions() {
        if (!me || !viewUid || !view.classList.contains('show')) return;
        view.querySelector('#upActions').innerHTML = '';
        view.querySelector('#upBn').innerHTML = bannerHTML(viewUid);
    }

    view.querySelector('#upBn').addEventListener('click', async (e) => {
        const b = e.target.closest('[data-act]');
        if (!b || !viewUid) return;
        if (b.dataset.act === 'more') {
            e.stopPropagation();
            if (window.Chat && Chat.profileMenu) Chat.profileMenu(b, viewUid);
            return;
        }
        if (b.dataset.act === 'chat') { if (window.Chat) Chat.openChat(viewUid); return; }
        b.disabled = true;
        try {
            switch (b.dataset.act) {
                case 'add': await sendRequest(viewUid); showToast('Friend request sent'); break;
                case 'cancel':
                case 'decline': await removeFriendship(b.dataset.fid); break;
                case 'accept': await acceptRequest(b.dataset.fid); showToast('You are now friends'); break;
                case 'unfriend':
                    if (confirm('Remove this friend?')) await removeFriendship(b.dataset.fid);
                    break;
            }
        } catch (err) {
            console.warn(err);
            showToast('Something went wrong');
        }
        b.disabled = false;
    });

    function renderUserView(u) {
        const nameEl = view.querySelector('#upName');
        nameEl.textContent = u.displayName || u.username || 'User';
        nameEl.style.color = u.nameColor || '';
        view.querySelector('#upMeta').textContent = '@' + (u.username || '') + (u.pronouns ? ' • ' + u.pronouns : '');
        fillAvatar(view.querySelector('#upAvatar'), u.photo);

        const ban = view.querySelector('#upBanner');
        ban.innerHTML = '';
        if (u.banner) {
            ban.classList.remove('empty');
            const img = document.createElement('img');
            img.alt = '';
            img.src = u.banner;
            ban.appendChild(img);
        } else {
            ban.classList.add('empty');
        }

        const bioEl = view.querySelector('#upBio');
        bioEl.textContent = u.bio || 'Belum ada bio.';
        bioEl.classList.toggle('empty', !u.bio);

        if (window.SpotiProfile) SpotiProfile.applyTheme(view, u.theme || DEFAULT_THEME);
        upSwitchTab('main');
        refreshActions();
    }

    async function loadUserPlaylists(uid) {
        const grid = view.querySelector('#upPlGrid');
        grid.innerHTML = '<div class="pf-empty">Loading…</div>';
        try {
            const s = await db.collection('publicPlaylists').where('ownerUid', '==', uid).get();
            if (viewUid !== uid) return;
            const items = s.docs.map((d) => ({ id: d.id, ...d.data() }));
            if (!items.length) { grid.innerHTML = '<div class="pf-empty">No public playlists yet.</div>'; return; }
            grid.innerHTML = '';
            items.forEach((p) => {
                const card = document.createElement('div');
                card.className = 'pf-pl-card';
                const cover = document.createElement('div');
                cover.className = 'pf-pl-cover';
                fillAvatar(cover, coverOf(p), 'fa-music');
                const name = document.createElement('div');
                name.className = 'pf-pl-name';
                name.textContent = p.name;
                const sub = document.createElement('div');
                sub.className = 'pf-pl-sub';
                const n = (p.songIds || []).length;
                sub.textContent = `Playlist • ${n} song${n !== 1 ? 's' : ''}`;
                card.append(cover, name, sub);
                card.addEventListener('click', () => openPublicPlaylist(p));
                if (window.PLX) PLX.decorate(card, 'pub:' + p.id, p);
                grid.appendChild(card);
            });
        } catch (err) {
            grid.innerHTML = '<div class="pf-empty">Could not load playlists.</div>';
        }
    }

    async function openProfile(uid) {
        if (!me) { showToast('Log in to view profiles'); return; }
        if (uid === me.uid && window.SpotiProfile) { SpotiProfile.openSelf(); return; }

        let u;
        try {
            const s = await db.collection('users').doc(uid).get();
            if (!s.exists) { showToast('Profile not found'); return; }
            u = { id: uid, ...s.data() };
        } catch (err) {
            showToast('Could not load profile');
            return;
        }
        userCache[uid] = u;
        viewUid = uid;

        closePlaylistDetailView();
        closeShowAllView();
        document.querySelectorAll('.music-section').forEach((s) => s.classList.add('hide'));
        view.classList.add('show');
        rightPart.scrollTo({ top: 0 });
        window.scrollTo({ top: 0 });
        if (mainLeftPart) mainLeftPart.classList.remove('mobile-show');
        rightPart.classList.remove('mobile-hide');

        renderUserView(u);
        loadUserPlaylists(uid);
    }

    // =====================================================
    // 6. Buka playlist orang lain (hanya lihat & putar)
    // =====================================================
    function openPublicPlaylist(item) {
        closePlaylistDetailView();
        const pl = { id: 'pub_' + item.id, name: item.name, songIds: item.songIds || [], description: '', addedDates: {} };
        if (item.cover) pl.coverImage = item.cover;
        openPlaylistDetailView(pl, false);
        document.body.classList.add('pd-readonly');
        document.getElementById('playlistDetailDescription').textContent =
            (item.description ? item.description + ' • ' : '') + 'By ' + (item.ownerName || 'Unknown');
    }

    const _closePD = closePlaylistDetailView;
    closePlaylistDetailView = function () {
        view.classList.remove('show');
        document.body.classList.remove('pd-readonly');
        _closePD();
    };
    const _closeSA = closeShowAllView;
    closeShowAllView = function () { view.classList.remove('show'); _closeSA(); };

    const _openPD = openPlaylistDetailView;
    openPlaylistDetailView = function (pl, isLiked) {
        if (!String(pl.id).startsWith('pub_')) document.body.classList.remove('pd-readonly');
        view.classList.remove('show');   // profil orang lain ikut ditutup
        _openPD(pl, isLiked);
        showVisibility(pl);
    };

    // =====================================================
    // 7. Status login
    // =====================================================
    auth.onAuthStateChanged((user) => {
        me = user;
        if (unsubFriends) { unsubFriends(); unsubFriends = null; }
        friendships = [];
        lastSig = null;
        viewUid = null;
        friendsWrap.style.display = user ? 'block' : 'none';
        friendsMenu.classList.remove('show');
        updateBadge();
        window.dispatchEvent(new Event('spotiware:friends'));

        if (!user) {
            view.classList.remove('show');
            renderFriendsSection();
            return;
        }
        startFriends();
        setTimeout(async () => {
            await syncMyProfile();
            await syncPublished();
        }, 700);
    });

    window.Social = {
        searchProfiles, searchPlaylists, openProfile, openPublicPlaylist, isUsernameFree, coverOf,
        renderInbox,
        relationWith: (uid) => (me ? relationWith(uid) : { state: 'none' }),
        sendRequest,
        pendingCount: () => pendingIn().length,
        core: {
            friendships: () => friendships,
            getUser,
            getMe: () => me,
            acceptRequest,
            removeFriendship
        }
    };
})();