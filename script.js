let play = document.getElementById('play');
let progressBar = document.getElementById('progressBar');

const songs = [
    { id: 1, songName: "LEGACY", songDes: "PIXY", songImage: "Art Cover/LEGACY.webp", songPath: "Lagu/SpotiDown.App - LEGACY - PIXY.mp3" },
    { id: 2, songName: "2 On (feat. ScHoolboy Q)", songDes: "Tinashe", songImage: "Art Cover/2 On (feat. ScHoolboy Q).webp", songPath: "Lagu/2 On (feat. ScHoolboy Q).mp3" },
    { id: 3, songName: "After Dark x Sweater Weather", songDes: "mikeeysmind", songImage: "Art Cover/After Dark x Sweater Weather.webp", songPath: "Lagu/After Dark x Sweater Weather.mp3" },
    { id: 4, songName: "After Hours", songDes: "The Weeknd", songImage: "Art Cover/After Hours.webp", songPath: "Lagu/After Hours.mp3" },
    { id: 5, songName: "Baby By Me", songDes: "50 Cent", songImage: "Art Cover/Before I Self-Destruct.webp", songPath: "Lagu/Baby By Me.mp3" },
    { id: 6, songName: "Big Boys", songDes: "Elysees", songImage: "Art Cover/Big Boys.webp", songPath: "Lagu/Big Boys.mp3" },
    { id: 7, songName: "Harvey", songDes: "Her's", songImage: "Art Cover/SpotiDown.App - Harvey - Her_s.webp", songPath: "Lagu/SpotiDown.App - Harvey - Her_s.mp3" },
    { id: 8, songName: "bloodline", songDes: "Ariana Grande", songImage: "Art Cover/thank u, next.webp", songPath: "Lagu/bloodline.mp3" },
    { id: 9, songName: "Brooklyn Baby", songDes: "Lana Del Rey", songImage: "Art Cover/Ultraviolence (Deluxe).webp", songPath: "Lagu/Brooklyn Baby.mp3" },
    { id: 10, songName: "Call Out My Name", songDes: "The Weeknd", songImage: "Art Cover/My Dear Melancholy,.webp", songPath: "Lagu/Call Out My Name.mp3" },
    { id: 11, songName: "CLEARED - Remix (Slowed)", songDes: "Lilithzplug", songImage: "Art Cover/CLEARED - Remix (Slowed _ Sped Up).webp", songPath: "Lagu/CLEARED - Remix (Slowed).mp3" },
    { id: 12, songName: "Collide (feat. Tyga)", songDes: "Justine Skye", songImage: "Art Cover/Dark Side.webp", songPath: "Lagu/Collide (feat. Tyga).mp3" },
    { id: 13, songName: "Coming Down", songDes: "The Weeknd", songImage: "Art Cover/House Of Balloons (Original).webp", songPath: "Lagu/Coming Down.mp3" },
    { id: 14, songName: "Confident", songDes: "Justin Bieber, Chance the Rapper", songImage: "Art Cover/Journals.webp", songPath: "Lagu/Confident.mp3" },
    { id: 15, songName: "Dark Beach", songDes: "Pastel Ghost", songImage: "Art Cover/Abyss.webp", songPath: "Lagu/Dark Beach.mp3" },
    { id: 16, songName: "Die For You", songDes: "The Weeknd", songImage: "Art Cover/Starboy.webp", songPath: "Lagu/Die For You.mp3" },
    { id: 17, songName: "Flatline", songDes: "Justin Bieber", songImage: "Art Cover/Journals.webp", songPath: "Lagu/Flatline.mp3" },
    { id: 18, songName: "Floki x Lost Soul", songDes: "NBSPLV", songImage: "Art Cover/Floki x Lost Soul.webp", songPath: "Lagu/Floki x Lost Soul.mp3" },
    { id: 19, songName: "Fluxxwave", songDes: "Clovis Reyes", songImage: "Art Cover/Fluxxwave.webp", songPath: "Lagu/Fluxxwave.mp3" },
    { id: 20, songName: "Gata Only", songDes: "FloyyMenor, Cris Mj", songImage: "Art Cover/Gata Only.webp", songPath: "Lagu/Gata Only.mp3" },
    { id: 21, songName: "Girl You Loud", songDes: "Chris Brown, Tyga", songImage: "Art Cover/Girl You Loud.webp", songPath: "Lagu/Girl You Loud.mp3" },
    { id: 22, songName: "intro (end of the world)", songDes: "Ariana Grande", songImage: "Art Cover/intro (end of the world).webp", songPath: "Lagu/intro (end of the world).mp3" },
    { id: 23, songName: "Good For You", songDes: "Selena Gomez", songImage: "Art Cover/Revival (Deluxe).webp", songPath: "Lagu/Good For You.mp3" },
    { id: 24, songName: "Hotel Room", songDes: "Pitbull", songImage: "Art Cover/Hotel Room.webp", songPath: "Lagu/Hotel Room.mp3" },
    { id: 25, songName: "HYPNOTIC DATA", songDes: "Odetari", songImage: "Art Cover/HYPNOTIC DATA 2.0.webp", songPath: "Lagu/HYPNOTIC DATA.mp3" },
    { id: 26, songName: "I Wanna Be Yours", songDes: "Arctic Monkeys", songImage: "Art Cover/AM.webp", songPath: "Lagu/I Wanna Be Yours.mp3" },
    { id: 27, songName: "I Was Never There", songDes: "The Weeknd", songImage: "Art Cover/My Dear Melancholy,.webp", songPath: "Lagu/I Was Never There.mp3" },
    { id: 28, songName: "Innocence", songDes: "NERO", songImage: "Art Cover/Innocence.webp", songPath: "Lagu/Innocence.mp3" },
    { id: 29, songName: "Let Me Love You", songDes: "Mario", songImage: "Art Cover/Encore.webp", songPath: "Lagu/Let Me Love You.mp3" },
    { id: 30, songName: "do you think you could love me", songDes: "yung kai", songImage: "Art Cover/do you think you could love me_.webp", songPath: "Lagu/do you think you could love me_.mp3" },
    { id: 31, songName: "love for you", songDes: "Joji", songImage: "Art Cover/love for you.webp", songPath: "Lagu/love for you.mp3" },
    { id: 32, songName: "Love Me Not", songDes: "Ravyn Lenae, Rex Orange County", songImage: "Art Cover/Love Me Not (feat. Rex Orange County).webp", songPath: "Lagu/Love Me Not (feat. Rex Orange County).mp3" },
    { id: 33, songName: "Love Potions", songDes: "BJ Lips, princess paparazzi", songImage: "Art Cover/Cum n Cocaine.webp", songPath: "Lagu/Love Potions.mp3" },
    { id: 34, songName: "Lovers Rock", songDes: "TV Girl", songImage: "Art Cover/French Exit.webp", songPath: "Lagu/Lovers Rock.mp3" },
    { id: 35, songName: "M a k e I t T o T h e M o r n i n g", songDes: "PARTYNEXTDOOR", songImage: "Art Cover/make it to morning.webp", songPath: "Lagu/M a k e I t T o T h e M o r n i n g.mp3" },
    { id: 36, songName: "MEMORIZING - SLOWED", songDes: "DJ DELACROIX, OXXED, Wintherduud", songImage: "Art Cover/CLEARED - Remix (Slowed _ Sped Up).webp", songPath: "Lagu/MEMORIZING - SLOWED.mp3" },
    { id: 37, songName: "Mimosa 2000", songDes: "Furacão 2000, Nyasia", songImage: "Art Cover/April Mixtape 3.webp", songPath: "Lagu/Mimosa 2000.mp3" },
    { id: 38, songName: "Mind Games", songDes: "Sickick", songImage: "Art Cover/Mind Games.webp", songPath: "Lagu/Mind Games.mp3" },
    { id: 39, songName: "Money Trees", songDes: "Kendrick Lamar, Jay Rock", songImage: "Art Cover/good kid, m.A.A.d city.webp", songPath: "Lagu/Money Trees.mp3" },
    { id: 40, songName: "About You", songDes: "The 1975", songImage: "Art Cover/About You.webp", songPath: "Lagu/About You.mp3" },
    { id: 41, songName: "Moonlight", songDes: "Kali Uchis", songImage: "Art Cover/Red Moon In Venus.webp", songPath: "Lagu/Moonlight.mp3" },
    { id: 42, songName: "Iris", songDes: "Pastel Ghost", songImage: "Art Cover/SpotiDown.App - Iris - Pastel Ghost.webp", songPath: "Lagu/SpotiDown.App - Iris - Pastel Ghost.mp3" },
    { id: 43, songName: "No. 1 Party Anthem", songDes: "Arctic Monkeys", songImage: "Art Cover/AM.webp", songPath: "Lagu/No. 1 Party Anthem.mp3" },
    { id: 44, songName: "nuts (feat. Rainy Bear)", songDes: "Lil Peep", songImage: "Art Cover/nuts (feat. Rainy Bear).webp", songPath: "Lagu/nuts (feat. Rainy Bear).mp3" },
    { id: 45, songName: "505", songDes: "Arctic Monkeys", songImage: "Art Cover/505.webp", songPath: "Lagu/obsessed - slowed + reverb.mp3" },
    { id: 46, songName: "Obsessed", songDes: "Mariah Carey", songImage: "Art Cover/Memoirs of an imperfect Angel (International Version).webp", songPath: "Lagu/Obsessed.mp3" },
    { id: 47, songName: "Paparazzi", songDes: "Lady Gaga", songImage: "Art Cover/The Fame.webp", songPath: "Lagu/Paparazzi.mp3" },
    { id: 48, songName: "PELIGROSA", songDes: "J Balvin, Wisin & Yandel", songImage: "Art Cover/EL COMIENZO.webp", songPath: "Lagu/PELIGROSA.mp3" },
    { id: 49, songName: "poster boy", songDes: "Lyn Lapid", songImage: "Art Cover/2.webp", songPath: "Lagu/poster boy.mp3" },
    { id: 50, songName: "Imposter Sydrome", songDes: "Sidney Gish", songImage: "Art Cover/Imposter Sydrome.webp", songPath: "Lagu/Imposter Sydrome.mp3" },
    { id: 51, songName: "Tip Toe", songDes: "HYBS", songImage: "Art Cover/Tip Toe.webp", songPath: "Lagu/Tip Toe.mp3" },
    { id: 52, songName: "Good Looking", songDes: "Suki Waterhouse", songImage: "Art Cover/Good Looking.webp", songPath: "Lagu/Good Looking.mp3" },
    { id: 53, songName: "Say Yes To Heaven", songDes: "Lana Del Rey", songImage: "Art Cover/Say Yes To Heaven.webp", songPath: "Lagu/Say Yes To Heaven.mp3" },
    { id: 54, songName: "Skyfall", songDes: "Adele", songImage: "Art Cover/Skyfall.webp", songPath: "Lagu/Skyfall.mp3" },
    { id: 55, songName: "SMOKE IT OFF!", songDes: "Lumi Athena, jnhygs", songImage: "Art Cover/SMOKE IT OFF!.webp", songPath: "Lagu/SMOKE IT OFF!.mp3" },
    { id: 56, songName: "That's What I Like", songDes: "Bruno Mars", songImage: "Art Cover/24K Magic.webp", songPath: "Lagu/That's What I Like.mp3" },
    { id: 57, songName: "Timeless (feat Playboi Carti)", songDes: "The Weeknd, Playboi Carti", songImage: "Art Cover/After Hours.webp", songPath: "Lagu/Timeless (feat Playboi Carti).mp3" },
    { id: 58, songName: "Under Your Spell", songDes: "Desire", songImage: "Art Cover/under your spell.webp", songPath: "Lagu/Under Your Spell.mp3" },
    { id: 59, songName: "VISION", songDes: "VALORANT, Grabbitz", songImage: "Art Cover/Dark Side.webp", songPath: "Lagu/VISION.mp3" },
    { id: 60, songName: "West Coast", songDes: "Lana Del Rey", songImage: "Art Cover/AM.webp", songPath: "Lagu/West Coast.mp3" },
    { id: 61, songName: "Wutiwant X Love Potions LQ", songDes: "Potions, Auralyx, Evangeline <3", songImage: "Art Cover/Wutiwant X Love Potions LQ.webp", songPath: "Lagu/Wutiwant X Love Potions LQ.mp3" },
    { id: 62, songName: "AEAO", songDes: "Dynamicduo, CHEN", songImage: "Art Cover/aeao.webp", songPath: "Lagu/AEAO.mp3" },
    { id: 63, songName: "Apocalypse", songDes: "Cigarettes After Sex", songImage: "Art Cover/apocallypse.webp", songPath: "Lagu/Apocalypse.mp3" },
    { id: 64, songName: "Back to Friends", songDes: "sombr", songImage: "Art Cover/back to friends.webp", songPath: "Lagu/back to friends.mp3" },
    { id: 65, songName: "Beauty And A Beat", songDes: "Justin Bieber, Nicki Minaj", songImage: "Art Cover/Believe (Deluxe Edition).webp", songPath: "Lagu/SpotiDown.App - Beauty And A Beat - Justin Bieber.mp3" },
    { id: 66, songName: "BIRDS OF A FEATHER", songDes: "Billie Eilish", songImage: "Art Cover/birds of feather.webp", songPath: "Lagu/BIRDS OF A FEATHER.mp3" },
    { id: 67, songName: "boyfriend (with Social House)", songDes: "Ariana Grande, Social House", songImage: "Art Cover/boyfriend.webp", songPath: "Lagu/boyfriend (with Social House).mp3" },
    { id: 68, songName: "Into You X bye", songDes: "Ariana Grande", songImage: "Art Cover/Into You X bye.webp", songPath: "Lagu/Into You X bye (altare remix) - Ariana Grande (mashup).mp3" },
    { id: 69, songName: "bye", songDes: "Ariana Grande", songImage: "Art Cover/bye.webp", songPath: "Lagu/bye.mp3" },
    { id: 70, songName: "Don't Copy My Flow", songDes: "Snoop Dogg", songImage: "Art Cover/Don't Copy My Flow.webp", songPath: "Lagu/Don't Copy My Flow.mp3" },
    { id: 71, songName: "Earrings", songDes: "Malcolm Todd", songImage: "Art Cover/earnings.webp", songPath: "Lagu/Earrings.mp3" },
    { id: 72, songName: "End of Beginning", songDes: "Djo", songImage: "Art Cover/end of beggining.webp", songPath: "Lagu/End of Beginning.mp3" },
    { id: 73, songName: "Everyday", songDes: "Ariana Grande, Future", songImage: "Art Cover/everyday.webp", songPath: "Lagu/Everyday.mp3" },
    { id: 74, songName: "Heaven Sent", songDes: "Keyshia Cole", songImage: "Art Cover/heaven sent.webp", songPath: "Lagu/Heaven Sent.mp3" },
    { id: 75, songName: "NVMD", songDes: "Denise Julia", songImage: "Art Cover/SpotiDown.App - NVMD - Denise Julia.webp", songPath: "Lagu/SpotiDown.App - NVMD - Denise Julia.mp3" },
    { id: 76, songName: "Into It", songDes: "Chase Atlantic", songImage: "Art Cover/Into it.webp", songPath: "Lagu/Into It.mp3" },
    { id: 77, songName: "Love Me Harder", songDes: "Ariana Grande, The Weeknd", songImage: "Art Cover/love me harder.webp", songPath: "Lagu/Love Me Harder.mp3" },
    { id: 78, songName: "Love Me", songDes: "Justin Bieber", songImage: "Art Cover/love me.webp", songPath: "Lagu/Love Me.mp3" },
    { id: 79, songName: "love.", songDes: "wave to earth", songImage: "Art Cover/love..webp", songPath: "Lagu/love..mp3" },
    { id: 80, songName: "M.", songDes: "Anıl Emre Daldal", songImage: "Art Cover/M_.webp", songPath: "Lagu/M..mp3" },
    { id: 81, songName: "Merry Christmas, Please Don't Call", songDes: "Bleachers", songImage: "Art Cover/Merry Christmas, Please Don't Call.webp", songPath: "Lagu/Merry Christmas, Please Don't Call.mp3" },
    { id: 82, songName: "My Love Mine All Mine", songDes: "Mitski", songImage: "Art Cover/my love mine all mine.webp", songPath: "Lagu/My Love Mine All Mine.mp3" },
    { id: 83, songName: "No One Noticed", songDes: "The Marías", songImage: "Art Cover/no one noticed.webp", songPath: "Lagu/No One Noticed.mp3" },
    { id: 84, songName: "Not Around", songDes: "Nova", songImage: "Art Cover/Not Around.webp", songPath: "Lagu/Not Around.mp3" },
    { id: 85, songName: "Something About You", songDes: "Eyedress, Dent May", songImage: "Art Cover/Something About You.webp", songPath: "Lagu/Something About You.mp3" },
    { id: 86, songName: "Shadows", songDes: "Pastel Ghost", songImage: "Art Cover/Shadows EP.webp", songPath: "Lagu/Shadows.mp3" },
    { id: 87, songName: "supernatural", songDes: "Ariana Grande", songImage: "Art Cover/supernatural.webp", songPath: "Lagu/supernatural.mp3" },
    { id: 88, songName: "Swim", songDes: "Chase Atlantic", songImage: "Art Cover/swim.webp", songPath: "Lagu/Swim.mp3" },
    { id: 89, songName: "we can't be friends (wait for your love)", songDes: "Ariana Grande", songImage: "Art Cover/supernatural.webp", songPath: "Lagu/we can't be friends (wait for your love).mp3" },
    { id: 90, songName: "What If I Call", songDes: "Charlie Burg", songImage: "Art Cover/What If I Call.webp", songPath: "Lagu/What If I Call.mp3" },
    { id: 91, songName: "worry - Slowed", songDes: "LONOWN, riserayss", songImage: "Art Cover/worry.webp", songPath: "Lagu/worry - Slowed.mp3" }
];

