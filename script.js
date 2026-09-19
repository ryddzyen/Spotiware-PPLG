let play = document.getElementById('play');
let progressBar = document.getElementById('progressBar');

const songs = [
    { id: 1, songName: "PIXY", songDes: "LEGACY", songImage: "Art Cover/LEGACY.jpg", songPath: "Lagu/LEGACY.mp3" },
    { id: 2, songName: "2 On (feat. ScHoolboy Q)", songDes: "Tinashe", songImage: "Art Cover/2 On (feat. ScHoolboy Q).jpg", songPath: "Lagu/2 On (feat. ScHoolboy Q).mp3" },
    { id: 3, songName: "After Dark x Sweater Weather", songDes: "mikeeysmind", songImage: "Art Cover/After Dark x Sweater Weather.jpeg", songPath: "Lagu/After Dark x Sweater Weather.mp3" },
    { id: 4, songName: "After Hours", songDes: "The Weeknd", songImage: "Art Cover/After Hours.jpeg", songPath: "Lagu/After Hours.mp3" },
    { id: 5, songName: "Again (feat. XXXTENTACION)", songDes: "Noah Cyrus", songImage: "Art Cover/Again (feat. XXXTENTACION).jpg", songPath: "Lagu/Again (feat. XXXTENTACION).mp3" },
    { id: 6, songName: "American Boy", songDes: "Estelle", songImage: "Art Cover/Shine.jpg", songPath: "Lagu/American Boy.mp3" },
    { id: 7, songName: "Baby By Me", songDes: "50 Cent", songImage: "Art Cover/Before I Self-Destruct.jpeg", songPath: "Lagu/Baby By Me.mp3" },
    { id: 8, songName: "Big Boys", songDes: "Elysees", songImage: "Art Cover/Big Boys.jpeg", songPath: "Lagu/Big Boys.mp3" },
    { id: 9, songName: "Black Beatles", songDes: "Rae Sremmurd", songImage: "Art Cover/Black Beatles.jpeg", songPath: "Lagu/Black Beatles.mp3" },
    { id: 10, songName: "bloodline", songDes: "Ariana Grande", songImage: "Art Cover/2.jpeg", songPath: "Lagu/bloodline.mp3" },
    { id: 11, songName: "Brooklyn Baby", songDes: "Lana Del Rey", songImage: "Art Cover/AM.jpeg", songPath: "Lagu/Brooklyn Baby.mp3" },
    { id: 12, songName: "California Love", songDes: "2Pac", songImage: "Art Cover/27 Anos Nacional.jpeg", songPath: "Lagu/California Love - Original Version.mp3" },
    { id: 13, songName: "Call Out My Name", songDes: "The Weeknd", songImage: "Art Cover/After Hours.jpeg", songPath: "Lagu/Call Out My Name.mp3" },
    { id: 14, songName: "CLEARED - Remix (Slowed)", songDes: "Lil Bitch, Wizz Havinn", songImage: "Art Cover/CLEARED - Remix (Slowed _ Sped Up).jpeg", songPath: "Lagu/CLEARED - Remix (Slowed).mp3" },
    { id: 15, songName: "Collide (feat. Tyga)", songDes: "Justine Skye", songImage: "Art Cover/Fan of A Fan The Album (Expanded Edition).jpeg", songPath: "Lagu/Collide (feat. Tyga).mp3" },
    { id: 16, songName: "Coming Down", songDes: "The Weeknd", songImage: "Art Cover/After Hours.jpeg", songPath: "Lagu/Coming Down.mp3" },
    { id: 17, songName: "Confident", songDes: "Justin Bieber", songImage: "Art Cover/24K Magic.jpeg", songPath: "Lagu/Confident.mp3" },
    { id: 18, songName: "Dark Beach", songDes: "Pastel Ghost", songImage: "Art Cover/Abyss.jpeg", songPath: "Lagu/Dark Beach.mp3" },
    { id: 19, songName: "Die For You", songDes: "The Weeknd", songImage: "Art Cover/After Hours.jpeg", songPath: "Lagu/Die For You.mp3" },
    { id: 20, songName: "Diva", songDes: "The Kid LAROI, Lil Tecca", songImage: "Art Cover/Dark Side.jpeg", songPath: "Lagu/Diva.mp3" },
    { id: 21, songName: "Dreamin", songDes: "Pill, The Weeknd", songImage: "Art Cover/Dreamin.jpeg", songPath: "Lagu/Dreamin.mp3" },
    { id: 22, songName: "Feels", songDes: "Calvin Harris", songImage: "Art Cover/24K Magic.jpeg", songPath: "Lagu/Feels (feat. Pharrell Williams, Katy Perry & Big Sean).mp3" },
    { id: 23, songName: "Flatline", songDes: "Justin Bieber", songImage: "Art Cover/Cum n Cocaine.jpeg", songPath: "Lagu/Flatline.mp3" },
    { id: 24, songName: "Floki x Lost Soul", songDes: "NBSPLV", songImage: "Art Cover/Floki x Lost Soul.jpeg", songPath: "Lagu/Floki x Lost Soul.mp3" },
    { id: 25, songName: "Fluxxwave", songDes: "Clovis Reyes", songImage: "Art Cover/Fluxxwave.jpeg", songPath: "Lagu/Fluxxwave.mp3" },
    { id: 26, songName: "Gata Only", songDes: "FloyyMenor, Cris Mj", songImage: "Art Cover/EL COMIENZO.jpeg", songPath: "Lagu/Gata Only.mp3" },
    { id: 27, songName: "Genius", songDes: "LSD", songImage: "Art Cover/24K Magic.jpeg", songPath: "Lagu/Genius (feat. Sia, Diplo, and Labrinth).mp3" },
    { id: 28, songName: "Girl You Loud - Slowed & Reverb", songDes: "OMFG", songImage: "Art Cover/April Mixtape 3.jpg", songPath: "Lagu/Girl You Loud - Slowed & Reverb.mp3" },
    { id: 29, songName: "Girl You Loud", songDes: "OMFG", songImage: "Art Cover/April Mixtape 3.jpg", songPath: "Lagu/Girl You Loud.mp3" },
    { id: 30, songName: "God's Plan", songDes: "Drake", songImage: "Art Cover/2.jpeg", songPath: "Lagu/God's Plan.mp3" },
    { id: 31, songName: "Golden Brown", songDes: "The Stranglers", songImage: "Art Cover/French Exit.jpeg", songPath: "Lagu/Golden Brown.mp3" },
    { id: 32, songName: "Good For You x One Of The Girls", songDes: "Selena Gomez, The Weeknd", songImage: "Art Cover/After Hours.jpeg", songPath: "Lagu/Good For You x One Of The Girls - Sped Up.mp3" },
    { id: 33, songName: "Good For You", songDes: "Selena Gomez", songImage: "Art Cover/24K Magic.jpeg", songPath: "Lagu/Good For You.mp3" },
    { id: 34, songName: "Hotel Room", songDes: "Pitbull", songImage: "Art Cover/2.jpeg", songPath: "Lagu/Hotel Room.mp3" },
    { id: 35, songName: "HYPNOTIC DATA", songDes: "Odetari", songImage: "Art Cover/Dark Side.jpeg", songPath: "Lagu/HYPNOTIC DATA.mp3" },
    { id: 36, songName: "I Wanna Be Yours", songDes: "Arctic Monkeys", songImage: "Art Cover/AM.jpeg", songPath: "Lagu/I Wanna Be Yours.mp3" },
    { id: 37, songName: "I Was Never There", songDes: "The Weeknd", songImage: "Art Cover/After Hours.jpeg", songPath: "Lagu/I Was Never There.mp3" },
    { id: 38, songName: "Innocence", songDes: "Nero", songImage: "Art Cover/Abyss.jpeg", songPath: "Lagu/Innocence.mp3" },
    { id: 39, songName: "Let Me Love You", songDes: "Mario", songImage: "Art Cover/24K Magic.jpeg", songPath: "Lagu/Let Me Love You.mp3" },
    { id: 40, songName: "Lost Soul", songDes: "NBSPLV", songImage: "Art Cover/Floki x Lost Soul.jpeg", songPath: "Lagu/Lost Soul.mp3" },
    { id: 41, songName: "love for you - Slowed Down", songDes: "Joji", songImage: "Art Cover/April Mixtape 3.jpg", songPath: "Lagu/love for you - Slowed Down.mp3" },
    { id: 42, songName: "love for you", songDes: "Joji", songImage: "Art Cover/April Mixtape 3.jpg", songPath: "Lagu/love for you.mp3" },
    { id: 43, songName: "Love Me Not", songDes: "Rex Orange County", songImage: "Art Cover/French Exit.jpeg", songPath: "Lagu/Love Me Not (feat. Rex Orange County).mp3" },
    { id: 44, songName: "Love Potions", songDes: "PR1SVX", songImage: "Art Cover/Cum n Cocaine.jpeg", songPath: "Lagu/Love Potions.mp3" },
    { id: 45, songName: "Lovers Rock", songDes: "TV Girl", songImage: "Art Cover/French Exit.jpeg", songPath: "Lagu/Lovers Rock.mp3" },
    { id: 46, songName: "M a k e I t T o T h e M o r n i n g", songDes: "PartyFavorz", songImage: "Art Cover/Dark Side.jpeg", songPath: "Lagu/M a k e I t T o T h e M o r n i n g.mp3" },
    { id: 47, songName: "MEMORIZING - SLOWED", songDes: "A2Z", songImage: "Art Cover/CLEARED - Remix (Slowed _ Sped Up).jpeg", songPath: "Lagu/MEMORIZING - SLOWED.mp3" },
    { id: 48, songName: "Mimosa 2000", songDes: "DJ Topo, MC Kadu", songImage: "Art Cover/April Mixtape 3.jpg", songPath: "Lagu/Mimosa 2000.mp3" },
    { id: 49, songName: "Mind Games", songDes: "Sickick", songImage: "Art Cover/Dark Side.jpeg", songPath: "Lagu/Mind Games.mp3" },
    { id: 50, songName: "Money Trees", songDes: "Kendrick Lamar", songImage: "Art Cover/Aquarius.jpeg", songPath: "Lagu/Money Trees.mp3" },
    { id: 51, songName: "moonlight - Sped Up", songDes: "Kali Uchis", songImage: "Art Cover/2.jpeg", songPath: "Lagu/moonlight (kali uchis) - sped up version.mp3" },
    { id: 52, songName: "Moonlight", songDes: "Kali Uchis", songImage: "Art Cover/2.jpeg", songPath: "Lagu/Moonlight.mp3" },
    { id: 53, songName: "MTG MEDICINE", songDes: "DJ Samir", songImage: "Art Cover/27 Anos Nacional.jpeg", songPath: "Lagu/MTG MEDICINE.mp3" },
    { id: 54, songName: "No. 1 Party Anthem", songDes: "Arctic Monkeys", songImage: "Art Cover/AM.jpeg", songPath: "Lagu/No. 1 Party Anthem.mp3" },
    { id: 55, songName: "nuts (feat. Rainy Bear)", songDes: "Lil Peep", songImage: "Art Cover/2.jpeg", songPath: "Lagu/nuts (feat. Rainy Bear).mp3" },
    { id: 56, songName: "obsessed - slowed + reverb", songDes: "Olivia Rodrigo", songImage: "Art Cover/April Mixtape 3.jpg", songPath: "Lagu/obsessed - slowed + reverb.mp3" },
    { id: 57, songName: "Obsessed", songDes: "Mariah Carey", songImage: "Art Cover/24K Magic.jpeg", songPath: "Lagu/Obsessed.mp3" },
    { id: 58, songName: "Paparazzi", songDes: "Lady Gaga", songImage: "Art Cover/24K Magic.jpeg", songPath: "Lagu/Paparazzi.mp3" },
    { id: 59, songName: "PELIGROSA", songDes: "Wisin & Yandel", songImage: "Art Cover/EL COMIENZO.jpeg", songPath: "Lagu/PELIGROSA.mp3" },
    { id: 60, songName: "poster boy", songDes: "Lyn Lapid", songImage: "Art Cover/French Exit.jpeg", songPath: "Lagu/poster boy.mp3" },
    { id: 61, songName: "pretty ho3 (Slowed + Reverb)", songDes: "Flyana Boss", songImage: "Art Cover/April Mixtape 3.jpg", songPath: "Lagu/pretty ho3 (Slowed + Reverb).mp3" },
    { id: 62, songName: "Princess Bubblegum (Remix)", songDes: "ilyt", songImage: "Art Cover/French Exit.jpeg", songPath: "Lagu/Princess Bubblegum (Remix).mp3" },
    { id: 63, songName: "Princess Bubblegum", songDes: "ilyt", songImage: "Art Cover/French Exit.jpeg", songPath: "Lagu/Princess Bubblegum.mp3" },
    { id: 64, songName: "Red Light", songDes: "Tedashii, Lecrae", songImage: "Art Cover/Dark Side.jpeg", songPath: "Lagu/Red Light.mp3" },
    { id: 65, songName: "Right Now (Na Na Na)", songDes: "Akon", songImage: "Art Cover/Encore.jpeg", songPath: "Lagu/Right Now (Na Na Na).mp3" },
    { id: 66, songName: "Say Yes To Heaven", songDes: "Lana Del Rey", songImage: "Art Cover/AM.jpeg", songPath: "Lagu/Say Yes To Heaven.mp3" },
    { id: 67, songName: "Show Me Love (with Tyla)", songDes: "Wizkid, Tyla", songImage: "Art Cover/24K Magic.jpeg", songPath: "Lagu/Show Me Love (with Tyla).mp3" },
    { id: 68, songName: "Show Me Love", songDes: "Robin S.", songImage: "Art Cover/24K Magic.jpeg", songPath: "Lagu/Show Me Love.mp3" },
    { id: 69, songName: "Skyfall", songDes: "Adele", songImage: "Art Cover/2.jpeg", songPath: "Lagu/Skyfall.mp3" },
    { id: 70, songName: "Smack That", songDes: "Akon", songImage: "Art Cover/Encore.jpeg", songPath: "Lagu/Smack That.mp3" },
    { id: 71, songName: "SMOKE IT OFF!", songDes: "Lumi Athena, Odetari", songImage: "Art Cover/Dark Side.jpeg", songPath: "Lagu/SMOKE IT OFF!.mp3" },
    { id: 72, songName: "Sweater Weather - Sped Up", songDes: "The Neighbourhood", songImage: "Art Cover/After Dark x Sweater Weather.jpeg", songPath: "Lagu/Sweater Weather - Sped Up.mp3" },
    { id: 73, songName: "Swimming Pools (Drank)", songDes: "Kendrick Lamar", songImage: "Art Cover/Aquarius.jpeg", songPath: "Lagu/Swimming Pools (Drank) - Extended Version.mp3" },
    { id: 74, songName: "telepatía", songDes: "Kali Uchis", songImage: "Art Cover/2.jpeg", songPath: "Lagu/telepatía.mp3" },
    { id: 75, songName: "That's What I Like", songDes: "Bruno Mars", songImage: "Art Cover/24K Magic.jpeg", songPath: "Lagu/That's What I Like.mp3" },
    { id: 76, songName: "The Days - NOTION Remix", songDes: "Avicii, Notion", songImage: "Art Cover/2.jpeg", songPath: "Lagu/The Days - NOTION Remix.mp3" },
    { id: 77, songName: "The Days", songDes: "Avicii", songImage: "Art Cover/2.jpeg", songPath: "Lagu/The Days.mp3" },
    { id: 78, songName: "The Lost Soul Down X Lost Soul", songDes: "NBSPLV", songImage: "Art Cover/Floki x Lost Soul.jpeg", songPath: "Lagu/The Lost Soul Down X Lost Soul.mp3" },
    { id: 79, songName: "The Machine", songDes: "Reed Wonder", songImage: "Art Cover/Dark Side.jpeg", songPath: "Lagu/The Machine.mp3" },
    { id: 80, songName: "Timeless (feat Playboi Carti)", songDes: "The Weeknd", songImage: "Art Cover/After Hours.jpeg", songPath: "Lagu/Timeless (feat Playboi Carti).mp3" },
    { id: 81, songName: "Under Your Spell (1)", songDes: "Desire", songImage: "Art Cover/Abyss.jpeg", songPath: "Lagu/Under Your Spell (1).mp3" },
    { id: 82, songName: "Under Your Spell - Slowed + Reverb", songDes: "Desire", songImage: "Art Cover/Abyss.jpeg", songPath: "Lagu/Under Your Spell - Slowed + Reverb.mp3" },
    { id: 83, songName: "Under Your Spell", songDes: "Desire", songImage: "Art Cover/Abyss.jpeg", songPath: "Lagu/Under Your Spell.mp3" },
    { id: 84, songName: "Versace on the Floor", songDes: "Bruno Mars", songImage: "Art Cover/24K Magic.jpeg", songPath: "Lagu/Versace on the Floor.mp3" },
    { id: 85, songName: "VISION - Slowed", songDes: "VALORANT, Grabbitz", songImage: "Art Cover/Dark Side.jpeg", songPath: "Lagu/VISION - Slowed.mp3" },
    { id: 86, songName: "VISION", songDes: "VALORANT, Grabbitz", songImage: "Art Cover/Dark Side.jpeg", songPath: "Lagu/VISION.mp3" },
    { id: 87, songName: "West Coast", songDes: "Lana Del Rey", songImage: "Art Cover/AM.jpeg", songPath: "Lagu/West Coast.mp3" },
    { id: 88, songName: "wutiwant - Sped Up", songDes: "saroc", songImage: "Art Cover/Cum n Cocaine.jpeg", songPath: "Lagu/wutiwant - Sped Up.mp3" },
    { id: 89, songName: "Wutiwant X Love Potions LQ", songDes: "saroc, PR1SVX", songImage: "Art Cover/Cum n Cocaine.jpeg", songPath: "Lagu/Wutiwant X Love Potions LQ.mp3" },
    { id: 90, songName: "wutiwant", songDes: "saroc", songImage: "Art Cover/Cum n Cocaine.jpeg", songPath: "Lagu/wutiwant.mp3" }
];

