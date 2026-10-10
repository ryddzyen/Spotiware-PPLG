// ===== Profile menu, halaman Profile & History (tampil setelah login) =====
(() => {
    const PHOTO_KEY = (uid) => 'spotiware_profile_photo_' + uid;
    const BIO_KEY = (uid) => 'spotiware_profile_bio_' + uid;
    const PRONOUN_KEY = (uid) => 'spotiware_profile_pronouns_' + uid;
    const THEME_KEY = (uid) => 'spotiware_profile_theme_' + uid;
    const USERNAME_KEY = (uid) => 'spotiware_profile_username_' + uid;
    const NAMECOLOR_KEY = (uid) => 'spotiware_profile_namecolor_' + uid;
    const DEFAULT_THEME = { primary: '#3b2f00', accent: '#121212' };
    const BANNER_MAX_MB = 15;
    const BANNER_MAX_SEC = 15;

    let currentUser = null;
    let currentBanner = null;          // { type: 'image' | 'video', blob }
    let pendingPhoto = null;
    let pendingPhotoRemove = false;
    let pendingBanner = null;
    let pendingBannerRemove = false;

    // ---------- IndexedDB (banner video terlalu besar untuk localStorage) ----------
    const IDB_NAME = 'spotiware_profile', STORE = 'banners';
    function idb() {
        return new Promise((res, rej) => {
            const r = indexedDB.open(IDB_NAME, 1);
            r.onupgradeneeded = () => r.result.createObjectStore(STORE);
            r.onsuccess = () => res(r.result);
            r.onerror = () => rej(r.error);
        });
    }
    async function idbGet(key) {
        const db = await idb();
        return new Promise((res, rej) => {
            const q = db.transaction(STORE).objectStore(STORE).get(key);
            q.onsuccess = () => res(q.result || null);
            q.onerror = () => rej(q.error);
        });
    }
    async function idbSet(key, val) {
        const db = await idb();
        return new Promise((res, rej) => {
            const tx = db.transaction(STORE, 'readwrite');
            tx.objectStore(STORE).put(val, key);
            tx.oncomplete = () => res();
            tx.onerror = () => rej(tx.error);
        });
    }
    async function idbDel(key) {
        const db = await idb();
        return new Promise((res, rej) => {
            const tx = db.transaction(STORE, 'readwrite');
            tx.objectStore(STORE).delete(key);
            tx.oncomplete = () => res();
            tx.onerror = () => rej(tx.error);
        });
    }

    // ---------- Navbar: avatar + menu ----------
    const p2 = document.querySelector('.right-half-p2');
    const signupBtn = document.getElementById('signupBtn');
    const loginBtn = document.getElementById('loginBtn');

    const wrap = document.createElement('div');
    wrap.className = 'profile-wrap';
    wrap.style.display = 'none';
    wrap.innerHTML = `
        <button class="profile-avatar-btn" id="profileAvatarBtn" title="Profile"></button>
        <div class="profile-menu" id="profileMenu">
            <div class="pm-item" data-act="profile"><span>Profile</span></div>
            <a class="pm-item" href="support.html"><span>Support</span><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
            <a class="pm-item" href="about.html"><span>About</span><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
            <div class="pm-item" data-act="history"><span>History</span></div>
            <div class="pm-item" data-act="settings"><span>Settings</span></div>
            <div class="pm-divider"></div>
            <div class="pm-item" data-act="logout"><span>Log out</span></div>
        </div>`;
    p2.appendChild(wrap);

    const avatarBtn = wrap.querySelector('#profileAvatarBtn');
    const menu = wrap.querySelector('#profileMenu');

    function setAvatar(el, photo) {
        el.innerHTML = photo
            ? `<img src="${photo}" alt="">`
            : `<i class="fa-solid fa-user"></i>`;
    }

    avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
    });
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && e.target !== avatarBtn) menu.classList.remove('show');
    });

    menu.addEventListener('click', (e) => {
        const item = e.target.closest('.pm-item[data-act]');
        if (!item) return;
        menu.classList.remove('show');
        const act = item.dataset.act;
        if (act === 'profile') openProfileView();
        if (act === 'history') openHistoryView();
        if (act === 'settings') showToast('Settings coming soon');
        if (act === 'logout') firebase.auth().signOut();
    });

    // ---------- Halaman Profile (gaya Discord, foto di kanan seperti TikTok) ----------
    const profileView = document.createElement('div');
    profileView.className = 'profile-view';
    profileView.innerHTML = `
        <div class="pf-banner empty" id="pfBanner"></div>

        <div class="pf-head">
            <div class="pf-ident">
                <h1 class="pf-name" id="profileName"></h1>
                <p class="pf-meta" id="profileMeta"></p>
            </div>
            <div class="pf-avatar" id="profileAvatarBig" title="Edit profile"></div>
        </div>

        <div class="pf-actions">
            <button class="pf-edit-btn" id="pfEditBtn"><i class="fa-solid fa-pen"></i> Edit Profile</button>
        </div>

        <div class="pf-tabs">
            <button class="pf-tab active" data-tab="main">Main</button>
            <button class="pf-tab" data-tab="playlists">Playlists</button>
        </div>

        <div class="pf-panel" id="pfMain">
            <h3 class="pf-label">Bio</h3>
            <p class="pf-bio" id="pfBio"></p>
        </div>

        <div class="pf-panel" id="pfPlaylists" style="display:none;">
            <div class="pf-pl-grid" id="pfPlGrid"></div>
        </div>`;

    const historyView = document.createElement('div');
    historyView.className = 'history-view';
    historyView.innerHTML = `
        <h1 class="hv-title">History</h1>
        <h2 class="hv-sub">Recently played</h2>
        <div id="historyViewList"></div>`;

    const rightPart = document.querySelector('.main-right-part');
    rightPart.prepend(historyView);
    rightPart.prepend(profileView);

    function closeProfileViews() {
        profileView.classList.remove('show');
        historyView.classList.remove('show');
    }

    function showOnly(view) {
        closePlaylistDetailView();
        closeShowAllView();
        document.querySelectorAll('.music-section').forEach(s => s.classList.add('hide'));
        view.classList.add('show');
        rightPart.scrollTo({ top: 0 });
        window.scrollTo({ top: 0 });
        if (mainLeftPart) mainLeftPart.classList.remove('mobile-show');
        rightPart.classList.remove('mobile-hide');
    }

    const _closePD = closePlaylistDetailView;
    closePlaylistDetailView = function () { closeProfileViews(); _closePD(); };
    const _closeSA = closeShowAllView;
    closeShowAllView = function () { closeProfileViews(); _closeSA(); };

    // ---------- Data profil ----------
    function getName(u) {
        return u.displayName || (u.email ? u.email.split('@')[0] : 'Guest');
    }
    function getPhoto(u) { return localStorage.getItem(PHOTO_KEY(u.uid)) || null; }
    function getBio(u) { return localStorage.getItem(BIO_KEY(u.uid)) || ''; }

    function getPronouns(u) { return localStorage.getItem(PRONOUN_KEY(u.uid)) || ''; }
    function getUsername(u) {
        const saved = localStorage.getItem(USERNAME_KEY(u.uid));
        if (saved) return saved;
        const base = (u.email ? u.email.split('@')[0] : 'user').toLowerCase().replace(/[^a-z0-9._]/g, '');
        return base || 'user';
    }
    function getNameColor(u) { return localStorage.getItem(NAMECOLOR_KEY(u.uid)) || ''; }

    function getTheme(u) {
        try {
            const t = JSON.parse(localStorage.getItem(THEME_KEY(u.uid)));
            if (t && t.primary && t.accent) return t;
        } catch (_) {}
        return DEFAULT_THEME;
    }
    function themeGradient(t) { return `linear-gradient(180deg, ${t.primary} 0%, ${t.accent} 100%)`; }
    function lum(hex) {
        const n = parseInt(hex.slice(1), 16);
        return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
    }
    // primary = atas, accent = bawah; warna teks otomatis gelap/terang supaya tetap terbaca
    function applyTheme(el, t) {
        el.style.background = themeGradient(t);
        const topLight = lum(t.primary) > 150, botLight = lum(t.accent) > 150;
        el.style.setProperty('--pf-top', topLight ? '#111' : '#fff');
        el.style.setProperty('--pf-top-sub', topLight ? '#444' : '#b3b3b3');
        el.style.setProperty('--pf-bot', botLight ? '#111' : '#fff');
        el.style.setProperty('--pf-bot-sub', botLight ? '#444' : '#9ca3af');
    }

    // ---------- Banner (gambar / video) ----------
    function renderBanner(el, banner) {
        if (el._url) { URL.revokeObjectURL(el._url); el._url = null; }
        el.innerHTML = '';
        if (!banner) { el.classList.add('empty'); return; }
        el.classList.remove('empty');
        const url = URL.createObjectURL(banner.blob);
        el._url = url;
        if (banner.type === 'video') {
            const v = document.createElement('video');
            v.src = url;
            v.autoplay = true; v.loop = true; v.muted = true; v.playsInline = true;
            v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
            el.appendChild(v);
            v.play().catch(() => {});
        } else {
            const img = document.createElement('img');
            img.src = url;
            img.alt = '';
            el.appendChild(img);
        }
    }

    async function loadBanner(user) {
        currentBanner = null;
        if (user) {
            try { currentBanner = await idbGet(user.uid); } catch (_) {}
        }
        renderBanner(profileView.querySelector('#pfBanner'), currentBanner);
    }

    function fileToBanner(file) {
        return new Promise((resolve, reject) => {
            if (file.size > BANNER_MAX_MB * 1024 * 1024) return reject(new Error('Maksimal ' + BANNER_MAX_MB + ' MB'));
            if (file.type.startsWith('video/')) {
                const url = URL.createObjectURL(file);
                const v = document.createElement('video');
                v.preload = 'metadata';
                v.onloadedmetadata = () => {
                    URL.revokeObjectURL(url);
                    if (v.duration > BANNER_MAX_SEC) reject(new Error('Video maksimal ' + BANNER_MAX_SEC + ' detik'));
                    else resolve({ type: 'video', blob: file });
                };
                v.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Video tidak bisa dibaca')); };
                v.src = url;
            } else if (file.type === 'image/gif') {
                resolve({ type: 'image', blob: file });          // GIF dibiarkan agar tetap bergerak
            } else if (file.type.startsWith('image/')) {
                resizeImageToDataUrl(file, 1280, async (dataUrl) => {
                    resolve({ type: 'image', blob: await (await fetch(dataUrl)).blob() });
                });
            } else {
                reject(new Error('Format tidak didukung'));
            }
        });
    }

    // ---------- Tampilan profil ----------
    function refreshProfileUI() {
        if (!currentUser) return;
        const photo = getPhoto(currentUser);
        setAvatar(avatarBtn, photo);
        setAvatar(profileView.querySelector('#profileAvatarBig'), photo);
        const nameEl = profileView.querySelector('#profileName');
        nameEl.textContent = getName(currentUser);
        nameEl.style.color = getNameColor(currentUser);   // kosong = ikut warna otomatis theme
        const pr = getPronouns(currentUser);
        profileView.querySelector('#profileMeta').textContent = '@' + getUsername(currentUser) + (pr ? ' • ' + pr : '');
        applyTheme(profileView, getTheme(currentUser));

        const bio = getBio(currentUser);
        const bioEl = profileView.querySelector('#pfBio');
        bioEl.textContent = bio || 'Belum ada bio. Klik Edit Profile untuk menambahkannya.';
        bioEl.classList.toggle('empty', !bio);
    }

    // ---------- Tab Main / Playlists ----------
    function renderPlaylistsTab() {
        const grid = profileView.querySelector('#pfPlGrid');
        grid.innerHTML = '';
        const lists = getPlaylists().filter(p => p.id !== LIKED_PLAYLIST_ID);

        if (lists.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'pf-empty';
            empty.textContent = 'Belum ada playlist. Buat dari tombol + di Your Library.';
            grid.appendChild(empty);
            return;
        }

        lists.forEach(p => {
            const src = getPlaylistCoverSrc(p);
            const card = document.createElement('div');
            card.className = 'pf-pl-card';

            const cover = document.createElement('div');
            cover.className = 'pf-pl-cover';
            if (src) {
                const img = document.createElement('img');
                img.src = src; img.alt = '';
                cover.appendChild(img);
            } else {
                cover.innerHTML = '<i class="fa-solid fa-music"></i>';
            }

            const name = document.createElement('div');
            name.className = 'pf-pl-name';
            name.textContent = p.name;

            const sub = document.createElement('div');
            sub.className = 'pf-pl-sub';
            sub.textContent = `Playlist • ${p.songIds.length} song${p.songIds.length !== 1 ? 's' : ''}`;

            card.append(cover, name, sub);
            card.addEventListener('click', () => openPlaylistDetailView(p, false));
            grid.appendChild(card);
        });
    }

    function switchTab(tab) {
        profileView.querySelectorAll('.pf-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
        profileView.querySelector('#pfMain').style.display = tab === 'main' ? 'block' : 'none';
        profileView.querySelector('#pfPlaylists').style.display = tab === 'playlists' ? 'block' : 'none';
        if (tab === 'playlists') renderPlaylistsTab();
    }
    profileView.querySelectorAll('.pf-tab').forEach(b =>
        b.addEventListener('click', () => switchTab(b.dataset.tab)));

    function openProfileView() {
        refreshProfileUI();
        switchTab('main');
        showOnly(profileView);
        loadBanner(currentUser);
    }

    profileView.querySelector('#pfEditBtn').addEventListener('click', () => openEditModal());
    profileView.querySelector('#profileAvatarBig').addEventListener('click', () => openEditModal());

    // ---------- Modal Edit Profile ----------
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'profileDetailsModal';
    modal.innerHTML = `
        <div class="modal-box pfe-box">
            <div class="pfe-top">
                <button class="modal-x-btn" id="pfeClose"><i class="fa-solid fa-xmark"></i></button>
                <h3>Profile</h3>
                <button class="pfe-save" id="pfeSave">Save</button>
            </div>

            <div class="pfe-banner-wrap" id="pfeBannerWrap">
                <div class="pfe-banner empty" id="pfeBanner"></div>
                <button type="button" class="pfe-banner-edit-btn" id="pfeBannerEditBtn" title="Edit banner"><i class="fa-solid fa-pen"></i></button>
                <div class="pfe-banner-menu" id="pfeBannerMenu">
                    <div class="pfe-banner-menu-item" id="pfeBannerMenuUpload"><i class="fa-regular fa-image"></i> Upload image or video</div>
                    <div class="pfe-banner-menu-item" id="pfeBannerMenuRemove"><i class="fa-regular fa-trash-can"></i> Remove banner</div>
                </div>

                <div class="pfe-avatar" id="pfeAvatar">
                    <div class="pfe-avatar-img" id="pfeAvatarImg"></div>
                    <button type="button" class="pfe-avatar-edit-btn" id="pfeAvatarEditBtn" title="Edit photo"><i class="fa-solid fa-pen"></i></button>
                    <div class="pfe-avatar-menu" id="pfeAvatarMenu">
                        <div class="pfe-banner-menu-item" id="pfeAvatarMenuUpload"><i class="fa-regular fa-image"></i> Upload photo</div>
                        <div class="pfe-banner-menu-item" id="pfeAvatarMenuRemove"><i class="fa-regular fa-trash-can"></i> Remove photo</div>
                    </div>
                </div>
            </div>
            <p class="pfe-hint">PNG, JPG, GIF, MP4 atau WEBM. Video maksimal ${BANNER_MAX_SEC} detik dan ${BANNER_MAX_MB} MB.</p>

            <label class="pfe-label" for="pfeName">Display name</label>
            <input type="text" id="pfeName" class="create-playlist-modal-input" maxlength="40">
            
            <div class="pfe-label">Display name color</div>
            <div class="pfe-namecolor">
                <label class="pfe-swatch pfe-swatch-sm" id="pfeSwatchName">
                    <input type="color" id="pfeColorName"><i class="fa-solid fa-pen"></i>
                </label>
                <span id="pfeNameColorLabel">Auto</span>
                <button type="button" class="pfe-reset" id="pfeNameColorReset">Reset</button>
            </div>

            <label class="pfe-label" for="pfeUsername">Username</label>
            <input type="text" id="pfeUsername" class="create-playlist-modal-input" maxlength="20" placeholder="huruf kecil, angka, . atau _">

            <label class="pfe-label" for="pfePronouns">Pronouns</label>
            <input type="text" id="pfePronouns" class="create-playlist-modal-input" maxlength="24" placeholder="mis. he/him, she/her">

            <label class="pfe-label" for="pfeBio">Bio</label>
            <textarea id="pfeBio" class="edit-details-desc-input" maxlength="160" placeholder="Ceritakan sedikit tentang dirimu"></textarea>

            <div class="pfe-label">Profile Theme</div>
            <div class="pfe-theme-preview" id="pfeThemePreview"></div>
            <div class="pfe-theme">
                <div class="pfe-theme-item">
                    <label class="pfe-swatch" id="pfeSwatchPrimary">
                        <input type="color" id="pfeColorPrimary"><i class="fa-solid fa-pen"></i>
                    </label>
                    <span>Primary (atas)</span>
                </div>
                <div class="pfe-theme-item">
                    <label class="pfe-swatch" id="pfeSwatchAccent">
                        <input type="color" id="pfeColorAccent"><i class="fa-solid fa-pen"></i>
                    </label>
                    <span>Accent (bawah)</span>
                </div>
            </div>
            <button type="button" class="pfe-reset" id="pfeThemeReset">Reset theme</button>

            <input type="file" id="pfePhotoFile" accept="image/*" style="display:none;">
            <input type="file" id="pfeBannerFile" accept="image/*,video/mp4,video/webm" style="display:none;">
        </div>`;
    document.body.appendChild(modal);

    const pfeName = modal.querySelector('#pfeName');
    const pfeBio = modal.querySelector('#pfeBio');
    const pfePronouns = modal.querySelector('#pfePronouns');
    const pfeUsername = modal.querySelector('#pfeUsername');
    const pfeColorName = modal.querySelector('#pfeColorName');
    let pendingNameColor = null;   // null = otomatis

    function syncNameColor() {
        modal.querySelector('#pfeSwatchName').style.background = pendingNameColor || '#2a2a2a';
        modal.querySelector('#pfeNameColorLabel').textContent = pendingNameColor ? pendingNameColor.toUpperCase() : 'Auto';
        pfeName.style.color = pendingNameColor || '';   // pratinjau langsung di kolom nama
    }
    pfeColorName.addEventListener('input', () => { pendingNameColor = pfeColorName.value; syncNameColor(); });
    modal.querySelector('#pfeNameColorReset').addEventListener('click', () => {
        pendingNameColor = null;
        pfeColorName.value = '#ffffff';
        syncNameColor();
    });
    const pfeColorPrimary = modal.querySelector('#pfeColorPrimary');
    const pfeColorAccent = modal.querySelector('#pfeColorAccent');
    const pfeThemePreview = modal.querySelector('#pfeThemePreview');

    function syncThemeInputs() {
        modal.querySelector('#pfeSwatchPrimary').style.background = pfeColorPrimary.value;
        modal.querySelector('#pfeSwatchAccent').style.background = pfeColorAccent.value;
        pfeThemePreview.style.background = themeGradient({
            primary: pfeColorPrimary.value, accent: pfeColorAccent.value
        });
    }
    pfeColorPrimary.addEventListener('input', syncThemeInputs);
    pfeColorAccent.addEventListener('input', syncThemeInputs);
    modal.querySelector('#pfeThemeReset').addEventListener('click', () => {
        pfeColorPrimary.value = DEFAULT_THEME.primary;
        pfeColorAccent.value = DEFAULT_THEME.accent;
        syncThemeInputs();
    });
    const pfeBanner = modal.querySelector('#pfeBanner');
    const pfeAvatarImg = modal.querySelector('#pfeAvatarImg');
    const pfePhotoFile = modal.querySelector('#pfePhotoFile');
    const pfeBannerFile = modal.querySelector('#pfeBannerFile');

    function refreshModalPreview() {
        const banner = pendingBannerRemove ? null : (pendingBanner || currentBanner);
        renderBanner(pfeBanner, banner);
        const photo = pendingPhotoRemove ? null : (pendingPhoto || getPhoto(currentUser));
        setAvatar(pfeAvatarImg, photo);
    }

    function openEditModal() {
        if (!currentUser) return;
        pendingPhoto = null; pendingPhotoRemove = false;
        pendingBanner = null; pendingBannerRemove = false;
        pfeName.value = getName(currentUser);
        pfeBio.value = getBio(currentUser);
        pfePronouns.value = getPronouns(currentUser);
        pfeUsername.value = getUsername(currentUser);
        pendingNameColor = getNameColor(currentUser) || null;
        pfeColorName.value = pendingNameColor || '#ffffff';
        syncNameColor();
        const theme = getTheme(currentUser);
        pfeColorPrimary.value = theme.primary;
        pfeColorAccent.value = theme.accent;
        syncThemeInputs();
        refreshModalPreview();
        modal.classList.add('show');
    }
    function closeEditModal() {
        modal.classList.remove('show');
        renderBanner(pfeBanner, null);   // lepas object URL
    }

    modal.querySelector('#pfeClose').addEventListener('click', closeEditModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeEditModal(); });

    const pfeBannerEditBtn = modal.querySelector('#pfeBannerEditBtn');
    const pfeBannerMenu = modal.querySelector('#pfeBannerMenu');
    const pfeAvatarEditBtn = modal.querySelector('#pfeAvatarEditBtn');
    const pfeAvatarMenu = modal.querySelector('#pfeAvatarMenu');

    pfeBannerEditBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        pfeAvatarMenu.classList.remove('show');
        const hasBanner = !(pendingBannerRemove || (!pendingBanner && !currentBanner));
        modal.querySelector('#pfeBannerMenuRemove').classList.toggle('disabled', !hasBanner);
        pfeBannerMenu.classList.toggle('show');
    });

    pfeAvatarEditBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        pfeBannerMenu.classList.remove('show');
        const hasPhoto = !(pendingPhotoRemove || (!pendingPhoto && !getPhoto(currentUser)));
        modal.querySelector('#pfeAvatarMenuRemove').classList.toggle('disabled', !hasPhoto);
        pfeAvatarMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (pfeBannerMenu.classList.contains('show') &&
            !pfeBannerMenu.contains(e.target) && !pfeBannerEditBtn.contains(e.target)) {
            pfeBannerMenu.classList.remove('show');
        }
        if (pfeAvatarMenu.classList.contains('show') &&
            !pfeAvatarMenu.contains(e.target) && !pfeAvatarEditBtn.contains(e.target)) {
            pfeAvatarMenu.classList.remove('show');
        }
    });

    modal.querySelector('#pfeBannerMenuUpload').addEventListener('click', () => {
        pfeBannerMenu.classList.remove('show');
        pfeBannerFile.click();
    });
    modal.querySelector('#pfeBannerMenuRemove').addEventListener('click', () => {
        pfeBannerMenu.classList.remove('show');
        pendingBanner = null;
        pendingBannerRemove = true;
        refreshModalPreview();
    });
    pfeBannerFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        pfeBannerFile.value = '';
        if (!file) return;
        try {
            pendingBanner = await fileToBanner(file);
            pendingBannerRemove = false;
            refreshModalPreview();
        } catch (err) {
            showToast(err.message || 'Gagal memuat banner');
        }
    });

    modal.querySelector('#pfeAvatarMenuUpload').addEventListener('click', () => {
        pfeAvatarMenu.classList.remove('show');
        pfePhotoFile.click();
    });
    modal.querySelector('#pfeAvatarMenuRemove').addEventListener('click', () => {
        pfeAvatarMenu.classList.remove('show');
        pendingPhoto = null;
        pendingPhotoRemove = true;
        refreshModalPreview();
    });
    pfePhotoFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        pfePhotoFile.value = '';
        if (!file) return;
        resizeImageToDataUrl(file, 300, (dataUrl) => {
            pendingPhoto = dataUrl;
            pendingPhotoRemove = false;
            refreshModalPreview();
        });
    });

    modal.querySelector('#pfeSave').addEventListener('click', async () => {
        const name = pfeName.value.trim();
        try {
            if (name && name !== currentUser.displayName) {
                await currentUser.updateProfile({ displayName: name });
            }
            if (pendingPhoto) localStorage.setItem(PHOTO_KEY(currentUser.uid), pendingPhoto);
            else if (pendingPhotoRemove) localStorage.removeItem(PHOTO_KEY(currentUser.uid));

            const bio = pfeBio.value.trim();
            if (bio) localStorage.setItem(BIO_KEY(currentUser.uid), bio);
            else localStorage.removeItem(BIO_KEY(currentUser.uid));
            const pr = pfePronouns.value.trim();
            if (pr) localStorage.setItem(PRONOUN_KEY(currentUser.uid), pr);
            else localStorage.removeItem(PRONOUN_KEY(currentUser.uid));

            const un = pfeUsername.value.trim().toLowerCase().replace(/[^a-z0-9._]/g, '');
            if (un) localStorage.setItem(USERNAME_KEY(currentUser.uid), un);
            else localStorage.removeItem(USERNAME_KEY(currentUser.uid));

            if (pendingNameColor) localStorage.setItem(NAMECOLOR_KEY(currentUser.uid), pendingNameColor);
            else localStorage.removeItem(NAMECOLOR_KEY(currentUser.uid));

            localStorage.setItem(THEME_KEY(currentUser.uid), JSON.stringify({
                primary: pfeColorPrimary.value, accent: pfeColorAccent.value
            }));

            if (pendingBanner) await idbSet(currentUser.uid, pendingBanner);
            else if (pendingBannerRemove) await idbDel(currentUser.uid);
        } catch (err) {
            console.error(err);
            showToast('Gagal menyimpan profil (penyimpanan penuh?)');
            return;
        }
        closeEditModal();
        refreshProfileUI();
        await loadBanner(currentUser);
        showToast('Profile saved');
    });

    // ---------- History (versi "Recents") ----------
    function renderHistoryView() {
        const list = document.getElementById('historyViewList');
        if (playHistory.length === 0) {
            list.innerHTML = `<div class="hv-empty">No songs have been played yet.</div>`;
            return;
        }
        list.innerHTML = `<h3 class="hv-group">Today</h3>` + playHistory.map(s => `
            <div class="hv-row" data-song-id="${s.id}">
                <img src="${s.songImage}" alt="">
                <div class="hv-info">
                    <div class="hv-name">${s.songName}</div>
                    <div class="hv-artist">${s.songDes}</div>
                </div>
            </div>`).join('');

        list.querySelectorAll('.hv-row').forEach(row => {
            row.addEventListener('click', () => {
                playSongFromList(parseInt(row.dataset.songId), [...playHistory]);
            });
        });
    }

    function openHistoryView() {
        renderHistoryView();
        showOnly(historyView);
    }

    const _renderHistory = renderHistory;
    renderHistory = function () {
        _renderHistory();
        if (historyView.classList.contains('show')) renderHistoryView();
    };

    // ---------- Status login ----------
    firebase.auth().onAuthStateChanged((user) => {
        currentUser = user;
        const loggedIn = !!user;
        wrap.style.display = loggedIn ? 'block' : 'none';
        [signupBtn, loginBtn].forEach(el => el && el.classList.toggle('auth-hidden', loggedIn));

        if (loggedIn) {
            setAvatar(avatarBtn, getPhoto(user));
            loadBanner(user);
        } else {
            menu.classList.remove('show');
            closeEditModal();
            loadBanner(null);
            if (profileView.classList.contains('show') || historyView.classList.contains('show')) {
                closePlaylistDetailView();
            }
        }
    });
})();