// Tampilan mobile aktif kalau layar <= 768px ATAU perangkat layar sentuh
const mobileQuery = window.matchMedia('(max-width: 768px), (hover: none) and (pointer: coarse)');
const isMobileView = () => mobileQuery.matches;

function fitMobileScale() {
    const root = document.documentElement;
    const ratio = window.innerWidth / window.screen.width;

    if (isMobileView() && ratio > 1.2) {
        root.style.fontSize = `${16 * ratio}px`;
    } else {
        root.style.fontSize = '';
    }
}

fitMobileScale();
window.addEventListener('resize', fitMobileScale);
window.addEventListener('orientationchange', fitMobileScale);

let order = [...songs];
let currentIndex = 0;
let audio = new Audio(order[currentIndex].songPath);
audio.preload = "none";

let currentTimeEl = document.getElementById('currentTime');
let durationEl = document.getElementById('duration');
let nowBar = document.querySelector('.now-bar');
let playerBar = document.querySelector('.player-bar');
let nowPlayingPanel = document.querySelector('.now-playing-panel');

// ===== Mini player (mobile) refs =====
let miniPlay = document.getElementById('miniPlay');
let miniProgressFill = document.getElementById('miniProgressFill');
let miniShuffle = document.getElementById('miniShuffle');
let miniRepeat = document.getElementById('miniRepeat');

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