let order = [...songs];
let currentIndex = 0;
let audio = new Audio(order[currentIndex].songPath);

let currentTimeEl = document.getElementById('currentTime');
let durationEl = document.getElementById('duration');
let nowBar = document.querySelector('.now-bar');
let playerBar = document.querySelector('.player-bar');
let nowPlayingPanel = document.querySelector('.now-playing-panel');

// ===== Now Playing Panel (iPhone style) refs =====
let npImage = document.getElementById('npImage');
let npTitle = document.getElementById('npTitle');
let npArtist = document.getElementById('npArtist');
let npProgressBar = document.getElementById('npProgressBar');
let npCurrentTime = document.getElementById('npCurrentTime');
let npDuration = document.getElementById('npDuration');
let npPlay = document.getElementById('npPlay');
let npForward = document.getElementById('npForward');
let npBackward = document.getElementById('npBackward');
let npVolumeBar = document.getElementById('npVolumeBar');

// ===== History refs =====
let historyList = document.getElementById('historyList');
let playHistory = [];

function renderSongs(songsToRender) {
    let sec1 = document.getElementById('section-1');
    let sec2 = document.getElementById('section-2');
    let sec3 = document.getElementById('section-3');

    if (sec1) sec1.innerHTML = '';
    if (sec2) sec2.innerHTML = '';
    if (sec3) sec3.innerHTML = '';

    songsToRender.forEach((song, index) => {
        let cardHTML = `
            <div class="music-card">
                <img src="${song.songImage}" alt="${song.songName}">
                <div class="music-play-btn">
                    <i id="${song.id}" class="playMusic fa-solid fa-circle-play" data-audio="${song.songPath}"></i>
                </div>
                <div class="img-title">${song.songName}</div>
                <div class="img-description">${song.songDes}</div>
            </div>
        `;

        if (index < 30) {
            if (sec1) sec1.innerHTML += cardHTML;
        } else if (index < 60) {
            if (sec2) sec2.innerHTML += cardHTML;
        } else {
            if (sec3) sec3.innerHTML += cardHTML;
        }
    });

    attachPlayEvents();
}

