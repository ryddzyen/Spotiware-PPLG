// ===== Lirik tersinkron (sumber: LRCLIB) =====
(() => {
    if (typeof audio === 'undefined' || typeof getCurrentSong !== 'function') {
        console.warn('lyrics.js: script.js belum siap');
        return;
    }

    const API = 'https://lrclib.net/api';
    const FIX_KEY = 'spotiware_lyrics_fix';   // pilihan manual pengguna: { idLagu: {id: idLRCLIB} | {off: true} }
    const cache = new Map();                   // lirik disimpan di memori saja (hilang saat refresh)
    let open = false, loadedId = null, reqId = 0;
    let lines = [], lineEls = [], activeIdx = -1;
    let rafId = null, userScrollUntil = 0;

    // ---------- Lirik bawaan untuk semua pengguna (Firestore: hanya ID LRCLIB, bukan teks lirik) ----------
    const SHARED = 'lyric_defaults';
    const sdb = (window.firebase && firebase.firestore) ? firebase.firestore() : null;
    const sharedCache = new Map();     // idLagu -> {id} | {off:true} | null
    let isAdmin = false, shownEntry = null;
    const toast = (m) => { try { showToast(m); } catch (_) {} };
    const mobileView = () => typeof isMobileView === 'function' && isMobileView();

    // ---------- CSS ----------
    const style = document.createElement('style');
    style.textContent = `
    #lyricsPanel{position:fixed;z-index:3200;display:none;flex-direction:column;overflow:hidden;color:#fff;background:#121212;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.6);}
    #lyricsPanel.show{display:flex;}
    @media (min-width:769px) and (hover:hover){
        #lyricsPanel{top:4.5rem;bottom:5.7rem;right:.5rem;width:min(30rem,38vw);min-width:18rem;}
    }
    @media (max-width:768px),(hover:none) and (pointer:coarse){
        #lyricsPanel{inset:0;border-radius:0;padding-top:env(safe-area-inset-top,0px);}
    }
    #lyricsPanel.in-fs{top:0 !important;bottom:0 !important;left:0 !important;right:0 !important;width:auto !important;border-radius:0;}
    #lyricsPanel .lyr-bg{position:absolute;inset:0;background-size:cover;background-position:center;filter:blur(40px) brightness(.35) saturate(1.3);transform:scale(1.4);z-index:0;}
    #lyricsPanel > *:not(.lyr-bg){position:relative;z-index:1;}
    .lyr-head{display:flex;align-items:center;gap:.8rem;padding:1rem 1.2rem .4rem;}
    .lyr-meta{flex:1;min-width:0;}
    .lyr-title{font-size:1.05rem;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .lyr-artist{font-size:.82rem;color:#c9c9ce;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .lyr-close{background:none;border:none;color:#fff;font-size:1.2rem;padding:.5rem;cursor:pointer;}
    .lyr-close:hover{color:var(--yellow,#FFD700);}
    .lyr-body{flex:1;overflow-y:auto;padding:30% 1.4rem;scrollbar-width:none;}
    .lyr-body.picking{padding-top:1rem;padding-bottom:2rem;}
    .lyr-body::-webkit-scrollbar{display:none;}
    .lyr-line{font-size:1.5rem;font-weight:800;line-height:1.3;margin:1.1rem 0;opacity:.35;cursor:pointer;transition:opacity .25s,transform .25s;transform-origin:left center;word-break:break-word;}
    .lyr-line:hover{opacity:.7;}
    .lyr-line.active{opacity:1;transform:scale(1.04);}
    .lyr-line.gap{font-size:1.1rem;opacity:.25;}
    .lyr-line{transition:opacity .25s,transform .25s,color .25s;}
    .lyr-line.lrc.active{color:var(--yellow,#FFD700);opacity:1;transform:scale(1.02);}
    .lyr-w{display:inline;}
    .lyr-inst{display:flex;justify-content:center;align-items:center;width:100%;height:3rem;margin:1.1rem 0;overflow:hidden;
        transition:height .5s ease,margin .5s ease,opacity .4s ease;}
    .lyr-eq{display:flex;align-items:center;justify-content:center;gap:6px;height:100%;}
    .lyr-eq i{display:block;width:5px;height:calc(var(--h) * 100%);border-radius:3px;background:var(--yellow,#FFD700);
        transform:scaleY(.07);opacity:.4;transition:opacity .4s ease;}
    .lyr-inst.on .lyr-eq i{opacity:1;animation:lyrEq .9s ease-in-out infinite alternate;animation-delay:calc(var(--d) * -1);}
    .lyr-inst.done{height:0;margin:0;opacity:0;}
    .lyr-noanim .lyr-inst{transition:none!important;}
    @keyframes lyrEq{from{transform:scaleY(.12)}to{transform:scaleY(1)}}
    .lyr-ch{--f:0;background-image:linear-gradient(90deg,var(--yellow,#FFD700) calc(var(--f)*140% - 40%),rgba(255,255,255,.4) calc(var(--f)*140%));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;}
    .lyr-line.live{opacity:1;}
    .lyr-plain{white-space:pre-wrap;font-size:1.05rem;line-height:1.8;opacity:.92;padding-bottom:3rem;}
    .lyr-note{font-size:.78rem;color:#c9c9ce;margin-bottom:1rem;line-height:1.5;}
    .lyr-status{text-align:center;color:#c9c9ce;padding:3rem 1rem;line-height:1.6;}
    .lyr-retry{margin-top:.6rem;padding:.55rem 1.2rem;border:1px solid #727272;border-radius:999px;background:none;color:#fff;font-family:inherit;font-weight:700;font-size:.8rem;cursor:pointer;}
    .lyr-retry:hover{border-color:#fff;}
    .lyr-foot{text-align:center;font-size:.7rem;color:#9ca3af;padding:.5rem;}
    .lyr-wrong{background:none;border:none;color:#c9c9ce;text-decoration:underline;cursor:pointer;font-family:inherit;font-size:.7rem;}
    .lyr-wrong:hover{color:#fff;}
    .lyr-search{display:flex;gap:.5rem;margin:.6rem 0 1rem;}
    .lyr-search input{flex:1;min-width:0;padding:.6rem .8rem;border-radius:6px;border:1px solid #727272;background:rgba(0,0,0,.4);color:#fff;font-family:inherit;font-size:.9rem;outline:none;}
    .lyr-search input:focus{border-color:var(--yellow,#FFD700);}
    .lyr-search .lyr-retry{margin-top:0;}
    .lyr-res{display:block;width:100%;text-align:left;padding:.7rem .8rem;margin-bottom:.4rem;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);color:#fff;font-family:inherit;cursor:pointer;}
    .lyr-res:hover{background:rgba(255,255,255,.14);}
    .lyr-res b{display:block;font-size:.9rem;}
    .lyr-res span{font-size:.76rem;color:#c9c9ce;}
    .lyr-pick-actions{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1rem;}
    @media (max-width:768px),(hover:none) and (pointer:coarse){ .lyr-line{font-size:1.35rem;} }
    .np-lyrics-btn{display:none;align-items:center;justify-content:center;gap:.5rem;width:100%;background:rgba(255,255,255,.08);color:#d1d5db;border:none;padding:.6rem;border-radius:20rem;font-size:.8rem;cursor:pointer;margin-top:.3rem;}
    .np-lyrics-btn:hover{background:rgba(255,215,0,.15);color:var(--yellow,#FFD700);}
    .now-playing-panel.mobile-open .np-lyrics-btn,
    .now-playing-panel:fullscreen .np-lyrics-btn{display:flex;}
    `;
    document.head.appendChild(style);

    // ---------- Panel ----------
    const box = document.createElement('div');
    box.id = 'lyricsPanel';
    box.innerHTML = `
        <div class="lyr-bg"></div>
        <div class="lyr-head">
            <div class="lyr-meta"><div class="lyr-title"></div><div class="lyr-artist"></div></div>
            <button type="button" class="lyr-close" title="Tutup"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="lyr-body"></div>
        <div class="lyr-foot"><span class="lyr-src"></span><button type="button" class="lyr-wrong">Lirik tidak sesuai?</button><span class="lyr-admin" style="display:none"> · <button type="button" class="lyr-wrong lyr-setdef">Jadikan bawaan semua pengguna</button> · <button type="button" class="lyr-wrong lyr-deldef">Hapus bawaan</button></span></div>`;
    document.body.appendChild(box);

    const bgEl = box.querySelector('.lyr-bg');
    const titleEl = box.querySelector('.lyr-title');
    const artistEl = box.querySelector('.lyr-artist');
    const bodyEl = box.querySelector('.lyr-body');
    const srcEl = box.querySelector('.lyr-src');
    const adminEl = box.querySelector('.lyr-admin');

    // ---------- Tombol pembuka ----------
    const lyricsBtn = document.createElement('button');
    lyricsBtn.type = 'button';
    lyricsBtn.id = 'lyricsBtn';
    lyricsBtn.className = 'player-right-btn';
    lyricsBtn.title = 'Lyrics';
    lyricsBtn.innerHTML = '<i class="fa-solid fa-microphone-lines"></i>';
    const rightControls = document.querySelector('.player-right-controls');
    if (rightControls) rightControls.insertBefore(lyricsBtn, rightControls.firstChild);

    const npBtn = document.createElement('button');
    npBtn.type = 'button';
    npBtn.className = 'np-lyrics-btn';
    npBtn.innerHTML = '<i class="fa-solid fa-microphone-lines"></i> Lyrics';
    const phone = document.querySelector('.phone-frame');
    if (phone) phone.appendChild(npBtn);

    // ---------- Pilihan manual (disimpan di perangkat) ----------
    const readFix = () => { try { return JSON.parse(localStorage.getItem(FIX_KEY)) || {}; } catch (_) { return {}; } };
    const writeFix = (o) => { try { localStorage.setItem(FIX_KEY, JSON.stringify(o)); } catch (_) {} };

    // ---------- Lirik bawaan (admin menulis, semua orang membaca) ----------
    async function getShared(song) {
        if (!sdb) return null;
        if (sharedCache.has(song.id)) return sharedCache.get(song.id);
        let v = null;
        try {
            const s = await sdb.collection(SHARED).doc(String(song.id)).get();
            if (s.exists) {
                const d = s.data();
                v = d.off ? { off: true } : (d.id ? { id: d.id } : null);
            }
        } catch (_) { return null; }          // gagal baca -> tidak disimpan di cache
        sharedCache.set(song.id, v);
        return v;
    }

    async function setDefault(song, value) {   // value: {id} | {off:true} | null (hapus)
        if (!sdb) throw new Error('Firestore belum siap');
        const ref = sdb.collection(SHARED).doc(String(song.id));
        if (!value) await ref.delete();
        else await ref.set({
            id: value.off ? null : value.id,
            off: !!value.off,
            title: song.songName,
            artist: song.songDes,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        sharedCache.delete(song.id);
    }

    function refreshFoot() {
        const e = shownEntry;
        srcEl.textContent = !e ? ''
            : e.source === 'bl' ? 'Lirik per kata · Betterlyric'
            : e.source === 'mine' ? 'Pilihanmu · LRCLIB'
            : e.source === 'default' ? 'Lirik bawaan · LRCLIB'
            : e.source === 'auto' ? 'LRCLIB · teks biasa'
            : '';
        adminEl.style.display = isAdmin ? 'inline' : 'none';
        adminEl.querySelector('.lyr-setdef').style.display = (e && (e.off || e.recId)) ? '' : 'none';
    }

    adminEl.querySelector('.lyr-setdef').addEventListener('click', async () => {
        const song = songs.find((s) => s.id === loadedId);
        const e = shownEntry;
        if (!isAdmin || !song || !e) return;
        const value = e.off ? { off: true } : (e.recId ? { id: e.recId } : null);
        if (!value) { toast('Pilih lirik dulu'); return; }
        try { await setDefault(song, value); toast('Lirik ini jadi bawaan untuk semua pengguna'); }
        catch (err) { console.warn(err); toast('Gagal menyimpan (cek Firestore Rules dan akun admin)'); }
    });
    adminEl.querySelector('.lyr-deldef').addEventListener('click', async () => {
        const song = songs.find((s) => s.id === loadedId);
        if (!isAdmin || !song) return;
        try { await setDefault(song, null); toast('Lirik bawaan dihapus'); }
        catch (err) { console.warn(err); toast('Gagal menghapus (cek Firestore Rules dan akun admin)'); }
    });

    if (window.firebase) {
        firebase.auth().onAuthStateChanged(async (u) => {
            isAdmin = false;
            refreshFoot();
            if (!u || !sdb) return;
            try { isAdmin = (await sdb.collection('admins').doc(u.uid).get()).exists; } catch (_) {}
            refreshFoot();
        });
    }

    // ---------- Pencocokan judul & artis ----------
    function cleanTitle(t) {
        return ((t || '')
            .replace(/\s*[\(\[][^\)\]]*[\)\]]/g, '')   // (feat. ...), [...]
            .replace(/\s+-\s+.*$/, '')                 // " - Remix", " - From ..."
            .replace(/\s{2,}/g, ' ')
            .trim()) || (t || '');
    }
    const norm = (s) => (s || '').toString().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/&/g, ' and ')
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .trim();
    const allArtists = (s) => (s.songDes || '').split(',').map(a => a.trim()).filter(Boolean);
    const firstArtist = (s) => allArtists(s)[0] || '';

    // judul harus sama persis setelah dibersihkan (sengaja ketat supaya tidak salah lagu)
    function titleOK(a, b) {
        const x = norm(cleanTitle(a)), y = norm(cleanTitle(b));
        return !!x && x === y;
    }
    // nama artis harus cocok per kata (salah satu artis di songDes)
    function artistOK(resArtist, song) {
        const r = ' ' + norm(resArtist) + ' ';
        if (r.trim() === '') return false;
        return allArtists(song).some((a) => {
            const x = ' ' + norm(a) + ' ';
            return x.trim() !== '' && (r.includes(x) || x.includes(r));
        });
    }

    // ---------- Jaringan ----------
    async function getJSON(url) {
        const ctl = new AbortController();
        const timer = setTimeout(() => ctl.abort(), 9000);
        try {
            const r = await fetch(url, { signal: ctl.signal });
            if (r.status === 404) return null;
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return await r.json();
        } finally { clearTimeout(timer); }
    }

    function waitDuration() {
        return new Promise((resolve) => {
            if (isFinite(audio.duration) && audio.duration > 0) return resolve(audio.duration);
            const done = () => { clearTimeout(t); audio.removeEventListener('loadedmetadata', done); resolve(isFinite(audio.duration) ? audio.duration : null); };
            const t = setTimeout(done, 1500);
            audio.addEventListener('loadedmetadata', done, { once: true });
        });
    }

    // ---------- Cari lirik otomatis ----------
    const hasText = (r) => r && (r.syncedLyrics || r.plainLyrics || r.instrumental);

    function pickBest(list, song, dur) {
        if (!Array.isArray(list)) return null;
        const cands = list.filter(r => hasText(r) && titleOK(r.trackName, song.songName));
        const durOK = (r) => !dur || !r.duration || Math.abs(r.duration - dur) <= 4;
        const byArtist = cands.filter(r => artistOK(r.artistName, song) && durOK(r));
        // cadangan: artis ditulis beda, tapi judul sama dan durasi hampir persis sama
        const pool = byArtist.length ? byArtist
            : cands.filter(r => dur && r.duration && Math.abs(r.duration - dur) <= 1.5);
        if (!pool.length) return null;
        const score = (r) => (r.syncedLyrics ? 0 : 1000) + (dur && r.duration ? Math.abs(r.duration - dur) : 50);
        return pool.sort((a, b) => score(a) - score(b))[0];
    }

    // ---------- judul YouTube yang kotor & artis "Unknown" ----------
    const NOISE_BR = /\s*[\(\[\{][^\)\]\}]*(official|lyric|lyrics|video|audio|visuali[sz]er|m\/v|\bmv\b|\bhd\b|\bhq\b|4k|remaster(ed)?|live|ft\.?|feat\.?)[^\)\]\}]*[\)\]\}]/gi;
    function deepClean(t) {
        return String(t || '')
            .replace(NOISE_BR, ' ')
            .replace(/\b(official\s+(music\s+)?(video|audio|lyric\s*video)|lyric\s*video|lyrics?|visuali[sz]er|music\s+video|audio\s+only|full\s+(video|song)|hd|hq|4k|mv)\b/gi, ' ')
            .replace(/\s+(feat\.?|ft\.?|featuring)\s+.*$/i, ' ')
            .replace(/\s*[|｜].*$/, ' ')
            .replace(/\s{2,}/g, ' ').trim();
    }
    const isUnknown = a => /^(unknown|unknown artist|various artists?|-)?$/i.test(String(a || '').trim());

    function resolveMeta(song) {
        let artist = firstArtist(song), title = String(song.songName || '');
        if (isUnknown(artist)) {
            const m = /^(.{2,60}?)\s+[-–—]\s+(.+)$/.exec(title);      // "Artis - Judul"
            artist = m ? m[1].trim() : '';
            if (m) title = m[2];
        }
        return { title: deepClean(cleanTitle(title)) || cleanTitle(title), artist };
    }

    // artis tidak diketahui: cocokkan lewat judul + durasi saja (durasi wajib ada)
    function pickLoose(list, title, dur) {
        if (!Array.isArray(list) || !dur) return null;
        const c = list.filter(r => hasText(r) && titleOK(r.trackName, title) && r.duration && Math.abs(r.duration - dur) <= 2.5);
        if (!c.length) return null;
        const sc = r => (r.syncedLyrics ? 0 : 1000) + Math.abs(r.duration - dur);
        return c.sort((a, b) => sc(a) - sc(b))[0];
    }

    async function findLyrics(song, dur) {
        const meta = resolveMeta(song);
        const qs = (o) => new URLSearchParams(o).toString();
        const d = dur || song.dur || null;

        // artis tidak diketahui sama sekali: pakai judul bersih saja
        if (!meta.artist) {
            const a = pickLoose(await getJSON(`${API}/search?${qs({ track_name: meta.title })}`), meta.title, d);
            if (a) return a;
            return pickLoose(await getJSON(`${API}/search?${qs({ q: meta.title })}`), meta.title, d);
        }

        const probe = { songName: meta.title, songDes: meta.artist };
        const p = { track_name: meta.title, artist_name: meta.artist };
        if (d) p.duration = Math.round(d);
        const exact = await getJSON(`${API}/get?${qs(p)}`).catch(() => null);
        if (hasText(exact) && titleOK(exact.trackName, meta.title) && artistOK(exact.artistName, probe)) return exact;

        const best = pickBest(await getJSON(`${API}/search?${qs({ track_name: meta.title, artist_name: meta.artist })}`), probe, d);
        if (best) return best;
        return pickBest(await getJSON(`${API}/search?${qs({ track_name: meta.title })}`), probe, d);
    }

    function parseLRC(text) {
        const out = [];
        text.split(/\r?\n/).forEach((line) => {
            const re = /\[(\d{1,3}):(\d{2}(?:[.:]\d{1,3})?)\]/g;
            const times = [];
            let m, last = 0;
            while ((m = re.exec(line))) {
                times.push(parseInt(m[1], 10) * 60 + parseFloat(m[2].replace(':', '.')));
                last = re.lastIndex;
            }
            if (!times.length) return;
            const txt = line.slice(last).trim();
            times.forEach(t => out.push({ t, text: txt }));
        });
        return out.sort((a, b) => a.t - b.t);
    }

        const LRCLIB_STATIC = false;  // false = LRCLIB tersinkron tampil bergerak per baris
    const LRC_FILL = false;       // false = warna per baris. true = warna mengalir per huruf (mode lama)
    function normalize(r) {
        if (!r) return { none: true };
        if (r.instrumental) return { instrumental: true };
        let synced = r.syncedLyrics ? parseLRC(r.syncedLyrics) : [];
        let plain = r.plainLyrics || '';
        if (LRCLIB_STATIC) {
            if (!plain.trim() && r.syncedLyrics) {      // tidak ada teks polos: buang penanda waktunya
                plain = r.syncedLyrics.replace(/\[[^\]]*\]/g, '').split(/\r?\n/).map(s => s.trim()).join('\n').trim();
            }
            synced = [];
        }
        if (!synced.length && !plain.trim()) return { none: true };
        return { synced, plain };
    }

    // ---------- Tampilan ----------
    function setHeader(s) {
        titleEl.textContent = s.songName;
        artistEl.textContent = s.songDes;
        bgEl.style.backgroundImage = `url("${encodeURI(s.songImage)}")`;
    }

    function resetBody() {
        bodyEl.innerHTML = '';
        bodyEl.classList.remove('picking');
        lines = []; lineEls = []; activeIdx = -1;
        fillEls = []; fillIdx = -1; bl = null;
    }

    function showStatus(msg, retry) {
        resetBody();
        const d = document.createElement('div');
        d.className = 'lyr-status';
        d.textContent = msg;
        if (retry) {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'lyr-retry';
            b.textContent = 'Coba lagi';
            b.addEventListener('click', () => { loadedId = null; syncSong(); });
            d.appendChild(document.createElement('br'));
            d.appendChild(b);
        }
        bodyEl.appendChild(d);
    }

    function show(entry) {
        shownEntry = entry; refreshFoot();
        resetBody();
        bodyEl.scrollTop = 0;

        if (entry.off) return showStatus('Lirik disembunyikan untuk lagu ini. Pakai "Lirik tidak sesuai?" di bawah untuk mengubahnya.');
        if (entry.none) return showStatus('Lirik yang cocok tidak ditemukan untuk lagu ini. Kamu bisa mencarinya sendiri lewat "Lirik tidak sesuai?" di bawah.');
        if (entry.instrumental) return showStatus('♪ Lagu instrumental');

        if (entry.bl && entry.bl.length) return showBL(entry);
        if (entry.synced && entry.synced.length) {
            lines = entry.synced;
            lines.forEach((l) => {
                const el = document.createElement('div');
                                el.className = 'lyr-line lrc' + (l.text ? '' : ' gap');
                el.textContent = l.text || '♪';
                el.addEventListener('click', () => { audio.currentTime = l.t; });
                bodyEl.appendChild(el);
                lineEls.push(el);
            });
            setActive(currentIndex(audio.currentTime), true);
        } else {
            const note = document.createElement('div');
            note.className = 'lyr-note';
            note.textContent = 'Lirik untuk lagu ini belum tersinkron.';
            const pre = document.createElement('div');
            pre.className = 'lyr-plain';
            pre.textContent = entry.plain;
            if (LRCLIB_STATIC) bodyEl.append(pre); else bodyEl.append(note, pre);
        }
    }

    function currentIndex(t) {
        let lo = 0, hi = lines.length - 1, ans = -1;
        while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            if (lines[mid].t <= t + 0.15) { ans = mid; lo = mid + 1; } else hi = mid - 1;
        }
        return ans;
    }

    function centerActive(jump) {
        const el = lineEls[activeIdx];
        if (!el || !bodyEl.clientHeight) return;
        const top = bodyEl.scrollTop
            + (el.getBoundingClientRect().top - bodyEl.getBoundingClientRect().top)
            - bodyEl.clientHeight / 2 + el.offsetHeight / 2;
        bodyEl.scrollTo({ top: Math.max(0, top), behavior: jump ? 'auto' : 'smooth' });
    }

    // ---------- Isi warna mengalir per huruf (hanya baris aktif) ----------
    const CHAR_SEC = 0.1;     // perkiraan detik per huruf (kecilkan = lebih cepat, besarkan = lebih lambat)
    const FILL_MODE = 'speech';   // 'speech' = menyesuaikan jumlah huruf (lebih natural). 'gap' = persis selama jarak ke baris berikutnya, maks. 8 detik (sesuai rumus 14 - 10 = 4)
    const WORD_MODE = false;      // true = warna mengalir per kata, bukan per huruf (lebih ringan di HP lama)
    let fillEls = [], fillIdx = -1, fillDone = 0, fillDur = 1;

    function clearFill() {
        if (fillIdx >= 0 && lineEls[fillIdx] && lines[fillIdx]) lineEls[fillIdx].textContent = lines[fillIdx].text || '♪';
        fillIdx = -1;
        fillEls = [];
    }

    function prepFill(i) {
        clearFill();
        const l = lines[i], el = lineEls[i];
        if (!l || !el || !l.text) return;
        // aksara yang hurufnya bersambung (Arab, Thai, Devanagari, dll.) dipecah per kata, bukan per huruf, supaya bentuknya tidak rusak
        const complex = /[\u0590-\u08FF\u0900-\u0DFF\u0E00-\u0EFF]/.test(l.text);
        el.textContent = '';
        const frag = document.createDocumentFragment();
        l.text.split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
            const wrap = document.createElement('span');
            wrap.className = 'lyr-w';
            (complex || WORD_MODE ? [w] : Array.from(w)).forEach((u) => {
                const s = document.createElement('span');
                s.className = 'lyr-ch';
                s.textContent = u;
                wrap.appendChild(s);
                fillEls.push(s);
            });
            frag.appendChild(wrap);
        });
        el.appendChild(frag);
        fillIdx = i;
        fillDone = 0;
        const next = lines[i + 1];
        const gap = next ? next.t - l.t : 6;
        const cap = FILL_MODE === 'gap' ? Math.min(gap, 8) : gap * 0.85;
        fillDur = FILL_MODE === 'gap'
            ? Math.max(0.5, cap)
            : Math.max(0.5, Math.min(cap, Math.max(0.8, fillEls.length * CHAR_SEC)));
    }

    function updateFill(t) {
        if (fillIdx < 0 || !fillEls.length) return;
        const l = lines[fillIdx];
        if (!l) return;
        const n = fillEls.length;
        const x = Math.max(0, Math.min(1, (t - l.t) / fillDur)) * n;
        const k = Math.floor(x);
        if (k > fillDone) {                                   // maju: huruf yang terlewati penuh
            for (let j = fillDone; j < k && j < n; j++) fillEls[j].style.setProperty('--f', 1);
        } else if (k < fillDone) {                            // mundur (geser lagu): kosongkan lagi
            for (let j = k + 1; j <= Math.min(fillDone, n - 1); j++) fillEls[j].style.setProperty('--f', 0);
        }
        fillDone = k;
        if (k < n) fillEls[k].style.setProperty('--f', (x - k).toFixed(3));   // huruf yang sedang terisi
    }

    // ---------- Betterlyric: lirik per kata (format TTML) ----------
    const BL_API = 'https://lyrics-api.boidu.dev/getLyrics';
    const BL_OFFSET = 0;     // detik. Lirik selalu telat -> isi positif (mis. 0.3). Selalu kecepatan -> negatif
    const BL_GAP = 6;        // jeda minimal (detik) yang dianggap bagian instrumental
    let bl = null;
    const ttTime = s => String(s || 0).split(':').reduce((a, v) => a * 60 + (parseFloat(v) || 0), 0);

    function parseTTML(xml, dur) {
        let doc;
        try { doc = new DOMParser().parseFromString(xml, 'application/xml'); } catch (e) { return null; }
        if (!doc || doc.querySelector('parsererror')) return null;
        const body = doc.querySelector('body');
        const bd = body && body.getAttribute('dur') ? ttTime(body.getAttribute('dur')) : 0;
        if (dur && bd && Math.abs(bd - dur) > 8) return null;          // durasi jauh beda: kemungkinan versi lagu lain
        const lns = [];
        doc.querySelectorAll('p').forEach(p => {
            const words = [];
            const walk = node => node.childNodes.forEach(n => {
                if (n.nodeType === 3) { if (/\s/.test(n.nodeValue) && words.length) words[words.length - 1].sp = true; return; }
                if (n.nodeType !== 1 || n.localName !== 'span') return;
                if (n.getAttribute('begin')) {
                    const w = String(n.textContent).trim();
                    if (w) words.push({ t: ttTime(n.getAttribute('begin')), e: ttTime(n.getAttribute('end') || n.getAttribute('begin')), w, sp: false });
                } else walk(n);                                           // pembungkus vokal latar (x-bg)
            });
            walk(p);
            const pb = ttTime(p.getAttribute('begin')), pe = ttTime(p.getAttribute('end'));
            if (!words.length) {                                          // hanya timing per baris: bagi kata menurut panjangnya
                const tx = String(p.textContent).replace(/\s+/g, ' ').trim();
                if (tx) {
                    const end = pe || pb + 3, parts = tx.split(' '), tot = parts.reduce((s, x) => s + x.length, 0) || 1;
                    let acc = pb;
                    parts.forEach((x, k) => {
                        const d = (end - pb) * (x.length / tot);
                        words.push({ t: acc, e: acc + d, w: x, sp: k < parts.length - 1 });
                        acc += d;
                    });
                }
            }
            if (!words.length) return;
            lns.push({
                type: 'line', t: words[0].t, e: Math.max(pe, words[words.length - 1].e), words,
                text: words.map(w => w.w + (w.sp ? ' ' : '')).join('').trim()
            });
        });
        if (!lns.length) return null;
        lns.sort((a, b) => a.t - b.t);
        const items = [];
        let prevEnd = 0;
        lns.forEach((l, i) => {
            if ((i === 0 ? l.t : l.t - prevEnd) >= BL_GAP) items.push({ type: 'gap', t: i === 0 ? 0 : prevEnd + 0.4, e: l.t });
            items.push(l);
            prevEnd = Math.max(prevEnd, l.e);
        });
        const total = dur || bd;
        if (total && total - prevEnd >= BL_GAP + 2) items.push({ type: 'gap', t: prevEnd + 0.4, e: total });
        return items;
    }

    async function fetchBL(song, dur) {
        const meta = resolveMeta(song);
        if (!meta.title || !meta.artist) { console.info('[lirik] Betterlyric dilewati: judul atau artis kosong', meta); return null; }

        const ask = async (withD) => {
            const qs = new URLSearchParams({ s: meta.title, a: meta.artist });
            if (withD && dur) qs.set('d', Math.round(dur));
            try { return { j: await getJSON(`${BL_API}?${qs}`), via: 'langsung' }; }
            catch (e) {                                              // biasanya diblokir CORS -> lewat server sendiri
                console.info('[lirik] Betterlyric langsung gagal (' + e.message + '), coba lewat server');
                const base = window.YTMusic && YTMusic.SERVER;
                if (!base) { console.info('[lirik] YTMusic.SERVER tidak ada'); return { j: null }; }
                try { return { j: await getJSON(`${base}/lyrics?${qs}`), via: 'server' }; }
                catch (e2) { console.info('[lirik] lewat server juga gagal: ' + e2.message + ' (server sudah di-restart?)'); return { j: null }; }
            }
        };

        let r = await ask(true);
        if ((!r.j || !r.j.ttml) && dur) r = await ask(false);        // coba tanpa durasi kalau durasinya membuat tidak cocok
        if (!r.j || !r.j.ttml) { console.info('[lirik] Betterlyric: tidak ada lirik untuk', meta.title, '-', meta.artist); return null; }
        const items = parseTTML(r.j.ttml, dur);
        if (!items) { console.info('[lirik] Betterlyric: TTML tidak terbaca atau durasi tidak cocok'); return null; }
        console.info('[lirik] Betterlyric OK (' + r.via + '),', items.length, 'bagian');
        return { bl: items };
    }

    // hanya baris yang sedang tampil dipecah per huruf (ringan di HP)
    function blBuild(it) {
        it.el.textContent = '';
        it.chars = [];
        let wrap = null;
        it.words.forEach(w => {
            if (!wrap) { wrap = document.createElement('span'); wrap.className = 'lyr-w'; it.el.appendChild(wrap); }
            const complex = /[\u0590-\u08FF\u0900-\u0DFF\u0E00-\u0EFF]/.test(w.w);   // aksara bersambung: per kata
            const arr = [];
            (complex ? [w.w] : Array.from(w.w)).forEach(ch => {
                const s = document.createElement('span');
                s.className = 'lyr-ch';
                s.textContent = ch;
                wrap.appendChild(s);
                arr.push(s);
            });
            it.chars.push(arr);
            if (w.sp) { it.el.appendChild(document.createTextNode(' ')); wrap = null; }
        });
        it.built = true;
    }

    function blDrop(it) {
        if (!it.built) return;
        it.el.textContent = it.text;
        it.el.classList.remove('live');
        it.built = false;
        it.chars = null;
    }

    function blFill(it, T) {
        it.words.forEach((w, wi) => {
            const arr = it.chars[wi], n = arr.length, d = w.e - w.t;
            const p = d < 0.02 ? (T >= w.t ? 1 : 0) : Math.min(1, Math.max(0, (T - w.t) / d));
            const x = p * n;
            for (let k = 0; k < n; k++) {
                const v = Math.min(1, Math.max(0, x - k)).toFixed(2);
                if (arr[k]._v !== v) { arr[k]._v = v; arr[k].style.setProperty('--f', v); }
            }
        });
    }

    const BL_GAPLEAD = 0.5;      // detik: gelombang mulai mengecil sebelum vokal masuk
    let blGaps = [], blRecT = null;

    function gapEl() {
        const d = document.createElement('div');
        d.className = 'lyr-inst';
        const N = 11;
        let h = '';
        for (let k = 0; k < N; k++) {
            h += `<i style="--h:${(0.3 + 0.7 * Math.sin(Math.PI * (k + 0.5) / N)).toFixed(2)};--d:${(k * 0.09).toFixed(2)}s"></i>`;
        }
        d.innerHTML = '<span class="lyr-eq">' + h + '</span>';
        return d;
    }

    function showBL(entry) {
        bl = entry.bl;
        blGaps = bl.filter(it => it.type === 'gap');
        bodyEl.classList.add('lyr-noanim');                    // keadaan awal tidak dianimasikan
        bl.forEach(it => {
            let el;
            if (it.type === 'gap') el = gapEl();
            else {
                el = document.createElement('div');
                el.className = 'lyr-line';
                el.textContent = it.text;
                el.addEventListener('click', () => { audio.currentTime = Math.max(0, it.t); });
            }
            it.el = el;
            it.built = false;
            bodyEl.appendChild(el);
            lineEls.push(el);
        });
        blUpdate(audio.currentTime, true);
        requestAnimationFrame(() => requestAnimationFrame(() => bodyEl.classList.remove('lyr-noanim')));
    }

    // status tiap gelombang dihitung dari posisi lagu: pre (garis) -> on (menari) -> done (hilang). Bisa bolak-balik.
    function blGapStates(T) {
        let changed = false;
        blGaps.forEach(g => {
            const st = T >= g.e - BL_GAPLEAD ? 'done' : (T >= g.t ? 'on' : 'pre');
            if (g.st === st) return;
            g.st = st;
            g.el.classList.remove('pre', 'on', 'done');
            g.el.classList.add(st);
            changed = true;
        });
        return changed;
    }

    function blUpdate(t, jump) {
        if (!bl) return;
        const T = t + BL_OFFSET;
        const gapChanged = blGapStates(T);
        let a = -1;
        for (let i = 0; i < bl.length; i++) { if (bl[i].t <= T + 0.05) a = i; else break; }
        if (a !== activeIdx || jump) {
            const big = jump || Math.abs(a - activeIdx) > 1;
            if (lineEls[activeIdx]) lineEls[activeIdx].classList.remove('active');
            activeIdx = a;
            const cur = bl[a];
            if (cur && cur.type === 'line') cur.el.classList.add('active');
            if (big) bl.forEach((it, i) => { if (it.type === 'line' && (i < a - 3 || i > a + 1)) blDrop(it); });
            if (cur && Date.now() > userScrollUntil) centerActive(big);
        }
        for (let i = Math.max(0, a - 3); i <= Math.min(bl.length - 1, a + 1); i++) {
            const it = bl[i];
            if (it.type !== 'line') continue;
            if (it.t <= T + 0.05 && (i === a || it.e + 0.25 > T)) {
                if (!it.built) blBuild(it);
                it.el.classList.add('live');
                blFill(it, T);
            } else blDrop(it);
        }
        if (gapChanged) {          // gelombang muncul / hilang: pusatkan lagi setelah animasi tingginya selesai
            clearTimeout(blRecT);
            blRecT = setTimeout(() => { if (open && bl && Date.now() > userScrollUntil) centerActive(false); }, 560);
        }
    }

    function setActive(i, jump) {
        if (i === activeIdx && !jump) return;
        if (lineEls[activeIdx]) lineEls[activeIdx].classList.remove('active');
        activeIdx = i;
        const el = lineEls[i];
        if (!el) { clearFill(); return; }
        if (LRC_FILL) prepFill(i); else clearFill();
        el.classList.add('active');
        if (LRC_FILL) updateFill(audio.currentTime);
        if (Date.now() > userScrollUntil) centerActive(jump);
    }

    // cadangan: kalau loop animasi berhenti, lirik tetap mengikuti lagu
    audio.addEventListener('timeupdate', () => {
        if (!open) return;
        if (bl) {
            blUpdate(audio.currentTime);
            if (!rafId && !audio.paused) rafId = requestAnimationFrame(tick);
            return;
        }
        if (!lines.length) return;
        const t = audio.currentTime;
        const i = currentIndex(t);
        if (i !== activeIdx) setActive(i);
        updateFill(t);
        if (!rafId && !audio.paused) rafId = requestAnimationFrame(tick);
    });

    // jangan rebut kendali saat pengguna menggulir sendiri
    ['wheel', 'touchmove'].forEach(ev =>
        bodyEl.addEventListener(ev, () => { userScrollUntil = Date.now() + 4000; }, { passive: true }));

    function tick() {
        rafId = null;
        if (!open) return;
        const t = audio.currentTime;
        if (bl) blUpdate(t);
        else if (lines.length) {
            const i = currentIndex(t);
            if (i !== activeIdx) setActive(i);
            updateFill(t);
        }
        if (!audio.paused) rafId = requestAnimationFrame(tick);
    }

    // ---------- Memuat lirik lagu yang sedang diputar ----------
    const BL_FIRST = true;    // true = Betterlyric dulu, LRCLIB cadangan (kebalikan)

    async function load(song) {
        const my = ++reqId;
        loadedId = song.id;
        setHeader(song);
        if (cache.has(song.id)) return show(cache.get(song.id));

        shownEntry = null;
        refreshFoot();
        showStatus('Mencari lirik…');
        const finish = (entry) => { cache.set(song.id, entry); show(entry); };
        try {
            // urutan: pilihan pribadi -> lirik bawaan admin -> LRCLIB per baris -> Betterlyric -> LRCLIB teks biasa
            let choice = readFix()[song.id] || null;
            let source = choice ? 'mine' : null;
            if (!choice) {
                choice = await getShared(song);
                if (my !== reqId) return;
                if (choice) source = 'default';
            }
            if (choice && choice.off) return finish({ none: true, off: true, source });

            if (choice && choice.id) {
                const rec0 = await getJSON(`${API}/get/${choice.id}`).catch(() => null);
                if (my !== reqId) return;
                if (rec0) { const e0 = normalize(rec0); e0.recId = rec0.id; e0.source = source; return finish(e0); }
            }

            const dur = await waitDuration();
            if (my !== reqId) return;
            const d = dur || song.dur || null;

            if (BL_FIRST) {
                const b = await fetchBL(song, d);
                if (my !== reqId) return;
                if (b) return finish({ ...b, source: 'bl' });
            }

            const rec = await findLyrics(song, dur);
            if (my !== reqId) return;
            const entry = normalize(rec);
            entry.recId = rec ? rec.id : null;
            entry.source = 'auto';
            if ((entry.synced && entry.synced.length) || entry.instrumental) return finish(entry);

            if (!BL_FIRST) {                                   // LRCLIB tidak ada / hanya teks biasa -> Betterlyric
                const b = await fetchBL(song, d);
                if (my !== reqId) return;
                if (b) return finish({ ...b, source: 'bl' });
            }
            finish(entry);                                     // terakhir: teks biasa LRCLIB atau "tidak ditemukan"
        } catch (e) {
            console.warn('lyrics.js:', e);
            if (my !== reqId) return;
            loadedId = null;
            showStatus('Gagal memuat lirik. Cek koneksi internet.', true);
        }
    }

    function syncSong() {
        if (!open) return;
        const playing = typeof playerBar !== 'undefined' && playerBar.classList.contains('show');
        if (!playing) {
            titleEl.textContent = 'Lyrics';
            artistEl.textContent = '';
            showStatus('Putar sebuah lagu untuk melihat liriknya.');
            loadedId = null;
            return;
        }
        const s = getCurrentSong();
        if (s && s.id !== loadedId) load(s);
    }

    audio.addEventListener('loadedmetadata', syncSong);
    audio.addEventListener('play', syncSong);

    // ---------- Koreksi manual: "Lirik tidak sesuai?" ----------
    const fmt = (sec) => (isFinite(sec) && sec > 0) ? Math.floor(sec / 60) + ':' + String(Math.floor(sec % 60)).padStart(2, '0') : '-';

    function applyChoice(song, fixValue, entry) {
        const fixes = readFix();
        if (fixValue) fixes[song.id] = fixValue; else delete fixes[song.id];
        writeFix(fixes);
        cache.delete(song.id);
        if (entry) { cache.set(song.id, entry); loadedId = song.id; show(entry); }
        else { loadedId = null; syncSong(); }
    }

    function openPicker() {
        if (typeof playerBar === 'undefined' || !playerBar.classList.contains('show')) return;
        const song = getCurrentSong();
        if (!song) return;
        reqId++;                 // batalkan pencarian otomatis yang masih berjalan
        loadedId = song.id;      // supaya event play/loadedmetadata tidak menimpa panel ini
        setHeader(song);

        resetBody();
        bodyEl.classList.add('picking');
        bodyEl.scrollTop = 0;

        const wrap = document.createElement('div');
        wrap.innerHTML = `
            <div class="lyr-note">Cari lagunya di LRCLIB, lalu pilih versi yang cocok. Pilihanmu disimpan di perangkat ini.</div>
            <div class="lyr-search"><input type="text" class="lyr-q" placeholder="Judul dan artis"><button type="button" class="lyr-retry lyr-go">Cari</button></div>
            <div class="lyr-results"></div>
            <div class="lyr-pick-actions">
                <button type="button" class="lyr-retry lyr-off">Tidak ada lirik untuk lagu ini</button>
                <button type="button" class="lyr-retry lyr-auto">Kembali ke otomatis</button>
                <button type="button" class="lyr-retry lyr-back">Batal</button>
            </div>`;
        bodyEl.appendChild(wrap);

        const input = wrap.querySelector('.lyr-q');
        const results = wrap.querySelector('.lyr-results');
        input.value = `${cleanTitle(song.songName)} ${firstArtist(song)}`.trim();

        async function search() {
            const q = input.value.trim();
            if (!q) return;
            results.innerHTML = '';
            const wait = document.createElement('div');
            wait.className = 'lyr-note';
            wait.textContent = 'Mencari…';
            results.appendChild(wait);
            try {
                const list = (await getJSON(`${API}/search?${new URLSearchParams({ q })}`) || []).filter(hasText).slice(0, 10);
                results.innerHTML = '';
                if (!list.length) {
                    wait.textContent = 'Tidak ada hasil. Coba kata kunci lain.';
                    results.appendChild(wait);
                    return;
                }
                list.forEach((r) => {
                    const b = document.createElement('button');
                    b.type = 'button';
                    b.className = 'lyr-res';
                    const t = document.createElement('b');
                    t.textContent = `${r.trackName || '-'} — ${r.artistName || '-'}`;
                    const sub = document.createElement('span');
                    sub.textContent = `${r.albumName || 'Tanpa album'} · ${fmt(r.duration)} · ${r.instrumental ? 'instrumental' : (r.syncedLyrics ? 'tersinkron' : 'teks biasa')}`;
                    b.append(t, sub);
                    b.addEventListener('click', () => applyChoice(song, { id: r.id }, Object.assign(normalize(r), { recId: r.id, source: 'mine' })));
                    results.appendChild(b);
                });
            } catch (e) {
                console.warn('lyrics.js:', e);
                results.innerHTML = '';
                wait.textContent = 'Gagal mencari. Cek koneksi internet.';
                results.appendChild(wait);
            }
        }

        wrap.querySelector('.lyr-go').addEventListener('click', search);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') search(); });
        wrap.querySelector('.lyr-off').addEventListener('click', () => applyChoice(song, { off: true }, { none: true, off: true, source: 'mine' }));
        wrap.querySelector('.lyr-auto').addEventListener('click', () => applyChoice(song, null, null));
        wrap.querySelector('.lyr-back').addEventListener('click', () => { loadedId = null; syncSong(); });
        search();
    }

    box.querySelector('.lyr-wrong').addEventListener('click', openPicker);

    // ---------- Posisi & mode tampilan ----------
    const panelEl = document.querySelector('.now-playing-panel');
    const phoneEl = () => document.querySelector('.phone-frame');
    const isPanelFs = () => {
        const f = document.fullscreenElement;
        return !!f && f.classList.contains('now-playing-panel');
    };
    // laptop + layar penuh: lirik menjadi bagian dari card lagu (satu card yang melebar)
    const cardMode = () => isPanelFs() && !mobileView();

    function clearInline() {
        ['top', 'left', 'right', 'bottom', 'width', 'height'].forEach((p) => { box.style[p] = ''; });
    }

    // posisikan ulang baris yang sedang dinyanyikan (setelah card melebar / layar berubah)
    function recenter() {
        if (!open || !lines.length || Date.now() < userScrollUntil) return;
        setActive(currentIndex(audio.currentTime), true);
    }

    function layout() {
        const ph = phoneEl();
        if (ph) ph.classList.toggle('with-lyrics', open && cardMode());   // card melebar hanya saat lirik terbuka

        if (cardMode()) { box.classList.remove('over'); clearInline(); return; }
        if (!open || isPanelFs() || mobileView()) { box.classList.remove('over'); clearInline(); return; }

        // laptop biasa: menimpa persis card Now Playing (phone frame)
        const usable = panelEl && panelEl.classList.contains('show') && ph && ph.offsetWidth > 0 &&
            !document.body.classList.contains('np-hidden');
        if (!usable) { box.classList.remove('over'); clearInline(); return; }   // panel tersembunyi -> posisi cadangan di kanan
        const r = ph.getBoundingClientRect();
        box.classList.add('over');
        box.style.top = r.top + 'px';
        box.style.left = r.left + 'px';
        box.style.width = r.width + 'px';
        box.style.height = r.height + 'px';
        box.style.right = 'auto';
        box.style.bottom = 'auto';
    }

    let lraf = null;
    const relayout = () => {
        if (lraf) return;
        lraf = requestAnimationFrame(() => { lraf = null; layout(); });
    };
    window.addEventListener('resize', relayout);
    new MutationObserver(relayout).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    if (panelEl) new MutationObserver(relayout).observe(panelEl, { attributes: true, attributeFilter: ['class'] });
    if (window.ResizeObserver && phoneEl()) new ResizeObserver(relayout).observe(phoneEl());
    if (window.ResizeObserver) new ResizeObserver(() => recenter()).observe(bodyEl);

    // selesai melebar -> lirik dipusatkan lagi
    const phNow = phoneEl();
    if (phNow) phNow.addEventListener('transitionend', (e) => { if (e.propertyName === 'padding-right') recenter(); });

    // ---------- Buka / tutup ----------
    function openLyrics() {
        open = true;
        box.classList.add('show');
        lyricsBtn.classList.add('active');
        layout();
        syncSong();
        if (!rafId) rafId = requestAnimationFrame(tick);
    }
    function closeLyrics() {
        open = false;
        box.classList.remove('show');
        lyricsBtn.classList.remove('active');
        layout();
    }
    const toggle = () => (open ? closeLyrics() : openLyrics());

    lyricsBtn.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
    npBtn.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
    box.querySelector('.lyr-close').addEventListener('click', closeLyrics);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && open && !(document.activeElement && document.activeElement.tagName === 'INPUT')) closeLyrics();
    });

    // layar penuh: laptop -> panel lirik masuk ke dalam card lagu; HP -> menutupi seluruh layar
    document.addEventListener('fullscreenchange', () => {
        const fs = document.fullscreenElement;
        const card = cardMode();
        const ph = phoneEl();
        if (card && ph) ph.appendChild(box);
        else (fs || document.body).appendChild(box);
        box.classList.remove('side');
        box.classList.toggle('in-card', card);
        box.classList.toggle('in-fs', !!fs && !card);
        layout();
        // memindahkan elemen mereset posisi scroll, jadi dipusatkan lagi setelah pindah dan setelah animasi
        setTimeout(recenter, 120);
        setTimeout(recenter, 700);
    });

    window.Lyrics = { open: openLyrics, close: closeLyrics, toggle };
})();