// ===== Playlist (localStorage) =====
const PLAYLIST_KEY = 'spotiware_playlists';
const LIKED_PLAYLIST_ID = 'liked_songs';
let pendingSongIdForPlaylist = null;

const homeSection1Title = document.querySelector('#section-1')?.closest('.music-section')?.querySelector('h2')?.textContent || '';

function getPlaylists() {
    try {
        return JSON.parse(localStorage.getItem(PLAYLIST_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function savePlaylists(playlists) {
    localStorage.setItem(PLAYLIST_KEY, JSON.stringify(playlists));
}

function createPlaylist(name) {
    const playlists = getPlaylists();
    const newPlaylist = { id: 'pl_' + Date.now(), name: name.trim() || 'Playlist Baru', songIds: [] };
    playlists.push(newPlaylist);
    savePlaylists(playlists);
    return newPlaylist;
}

function deletePlaylist(playlistId) {
    savePlaylists(getPlaylists().filter(p => p.id !== playlistId));
}

function addSongToPlaylist(playlistId, songId) {
    const playlists = getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist && !playlist.songIds.includes(songId)) {
        playlist.songIds.push(songId);
        savePlaylists(playlists);
    }
}

function removeSongFromPlaylist(playlistId, songId) {
    const playlists = getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
        playlist.songIds = playlist.songIds.filter(id => id !== songId);
        savePlaylists(playlists);
    }
}

function getSongsInPlaylist(playlist) {
    return playlist.songIds.map(id => songs.find(s => s.id === id)).filter(Boolean);
}

function ensureLikedPlaylist() {
    const playlists = getPlaylists();
    if (!playlists.find(p => p.id === LIKED_PLAYLIST_ID)) {
        playlists.unshift({ id: LIKED_PLAYLIST_ID, name: 'Liked Songs', songIds: [] });
        savePlaylists(playlists);
    }
}

function isSongLiked(songId) {
    const liked = getPlaylists().find(p => p.id === LIKED_PLAYLIST_ID);
    return liked ? liked.songIds.includes(songId) : false;
}

function toggleLikedSong(songId) {
    ensureLikedPlaylist();
    if (isSongLiked(songId)) {
        removeSongFromPlaylist(LIKED_PLAYLIST_ID, songId);
    } else {
        addSongToPlaylist(LIKED_PLAYLIST_ID, songId);
    }
    renderPlaylistList();
}

let libraryFilterQuery = '';

function renderPlaylistList() {
    const playlistListEl = document.getElementById('playlistList');
    if (!playlistListEl) return;
    ensureLikedPlaylist();

    const playlists = getPlaylists();
    const liked = playlists.find(p => p.id === LIKED_PLAYLIST_ID);
    let others = playlists.filter(p => p.id !== LIKED_PLAYLIST_ID);

    if (libraryFilterQuery) {
        others = others.filter(p => p.name.toLowerCase().includes(libraryFilterQuery));
    }

    let html = '';

    if (liked && (!libraryFilterQuery || 'liked songs'.includes(libraryFilterQuery))) {
        html += `
            <div class="history-item playlist-item liked-songs" data-playlist-id="${liked.id}">
                <div class="playlist-icon"><i class="fa-solid fa-heart"></i></div>
                <div class="history-info">
                    <div class="history-title">Liked Songs</div>
                    <div class="history-artist">Playlist • ${liked.songIds.length} lagu</div>
                </div>
            </div>
        `;
    }

    if (librarySortMode === 'alpha' || librarySortMode === 'creator') {
        others = [...others].sort((a, b) => a.name.localeCompare(b.name));
    } else if (librarySortMode === 'recents') {
        others = [...others].reverse();
    }

    if (others.length === 0) {
        html += `<div class="history-empty">${libraryFilterQuery ? 'Playlist tidak ditemukan.' : 'Belum ada playlist. Bikin dulu yuk!'}</div>`;
    } else {
        html += others.map(p => {
            const songsInP = getSongsInPlaylist(p);
            const coverImg = songsInP.length > 0 ? songsInP[0].songImage : null;
            const thumbHTML = coverImg
                ? `<img class="playlist-thumb" src="${coverImg}" alt="${p.name}">`
                : `<div class="playlist-icon"><i class="fa-solid fa-music"></i></div>`;
            return `
                <div class="history-item playlist-item" data-playlist-id="${p.id}">
                    ${thumbHTML}
                    <div class="history-info">
                        <div class="history-title">${p.name}</div>
                        <div class="history-artist">Playlist • ${p.songIds.length} lagu</div>
                    </div>
                    <button class="playlist-delete-btn" data-playlist-id="${p.id}" title="Hapus playlist">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');
    }

    playlistListEl.innerHTML = html;

    playlistListEl.querySelectorAll('.playlist-item[data-playlist-id]').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.playlist-delete-btn')) return;
            const playlist = getPlaylists().find(p => p.id === item.dataset.playlistId);
            if (playlist) openPlaylistDetailView(playlist, playlist.id === LIKED_PLAYLIST_ID);
        });
    });

    playlistListEl.querySelectorAll('.playlist-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Hapus playlist ini?')) {
                deletePlaylist(btn.dataset.playlistId);
                renderPlaylistList();
            }
        });
    });
}

function openPlaylistDetail(playlist) {
    const songsInPlaylist = getSongsInPlaylist(playlist);
    renderSongs(songsInPlaylist, { playlistId: playlist.id });
    toggleSectionTitles(false);

    const sec1Title = document.querySelector('#section-1')?.closest('.music-section')?.querySelector('h2');
    if (sec1Title) sec1Title.textContent = playlist.name;

    if (mainRightPart) mainRightPart.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (mainLeftPart) mainLeftPart.classList.remove('mobile-show');
    if (mainRightPart) mainRightPart.classList.remove('mobile-hide');
}

function openAddToPlaylistModal(songId) {
    pendingSongIdForPlaylist = songId;
    renderAddToPlaylistList();
    document.getElementById('addToPlaylistModal').classList.add('show');
}

function renderAddToPlaylistList() {
    const listEl = document.getElementById('addToPlaylistList');
    const playlists = getPlaylists().filter(p => p.id !== LIKED_PLAYLIST_ID);

    if (playlists.length === 0) {
        listEl.innerHTML = `<div class="history-empty">Belum ada playlist. Buat dulu di bawah.</div>`;
        return;
    }

    listEl.innerHTML = playlists.map(p => {
        const already = p.songIds.includes(pendingSongIdForPlaylist);
        return `
            <div class="add-to-playlist-row">
                <span>${p.name} (${p.songIds.length})</span>
                <button class="playlist-toggle-btn ${already ? 'in-playlist' : ''}" data-playlist-id="${p.id}">
                    ${already ? 'Sudah masuk ✓' : 'Tambah'}
                </button>
            </div>
        `;
    }).join('');

    listEl.querySelectorAll('.playlist-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const playlistId = btn.dataset.playlistId;
            const playlist = getPlaylists().find(p => p.id === playlistId);
            if (!playlist) return;
            if (playlist.songIds.includes(pendingSongIdForPlaylist)) {
                removeSongFromPlaylist(playlistId, pendingSongIdForPlaylist);
            } else {
                addSongToPlaylist(playlistId, pendingSongIdForPlaylist);
            }
            renderAddToPlaylistList();
            renderPlaylistList();
        });
    });
}

function attachPlaylistButtonEvents() {
    document.querySelectorAll('.remove-from-playlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const songId = parseInt(btn.dataset.songId);
            const playlistId = btn.dataset.playlistId;
            removeSongFromPlaylist(playlistId, songId);
            const playlist = getPlaylists().find(p => p.id === playlistId);
            if (playlist) openPlaylistDetail(playlist);
            renderPlaylistList();
        });
    });
}

function renderSongs(songsToRender, options = {}) {
    const { playlistId = null } = options;

    let sec1 = document.getElementById('section-1');
    let sec2 = document.getElementById('section-2');
    let sec3 = document.getElementById('section-3');

    if (sec1) sec1.innerHTML = '';
    if (sec2) sec2.innerHTML = '';
    if (sec3) sec3.innerHTML = '';

    songsToRender.forEach((song, index) => {
        const playlistBtnHTML = playlistId
            ? `<button class="remove-from-playlist-btn" data-song-id="${song.id}" data-playlist-id="${playlistId}" title="Hapus dari playlist"><i class="fa-solid fa-xmark"></i></button>`
            : '';

        let cardHTML = `
            <div class="music-card" data-song-id="${song.id}">
                <img src="${song.songImage}" alt="${song.songName}" loading="lazy" decoding="async">
                <div class="music-play-btn">
                    <i id="${song.id}" class="playMusic fa-solid fa-circle-play" data-audio="${song.songPath}"></i>
                </div>
                ${playlistBtnHTML}
                <div class="img-title">${song.songName}</div>
                <div class="img-description">${song.songDes}</div>
            </div>
        `;

        if (playlistId) {
            if (sec1) sec1.innerHTML += cardHTML;
        } else if (index < 30) {
            if (sec1) sec1.innerHTML += cardHTML;
        } else if (index < 60) {
            if (sec2) sec2.innerHTML += cardHTML;
        } else {
            if (sec3) sec3.innerHTML += cardHTML;
        }
    });

    const allSections = document.querySelectorAll('.music-section');
    if (allSections.length >= 3) {
        allSections[1].style.display = playlistId ? 'none' : '';
        allSections[2].style.display = playlistId ? 'none' : '';
    }

    attachPlayEvents();
    attachPlaylistButtonEvents();
}

function attachPlayEvents() {
    let playMusicList = Array.from(document.getElementsByClassName('playMusic'));
    playMusicList.forEach((element) => {
        element.addEventListener('click', (e) => {
            let clickedId = parseInt(e.target.id);

            if (getCurrentSong().id === clickedId && playerBar.classList.contains('show')) {
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
    if (npFullscreenBg) npFullscreenBg.style.backgroundImage = `url("${encodeURI(song.songImage)}")`;
}

function updateNowBar() {
    let song = getCurrentSong();
    nowBar.getElementsByTagName('img')[0].src = song.songImage;
    nowBar.getElementsByClassName('img-title-info')[0].innerText = song.songName;
    nowBar.getElementsByClassName('img-des-info')[0].innerText = song.songDes;
    updateNowPlayingPanel();
    updateNowBarLikeIcon();
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
            <img src="${song.songImage}" alt="${song.songName}" loading="lazy" decoding="async">
            <div class="history-info">
                <div class="history-title">${song.songName}</div>
                <div class="history-artist">${song.songDes}</div>
            </div>
        </div>
    `).join('');

    historyList.querySelectorAll('.history-item').forEach((item) => {
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
    if (miniPlay) {
        miniPlay.classList.remove('fa-play');
        miniPlay.classList.add('fa-pause');
    }
});

audio.addEventListener('pause', () => {
    if (npPlay) {
        npPlay.classList.remove('fa-pause');
        npPlay.classList.add('fa-play');
    }
    if (miniPlay) {
        miniPlay.classList.remove('fa-pause');
        miniPlay.classList.add('fa-play');
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

        if (miniProgressFill) miniProgressFill.style.width = `${progress}%`;
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
        this.style.background = `linear-gradient(to right, var(--fg) ${value}%, #555 ${value}%)`;
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

if (miniPlay) {
    miniPlay.addEventListener('click', (e) => {
        e.stopPropagation();
        play.click();
    });
}

if (miniShuffle) {
    miniShuffle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (shuffle) shuffle.click();
    });
}

if (miniRepeat) {
    miniRepeat.addEventListener('click', (e) => {
        e.stopPropagation();
        if (repeat) repeat.click();
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
            if (miniShuffle) miniShuffle.classList.add('active');
            if (miniRepeat) miniRepeat.classList.remove('active');
            order = shuffleSongs(songs);
        } else {
            songOnShuffle = false;
            shuffle.classList.remove('active');
            if (miniShuffle) miniShuffle.classList.remove('active');
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
            if (miniRepeat) miniRepeat.classList.add('active');
            if (miniShuffle) miniShuffle.classList.remove('active');
            order = [...songs];
        } else {
            songOnRepeat = false;
            repeat.classList.remove('active');
            if (miniRepeat) miniRepeat.classList.remove('active');
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
    npBackBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (document.fullscreenElement) document.exitFullscreen();
        if (nowPlayingPanel) nowPlayingPanel.classList.remove('mobile-open');
        const bottomNavEl = document.querySelector('.bottom-nav');
        if (bottomNavEl) bottomNavEl.style.display = '';
    });
}

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

// ===== Tombol panah kiri/kanan di tiap baris lagu (desktop) =====
document.querySelectorAll('.songs-wrapper').forEach((wrapper) => {
    let track = wrapper.querySelector('.songs');
    let nextBtn = wrapper.querySelector('.next-btn');
    let prevBtn = wrapper.querySelector('.prev-btn');

    if (!track) return;

    function getCardStep() {
        let card = track.querySelector('.music-card');
        if (!card) return 700;
        let style = window.getComputedStyle(card);
        let marginRight = parseFloat(style.marginRight) || 0;
        return card.offsetWidth + marginRight + 16;
    }

    function updateButtonVisibility() {
        let maxScrollLeft = track.scrollWidth - track.clientWidth;

        if (prevBtn) {
            prevBtn.style.display = track.scrollLeft <= 1 ? 'none' : 'flex';
        }

        if (nextBtn) {
            nextBtn.style.display = track.scrollLeft >= maxScrollLeft - 1 ? 'none' : 'flex';
        }
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            track.scrollBy({ left: getCardStep() * 3, behavior: 'smooth' });
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            track.scrollBy({ left: -getCardStep() * 3, behavior: 'smooth' });
        });
    }

    track.addEventListener('scroll', updateButtonVisibility);
    setTimeout(updateButtonVisibility, 100);
});

// ===== Kembali ke tampilan awal =====
let mainRightPart = document.querySelector('.main-right-part');

function goHome() {
    closePlaylistDetailView();
    let searchInputEl = document.querySelector('.input-box');
    if (searchInputEl) searchInputEl.value = '';

    renderSongs(songs);
    toggleSectionTitles(false);

    const sec1Title = document.querySelector('#section-1')?.closest('.music-section')?.querySelector('h2');
    if (sec1Title) sec1Title.textContent = homeSection1Title;

    if (mainRightPart) {
        mainRightPart.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

let homeIcon = document.querySelector('.home-icon');
if (homeIcon) {
    homeIcon.addEventListener('click', goHome);
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

// ===== Bottom Nav (mobile) =====
let bottomNavItems = document.querySelectorAll('.bottom-nav-item[data-target]');
let mainLeftPart = document.querySelector('.main-left-part');

bottomNavItems.forEach((item) => {
    item.addEventListener('click', () => {
        let target = item.dataset.target;

        bottomNavItems.forEach((el) => el.classList.remove('active'));
        item.classList.add('active');

        if (target === 'home') {
            if (mainLeftPart) mainLeftPart.classList.remove('mobile-show');
            if (mainRightPart) mainRightPart.classList.remove('mobile-hide');
            goHome();
        }

        if (target === 'library') {
            if (mainLeftPart) mainLeftPart.classList.add('mobile-show');
            if (mainRightPart) mainRightPart.classList.add('mobile-hide');
            renderPlaylistList();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
});

// ===== Mini player -> buka Now Playing layar penuh (mobile) =====
let nowBarLikeBtn = document.getElementById('nowBarLikeBtn');

function updateNowBarLikeIcon() {
    if (!nowBarLikeBtn) return;
    const song = getCurrentSong();
    const icon = nowBarLikeBtn.querySelector('i');
    if (song && isSongLiked(song.id)) {
        nowBarLikeBtn.classList.add('liked');
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
    } else {
        nowBarLikeBtn.classList.remove('liked');
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
    }
}

if (nowBarLikeBtn) {
    nowBarLikeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLikedSong(getCurrentSong().id);
        updateNowBarLikeIcon();
    });
}

if (playerBar && nowPlayingPanel) {
    playerBar.addEventListener('click', (e) => {
        if (e.target.closest('.mini-controls, .music-controller, .now-bar-like-btn')) return;

        if (isMobileView()) {
            nowPlayingPanel.classList.add('mobile-open');
            const bottomNavEl = document.querySelector('.bottom-nav');
            if (bottomNavEl) bottomNavEl.style.display = 'none';
            if (nowPlayingPanel.requestFullscreen) {
                nowPlayingPanel.requestFullscreen().catch(() => {});
            }
        }
    });
}

// ===== Tombol expand di header Library =====
let libraryExpandBtn = document.getElementById('libraryExpandBtn');
let mainEl = document.querySelector('.main');
if (libraryExpandBtn && mainEl) {
    libraryExpandBtn.addEventListener('click', () => {
        mainEl.classList.toggle('library-expanded');
        const icon = libraryExpandBtn.querySelector('i');
        if (mainEl.classList.contains('library-expanded')) {
            icon.classList.remove('fa-up-right-and-down-left-from-center');
            icon.classList.add('fa-down-left-and-up-right-to-center');
        } else {
            icon.classList.remove('fa-down-left-and-up-right-to-center');
            icon.classList.add('fa-up-right-and-down-left-from-center');
        }
    });
}

document.getElementById('newPlaylistBtn')?.addEventListener('click', () => {
    const name = prompt('Nama playlist baru:');
    if (name && name.trim()) {
        createPlaylist(name.trim());
        renderPlaylistList();
    }
});

document.getElementById('libraryFilterBtn')?.addEventListener('click', () => {
    const input = document.getElementById('libraryFilterInput');
    if (!input) return;
    input.classList.toggle('show');
    if (input.classList.contains('show')) {
        input.focus();
    } else {
        input.value = '';
        libraryFilterQuery = '';
        renderPlaylistList();
    }
});

document.getElementById('libraryFilterInput')?.addEventListener('input', (e) => {
    libraryFilterQuery = e.target.value.toLowerCase().trim();
    renderPlaylistList();
});

document.getElementById('createPlaylistInlineBtn')?.addEventListener('click', () => {
    const input = document.getElementById('newPlaylistNameInput');
    const name = input.value.trim();
    if (!name) return;
    const newPlaylist = createPlaylist(name);
    addSongToPlaylist(newPlaylist.id, pendingSongIdForPlaylist);
    input.value = '';
    renderAddToPlaylistList();
    renderPlaylistList();
});

document.getElementById('addToPlaylistCloseBtn')?.addEventListener('click', () => {
    document.getElementById('addToPlaylistModal').classList.remove('show');
});

// ===== Modal Riwayat (History) =====
let historyNavBtn = document.getElementById('historyNavBtn');
let historyModal = document.getElementById('historyModal');
let historyModalCloseBtn = document.getElementById('historyModalCloseBtn');

function openHistoryModal() {
    renderHistory();
    if (historyModal) historyModal.classList.add('show');
}

if (historyNavBtn) historyNavBtn.addEventListener('click', openHistoryModal);

if (historyModalCloseBtn) {
    historyModalCloseBtn.addEventListener('click', () => {
        historyModal.classList.remove('show');
    });
}

if (historyModal) {
    historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) historyModal.classList.remove('show');
    });
}

// ===== Context Menu (klik kanan lagu): Add to Library / Add to Playlist =====
let songContextMenu = document.getElementById('songContextMenu');
let ctxAddToLibrary = document.getElementById('ctxAddToLibrary');
let ctxAddToPlaylist = document.getElementById('ctxAddToPlaylist');
let contextMenuSongId = null;

function openSongContextMenu(x, y, songId) {
    contextMenuSongId = songId;
    if (!songContextMenu) return;

    songContextMenu.classList.add('show');

    const menuWidth = songContextMenu.offsetWidth || 200;
    const menuHeight = songContextMenu.offsetHeight || 100;
    const maxX = window.innerWidth - menuWidth - 8;
    const maxY = window.innerHeight - menuHeight - 8;

    songContextMenu.style.left = `${Math.min(x, maxX)}px`;
    songContextMenu.style.top = `${Math.min(y, maxY)}px`;
}

function closeSongContextMenu() {
    if (songContextMenu) songContextMenu.classList.remove('show');
    contextMenuSongId = null;
}

document.addEventListener('contextmenu', (e) => {
    const card = e.target.closest('.music-card');
    const historyItem = e.target.closest('.history-item:not(.playlist-item)');
    const songId = card
        ? parseInt(card.dataset.songId)
        : (historyItem ? parseInt(historyItem.dataset.id) : NaN);

    if (isNaN(songId)) return;

    e.preventDefault();
    openSongContextMenu(e.clientX, e.clientY, songId);
});

document.addEventListener('click', (e) => {
    if (songContextMenu && !songContextMenu.contains(e.target)) {
        closeSongContextMenu();
    }
});

window.addEventListener('scroll', closeSongContextMenu, true);
window.addEventListener('resize', closeSongContextMenu);

if (ctxAddToLibrary) {
    ctxAddToLibrary.addEventListener('click', () => {
        if (contextMenuSongId !== null) toggleLikedSong(contextMenuSongId);
        closeSongContextMenu();
    });
}

if (ctxAddToPlaylist) {
    ctxAddToPlaylist.addEventListener('click', () => {
        if (contextMenuSongId !== null) openAddToPlaylistModal(contextMenuSongId);
        closeSongContextMenu();
    });
}

// ===== Library sort menu =====
let librarySortBtn = document.getElementById('librarySortBtn');
let librarySortMenu = document.getElementById('librarySortMenu');
let librarySortLabel = document.getElementById('librarySortLabel');
let libraryViewMode = 'grid';
let librarySortMode = 'recents';

if (librarySortBtn) {
    librarySortBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        librarySortMenu.classList.toggle('show');
    });
}

document.addEventListener('click', (e) => {
    if (librarySortMenu && librarySortMenu.classList.contains('show') &&
        !librarySortMenu.contains(e.target) && e.target !== librarySortBtn && !librarySortBtn.contains(e.target)) {
        librarySortMenu.classList.remove('show');
    }
});

document.querySelectorAll('.sort-menu-item').forEach(item => {
    item.addEventListener('click', () => {
        librarySortMode = item.dataset.sort;
        document.querySelectorAll('.sort-menu-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        librarySortLabel.textContent = item.textContent;
        renderPlaylistList();
    });
});

document.querySelectorAll('.view-icon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        libraryViewMode = btn.dataset.view;
        document.querySelectorAll('.view-icon-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const playlistListEl = document.getElementById('playlistList');
        if (playlistListEl) {
            playlistListEl.classList.remove('view-list', 'view-compact', 'view-grid', 'view-gridlarge');
            playlistListEl.classList.add('view-' + libraryViewMode);
        }
    });
});

// ===== Playlist Detail View (ala Spotify) =====
function openPlaylistDetailView(playlist, isLiked) {
    const detailView = document.getElementById('playlistDetailView');
    const cover = document.getElementById('playlistDetailCover');
    const title = document.getElementById('playlistDetailTitle');
    const meta = document.getElementById('playlistDetailMeta');
    const tbody = document.getElementById('playlistTrackTableBody');

    const songsInPlaylist = getSongsInPlaylist(playlist);

    title.textContent = playlist.name;
    meta.textContent = `${songsInPlaylist.length} song${songsInPlaylist.length !== 1 ? 's' : ''}`;

    if (isLiked) {
        cover.innerHTML = '<i class="fa-solid fa-heart"></i>';
        cover.style.background = 'linear-gradient(135deg, #450af5, #c4efd9)';
    } else if (songsInPlaylist.length > 0) {
        cover.innerHTML = `<img src="${songsInPlaylist[0].songImage}" alt="">`;
        cover.style.background = '#2f2f2f';
    } else {
        cover.innerHTML = '<i class="fa-solid fa-music"></i>';
        cover.style.background = '#2f2f2f';
    }

    tbody.innerHTML = songsInPlaylist.map((song, idx) => `
        <tr data-song-id="${song.id}">
            <td>${idx + 1}</td>
            <td>
                <div class="track-title-cell">
                    <img src="${song.songImage}" alt="">
                    <div class="track-title-text">
                        <span class="t-name">${song.songName}</span>
                        <span class="t-artist">${song.songDes}</span>
                    </div>
                </div>
            </td>
            <td class="hide-compact">${playlist.name}</td>
            <td class="track-duration" data-song-path="${song.songPath}">--:--</td>
        </tr>
    `).join('');

    tbody.querySelectorAll('.track-duration').forEach(cell => {
        const tempAudio = new Audio();
        tempAudio.preload = 'metadata';
        tempAudio.src = cell.dataset.songPath;
        tempAudio.addEventListener('loadedmetadata', () => {
            cell.textContent = formatTime(tempAudio.duration);
        });
    });

    document.getElementById('playlistPlayBtn').onclick = () => {
        if (songsInPlaylist.length > 0) playSongFromList(songsInPlaylist[0].id, songsInPlaylist);
    };

    document.querySelectorAll('.music-section').forEach(sec => sec.classList.add('hide'));
    detailView.classList.add('show');

    if (mainRightPart) mainRightPart.scrollTo({ top: 0 });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (mainLeftPart) mainLeftPart.classList.remove('mobile-show');
    if (mainRightPart) mainRightPart.classList.remove('mobile-hide');
}

function playSongFromList(songId, songList) {
    order = songList.length > 0 ? [...songList] : [...songs];
    let pos = order.findIndex(s => s.id === songId);
    currentIndex = pos !== -1 ? pos : 0;

    audio.src = getCurrentSong().songPath;
    audio.currentTime = 0;
    audio.play();
    addToHistory(getCurrentSong());

    playerBar.classList.add('show');
    if (nowPlayingPanel) nowPlayingPanel.classList.add('show');

    highlightCurrentSong();
    updateNowBar();
}

function closePlaylistDetailView() {
    const detailView = document.getElementById('playlistDetailView');
    if (detailView) detailView.classList.remove('show');
    document.querySelectorAll('.music-section').forEach(sec => sec.classList.remove('hide'));
}

document.getElementById('playlistDetailBackBtn')?.addEventListener('click', closePlaylistDetailView);

document.getElementById('playlistViewToggle')?.addEventListener('click', () => {
    const table = document.getElementById('playlistTrackTable');
    const label = document.getElementById('playlistViewLabel');
    const isCompact = table.classList.toggle('compact-mode');
    label.textContent = isCompact ? 'Compact' : 'List';
});

document.getElementById('playlistShuffleBtn')?.addEventListener('click', function () {
    this.classList.toggle('active');
});

// Inisialisasi Aplikasi
renderSongs(songs);
setupSearch();
renderHistory();
renderPlaylistList();