function attachPlayEvents() {
    let playMusicList = Array.from(document.getElementsByClassName('playMusic'));
    playMusicList.forEach((element) => {
        element.addEventListener('click', (e) => {
            let clickedId = parseInt(e.target.id);

            // Lagu yang diklik SAMA dengan yang lagi aktif -> toggle play/pause aja
            if (getCurrentSong().id === clickedId) {
                if (audio.paused) {
                    audio.play();
                    play.classList.remove('fa-circle-play');
                    play.classList.add('fa-circle-pause');
                    e.target.classList.remove('fa-circle-play');
                    e.target.classList.add('fa-circle-pause');
                } else {
                    audio.pause();
                    play.classList.remove('fa-circle-pause');
                    play.classList.add('fa-circle-play');
                    e.target.classList.remove('fa-circle-pause');
                    e.target.classList.add('fa-circle-play');
                }
                return;
            }

            // Lagu BEDA -> pindah lagu & play dari awal (perilaku lama)
            let pos = order.findIndex((s) => s.id === clickedId);
            currentIndex = pos !== -1 ? pos : 0;

            audio.src = getCurrentSong().songPath;
            audio.currentTime = 0;
            audio.play();
            addToHistory(getCurrentSong());

            playerBar.classList.add('show');
            if (nowPlayingPanel) nowPlayingPanel.classList.add('show');

            highlightCurrentSong();
            updateNowBar();
        });
    });
}

