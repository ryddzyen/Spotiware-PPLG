// ===== account.js : menu "Akun" di Settings + pembungkus "Tampilan" =====
// Pasang SETELAH settings.js:  <script src="account.js" defer></script>
(() => {
    const view = document.querySelector('.settings-view');
    if (!view || typeof firebase === 'undefined') return;
    const auth = firebase.auth();
    const db = firebase.firestore();
    const rightPart = document.querySelector('.main-right-part');

    const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const EMAIL_RE = /^\S+@\S+\.\S+$/;
    const user = () => auth.currentUser;
    const hasProv = (id) => !!(user() && user().providerData.some((p) => p.providerId === id));
    const provCount = () => (user() ? user().providerData.length : 0);
    const toast = (m) => { try { showToast(m); } catch (_) {} };

    // ---------- struktur: #stMain (halaman utama) + #stSub (sub halaman) ----------
    const title = view.querySelector('.st-title');
    const section = view.querySelector('.st-section');
    const mainWrap = document.createElement('div');
    mainWrap.id = 'stMain';
    view.insertBefore(mainWrap, title);
    mainWrap.append(title, section);

    const sub = document.createElement('div');
    sub.id = 'stSub';
    sub.style.display = 'none';
    view.appendChild(sub);

    // ---------- 1) bungkus semua pengaturan tampilan jadi satu ----------
    const cards = [...section.querySelectorAll(':scope > .st-card')];
    const desc = section.querySelector('.st-desc');
    section.querySelector('.st-h2')?.remove();

    const group = document.createElement('div');
    group.className = 'st-group';
    group.innerHTML = `
        <button type="button" class="st-group-head">
            <div class="st-icon"><i class="fa-solid fa-palette"></i></div>
            <div class="st-info">
                <h3>Tampilan</h3>
                <p>Kursor, Ambient Light, Wallpaper, dan Transparansi Card</p>
            </div>
            <i class="fa-solid fa-chevron-down st-group-chev"></i>
        </button>
        <div class="st-group-body"></div>`;
    const groupBody = group.querySelector('.st-group-body');
    if (desc) groupBody.appendChild(desc);
    cards.forEach((c) => groupBody.appendChild(c));
    section.appendChild(group);
    group.querySelector('.st-group-head').addEventListener('click', () => group.classList.toggle('open'));

    // ---------- 2) menu Akun ----------
    const acc = document.createElement('section');
    acc.className = 'st-section st-account';
    acc.innerHTML = `
        <h2 class="st-h2">Akun</h2>
        <div class="acc-row">
            <span>Edit metode masuk</span>
            <button type="button" class="acc-edit" id="accEdit">Edit <i class="fa-solid fa-arrow-up-right-from-square"></i></button>
        </div>`;
    mainWrap.insertBefore(acc, section);
    acc.querySelector('#accEdit').addEventListener('click', renderMethods);

    // ---------- navigasi ----------
    function showMain() {
        sub.style.display = 'none';
        sub.innerHTML = '';
        mainWrap.style.display = '';
    }
    function showSub(html) {
        mainWrap.style.display = 'none';
        sub.style.display = 'block';
        sub.innerHTML = html;
        rightPart && rightPart.scrollTo({ top: 0 });
    }
    new MutationObserver(() => { if (view.classList.contains('show')) showMain(); })
        .observe(view, { attributes: true, attributeFilter: ['class'] });

    const BACK = '<button type="button" class="acc-back" id="accBack"><i class="fa-solid fa-arrow-left"></i></button>';
    const EYE = '<button type="button" class="acc-eye" tabindex="-1"><i class="fa-regular fa-eye-slash"></i></button>';
    const $ = (id) => sub.querySelector('#' + id);

    function wireEyes() {
        sub.querySelectorAll('.acc-eye').forEach((btn) => {
            btn.addEventListener('click', () => {
                const input = btn.parentElement.querySelector('input');
                input.type = input.type === 'password' ? 'text' : 'password';
                btn.querySelector('i').className = 'fa-regular ' + (input.type === 'password' ? 'fa-eye-slash' : 'fa-eye');
            });
        });
    }
    const setErr = (m, ok) => { const e = $('accErr'); if (e) { e.textContent = m || ''; e.classList.toggle('ok', !!ok); } };

    function errText(err) {
        const map = {
            'auth/wrong-password': 'Kata sandi salah.',
            'auth/invalid-credential': 'Kata sandi salah.',
            'auth/invalid-login-credentials': 'Kata sandi salah.',
            'auth/too-many-requests': 'Terlalu banyak percobaan, coba lagi nanti.',
            'auth/email-already-in-use': 'Email ini sudah dipakai akun lain.',
            'auth/requires-recent-login': 'Demi keamanan, keluar lalu masuk lagi, kemudian coba lagi.',
            'auth/credential-already-in-use': 'Akun Google ini sudah dipakai akun lain.',
            'auth/popup-closed-by-user': 'Jendela login ditutup.',
            'auth/popup-blocked': 'Popup diblokir. Izinkan popup untuk situs ini.',
            'auth/provider-already-linked': 'Sudah terhubung.',
            'auth/no-such-provider': 'Metode ini belum terhubung.',
            'auth/network-request-failed': 'Jaringan bermasalah.',
            'permission-denied': 'Akses ditolak. Cek Firestore rules.'
        };
        return map[err.code] || ('Terjadi kesalahan: ' + (err.code || err.message));
    }

    // ============================================================
    //  Halaman: Metode masuk
    // ============================================================
    function renderMethods() {
        const u = user();
        if (!u) { toast('Log in dulu'); return; }
        const pw = hasProv('password');
        const goog = hasProv('google.com');
        const canUnlink = provCount() > 1;

        showSub(`
            ${BACK}
            <h1 class="st-title">Metode masuk</h1>

            <div class="acc-list">
                <div class="acc-item${pw ? '' : ' disabled'}" id="accEmailRow">
                    <div>
                        <div class="acc-lbl">Email</div>
                        <div class="acc-val">${esc(u.email || 'Belum ada email')}</div>
                        ${pw ? '' : '<div class="acc-hint">Email dikelola oleh metode masuk lain. Buat kata sandi dulu untuk mengganti email.</div>'}
                    </div>
                    ${pw ? '<i class="fa-solid fa-chevron-right"></i>' : ''}
                </div>
                <div class="acc-item" id="accPwRow">
                    <div>
                        <div class="acc-lbl">Kata sandi</div>
                        <div class="acc-val">${pw ? '••••••••' : 'Belum dibuat'}</div>
                    </div>
                    <i class="fa-solid fa-chevron-right"></i>
                </div>
            </div>

            <h2 class="st-h2" style="margin-top:2rem;">Aplikasi sosial terkoneksi</h2>
            <p class="st-desc">Kelola aplikasi sosial yang kamu gunakan untuk masuk ke Spotiware.</p>
            <div class="acc-list">
                <div class="acc-item static">
                    <div class="acc-social"><i class="fa-brands fa-google"></i><span>Google</span></div>
                    <button type="button" class="acc-link" id="accGoogle" ${goog && !canUnlink ? 'disabled title="Satu-satunya metode masuk"' : ''}>
                        ${goog ? 'Putuskan' : 'Hubungkan'}
                    </button>
                </div>
            </div>`);

        $('accBack').addEventListener('click', showMain);
        if (pw) $('accEmailRow').addEventListener('click', renderEmail);
        $('accPwRow').addEventListener('click', renderPassword);

        $('accGoogle').addEventListener('click', async () => {
            const btn = $('accGoogle');
            btn.disabled = true;
            try {
                if (goog) {
                    if (!confirm('Putuskan akun Google dari akun ini?')) { btn.disabled = false; return; }
                    await u.unlink('google.com');
                    toast('Google diputuskan');
                } else {
                    await u.linkWithPopup(new firebase.auth.GoogleAuthProvider());
                    toast('Google terhubung');
                }
                await u.reload();
                renderMethods();
            } catch (err) {
                btn.disabled = false;
                toast(errText(err));
            }
        });
    }

    // ============================================================
    //  Halaman: Email
    // ============================================================
    function renderEmail() {
        const u = user();
        showSub(`
            ${BACK}
            <h1 class="st-title">Email</h1>
            <div class="acc-form">
                <label class="acc-label" for="accNew">Alamat email baru</label>
                <input class="acc-input" id="accNew" type="email" placeholder="email@contoh.com" autocomplete="off">
                <label class="acc-label" for="accNew2">Konfirmasi alamat email</label>
                <input class="acc-input" id="accNew2" type="email" placeholder="email@contoh.com" autocomplete="off">
                <label class="acc-label" for="accPass">Kata sandi</label>
                <div class="acc-pw"><input class="acc-input" id="accPass" type="password" autocomplete="current-password">${EYE}</div>
                <p class="acc-err" id="accErr"></p>
                <div class="acc-actions">
                    <button type="button" class="acc-btn" id="accCancel">Batal</button>
                    <button type="button" class="acc-btn primary" id="accSave">Simpan email</button>
                </div>
            </div>`);
        wireEyes();
        $('accBack').addEventListener('click', renderMethods);
        $('accCancel').addEventListener('click', renderMethods);

        $('accSave').addEventListener('click', async () => {
            const btn = $('accSave');
            const ne = $('accNew').value.trim().toLowerCase();
            const ne2 = $('accNew2').value.trim().toLowerCase();
            const pw = $('accPass').value;
            const old = (u.email || '').toLowerCase();
            setErr('');
            if (!EMAIL_RE.test(ne)) { setErr('Masukkan alamat email yang valid.'); return; }
            if (ne !== ne2) { setErr('Konfirmasi email tidak sama.'); return; }
            if (ne === old) { setErr('Itu sudah menjadi email kamu.'); return; }
            if (!pw) { setErr('Masukkan kata sandi kamu.'); return; }

            btn.disabled = true;
            try {
                await u.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(u.email, pw));

                const snap = await db.collection('acct_emails').doc(ne).get().catch(() => null);
                if (snap && snap.exists && snap.data().uid !== u.uid) {
                    btn.disabled = false;
                    setErr('Email ini sudah dipakai akun lain.');
                    return;
                }

                try {
                    await u.updateEmail(ne);
                } catch (err) {
                    if (err.code === 'auth/operation-not-allowed') {
                        // proyek mewajibkan verifikasi email baru dulu
                        await u.verifyBeforeUpdateEmail(ne);
                        toast('Cek ' + ne + ' untuk mengonfirmasi perubahan');
                        renderMethods();
                        return;
                    }
                    throw err;
                }

                // sinkronkan catatan email di Firestore
                await db.collection('acct_emails').doc(ne).set({ uid: u.uid }, { merge: true }).catch(() => {});
                if (old) db.collection('acct_emails').doc(old).delete().catch(() => {});
                let un = null;
                try { un = localStorage.getItem('spotiware_profile_username_' + u.uid); } catch (_) {}
                if (un) db.collection('acct_usernames').doc(un).update({ email: ne }).catch(() => {});

                toast('Email diperbarui');
                renderMethods();
            } catch (err) {
                btn.disabled = false;
                setErr(errText(err));
            }
        });
    }

    // ============================================================
    //  Halaman: Kata sandi
    // ============================================================
    function renderPassword() {
        const u = user();
        const has = hasProv('password');
        if (!has && !u.email) {
            toast('Akun ini tidak punya email, kata sandi tidak bisa dibuat.');
            return;
        }
        const canRemove = has && provCount() > 1;

        showSub(`
            ${BACK}
            <h1 class="st-title">Kata sandi</h1>
            <div class="acc-form">
                ${has ? `
                <label class="acc-label" for="accCur">Sandi saat ini</label>
                <div class="acc-pw"><input class="acc-input" id="accCur" type="password" autocomplete="current-password">${EYE}</div>` : ''}

                <label class="acc-label" for="accP1">Kata sandi baru</label>
                <div class="acc-pw"><input class="acc-input" id="accP1" type="password" autocomplete="new-password">${EYE}</div>

                <p class="acc-label" style="margin-bottom:.4rem;">Kata sandi harus berisi minimal</p>
                <ul class="acc-checks" id="accChecks">
                    <li data-k="letter">1 huruf</li>
                    <li data-k="num">1 angka atau karakter khusus (contoh: # ? ! &amp;)</li>
                    <li data-k="len">6 karakter</li>
                </ul>

                <label class="acc-label" for="accP2">Ulangi kata sandi baru</label>
                <div class="acc-pw"><input class="acc-input" id="accP2" type="password" autocomplete="new-password">${EYE}</div>

                <p class="acc-err" id="accErr"></p>
                ${canRemove ? '<button type="button" class="acc-danger" id="accRemove"><i class="fa-solid fa-circle-minus"></i> Hapus kata sandi</button>' : ''}
                <div class="acc-actions">
                    <button type="button" class="acc-btn" id="accCancel">Batal</button>
                    <button type="button" class="acc-btn primary" id="accSave" disabled>${has ? 'Simpan kata sandi baru' : 'Buat kata sandi'}</button>
                </div>
            </div>`);
        wireEyes();
        $('accBack').addEventListener('click', renderMethods);
        $('accCancel').addEventListener('click', renderMethods);

        const rules = {
            letter: (v) => /[A-Za-z]/.test(v),
            num: (v) => /[^A-Za-z]/.test(v),
            len: (v) => v.length >= 6
        };
        const p1 = $('accP1'), p2 = $('accP2'), cur = $('accCur');
        function check() {
            let ok = true;
            sub.querySelectorAll('#accChecks li').forEach((li) => {
                const pass = rules[li.dataset.k](p1.value);
                li.classList.toggle('ok', pass);
                if (!pass) ok = false;
            });
            if (p1.value !== p2.value) ok = false;
            if (cur && !cur.value) ok = false;
            $('accSave').disabled = !ok;
        }
        [p1, p2, cur].forEach((el) => el && el.addEventListener('input', check));

        $('accSave').addEventListener('click', async () => {
            const btn = $('accSave');
            setErr('');
            btn.disabled = true;
            try {
                if (has) {
                    await u.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(u.email, cur.value));
                    await u.updatePassword(p1.value);
                    toast('Kata sandi diperbarui');
                } else {
                    await u.linkWithCredential(firebase.auth.EmailAuthProvider.credential(u.email, p1.value));
                    toast('Kata sandi dibuat');
                }
                await u.reload();
                renderMethods();
            } catch (err) {
                btn.disabled = false;
                setErr(errText(err));
            }
        });

        $('accRemove')?.addEventListener('click', async () => {
            if (!confirm('Hapus kata sandi? Kamu tetap bisa masuk dengan metode lain.')) return;
            try {
                await u.unlink('password');
                await u.reload();
                toast('Kata sandi dihapus');
                renderMethods();
            } catch (err) { setErr(errText(err)); }
        });
    }
})();
