const authModal = document.getElementById('authModal');
const authTitle = document.getElementById('authTitle');
const authName = document.getElementById('authName');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authError = document.getElementById('authError');
const authSubmit = document.getElementById('authSubmit');
const authSwitch = document.getElementById('authSwitch');
const authSwitchText = document.getElementById('authSwitchText');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');

let authMode = 'login'; // 'login' | 'signup'

function setAuthMode(mode) {
    authMode = mode;
    const isSignup = mode === 'signup';
    authTitle.textContent = isSignup ? 'Daftar' : 'Log in';
    authSubmit.textContent = isSignup ? 'Daftar' : 'Masuk';
    authName.style.display = isSignup ? 'block' : 'none';
    authSwitchText.textContent = isSignup ? 'Sudah punya akun?' : 'Belum punya akun?';
    authSwitch.textContent = isSignup ? 'Log in' : 'Daftar';
    authError.textContent = '';
}

function openAuthModal(mode) {
    setAuthMode(mode);
    authModal.classList.add('show');
}
function closeAuthModal() {
    authModal.classList.remove('show');
    authPassword.value = '';
    authError.textContent = '';
}

const AUTH_ERRORS = {
    'auth/invalid-email': 'Format email tidak valid.',
    'auth/missing-password': 'Password belum diisi.',
    'auth/weak-password': 'Password minimal 6 karakter.',
    'auth/email-already-in-use': 'Email sudah terdaftar.',
    'auth/invalid-credential': 'Email atau password salah.',
    'auth/user-not-found': 'Email atau password salah.',
    'auth/wrong-password': 'Email atau password salah.',
    'auth/too-many-requests': 'Terlalu banyak percobaan, coba lagi nanti.',
    'auth/popup-closed-by-user': ''
};

async function saveUserProfile(user, name) {
    const ref = db.collection('users').doc(user.uid);
    const snap = await ref.get();
    if (!snap.exists) {
        await ref.set({
            displayName: name || user.displayName || user.email.split('@')[0],
            email: user.email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
}

async function submitAuth() {
    authError.textContent = '';
    const email = authEmail.value.trim();
    const password = authPassword.value;
    try {
        if (authMode === 'signup') {
            const name = authName.value.trim();
            if (!name) { authError.textContent = 'Nama belum diisi.'; return; }
            const cred = await auth.createUserWithEmailAndPassword(email, password);
            await cred.user.updateProfile({ displayName: name });
            await saveUserProfile(cred.user, name);
        } else {
            await auth.signInWithEmailAndPassword(email, password);
        }
        closeAuthModal();
    } catch (err) {
        authError.textContent = AUTH_ERRORS[err.code] ?? 'Terjadi kesalahan: ' + err.code;
    }
}

async function googleLogin() {
    try {
        const cred = await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
        await saveUserProfile(cred.user);
        closeAuthModal();
    } catch (err) {
        authError.textContent = AUTH_ERRORS[err.code] ?? 'Terjadi kesalahan: ' + err.code;
    }
}

authSubmit.addEventListener('click', submitAuth);
authPassword.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitAuth(); });
document.getElementById('authGoogle').addEventListener('click', googleLogin);
document.getElementById('authCancel').addEventListener('click', closeAuthModal);
authModal.addEventListener('click', (e) => { if (e.target === authModal) closeAuthModal(); });
authSwitch.addEventListener('click', (e) => {
    e.preventDefault();
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
});
signupBtn.addEventListener('click', () => openAuthModal('signup'));

// Tombol Log in berubah jadi nama user + logout saat sudah masuk
auth.onAuthStateChanged((user) => {
    window.currentUser = user;
    if (user) {
        const name = user.displayName || user.email.split('@')[0];
        loginBtn.textContent = name.length > 10 ? name.slice(0, 10) + '…' : name;
        loginBtn.title = 'Klik untuk keluar';
        loginBtn.onclick = () => { if (confirm('Keluar dari akun?')) auth.signOut(); };
        signupBtn.style.display = 'none';
    } else {
        loginBtn.textContent = 'Log in';
        loginBtn.title = '';
        loginBtn.onclick = () => openAuthModal('login');
        signupBtn.style.display = '';
    }
});