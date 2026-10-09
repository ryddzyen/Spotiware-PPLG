// ===== Settings: Tampilan (Kursor, Ambient Light, Wallpaper & Background) =====
(() => {
    const KEY = (u) => 'spotiware_settings_' + u;
    const WP_KEY = (u) => 'spotiware_wallpaper_' + u;
    const DEFAULTS = {
        ambient: false, ambIntensity: 55,
        cardTransparency: 32,
        wpEnabled: false, wpOpacity: 60, wpSize: 'cover',
        cursorDesign: 'default', cursorSize: 36
    };

    // ---- Konfigurasi kursor ----
    const CURSOR_FRAMES = 30;
    const CURSOR_FPS = 24;
    const TEXT_SEL = 'textarea, input:not([type=range]):not([type=checkbox]):not([type=file]):not([type=button]):not([type=submit])';
    // Elemen yang bikin kursor berubah jadi "mau klik" (sword, atau versi scale-down untuk desain SVG)
    const CLICKABLE_SEL = [
        'a', 'button', '[role=button]', '[onclick]', 'input[type=range]',
        '.music-card', '.playlist-item', '.playMusic', '.music-play-btn',
        '.np-controls i', '.player-btns', '.track-like-btn', '.track-more-btn',
        '.grid-play-btn', '.view-icon-btn', '.bottom-nav-item', '.sort-menu-item',
        '.pd-pill-btn', '.library-tab', '.create-playlist-btn', '.library-expand-btn',
        '.cursor-card', '.st-switch', '.scroll-btn', '.now-bar-like-btn',
        '.modal-close-btn', '.modal-secondary-btn', '.modal-danger-btn'
    ].join(', ');
    const canCursor = !window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    // ---- Daftar desain kursor ----
    // kind 'system' = kursor bawaan browser (mati)
    // kind 'sprite' = sprite PNG 30 frame, otomatis ganti ke 'hoverSrc' saat di atas elemen klik-able
    // kind 'svg'    = SVG inline; tambahkan class 'cur-pulse'/'cur-spin' untuk animasi
    const CURSOR_DESIGNS = [
        { id: 'default', name: 'Default', kind: 'system' },
        {
            id: 'classic', name: 'Sword', kind: 'sprite', animated: true,
            hx: 0.06, hy: 0.06,
            normalSrc: 'img/cursor-arrow.png',
            hoverSrc: 'img/cursor-sword.png'
        }
    ];

    let uid = null;
    let settings = { ...DEFAULTS };
    let wallpaper = null;
    let pendingWp = null;
    let draft = { opacity: 60, size: 'cover' };

    const body = document.body;
    const rightPart = document.querySelector('.main-right-part');

    // ---------- Layer background ----------
    const wpLayer = document.createElement('div');
    wpLayer.id = 'wallpaperLayer';
    const ambLayer = document.createElement('div');
    ambLayer.id = 'ambientLayer';
    ambLayer.innerHTML = '<div class="amb"></div><div class="amb"></div>';
    body.prepend(ambLayer);
    body.prepend(wpLayer);
    const ambEls = ambLayer.querySelectorAll('.amb');

    // ---------- Halaman Settings ----------
    const view = document.createElement('div');
    view.className = 'settings-view';
    view.innerHTML = `
        <h1 class="st-title">Settings</h1>

        <section class="st-section">
            <h2 class="st-h2">Tampilan</h2>
            <p class="st-desc">Personalisasikan tampilan Spotiware. Ambient Light dan Wallpaper tidak bisa aktif bersamaan, hanya salah satu.</p>

            <div class="st-card st-col">
                <div class="st-row">
                    <div class="st-icon"><i class="fa-solid fa-arrow-pointer"></i></div>
                    <div class="st-info">
                        <h3>Kursor Mouse</h3>
                        <p>Pilih tampilan kursor. Saat kursor di atas sesuatu yang bisa diklik, bentuknya otomatis berubah. Hanya untuk perangkat dengan mouse.</p>
                    </div>
                </div>
                <div class="cursor-gallery" id="stCursorGallery"></div>
                <div class="st-controls" id="stCursorSizeWrap">
                    <div class="st-field">
                        <label for="stCursorSize">Ukuran <b id="stCursorSizeVal">36px</b></label>
                        <input type="range" class="st-range" id="stCursorSize" min="20" max="80" value="36">
                    </div>
                </div>
            </div>

            <div class="st-card st-col">
                <div class="st-row">
                    <div class="st-icon"><i class="fa-regular fa-lightbulb"></i></div>
                    <div class="st-info">
                        <h3>Ambient Light</h3>
                        <p>Efek cahaya di sekitar tampilan mengikuti cover lagu yang sedang diputar.</p>
                    </div>
                    <label class="st-switch"><input type="checkbox" id="stAmbient"><span class="st-slider"></span></label>
                </div>
                <div class="st-amb-preview off" id="stAmbPreview">
                    <div class="stp-glow"></div>
                    <div class="stp-card"><i class="fa-solid fa-music"></i></div>
                    <span class="stp-label">Preview</span>
                </div>
                <div class="st-controls">
                    <div class="st-field">
                        <label for="stAmbIntensity">Intensitas cahaya <b id="stAmbIntensityVal">55%</b></label>
                        <input type="range" class="st-range" id="stAmbIntensity" min="0" max="100" value="55">
                    </div>
                </div>
            </div>

            <div class="st-card st-col">
                <div class="st-row">
                    <div class="st-icon"><i class="fa-regular fa-image"></i></div>
                    <div class="st-info">
                        <h3>Wallpaper &amp; Background</h3>
                        <p>Ganti latar belakang halaman menggunakan gambar pilihanmu.</p>
                    </div>
                    <label class="st-switch"><input type="checkbox" id="stWpEnabled"><span class="st-slider"></span></label>
                </div>

                <div class="st-wp-preview" id="stWpPreview">
                    <div class="stwp-layer" id="stWpLayer"></div>
                    <span class="stwp-empty" id="stWpEmpty">Belum ada gambar</span>
                </div>

                <div class="st-controls">
                    <button class="pd-pill-btn" id="stWpChoose"><i class="fa-solid fa-upload"></i> Pilih gambar</button>
                    <input type="file" id="stWpFile" accept="image/*" style="display:none;">

                    <div class="st-field">
                        <label for="stWpOpacity">Opacity <b id="stWpOpacityVal">60%</b></label>
                        <input type="range" class="st-range" id="stWpOpacity" min="0" max="100" value="60">
                    </div>

                    <div class="st-field">
                        <label>Ukuran background</label>
                        <div class="st-seg" id="stWpSize">
                            <button data-size="cover" class="active">Cover</button>
                            <button data-size="contain">Contain</button>
                        </div>
                    </div>

                    <div class="st-actions">
                        <button class="modal-close-btn" id="stWpApply">Terapkan</button>
                        <button class="modal-secondary-btn" id="stWpRemove">Hapus wallpaper</button>
                    </div>
                </div>
            </div>

            <div class="st-card st-col">
                <div class="st-row">
                    <div class="st-icon"><i class="fa-regular fa-clone"></i></div>
                    <div class="st-info">
                        <h3>Transparansi Card</h3>
                        <p>Atur transparansi semua card (sidebar, panel, navbar, player). Terlihat saat Ambient Light atau Wallpaper aktif.</p>
                    </div>
                </div>
                <div class="st-controls">
                    <div class="st-field">
                        <label for="stCardTrans">Transparansi <b id="stCardTransVal">32%</b></label>
                        <input type="range" class="st-range" id="stCardTrans" min="0" max="95" value="32">
                    </div>
                </div>
            </div>
        </section>`;
    rightPart.prepend(view);

    const $ = (id) => view.querySelector('#' + id);
    const elCursorGallery = $('stCursorGallery');
    const elCursorSize = $('stCursorSize');
    const elCursorSizeVal = $('stCursorSizeVal');
    const elCursorSizeWrap = $('stCursorSizeWrap');
    const elAmbient = $('stAmbient');
    const elAmbPreview = $('stAmbPreview');
    const elAmbIntensity = $('stAmbIntensity');
    const elAmbIntensityVal = $('stAmbIntensityVal');
    const elWpEnabled = $('stWpEnabled');
    const elWpLayer = $('stWpLayer');
    const elWpEmpty = $('stWpEmpty');
    const elOpacity = $('stWpOpacity');
    const elOpacityVal = $('stWpOpacityVal');
    const elFile = $('stWpFile');
    const elCardTrans = $('stCardTrans');
    const elCardTransVal = $('stCardTransVal');

    function paintRange(el) {
        const min = +el.min || 0, max = +el.max || 100;
        const pct = ((el.value - min) / (max - min)) * 100;
        el.style.background = `linear-gradient(to right, var(--yellow) ${pct}%, #4d4d4d ${pct}%)`;
    }

    // ---------- Simpan / muat ----------
    function saveSettings() {
        if (!uid) return;
        try { localStorage.setItem(KEY(uid), JSON.stringify(settings)); } catch (_) {}
    }
    function saveWallpaper() {
        if (!uid) return true;
        try {
            if (wallpaper) localStorage.setItem(WP_KEY(uid), wallpaper);
            else localStorage.removeItem(WP_KEY(uid));
            return true;
        } catch (_) { return false; }
    }
    function load(user) {
        uid = user ? user.uid : null;
        settings = { ...DEFAULTS };
        wallpaper = null;
        if (uid) {
            try { Object.assign(settings, JSON.parse(localStorage.getItem(KEY(uid))) || {}); } catch (_) {}
            wallpaper = localStorage.getItem(WP_KEY(uid)) || null;
        }
        // hanya satu mode: kalau data lama dua-duanya aktif, wallpaper dimatikan
        if (settings.ambient && settings.wpEnabled) settings.wpEnabled = false;
        if (settings.wpEnabled && !wallpaper) settings.wpEnabled = false;

        // migrasi dari versi lama (cursorEnabled + cursorStyle -> cursorDesign)
        if (uid && !('cursorDesign' in (JSON.parse(localStorage.getItem(KEY(uid)) || '{}')))) {
            settings.cursorDesign = settings.cursorEnabled ? 'classic' : 'default';
        }
    }

    function applyVars() {
        ambLayer.style.setProperty('--amb-intensity', settings.ambIntensity / 100);
        elAmbPreview.style.setProperty('--amb-prev', Math.min(1, settings.ambIntensity / 100 * 1.4));
        body.style.setProperty('--card-alpha', (1 - settings.cardTransparency / 100).toFixed(2));
    }

    // ================= Kursor (sprite + SVG, swap otomatis saat hover) =================
    const cursorEl = document.createElement('div');
    cursorEl.id = 'customCursor';
    body.appendChild(cursorEl);
    const cursorCanvas = document.createElement('canvas');
    cursorEl.appendChild(cursorCanvas);
    const cctx = cursorCanvas.getContext('2d');

    const sheetCache = {};
    let cursorOn = false, cursorSeen = false, isHoveringClickable = false;
    let activeDesignId = 'default';   // desain yang tersimpan & aktif
    let previewDesignId = null;       // desain sementara (saat hover kartu galeri)
    let curFrame = -1, rafId = null, cx = -100, cy = -100, cursorW = 0, cursorH = 0;
    let normalSheet = null, hoverSheet = null;

    function getDesign(id) { return CURSOR_DESIGNS.find(d => d.id === id) || CURSOR_DESIGNS[0]; }
    function currentDesign() { return getDesign(previewDesignId || activeDesignId); }

    function trimSheet(img) {
        const W = img.naturalWidth, H = img.naturalHeight;
        let top = 0, h = H;
        try {
            const c = document.createElement('canvas');
            c.width = W; c.height = H;
            const g = c.getContext('2d');
            g.drawImage(img, 0, 0);
            const d = g.getImageData(0, 0, W, H).data;
            let minY = H, maxY = -1;
            for (let y = 0; y < H; y++) {
                for (let x = 0; x < W; x++) {
                    if (d[(y * W + x) * 4 + 3] > 10) {
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                        break;
                    }
                }
            }
            if (maxY >= minY) { top = minY; h = maxY - minY + 1; }
        } catch (_) { /* file:// -> tidak bisa dipotong, pakai ukuran penuh */ }
        return { img, fw: W / CURSOR_FRAMES, top, h };
    }

    function loadSheet(src) {
        if (!sheetCache[src]) {
            sheetCache[src] = new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(trimSheet(img));
                img.onerror = reject;
                img.src = src;
            });
        }
        return sheetCache[src];
    }

    function sizeCursor() {
        const design = currentDesign();
        cursorW = settings.cursorSize;

        if (design.kind === 'sprite') {
            const sheet = (isHoveringClickable && hoverSheet) ? hoverSheet : normalSheet;
            if (!sheet) return;
            const dpr = window.devicePixelRatio || 1;
            cursorH = Math.max(1, Math.round(cursorW * sheet.h / Math.floor(sheet.fw)));
            cursorCanvas.width = Math.round(cursorW * dpr);
            cursorCanvas.height = Math.round(cursorH * dpr);
            cursorCanvas.style.width = cursorW + 'px';
            cursorCanvas.style.height = cursorH + 'px';
            curFrame = -1;
        } else if (design.kind === 'svg') {
            cursorH = cursorW;
        }
        moveCursor();
    }

    function moveCursor() {
        const design = currentDesign();
        cursorEl.style.transform =
            `translate(${Math.round(cx - design.hx * cursorW)}px, ${Math.round(cy - design.hy * cursorH)}px)`;
    }

    function tick(t) {
        const design = currentDesign();
        if (design.kind === 'sprite') {
            const sheet = (isHoveringClickable && hoverSheet) ? hoverSheet : normalSheet;
            if (sheet) {
                const f = Math.floor(t / 1000 * CURSOR_FPS) % CURSOR_FRAMES;
                if (f !== curFrame || sheet !== tick._lastSheet) {
                    curFrame = f;
                    tick._lastSheet = sheet;
                    cctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
                    cctx.drawImage(
                        sheet.img,
                        Math.round(f * sheet.fw), sheet.top,
                        Math.floor(sheet.fw), sheet.h,
                        0, 0, cursorCanvas.width, cursorCanvas.height
                    );
                }
            }
        }
        rafId = requestAnimationFrame(tick);
    }

    function renderSvgDesign(design) {
        cursorCanvas.style.display = 'none';
        cursorEl.querySelectorAll('.cur-svg').forEach(el => el.remove());
        const box = document.createElement('div');
        box.className = 'cur-svg';
        box.innerHTML = design.svg;
        box.style.width = settings.cursorSize + 'px';
        box.style.height = settings.cursorSize + 'px';
        cursorEl.appendChild(box);
        cursorEl.classList.toggle('cur-hover', isHoveringClickable);
    }

    async function applyCursor() {
        const design = currentDesign();

        if (design.kind === 'system' || !canCursor) {
            cursorOn = false;
            if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
            cursorEl.style.display = 'none';
            body.classList.remove('custom-cursor', 'cursor-native');
            return;
        }

        if (design.kind === 'sprite') {
            try {
                normalSheet = await loadSheet(design.normalSrc);
                hoverSheet = await loadSheet(design.hoverSrc);
            } catch (_) {
                showToast('File kursor tidak ditemukan di folder img/');
                settings.cursorDesign = 'default';
                activeDesignId = 'default';
                previewDesignId = null;
                saveSettings();
                renderCursorGallery();
                return applyCursor();
            }
            if (currentDesign().id !== design.id) return; // pilihan sudah berubah selama loading
            cursorEl.querySelectorAll('.cur-svg').forEach(el => el.remove());
            cursorCanvas.style.display = 'block';
        }

        cursorOn = true;
        body.classList.add('custom-cursor');
        sizeCursor();

        if (design.kind === 'svg') renderSvgDesign(design);

        cursorEl.style.display = cursorSeen ? 'block' : 'none';
        if (!rafId) rafId = requestAnimationFrame(tick);
    }

    function updateHoverState(hovering) {
        if (isHoveringClickable === hovering) return;
        isHoveringClickable = hovering;
        const design = currentDesign();
        if (design.kind === 'sprite') curFrame = -1;
        else if (design.kind === 'svg') cursorEl.classList.toggle('cur-hover', hovering);
        moveCursor();
    }

    document.addEventListener('mousemove', (e) => {
        cx = e.clientX; cy = e.clientY;
        cursorSeen = true;
        if (!cursorOn) return;
        cursorEl.style.display = 'block';
        moveCursor();
    }, { passive: true });

    document.addEventListener('mouseover', (e) => {
        const isText = !!(e.target.closest && e.target.closest(TEXT_SEL));
        if (cursorOn) {
            body.classList.toggle('cursor-native', isText);
            cursorEl.style.visibility = isText ? 'hidden' : 'visible';
        }
        const clickable = !isText && !!(e.target.closest && e.target.closest(CLICKABLE_SEL));
        updateHoverState(clickable);
    });

    document.documentElement.addEventListener('mouseleave', () => { cursorEl.style.visibility = 'hidden'; });
    document.documentElement.addEventListener('mouseenter', () => {
        if (!body.classList.contains('cursor-native')) cursorEl.style.visibility = 'visible';
    });

    document.addEventListener('fullscreenchange', () => {
        (document.fullscreenElement || body).appendChild(cursorEl);
    });
    window.addEventListener('resize', sizeCursor);

    // ---- Galeri desain kursor ----
    function cardPreviewMarkup(d) {
        if (d.kind === 'system') return '<i class="fa-solid fa-arrow-pointer"></i>';
        if (d.kind === 'sprite') return `<img src="${d.normalSrc}" class="cursor-card-img" alt="">`;
        return d.svg;
    }

    function renderCursorGallery() {
        elCursorGallery.innerHTML = CURSOR_DESIGNS.map(d => `
            <button type="button" class="cursor-card ${settings.cursorDesign === d.id ? 'active' : ''}" data-id="${d.id}" title="${d.name}">
                <span class="cursor-card-preview">${cardPreviewMarkup(d)}</span>
                <span class="cursor-card-name">${d.name}</span>
                ${d.animated ? '<span class="cursor-badge">Animated</span>' : ''}
            </button>
        `).join('');

        elCursorGallery.querySelectorAll('.cursor-card').forEach(card => {
            const id = card.dataset.id;
            card.addEventListener('click', () => {
                if (id !== 'default' && !canCursor) {
                    showToast('Kursor custom hanya untuk perangkat dengan mouse');
                    return;
                }
                settings.cursorDesign = id;
                activeDesignId = id;
                previewDesignId = null;
                saveSettings();
                elCursorGallery.querySelectorAll('.cursor-card').forEach(c => c.classList.toggle('active', c.dataset.id === id));
                elCursorSizeWrap.style.display = id === 'default' ? 'none' : '';
                applyCursor();
            });
            if (canCursor) {
                card.addEventListener('mouseenter', () => {
                    if (id === activeDesignId) return;
                    previewDesignId = id;
                    applyCursor();
                });
                card.addEventListener('mouseleave', () => {
                    previewDesignId = null;
                    applyCursor();
                });
            }
        });

        elCursorSizeWrap.style.display = settings.cursorDesign === 'default' ? 'none' : '';
    }

    elCursorSize.addEventListener('input', () => {
        settings.cursorSize = parseInt(elCursorSize.value);
        elCursorSizeVal.textContent = settings.cursorSize + 'px';
        paintRange(elCursorSize);
        sizeCursor();
        if (currentDesign().kind === 'svg') renderSvgDesign(currentDesign());
        saveSettings();
    });

    // ================= Ambient Light =================
    let lastCover = undefined;
    let flip = 0;

    function currentCover() {
        const img = document.getElementById('npImage');
        const src = img && img.getAttribute('src');
        return src ? src : null;
    }

    function setGlow(el, cover) {
        if (cover) {
            el.style.backgroundImage = `url("${encodeURI(cover)}")`;
            el.classList.remove('default');
        } else {
            el.style.backgroundImage = '';
            el.classList.add('default');
        }
    }

    function updateAmbient() {
        const cover = currentCover();
        body.classList.toggle('ambient-on', !!settings.ambient);

        setGlow(elAmbPreview.querySelector('.stp-glow'), cover);
        elAmbPreview.classList.toggle('off', !settings.ambient);

        if (!settings.ambient) { lastCover = undefined; return; }
        if (cover === lastCover) return;
        lastCover = cover;

        const next = ambEls[flip];
        const prev = ambEls[1 - flip];
        setGlow(next, cover);
        next.classList.add('on');
        prev.classList.remove('on');
        flip = 1 - flip;
    }

    const npImg = document.getElementById('npImage');
    if (npImg) {
        new MutationObserver(updateAmbient).observe(npImg, { attributes: true, attributeFilter: ['src'] });
    }

    // ================= Wallpaper =================
    function applyWallpaper() {
        const on = settings.wpEnabled && !!wallpaper;
        body.classList.toggle('has-wallpaper', on);
        if (on) {
            wpLayer.style.backgroundImage = `url("${wallpaper}")`;
            wpLayer.style.backgroundSize = settings.wpSize;
            wpLayer.style.opacity = settings.wpOpacity / 100;
        } else {
            wpLayer.style.backgroundImage = '';
        }
    }

    function fillRange() {
        paintRange(elOpacity);
        elOpacityVal.textContent = elOpacity.value + '%';
    }

    function renderWpPreview() {
        const src = pendingWp || wallpaper;
        elWpLayer.style.backgroundImage = src ? `url("${src}")` : '';
        elWpLayer.style.backgroundSize = draft.size;
        elWpLayer.style.opacity = draft.opacity / 100;
        elWpEmpty.style.display = src ? 'none' : 'block';
    }

    // sinkronkan toggle + tampilan setelah mode berubah
    function refreshModes() {
        elAmbient.checked = settings.ambient;
        elWpEnabled.checked = settings.wpEnabled && !!wallpaper;
        applyWallpaper();
        updateAmbient();
    }

    // ---- Ambient: toggle & intensitas ----
    elAmbient.addEventListener('change', () => {
        if (elAmbient.checked) {
            if (settings.wpEnabled) showToast('Wallpaper dimatikan, hanya satu mode yang bisa aktif');
            settings.ambient = true;
            settings.wpEnabled = false;
        } else {
            settings.ambient = false;
        }
        saveSettings();
        refreshModes();
    });

    elAmbIntensity.addEventListener('input', () => {
        settings.ambIntensity = parseInt(elAmbIntensity.value);
        elAmbIntensityVal.textContent = settings.ambIntensity + '%';
        paintRange(elAmbIntensity);
        applyVars();
        saveSettings();
    });

    // ---- Transparansi card ----
    elCardTrans.addEventListener('input', () => {
        settings.cardTransparency = parseInt(elCardTrans.value);
        elCardTransVal.textContent = settings.cardTransparency + '%';
        paintRange(elCardTrans);
        applyVars();
        saveSettings();
    });

    // ---- Wallpaper: kontrol ----
    $('stWpChoose').addEventListener('click', () => elFile.click());
    elFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        resizeImageToDataUrl(file, 1920, (dataUrl) => {
            pendingWp = dataUrl;
            renderWpPreview();
        });
        elFile.value = '';
    });

    elOpacity.addEventListener('input', () => {
        draft.opacity = parseInt(elOpacity.value);
        fillRange();
        renderWpPreview();
    });

    view.querySelectorAll('#stWpSize button').forEach(btn => {
        btn.addEventListener('click', () => {
            draft.size = btn.dataset.size;
            view.querySelectorAll('#stWpSize button').forEach(b => b.classList.toggle('active', b === btn));
            renderWpPreview();
        });
    });

    $('stWpApply').addEventListener('click', () => {
        if (!pendingWp && !wallpaper) { showToast('Pilih gambar dulu'); return; }
        const oldWp = wallpaper;
        if (pendingWp) wallpaper = pendingWp;
        if (!saveWallpaper()) {
            wallpaper = oldWp;
            showToast('Gambar terlalu besar untuk disimpan');
            return;
        }
        const turnedOffAmbient = settings.ambient;
        settings.wpOpacity = draft.opacity;
        settings.wpSize = draft.size;
        settings.wpEnabled = true;
        settings.ambient = false;      // hanya satu mode
        saveSettings();
        pendingWp = null;
        refreshModes();
        showToast(turnedOffAmbient ? 'Wallpaper diterapkan, Ambient Light dimatikan' : 'Wallpaper diterapkan');
    });

    $('stWpRemove').addEventListener('click', () => {
        wallpaper = null;
        pendingWp = null;
        settings.wpEnabled = false;
        saveWallpaper();
        saveSettings();
        refreshModes();
        renderWpPreview();
        showToast('Wallpaper dihapus');
    });

    elWpEnabled.addEventListener('change', () => {
        if (elWpEnabled.checked) {
            if (!wallpaper) {
                elWpEnabled.checked = false;
                showToast('Pilih gambar lalu klik Terapkan dulu');
                return;
            }
            if (settings.ambient) showToast('Ambient Light dimatikan, hanya satu mode yang bisa aktif');
            settings.wpEnabled = true;
            settings.ambient = false;
        } else {
            settings.wpEnabled = false;
        }
        saveSettings();
        refreshModes();
    });

    // ---------- Sinkron UI dengan settings ----------
    function syncUI() {
        activeDesignId = settings.cursorDesign;
        previewDesignId = null;
        renderCursorGallery();
        elCursorSize.value = settings.cursorSize;
        elCursorSizeVal.textContent = settings.cursorSize + 'px';
        paintRange(elCursorSize);

        elAmbIntensity.value = settings.ambIntensity;
        elAmbIntensityVal.textContent = settings.ambIntensity + '%';
        paintRange(elAmbIntensity);

        elCardTrans.value = settings.cardTransparency;
        elCardTransVal.textContent = settings.cardTransparency + '%';
        paintRange(elCardTrans);

        draft.opacity = settings.wpOpacity;
        draft.size = settings.wpSize;
        pendingWp = null;
        elOpacity.value = draft.opacity;
        fillRange();
        view.querySelectorAll('#stWpSize button').forEach(b =>
            b.classList.toggle('active', b.dataset.size === draft.size));
        renderWpPreview();

        applyVars();
        refreshModes();
    }

    // ---------- Buka / tutup halaman ----------
    function openSettings() {
        closePlaylistDetailView();
        closeShowAllView();
        document.querySelectorAll('.music-section').forEach(s => s.classList.add('hide'));
        syncUI();
        view.classList.add('show');
        rightPart.scrollTo({ top: 0 });
        window.scrollTo({ top: 0 });
        const left = document.querySelector('.main-left-part');
        if (left) left.classList.remove('mobile-show');
        rightPart.classList.remove('mobile-hide');
    }

    const _closePD = closePlaylistDetailView;
    closePlaylistDetailView = function () { view.classList.remove('show'); _closePD(); };
    const _closeSA = closeShowAllView;
    closeShowAllView = function () { view.classList.remove('show'); _closeSA(); };

    const profileMenu = document.getElementById('profileMenu');
    if (profileMenu) {
        profileMenu.addEventListener('click', (e) => {
            const item = e.target.closest('.pm-item[data-act="settings"]');
            if (!item) return;
            e.stopPropagation();
            profileMenu.classList.remove('show');
            openSettings();
        }, true);
    }

    // ---------- Status login ----------
    firebase.auth().onAuthStateChanged((user) => {
        body.classList.toggle('logged-in', !!user);
        load(user);
        lastCover = undefined;
        syncUI();
        applyCursor();
        if (!user && view.classList.contains('show')) closePlaylistDetailView();
    });
})();