function setupSearch() {
    let searchInputEl = document.querySelector('.input-box');
    if (!searchInputEl) return;

    searchInputEl.addEventListener('input', (e) => {
        let query = e.target.value.toLowerCase().trim();

        let filtered = songs.filter((song) => {
            let nameMatch = song.songName.toLowerCase().includes(query);
            let desMatch = song.songDes.toLowerCase().includes(query);
            return nameMatch || desMatch;
        });

        renderSongs(filtered);
        toggleSectionTitles(query.length > 0);
    });
}

function toggleSectionTitles(isSearching) {
    document.querySelectorAll('.music-section h2').forEach((h2) => {
        h2.style.display = isSearching ? 'none' : 'block';
    });
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return '0:00';
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatRemainingTime(current, duration) {
    if (isNaN(duration) || duration === Infinity) return '-0:00';
    let remaining = duration - current;
    if (remaining < 0) remaining = 0;
    let mins = Math.floor(remaining / 60);
    let secs = Math.floor(remaining % 60);
    return `-${mins}:${secs.toString().padStart(2, '0')}`;
}

let songOnRepeat = false;
let songOnShuffle = false;

function getCurrentSong() {
    return order[currentIndex];
}

function getSongElement(songId) {
    let playMusicList = Array.from(document.getElementsByClassName('playMusic'));
    return playMusicList.find((el) => parseInt(el.id) === songId);
}

const makeAllPlay = () => {
    let playMusicList = Array.from(document.getElementsByClassName('playMusic'));
    playMusicList.forEach((element) => {
        element.classList.remove('fa-circle-pause');
        element.classList.add('fa-circle-play');
    });
};

function highlightCurrentSong() {
    makeAllPlay();
    let el = getSongElement(getCurrentSong().id);
    if (el) {
        el.classList.remove('fa-circle-play');
        el.classList.add('fa-circle-pause');
    }
    play.classList.remove('fa-circle-play');
    play.classList.add('fa-circle-pause');
}

function updateNowPlayingPanel() {
    let song = getCurrentSong();
    if (npImage) npImage.src = song.songImage;
    if (npTitle) npTitle.innerText = song.songName;
    if (npArtist) npArtist.innerText = song.songDes;

    let npFullscreenBg = document.getElementById('npFullscreenBg');
    if (npFullscreenBg) npFullscreenBg.style.backgroundImage = `url('${song.songImage}')`;
}

function updateNowBar() {
    let song = getCurrentSong();
    nowBar.getElementsByTagName('img')[0].src = song.songImage;
    nowBar.getElementsByClassName('img-title-info')[0].innerText = song.songName;
    nowBar.getElementsByClassName('img-des-info')[0].innerText = song.songDes;
    updateNowPlayingPanel();
}

// ===== History functions =====
function addToHistory(song) {
    playHistory = playHistory.filter((s) => s.id !== song.id);
    playHistory.unshift(song);

    if (playHistory.length > 20) {
        playHistory = playHistory.slice(0, 20);
    }

    renderHistory();
}

function renderHistory() {
    if (!historyList) return;

    if (playHistory.length === 0) {
        historyList.innerHTML = `<div class="history-empty">Belum ada lagu yang diputar</div>`;
        return;
    }

    historyList.innerHTML = playHistory.map((song) => `
        <div class="history-item" data-id="${song.id}">
            <img src="${song.songImage}" alt="${song.songName}">
            <div class="history-info">
                <div class="history-title">${song.songName}</div>
                <div class="history-artist">${song.songDes}</div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.history-item').forEach((item) => {
        item.addEventListener('click', () => {
            let clickedId = parseInt(item.dataset.id);
            let pos = order.findIndex((s) => s.id === clickedId);
            currentIndex = pos !== -1 ? pos : 0;

            audio.src = getCurrentSong().songPath;
            audio.currentTime = 0;
            audio.play();

            playerBar.classList.add('show');
            if (nowPlayingPanel) nowPlayingPanel.classList.add('show');

            highlightCurrentSong();
            updateNowBar();
        });
    });
}

audio.addEventListener('loadedmetadata', () => {
    if (durationEl) {
        durationEl.innerText = formatTime(audio.duration);
    }
    if (npDuration) {
        npDuration.innerText = formatRemainingTime(0, audio.duration);
    }
});

play.addEventListener('click', () => {
    if (audio.paused || audio.currentTime == 0) {
        audio.play();
        playerBar.classList.add('show');
        if (nowPlayingPanel) nowPlayingPanel.classList.add('show');

        play.classList.remove('fa-circle-play');
        play.classList.add('fa-circle-pause');
        let el = getSongElement(getCurrentSong().id);
        if (el) {
            el.classList.remove('fa-circle-play');
            el.classList.add('fa-circle-pause');
        }
    } else {
        audio.pause();
        play.classList.remove('fa-circle-pause');
        play.classList.add('fa-circle-play');
        makeAllPlay();
    }
});

audio.addEventListener('play', () => {
    if (npPlay) {
        npPlay.classList.remove('fa-play');
        npPlay.classList.add('fa-pause');
    }
});

audio.addEventListener('pause', () => {
    if (npPlay) {
        npPlay.classList.remove('fa-pause');
        npPlay.classList.add('fa-play');
    }
});

audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        let progress = (audio.currentTime / audio.duration) * 100;
        progressBar.value = progress;
        progressBar.style.background = `linear-gradient(to right, #ebeceb ${progress}%, #333 ${progress}%)`;
        currentTimeEl.innerText = formatTime(audio.currentTime);

        if (npProgressBar) {
            npProgressBar.value = progress;
            npProgressBar.style.background = `linear-gradient(to right, var(--fg) ${progress}%, #555 ${progress}%)`;
        }
        if (npCurrentTime) npCurrentTime.innerText = formatTime(audio.currentTime);
        if (npDuration) npDuration.innerText = formatRemainingTime(audio.currentTime, audio.duration);
    }
});

progressBar.addEventListener('input', function () {
    let value = this.value;
    this.style.background = `linear-gradient(to right, #f9f9f9 ${value}%, #333 ${value}%)`;
    if (audio.duration) {
        audio.currentTime = (progressBar.value * audio.duration) / 100;
    }
});

if (npProgressBar) {
    npProgressBar.addEventListener('input', function () {
        let value = this.value;
        this.style.background = `linear-gradient(to right, var(--yellow) ${value}%, #555 ${value}%)`;
        if (audio.duration) {
            audio.currentTime = (value * audio.duration) / 100;
        }
    });
}

if (npPlay) {
    npPlay.addEventListener('click', () => {
        play.click();
    });
}

function updateVolumeFill(el) {
    let value = el.value;
    el.style.background = `linear-gradient(to right, white ${value}%, #555 ${value}%)`;
}

if (npVolumeBar) {
    updateVolumeFill(npVolumeBar);

    npVolumeBar.addEventListener('input', function () {
        audio.volume = this.value / 100;
        updateVolumeFill(this);
    });
}

function shuffleSongs(originalOrder) {
    let result = [...originalOrder];
    for (let i = result.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

let shuffle = document.getElementById('shuffle');
let repeat = document.getElementById('repeat');

if (shuffle) {
    shuffle.addEventListener('click', () => {
        let playingSongId = getCurrentSong().id;

        if (!songOnShuffle) {
            songOnShuffle = true;
            songOnRepeat = false;
            shuffle.classList.add('active');
            if (repeat) repeat.classList.remove('active');
            order = shuffleSongs(songs);
        } else {
            songOnShuffle = false;
            shuffle.classList.remove('active');
            order = [...songs];
        }

        let newPos = order.findIndex((s) => s.id === playingSongId);
        currentIndex = newPos !== -1 ? newPos : 0;
    });
}

if (repeat) {
    repeat.addEventListener('click', () => {
        let playingSongId = getCurrentSong().id;

        if (!songOnRepeat) {
            songOnRepeat = true;
            songOnShuffle = false;
            repeat.classList.add('active');
            if (shuffle) shuffle.classList.remove('active');
            order = [...songs];
        } else {
            songOnRepeat = false;
            repeat.classList.remove('active');
        }

        let newPos = order.findIndex((s) => s.id === playingSongId);
        currentIndex = newPos !== -1 ? newPos : 0;
    });
}

const playNextSong = () => {
    currentIndex = (currentIndex + 1) % order.length;
    audio.src = getCurrentSong().songPath;
    audio.currentTime = 0;
    audio.play();
    addToHistory(getCurrentSong());
    highlightCurrentSong();
    updateNowBar();
};

const playPrevSong = () => {
    currentIndex = (currentIndex - 1 + order.length) % order.length;
    audio.src = getCurrentSong().songPath;
    audio.currentTime = 0;
    audio.play();
    addToHistory(getCurrentSong());
    highlightCurrentSong();
    updateNowBar();
};

let forward = document.getElementById('forward');
let backward = document.getElementById('backward');

if (forward) forward.addEventListener('click', playNextSong);
if (backward) backward.addEventListener('click', playPrevSong);
if (npForward) npForward.addEventListener('click', playNextSong);
if (npBackward) npBackward.addEventListener('click', playPrevSong);

audio.addEventListener('ended', () => {
    if (songOnRepeat) {
        audio.currentTime = 0;
        audio.play();
    } else {
        playNextSong();
    }
});

let npFullscreenBtn = document.getElementById('npFullscreenBtn');
let npBackBtn = document.getElementById('npBackBtn');
let nowPlayingPanelEl = document.querySelector('.now-playing-panel');

if (npFullscreenBtn && nowPlayingPanelEl) {
    npFullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            nowPlayingPanelEl.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });
}

if (npBackBtn) {
    npBackBtn.addEventListener('click', () => {
        document.exitFullscreen();
    });
}

// Icon expand berubah jadi collapse pas fullscreen aktif
document.addEventListener('fullscreenchange', () => {
    if (!npFullscreenBtn) return;
    let icon = npFullscreenBtn.querySelector('i');
    if (document.fullscreenElement) {
        icon.classList.remove('fa-expand');
        icon.classList.add('fa-compress');
    } else {
        icon.classList.remove('fa-compress');
        icon.classList.add('fa-expand');
    }
});

document.querySelectorAll('.songs-wrapper').forEach((wrapper) => {
    let track = wrapper.querySelector('.songs');
    let nextBtn = wrapper.querySelector('.next-btn');
    let prevBtn = wrapper.querySelector('.prev-btn');

    function getCardStep(track) {
    let card = track.querySelector('.music-card');
    if (!card) return 700;
    let style = window.getComputedStyle(card);
    let marginRight = parseFloat(style.marginRight) || 0;
    return card.offsetWidth + marginRight + 16; // 16 = kira-kira gap antar kartu
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        track.scrollBy({ left: getCardStep(track) * 3, behavior: 'smooth' });
    });
}

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -getCardStep(track) * 3, behavior: 'smooth' });
    });
}

    if (!track) return;

    function updateButtonVisibility() {
        let maxScrollLeft = track.scrollWidth - track.clientWidth;

        if (prevBtn) {
            prevBtn.style.display = track.scrollLeft <= 1 ? 'none' : 'flex';
        }

        if (nextBtn) {
            nextBtn.style.display = track.scrollLeft >= maxScrollLeft - 1 ? 'none' : 'flex';
        }
    }

    track.addEventListener('scroll', updateButtonVisibility);
    setTimeout(updateButtonVisibility, 100);

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
    }
});

// ===== Home Icon: reset ke tampilan awal =====
let homeIcon = document.querySelector('.home-icon');
let mainRightPart = document.querySelector('.main-right-part');

if (homeIcon) {
    homeIcon.addEventListener('click', () => {
        let searchInputEl = document.querySelector('.input-box');
        if (searchInputEl) searchInputEl.value = '';

        renderSongs(songs);
        toggleSectionTitles(false);

        if (mainRightPart) {
            mainRightPart.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

// ===== Modal Notifikasi =====
let modalOverlay = document.getElementById('modalOverlay');
let modalCloseBtn = document.getElementById('modalCloseBtn');
let notifyButtons = document.querySelectorAll('.notify-btn');

notifyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        modalOverlay.classList.add('show');
    });
});

if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('show');
    });
}

if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('show');
        }
    });
}

// Inisialisasi Aplikasi
renderSongs(songs);
setupSearch();
renderHistory();