// ===== Profile menu, halaman Profile & History (tampil setelah login) =====
(() => {
    const PHOTO_KEY = (uid) => 'spotiware_profile_photo_' + uid;
    let currentUser = null;
    let pendingPhoto = null;      // dataURL foto baru (belum disimpan)
    let pendingRemove = false;    // true kalau user klik Remove photo

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

    // ---------- Halaman Profile & History (di panel tengah) ----------
    const profileView = document.createElement('div');
    profileView.className = 'profile-view';
    profileView.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar-big" id="profileAvatarBig" title="Edit profile"></div>
            <div class="profile-header-info">
                <p class="profile-type">Profile</p>
                <h1 class="profile-name" id="profileName" title="Edit profile"></h1>
                <p class="profile-meta" id="profileMeta"></p>
            </div>
        </div>
        <div class="profile-toolbar">
            <button class="profile-dots" id="profileDots" title="More options"><i class="fa-solid fa-ellipsis"></i></button>
            <div class="profile-dots-menu" id="profileDotsMenu">
                <div class="pm-item" id="profileEditItem"><i class="fa-solid fa-pen"></i><span>Edit profile</span></div>
            </div>
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
        closePlaylistDetailView();   // bersihkan view lain (versi yang sudah di-wrap di bawah)
        closeShowAllView();
        document.querySelectorAll('.music-section').forEach(s => s.classList.add('hide'));
        view.classList.add('show');
        rightPart.scrollTo({ top: 0 });
        window.scrollTo({ top: 0 });
        if (mainLeftPart) mainLeftPart.classList.remove('mobile-show');
        rightPart.classList.remove('mobile-hide');
    }

    // Saat view lain dibuka (playlist, show all, home, search), tutup Profile/History
    const _closePD = closePlaylistDetailView;
    closePlaylistDetailView = function () { closeProfileViews(); _closePD(); };
    const _closeSA = closeShowAllView;
    closeShowAllView = function () { closeProfileViews(); _closeSA(); };

    // ---------- Profile ----------
    function getName(u) {
        return u.displayName || (u.email ? u.email.split('@')[0] : 'Guest');
    }
    function getPhoto(u) {
        return localStorage.getItem(PHOTO_KEY(u.uid)) || null;
    }

    function refreshProfileUI() {
        if (!currentUser) return;
        const photo = getPhoto(currentUser);
        setAvatar(avatarBtn, photo);
        setAvatar(document.getElementById('profileAvatarBig'), photo);
        document.getElementById('profileName').textContent = getName(currentUser);
        document.getElementById('profileMeta').textContent = currentUser.email || '';
        const bigEl = document.getElementById('profileAvatarBig');
        bigEl.insertAdjacentHTML('beforeend',
            `<div class="pab-overlay"><i class="fa-solid fa-pencil"></i><span>Choose photo</span></div>`);
    }

    function openProfileView() {
        refreshProfileUI();
        showOnly(profileView);
    }

    // titik tiga di halaman profile
    const dots = profileView.querySelector('#profileDots');
    const dotsMenu = profileView.querySelector('#profileDotsMenu');
    dots.addEventListener('click', (e) => { e.stopPropagation(); dotsMenu.classList.toggle('show'); });
    document.addEventListener('click', () => dotsMenu.classList.remove('show'));
    profileView.querySelector('#profileEditItem').addEventListener('click', () => openEditModal());
    profileView.querySelector('#profileName').addEventListener('click', () => openEditModal());
    profileView.querySelector('#profileAvatarBig').addEventListener('click', () => openEditModal());

    // ---------- Modal "Profile details" ----------
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'profileDetailsModal';
    modal.innerHTML = `
        <div class="modal-box profile-details-box">
            <div class="edit-details-header">
                <h3>Profile details</h3>
                <button class="modal-x-btn" id="pdmClose"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="pdm-body">
                <div class="pdm-avatar" id="pdmAvatar">
                    <div class="pdm-avatar-img" id="pdmAvatarImg"></div>
                    <div class="pdm-overlay">
                        <button type="button" id="pdmChoose"><i class="fa-solid fa-pencil"></i> Choose photo</button>
                        <button type="button" id="pdmRemove"><i class="fa-regular fa-trash-can"></i> Remove photo</button>
                    </div>
                </div>
                <div class="pdm-fields">
                    <input type="text" id="pdmName" class="create-playlist-modal-input" placeholder="Name" maxlength="40">
                    <div class="modal-btn-row"><button class="modal-close-btn" id="pdmSave">Save</button></div>
                </div>
            </div>
            <input type="file" id="pdmFile" accept="image/*" style="display:none;">
        </div>`;
    document.body.appendChild(modal);

    const pdmName = modal.querySelector('#pdmName');
    const pdmFile = modal.querySelector('#pdmFile');
    const pdmAvatarImg = modal.querySelector('#pdmAvatarImg');

    function refreshModalAvatar() {
        const photo = pendingRemove ? null : (pendingPhoto || getPhoto(currentUser));
        setAvatar(pdmAvatarImg, photo);
    }

    function openEditModal() {
        if (!currentUser) return;
        pendingPhoto = null;
        pendingRemove = false;
        pdmName.value = getName(currentUser);
        refreshModalAvatar();
        modal.classList.add('show');
    }
    function closeEditModal() { modal.classList.remove('show'); }

    modal.querySelector('#pdmClose').addEventListener('click', closeEditModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeEditModal(); });
    modal.querySelector('#pdmChoose').addEventListener('click', () => pdmFile.click());
    modal.querySelector('#pdmRemove').addEventListener('click', () => {
        pendingPhoto = null;
        pendingRemove = true;
        refreshModalAvatar();
    });
    pdmFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        resizeImageToDataUrl(file, 300, (dataUrl) => {
            pendingPhoto = dataUrl;
            pendingRemove = false;
            refreshModalAvatar();
        });
        pdmFile.value = '';
    });

    modal.querySelector('#pdmSave').addEventListener('click', async () => {
        const name = pdmName.value.trim();
        try {
            if (name && name !== currentUser.displayName) {
                await currentUser.updateProfile({ displayName: name });
            }
            if (pendingPhoto) localStorage.setItem(PHOTO_KEY(currentUser.uid), pendingPhoto);
            else if (pendingRemove) localStorage.removeItem(PHOTO_KEY(currentUser.uid));
        } catch (err) {
            console.error(err);
            showToast('Failed to save profile');
            return;
        }
        refreshProfileUI();
        closeEditModal();
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

    // history otomatis ikut update kalau lagi dibuka
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
        } else {
            menu.classList.remove('show');
            closeEditModal();
            if (profileView.classList.contains('show') || historyView.classList.contains('show')) {
                closePlaylistDetailView();
            }
        }
    });
})();