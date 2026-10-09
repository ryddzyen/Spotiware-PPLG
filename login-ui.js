// ===== Halaman login ala Spotify: Email, Phone number, Google =====
(() => {
    const auth = firebase.auth();

    let mode = 'login';      // 'login' | 'signup'
    let email = '';
    let confirmation = null; // hasil signInWithPhoneNumber
    let phoneNumber = '';
    let recaptcha = null;

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

    function open(startMode) {
        mode = startMode;
        email = '';
        renderEmail();
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    function close() {
        overlay.classList.remove('show');
        document.body.style.overflow = '';
        resetRecaptcha();
    }

    overlay.querySelector('#lpClose').addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('show')) close();
    });

    // Cegat tombol Log in / Sign up di navbar (menggantikan modal lama)
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#loginBtn, #signupBtn');
        if (!btn) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        open(btn.id === 'signupBtn' ? 'signup' : 'login');
    }, true);

    // Tutup otomatis begitu berhasil login
    auth.onAuthStateChanged((user) => { if (user) close(); });

    // ---------- Helper ----------
    const $ = (id) => body.querySelector('#' + id);

    function setError(msg) {
        const el = $('lpError');
        if (el) el.textContent = msg || '';
    }

    function busy(btn, on, label) {
        if (!btn) return;
        btn.disabled = on;
        if (label) btn.textContent = on ? 'Please wait...' : label;
    }

    function friendlyError(err) {
        const map = {
            'auth/invalid-email': 'This email address is invalid.',
            'auth/invalid-credential': 'Incorrect email or password.',
            'auth/wrong-password': 'Incorrect email or password.',
            'auth/user-not-found': 'No account found for this email.',
            'auth/email-already-in-use': 'This email is already registered. Try logging in.',
            'auth/weak-password': 'Password must be at least 6 characters.',
            'auth/too-many-requests': 'Too many attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Check your connection.',
            'auth/popup-closed-by-user': 'The sign-in window was closed.',
            'auth/popup-blocked': 'Popup blocked. Allow popups for this site.',
            'auth/unauthorized-domain': 'This domain is not authorized in Firebase.',
            'auth/invalid-phone-number': 'Invalid phone number.',
            'auth/invalid-verification-code': 'Incorrect verification code.',
            'auth/code-expired': 'The code has expired. Request a new one.',
            'auth/quota-exceeded': 'SMS quota exceeded. Try again later.',
            'auth/captcha-check-failed': 'reCAPTCHA check failed. Try again.'
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

    function resetRecaptcha() {
        if (recaptcha) { try { recaptcha.clear(); } catch (_) {} recaptcha = null; }
        const c = document.getElementById('recaptchaContainer');
        if (c) c.innerHTML = '';
    }

    function getRecaptcha() {
        if (!recaptcha) {
            recaptcha = new firebase.auth.RecaptchaVerifier('recaptchaContainer', { size: 'invisible' });
        }
        return recaptcha;
    }

    // ---------- Langkah 1: Email ----------
    function renderEmail() {
        const isLogin = mode === 'login';
        body.innerHTML = `
            <h1 class="lp-title">${isLogin ? 'Welcome back' : 'Sign up to start listening'}</h1>
            <label class="lp-label" for="lpEmail">Email</label>
            <input class="lp-input" id="lpEmail" type="email" autocomplete="email" value="${email}">
            <p class="lp-error" id="lpError"></p>
            <button class="lp-primary" id="lpContinue">Continue</button>
            <div class="lp-or">or</div>
            <button class="lp-outline" id="lpPhone"><i class="fa-solid fa-mobile-screen"></i><span>Continue with phone number</span></button>
            <button class="lp-outline" id="lpGoogle">${GOOGLE_SVG}<span>Continue with Google</span></button>
            <div class="lp-foot">
                <p>${isLogin ? "Don't have an account?" : 'Already have an account?'}</p>
                <a href="#" id="lpSwitch">${isLogin ? 'Sign up' : 'Log in'}</a>
            </div>`;

        const input = $('lpEmail');
        input.focus();
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') $('lpContinue').click(); });

        $('lpContinue').addEventListener('click', () => {
            const v = input.value.trim();
            if (!/^\S+@\S+\.\S+$/.test(v)) {
                setError('Please enter a valid email address.');
                return;
            }
            email = v;
            renderPassword();
        });
        $('lpPhone').addEventListener('click', renderPhone);
        $('lpGoogle').addEventListener('click', googleLogin);
        $('lpSwitch').addEventListener('click', (e) => {
            e.preventDefault();
            email = input.value.trim();
            mode = isLogin ? 'signup' : 'login';
            renderEmail();
        });
    }

    // ---------- Langkah 2: Password ----------
    function renderPassword() {
        const isLogin = mode === 'login';
        body.innerHTML = `
            <button class="lp-back" id="lpBack"><i class="fa-solid fa-arrow-left"></i></button>
            <h1 class="lp-title">${isLogin ? 'Enter your password' : 'Create your account'}</h1>
            <p class="lp-sub">${email} <a href="#" id="lpChange">Change</a></p>
            ${isLogin ? '' : `
                <label class="lp-label" for="lpName">Name</label>
                <input class="lp-input" id="lpName" type="text" maxlength="40" autocomplete="name">`}
            <label class="lp-label" for="lpPass">Password</label>
            <input class="lp-input" id="lpPass" type="password" autocomplete="${isLogin ? 'current-password' : 'new-password'}" placeholder="${isLogin ? '' : 'At least 6 characters'}">
            <p class="lp-error" id="lpError"></p>
            <button class="lp-primary" id="lpSubmit">${isLogin ? 'Log in' : 'Sign up'}</button>
            ${isLogin ? '<div class="lp-foot lp-foot-tight"><a href="#" id="lpForgot">Forgot your password?</a></div>' : ''}`;

        const pass = $('lpPass');
        (isLogin ? pass : $('lpName')).focus();
        pass.addEventListener('keydown', (e) => { if (e.key === 'Enter') $('lpSubmit').click(); });

        $('lpBack').addEventListener('click', renderEmail);
        $('lpChange').addEventListener('click', (e) => { e.preventDefault(); renderEmail(); });

        $('lpSubmit').addEventListener('click', async () => {
            const btn = $('lpSubmit');
            const label = isLogin ? 'Log in' : 'Sign up';
            setError('');
            if (pass.value.length < 6) { setError('Password must be at least 6 characters.'); return; }
            busy(btn, true, label);
            try {
                if (isLogin) {
                    await auth.signInWithEmailAndPassword(email, pass.value);
                } else {
                    const cred = await auth.createUserWithEmailAndPassword(email, pass.value);
                    const name = $('lpName').value.trim();
                    if (name) await cred.user.updateProfile({ displayName: name });
                }
            } catch (err) {
                setError(friendlyError(err));
                busy(btn, false, label);
            }
        });

        $('lpForgot')?.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await auth.sendPasswordResetEmail(email);
                setError('');
                showToast('Password reset email sent');
            } catch (err) {
                setError(friendlyError(err));
            }
        });
    }

    // ---------- Google ----------
    async function googleLogin() {
        const btn = $('lpGoogle');
        setError('');
        btn.disabled = true;
        try {
            await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
        } catch (err) {
            setError(friendlyError(err));
            btn.disabled = false;
        }
    }

    // ---------- Phone: kirim kode ----------
    function renderPhone() {
        body.innerHTML = `
            <button class="lp-back" id="lpBack"><i class="fa-solid fa-arrow-left"></i></button>
            <h1 class="lp-title">Continue with phone number</h1>
            <p class="lp-sub">We'll text you a verification code.</p>
            <label class="lp-label" for="lpPhoneInput">Phone number</label>
            <input class="lp-input" id="lpPhoneInput" type="tel" autocomplete="tel" placeholder="0812 3456 7890 or +62 812 3456 7890">
            <p class="lp-error" id="lpError"></p>
            <button class="lp-primary" id="lpSend">Send code</button>`;

        const input = $('lpPhoneInput');
        input.focus();
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') $('lpSend').click(); });
        $('lpBack').addEventListener('click', renderEmail);

        $('lpSend').addEventListener('click', async () => {
            const btn = $('lpSend');
            const raw = input.value;
            if (raw.replace(/\D/g, '').length < 8) { setError('Please enter a valid phone number.'); return; }
            phoneNumber = normalizePhone(raw);
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

    // ---------- Phone: masukkan kode ----------
    function renderCode() {
        body.innerHTML = `
            <button class="lp-back" id="lpBack"><i class="fa-solid fa-arrow-left"></i></button>
            <h1 class="lp-title">Enter the code</h1>
            <p class="lp-sub">Sent to ${phoneNumber}</p>
            <label class="lp-label" for="lpCodeInput">6-digit code</label>
            <input class="lp-input lp-code" id="lpCodeInput" type="text" inputmode="numeric" maxlength="6" autocomplete="one-time-code">
            <p class="lp-error" id="lpError"></p>
            <button class="lp-primary" id="lpVerify">Verify</button>
            <div class="lp-foot lp-foot-tight"><a href="#" id="lpResend">Resend code</a></div>`;

        const input = $('lpCodeInput');
        input.focus();
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') $('lpVerify').click(); });
        $('lpBack').addEventListener('click', renderPhone);

        $('lpVerify').addEventListener('click', async () => {
            const btn = $('lpVerify');
            if (input.value.trim().length < 6) { setError('Enter the 6-digit code.'); return; }
            setError('');
            busy(btn, true, 'Verify');
            try {
                await confirmation.confirm(input.value.trim());
            } catch (err) {
                setError(friendlyError(err));
                busy(btn, false, 'Verify');
            }
        });

        $('lpResend').addEventListener('click', (e) => {
            e.preventDefault();
            resetRecaptcha();
            renderPhone();
        });
    }
})();