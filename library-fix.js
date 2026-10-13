// ===== library-fix.js : Your Library fullscreen kembali normal saat pengguna mencari =====
(() => {
    const main = document.querySelector('.main');
    const btn = document.getElementById('libraryExpandBtn');
    const input = document.querySelector('.input-box');
    if (!main || !input) return;

    function leaveLibraryFull() {
        if (!main.classList.contains('library-expanded')) return;
        if (btn) btn.click();                         // pakai tombol aslinya, jadi ikonnya ikut kembali
        if (main.classList.contains('library-expanded')) {   // cadangan kalau tombol tidak merespons
            main.classList.remove('library-expanded');
            const icon = btn && btn.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-up-right-and-down-left-from-center';
        }
    }

    // dipasang di level window (fase capture) supaya jalan lebih dulu dari search.js
    window.addEventListener('input', (e) => {
        if (e.target === input && input.value.trim()) leaveLibraryFull();
    }, true);

    window.addEventListener('keydown', (e) => {
        if (e.target === input && e.key === 'Enter' && input.value.trim()) leaveLibraryFull();
    }, true);
})();