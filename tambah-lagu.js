// tambah-lagu.js — jalankan: node tambah-lagu.js
// Alur: taruh file di "Lagu-baru/"  ->  skrip kompres ke mp3 128kbps (Lagu/), cover ke webp (Art Cover/)
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = __dirname;
const INBOX = path.join(ROOT, 'Lagu-baru');
const DONE = path.join(INBOX, '_selesai');
const LAGU = path.join(ROOT, 'Lagu');
const COVER = path.join(ROOT, 'Art Cover');
const SCRIPT = path.join(ROOT, 'script.js');
const AUDIO_EXT = ['.mp3', '.m4a', '.ogg', '.wav', '.flac', '.opus', '.aac'];
const IMG_EXT = ['.webp', '.jpg', '.jpeg', '.png', '.avif'];
const FALLBACK_IMG = 'img/pplglogo.png';
const BITRATE = '128k';
const COVER_MAX = 600; // lebar maksimal cover (px)

const safeName = (s) => s.replace(/[<>:"\/\\|?*#%]/g, '_').trim();

function ffmpeg(args) {
    const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { encoding: 'utf8' });
    return r.status === 0;
}

function toWebp(inputFile, outputFile) {
    return ffmpeg([
        '-i', inputFile,
        '-vf', `scale='min(${COVER_MAX},iw)':-2`,
        '-c:v', 'libwebp', '-quality', '80',
        outputFile
    ]);
}

(async () => {
    if (spawnSync('ffmpeg', ['-version']).error) {
        console.error('ffmpeg tidak ditemukan. Pasang dulu: winget install Gyan.FFmpeg (lalu buka ulang terminal).');
        return;
    }

    [INBOX, DONE, LAGU, COVER].forEach((d) => fs.mkdirSync(d, { recursive: true }));

    const mm = await import('music-metadata');
    const src = fs.readFileSync(SCRIPT, 'utf8');

    const known = new Set([...src.matchAll(/songPath:\s*"([^"]+)"/g)].map((m) => m[1].toLowerCase()));
    const ids = [...src.matchAll(/\bid:\s*(\d+)/g)].map((m) => parseInt(m[1]));
    let nextId = Math.max(...ids) + 1;

    const files = fs.readdirSync(INBOX)
        .filter((f) => AUDIO_EXT.includes(path.extname(f).toLowerCase()))
        .sort();

    if (files.length === 0) {
        console.log('Folder "Lagu-baru" kosong. Taruh file lagu di sana dulu.');
        return;
    }

    const lines = [];

    for (const file of files) {
        const inPath = path.join(INBOX, file);
        const base = path.parse(file).name;
        const outBase = safeName(base);
        const outFile = outBase + '.mp3';
        const outPath = path.join(LAGU, outFile);
        const songPath = 'Lagu/' + outFile;

        if (known.has(songPath.toLowerCase()) || fs.existsSync(outPath)) {
            console.warn(`DILEWATI (sudah ada di Lagu/): ${outFile}`);
            continue;
        }

        // 1) baca tag judul / artis / cover
        let c = {};
        try {
            c = (await mm.parseFile(inPath)).common || {};
        } catch (e) {
            console.warn('Tag tidak terbaca (pakai nama file):', file);
        }
        const title = c.title || base;
        const artist = (c.artists && c.artists.length ? c.artists.join(', ') : c.artist) || 'Unknown';

        // 2) kompres audio ke mp3 128kbps (tag tetap dibawa, gambar dibuang dari mp3)
        process.stdout.write(`Kompres: ${file} ... `);
        const okAudio = ffmpeg([
            '-i', inPath, '-vn', '-map_metadata', '0',
            '-c:a', 'libmp3lame', '-b:a', BITRATE,
            outPath
        ]);
        if (!okAudio) {
            console.log('GAGAL (dilewati)');
            if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
            continue;
        }
        console.log('ok');

        // 3) cover -> webp: pakai gambar bernama sama di Lagu-baru, kalau tidak ada ambil dari dalam mp3
        let coverRel = null;
        const coverOut = path.join(COVER, outBase + '.webp');
        const sideImg = IMG_EXT.map((e) => path.join(INBOX, base + e)).find((p) => fs.existsSync(p));

        if (sideImg) {
            if (toWebp(sideImg, coverOut)) coverRel = `Art Cover/${outBase}.webp`;
        } else if (c.picture && c.picture.length) {
            const pic = c.picture[0];
            const tmp = path.join(INBOX, '_tmp_cover' + (/png/i.test(pic.format) ? '.png' : '.jpg'));
            fs.writeFileSync(tmp, pic.data);
            if (toWebp(tmp, coverOut)) coverRel = `Art Cover/${outBase}.webp`;
            fs.unlinkSync(tmp);
        }

        // 4) catat baris lagu & pindahkan file asli ke _selesai
        lines.push(`    { id: ${nextId}, songName: ${JSON.stringify(title)}, songDes: ${JSON.stringify(artist)}, songImage: ${JSON.stringify(coverRel || FALLBACK_IMG)}, songPath: ${JSON.stringify(songPath)} }`);
        console.log(`  + ${nextId}  ${title} — ${artist}${coverRel ? '' : '  (tanpa cover)'}`);
        nextId++;

        fs.renameSync(inPath, path.join(DONE, file));
        if (sideImg) fs.renameSync(sideImg, path.join(DONE, path.basename(sideImg)));
    }

    if (lines.length === 0) {
        console.log('Tidak ada lagu baru yang ditambahkan.');
        return;
    }

    // sisipkan sebelum penutup array songs
    const end = src.match(/\r?\n\];\s*\r?\n\s*const visibleSongs/);
    if (!end) {
        console.error('Penutup array songs tidak ditemukan di script.js. script.js TIDAK diubah.');
        console.error('Lagu sudah terkompres di Lagu/, tapi barisnya belum tercatat. Kabari saya.');
        return;
    }

    fs.writeFileSync(SCRIPT + '.bak', src);
    const result = src.slice(0, end.index) + ',\n' + lines.join(',\n') + src.slice(end.index);
    fs.writeFileSync(SCRIPT, result);

    console.log(`\nSelesai: ${lines.length} lagu ditambahkan. Cadangan: script.js.bak`);
})();