// ===== username.js : username unik (1 username = 1 pengguna) =====
// Sumber kebenaran: koleksi Firestore "acct_usernames" (id = username huruf kecil).
// - Akun lama yang belum tercatat otomatis "mengklaim" username-nya saat login.
// - Kalau username sudah dipakai orang lain / tidak valid -> pengguna wajib memilih yang baru.
// - Dipakai juga oleh Edit Profile:  Username.claim('nama')
// Pasang setelah profile.js & login-ui.js:  <script src="username.js" defer></script>
(() => {
    if (typeof firebase === 'undefined') return;
    const auth = firebase.auth();
    const db = firebase.firestore();
    const RE = /^[a-z0-9_.]{3,15}$/;
    const ref = (u) => db.collection('acct_usernames').doc(u);
    const LS = (uid) => 'spotiware_profile_username_' + uid;
    const getLocal = (uid) => { try { return localStorage.getItem(LS(uid)) || ''; } catch (_) { return ''; } };
    const setLocal = (uid, u) => { try { localStorage.setItem(LS(uid), u); } catch (_) {} };
    const toast = (m) => { try { showToast(m); } catch (_) {} };

    function defaultName(user) {
        const base = (user.email ? user.email.split('@')[0] : 'user').toLowerCase().replace(/[^a-z0-9._]/g, '');
        return base || 'user';
    }
    const currentName = (user) => getLocal(user.uid) || defaultName(user);

    async function check(raw) {
        const u = String(raw || '').trim().toLowerCase();
        if (u.length < 3 || u.length > 15) return { ok: false, msg: 'Username harus 3–15 karakter.' };
        if (!RE.test(u)) return { ok: false, msg: 'Hanya huruf kecil, angka, titik (.) dan underscore (_).' };
        const me = auth.currentUser;
        try {
            const s = await ref(u).get();
            if (s.exists && (!me || s.data().uid !== me.uid)) return { ok: false, msg: 'Username ini sudah dipakai.' };
        } catch (_) { /* dicek ulang di transaksi */ }
        return { ok: true, u };
    }

    // klaim username (atomik) + lepas username lama milik sendiri
    async function claim(raw) {
        const me = auth.currentUser;
        if (!me) return { ok: false, msg: 'Belum login.' };
        const r = await check(raw);
        if (!r.ok) return r;
        const u = r.u;
        const old = getLocal(me.uid);
        const email = (me.email || '').toLowerCase() || null;
        try {
            await db.runTransaction(async (tx) => {
                const n = await tx.get(ref(u));
                if (n.exists && n.data().uid !== me.uid) throw new Error('taken');
                let o = null;
                if (old && old !== u) o = await tx.get(ref(old));
                tx.set(ref(u), { uid: me.uid });
                if (o && o.exists && o.data().uid === me.uid) tx.delete(ref(old));
            });
        } catch (err) {
            if (err.message === 'taken') return { ok: false, msg: 'Username ini sudah dipakai.' };
            return { ok: false, msg: 'Gagal menyimpan username (' + (err.code || err.message) + ').' };
        }
        setLocal(me.uid, u);
        return { ok: true, u };
    }

    // ---------- dialog wajib ganti username ----------
    const overlay = document.createElement('div');
    overlay.className = 'un-overlay';
    document.body.appendChild(overlay);

    function askRename(user, bad, reason) {
        overlay.innerHTML = `
            <div class="un-box">
                <h2>Pilih username baru</h2>
                <p>Username <b>@${bad.replace(/[<>&"]/g, '')}</b> ${reason}. Setiap pengguna harus punya username yang unik.</p>
                <input class="un-input" id="unInput" type="text" maxlength="15" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="username baru">
                <p class="un-msg" id="unMsg">3–15 karakter: huruf kecil, angka, titik, underscore.</p>
                <button type="button" class="un-save" id="unSave">Simpan</button>
                <button type="button" class="un-out" id="unOut">Log out</button>
            </div>`;
        overlay.classList.add('show');
        const input = overlay.querySelector('#unInput');
        const msg = overlay.querySelector('#unMsg');
        input.focus();

        let timer = null, tok = 0;
        input.addEventListener('input', () => {
            clearTimeout(timer);
            const v = input.value.trim().toLowerCase();
            msg.className = 'un-msg';
            if (!v) { msg.textContent = ''; return; }
            const my = ++tok;
            timer = setTimeout(async () => {
                const r = await check(v);
                if (my !== tok) return;
                msg.textContent = r.ok ? '✓ Username tersedia' : r.msg;
                msg.className = 'un-msg ' + (r.ok ? 'ok' : 'bad');
            }, 400);
        });
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') overlay.querySelector('#unSave').click(); });

        overlay.querySelector('#unSave').addEventListener('click', async () => {
            const btn = overlay.querySelector('#unSave');
            btn.disabled = true;
            const r = await claim(input.value);
            if (!r.ok) { btn.disabled = false; msg.textContent = r.msg; msg.className = 'un-msg bad'; return; }
            overlay.classList.remove('show');
            window.dispatchEvent(new Event('spotiware:profile-saved'));   // sinkron ke profil publik
            toast('Username disimpan');
        });
        overlay.querySelector('#unOut').addEventListener('click', () => {
            overlay.classList.remove('show');
            auth.signOut();
        });
    }

    // ---------- migrasi akun lama: klaim username saat login ----------
    async function ensureClaim(user, tries) {
        // jangan ganggu proses sign up yang masih berjalan
        if (document.querySelector('.login-page.show') && (tries || 0) < 12) {
            setTimeout(() => { if (auth.currentUser && auth.currentUser.uid === user.uid) ensureClaim(user, (tries || 0) + 1); }, 1500);
            return;
        }
        if (!auth.currentUser || auth.currentUser.uid !== user.uid) return;
        const u = currentName(user);
        let snap;
        try { snap = await ref(u).get(); } catch (_) { return; }

        if (snap.exists) {
            if (snap.data().uid === user.uid) { setLocal(user.uid, u); return; }
            askRename(user, u, 'sudah dipakai pengguna lain');
            return;
        }
        if (!RE.test(u)) { askRename(user, u, 'tidak valid (harus 3–15 karakter huruf kecil, angka, titik atau underscore)'); return; }
        const r = await claim(u);
        if (r.ok) window.dispatchEvent(new Event('spotiware:profile-saved'));
        else if (/dipakai/.test(r.msg)) askRename(user, u, 'sudah dipakai pengguna lain');
    }

    // ---------- rapikan catatan email setelah ganti email lewat link konfirmasi ----------
    function syncEmail(user) {
        const email = (user.email || '').toLowerCase();
        const k = 'spotiware_prev_email_' + user.uid;
        let prev = '';
        try { prev = localStorage.getItem(k) || ''; } catch (_) {}
        if (email) db.collection('acct_emails').doc(email).set({ uid: user.uid }, { merge: true }).catch(() => {});
        if (prev && prev !== email) {
            db.collection('acct_emails').doc(prev).delete().catch(() => {});
            try { localStorage.removeItem(k); } catch (_) {}
        }
    }

    auth.onAuthStateChanged((user) => {
        overlay.classList.remove('show');
        if (!user) return;
        setTimeout(() => ensureClaim(user, 0), 2500);
        setTimeout(() => syncEmail(user), 3000);
    });

    window.Username = { claim, check };
})();
