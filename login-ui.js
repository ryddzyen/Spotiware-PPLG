// ===== Login / Sign up ala Spotify =====
// Login : EMAIL -> link ke email (passwordless) / password, phone, Google
// Sign up: email -> password -> Name + Username (unik) -> terms
// Login langsung tanpa punya akun -> dialog "No Spotiware account found"
(() => {
    const auth = firebase.auth();
    const db = firebase.firestore();

    const USER_RE = /^[a-z0-9_.]+$/;
    const EMAIL_RE = /^\S+@\S+\.\S+$/;
    const LINK_KEY = 'spotiware_emaillink';

    let mode = 'login';        // 'login' | 'signup'
    let flow = {};             // data antar langkah
    let confirmation = null;
    let phoneNumber = '';
    let recaptcha = null;
    let holdClose = false;     // tahan overlay supaya tidak tertutup saat proses berjalan

    const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    const unameRef = (u) => db.collection('acct_usernames').doc(u);
    const emailRef = (e) => db.collection('acct_emails').doc(e);

    const GOOGLE_SVG = `<svg width="22" height="22" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>`;

    // ---------- Kerangka overlay ----------
    const overlay = document.createElement('div');
    overlay.className = 'login-page';
    overlay.innerHTML = `
        <button class="lp-close" id="lpClose" title="Close"><i class="fa-solid fa-xmark"></i></button>
        <div class="lp-inner">
            <img class="lp-logo" src="img/pplglogo.png" alt="">
            <div id="lpBody"></div>
        </div>
        <div id="recaptchaContainer"></div>`;
    document.body.appendChild(overlay);
    const body = overlay.querySelector('#lpBody');

    const dialog = document.createElement('div');
    dialog.className = 'lp-dialog-backdrop';
    document.body.appendChild(dialog);

    function open(startMode) {
        mode = startMode;
        flow = {};
        if (mode === 'signup') renderSignupEmail(); else renderLogin();
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        hideDialog();
        const pending = flow.pendingUser;   // daftar lewat Google/phone tapi tidak diselesaikan -> hapus akunnya
        flow.pendingUser = null;
        if (pending) pending.delete().catch(() => auth.signOut());
        overlay.classList.remove('show');
        document.body.style.overflow = '';
        resetRecaptcha();
    }

    overlay.querySelector('#lpClose').addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('show')) close();
    });

    // Cegat tombol Log in / Sign up di navbar
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#loginBtn, #signupBtn');
        if (!btn) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        open(btn.id === 'signupBtn' ? 'signup' : 'login');
    }, true);

    auth.onAuthStateChanged((user) => { if (user && !holdClose) close(); });

    // ---------- Dialog "No Spotiware account found" ----------
    function hideDialog() { dialog.classList.remove('show'); }

    function showNoAccount(what) {
        dialog.innerHTML = `
            <div class="lp-dialog">
                <h2>No Spotiware account found</h2>
                <p>This ${esc(what)} isn't connected to a Spotiware account.</p>
                <button type="button" class="lp-primary" id="dlgOther">Log in another way</button>
                <button type="button" class="lp-primary lp-secondary" id="dlgSignup">Sign up</button>
            </div>`;
        dialog.classList.add('show');
        dialog.querySelector('#dlgOther').addEventListener('click', () => {
            hideDialog(); mode = 'login'; flow = {}; renderLogin();
        });
        dialog.querySelector('#dlgSignup').addEventListener('click', () => {
            hideDialog(); mode = 'signup'; flow = {}; renderSignupEmail();
        });
    }

    // ---------- Helper ----------
    const $ = (id) => body.querySelector('#' + id);

    function setError(msg, ok) {
        const el = $('lpError');
        if (!el) return;
        el.textContent = msg || '';
        el.classList.toggle('ok', !!ok);
    }

    function banner(msg) {
        const slot = $('lpBannerSlot');
        if (slot) slot.innerHTML = msg
            ? `<div class="lp-banner"><i class="fa-solid fa-circle-exclamation"></i><span>${esc(msg)}</span></div>` : '';
    }

    function busy(btn, on, label) {
        if (!btn) return;
        btn.disabled = on;
        if (label) btn.textContent = on ? 'Please wait...' : label;
    }

    function friendlyError(err) {
        const map = {
            'auth/invalid-email': 'This email address is invalid.',
            'auth/email-already-in-use': 'This email is already registered. Try logging in.',
            'auth/weak-password': 'Password is too weak.',
            'auth/too-many-requests': 'Too many attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Check your connection.',
            'auth/popup-closed-by-user': 'The sign-in window was closed.',
            'auth/popup-blocked': 'Popup blocked. Allow popups for this site.',
            'auth/unauthorized-domain': 'This domain is not authorized in Firebase.',
            'auth/invalid-phone-number': 'Invalid phone number.',
            'auth/invalid-verification-code': 'Incorrect verification code.',
            'auth/code-expired': 'The code has expired. Request a new one.',
            'auth/quota-exceeded': 'Daily limit reached. Try again later.',
            'auth/captcha-check-failed': 'reCAPTCHA check failed. Try again.',
            'auth/invalid-action-code': 'This link is invalid or has expired. Request a new one.',
            'auth/expired-action-code': 'This link has expired. Request a new one.',
            'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase.',
            'permission-denied': 'Permission denied. Check your Firestore rules.',
            'unavailable': 'Could not reach the server. Check your connection.'
        };
        return map[err.code] || ('Something went wrong: ' + (err.code || err.message));
    }

    function normalizePhone(raw) {
        let s = raw.trim().replace(/[\s\-().]/g, '');
        if (s.startsWith('+')) return s;
        if (s.startsWith('00')) return '+' + s.slice(2);
        if (s.startsWith('0')) return '+62' + s.slice(1);
        if (s.startsWith('62')) return '+' + s;
        return '+62' + s;
    }

    function maskEmail(e) {
        const [l, d] = e.split('@');
        const ml = l.length <= 2 ? l[0] + '*' : l[0] + '*'.repeat(Math.min(l.length - 2, 6)) + l[l.length - 1];
        const md = d.length <= 5 ? d : d[0] + '*' + d.slice(-5);
        return ml + '@' + md;
    }

    function resetRecaptcha() {
        if (recaptcha) { try { recaptcha.clear(); } catch (_) {} recaptcha = null; }
        const c = document.getElementById('recaptchaContainer');
        if (c) c.innerHTML = '';
    }
    function getRecaptcha() {
        if (!recaptcha) recaptcha = new firebase.auth.RecaptchaVerifier('recaptchaContainer', { size: 'invisible' });
        return recaptcha;
    }

    const progress = (n) => `<div class="lp-progress"><span style="width:${(n / 3) * 100}%"></span></div>`;
    const BACK = '<button class="lp-back" id="lpBack"><i class="fa-solid fa-arrow-left"></i></button>';
    const EYE = '<button type="button" class="lp-eye" tabindex="-1"><i class="fa-regular fa-eye-slash"></i></button>';

    function wireEye(inputId) {
        const btn = body.querySelector('.lp-eye');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const input = $(inputId);
            input.type = input.type === 'password' ? 'text' : 'password';
            btn.querySelector('i').className = 'fa-regular ' + (input.type === 'password' ? 'fa-eye-slash' : 'fa-eye');
        });
    }

    async function deleteQuietly(user) {
        try { await user.delete(); } catch (_) { try { await auth.signOut(); } catch (__) {} }
    }

    // akun baru yang tidak sengaja terbuat saat "login" -> hapus, lalu tampilkan dialog
    async function rejectNew(user, what) {
        await deleteQuietly(user);
        holdClose = false;
        if (!overlay.classList.contains('show')) open('login');
        showNoAccount(what);
    }

    // ============================================================
    //  LOGIN
    // ============================================================
    function renderLogin() {
        body.innerHTML = `
            <h1 class="lp-title">Welcome back</h1>
            <label class="lp-label" for="lpId">Email address</label>
            <input class="lp-input" id="lpId" type="email" autocomplete="email" autocapitalize="none" value="${esc(flow.id || '')}">
            <p class="lp-error" id="lpError"></p>
            <button class="lp-primary" id="lpContinue">Continue</button>
            <div class="lp-or">or</div>
            <button class="lp-outline" id="lpPhone"><i class="fa-solid fa-mobile-screen"></i><span>Continue with phone number</span></button>
            <button class="lp-outline" id="lpGoogle">${GOOGLE_SVG}<span>Continue with Google</span></button>
            <div class="lp-foot">
                <p>Don't have an account?</p>
                <a href="#" id="lpSwitch">Sign up</a>
            </div>`;

        const input = $('lpId');
        input.focus();
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') $('lpContinue').click(); });
        $('lpContinue').addEventListener('click', onLoginContinue);
        $('lpPhone').addEventListener('click', renderPhone);
        $('lpGoogle').addEventListener('click', googleAuth);
        $('lpSwitch').addEventListener('click', (e) => {
            e.preventDefault(); mode = 'signup'; flow = {}; renderSignupEmail();
        });
    }

    async function onLoginContinue() {
        const btn = $('lpContinue');
        const v = $('lpId').value.trim().toLowerCase();
        setError('');
        if (!EMAIL_RE.test(v)) { setError('Please enter a valid email address.'); return; }
        flow.id = v;
        flow.email = v;
        busy(btn, true, 'Continue');
        try {
            // terdaftar -> kirim link; belum tercatat (akun lama) -> langsung ke password
            renderPassword();  
        } catch (err) {
            busy(btn, false, 'Continue');
            setError(friendlyError(err));
        }
    }

    // ----- link login ke email -----
    function linkErrorText(err) {
        if (err.code === 'auth/operation-not-allowed')
            return 'Email link login is not enabled yet. Turn on "Email link" in Firebase > Authentication > Sign-in method > Email/Password.';
        if (err.code === 'auth/unauthorized-continue-uri' || err.code === 'auth/invalid-continue-uri')
            return 'This domain (' + location.hostname + ') is not authorized. Add it in Firebase > Authentication > Settings > Authorized domains.';
        if (err.code === 'auth/quota-exceeded')
            return 'Too many log in emails were sent today. Please log in with your password instead.';
        return friendlyError(err);
    }

    async function sendLink() {
        try {
            await auth.sendSignInLinkToEmail(flow.email, {
                url: location.origin + location.pathname,
                handleCodeInApp: true
            });
            try { localStorage.setItem(LINK_KEY, flow.email); } catch (_) {}
            renderCheckEmail();
        } catch (err) {
            console.warn('Email link gagal:', err.code, err.message);
            renderPassword(linkErrorText(err));     // tampilkan alasannya, jangan diam saja
        }
    }

    function renderCheckEmail() {
        body.innerHTML = `
            ${BACK}
            <h1 class="lp-step-title big">Check your email</h1>
            <p class="lp-sub lp-left">We sent a log in link to <b>${esc(maskEmail(flow.email))}</b>. Open it in this browser to continue. Also check your spam folder.</p>
            <button type="button" class="lp-outline" id="lpResend" style="padding-left:1rem;">Resend link</button>
            <button type="button" class="lp-linkbtn" id="lpUsePw">Log in with a password</button>`;
        $('lpBack').addEventListener('click', renderLogin);
        $('lpUsePw').addEventListener('click', () => renderPassword());
        $('lpResend').addEventListener('click', async () => {
            const b = $('lpResend');
            b.disabled = true;
            try {
                await auth.sendSignInLinkToEmail(flow.email, { url: location.origin + location.pathname, handleCodeInApp: true });
                showToast('Link sent');
            } catch (err) { showToast(linkErrorText(err)); }
            setTimeout(() => { b.disabled = false; }, 15000);
        });
    }

    // dipanggil saat halaman dibuka dari link di email
    async function completeEmailLink() {
        if (!auth.isSignInWithEmailLink(location.href)) return;
        let email = null;
        try { email = localStorage.getItem(LINK_KEY); } catch (_) {}
        if (!email) email = window.prompt('Confirm your email to finish logging in');
        if (!email) return;

        holdClose = true;
        try {
            const cred = await auth.signInWithEmailLink(email.trim(), location.href);
            try { localStorage.removeItem(LINK_KEY); } catch (_) {}
            history.replaceState(null, '', location.origin + location.pathname);
            if (cred.additionalUserInfo && cred.additionalUserInfo.isNewUser) {
                await rejectNew(cred.user, 'email address');
            } else {
                holdClose = false;
                showToast('Logged in');
            }
        } catch (err) {
            holdClose = false;
            showToast(friendlyError(err));
        }
    }

    // ----- login pakai password -----
    function renderPassword(note) {
        body.innerHTML = `
            ${BACK}
            <h1 class="lp-step-title big">Log in with a password</h1>
            <div id="lpBannerSlot"></div>
            <label class="lp-label">Email</label>
            <input class="lp-input" type="text" value="${esc(flow.email)}" readonly>
            <label class="lp-label" for="lpPass">Password</label>
            <div class="lp-pw"><input class="lp-input" id="lpPass" type="password" autocomplete="current-password">${EYE}</div>
            <button class="lp-primary" id="lpSubmit">Log in</button>
            <button type="button" class="lp-linkbtn" id="lpNoPw">Log in without password</button>
            <div class="lp-foot lp-foot-tight"><a href="#" id="lpForgot">Forgot your password?</a></div>`;
        wireEye('lpPass');
        if (note) banner(note);
        const pass = $('lpPass');
        pass.focus();
        pass.addEventListener('keydown', (e) => { if (e.key === 'Enter') $('lpSubmit').click(); });
        $('lpBack').addEventListener('click', renderLogin);

        $('lpSubmit').addEventListener('click', async () => {
            const btn = $('lpSubmit');
            banner('');
            if (!pass.value) { banner('Enter your password.'); return; }
            busy(btn, true, 'Log in');
            try {
                await auth.signInWithEmailAndPassword(flow.email, pass.value);
            } catch (err) {
                busy(btn, false, 'Log in');
                const bad = ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email'];
                banner(bad.includes(err.code) ? 'Incorrect email address or password.' : friendlyError(err));
            }
        });

        $('lpNoPw').addEventListener('click', async () => {
            banner('');
            await sendLink();
        });

        $('lpForgot').addEventListener('click', async (e) => {
            e.preventDefault();
            const link = $('lpForgot');
            if (link.dataset.busy) return;
            link.dataset.busy = '1';
            banner('');
            try {
                await auth.sendPasswordResetEmail(flow.email);
                showToast('Reset link sent. Check your inbox and spam folder.');
            } catch (err) {
                banner(err.code === 'auth/user-not-found'
                    ? 'No password account found for this email.'
                    : friendlyError(err));
            }
            setTimeout(() => { delete link.dataset.busy; }, 15000);
        });
    }

    // ============================================================
    //  GOOGLE & PHONE (dipakai login maupun sign up)
    // ============================================================
    async function socialFinish(cred, what) {
        const isNew = !!(cred.additionalUserInfo && cred.additionalUserInfo.isNewUser);

        if (mode === 'login') {
            if (isNew) { await rejectNew(cred.user, what); return; }
            holdClose = false;
            close();
            return;
        }

        // sign up
        if (!isNew) {
            holdClose = false;
            showToast('You already have an account. Logged you in.');
            close();
            return;
        }
        flow.pendingUser = cred.user;
        flow.social = true;
        flow.name = (cred.user.displayName || '').slice(0, 15);
        flow.username = '';
        renderProfileStep();
    }

    async function googleAuth() {
        const btn = $('lpGoogle');
        setError('');
        if (btn) btn.disabled = true;
        holdClose = true;
        try {
            const cred = await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
            await socialFinish(cred, 'Google account');
        } catch (err) {
            holdClose = false;
            setError(friendlyError(err));
            if (btn) btn.disabled = false;
        }
    }

    function renderPhone() {
        body.innerHTML = `
            ${BACK}
            <h1 class="lp-step-title big">Continue with phone number</h1>
            <p class="lp-sub lp-left">We'll text you a verification code.</p>
            <label class="lp-label" for="lpPhoneInput">Phone number</label>
            <input class="lp-input" id="lpPhoneInput" type="tel" autocomplete="tel" placeholder="0812 3456 7890 or +62 812 3456 7890">
            <p class="lp-error" id="lpError"></p>
            <button class="lp-primary" id="lpSend">Send code</button>`;
        const input = $('lpPhoneInput');
        input.focus();
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') $('lpSend').click(); });
        $('lpBack').addEventListener('click', () => { if (mode === 'signup') renderSignupEmail(); else renderLogin(); });

        $('lpSend').addEventListener('click', async () => {
            const btn = $('lpSend');
            if (input.value.replace(/\D/g, '').length < 8) { setError('Please enter a valid phone number.'); return; }
            phoneNumber = normalizePhone(input.value);
            setError('');
            busy(btn, true, 'Send code');
            try {
                confirmation = await auth.signInWithPhoneNumber(phoneNumber, getRecaptcha());
                renderCode();
            } catch (err) {
                setError(friendlyError(err));
                busy(btn, false, 'Send code');
                resetRecaptcha();
            }
        });
    }

    function renderCode() {
        body.innerHTML = `
            ${BACK}
            <h1 class="lp-step-title big">Enter the code</h1>
            <p class="lp-sub lp-left">Sent to ${esc(phoneNumber)}</p>
            <label class="lp-label" for="lpCodeInput">6-digit code</label>
            <input class="lp-input lp-code" id="lpCodeInput" type="text" inputmode="numeric" maxlength="6" autocomplete="one-time-code">
            <p class="lp-error" id="lpError"></p>
            <button class="lp-primary" id="lpVerify">Verify</button>
            <div class="lp-foot lp-foot-tight"><a href="#" id="lpResendCode">Resend code</a></div>`;
        const input = $('lpCodeInput');
        input.focus();
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') $('lpVerify').click(); });
        $('lpBack').addEventListener('click', renderPhone);

        $('lpVerify').addEventListener('click', async () => {
            const btn = $('lpVerify');
            if (input.value.trim().length < 6) { setError('Enter the 6-digit code.'); return; }
            setError('');
            busy(btn, true, 'Verify');
            holdClose = true;
            try {
                const cred = await confirmation.confirm(input.value.trim());
                await socialFinish(cred, 'phone number');
            } catch (err) {
                holdClose = false;
                setError(friendlyError(err));
                busy(btn, false, 'Verify');
            }
        });
        $('lpResendCode').addEventListener('click', (e) => { e.preventDefault(); resetRecaptcha(); renderPhone(); });
    }

    // ============================================================
    //  SIGN UP
    // ============================================================
    // cek email: koleksi acct_emails + metode login Firebase (kalau fiturnya aktif)
    async function emailTaken(v) {
        try { if ((await emailRef(v).get()).exists) return true; } catch (_) {}
        try { return (await auth.fetchSignInMethodsForEmail(v)).length > 0; } catch (_) {}
        return false;
    }

    function showEmailTaken(v) {
        const el = $('lpError');
        if (!el) return;
        el.classList.remove('ok');
        el.innerHTML = 'This email is already registered. <a href="#" id="lpGoLogin">Log in instead</a>';
        $('lpGoLogin').addEventListener('click', (e) => {
            e.preventDefault();
            mode = 'login';
            flow = { id: v };      // email langsung terisi di halaman login
            renderLogin();
        });
    }

    function renderSignupEmail() {
        body.innerHTML = `
            <h1 class="lp-title">Sign up to start listening</h1>
            <label class="lp-label" for="lpEmail">Email address</label>
            <input class="lp-input" id="lpEmail" type="email" autocomplete="email" value="${esc(flow.email || '')}">
            <p class="lp-error" id="lpError"></p>
            <button class="lp-primary" id="lpNext">Next</button>
            <div class="lp-or">or</div>
            <button class="lp-outline" id="lpPhone"><i class="fa-solid fa-mobile-screen"></i><span>Sign up with phone number</span></button>
            <button class="lp-outline" id="lpGoogle">${GOOGLE_SVG}<span>Sign up with Google</span></button>
            <div class="lp-foot">
                <p>Already have an account?</p>
                <a href="#" id="lpSwitch">Log in</a>
            </div>`;
        const input = $('lpEmail');
        input.focus();
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') $('lpNext').click(); });

        // cek otomatis begitu email selesai diketik
        let timer = null, token = 0;
        input.addEventListener('input', () => {
            clearTimeout(timer);
            setError('');
            const v = input.value.trim().toLowerCase();
            if (!EMAIL_RE.test(v)) return;
            const my = ++token;
            timer = setTimeout(async () => {
                if (await emailTaken(v) && my === token) showEmailTaken(v);
            }, 500);
        });

        $('lpNext').addEventListener('click', async () => {
            const btn = $('lpNext');
            const v = input.value.trim().toLowerCase();
            setError('');
            if (!EMAIL_RE.test(v)) { setError('Please enter a valid email address.'); return; }
            busy(btn, true, 'Next');
            if (await emailTaken(v)) { busy(btn, false, 'Next'); showEmailTaken(v); return; }
            flow.email = v;
            renderSignupPassword();
        });
        $('lpPhone').addEventListener('click', renderPhone);
        $('lpGoogle').addEventListener('click', googleAuth);
        $('lpSwitch').addEventListener('click', (e) => { e.preventDefault(); mode = 'login'; flow = {}; renderLogin(); });
    }

    // ----- Step 1: password -----
    function renderSignupPassword() {
        body.innerHTML = `
            ${progress(1)}
            ${BACK}
            <p class="lp-step">Step 1 of 3</p>
            <h1 class="lp-step-title">Create a password</h1>
            <label class="lp-label" for="lpPass">Password</label>
            <div class="lp-pw"><input class="lp-input" id="lpPass" type="password" autocomplete="new-password" value="${esc(flow.password || '')}">${EYE}</div>
            <p class="lp-label">Your password must contain at least</p>
            <ul class="lp-checks">
                <li data-k="letter"><i class="fa-solid fa-check"></i>1 letter</li>
                <li data-k="num"><i class="fa-solid fa-check"></i>1 number or special character (example: # ? ! &amp;)</li>
                <li data-k="len"><i class="fa-solid fa-check"></i>6 characters</li>
            </ul>
            <button class="lp-primary" id="lpNext" disabled>Next</button>`;
        wireEye('lpPass');
        const pass = $('lpPass');
        pass.focus();

        const rules = {
            letter: (v) => /[A-Za-z]/.test(v),
            num: (v) => /[^A-Za-z]/.test(v),
            len: (v) => v.length >= 6
        };
        function check() {
            let all = true;
            body.querySelectorAll('.lp-checks li').forEach((li) => {
                const ok = rules[li.dataset.k](pass.value);
                li.classList.toggle('ok', ok);
                if (!ok) all = false;
            });
            $('lpNext').disabled = !all;
        }
        pass.addEventListener('input', check);
        pass.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !$('lpNext').disabled) $('lpNext').click(); });
        check();

        $('lpBack').addEventListener('click', renderSignupEmail);
        $('lpNext').addEventListener('click', () => { flow.password = pass.value; renderProfileStep(); });
    }

    // ----- Step 2: Name + Username -----
    async function checkUsername(u) {
        if (u.length < 3 || u.length > 15) return { ok: false, msg: 'Username must be 3–15 characters.' };
        if (!USER_RE.test(u)) return { ok: false, msg: 'Use only letters, numbers, underscore (_) and dot (.).' };
        try {
            const s = await unameRef(u).get();
            if (s.exists) return { ok: false, msg: 'This username is already taken.' };
        } catch (_) { /* dicek ulang saat menyimpan */ }
        return { ok: true };
    }

    function renderProfileStep() {
        const social = !!flow.social;
        body.innerHTML = `
            ${social ? '' : progress(2)}
            ${social ? '' : BACK}
            ${social ? '' : '<p class="lp-step">Step 2 of 3</p>'}
            <h1 class="lp-step-title">Tell us about yourself</h1>
            <div id="lpBannerSlot"></div>
            <label class="lp-label" for="lpName">Name</label>
            <p class="lp-hint">This name will appear on your profile (3–15 characters).</p>
            <input class="lp-input" id="lpName" type="text" maxlength="15" autocomplete="name" value="${esc(flow.name || '')}">
            <label class="lp-label" for="lpUser">Username</label>
            <p class="lp-hint">3–15 characters. Letters, numbers, underscore (_) and dot (.) only. Must be unique.</p>
            <input class="lp-input" id="lpUser" type="text" maxlength="15" autocomplete="off" autocapitalize="none" spellcheck="false" value="${esc(flow.username || '')}">
            <p class="lp-error" id="lpError"></p>
            <button class="lp-primary" id="lpNext">${social ? 'Sign up' : 'Next'}</button>`;

        const nameEl = $('lpName'), userEl = $('lpUser');
        nameEl.focus();
        if (!social) $('lpBack').addEventListener('click', renderSignupPassword);

        let timer = null, token = 0;
        userEl.addEventListener('input', () => {
            const u = userEl.value.trim().toLowerCase();
            clearTimeout(timer);
            if (!u) { setError(''); return; }
            const my = ++token;
            timer = setTimeout(async () => {
                const r = await checkUsername(u);
                if (my !== token) return;
                if (r.ok) setError('✓ Username is available', true); else setError(r.msg);
            }, 450);
        });

        $('lpNext').addEventListener('click', async () => {
            const btn = $('lpNext');
            const name = nameEl.value.trim();
            const u = userEl.value.trim().toLowerCase();
            setError('');
            if (name.length < 3 || name.length > 15) { setError('Name must be 3–15 characters.'); return; }
            busy(btn, true, social ? 'Sign up' : 'Next');
            const r = await checkUsername(u);
            if (!r.ok) { busy(btn, false, social ? 'Sign up' : 'Next'); setError(r.msg); return; }

            flow.name = name;
            flow.username = u;

            if (!social) { renderTerms(); return; }

            // daftar lewat Google / phone: langsung simpan
            try {
                const res = await claimProfile(flow.pendingUser);
                if (res === 'taken') {
                    busy(btn, false, 'Sign up');
                    setError('This username was just taken. Try another one.');
                    return;
                }
                flow.pendingUser = null;
                holdClose = false;
                close();
            } catch (err) {
                busy(btn, false, 'Sign up');
                setError(friendlyError(err));
            }
        });
    }

    // ----- Step 3: terms -----
    function renderTerms() {
        body.innerHTML = `
            ${progress(3)}
            ${BACK}
            <p class="lp-step">Step 3 of 3</p>
            <h1 class="lp-step-title">Terms and Conditions</h1>
            <div id="lpBannerSlot"></div>
            <label class="lp-check">
                <input type="checkbox" id="lpAgree">
                <span>I agree to the Spotiware Terms of Use and Privacy Policy.</span>
            </label>
            <p class="lp-error" id="lpError"></p>
            <button class="lp-primary" id="lpSubmit">Sign up</button>`;
        $('lpBack').addEventListener('click', renderProfileStep);
        $('lpSubmit').addEventListener('click', createAccount);
    }

    // simpan username + email ke Firestore (transaksi supaya username benar-benar unik)
    // Email TIDAK disimpan di acct_usernames dan username TIDAK disimpan di acct_emails,
    // supaya dokumen yang bisa dibaca publik tidak membocorkan data pasangannya.
    async function claimProfile(user) {
        const u = flow.username;
        const email = (user.email || '').toLowerCase();
        try {
            await db.runTransaction(async (tx) => {
                const snap = await tx.get(unameRef(u));
                if (snap.exists) throw new Error('taken');
                tx.set(unameRef(u), { uid: user.uid });
                if (email) tx.set(emailRef(email), { uid: user.uid });
            });
        } catch (err) {
            if (err.message === 'taken') return 'taken';
            throw err;
        }
        await user.updateProfile({ displayName: flow.name });
        try { localStorage.setItem('spotiware_profile_username_' + user.uid, u); } catch (_) {}
        window.dispatchEvent(new Event('spotiware:profile-saved'));
        return null;
    }

    async function createAccount() {
        const btn = $('lpSubmit');
        if (!$('lpAgree').checked) { setError('Please accept the terms to continue.'); return; }
        setError('');
        busy(btn, true, 'Sign up');
        holdClose = true;
        let user = null;
        try {
            const cred = await auth.createUserWithEmailAndPassword(flow.email, flow.password);
            user = cred.user;
            const res = await claimProfile(user);
            if (res === 'taken') {
                await deleteQuietly(user);
                holdClose = false;
                renderProfileStep();
                setError('This username was just taken. Try another one.');
                return;
            }
            holdClose = false;
            close();
        } catch (err) {
            holdClose = false;
            if (err.code === 'auth/email-already-in-use') { renderSignupEmail(); showEmailTaken(flow.email); return; }
            if (user) await deleteQuietly(user);
            busy(btn, false, 'Sign up');
            banner(friendlyError(err));
        }
    }
    auth.onAuthStateChanged((user) => {
        if (user && user.email) {
            emailRef(user.email.toLowerCase()).set({ uid: user.uid }, { merge: true }).catch(() => {});
        }
    });

    completeEmailLink();
})();