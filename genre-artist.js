// genre-artist.js — Tahap 1a: genre & artis (dipakai juga untuk FYP nanti)
(function () {
    // Nama artis harus sama persis dengan di kolom songDes. Yang belum terdaftar masuk "Lainnya".
    const GENRE_ARTISTS = {
        'Pop': ['Ariana Grande', 'Justin Bieber', 'Selena Gomez', 'Taylor Swift', 'Katy Perry', 'Charlie Puth', 'Shawn Mendes', 'One Direction', 'Bruno Mars', 'Ed Sheeran', 'Lauv', 'Maroon 5', 'Sam Smith', 'Lewis Capaldi', 'James Arthur', 'Billie Eilish', 'Chappell Roan', 'Gracie Abrams', 'Tate McRae', 'Anne-Marie', 'ZAYN', 'Halsey', 'Jason Mraz', 'Christina Perri', 'Ruth B.', 'Benson Boone', 'Ellie Goulding', 'Bazzi', 'Mariah Carey', 'Rihanna', 'Sia', "Why Don't We", 'Ali Gatie', 'Dean Lewis', 'Jamie Miller', 'Zack Tabudlo', 'Pink Sweat$', 'Henry Moodie', 'Gigi Perez', 'Lizzy McAlpine', 'Rosa Linn', 'Nicky Youre', 'Crash Adams', 'Jonas Blue', 'Clean Bandit', 'The Script', 'Stephen Sanchez', 'Caleb Hearn', 'JP Saxe', 'MAGIC!', 'Lukas Graham', 'John Legend', 'Dan + Shay', 'Suki Waterhouse', 'Hailee Steinfeld', 'Fifth Harmony', 'Julia Michaels', 'Jawsh 685', 'Jason Derulo', 'Ravyn Lenae', 'Sabrina Carpenter', 'Peter Paul and Mary'],
        'R&B': ['The Weeknd', 'SZA', 'Tinashe', 'Keyshia Cole', 'Kali Uchis', 'Jhené Aiko', 'Daniel Caesar', 'GIVĒON', 'Khalid', 'Mario', 'PARTYNEXTDOOR', 'Justine Skye', 'Chris Brown', 'Kehlani', 'Ty Dolla $ign', 'Denise Julia', 'Poo Bear', 'Rihanna', 'Giveon'],
        'Hip-Hop': ['Kendrick Lamar', '50 Cent', 'Snoop Dogg', 'Lil Uzi Vert', 'Drake', 'Post Malone', 'Future', 'Metro Boomin', 'Jay Rock', 'Wiz Khalifa', 'Tyga', 'Quavo', 'Chance the Rapper', 'Lil Peep', 'Lil Wayne', 'DJ Khaled', 'G-Eazy', 'B.o.B', 'Akon', 'mgk', 'Pitbull', 'Flo Rida', 'Playboi Carti', 'Swae Lee', 'Powfu', 'Lefty Gunplay', 'Nicki Minaj', 'Wale', 'Sean Kingston', 'Silentó', 'Dawin', 'R. City', 'Zacari', '510'],
        'Rock & Indie': ['Arctic Monkeys', 'The 1975', 'Coldplay', 'Evanescence', 'Imagine Dragons', 'WALK THE MOON', 'Queen', 'The Stranglers', 'Bleachers', 'Mitski', 'Djo', 'TV Girl', 'Cigarettes After Sex', 'Rex Orange County', 'beabadoobee', 'wave to earth', "Her's", 'Pastel Ghost', 'Chase Atlantic', 'The Marías', 'Sidney Gish', 'Eyedress', 'Dent May', 'Malcolm Todd', 'sombr', 'HYBS', 'Reality Club', 'Lana Del Rey', 'Joji', 'yung kai', 'Valley', 'Jeremy Zucker', 'd4vd', 'Cafuné', 'Desire', 'Nova', 'Charlie Burg', 'Dhruv', 'New West', 'mrld', 'Gamma Skies', 'Emmi', 'Maximillian', 'elijah woods', 'Etham', 'J.Tajor', 'HONNE', 'Georgia', 'BEKA', 'Keenan Te', 'Damon Empero', 'Veronica', 'Anıl Emre Daldal', 'Jaydes Archive', 'Ismail', 'Stream Cafe', 'LONOWN', 'riserayss'],
        'EDM': ['Marshmello', 'The Chainsmokers', 'Zedd', 'Avicii', 'Alan Walker', 'Kygo', 'DJ Snake', 'Major Lazer', 'Robin Schulz', 'David Guetta', 'Cheat Codes', 'NERO', 'Sickick', 'SHAUN', 'Sam Feldt', 'Conor Maynard', 'Grey', 'Maren Morris', 'Alesso', 'Florida Georgia Line', 'WATT', 'CHVRCHES', 'Bastille', 'Daft Punk', 'Potions', 'Auralyx'],
        'K-Pop': ['BTS', 'TREASURE', 'iKON', 'Dynamicduo', 'CHEN', 'BIBI', 'PONCHET', 'VARINZ', 'Jung Kook'],
        'Latin': ['Luis Fonsi', 'Daddy Yankee', 'FloyyMenor', 'Cris Mj', 'Becky G', 'Furacão 2000', 'Nyasia', 'Farruko'],
        'Pop Indonesia': ['Tulus', 'Raisa', 'Kahitna', 'Virgoun', 'Audy', 'Hivi!', 'Andi Rianto', 'Tiara Andini', 'Arsy Widianto', 'Keisya Levronka', 'Paul Aro', 'Sheila On 7', 'Dewa 19', 'Virzha', 'Andmesh', 'Idgitaf', 'Juicy Luicy', 'Yura Yunita', 'Glenn Fredly', 'Raim Laode', 'Bernadya', 'Maudy Ayunda', 'Rizky Febian', 'Jaz', 'Geisha', 'Nidji', 'Budi Doremi', 'Lyla', 'Mahen', 'Misellia', 'The Lantis', 'Rossa', 'Ghea Indrawari', 'Nadhif Basalamah', 'Piche Kota', 'Yovie Widianto', 'NIKI', 'Pamungkas', 'Feby Putri', 'Fiersa Besari', 'TheOvertunes', 'Monita Tahalea', 'Batas Senja', 'The Jansen', 'Aldo Longa', 'Brisia Jodie', 'Ahmad Abdul', 'A. Nayaka', 'Ben Utomo', 'Delika', 'Ecoutez', 'Gloria Jessica'],
        'Indie Indonesia': ['Hindia', '.Feast', 'Sal Priadi', 'Payung Teduh', 'For Revenge', 'Stereo Wall', 'Fourtwnty', 'Charita Utami', 'Soegi Bornean', 'Umay Shahab', 'Natania Karin', 'Halstage', 'Crayon Case', 'Nadin Amizah', 'eńau', 'ibra', 'dia', 'INDAHKUS', 'Tenxi', 'Naykilla', 'IV OF SPADES', 'Zephter', 'Suara Kayu', 'Aziz Hedra', 'Kapthenpurek', 'Silet Open Up', 'Spectrum', 'Cup of Joe', 'Abdul & The Coffee Theory'],
        'Religi': ['Maher Zain', 'Wali']
    };

    const ARTIST_GENRE = {};
    Object.entries(GENRE_ARTISTS).forEach(([genre, list]) => {
        list.forEach(a => { if (!ARTIST_GENRE[a.toLowerCase()]) ARTIST_GENRE[a.toLowerCase()] = genre; });
    });

    const splitArtists = s => String(s.songDes || '').split(',').map(a => a.trim()).filter(Boolean);

    function genreOf(song) {
        for (const a of song.artists) {
            const g = ARTIST_GENRE[a.toLowerCase()];
            if (g) return g;
        }
        return 'Lainnya';
    }

    songs.forEach(s => { s.artists = splitArtists(s); s.genre = genreOf(s); });

    window.GENRE_ARTISTS = GENRE_ARTISTS;
    window.getSongsByArtist = name => visibleSongs.filter(s => s.artists.includes(name));
    window.getSongsByGenre = genre => visibleSongs.filter(s => s.genre === genre);
    // dipakai untuk melengkapi daftar: tampilkan artis yang belum punya genre
    window.cekLainnya = () => {
        const set = new Set(visibleSongs.filter(s => s.genre === 'Lainnya').flatMap(s => s.artists));
        console.log([...set].sort().join('\n'));
        return set.size;
    };

    // ---------- tampilan ----------
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    function injectStyle() {
        const css = document.createElement('style');
        css.textContent = `
            #genreSection .ga-chips{display:flex;flex-wrap:wrap;gap:.5rem;padding:0 .2rem 1rem}
            #genreSection .ga-chip{background:rgba(255,255,255,.1);color:#fff;border:none;border-radius:2rem;padding:.5rem 1rem;font:inherit;font-size:.85rem;cursor:pointer}
            #genreSection .ga-chip:hover{background:rgba(255,255,255,.22)}
            #artistSection .ga-artists{display:flex;gap:1.2rem;overflow-x:auto;padding:.2rem .2rem 1rem;scrollbar-width:none}
            #artistSection .ga-artists::-webkit-scrollbar{display:none}
            #artistSection .ga-artist{flex:0 0 auto;width:120px;text-align:center;cursor:pointer}
            #artistSection .ga-artist img{width:120px;height:120px;border-radius:50%;object-fit:cover;background:#2f2f2f}
            #artistSection .ga-artist span{display:block;margin-top:.5rem;font-size:.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        `;
        document.head.appendChild(css);
    }

    function buildSections() {
        // genre
        const genres = Object.keys(GENRE_ARTISTS)
            .map(g => ({ g, n: getSongsByGenre(g).length }))
            .filter(x => x.n > 0);

        const gSec = document.createElement('div');
        gSec.className = 'music-section';
        gSec.id = 'genreSection';
        gSec.innerHTML = `
            <div class="music-section-header"><h2>Jelajahi Genre</h2></div>
            <div class="ga-chips">${genres.map(x => `<button class="ga-chip" data-genre="${esc(x.g)}">${esc(x.g)} <small>${x.n}</small></button>`).join('')}</div>`;

        // artis: yang punya >= 2 lagu, paling banyak dulu (maks. 24)
        const count = {};
        visibleSongs.forEach(s => s.artists.forEach(a => { count[a] = (count[a] || 0) + 1; }));
        const top = Object.entries(count).filter(([, n]) => n >= 2)
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 24);

        const aSec = document.createElement('div');
        aSec.className = 'music-section';
        aSec.id = 'artistSection';
        aSec.innerHTML = `
            <div class="music-section-header"><h2>Artis</h2></div>
            <div class="ga-artists">${top.map(([name]) => {
                const first = visibleSongs.find(s => s.artists.includes(name));
                return `<div class="ga-artist" data-artist="${esc(name)}"><img loading="lazy" src="${esc(first.songImage)}" alt=""><span>${esc(name)}</span></div>`;
            }).join('')}</div>`;

        gSec.addEventListener('click', e => {
            const chip = e.target.closest('.ga-chip');
            if (chip) openShowAllView(chip.dataset.genre, getSongsByGenre(chip.dataset.genre));
        });
        aSec.addEventListener('click', e => {
            const card = e.target.closest('.ga-artist');
            if (card) openShowAllView(card.dataset.artist, getSongsByArtist(card.dataset.artist));
        });
        return [gSec, aSec];
    }

    function init() {
        // dipasang di bawah section terakhir supaya urutan section lama tidak bergeser
        const anchor = document.getElementById('section-4')?.closest('.music-section');
        if (!anchor || typeof openShowAllView !== 'function') return setTimeout(init, 300);

        injectStyle();
        const [gSec, aSec] = buildSections();
        anchor.insertAdjacentElement('afterend', gSec);
        gSec.insertAdjacentElement('afterend', aSec);

        // sembunyikan saat mengetik di pencarian utama
        const input = document.querySelector('.input-box');
        input?.addEventListener('input', () => {
            const hide = input.value.trim() ? 'none' : '';
            gSec.style.display = hide;
            aSec.style.display = hide;
        });
    }

    init();
})();