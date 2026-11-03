// resume-play.js — setelah refresh, Now Playing tetap ada (lagu, posisi, antrean) dalam keadaan pause
(function () {
    const KEY = 'spotiware_resume', MAX = 400;
    let uid = 'guest', ready = false, last = 0, pending = null;
    const ids = l => (l || []).map(s => s && s.id).filter(v => v !== undefined);
    const byId = id => songs.find(s => s.id === id);

    function save(force) {
        if (!ready || (!force && Date.now() - last < 3000)) return;
        try {
            if (!playerBar.classList.contains('show')) return;
            const cur = getCurrentSong();
            if (!cur) return;
            last = Date.now();
            const from = Math.max(0, currentIndex - 50);
            localStorage.setItem(KEY, JSON.stringify({
                uid, id: cur.id, t: audio.currentTime || 0,
                order: ids(order.slice(from, from + MAX)),
                ctx: ids(currentContextList.slice(0, MAX)),
                shuf: !!songOnShuffle, rep: !!songOnRepeat
            }));
        } catch (e) { }
    }

    function restore(rec) {
        const song = byId(rec.id);
        if (!song) return false;
        let ord = (rec.order || []).map(byId).filter(Boolean);
        let i = ord.findIndex(s => s.id === rec.id);
        if (i < 0) { ord = [song, ...ord]; i = 0; }
        order = ord;
        currentIndex = i;
        const ctx = (rec.ctx || []).map(byId).filter(Boolean);
        currentContextList = ctx.length ? ctx : [...ord];
        songOnShuffle = !!rec.shuf;
        songOnRepeat = !!rec.rep;
        [[shuffle, songOnShuffle], [miniShuffle, songOnShuffle], [repeat, songOnRepeat], [miniRepeat, songOnRepeat]]
            .forEach(([el, on]) => el && el.classList.toggle('active', on));

        audio.preload = 'none';                 // belum ada permintaan ke server sampai tombol play ditekan
        audio.src = song.songPath;
        pending = { id: song.id, t: rec.t || 0 };
        playerBar.classList.add('show');
        showNowPlayingPanel();
        updateNowBar();
        play.classList.remove('fa-circle-pause');
        play.classList.add('fa-circle-play');
        makeAllPlay();

        const t = rec.t || 0, dur = song.dur || 0;
        if (currentTimeEl) currentTimeEl.innerText = formatTime(t);
        if (npCurrentTime) npCurrentTime.innerText = formatTime(t);
        if (dur) {
            const p = Math.min(100, t / dur * 100);
            progressBar.value = p;
            progressBar.style.background = `linear-gradient(to right, #ebeceb ${p}%, #333 ${p}%)`;
            if (npProgressBar) { npProgressBar.value = p; npProgressBar.style.background = `linear-gradient(to right, var(--fg) ${p}%, #555 ${p}%)`; }
            if (durationEl) durationEl.innerText = formatTime(dur);
            if (npDuration) npDuration.innerText = formatRemainingTime(t, dur);
        }
        return true;
    }

    // saat play ditekan pertama kali: lompat ke posisi tersimpan
    audio.addEventListener('loadedmetadata', () => {
        if (!pending) return;
        let cur = null;
        try { cur = getCurrentSong(); } catch (e) { }
        if (cur && cur.id === pending.id && pending.t > 1 && isFinite(audio.duration) && pending.t < audio.duration - 2) {
            try { audio.currentTime = pending.t; } catch (e) { }
        }
        pending = null;
    });
    audio.addEventListener('play', () => { audio.preload = 'auto'; });

    function tryRestore(rec, n) {
        if (!byId(rec.id)) {                     // lagu YouTube: tunggu cache lagu dimuat yt-music.js
            if (n < 20) return setTimeout(() => tryRestore(rec, n + 1), 400);
            ready = true;
            return;
        }
        if (!playerBar.classList.contains('show')) restore(rec);
        ready = true;
    }

    function init() {
        if (typeof playerBar === 'undefined' || typeof getCurrentSong !== 'function' ||
            typeof showNowPlayingPanel !== 'function' || !window.firebase) return setTimeout(init, 300);
        let first = true;
        firebase.auth().onAuthStateChanged(u => {
            uid = u ? u.uid : 'guest';
            if (!first) return;                  // ganti akun di tengah sesi: tidak memulihkan apa pun
            first = false;
            setTimeout(() => {
                let rec = null;
                try { rec = JSON.parse(localStorage.getItem(KEY)); } catch (e) { }
                if (rec && rec.uid === uid && rec.id !== undefined && !location.hash.startsWith('#share=')) tryRestore(rec, 0);
                else ready = true;
            }, 900);
        });
        audio.addEventListener('timeupdate', () => save(false));
        ['pause', 'play', 'ended'].forEach(ev => audio.addEventListener(ev, () => save(true)));
        window.addEventListener('pagehide', () => save(true));
        document.addEventListener('visibilitychange', () => { if (document.hidden) save(true); });
    }
    init();
})();