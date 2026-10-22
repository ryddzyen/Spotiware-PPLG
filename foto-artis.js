// foto-artis.js — jalankan: node foto-artis.js  (membuat artist-photos.js dari isi folder Artist/)
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, 'Artist');
fs.mkdirSync(dir, { recursive: true });
const map = {};
fs.readdirSync(dir).filter(f => /\.(webp|jpg|jpeg|png|avif)$/i.test(f))
    .forEach(f => { map[path.parse(f).name] = 'Artist/' + f; });
fs.writeFileSync(path.join(__dirname, 'artist-photos.js'),
    'window.ARTIST_PHOTOS = ' + JSON.stringify(map, null, 2) + ';\n');
console.log(Object.keys(map).length + ' foto artis tercatat');