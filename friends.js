// ===== Friends (gaya Discord, laptop) + Chat DM + Online status + Messages (gaya IG, HP) =====
(() => {
    if (typeof firebase === 'undefined' || !firebase.firestore || !window.Social || !Social.core) {
        console.warn('friends.js tidak jalan:', {
            firebase: typeof firebase,
            firestore: !!(window.firebase && firebase.firestore),
            Social: !!window.Social,
            core: !!(window.Social && Social.core)
        });
        return;
    }
    const db = firebase.firestore();
    const FV = firebase.firestore.FieldValue;
    const core = Social.core;
    const rightPart = document.querySelector('.main-right-part');
    if (!rightPart) return;

    const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const pairId = (a, b) => [a, b].sort().join('_');
    const ms = (t) => (t && t.toMillis ? t.toMillis() : 0);
    const pad = (n) => String(n).padStart(2, '0');
    const fmtDay = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const fmtStamp = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const linkify = (t) => esc(t).replace(/(https?:\/\/[^\s<]+)/g,
        (u) => `<a href="${u}" target="_blank" rel="noopener noreferrer">${u}</a>`);
    function ago(t) {
        if (!t) return '';
        const m = Math.floor((Date.now() - t) / 60000);
        if (m < 1) return 'now';
        if (m < 60) return m + 'm';
        const h = Math.floor(m / 60);
        if (h < 24) return h + 'h';
        const d = Math.floor(h / 24);
        return d < 7 ? d + 'd' : Math.floor(d / 7) + 'w';
    }

    const IDLE_MS = 5 * 60 * 1000;     // tidak aktif 5 menit -> Idle otomatis
    const STALE_MS = 130 * 1000;       // heartbeat berhenti -> dianggap Offline
    const BEAT_MS = 60 * 1000;         // kirim heartbeat tiap 60 detik
    const LABEL = { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', offline: 'Offline' };
    const LEGAL = ['online', 'idle', 'dnd', 'invisible'];

    let me = null;
    let myStatus = 'online';
    let lastInput = Date.now();
    let presence = {}, presUnsubs = {};
    let chats = {}, unsubChats = null;
    let tab = 'online', filterQ = '', fvTok = 0;
    let dmPeer = null, dmUnsub = null, dmMsgs = [], dmPeerUser = null, dmMeUser = null, dmFirst = true;
    let beatTimer = null, tickTimer = null, writeTimer = null, refreshTimer = null;
    let mobileEl = null, msgTab = 'primary', msgQ = '', msgTok = 0;

    // ---------- daftar relasi ----------
    const fr = (f) => ({ fid: f.id, uid: f.users.find((x) => x !== me.uid) });
    const friendsList = () => me ? core.friendships().filter((f) => f.status === 'accepted').map(fr) : [];
    const incomingList = () => me ? core.friendships().filter((f) => f.status === 'pending' && f.requester !== me.uid).map(fr) : [];
    const sentList = () => me ? core.friendships().filter((f) => f.status === 'pending' && f.requester === me.uid).map(fr) : [];

    // =====================================================
    // 1. Presence (status online + lagu yang sedang didengar)
    // =====================================================
    function effectiveStatus() {
        if (myStatus !== 'online') return myStatus;
        let playing = false;
        try { playing = !audio.paused; } catch (e) {}
        return (!playing && Date.now() - lastInput > IDLE_MS) ? 'idle' : 'online';
    }

    function currentSong() {
        try {
            if (!audio.paused && playerBar.classList.contains('show')) {
                const s = getCurrentSong();
                return { id: s.id, name: s.songName, artist: s.songDes };
            }
        } catch (e) {}
        return null;
    }

    function applyMyDot() {
        const wrap = document.querySelector('.profile-wrap');
        const big = document.getElementById('profileAvatarBig');
        if (!me) {
            wrap?.removeAttribute('data-st');
            big?.removeAttribute('data-st');
            return;
        }
        const st = effectiveStatus();
        const key = st === 'invisible' ? 'offline' : st;
        wrap?.setAttribute('data-st', key);
        big?.setAttribute('data-st', key);
        const b = document.querySelector('.my-st-btn .sdot');
        if (b) b.className = 'sdot mini ' + key;
    }

    function writePresence() {
        if (!me) return;
        applyMyDot();
        db.collection('presence').doc(me.uid).set({
            status: effectiveStatus(),
            song: myStatus === 'invisible' ? null : currentSong(),
            lastActive: FV.serverTimestamp()
        }).catch(() => {});
    }
    function scheduleWrite() {
        clearTimeout(writeTimer);
        writeTimer = setTimeout(writePresence, 700);
    }

    ['mousemove', 'keydown', 'touchstart', 'click'].forEach((ev) =>
        document.addEventListener(ev, () => {
            const wasIdle = Date.now() - lastInput > IDLE_MS;
            lastInput = Date.now();
            if (wasIdle && myStatus === 'online') scheduleWrite();
        }, { passive: true }));
    document.addEventListener('visibilitychange', () => { if (!document.hidden) scheduleWrite(); });
    ['play', 'pause', 'ended'].forEach((ev) => audio.addEventListener(ev, scheduleWrite));

    function statusOf(uid) {
        const p = presence[uid];
        if (!p || !p.lastActive || Date.now() - p.lastActive > STALE_MS) return 'offline';
        return LABEL[p.status] ? p.status : 'offline';   // 'invisible' -> offline
    }
    const songOf = (uid) => {
        const p = presence[uid];
        return (statusOf(uid) !== 'offline' && p && p.song) ? p.song : null;
    };
    function statusLine(uid) {
        const song = songOf(uid);
        if (song) return `<span class="fv-listen"><i class="fa-solid fa-headphones"></i> Listening to ${esc(song.name)}</span>`;
        return esc(LABEL[statusOf(uid)]);
    }

    function syncPresence() {
        const want = new Set(me ? friendsList().map((f) => f.uid) : []);
        Object.keys(presUnsubs).forEach((uid) => {
            if (!want.has(uid)) { presUnsubs[uid](); delete presUnsubs[uid]; delete presence[uid]; }
        });
        want.forEach((uid) => {
            if (presUnsubs[uid]) return;
            presUnsubs[uid] = db.collection('presence').doc(uid).onSnapshot((s) => {
                const d = s.exists ? s.data({ serverTimestamps: 'estimate' }) : null;
                presence[uid] = d ? { status: d.status, song: d.song || null, lastActive: ms(d.lastActive) } : null;
                scheduleRefresh();
            }, () => {});
        });
    }

    // =====================================================
    // 2. Chats (daftar percakapan + belum dibaca)
    // =====================================================
    const isUnread = (c) => !!(me && c.lastFrom && c.lastFrom !== me.uid &&
        c.lastAt > ((c.read && c.read[me.uid]) || 0));
    const unreadCount = () => me ? Object.values(chats).filter(isUnread).length : 0;
    const chatOf = (uid) => me ? chats[pairId(me.uid, uid)] : null;

    function startChats() {
        unsubChats = db.collection('chats').where('users', 'array-contains', me.uid)
            .onSnapshot((snap) => {
                chats = {};
                snap.docs.forEach((d) => {
                    const x = d.data({ serverTimestamps: 'estimate' });
                    const read = {};
                    Object.entries(x.read || {}).forEach(([k, v]) => { read[k] = ms(v); });
                    chats[d.id] = {
                        id: d.id, users: x.users || [], lastText: x.lastText || '',
                        lastFrom: x.lastFrom, lastAt: ms(x.lastAt), read
                    };
                });
                markRead();
                refreshAll();
                window.dispatchEvent(new Event('spotiware:chats'));
            }, (err) => console.warn('Chats:', err));
    }

    function markRead() {
        if (!me || !dmPeer || !dmView.classList.contains('show')) return;
        const pid = pairId(me.uid, dmPeer);
        const c = chats[pid];
        if (!c || !isUnread(c)) return;
        db.collection('chats').doc(pid).set({
            users: [me.uid, dmPeer].sort(),
            read: { [me.uid]: FV.serverTimestamp() }
        }, { merge: true }).catch(() => {});
    }

    function updateBadge() {
        const n = incomingList().length + unreadCount();
        document.getElementById('friendsBtn')?.classList.toggle('has-notif', n > 0);
    }

    function scheduleRefresh() {
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(refreshAll, 250);
    }

    function refreshAll() {
        updateBadge();
        if (fvView.classList.contains('show')) renderFriends();
        if (dmView.classList.contains('show')) updateDmHead();
        if (mobileEl && mobileEl.isConnected && mobileEl.offsetParent !== null) fillMessages();
    }

    // ---------- potongan HTML ----------
    const avInner = (u) => u && u.photo
        ? `<img src="${esc(u.photo)}" alt="">`
        : '<i class="fa-solid fa-user"></i>';
    const avHTML = (u) => `
        <div class="fv-av">
            <div class="fv-av-img">${avInner(u)}</div>
            <span class="sdot ${statusOf(u.id)}"></span>
        </div>`;
    const uname = (u) => esc(u.displayName || u.username || 'User');
    const ncolor = (u) => u.nameColor ? ` style="color:${esc(u.nameColor)}"` : '';

    async function usersFor(uids) {
        const out = {};
        try {
            (await Promise.all([...new Set(uids)].map((id) => core.getUser(id)))).forEach((u) => { out[u.id] = u; });
        } catch (e) { console.warn(e); }
        return out;
    }

    // =====================================================
    // 3. Halaman Friends (laptop): Online / All / Pending
    // =====================================================
    const fvView = document.createElement('div');
    fvView.className = 'fv-view';
    fvView.innerHTML = `
        <div class="fv-top">
            <div class="fv-title"><i class="fa-solid fa-user-group"></i> Friends</div>
            <span class="fv-sepdot">•</span>
            <button type="button" class="fv-tab active" data-t="online">Online</button>
            <button type="button" class="fv-tab" data-t="all">All</button>
            <button type="button" class="fv-tab" data-t="pending">Pending <span class="fv-count" id="fvPend"></span></button>
        </div>
        <div class="fv-searchbox"><i class="fa-solid fa-magnifying-glass"></i><input type="text" id="fvSearch" placeholder="Search"></div>
        <div id="fvHead"></div>
        <div class="fv-list" id="fvList"></div>`;
    rightPart.prepend(fvView);
    const fvList = fvView.querySelector('#fvList');
    const fvHead = fvView.querySelector('#fvHead');
    const fvPend = fvView.querySelector('#fvPend');

    // menu titik 3 per teman
    const fvMenu = document.createElement('div');
    fvMenu.className = 'context-menu';
    fvMenu.innerHTML = `
        <div class="context-menu-item" data-m="profile"><i class="fa-solid fa-user"></i> Profile</div>
        <div class="context-menu-item" data-m="remove" style="color:#f15e6c;"><i class="fa-solid fa-user-minus" style="color:#f15e6c;"></i> Remove Friend</div>`;
    document.body.appendChild(fvMenu);
    let menuCtx = null;

    const friendRow = (u, fid) => `
        <div class="fv-row" data-kind="friend" data-uid="${esc(u.id)}" data-fid="${esc(fid)}">
            ${avHTML(u)}
            <div class="fv-info">
                <div class="fv-name"${ncolor(u)}>${uname(u)}</div>
                <div class="fv-sub">${statusLine(u.id)}</div>
            </div>
            <div class="fv-acts">
                <button type="button" class="fv-ic${isUnread(chatOf(u.id) || {}) ? ' has-dot' : ''}" data-a="chat" title="Message"><i class="fa-solid fa-message"></i></button>
                <button type="button" class="fv-ic" data-a="more" title="More"><i class="fa-solid fa-ellipsis-vertical"></i></button>
            </div>
        </div>`;

    const pendRow = (u, fid, kind) => `
        <div class="fv-row" data-kind="${kind}" data-uid="${esc(u.id)}" data-fid="${esc(fid)}">
            <div class="fv-av"><div class="fv-av-img">${avInner(u)}</div></div>
            <div class="fv-info">
                <div class="fv-name"${ncolor(u)}>${uname(u)}</div>
                <div class="fv-sub">@${esc(u.username || '')}</div>
            </div>
            <div class="fv-acts">
                ${kind === 'recv' ? `<button type="button" class="fv-ic" data-a="accept" data-fid="${esc(fid)}" title="Accept"><i class="fa-solid fa-check"></i></button>` : ''}
                <button type="button" class="fv-ic" data-a="decline" data-fid="${esc(fid)}" title="${kind === 'recv' ? 'Decline' : 'Cancel request'}"><i class="fa-solid fa-xmark"></i></button>
            </div>
        </div>`;

    async function renderFriends() {
        if (!me) return;
        const tok = ++fvTok;
        const q = filterQ.toLowerCase();
        fvView.querySelectorAll('.fv-tab').forEach((b) => b.classList.toggle('active', b.dataset.t === tab));
        const inc = incomingList(), sent = sentList(), frs = friendsList();
        fvPend.textContent = inc.length || '';

        const users = await usersFor([...frs, ...inc, ...sent].map((x) => x.uid));
        if (tok !== fvTok) return;
        const match = (u) => !q || (u.displayName || '').toLowerCase().includes(q) || (u.username || '').toLowerCase().includes(q);
        const byName = (a, b) => (a.u.displayName || '').localeCompare(b.u.displayName || '');

        let head = '', html = '';
        if (tab === 'pending') {
            const I = inc.filter((f) => users[f.uid] && match(users[f.uid]));
            const Sn = sent.filter((f) => users[f.uid] && match(users[f.uid]));
            head = `<div class="fv-headrow"><span>Received — ${I.length}</span>${inc.length ? '<button type="button" class="fv-clear" id="fvClearAll">Clear all</button>' : ''}</div>`;
            html = I.length ? I.map((f) => pendRow(users[f.uid], f.fid, 'recv')).join('')
                : '<div class="fv-empty">No pending friend requests.</div>';
            if (Sn.length) {
                html += `<div class="fv-headrow"><span>Sent — ${Sn.length}</span></div>` +
                    Sn.map((f) => pendRow(users[f.uid], f.fid, 'sent')).join('');
            }
        } else {
            let list = frs.map((f) => ({ u: users[f.uid], fid: f.fid })).filter((x) => x.u && match(x.u));
            if (tab === 'online') list = list.filter((x) => statusOf(x.u.id) !== 'offline');
            list.sort(byName);
            head = `<div class="fv-headrow"><span>${tab === 'online' ? 'Online' : 'All friends'} — ${list.length}</span></div>`;
            html = list.length ? list.map((x) => friendRow(x.u, x.fid)).join('')
                : `<div class="fv-empty">${tab === 'online' ? 'No friends are online right now.' : 'No friends yet. Search for a profile and send a request.'}</div>`;
        }
        fvHead.innerHTML = head;
        fvList.innerHTML = html;
    }

    fvView.querySelectorAll('.fv-tab').forEach((b) => b.addEventListener('click', () => {
        tab = b.dataset.t;
        renderFriends();
    }));
    fvView.querySelector('#fvSearch').addEventListener('input', (e) => {
        filterQ = e.target.value.trim();
        renderFriends();
    });

    fvHead.addEventListener('click', async (e) => {
        if (!e.target.closest('#fvClearAll')) return;
        if (!confirm('Decline all friend requests?')) return;
        try { await Promise.all(incomingList().map((f) => core.removeFriendship(f.fid))); }
        catch (err) { console.warn(err); showToast('Something went wrong'); }
    });

    fvList.addEventListener('click', async (e) => {
        const row = e.target.closest('.fv-row');
        if (!row) return;
        const uid = row.dataset.uid;
        const btn = e.target.closest('[data-a]');
        if (btn) {
            e.stopPropagation();
            const a = btn.dataset.a;
            if (a === 'chat') { openChat(uid); return; }
            if (a === 'more') {
                menuCtx = { uid, fid: row.dataset.fid };
                fvMenu.classList.add('show');
                const r = btn.getBoundingClientRect();
                fvMenu.style.left = Math.max(8, Math.min(r.left - 120, window.innerWidth - fvMenu.offsetWidth - 8)) + 'px';
                fvMenu.style.top = (r.bottom + 4) + 'px';
                return;
            }
            btn.disabled = true;
            try {
                if (a === 'accept') { await core.acceptRequest(btn.dataset.fid); showToast('You are now friends'); }
                else await core.removeFriendship(btn.dataset.fid);
            } catch (err) { console.warn(err); showToast('Something went wrong'); btn.disabled = false; }
            return;
        }
        if (row.dataset.kind === 'friend') openChat(uid);
        else Social.openProfile(uid);
    });

    fvMenu.addEventListener('click', async (e) => {
        const it = e.target.closest('[data-m]');
        if (!it || !menuCtx) return;
        const ctx = menuCtx;
        fvMenu.classList.remove('show');
        if (it.dataset.m === 'profile') Social.openProfile(ctx.uid);
        if (it.dataset.m === 'remove' && confirm('Remove this friend?')) {
            try { await core.removeFriendship(ctx.fid); } catch (err) { showToast('Something went wrong'); }
        }
    });
    document.addEventListener('click', (e) => { if (!fvMenu.contains(e.target)) fvMenu.classList.remove('show'); });

    // ---------- helper host (menutup halaman lain) ----------
    function prepareHost() {
        closePlaylistDetailView();
        closeShowAllView();
        document.querySelectorAll('.music-section').forEach((s) => s.classList.add('hide'));
        if (typeof mainLeftPart !== 'undefined' && mainLeftPart) mainLeftPart.classList.remove('mobile-show');
        rightPart.classList.remove('mobile-hide');
        rightPart.scrollTo({ top: 0 });
        window.scrollTo({ top: 0 });
    }

    function openFriends() {
        if (!me) { showToast('Log in to see your friends'); return; }
        prepareHost();
        fvView.classList.add('show');
        renderFriends();
    }

    // =====================================================
    // 4. Chat DM
    // =====================================================
    const dmView = document.createElement('div');
    dmView.className = 'dm-view';
    dmView.innerHTML = `
        <div class="dm-head">
            <button type="button" class="dm-back" title="Back"><i class="fa-solid fa-arrow-left"></i></button>
            <div class="dm-avwrap"></div>
            <div class="dm-who">
                <div class="dm-name"></div>
                <div class="dm-status"></div>
            </div>
        </div>
        <div class="dm-body"></div>
        <div class="dm-input">
            <input type="text" maxlength="500" placeholder="Message">
            <button type="button" class="dm-send" title="Send"><i class="fa-solid fa-paper-plane"></i></button>
        </div>`;
    rightPart.prepend(dmView);
    const dmBody = dmView.querySelector('.dm-body');
    const dmInput = dmView.querySelector('.dm-input input');

    function closeDmListener() {
        if (dmUnsub) { dmUnsub(); dmUnsub = null; }
    }
    function closeDm() {
        closeDmListener();
        dmView.classList.remove('show');
        dmPeer = null;
    }

    async function getMeUser() {
        try {
            if (window.SpotiProfile) {
                const d = await SpotiProfile.data();
                if (d) return { id: me.uid, displayName: d.name, photo: d.photo, nameColor: d.nameColor };
            }
        } catch (e) {}
        return core.getUser(me.uid);
    }

    function updateDmHead() {
        if (!dmPeerUser) return;
        const u = dmPeerUser;
        dmView.querySelector('.dm-head').dataset.uid = u.id;
        dmView.querySelector('.dm-avwrap').innerHTML = avHTML(u);
        const n = dmView.querySelector('.dm-name');
        n.textContent = u.displayName || u.username || 'User';
        n.style.color = u.nameColor || '';
        dmView.querySelector('.dm-status').innerHTML = statusLine(u.id);
    }

    function renderDm() {
        if (!dmPeerUser || !dmMeUser) return;
        const stick = dmFirst || (dmBody.scrollHeight - dmBody.scrollTop - dmBody.clientHeight < 90);
        if (!dmMsgs.length) {
            dmBody.innerHTML = `<div class="dm-empty">This is the beginning of your conversation with <b>${uname(dmPeerUser)}</b>.</div>`;
            dmFirst = false;
            return;
        }
        let html = '', lastDay = '', lastFrom = null, lastT = 0;
        dmMsgs.forEach((m) => {
            const t = ms(m.createdAt) || Date.now();
            const d = new Date(t);
            const day = d.toDateString();
            if (day !== lastDay) {
                html += `<div class="dm-date"><span>${fmtDay(d)}</span></div>`;
                lastDay = day; lastFrom = null;
            }
            const u = m.from === me.uid ? dmMeUser : dmPeerUser;
            if (lastFrom === m.from && t - lastT < 300000) {
                html += `<div class="dm-msg grouped" data-uid="${esc(m.from)}"><div class="dm-text">${linkify(m.text || '')}</div></div>`;
            } else {
                html += `
                    <div class="dm-msg" data-uid="${esc(m.from)}">
                        <div class="dm-pic">${avInner(u)}</div>
                        <div class="dm-main">
                            <div class="dm-meta"><b${ncolor(u)}>${uname(u)}</b><span>${fmtStamp(d)}</span></div>
                            <div class="dm-text">${linkify(m.text || '')}</div>
                        </div>
                    </div>`;
            }
            lastFrom = m.from; lastT = t;
        });
        dmBody.innerHTML = html;
        if (stick) dmBody.scrollTop = dmBody.scrollHeight;
        dmFirst = false;
    }

    async function openChat(uid) {
        if (!me) { showToast('Log in to chat'); return; }
        if (!isMobileView()) prepareHost();   // laptop: ganti halaman; HP: overlay layar penuh
        closeDmListener();
        dmPeer = uid;
        dmMsgs = [];
        dmFirst = true;
        dmPeerUser = null;
        dmView.classList.add('show');
        dmBody.innerHTML = '<div class="dm-empty">Loading…</div>';

        const [pu, mu] = await Promise.all([core.getUser(uid), getMeUser()]);
        if (dmPeer !== uid) return;
        dmPeerUser = pu; dmMeUser = mu;
        updateDmHead();
        dmInput.placeholder = 'Message @' + (pu.displayName || pu.username || 'user');
        dmInput.value = '';

        dmUnsub = db.collection('chats').doc(pairId(me.uid, uid)).collection('messages')
            .orderBy('createdAt').limitToLast(150)
            .onSnapshot((snap) => {
                dmMsgs = snap.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }));
                renderDm();
                markRead();
            }, (err) => {
                console.warn('Messages:', err);
                dmBody.innerHTML = '<div class="dm-empty">Could not load messages. Check your Firestore rules.</div>';
            });
        if (!isMobileView()) dmInput.focus();
    }

    async function sendMessage() {
        const text = dmInput.value.trim();
        if (!text || !me || !dmPeer) return;
        dmInput.value = '';
        const pid = pairId(me.uid, dmPeer);
        const ref = db.collection('chats').doc(pid);
        const batch = db.batch();
        batch.set(ref.collection('messages').doc(), {
            from: me.uid, text, createdAt: FV.serverTimestamp()
        });
        batch.set(ref, {
            users: [me.uid, dmPeer].sort(),
            lastText: text.slice(0, 120),
            lastFrom: me.uid,
            lastAt: FV.serverTimestamp(),
            read: { [me.uid]: FV.serverTimestamp() }
        }, { merge: true });
        try { await batch.commit(); }
        catch (err) { console.warn(err); showToast('Message failed to send'); dmInput.value = text; }
    }

    dmInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    dmView.querySelector('.dm-send').addEventListener('click', sendMessage);

    // klik foto / nama di header chat atau di pesan -> buka profil orangnya
    function openProfileFromChat(uid) {
        if (!uid) return;
        Social.openProfile(uid);   // sekaligus menutup chat lewat closePlaylistDetailView
    }
    dmView.querySelector('.dm-head').addEventListener('click', (e) => {
        if (e.target.closest('.dm-avwrap, .dm-who')) openProfileFromChat(dmPeer);
    });
    dmBody.addEventListener('click', (e) => {
        if (!e.target.closest('.dm-pic, .dm-meta b')) return;
        const msg = e.target.closest('.dm-msg');
        openProfileFromChat(msg && msg.dataset.uid);
    });
    dmView.querySelector('.dm-back').addEventListener('click', () => {
        closeDm();
        if (!isMobileView()) openFriends();
    });

    // =====================================================
    // 5. Messages (HP, gaya Instagram)
    // =====================================================
    function ensureMsgSkeleton(el) {
        if (el.querySelector('.msg-head')) return;
        el.innerHTML = `
            <div class="msg-head"><h2 class="msg-title">Messages</h2></div>
            <div class="msg-search"><i class="fa-solid fa-magnifying-glass"></i><input class="msg-q" type="text" placeholder="Search"></div>
            <div class="msg-notes"></div>
            <div class="msg-chips">
                <button type="button" class="msg-chip active" data-t="primary">Primary <b class="msg-cnt" data-c="p"></b></button>
                <button type="button" class="msg-chip" data-t="requests">Requests <b class="msg-cnt" data-c="r"></b></button>
            </div>
            <div class="msg-list"></div>`;

        el.querySelector('.msg-q').addEventListener('input', (e) => { msgQ = e.target.value.trim(); fillMessages(); });
        el.addEventListener('click', async (e) => {
            const b = e.target.closest('[data-a]');
            if (b) {
                e.stopPropagation();
                b.disabled = true;
                try {
                    if (b.dataset.a === 'accept') { await core.acceptRequest(b.dataset.fid); showToast('You are now friends'); }
                    else await core.removeFriendship(b.dataset.fid);
                } catch (err) { console.warn(err); showToast('Something went wrong'); b.disabled = false; }
                return;
            }
            const chip = e.target.closest('.msg-chip');
            if (chip) { msgTab = chip.dataset.t; fillMessages(); return; }
            const open = e.target.closest('[data-chat]');
            if (open) { openChat(open.dataset.chat); return; }
            const prof = e.target.closest('[data-prof]');
            if (prof) Social.openProfile(prof.dataset.prof);
        });

        // judul = username
        if (window.SpotiProfile) {
            SpotiProfile.data().then((d) => {
                if (d && d.username) el.querySelector('.msg-title').textContent = d.username;
            }).catch(() => {});
        }
    }

    async function fillMessages() {
        const el = mobileEl;
        if (!el) return;
        ensureMsgSkeleton(el);
        const notesEl = el.querySelector('.msg-notes');
        const listEl = el.querySelector('.msg-list');
        if (!me) {
            notesEl.innerHTML = '';
            listEl.innerHTML = '<div class="fv-empty">Log in to message your friends.</div>';
            return;
        }
        const tok = ++msgTok;
        const q = msgQ.toLowerCase();
        const frs = friendsList(), inc = incomingList(), sent = sentList();
        const convos = Object.values(chats)
            .filter((c) => c.lastAt)
            .map((c) => ({ c, uid: c.users.find((x) => x !== me.uid) }))
            .filter((x) => x.uid && frs.some((f) => f.uid === x.uid))
            .sort((a, b) => b.c.lastAt - a.c.lastAt);
        const users = await usersFor([...frs, ...inc, ...sent].map((x) => x.uid));
        if (tok !== msgTok) return;

        const match = (u) => !q || (u.displayName || '').toLowerCase().includes(q) || (u.username || '').toLowerCase().includes(q);

        // chip + jumlah
        el.querySelectorAll('.msg-chip').forEach((c) => c.classList.toggle('active', c.dataset.t === msgTab));
        const un = unreadCount();
        el.querySelector('[data-c="p"]').textContent = un || '';
        el.querySelector('[data-c="r"]').textContent = inc.length || '';

        // baris teman di atas (gaya "notes": bubble lagu yang sedang didengar)
        const rank = (u) => songOf(u.id) ? 2 : (statusOf(u.id) !== 'offline' ? 1 : 0);
        const noteUsers = frs.map((f) => users[f.uid]).filter((u) => u && match(u))
            .sort((a, b) => rank(b) - rank(a) || (a.displayName || '').localeCompare(b.displayName || ''))
            .slice(0, 30);
        notesEl.style.display = (msgTab === 'primary' && noteUsers.length) ? 'flex' : 'none';
        notesEl.innerHTML = noteUsers.map((u) => {
            const s = songOf(u.id);
            return `
                <div class="msg-note" data-chat="${esc(u.id)}">
                    <div class="note-bub${s ? '' : ' empty'}">${s ? `<div class="nb-t">${esc(s.name)}</div><div class="nb-a">${esc(s.artist)}</div>` : ''}</div>
                    ${avHTML(u)}
                    <div class="msg-note-name">${uname(u)}</div>
                </div>`;
        }).join('');

        if (msgTab === 'requests') {
            const I = inc.filter((f) => users[f.uid] && match(users[f.uid]));
            const Sn = sent.filter((f) => users[f.uid] && match(users[f.uid]));
            let html = '';
            html += I.map((f) => {
                const u = users[f.uid];
                return `
                    <div class="msg-row" data-prof="${esc(u.id)}">
                        <div class="fv-av"><div class="fv-av-img">${avInner(u)}</div></div>
                        <div class="msg-mid">
                            <div class="msg-name">${uname(u)}</div>
                            <div class="msg-last">@${esc(u.username || '')}</div>
                        </div>
                        <div class="fr-actions">
                            <button type="button" class="fr-btn primary" data-a="accept" data-fid="${esc(f.fid)}">Accept</button>
                            <button type="button" class="fr-btn" data-a="decline" data-fid="${esc(f.fid)}">Decline</button>
                        </div>
                    </div>`;
            }).join('');
            html += Sn.map((f) => {
                const u = users[f.uid];
                return `
                    <div class="msg-row" data-prof="${esc(u.id)}">
                        <div class="fv-av"><div class="fv-av-img">${avInner(u)}</div></div>
                        <div class="msg-mid">
                            <div class="msg-name">${uname(u)}</div>
                            <div class="msg-last">Request sent</div>
                        </div>
                        <div class="fr-actions">
                            <button type="button" class="fr-btn" data-a="decline" data-fid="${esc(f.fid)}">Cancel</button>
                        </div>
                    </div>`;
            }).join('');
            listEl.innerHTML = html || '<div class="fv-empty">No message requests.</div>';
            return;
        }

        const rows = convos.filter((x) => users[x.uid] && match(users[x.uid])).map(({ c, uid }) => {
            const u = users[uid];
            const unread = isUnread(c);
            const prefix = c.lastFrom === me.uid ? 'You: ' : '';
            return `
                <div class="msg-row${unread ? ' unread' : ''}" data-chat="${esc(uid)}">
                    ${avHTML(u)}
                    <div class="msg-mid">
                        <div class="msg-name">${uname(u)}</div>
                        <div class="msg-last">${esc(prefix + c.lastText)} · ${ago(c.lastAt)}</div>
                    </div>
                    ${unread ? '<span class="msg-dot"></span>' : ''}
                </div>`;
        });
        listEl.innerHTML = rows.length ? rows.join('')
            : '<div class="fv-empty">No messages yet. Tap a friend above to say hi.</div>';
    }

    function renderMessages(el) {
        mobileEl = el;
        fillMessages();
    }

    // =====================================================
    // 6. Change online status (menu profile)
    // =====================================================
    const sheetBackdrop = document.createElement('div');
    sheetBackdrop.className = 'stat-backdrop';
    const sheet = document.createElement('div');
    sheet.className = 'stat-sheet';
    sheet.innerHTML = `
        <div class="stat-handle"></div>
        <h3 class="stat-title">Change Online Status</h3>
        <div class="stat-label">Online Status</div>` +
        [['online', 'Online', 'online'], ['idle', 'Idle', 'idle'], ['dnd', 'Do Not Disturb', 'dnd'], ['invisible', 'Invisible', 'offline']]
            .map(([k, l, cls]) => `
                <div class="stat-opt" data-s="${k}">
                    <span class="sdot ${cls} big"></span>
                    <span class="stat-name">${l}</span>
                    <span class="stat-radio"></span>
                </div>`).join('');
    document.body.append(sheetBackdrop, sheet);

    function openSheet() {
        sheet.querySelectorAll('.stat-opt').forEach((o) => o.classList.toggle('selected', o.dataset.s === myStatus));
        sheet.classList.add('show');
        sheetBackdrop.classList.add('show');
    }
    function closeSheet() {
        sheet.classList.remove('show');
        sheetBackdrop.classList.remove('show');
    }
    function setStatus(s) {
        if (!LEGAL.includes(s) || !me) return;
        myStatus = s;
        try { localStorage.setItem('spotiware_status_' + me.uid, s); } catch (e) {}
        writePresence();
        showToast('Status: ' + (s === 'dnd' ? 'Do Not Disturb' : s[0].toUpperCase() + s.slice(1)));
    }
    sheet.addEventListener('click', (e) => {
        const o = e.target.closest('.stat-opt');
        if (!o) return;
        setStatus(o.dataset.s);
        closeSheet();
    });
    sheetBackdrop.addEventListener('click', closeSheet);
    document.addEventListener('click', (e) => {
        if (sheet.classList.contains('show') && !sheet.contains(e.target)) closeSheet();
    });

    // tombol status di foto profil (halaman Profile) - dipasang di LUAR avatar
    // supaya tidak terpotong overflow:hidden dan tidak terhapus saat avatar di-refresh
    let myStBtn = null;
    function placeStatusBtn() {
        const av = document.getElementById('profileAvatarBig');
        if (!av || !myStBtn) return;
        const w = av.offsetWidth, h = av.offsetHeight;
        if (!w) return;   // halaman profil sedang tersembunyi
        const k = Math.SQRT1_2;   // titik di tepi lingkaran, arah kanan-bawah (45 derajat)
        const cx = av.offsetLeft + w / 2 + (w / 2) * k;
        const cy = av.offsetTop + h / 2 + (h / 2) * k;
        myStBtn.style.left = (cx - myStBtn.offsetWidth / 2) + 'px';
        myStBtn.style.top = (cy - myStBtn.offsetHeight / 2) + 'px';
    }
    function mountStatusBtn() {
        const av = document.getElementById('profileAvatarBig');
        if (!av || !av.parentElement || myStBtn) return;
        const host = av.parentElement;
        if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
        myStBtn = document.createElement('button');
        myStBtn.type = 'button';
        myStBtn.className = 'my-st-btn';
        myStBtn.title = 'Change online status';
        myStBtn.innerHTML = '<span class="sdot mini online"></span>';
        myStBtn.addEventListener('click', (e) => { e.stopPropagation(); openSheet(); });
        host.appendChild(myStBtn);
        if (window.ResizeObserver) new ResizeObserver(placeStatusBtn).observe(av);
        window.addEventListener('resize', placeStatusBtn);
        placeStatusBtn();
        applyMyDot();
    }
    mountStatusBtn();

    document.querySelector('#profileMenu [data-act="logout"]')?.addEventListener('click', () => {
        if (me) db.collection('presence').doc(me.uid)
            .set({ status: 'offline', song: null, lastActive: FV.serverTimestamp() }).catch(() => {});
    });

    // =====================================================
    // 6b. Share link profil (titik 3 di halaman Profile)
    // =====================================================
    const PROFILE_PREFIX = '#profile=';
    const profileUrl = (uid) => location.origin + location.pathname + PROFILE_PREFIX + encodeURIComponent(uid);

    async function copyText(text) {
        try { await navigator.clipboard.writeText(text); return true; }
        catch (e) {
            const ta = document.createElement('textarea');
            ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta); ta.select();
            let ok = false;
            try { ok = document.execCommand('copy'); } catch (_) {}
            ta.remove();
            return ok;
        }
    }

    const pfMenu = document.createElement('div');
    pfMenu.className = 'context-menu';
    pfMenu.id = 'pfMoreMenu';
    pfMenu.innerHTML = '<div class="context-menu-item" data-m="link"><i class="fa-solid fa-link"></i> Copy link to profile</div>';
    document.body.appendChild(pfMenu);

    let pfMenuUid = null;
    function profileMenu(btn, uid) {
        pfMenuUid = uid;
        if (pfMenu.classList.toggle('show')) {
            const r = btn.getBoundingClientRect();
            const w = pfMenu.offsetWidth || 220;
            pfMenu.style.left = Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8)) + 'px';
            pfMenu.style.top = (r.bottom + 6) + 'px';
        }
    }

    // tombol bulat di pojok kanan atas banner profil sendiri
    function mountProfileMore() {
        const edit = document.getElementById('pfEditBtn');
        const view = edit && edit.closest('.profile-view');
        if (!view || document.getElementById('pfMoreBtn')) return;
        if (getComputedStyle(view).position === 'static') view.style.position = 'relative';
        const box = document.createElement('div');
        box.className = 'pf-bn-actions';
        box.innerHTML = '<button type="button" class="bn-btn" id="pfMoreBtn" title="More options"><i class="fa-solid fa-ellipsis"></i></button>';
        view.appendChild(box);
        box.querySelector('#pfMoreBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            profileMenu(e.currentTarget, me && me.uid);
        });
    }
    mountProfileMore();
    document.addEventListener('click', (e) => {
        if (!pfMenu.contains(e.target)) pfMenu.classList.remove('show');
    });
    pfMenu.addEventListener('click', async () => {
        pfMenu.classList.remove('show');
        const uid = pfMenuUid || (me && me.uid);
        if (!uid) { showToast('Log in first'); return; }
        const url = profileUrl(uid);
        if (await copyText(url)) showToast('Profile link copied');
        else window.prompt('Copy this link:', url);
    });

    // buka link profil yang diterima (#profile=UID)
    function openFromProfileHash() {
        if (!location.hash.startsWith(PROFILE_PREFIX)) return;
        const uid = decodeURIComponent(location.hash.slice(PROFILE_PREFIX.length));
        if (!uid) return;
        if (!me) { showToast('Log in to view this profile'); return; }   // hash dibiarkan, dibuka setelah login
        history.replaceState(null, '', location.pathname + location.search);
        Social.openProfile(uid);
    }
    window.addEventListener('hashchange', openFromProfileHash);

    // =====================================================
    // 7. Wiring
    // =====================================================
    const _closePD = closePlaylistDetailView;
    closePlaylistDetailView = function () {
        fvView.classList.remove('show');
        closeDm();
        _closePD();
    };

    // membuka playlist (mis. dari Your Library) saat chat / halaman Friends terbuka -> keduanya ditutup dulu
    const _openPD = openPlaylistDetailView;
    openPlaylistDetailView = function (pl, isLiked) {
        fvView.classList.remove('show');
        closeDm();
        _openPD(pl, isLiked);
    };

    window.addEventListener('spotiware:friends', () => {
        me = core.getMe();
        syncPresence();
        refreshAll();
    });

    function stopAll() {
        clearInterval(beatTimer);
        clearInterval(tickTimer);
        if (unsubChats) { unsubChats(); unsubChats = null; }
        Object.values(presUnsubs).forEach((u) => u());
        presUnsubs = {}; presence = {}; chats = {};
        fvView.classList.remove('show');
        closeDm();
    }

    firebase.auth().onAuthStateChanged((u) => {
        stopAll();
        me = u;
        if (!u) {
            myStatus = 'online';
            applyMyDot();
            updateBadge();
            openFromProfileHash();   // tampilkan pesan "Log in" kalau datang dari link profil
            return;
        }
        try { myStatus = localStorage.getItem('spotiware_status_' + u.uid) || 'online'; } catch (e) {}
        if (!LEGAL.includes(myStatus)) myStatus = 'online';
        startChats();
        writePresence();
        beatTimer = setInterval(writePresence, BEAT_MS);
        tickTimer = setInterval(refreshAll, 30000);   // status basi (offline) ikut ter-update
        syncPresence();
        setTimeout(openFromProfileHash, 1200);   // tunggu data teman & profil siap
    });

    window.Chat = { openFriends, openChat, renderMessages, unreadCount, setStatus, profileMenu };
})();