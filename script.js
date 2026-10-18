let play = document.getElementById('play');
let progressBar = document.getElementById('progressBar');

const songs = [
    { id: 1, songName: "LEGACY", songDes: "PIXY", songImage: "Art Cover/LEGACY.webp", songPath: "Lagu/SpotiDown.App - LEGACY - PIXY.mp3" },
    { id: 2, songName: "2 On (feat. ScHoolboy Q)", songDes: "Tinashe", songImage: "Art Cover/2 On (feat. ScHoolboy Q).webp", songPath: "Lagu/2 On (feat. ScHoolboy Q).mp3" },
    { id: 3, songName: "After Hours", songDes: "The Weeknd", songImage: "Art Cover/After Hours.webp", songPath: "Lagu/After Hours.mp3" },
    { id: 4, songName: "Baby By Me", songDes: "50 Cent", songImage: "Art Cover/Before I Self-Destruct.webp", songPath: "Lagu/Baby By Me.mp3" },
    { id: 5, songName: "Harvey", songDes: "Her's", songImage: "Art Cover/SpotiDown.App - Harvey - Her_s.webp", songPath: "Lagu/SpotiDown.App - Harvey - Her_s.mp3" },
    { id: 6, songName: "bloodline", songDes: "Ariana Grande", songImage: "Art Cover/thank u, next.webp", songPath: "Lagu/bloodline.mp3" },
    { id: 7, songName: "Brooklyn Baby", songDes: "Lana Del Rey", songImage: "Art Cover/Ultraviolence (Deluxe).webp", songPath: "Lagu/Brooklyn Baby.mp3" },
    { id: 8, songName: "Call Out My Name", songDes: "The Weeknd", songImage: "Art Cover/My Dear Melancholy,.webp", songPath: "Lagu/Call Out My Name.mp3" },
    { id: 9, songName: "Collide (feat. Tyga)", songDes: "Justine Skye", songImage: "Art Cover/Dark Side.webp", songPath: "Lagu/Collide (feat. Tyga).mp3" },
    { id: 10, songName: "Coming Down", songDes: "The Weeknd", songImage: "Art Cover/House Of Balloons (Original).webp", songPath: "Lagu/Coming Down.mp3" },
    { id: 11, songName: "Confident", songDes: "Justin Bieber, Chance the Rapper", songImage: "Art Cover/Journals.webp", songPath: "Lagu/Confident.mp3" },
    { id: 12, songName: "Dark Beach", songDes: "Pastel Ghost", songImage: "Art Cover/Abyss.webp", songPath: "Lagu/Dark Beach.mp3" },
    { id: 13, songName: "Die For You", songDes: "The Weeknd", songImage: "Art Cover/Starboy.webp", songPath: "Lagu/Die For You.mp3" },
    { id: 14, songName: "Flatline", songDes: "Justin Bieber", songImage: "Art Cover/Journals.webp", songPath: "Lagu/Flatline.mp3" },
    { id: 15, songName: "Snowman", songDes: "Sia", songImage: "Art Cover/snowman.webp", songPath: "Lagu/Snowman.mp3" },
    { id: 16, songName: "Gata Only", songDes: "FloyyMenor, Cris Mj", songImage: "Art Cover/Gata Only.webp", songPath: "Lagu/Gata Only.mp3" },
    { id: 17, songName: "Girl You Loud", songDes: "Chris Brown, Tyga", songImage: "Art Cover/Girl You Loud.webp", songPath: "Lagu/Girl You Loud.mp3" },
    { id: 18, songName: "intro (end of the world)", songDes: "Ariana Grande", songImage: "Art Cover/intro (end of the world).webp", songPath: "Lagu/intro (end of the world).mp3" },
    { id: 19, songName: "Good For You", songDes: "Selena Gomez", songImage: "Art Cover/Revival (Deluxe).webp", songPath: "Lagu/Good For You.mp3" },
    { id: 20, songName: "Hotel Room", songDes: "Pitbull", songImage: "Art Cover/Hotel Room.webp", songPath: "Lagu/Hotel Room.mp3" },
    { id: 21, songName: "I Wanna Be Yours", songDes: "Arctic Monkeys", songImage: "Art Cover/AM.webp", songPath: "Lagu/I Wanna Be Yours.mp3" },
    { id: 22, songName: "I Was Never There", songDes: "The Weeknd", songImage: "Art Cover/My Dear Melancholy,.webp", songPath: "Lagu/I Was Never There.mp3" },
    { id: 23, songName: "Innocence", songDes: "NERO", songImage: "Art Cover/Innocence.webp", songPath: "Lagu/Innocence.mp3" },
    { id: 24, songName: "Let Me Love You", songDes: "Mario", songImage: "Art Cover/Encore.webp", songPath: "Lagu/Let Me Love You.mp3" },
    { id: 25, songName: "do you think you could love me", songDes: "yung kai", songImage: "Art Cover/do you think you could love me_.webp", songPath: "Lagu/do you think you could love me_.mp3" },
    { id: 26, songName: "love for you", songDes: "Joji", songImage: "Art Cover/love for you.webp", songPath: "Lagu/love for you.mp3" },
    { id: 27, songName: "Love Me Not", songDes: "Ravyn Lenae, Rex Orange County", songImage: "Art Cover/Love Me Not (feat. Rex Orange County).webp", songPath: "Lagu/Love Me Not (feat. Rex Orange County).mp3" },
    { id: 28, songName: "Love Potions", songDes: "BJ Lips, princess paparazzi", songImage: "Art Cover/Cum n Cocaine.webp", songPath: "Lagu/Love Potions.mp3" },
    { id: 29, songName: "Lovers Rock", songDes: "TV Girl", songImage: "Art Cover/French Exit.webp", songPath: "Lagu/Lovers Rock.mp3" },
    { id: 30, songName: "M a k e I t T o T h e M o r n i n g", songDes: "PARTYNEXTDOOR", songImage: "Art Cover/make it to morning.webp", songPath: "Lagu/M a k e I t T o T h e M o r n i n g.mp3" },
    { id: 31, songName: "Mimosa 2000", songDes: "Furacão 2000, Nyasia", songImage: "Art Cover/April Mixtape 3.webp", songPath: "Lagu/Mimosa 2000.mp3" },
    { id: 32, songName: "Mind Games", songDes: "Sickick", songImage: "Art Cover/Mind Games.webp", songPath: "Lagu/Mind Games.mp3" },
    { id: 33, songName: "Money Trees", songDes: "Kendrick Lamar, Jay Rock", songImage: "Art Cover/good kid, m.A.A.d city.webp", songPath: "Lagu/Money Trees.mp3" },
    { id: 34, songName: "About You", songDes: "The 1975", songImage: "Art Cover/About You.webp", songPath: "Lagu/About You.mp3" },
    { id: 35, songName: "Moonlight", songDes: "Kali Uchis", songImage: "Art Cover/Red Moon In Venus.webp", songPath: "Lagu/Moonlight.mp3" },
    { id: 36, songName: "Iris", songDes: "Pastel Ghost", songImage: "Art Cover/SpotiDown.App - Iris - Pastel Ghost.webp", songPath: "Lagu/SpotiDown.App - Iris - Pastel Ghost.mp3" },
    { id: 37, songName: "No. 1 Party Anthem", songDes: "Arctic Monkeys", songImage: "Art Cover/AM.webp", songPath: "Lagu/No. 1 Party Anthem.mp3" },
    { id: 38, songName: "nuts (feat. Rainy Bear)", songDes: "Lil Peep", songImage: "Art Cover/nuts (feat. Rainy Bear).webp", songPath: "Lagu/nuts (feat. Rainy Bear).mp3" },
    { id: 39, songName: "505", songDes: "Arctic Monkeys", songImage: "Art Cover/505.webp", songPath: "Lagu/505.mp3" },
    { id: 40, songName: "Obsessed", songDes: "Mariah Carey", songImage: "Art Cover/Memoirs of an imperfect Angel (International Version).webp", songPath: "Lagu/Obsessed.mp3" },
    { id: 41, songName: "Paparazzi (Dubstep)", songDes: "Lady Gaga", songImage: "Art Cover/The Fame.webp", songPath: "Lagu/SpotiDown.App - Paparazzi _Dubstep_ - Alximo.mp3" },
    { id: 42, songName: "Imposter Sydrome", songDes: "Sidney Gish", songImage: "Art Cover/Imposter Sydrome.webp", songPath: "Lagu/Impostor Syndrome.mp3" },
    { id: 43, songName: "Tip Toe", songDes: "HYBS", songImage: "Art Cover/Tip Toe.webp", songPath: "Lagu/Tip Toe.mp3" },
    { id: 44, songName: "Good Looking", songDes: "Suki Waterhouse", songImage: "Art Cover/Good Looking.webp", songPath: "Lagu/Good Looking.mp3" },
    { id: 45, songName: "Say Yes To Heaven", songDes: "Lana Del Rey", songImage: "Art Cover/Say Yes To Heaven.webp", songPath: "Lagu/Say Yes To Heaven.mp3" },
    { id: 46, songName: "That's What I Like", songDes: "Bruno Mars", songImage: "Art Cover/24K Magic.webp", songPath: "Lagu/That's What I Like.mp3" },
    { id: 47, songName: "Timeless (feat Playboi Carti)", songDes: "The Weeknd, Playboi Carti", songImage: "Art Cover/After Hours.webp", songPath: "Lagu/Timeless (feat Playboi Carti).mp3" },
    { id: 48, songName: "Under Your Spell", songDes: "Desire", songImage: "Art Cover/under your spell.webp", songPath: "Lagu/Under Your Spell.mp3" },
    { id: 49, songName: "VISION", songDes: "VALORANT, Grabbitz", songImage: "Art Cover/Dark Side.webp", songPath: "Lagu/VISION.mp3" },
    { id: 50, songName: "West Coast", songDes: "Lana Del Rey", songImage: "Art Cover/Ultraviolence (Deluxe).webp", songPath: "Lagu/West Coast.mp3" },
    { id: 51, songName: "Wutiwant X Love Potions LQ", songDes: "Potions, Auralyx, Evangeline <3", songImage: "Art Cover/Wutiwant X Love Potions LQ.webp", songPath: "Lagu/Wutiwant X Love Potions LQ.mp3" },
    { id: 52, songName: "AEAO", songDes: "Dynamicduo, CHEN", songImage: "Art Cover/aeao.webp", songPath: "Lagu/AEAO.mp3" },
    { id: 53, songName: "Apocalypse", songDes: "Cigarettes After Sex", songImage: "Art Cover/apocallypse.webp", songPath: "Lagu/Apocalypse.mp3" },
    { id: 54, songName: "Back to Friends", songDes: "sombr", songImage: "Art Cover/back to friends.webp", songPath: "Lagu/back to friends.mp3" },
    { id: 55, songName: "Beauty And A Beat", songDes: "Justin Bieber, Nicki Minaj", songImage: "Art Cover/Believe (Deluxe Edition).webp", songPath: "Lagu/SpotiDown.App - Beauty And A Beat - Justin Bieber.mp3" },
    { id: 56, songName: "BIRDS OF A FEATHER", songDes: "Billie Eilish", songImage: "Art Cover/birds of feather.webp", songPath: "Lagu/BIRDS OF A FEATHER.mp3" },
    { id: 57, songName: "boyfriend (with Social House)", songDes: "Ariana Grande, Social House", songImage: "Art Cover/boyfriend.webp", songPath: "Lagu/boyfriend (with Social House).mp3" },
    { id: 58, songName: "Into You X bye", songDes: "Ariana Grande", songImage: "Art Cover/Into You X bye.webp", songPath: "Lagu/Into You X bye (altare remix) - Ariana Grande (mashup).mp3" },
    { id: 59, songName: "bye", songDes: "Ariana Grande", songImage: "Art Cover/bye.webp", songPath: "Lagu/bye.mp3" },
    { id: 60, songName: "Don't Copy My Flow", songDes: "Snoop Dogg", songImage: "Art Cover/Don't Copy My Flow.webp", songPath: "Lagu/Don't Copy My Flow.mp3" },
    { id: 61, songName: "Earrings", songDes: "Malcolm Todd", songImage: "Art Cover/earnings.webp", songPath: "Lagu/Earrings.mp3" },
    { id: 62, songName: "End of Beginning", songDes: "Djo", songImage: "Art Cover/end of beggining.webp", songPath: "Lagu/End of Beginning.mp3" },
    { id: 63, songName: "Everyday", songDes: "Ariana Grande, Future", songImage: "Art Cover/everyday.webp", songPath: "Lagu/Everyday.mp3" },
    { id: 64, songName: "Heaven Sent", songDes: "Keyshia Cole", songImage: "Art Cover/heaven sent.webp", songPath: "Lagu/Heaven Sent.mp3" },
    { id: 65, songName: "NVMD", songDes: "Denise Julia", songImage: "Art Cover/SpotiDown.App - NVMD - Denise Julia.webp", songPath: "Lagu/SpotiDown.App - NVMD - Denise Julia.mp3" },
    { id: 66, songName: "Into It", songDes: "Chase Atlantic", songImage: "Art Cover/Into it.webp", songPath: "Lagu/Into It.mp3" },
    { id: 67, songName: "Love Me Harder", songDes: "Ariana Grande, The Weeknd", songImage: "Art Cover/love me harder.webp", songPath: "Lagu/Love Me Harder.mp3" },
    { id: 68, songName: "Love Me", songDes: "Justin Bieber", songImage: "Art Cover/love me.webp", songPath: "Lagu/Love Me.mp3" },
    { id: 69, songName: "love.", songDes: "wave to earth", songImage: "Art Cover/love..webp", songPath: "Lagu/love..mp3" },
    { id: 70, songName: "M.", songDes: "Anıl Emre Daldal", songImage: "Art Cover/M_.webp", songPath: "Lagu/M..mp3" },
    { id: 71, songName: "Merry Christmas, Please Don't Call", songDes: "Bleachers", songImage: "Art Cover/Merry Christmas, Please Don't Call.webp", songPath: "Lagu/Merry Christmas, Please Don't Call.mp3" },
    { id: 72, songName: "My Love Mine All Mine", songDes: "Mitski", songImage: "Art Cover/my love mine all mine.webp", songPath: "Lagu/My Love Mine All Mine.mp3" },
    { id: 73, songName: "No One Noticed", songDes: "The Marías", songImage: "Art Cover/no one noticed.webp", songPath: "Lagu/No One Noticed.mp3" },
    { id: 74, songName: "Not Around", songDes: "Nova", songImage: "Art Cover/Not Around.webp", songPath: "Lagu/Not Around.webp", songPath: "Lagu/Not Around.mp3" },
    { id: 75, songName: "Something About You", songDes: "Eyedress, Dent May", songImage: "Art Cover/Something About You.webp", songPath: "Lagu/Something About You.mp3" },
    { id: 76, songName: "Shadows", songDes: "Pastel Ghost", songImage: "Art Cover/Shadows EP.webp", songPath: "Lagu/Shadows.mp3" },
    { id: 77, songName: "supernatural", songDes: "Ariana Grande", songImage: "Art Cover/supernatural.webp", songPath: "Lagu/supernatural.mp3" },
    { id: 78, songName: "Swim", songDes: "Chase Atlantic", songImage: "Art Cover/swim.webp", songPath: "Lagu/Swim.mp3" },
    { id: 79, songName: "What If I Call", songDes: "Charlie Burg", songImage: "Art Cover/What If I Call.webp", songPath: "Lagu/What If I Call.mp3" },
    { id: 80, songName: "worry - Slowed", songDes: "LONOWN, riserayss", songImage: "Art Cover/worry.webp", songPath: "Lagu/worry - Slowed.mp3" },
    { id: 81, songName: "FLY", songDes: "Spectrum", songImage: "Art Cover/FLY.webp", songPath: "Lagu/F L Y.mp3" },
    { id: 82, songName: "Surabaya", songDes: "Crayon Case", songImage: "Art Cover/surabaya.webp", songPath: "Lagu/Surabaya.mp3" },
    { id: 83, songName: "Siapkah kau Tuk Jatuh Cinta Lagi", songDes: "Hivi!,Andi Rianto", songImage: "Art Cover/Siapkah Kau Tuk Jatuh Cinta Lagi.webp", songPath: "Lagu/Siapkah Kau Tuk Jatuh Cinta Lagi.mp3" },
    { id: 84, songName: "8 Letters", songDes: "Why Don't We", songImage: "Art Cover/8letters.webp", songPath: "Lagu/SpotiDown.App - 8 Letters - Why Don_t We.mp3" },
    { id: 85, songName: "20 Min", songDes: "Lil Uzi Vert", songImage: "Art Cover/20min.webp", songPath: "Lagu/20 Min.mp3" },
    { id: 86, songName: "Breakin'Dishes", songDes: "Rihanna", songImage: "Art Cover/breakin'dishes.webp", songPath: "Lagu/Breakin Dishes.mp3" },
    { id: 87, songName: "Bring Me To Life", songDes: "Evanescence", songImage: "Art Cover/bringmetolife.webp", songPath: "Lagu/Bring Me To Life.mp3" },
    { id: 88, songName: "Foto kita blur", songDes: "Sal Priadi", songImage: "Art Cover/fotokitablur.webp", songPath: "Lagu/SpotiDown.App - Foto kita blur - Sal Priadi.mp3" },
    { id: 89, songName: "Goodluck,Babe!", songDes: "Chappell Roan", songImage: "Art Cover/goodluckbabe.webp", songPath: "Lagu/SpotiDown.App - Good Luck_ Babe_ - Chappell Roan.mp3" },
    { id: 90, songName: "lovely", songDes: "Billie Eilish,Khalid", songImage: "Art Cover/lovely.webp", songPath: "Lagu/lovely.mp3" },
    { id: 91, songName: "Tek It", songDes: "Cafuné", songImage: "Art Cover/SpotiDown.App - Tek It - Cafuné.webp", songPath: "Lagu/SpotiDown.App - Tek It - Cafuné.mp3" },
    { id: 92, songName: "Sesi Potret", songDes: "eńau", songImage: "Art Cover/SpotiDown.App - Sesi Potret - eńau.webp", songPath: "Lagu/SpotiDown.App - Sesi Potret - eńau.mp3" },
    { id: 93, songName: "Bertaut", songDes: "Nadin Amizah", songImage: "Art Cover/SpotiDown.App - Bertaut - Nadin Amizah.webp", songPath: "Lagu/SpotiDown.App - Bertaut - Nadin Amizah.mp3" },
    { id: 94, songName: "Somebody's Pleasure", songDes: "Aziz Hedra", songImage: "Art Cover/SpotiDown.App - Somebody_s Pleasure - Aziz Hedra.webp", songPath: "Lagu/SpotiDown.App - Somebody_s Pleasure - Aziz Hedra.mp3" },
    { id: 95, songName: "we can't be friends (wait for your love)", songDes: "Ariana Grande", songImage: "Art Cover/supernatural.webp", songPath: "Lagu/we can't be friends (wait for your love).mp3" },
    { id: 96, songName: "Golden Brown", songDes: "The Stranglers", songImage: "Art Cover/Golden Brown.webp", songPath: "Lagu/Golden Brown.mp3" },
    { id: 97, songName: "Blank Space (Taylor's Version)", songDes: "Taylor Swift", songImage: "Art Cover/Blank Space (Taylor's Version).webp", songPath: "Lagu/Blank Space (Taylor's Version).mp3" },
    { id: 98, songName: "Obsesi Mengejar Semesta", songDes: "Zephter", songImage: "Art Cover/Obsesi Mengejar Semesta.webp", songPath: "Lagu/Obsesi Mengejar Semesta.mp3" },
    { id: 99, songName: "Scott and Zelda", songDes: "BIBI", songImage: "Art Cover/Scott and Zelda.webp", songPath: "Lagu/Scott and Zelda.mp3" },
    { id: 100, songName: "Treat You Better", songDes: "Shawn Mendes", songImage: "Art Cover/Treat You Better.webp", songPath: "Lagu/Treat You Better.mp3" },
    { id: 101, songName: "Glue Song", songDes: "beabadoobee", songImage: "Art Cover/Glue Song.webp", songPath: "Lagu/Glue Song.mp3" },
    { id: 102, songName: "Closed Doors", songDes: "Ismail", songImage: "Art Cover/Closed Doors.webp", songPath: "Lagu/Closed Doors.mp3" },
    { id: 103, songName: "The One That Got Away", songDes: "Katy Perry", songImage: "Art Cover/The One That Got Away.webp", songPath: "Lagu/The One That Got Away.mp3" },
    { id: 104, songName: "Entry Four", songDes: "Jaydes Archive", songImage: "Art Cover/Entry Four.webp", songPath: "Lagu/Entry Four.mp3" },
    { id: 105, songName: "500 Miles", songDes: "Peter Paul and Mary", songImage: "Art Cover/500 Miles.webp", songPath: "Lagu/500 Miles.mp3" },
    { id: 106, songName: "Best Friend", songDes: "Rex Orange County", songImage: "Art Cover/Best Friend.webp", songPath: "Lagu/Best Friend.mp3" },
    { id: 108, songName: "Remaja", songDes: "Hivi!", songImage: "Art Cover/Remaja.webp", songPath: "Lagu/Remaja.mp3" },
    { id: 109, songName: "All Too Well (Taylor's Version)", songDes: "Taylor Swift", songImage: "Art Cover/All Too Well (Taylor's Version).webp", songPath: "Lagu/All Too Well (Taylor's Version).mp3" },
    { id: 110, songName: "Enchanted", songDes: "Taylor Swift", songImage: "Art Cover/Enchanted.webp", songPath: "Lagu/Enchanted.webp", songPath: "Lagu/Enchanted.mp3" },
    { id: 111, songName: "Jatuh Suka", songDes: "Tulus", songImage: "Art Cover/Jatuh Suka.webp", songPath: "Lagu/Jatuh Suka.mp3" },
    { id: 112, songName: "Besok kita pergi makan", songDes: "Sal Priadi", songImage: "Art Cover/Besok kita pergi makan.webp", songPath: "Lagu/Besok kita pergi makan.mp3" },
    { id: 113, songName: "Jatuh Hati", songDes: "Raisa", songImage: "Art Cover/Jatuh Hati.webp", songPath: "Lagu/Jatuh Hati.mp3" },
    { id: 114, songName: "Payphone", songDes: "Maroon 5, Wiz Khalifa", songImage: "Art Cover/Payphone.webp", songPath: "Lagu/Payphone.mp3" },
    { id: 115, songName: "Wide Awake", songDes: "Katy Perry", songImage: "Art Cover/Wide Awake.webp", songPath: "Lagu/Wide Awake.mp3" },
    { id: 116, songName: "Langit Tak Seharusnya Biru", songDes: "The Jansen", songImage: "Art Cover/Langit Tak Seharusnya Biru.webp", songPath: "Lagu/Langit Tak Seharusnya Biru.mp3" },
    { id: 117, songName: "Mantan Terindah", songDes: "Kahitna", songImage: "Art Cover/Mantan Terindah.webp", songPath: "Lagu/Mantan Terindah.mp3" },
    { id: 118, songName: "Selamat (Selamat Tinggal)", songDes: "Virgoun, Audy", songImage: "Art Cover/Selamat (Selamat Tinggal).webp", songPath: "Lagu/Selamat (Selamat Tinggal).mp3" },
    { id: 119, songName: "Diri", songDes: "Tulus", songImage: "Art Cover/Diri.webp", songPath: "Lagu/Diri.mp3" },
    { id: 120, songName: "We Don't Talk Anymore (feat. Selena Gomez)", songDes: "Charlie Puth, Selena Gomez", songImage: "Art Cover/We Don't Talk Anymore (feat. Selena Gomez).webp", songPath: "Lagu/We Don't Talk Anymore (feat. Selena Gomez).mp3" },
    { id: 121, songName: "Teh Hijau", songDes: "Tulus", songImage: "Art Cover/Teh Hijau.webp", songPath: "Lagu/Teh Hijau.mp3" },
    { id: 122, songName: "WILDFLOWER", songDes: "Billie Eilish", songImage: "Art Cover/WILDFLOWER.webp", songPath: "Lagu/WILDFLOWER.mp3" },
    { id: 123, songName: "Come Inside Of My Heart", songDes: "IV OF SPADES", songImage: "Art Cover/Come Inside Of My Heart.webp", songPath: "Lagu/SpotiDown.App - Come Inside Of My Heart - IV OF SPADES.mp3" },
    { id: 124, songName: "EEEE A", songDes: "dia", songImage: "Art Cover/SpotiDown.App - EEEE A - dia.webp", songPath: "Lagu/SpotiDown.App - EEEE A - dia.mp3" },
    { id: 125, songName: "Gravits", songDes: "Crayon Case", songImage: "Art Cover/Gravits.webp", songPath: "Lagu/SpotiDown.App - Gravits - Crayon Case.mp3" },
    { id: 126, songName: "hate that i made you love me", songDes: "Ariana Grande", songImage: "Art Cover/hate that i made you love me.webp", songPath: "Lagu/SpotiDown.App - hate that i made you love me - Ariana Grande.mp3" },
    { id: 127, songName: "Kill Bill", songDes: "SZA", songImage: "Art Cover/SpotiDown.App - Kill Bill - SZA.webp", songPath: "Lagu/SpotiDown.App - Kill Bill - SZA.mp3" },
    { id: 128, songName: "Love of My Life", songDes: "Queen", songImage: "Art Cover/SpotiDown.App - Love of My Life - Queen.webp", songPath: "Lagu/SpotiDown.App - Love of My Life - Queen.mp3" },
    { id: 129, songName: "lowkey", songDes: "NIKI", songImage: "Art Cover/SpotiDown.App - lowkey - NIKI.webp", songPath: "Lagu/SpotiDown.App - lowkey - NIKI.mp3" },
    { id: 130, songName: "MALU MALU", songDes: "dia, INDAHKUS", songImage: "Art Cover/SpotiDown.App - MALU MALU - dia_ INDAHKUS.webp", songPath: "Lagu/SpotiDown.App - MALU MALU - dia_ INDAHKUS.mp3" },
    { id: 131, songName: "Nobody Gets Me", songDes: "SZA", songImage: "Art Cover/SpotiDown.App - Nobody Gets Me - SZA.webp", songPath: "Lagu/SpotiDown.App - Nobody Gets Me - SZA.mp3" },
    { id: 132, songName: "Open Arms (feat. Travis Scott)", songDes: "SZA, Travis Scott", songImage: "Art Cover/Open Arms (feat. Travis Scott).webp", songPath: "Lagu/SpotiDown.App - Open Arms (feat. Travis Scott) - SZA, Travis Scott.mp3" },
    { id: 133, songName: "Pelangi", songDes: "Hivi!", songImage: "Art Cover/SpotiDown.App - Pelangi - Hivi_.webp", songPath: "Lagu/SpotiDown.App - Pelangi - Hivi_.mp3" },
    { id: 134, songName: "putih susu", songDes: "ibra", songImage: "Art Cover/SpotiDown.App - putih susu - ibra.webp", songPath: "Lagu/SpotiDown.App - putih susu - ibra.mp3" },
    { id: 135, songName: "Saturn", songDes: "SZA", songImage: "Art Cover/Saturn.webp", songPath: "Lagu/SpotiDown.App - Saturn - SZA.mp3" },
    { id: 136, songName: "SENCY", songDes: "dia, Tenxi", songImage: "Art Cover/SpotiDown.App - SENCY - dia_ Tenxi.webp", songPath: "Lagu/SpotiDown.App - SENCY - dia_ Tenxi.mp3" },
    { id: 137, songName: "Snooze", songDes: "SZA", songImage: "Art Cover/SpotiDown.App - Snooze - SZA.webp", songPath: "Lagu/SpotiDown.App - Snooze - SZA.mp3" },
    { id: 138, songName: "SO ASU", songDes: "Naykilla", songImage: "Art Cover/SpotiDown.App - SO ASU - Naykilla.webp", songPath: "Lagu/SpotiDown.App - SO ASU - Naykilla.mp3" },
    { id: 139, songName: "Aneka Baju Raya", songDes: "Papa Pipi", songImage: "Art Cover/Aneka Baju Raya (Papa Pipi).webp", songPath: "Lagu/Aneka Baju Raya (Papa Pipi).mp3", hidden: true, keyword: ["bob", "boboi", "boboiboy", "aneka baju raya"] },
    { id: 140, songName: "Bangkit Anak Muda", songDes: "BoBoiBoy", songImage: "Art Cover/Bangkit Anak Muda (BoBoiBoy).webp", songPath: "Lagu/Bangkit Anak Muda (BoBoiBoy).mp3", hidden: true, keyword: ["bob", "boboi", "boboiboy", "bangkit anak muda"] },
    { id: 141, songName: "Boboiboy Bersedia", songDes: "BoBoiBoy", songImage: "Art Cover/Boboiboy Bersedia.webp", songPath: "Lagu/Boboiboy Bersedia.mp3", hidden: true, keyword: ["bob", "boboi", "boboiboy", "boboiboy bersedia"] },
    { id: 142, songName: "BoBoiBoy Hero Kita (2024 Remastered Version)", songDes: "BoBoiBoy", songImage: "Art Cover/BoBoiBoy Hero Kita - 2024 Remastered Version.webp", songPath: "Lagu/BoBoiBoy Hero Kita - 2024 Remastered Version.mp3", hidden: true, keyword: ["bob", "boboi", "boboiboy", "boboiboy hero kita (2024 remastered version)", "boboiboy hero kita"] },
    { id: 143, songName: "BoBoiBoy Hero Kita (Acoustic Version)", songDes: "BoBoiBoy", songImage: "Art Cover/BoBoiBoy Hero Kita - Acoustic Version.webp", songPath: "Lagu/BoBoiBoy Hero Kita - Acoustic Version.mp3", hidden: true, keyword: ["bob", "boboi", "boboiboy", "boboiboy hero kita (acoustic version)", "boboiboy hero kita"] },
    { id: 144, songName: "Destinasi Ke Jepun", songDes: "Fly With Yaya", songImage: "Art Cover/Destinasi Ke Jepun (Fly With Yaya).webp", songPath: "Lagu/Destinasi Ke Jepun (Fly With Yaya).mp3", hidden: true, keyword: ["bob", "boboi", "boboiboy", "destinasi ke jepun"] },
    { id: 145, songName: "Dibawah Langit Yang Sama", songDes: "D'Masiv", songImage: "Art Cover/Dibawah Langit Yang Sama.webp", songPath: "Lagu/Dibawah Langit Yang Sama.mp3", hidden: true, keyword: ["bob", "boboi", "boboiboy", "dibawah langit yang sama"] },
    { id: 146, songName: "Dunia Baru", songDes: "Bunkface", songImage: "Art Cover/Dunia Baru.webp", songPath: "Lagu/Dunia Baru.mp3", hidden: true, keyword: ["bob", "boboi", "boboiboy", "dunia baru"] },
    { id: 147, songName: "FIRE & WATER", songDes: "Faizal Tahir", songImage: "Art Cover/FIRE & WATER.webp", songPath: "Lagu/FIRE & WATER.mp3", hidden: true, keyword: ["bob", "boboi", "boboiboy", "fire & water"] },
    { id: 148, songName: "Fly With Yaya (Opening Song)", songDes: "Fly With Yaya", songImage: "Art Cover/Fly With Yaya (Opening Song).webp", songPath: "Lagu/Fly With Yaya (Opening Song).mp3", hidden: true, keyword: ["bob", "boboi", "boboiboy", "fly with yaya (opening song)", "fly with yaya"] },
    { id: 149, songName: "Hapipi Birthday", songDes: "Papa Pipi", songImage: "Art Cover/Hapipi Birthday (Papa Pipi).webp", songPath: "Lagu/Hapipi Birthday (Papa Pipi).mp3", hidden: true, keyword: ["bob", "boboi", "boboiboy", "hapipi birthday"] },
    { id: 150, songName: "Jagalah Bumi", songDes: "Kotak", songImage: "Art Cover/Jagalah Bumi - Theme from BoBoiBoy.webp", songPath: "Lagu/Jagalah Bumi - Theme from BoBoiBoy.mp3", hidden: true, keyword: ["bob", "boboi", "boboiboy", "jagalah bumi"] },
    { id: 151, songName: "Kembali Beraksi", songDes: "BoBoiBoy", songImage: "Art Cover/Kembali Beraksi.webp", songPath: "Lagu/Kembali Beraksi.mp3", hidden: true, keyword: ["bob", "boboi", "boboiboy", "kembali beraksi"] },
    { id: 152, songName: "Kita Semua Happy", songDes: "Papa Pipi", songImage: "Art Cover/Kita Semua Happy (Papa Pipi).webp", songPath: "Lagu/Kita Semua Happy (Papa Pipi).mp3", hidden: true, keyword: ["bob", "boboi", "boboiboy", "kita semua happy"] },
    { id: 153, songName: "Laksamana Tarung", songDes: "BoBoiBoy Galaxy", songImage: "Art Cover/Laksamana Tarung (BoBoiBoy Galaxy).webp", songPath: "Lagu/Laksmana Tarung (BoBoiBoy Galaxy).mp3", hidden: true, keyword: ["bob", "boboi", "boboiboy", "laksamana tarung"] },
    { id: 154, songName: "Masih Disini", songDes: "Bunkface", songImage: "Art Cover/Masih Disini.webp", songPath: "Lagu/Masih Disini.mp3", hidden: true, keyword: ["bob", "boboi", "boboiboy", "masih disini"] },
    { id: 155, songName: "Perut Papaku", songDes: "Papa Pipi", songImage: "Art Cover/Perut Papaku (Papa Pipi).webp", songPath: "Lagu/Perut Papaku (Papa Pipi).mp3", hidden: true, keyword: ["bob", "boboi", "boboiboy", "perut papaku"] },
    { id: 156, songName: "Rasa SarangHae", songDes: "Papa Pipi", songImage: "Art Cover/Rasa SarangHae (Papa Pipi).webp", songPath: "Lagu/Rasa SarangHae (Papa Pipi).mp3", hidden: true, keyword: ["bob", "boboi", "boboiboy", "rasa saranghae"] },
    { id: 157, songName: "Team Bubadibako it's Chill", songDes: "Ilofiu", songImage: "Art Cover/Team Bubadibako it's Chill - Boboiboy.webp", songPath: "Lagu/SpotiDown.App - Team Bubadibako but it_s Chill - Boboiboy - Ilofiu.mp3", hidden: true, keyword: ["bob", "boboi", "boboiboy", "team bubadibako it's chill"] },
    { id: 158, songName: "Teman Setia", songDes: "BoBoiBoy Galaxy Sori", songImage: "Art Cover/Teman Setia (Official Soundtrack Boboiboy Galaxy Sori - Short Version).webp", songPath: "Lagu/Teman Setia (Official Soundtrack Boboiboy Galaxy Sori - Short Version).mp3", hidden: true, keyword: ["bob", "boboi", "boboiboy", "teman setia"] },
    { id: 159, songName: "Hard 2 Face Reality", songDes: "Poo Bear", songImage: "Art Cover/SpotiDown.App - Hard 2 Face Reality - Poo Bear.webp", songPath: "Lagu/SpotiDown.App - Hard 2 Face Reality - Poo Bear.mp3" },
    { id: 160, songName: "DJ PHANTEON X MIMI X TRUMPET - Slowed & Reverb", songDes: "ᴇʟ_ᴍᴀϙɪᴇ", songImage: "Art Cover/DJ PHANTEON X MIMI X TRUMPET - Slowed & Reverb.webp", songPath: "Lagu/DJ PHANTEON X MIMI X TRUMPET - Slowed & Reverb.mp3", hidden: true, keyword: ["DJ"] },
    { id: 161, songName: "Bibir Tepes Funkot", songDes: "DJ ALMIRA BERTO REAL", songImage: "Art Cover/Bibir Tepes Funkot.webp", songPath: "Lagu/Bibir Tepes Funkot.mp3", hidden: true, keyword: ["dj", "bibir tepes funkot"] },
    { id: 162, songName: "Bila Malam Kupeluk Bayang Dirimu", songDes: "DJ ADHE", songImage: "Art Cover/Bila Malam Kupeluk Bayang Dirimu.webp", songPath: "Lagu/Bila Malam Kupeluk Bayang Dirimu.mp3", hidden: true, keyword: ["dj", "bila malam kupeluk bayang dirimu"] },
    { id: 163, songName: "CACA MARICA DISINI ADA SEMUR", songDes: "BUJANG ORGEN LAMPUNG", songImage: "Art Cover/CACA MARICA DISINI ADA SEMUR.webp", songPath: "Lagu/CACA MARICA DISINI ADA SEMUR.mp3", hidden: true, keyword: ["dj", "caca marica disini ada semur"] },
    { id: 164, songName: "DJ ASULAMA SUKA DIA", songDes: "DJ ALMIRA BERTO", songImage: "Art Cover/DJ ASULAMA SUKA DIA.webp", songPath: "Lagu/DJ ASULAMA SUKA DIA.mp3", hidden: true, keyword: ["dj", "dj asulama suka dia"] },
    { id: 165, songName: "DJ KU PUJA PUJA FUNKOT", songDes: "DJ Chen", songImage: "Art Cover/DJ KU PUJA PUJA FUNKOT.webp", songPath: "Lagu/DJ KU PUJA PUJA FUNKOT.mp3", hidden: true, keyword: ["dj", "dj ku puja puja funkot"] },
    { id: 166, songName: "Dj Memori Berkasih", songDes: "Dj Rn Music", songImage: "Art Cover/Dj Memori Berkasih.webp", songPath: "Lagu/Dj Memori Berkasih.mp3", hidden: true, keyword: ["dj", "dj memori berkasih"] },
    { id: 167, songName: "DJ MENGAPA DIA", songDes: "DJ ALMIRA BERTO", songImage: "Art Cover/DJ MENGAPA DIA.webp", songPath: "Lagu/DJ MENGAPA DIA.mp3", hidden: true, keyword: ["dj", "dj mengapa dia"] },
    { id: 168, songName: "Gantung Funkot", songDes: "DJ ALMIRA BERTO", songImage: "Art Cover/Gantung Funkot.webp", songPath: "Lagu/Gantung Funkot.mp3", hidden: true, keyword: ["dj", "gantung funkot"] },
    { id: 169, songName: "Hargai Aku", songDes: "DJ Dyn", songImage: "Art Cover/Hargai Aku.webp", songPath: "Lagu/Hargai Aku.mp3", hidden: true, keyword: ["dj", "hargai aku"] },
    { id: 170, songName: "Kelingan Mantan", songDes: "DJ ALMIRA BERTO REAL", songImage: "Art Cover/Kelingan Mantan.webp", songPath: "Lagu/Kelingan Mantan.mp3", hidden: true, keyword: ["dj", "kelingan mantan"] },
    { id: 171, songName: "Luka Sekerat Rasa", songDes: "DJ ALMIRA BERTO", songImage: "Art Cover/Luka Sekerat Rasa.webp", songPath: "Lagu/Luka Sekerat Rasa.mp3", hidden: true, keyword: ["dj", "luka sekerat rasa"] },
    { id: 172, songName: "Negoro Angin", songDes: "DJ ALMIRA BERTO", songImage: "Art Cover/Negoro Angin.webp", songPath: "Lagu/Negoro Angin.mp3", hidden: true, keyword: ["dj", "negoro angin"] },
    { id: 173, songName: "Ngertenono Ati", songDes: "DJ ALMIRA BERTO", songImage: "Art Cover/Ngertonono Ati.webp", songPath: "Lagu/Ngertenono Ati.mp3", hidden: true, keyword: ["dj", "ngertenono ati"] },
    { id: 174, songName: "Nresnani", songDes: "DJ ALMIRA BERTO", songImage: "Art Cover/Nresnani.webp", songPath: "Lagu/Nresnani.mp3", hidden: true, keyword: ["dj", "nresnani"] },
    { id: 175, songName: "Orang Yang Salah (Remix)", songDes: "DJ ALMIRA BERTO", songImage: "Art Cover/Orang Yang Salah (Remix).webp", songPath: "Lagu/Orang Yang Salah (Remix).mp3", hidden: true, keyword: ["dj", "orang yang salah (remix)", "orang yang salah"] },
    { id: 176, songName: "Pacar Selingan", songDes: "DJ ALMIRA BERTO", songImage: "Art Cover/Pacar Selingan.webp", songPath: "Lagu/Pacar Selingan.mp3", hidden: true, keyword: ["dj", "pacar selingan"] },
    { id: 177, songName: "Pengarepan", songDes: "DJ ALMIRA BERTO", songImage: "Art Cover/Pengarepan.webp", songPath: "Lagu/Pengarepan.mp3", hidden: true, keyword: ["dj", "pengarepan"] },
    { id: 178, songName: "Sekti", songDes: "DJ ALMIRA BERTO", songImage: "Art Cover/Sekti.webp", songPath: "Lagu/Sekti.mp3", hidden: true, keyword: ["dj", "sekti"] },
    { id: 179, songName: "Sembilu", songDes: "TESSA MORENA", songImage: "Art Cover/Sembilu.webp", songPath: "Lagu/Sembilu.mp3", hidden: true, keyword: ["dj", "sembilu"] },
    { id: 180, songName: "Serba Salah", songDes: "New Gvme", songImage: "Art Cover/Serba Salah.webp", songPath: "Lagu/Serba Salah.mp3", hidden: true, keyword: ["serba salah"] },
    { id: 181, songName: "so bitter x vacation bible school", songDes: "Stady", songImage: "Art Cover/so bitter x vacation bible school.webp", songPath: "Lagu/so bitter x vacation bible school - (128 Kbps).mp3", hidden: true, keyword: ["so bitter x vacation bible school"] },
    { id: 182, songName: "Brooklynbloodpop! x Vacation bible school", songDes: "Stady", songImage: "Art Cover/Stady - Brooklynbloodpop! x Vacation bible school.webp", songPath: "Lagu/Stady - Brooklynbloodpop! x Vacation bible school - (128 Kbps).mp3", hidden: true, keyword: ["brooklynbloodpop! x vacation bible school"] },
    { id: 183, songName: "#BrooklynBloodPop!", songDes: "SyKo", songImage: "Art Cover/Brooklynbloodpop -syko.avif", songPath: "Lagu/SyKo - BrooklynBloodPop.mp3", hidden: true, keyword: ["#brooklynbloodpop!"] },
    { id: 184, songName: "All The Stars (with SZA)", songDes: "Kendrick Lamar, SZA", songImage: "Art Cover/All The Stars.webp", songPath: "Lagu/All The Stars (with SZA) - From _Black Panther_ The Album_.mp3" },
    { id: 185, songName: "luther (with sza)", songDes: "Kendrick Lamar, SZA", songImage: "Art Cover/luther.webp", songPath: "Lagu/luther (with sza).mp3" },
    { id: 186, songName: "Not Like Us", songDes: "Kendrick Lamar", songImage: "Art Cover/Not Like Us.webp", songPath: "Lagu/Not Like Us.mp3" },
    { id: 187, songName: "Swimming Pools (Drank)", songDes: "Kendrick Lamar", songImage: "Art Cover/Swimming Pools.webp", songPath: "Lagu/Swimming Pools (Drank).mp3" },
    { id: 188, songName: "HUMBLE.", songDes: "Kendrick Lamar", songImage: "Art Cover/HUMBLE DAN LOVE. FEAT. ZACARI.webp", songPath: "Lagu/HUMBLE..mp3" },
    { id: 189, songName: "LOVE. FEAT. ZACARI.", songDes: "Kendrick Lamar, Zacari", songImage: "Art Cover/HUMBLE DAN LOVE. FEAT. ZACARI.webp", songPath: "Lagu/LOVE. FEAT. ZACARI..mp3" },
    { id: 190, songName: "tv off (feat. lefty gunplay)", songDes: "Kendrick Lamar, Lefty Gunplay", songImage: "Art Cover/tv off.webp", songPath: "Lagu/tv off (feat. lefty gunplay).mp3" },
    { id: 191, songName: "Like That", songDes: "Future, Metro Boomin, Kendrick Lamar", songImage: "Art Cover/Like That.webp", songPath: "Lagu/Like That.mp3" },
    { id: 192, songName: "Damaikan Dunia", songDes: "Aldo Longa, Abdul & The Coffee Theory, Ahmad Abdul, A. Nayaka, Arsy Widianto, Ben Utomo, Brisia Jodie, Delika, Ecoutez, Gloria Jessica", songImage: "Art Cover/Damaikan Dunia.webp", songPath: "Lagu/Damaikan Dunia.mp3" },
    { id: 193, songName: "Hidup Tanpamu", songDes: "Keisya Levronka", songImage: "Art Cover/Hidup Tanpamu.webp", songPath: "Lagu/Hidup Tanpamu.mp3" },
    { id: 194, songName: "Denganmu Saja", songDes: "Keisya Levronka, Paul Aro", songImage: "Art Cover/Denganmu Saja.webp", songPath: "Lagu/Denganmu Saja.mp3" },
    { id: 195, songName: "Aku Bukan Dia", songDes: "Keisya Levronka", songImage: "Art Cover/Aku Bukan Dia.webp", songPath: "Lagu/Aku Bukan Dia.mp3" },
    { id: 196, songName: "Mengejar Matahari", songDes: "Keisya Levronka, Andi Rianto", songImage: "Art Cover/Mengejar Matahari, Tak Pantas Terluka, Jadi Kekasihku Saja, Tak Ingin Usai.webp", songPath: "Lagu/Mengejar Matahari.mp3" },
    { id: 197, songName: "Tak Pantas Terluka (Lagi)", songDes: "Keisya Levronka", songImage: "Art Cover/Tak Pantas Terluka (Lagi) dan Pelarian.webp", songPath: "Lagu/Tak Pantas Terluka (Lagi).mp3" },
    { id: 198, songName: "Tak Pantas Terluka", songDes: "Keisya Levronka", songImage: "Art Cover/Mengejar Matahari, Tak Pantas Terluka, Jadi Kekasihku Saja, Tak Ingin Usai.webp", songPath: "Lagu/Tak Pantas Terluka.mp3" },
    { id: 199, songName: "Pelarian", songDes: "Keisya Levronka", songImage: "Art Cover/Tak Pantas Terluka (Lagi) dan Pelarian.webp", songPath: "Lagu/Pelarian.mp3" },
    { id: 200, songName: "Jadi Kekasihku Saja", songDes: "Keisya Levronka", songImage: "Art Cover/Mengejar Matahari, Tak Pantas Terluka, Jadi Kekasihku Saja, Tak Ingin Usai.webp", songPath: "Lagu/Jadi Kekasihku Saja.mp3" },
    { id: 201, songName: "Tak Ingin Usai", songDes: "Keisya Levronka", songImage: "Art Cover/Mengejar Matahari, Tak Pantas Terluka, Jadi Kekasihku Saja, Tak Ingin Usai.webp", songPath: "Lagu/Tak Ingin Usai.mp3" },
    { id: 202, songName: "Lagu Pernikahan Kita", songDes: "Tiara Andini, Arsy Widianto", songImage: "Art Cover/Lagu Pernikahan Kita.webp", songPath: "Lagu/Lagu Pernikahan Kita.mp3" },
    { id: 203, songName: "Bahaya", songDes: "Arsy Widianto, Tiara Andini", songImage: "Art Cover/Bahaya.webp", songPath: "Lagu/Bahaya.mp3" },
    { id: 204, songName: "Maafkan Aku #terlanjurmencinta", songDes: "Tiara Andini", songImage: "Art Cover/Maafkan Aku, Merasa Indah, Janji Setia.webp", songPath: "Lagu/Maafkan Aku terlanjurmencinta.mp3" },
    { id: 205, songName: "Merasa Indah", songDes: "Tiara Andini", songImage: "Art Cover/Maafkan Aku, Merasa Indah, Janji Setia.webp", songPath: "Lagu/Merasa Indah.mp3" },
    { id: 206, songName: "Masih Hatiku", songDes: "Arsy Widianto, Tiara Andini", songImage: "Art Cover/Masih Hatiku.webp", songPath: "Lagu/Masih Hatiku.mp3" },
    { id: 207, songName: "Cintanya Aku", songDes: "Tiara Andini, Arsy Widianto", songImage: "Art Cover/Cintanya Aku.webp", songPath: "Lagu/Cintanya Aku.mp3" },
    { id: 208, songName: "Usai", songDes: "Tiara Andini", songImage: "Art Cover/Usai.webp", songPath: "Lagu/Usai.mp3" },
    { id: 209, songName: "Tulang dan Nadi", songDes: "Tiara Andini", songImage: "Art Cover/Tulang dan Nadi.webp", songPath: "Lagu/Tulang dan Nadi.mp3" },
    { id: 210, songName: "Tanpa Cinta", songDes: "Yovie Widianto, Tiara Andini", songImage: "Art Cover/Tanpa Cinta.webp", songPath: "Lagu/Tanpa Cinta.mp3" },
    { id: 211, songName: "Janji Setia", songDes: "Tiara Andini", songImage: "Art Cover/Maafkan Aku, Merasa Indah, Janji Setia.webp", songPath: "Lagu/Janji Setia.mp3" },
    { id: 212, songName: "So Good (feat. Kendrick Lamar)", songDes: "Jhené Aiko, Kendrick Lamar", songImage: "Art Cover/So Good.webp", songPath: "Lagu/SpotiDown.App - So Good _feat. Kendrick Lamar_ - Jhené Aiko_ Kendrick Lamar.mp3" },
    { id: 213, songName: "Orang Bilang", songDes: "Wali", songImage: "Art Cover/Orang Bilang Dik, Emang Dasar.webp", songPath: "Lagu/Orang Bilang.mp3", hidden: true, keyword: ["wali", "orang bilang"] },
    { id: 214, songName: "Dik", songDes: "Wali", songImage: "Art Cover/Orang Bilang Dik, Emang Dasar.webp", songPath: "Lagu/Dik.mp3", hidden: true, keyword: ["wali", "dik"] },
    { id: 215, songName: "Emang Dasar", songDes: "Wali", songImage: "Art Cover/Orang Bilang Dik, Emang Dasar.webp", songPath: "Lagu/Emang Dasar.mp3", hidden: true, keyword: ["wali", "emang dasar"] },
    { id: 216, songName: "Cari Jodoh", songDes: "Wali", songImage: "Art Cover/Cari Jodoh, Baik Baik Sayang, Puaskah, Kekasih Halal, Yank, Harga Diriku.webp", songPath: "Lagu/Cari Jodoh.mp3", hidden: true, keyword: ["wali", "cari jodoh"] },
    { id: 217, songName: "Baik Baik Sayang", songDes: "Wali", songImage: "Art Cover/Cari Jodoh, Baik Baik Sayang, Puaskah, Kekasih Halal, Yank, Harga Diriku.webp", songPath: "Lagu/Baik Baik Sayang.mp3", hidden: true, keyword: ["wali", "baik baik sayang"] },
    { id: 218, songName: "Puaskah", songDes: "Wali", songImage: "Art Cover/Cari Jodoh, Baik Baik Sayang, Puaskah, Kekasih Halal, Yank, Harga Diriku.webp", songPath: "Lagu/Puaskah.mp3", hidden: true, keyword: ["wali", "puaskah"] },
    { id: 219, songName: "Kekasih Halal", songDes: "Wali", songImage: "Art Cover/Cari Jodoh, Baik Baik Sayang, Puaskah, Kekasih Halal, Yank, Harga Diriku.webp", songPath: "Lagu/Kekasih Halal.mp3", hidden: true, keyword: ["wali", "kekasih halal"] },
    { id: 220, songName: "Yank", songDes: "Wali", songImage: "Art Cover/Cari Jodoh, Baik Baik Sayang, Puaskah, Kekasih Halal, Yank, Harga Diriku.webp", songPath: "Lagu/Yank.mp3", hidden: true, keyword: ["wali", "yank"] },
    { id: 221, songName: "Harga Diriku", songDes: "Wali", songImage: "Art Cover/Cari Jodoh, Baik Baik Sayang, Puaskah, Kekasih Halal, Yank, Harga Diriku.webp", songPath: "Lagu/Harga Diriku.mp3", hidden: true, keyword: ["wali", "harga diriku"] },
    { id: 222, songName: "Aku Bukan Bang Toyib", songDes: "Wali", songImage: "Art Cover/Aku Bukan Bang Toyib, Doaku Untukmu Sayang, Nenekku Pahlawanku, Setia Jujur Dan Taqwa, Yang Penting Halal.webp", songPath: "Lagu/Aku Bukan Bang Toyib.mp3", hidden: true, keyword: ["wali", "aku bukan bang toyib"] },
    { id: 223, songName: "Doaku Untukmu Sayang", songDes: "Wali", songImage: "Art Cover/Aku Bukan Bang Toyib, Doaku Untukmu Sayang, Nenekku Pahlawanku, Setia Jujur Dan Taqwa, Yang Penting Halal.webp", songPath: "Lagu/Doaku Untukmu Sayang.mp3", hidden: true, keyword: ["wali", "doaku untukmu sayang"] },
    { id: 224, songName: "Nenekku Pahlawanku", songDes: "Wali", songImage: "Art Cover/Aku Bukan Bang Toyib, Doaku Untukmu Sayang, Nenekku Pahlawanku, Setia Jujur Dan Taqwa, Yang Penting Halal.webp", songPath: "Lagu/Nenekku Pahlawanku.mp3", hidden: true, keyword: ["wali", "nenekku pahlawanku"] },
    { id: 225, songName: "Setia Jujur Dan Taqwa", songDes: "Wali", songImage: "Art Cover/Aku Bukan Bang Toyib, Doaku Untukmu Sayang, Nenekku Pahlawanku, Setia Jujur Dan Taqwa, Yang Penting Halal.webp", songPath: "Lagu/Setia Jujur Dan Taqwa.mp3", hidden: true, keyword: ["wali", "setia jujur dan taqwa"] },
    { id: 226, songName: "Yang Penting Halal", songDes: "Wali", songImage: "Art Cover/Aku Bukan Bang Toyib, Doaku Untukmu Sayang, Nenekku Pahlawanku, Setia Jujur Dan Taqwa, Yang Penting Halal.webp", songPath: "Lagu/Yang Penting Halal.mp3", hidden: true, keyword: ["wali", "yang penting halal"] },
    { id: 227, songName: "Si Udin Bertanya (Robbana Atina)", songDes: "Wali", songImage: "Art Cover/Si Udin Bertanya (Robbana Atina), Cari Berkah (CABE), Abatasa, Aku Cinta Allah, Mari Sholawat, Ya Allah, Tobat Maksiat (TOMAT).webp", songPath: "Lagu/Si Udin Bertanya (Robbana Atina).mp3", hidden: true, keyword: ["wali", "si udin bertanya (robbana atina)", "si udin bertanya"] },
    { id: 228, songName: "Cari Berkah (CABE)", songDes: "Wali", songImage: "Art Cover/Si Udin Bertanya (Robbana Atina), Cari Berkah (CABE), Abatasa, Aku Cinta Allah, Mari Sholawat, Ya Allah, Tobat Maksiat (TOMAT).webp", songPath: "Lagu/Cari Berkah (CABE).mp3", hidden: true, keyword: ["wali", "cari berkah (cabe)", "cari berkah"] },
    { id: 229, songName: "Abatasa", songDes: "Wali", songImage: "Art Cover/Si Udin Bertanya (Robbana Atina), Cari Berkah (CABE), Abatasa, Aku Cinta Allah, Mari Sholawat, Ya Allah, Tobat Maksiat (TOMAT).webp", songPath: "Lagu/Abatasa.mp3", hidden: true, keyword: ["wali", "abatasa"] },
    { id: 230, songName: "Aku Cinta Allah", songDes: "Wali", songImage: "Art Cover/Si Udin Bertanya (Robbana Atina), Cari Berkah (CABE), Abatasa, Aku Cinta Allah, Mari Sholawat, Ya Allah, Tobat Maksiat (TOMAT).webp", songPath: "Lagu/Aku Cinta Allah.mp3", hidden: true, keyword: ["wali", "aku cinta allah"] },
    { id: 231, songName: "Mari Sholawat", songDes: "Wali", songImage: "Art Cover/Si Udin Bertanya (Robbana Atina), Cari Berkah (CABE), Abatasa, Aku Cinta Allah, Mari Sholawat, Ya Allah, Tobat Maksiat (TOMAT).webp", songPath: "Lagu/Mari Sholawat.mp3", hidden: true, keyword: ["wali", "mari sholawat"] },
    { id: 232, songName: "Ya Allah", songDes: "Wali", songImage: "Art Cover/Si Udin Bertanya (Robbana Atina), Cari Berkah (CABE), Abatasa, Aku Cinta Allah, Mari Sholawat, Ya Allah, Tobat Maksiat (TOMAT).webp", songPath: "Lagu/Ya Allah.mp3", hidden: true, keyword: ["wali", "ya allah"] },
    { id: 233, songName: "Tobat Maksiat (TOMAT)", songDes: "Wali", songImage: "Art Cover/Si Udin Bertanya (Robbana Atina), Cari Berkah (CABE), Abatasa, Aku Cinta Allah, Mari Sholawat, Ya Allah, Tobat Maksiat (TOMAT).webp", songPath: "Lagu/Tobat Maksiat (TOMAT).mp3", hidden: true, keyword: ["wali", "tobat maksiat (tomat)", "tobat maksiat"] },
    { id: 234, songName: "Antara Aku, Kau Dan Batu Akikku", songDes: "Wali", songImage: "Art Cover/Antara Aku Kau Dan Batu Aki, Ada Gajah Dibalik Batu, Doain Ya Penonton, Ngantri Ke Jogja.webp", songPath: "Lagu/Antara Aku, Kau Dan Batu Akikku.mp3", hidden: true, keyword: ["wali", "antara aku, kau dan batu akikku", "antara aku kau dan batu akikku"] },
    { id: 235, songName: "Ada Gajah Dibalik Batu", songDes: "Wali", songImage: "Art Cover/Ada Gajah Dibalik Batu.webp", songPath: "Lagu/Ada Gajah Dibalik Batu.mp3", hidden: true, keyword: ["wali", "ada gajah dibalik batu"] },
    { id: 236, songName: "Doa'In Ya Penonton", songDes: "Wali", songImage: "Art Cover/Antara Aku Kau Dan Batu Aki, Ada Gajah Dibalik Batu, Doain Ya Penonton, Ngantri Ke Jogja.webp", songPath: "Lagu/Doa'In Ya Penonton.mp3", hidden: true, keyword: ["wali", "doa'in ya penonton", "doain ya penonton"] },
    { id: 237, songName: "Ngantri Ke Sorga", songDes: "Wali", songImage: "Art Cover/Antara Aku Kau Dan Batu Aki, Ada Gajah Dibalik Batu, Doain Ya Penonton, Ngantri Ke Jogja.webp", songPath: "Lagu/Ngantri Ke Sorga.mp3", hidden: true, keyword: ["wali", "ngantri ke sorga"] },
    { id: 238, songName: "Bocah Ngapa Yak", songDes: "Wali", songImage: "Art Cover/Bocah Ngapa Yak.webp", songPath: "Lagu/Bocah Ngapa Yak.mp3", hidden: true, keyword: ["wali", "bocah ngapa yak"] },
    { id: 239, songName: "Salam 5 Waktu", songDes: "Wali", songImage: "Art Cover/Salam 5 Waktu.webp", songPath: "Lagu/Salam 5 Waktu.mp3", hidden: true, keyword: ["wali", "salam 5 waktu"] },
    { id: 240, songName: "Takkan Pisah", songDes: "Wali", songImage: "Art Cover/Takkan Pisah.webp", songPath: "Lagu/Takkan Pisah.mp3", hidden: true, keyword: ["wali", "takkan pisah"] },
    { id: 241, songName: "Wasiat Sang Kekasih", songDes: "Wali", songImage: "Art Cover/Wasiat Sang Kekasih.webp", songPath: "Lagu/Wasiat Sang Kekasih.mp3", hidden: true, keyword: ["wali", "wasiat sang kekasih"] },
    { id: 242, songName: "Aku Sakit", songDes: "Wali", songImage: "Art Cover/Aku Sakit.webp", songPath: "Lagu/Aku Sakit.mp3", hidden: true, keyword: ["wali", "aku sakit"] },
    { id: 243, songName: "3:03 PM", songDes: "しゃろう", songImage: "Art Cover/303 PM.webp", songPath: "Lagu/03 PM.mp3", hidden: true, keyword: ["3:03 pm", "303 pm"] },
    { id: 244, songName: "2:23 AM", songDes: "しゃろう", songImage: "Art Cover/223 AM.webp", songPath: "Lagu/SpotiDown.App - 2_23 AM - Sharou.mp3", hidden: true, keyword: ["2:23 am", "223 am"] },
    { id: 245, songName: "Indecision (feat. Daniel Caesar)", songDes: "Rex Orange County, Daniel Caesar", songImage: "Art Cover/1_rex_orange_county_indecision__feat__daniel_caesar_.webp", songPath: "Lagu/Indecision (feat. Daniel Caesar).mp3" },
    { id: 246, songName: "Television / So Far So Good", songDes: "Rex Orange County", songImage: "Art Cover/2_rex_orange_county_television___so_far_so_good.webp", songPath: "Lagu/So Far So Good.mp3" },
    { id: 247, songName: "Pluto Projector", songDes: "Rex Orange County", songImage: "Art Cover/3_rex_orange_county_pluto_projector.webp", songPath: "Lagu/Pluto Projector.mp3" },
    { id: 248, songName: "Happiness", songDes: "Rex Orange County", songImage: "Art Cover/4_rex_orange_county_happiness.webp", songPath: "Lagu/Happiness.mp3" },
    { id: 249, songName: "Sunflower", songDes: "Rex Orange County", songImage: "Art Cover/5_rex_orange_county_sunflower.webp", songPath: "Lagu/Sunflower.mp3" },
    { id: 250, songName: "THE SHADE", songDes: "Rex Orange County", songImage: "Art Cover/6_rex_orange_county_the_shade.webp", songPath: "Lagu/THE SHADE.mp3" },
    { id: 251, songName: "Rearrange My World", songDes: "Daniel Caesar, Rex Orange County", songImage: "Art Cover/7_daniel_caesar_rearrange_my_world.webp", songPath: "Lagu/Rearrange My World.mp3" },
    { id: 252, songName: "AMAZING", songDes: "Rex Orange County", songImage: "Art Cover/8_rex_orange_county_amazing.webp", songPath: "Lagu/AMAZING.mp3" },
    { id: 253, songName: "Bohemian Rhapsody", songDes: "Queen", songImage: "Art Cover/9_queen_bohemian_rhapsody.webp", songPath: "Lagu/Bohemian Rhapsody.mp3" },
    { id: 254, songName: "Sorry", songDes: "510", songImage: "Art Cover/10_510_sorry.webp", songPath: "Lagu/SpotiDownloader.com - Sorry - 510.mp3" },
    { id: 255, songName: "Cintakan Membawamu Kembali", songDes: "Dewa 19, Virzha", songImage: "Art Cover/11_dewa_19_cintakan_membawamu_kembali.webp", songPath: "Lagu/Cintakan Membawamu Kembali.mp3" },
    { id: 256, songName: "Love Me Like You Do", songDes: "Ellie Goulding", songImage: "Art Cover/13_ellie_goulding_love_me_like_you_do.webp", songPath: "Lagu/Love Me Like You Do.mp3" },
    { id: 257, songName: "Pede", songDes: "Sheila On 7", songImage: "Art Cover/14_sheila_on_7_pede.webp", songPath: "Lagu/Pede.mp3" },
    { id: 258, songName: "Beautiful (feat. Camila Cabello)", songDes: "Bazzi, Camila Cabello", songImage: "Art Cover/15_bazzi_beautiful__feat__camila_cabello_.webp", songPath: "Lagu/Beautiful (feat. Camila Cabello).mp3" },
    { id: 259, songName: "I Like Me Better", songDes: "Lauv", songImage: "Art Cover/200_lauv_i_like_me_better.webp", songPath: "Lagu/I Like Me Better.mp3" },
    { id: 260, songName: "Mean It", songDes: "Lauv, LANY", songImage: "Art Cover/17_lauv_mean_it.webp", songPath: "Lagu/Mean It.mp3" },
    { id: 261, songName: "i'm so tired...", songDes: "Lauv, Troye Sivan", songImage: "Art Cover/18_lauv_i_m_so_tired___.webp", songPath: "Lagu/i'm so tired....mp3" },
    { id: 262, songName: "Feelings", songDes: "Lauv", songImage: "Art Cover/19_lauv_feelings.webp", songPath: "Lagu/Feelings.mp3" },
    { id: 263, songName: "Paris in the Rain", songDes: "Lauv", songImage: "Art Cover/20_lauv_paris_in_the_rain.webp", songPath: "Lagu/Paris in the Rain.mp3" },
    { id: 264, songName: "Getting Over You", songDes: "Lauv", songImage: "Art Cover/21_lauv_getting_over_you.webp", songPath: "Lagu/Getting Over You.mp3" },
    { id: 265, songName: "Steal The Show", songDes: "Lauv", songImage: "Art Cover/22_lauv_steal_the_show.webp", songPath: "Lagu/Steal The Show.mp3" },
    { id: 266, songName: "Light Switch", songDes: "Charlie Puth", songImage: "Art Cover/23_charlie_puth_light_switch.webp", songPath: "Lagu/Light Switch.mp3" },
    { id: 267, songName: "Ghost", songDes: "Justin Bieber", songImage: "Art Cover/24_justin_bieber_ghost.webp", songPath: "Lagu/Ghost.mp3" },
    { id: 268, songName: "Favorite Girl", songDes: "Justin Bieber", songImage: "Art Cover/25_justin_bieber_favorite_girl.webp", songPath: "Lagu/Favorite Girl.mp3" },
    { id: 269, songName: "Stuck with U (with Justin Bieber)", songDes: "Ariana Grande, Justin Bieber", songImage: "Art Cover/26_ariana_grande_stuck_with_u__with_justin_bieber_.webp", songPath: "Lagu/Stuck with U (with Justin Bieber).mp3" },
    { id: 270, songName: "What Do You Mean?", songDes: "Justin Bieber", songImage: "Art Cover/27_justin_bieber_what_do_you_mean_.webp", songPath: "Lagu/What Do You Mean_.mp3" },
    { id: 271, songName: "10,000 Hours (with Justin Bieber)", songDes: "Dan + Shay, Justin Bieber", songImage: "Art Cover/28_dan___shay_10_000_hours__with_justin_bieber_.webp", songPath: "Lagu/10,000 Hours (with Justin Bieber).mp3" },
    { id: 272, songName: "I'm the One (feat. Justin Bieber, Quavo, Chance the Rapper & Lil Wayne)", songDes: "DJ Khaled, Justin Bieber, Quavo, Chance the Rapper, Lil Wayne", songImage: "Art Cover/29_dj_khaled_i_m_the_one__feat__justin_bieber__quavo__chance_the_rapper___lil_wayne_.webp", songPath: "Lagu/I'm the One (feat. Justin Bieber, Quavo, Chance the Rapper & Lil Wayne).mp3" },
    { id: 273, songName: "Company", songDes: "Justin Bieber", songImage: "Art Cover/30_justin_bieber_company.webp", songPath: "Lagu/Company.mp3" },
    { id: 274, songName: "Peaches (feat. Daniel Caesar & Giveon)", songDes: "Justin Bieber, Daniel Caesar, GIVĒON", songImage: "Art Cover/31_justin_bieber_peaches__feat__daniel_caesar___giveon_.webp", songPath: "Lagu/Peaches (feat. Daniel Caesar & Giveon).mp3" },
    { id: 275, songName: "Intentions", songDes: "Justin Bieber, Quavo", songImage: "Art Cover/32_justin_bieber_intentions.webp", songPath: "Lagu/Intentions.mp3" },
    { id: 276, songName: "Cold Water (feat. Justin Bieber & MØ)", songDes: "Major Lazer, Justin Bieber, MØ", songImage: "Art Cover/33_major_lazer_cold_water__feat__justin_bieber___m__.webp", songPath: "Lagu/01 - Major Lazer, Justin Bieber, MØ - Cold Water (feat. Justin Bieber & MØ).mp3" },
    { id: 277, songName: "Circles", songDes: "Post Malone", songImage: "Art Cover/34_post_malone_circles.webp", songPath: "Lagu/Circles.mp3" },
    { id: 278, songName: "Sunflower - Spider-Man: Into the Spider-Verse", songDes: "Post Malone, Swae Lee", songImage: "Art Cover/35_post_malone_sunflower___spider_man__into_the_spider_verse.webp", songPath: "Lagu/Sunflower - Spider-Man_ Into the Spider-Verse.mp3" },
    { id: 279, songName: "Save Your Tears", songDes: "The Weeknd", songImage: "Art Cover/36_the_weeknd_save_your_tears.webp", songPath: "Lagu/Save Your Tears.mp3" },
    { id: 280, songName: "Closer", songDes: "The Chainsmokers, Halsey", songImage: "Art Cover/37_the_chainsmokers_closer.webp", songPath: "Lagu/Closer.mp3" },
    { id: 281, songName: "Way Back Home (feat. Conor Maynard) - Sam Feldt Edit", songDes: "SHAUN, Conor Maynard, Sam Feldt", songImage: "Art Cover/38_shaun_way_back_home__feat__conor_maynard____sam_feldt_edit.webp", songPath: "Lagu/Way Back Home (feat. Conor Maynard) - Sam Feldt Edit.mp3" },
    { id: 282, songName: "DARARI", songDes: "TREASURE", songImage: "Art Cover/39_treasure_darari.webp", songPath: "Lagu/DARARI.mp3" },
    { id: 283, songName: "Life Goes On", songDes: "BTS", songImage: "Art Cover/40_bts_life_goes_on.webp", songPath: "Lagu/Life Goes On.mp3" },
    { id: 284, songName: "Dynamite", songDes: "BTS", songImage: "Art Cover/41_bts_dynamite.webp", songPath: "Lagu/Dynamite.mp3" },
    { id: 285, songName: "LOVE SCENARIO", songDes: "iKON", songImage: "Art Cover/42_ikon_love_scenario.webp", songPath: "Lagu/LOVE SCENARIO.mp3" },
    { id: 286, songName: "Boy With Luv (feat. Halsey)", songDes: "BTS, Halsey", songImage: "Art Cover/43_bts_boy_with_luv__feat__halsey_.webp", songPath: "Lagu/Boy With Luv (feat. Halsey).mp3" },
    { id: 287, songName: "Blank Space", songDes: "Taylor Swift", songImage: "Art Cover/44_taylor_swift_blank_space.webp", songPath: "Lagu/Blank Space.mp3" },
    { id: 288, songName: "Symphony (feat. Zara Larsson)", songDes: "Clean Bandit, Zara Larsson", songImage: "Art Cover/45_clean_bandit_symphony__feat__zara_larsson_.webp", songPath: "Lagu/Symphony (feat. Zara Larsson).mp3" },
    { id: 289, songName: "The Middle", songDes: "Zedd, Maren Morris, Grey", songImage: "Art Cover/46_zedd_the_middle.webp", songPath: "Lagu/The Middle.mp3" },
    { id: 290, songName: "Let Me Go (with Alesso, Florida Georgia Line & watt)", songDes: "Hailee Steinfeld, Alesso, Florida Georgia Line, WATT", songImage: "Art Cover/47_hailee_steinfeld_let_me_go__with_alesso__florida_georgia_line___watt_.webp", songPath: "Lagu/Let Me Go (with Alesso, Florida Georgia Line & watt).mp3" },
    { id: 291, songName: "No Promises (feat. Demi Lovato)", songDes: "Cheat Codes, Demi Lovato", songImage: "Art Cover/48_cheat_codes_no_promises__feat__demi_lovato_.webp", songPath: "Lagu/No Promises (feat. Demi Lovato).mp3" },
    { id: 292, songName: "By Your Side", songDes: "Jonas Blue, RAYE", songImage: "Art Cover/49_jonas_blue_by_your_side.webp", songPath: "Lagu/By Your Side.mp3" },
    { id: 293, songName: "Shed a Light", songDes: "Robin Schulz, David Guetta, Cheat Codes", songImage: "Art Cover/50_robin_schulz_shed_a_light.webp", songPath: "Lagu/Shed a Light.mp3" },
    { id: 294, songName: "Mama", songDes: "Jonas Blue, William Singe", songImage: "Art Cover/51_jonas_blue_mama.webp", songPath: "Lagu/Mama.mp3" },
    { id: 295, songName: "Rise", songDes: "Jonas Blue, Jack & Jack", songImage: "Art Cover/52_jonas_blue_rise.webp", songPath: "Lagu/Rise.mp3" },
    { id: 296, songName: "Work from Home (feat. Ty Dolla $ign)", songDes: "Fifth Harmony, Ty Dolla $ign", songImage: "Art Cover/53_fifth_harmony_work_from_home__feat__ty_dolla__ign_.webp", songPath: "Lagu/Work from Home (feat. Ty Dolla $ign).mp3" },
    { id: 297, songName: "I.F.L.Y.", songDes: "Bazzi", songImage: "Art Cover/54_bazzi_i_f_l_y_.webp", songPath: "Lagu/I.F.L.Y..mp3" },
    { id: 298, songName: "Wolves", songDes: "Selena Gomez, Marshmello", songImage: "Art Cover/55_selena_gomez_wolves.webp", songPath: "Lagu/Wolves.mp3" },
    { id: 299, songName: "thank u, next", songDes: "Ariana Grande", songImage: "Art Cover/56_ariana_grande_thank_u__next.webp", songPath: "Lagu/thank u, next.mp3" },
    { id: 301, songName: "Night Changes", songDes: "One Direction", songImage: "Art Cover/58_one_direction_night_changes.webp", songPath: "Lagu/Night Changes.mp3" },
    { id: 302, songName: "Location Unknown ◐", songDes: "HONNE, Georgia", songImage: "Art Cover/59_honne_location_unknown__.webp", songPath: "Lagu/Location Unknown ◐.mp3" },
    { id: 303, songName: "Good Life (with G-Eazy & Kehlani)", songDes: "G-Eazy, Kehlani", songImage: "Art Cover/60_g_eazy_good_life__with_g_eazy___kehlani_.webp", songPath: "Lagu/Good Life (with G-Eazy & Kehlani).mp3" },
    { id: 304, songName: "Vacation", songDes: "Damon Empero, Veronica", songImage: "Art Cover/61_damon_empero_vacation.webp", songPath: "Lagu/Vacation.mp3" },
    { id: 305, songName: "Rain", songDes: "The Script", songImage: "Art Cover/62_the_script_rain.webp", songPath: "Lagu/Rain.mp3" },
    { id: 306, songName: "Rewrite The Stars", songDes: "James Arthur, Anne-Marie", songImage: "Art Cover/63_james_arthur_rewrite_the_stars.webp", songPath: "Lagu/Rewrite The Stars.mp3" },
    { id: 307, songName: "Dusk Till Dawn (feat. Sia) - Radio Edit", songDes: "ZAYN, Sia", songImage: "Art Cover/64_zayn_dusk_till_dawn__feat__sia____radio_edit.webp", songPath: "Lagu/02 - ZAYN, Sia - Dusk Till Dawn (feat. Sia) - Radio Edit.mp3" },
    { id: 308, songName: "A Whole New World (End Title) - From \"Aladdin\"", songDes: "ZAYN, Zhavia", songImage: "Art Cover/65_zayn_a_whole_new_world__end_title____from__aladdin_.webp", songPath: "Lagu/A Whole New World (End Title) - From _Aladdin_.mp3" },
    { id: 309, songName: "Let Me", songDes: "ZAYN", songImage: "Art Cover/66_zayn_let_me.webp", songPath: "Lagu/Let Me.mp3" },
    { id: 310, songName: "Young Dumb & Broke", songDes: "Khalid", songImage: "Art Cover/67_khalid_young_dumb___broke.webp", songPath: "Lagu/03 - Khalid - Young Dumb & Broke.mp3" },
    { id: 311, songName: "Good Side", songDes: "Crash Adams", songImage: "Art Cover/68_crash_adams_good_side.webp", songPath: "Lagu/Good Side.mp3" },
    { id: 312, songName: "Give Me a Kiss", songDes: "Crash Adams", songImage: "Art Cover/69_crash_adams_give_me_a_kiss.webp", songPath: "Lagu/Give Me a Kiss.mp3" },
    { id: 313, songName: "Starboy", songDes: "The Weeknd, Daft Punk", songImage: "Art Cover/70_the_weeknd_starboy.webp", songPath: "Lagu/Starboy.mp3" },
    { id: 314, songName: "Enchanted (Taylor's Version)", songDes: "Taylor Swift", songImage: "Art Cover/71_taylor_swift_enchanted__taylor_s_version_.webp", songPath: "Lagu/04 - Taylor Swift - Enchanted (Taylor's Version).mp3" },
    { id: 315, songName: "Just the Way You Are", songDes: "Bruno Mars", songImage: "Art Cover/72_bruno_mars_just_the_way_you_are.webp", songPath: "Lagu/Just the Way You Are.mp3" },
    { id: 316, songName: "Marry You", songDes: "Bruno Mars", songImage: "Art Cover/73_bruno_mars_marry_you.webp", songPath: "Lagu/Marry You.mp3" },
    { id: 317, songName: "พี่ชอบหนูที่สุดเลย (I Like You The Most)", songDes: "PONCHET, VARINZ", songImage: "Art Cover/74_ponchet_____________________i_like_you_the_most_.webp", songPath: "Lagu/05 - PONCHET, VARINZ - พี่ชอบหนูที่สุดเลย.mp3" },
    { id: 318, songName: "Shower", songDes: "Becky G", songImage: "Art Cover/75_becky_g_shower.webp", songPath: "Lagu/Shower.mp3" },
    { id: 319, songName: "Left and Right (Feat. Jung Kook of BTS)", songDes: "Charlie Puth, Jung Kook, BTS", songImage: "Art Cover/76_charlie_puth_left_and_right__feat__jung_kook_of_bts_.webp", songPath: "Lagu/Left and Right (Feat. Jung Kook of BTS).mp3" },
    { id: 320, songName: "No More Drama", songDes: "Charlie Puth", songImage: "Art Cover/77_charlie_puth_no_more_drama.webp", songPath: "Lagu/No More Drama.mp3" },
    { id: 321, songName: "Somebody To You", songDes: "The Chainsmokers, Coldplay", songImage: "Art Cover/78_the_vamps_somebody_to_you.webp", songPath: "Lagu/Somebody To You.mp3" },
    { id: 322, songName: "Club Can't Handle Me (feat. David Guetta)", songDes: "Flo Rida, David Guetta", songImage: "Art Cover/79_flo_rida_club_can_t_handle_me__feat__david_guetta_.webp", songPath: "Lagu/Club Can't Handle Me (feat. David Guetta).mp3" },
    { id: 323, songName: "Dessert - Remix", songDes: "Dawin, Silentó", songImage: "Art Cover/80_dawin_dessert___remix.webp", songPath: "Lagu/Dessert - Remix.mp3" },
    { id: 324, songName: "Marvin Gaye (feat. Wale) - Remix", songDes: "Charlie Puth, Wale", songImage: "Art Cover/81_charlie_puth_marvin_gaye__feat__wale____remix.webp", songPath: "Lagu/06 - Charlie Puth, Wale - Marvin Gaye (feat. Wale) - Remix.mp3" },
    { id: 325, songName: "One Last Time", songDes: "Ariana Grande", songImage: "Art Cover/82_ariana_grande_one_last_time.webp", songPath: "Lagu/One Last Time.mp3" },
    { id: 326, songName: "One Call Away", songDes: "Charlie Puth", songImage: "Art Cover/83_charlie_puth_one_call_away.webp", songPath: "Lagu/One Call Away.mp3" },
    { id: 327, songName: "Cheating on You", songDes: "Charlie Puth", songImage: "Art Cover/84_charlie_puth_cheating_on_you.webp", songPath: "Lagu/Cheating on You.mp3" },
    { id: 328, songName: "Steal My Girl", songDes: "One Direction", songImage: "Art Cover/85_one_direction_steal_my_girl.webp", songPath: "Lagu/Steal My Girl.mp3" },
    { id: 329, songName: "Paris", songDes: "The Chainsmokers", songImage: "Art Cover/87_the_chainsmokers_paris.webp", songPath: "Lagu/Paris.mp3" },
    { id: 330, songName: "Something Just Like This", songDes: "The Chainsmokers, Coldplay", songImage: "Art Cover/88_the_chainsmokers_something_just_like_this.webp", songPath: "Lagu/Something Just Like This.mp3" },
    { id: 331, songName: "Say You Won't Let Go", songDes: "James Arthur", songImage: "Art Cover/89_james_arthur_say_you_won_t_let_go.webp", songPath: "Lagu/Say You Won't Let Go.mp3" },
    { id: 332, songName: "Perfect", songDes: "Ed Sheeran", songImage: "Art Cover/90_ed_sheeran_perfect.webp", songPath: "Lagu/SpotiDown.App - Perfect - Ed Sheeran.mp3" },
    { id: 333, songName: "2002", songDes: "Anne-Marie", songImage: "Art Cover/91_anne_marie_2002.webp", songPath: "Lagu/2002.mp3" },
    { id: 334, songName: "Let Me Love You", songDes: "DJ Snake, Justin Bieber", songImage: "Art Cover/92_dj_snake_let_me_love_you.webp", songPath: "Lagu/Let Me Love You.mp3" },
    { id: 335, songName: "What Makes You Beautiful", songDes: "One Direction", songImage: "Art Cover/93_one_direction_what_makes_you_beautiful.webp", songPath: "Lagu/What Makes You Beautiful.mp3" },
    { id: 336, songName: "Back To You - From 13 Reasons Why – Season 2 Soundtrack", songDes: "Selena Gomez", songImage: "Art Cover/94_selena_gomez_back_to_you___from_13_reasons_why___season_2_soundtrack.webp", songPath: "Lagu/Back To You - From 13 Reasons Why – Season 2 Soundtrack.mp3" },
    { id: 337, songName: "Story of My Life", songDes: "One Direction", songImage: "Art Cover/95_one_direction_story_of_my_life.webp", songPath: "Lagu/Story of My Life.mp3" },
    { id: 338, songName: "See You Again (feat. Charlie Puth)", songDes: "Wiz Khalifa, Charlie Puth", songImage: "Art Cover/96_wiz_khalifa_see_you_again__feat__charlie_puth_.webp", songPath: "Lagu/See You Again (feat. Charlie Puth).mp3" },
    { id: 339, songName: "You & I", songDes: "One Direction", songImage: "Art Cover/97_one_direction_you___i.webp", songPath: "Lagu/07 - One Direction - You & I.mp3" },
    { id: 340, songName: "Beautiful People (feat. Khalid)", songDes: "Ed Sheeran, Khalid", songImage: "Art Cover/98_ed_sheeran_beautiful_people__feat__khalid_.webp", songPath: "Lagu/Beautiful People (feat. Khalid).mp3" },
    { id: 341, songName: "Bad Things (with Camila Cabello)", songDes: "mgk, Camila Cabello", songImage: "Art Cover/99_mgk_bad_things__with_camila_cabello_.webp", songPath: "Lagu/08 - mgk, Camila Cabello - Bad Things (with Camila Cabello).mp3" },
    { id: 342, songName: "Style", songDes: "Taylor Swift", songImage: "Art Cover/100_taylor_swift_style.webp", songPath: "Lagu/Style.mp3" },
    { id: 343, songName: "Count on Me", songDes: "Bruno Mars", songImage: "Art Cover/101_bruno_mars_count_on_me.webp", songPath: "Lagu/Count on Me.mp3" },
    { id: 344, songName: "Versace on the Floor", songDes: "Bruno Mars", songImage: "Art Cover/102_bruno_mars_versace_on_the_floor.webp", songPath: "Lagu/Versace on the Floor.mp3" },
    { id: 345, songName: "Rockabye (feat. Sean Paul & Anne-Marie)", songDes: "Clean Bandit, Anne-Marie, Sean Paul", songImage: "Art Cover/103_clean_bandit_rockabye__feat__sean_paul___anne_marie_.webp", songPath: "Lagu/09 - Clean Bandit, Anne-Marie, Sean Paul - Rockabye (feat. Sean Paul & Anne-Marie).mp3" },
    { id: 346, songName: "Perfect Strangers", songDes: "Jonas Blue, JP Cooper", songImage: "Art Cover/104_jonas_blue_perfect_strangers.webp", songPath: "Lagu/Perfect Strangers.mp3" },
    { id: 347, songName: "Nothin' on You (feat. Bruno Mars)", songDes: "B.o.B, Bruno Mars", songImage: "Art Cover/105_b_o_b_nothin__on_you__feat__bruno_mars_.webp", songPath: "Lagu/Nothin' on You (feat. Bruno Mars).mp3" },
    { id: 348, songName: "Silence", songDes: "Marshmello, Khalid", songImage: "Art Cover/106_marshmello_silence.webp", songPath: "Lagu/Silence.mp3" },
    { id: 349, songName: "It Ain't Me (with Selena Gomez)", songDes: "Kygo, Selena Gomez", songImage: "Art Cover/107_kygo_it_ain_t_me__with_selena_gomez_.webp", songPath: "Lagu/10 - Kygo, Selena Gomez - It Ain't Me (with Selena Gomez).mp3" },
    { id: 350, songName: "Tujuh Belas", songDes: "Tulus", songImage: "Art Cover/108_tulus_tujuh_belas.webp", songPath: "Lagu/Tujuh Belas.mp3" },
    { id: 351, songName: "Teman Bahagia", songDes: "Jaz", songImage: "Art Cover/109_jaz_teman_bahagia.webp", songPath: "Lagu/Teman Bahagia.mp3" },
    { id: 352, songName: "Anugerah Terindah", songDes: "Andmesh", songImage: "Art Cover/110_andmesh_anugerah_terindah.webp", songPath: "Lagu/Anugerah Terindah.mp3" },
    { id: 353, songName: "Remedi", songDes: "Tulus", songImage: "Art Cover/111_tulus_remedi.webp", songPath: "Lagu/Remedi.mp3" },
    { id: 354, songName: "Ku Milik-Mu", songDes: "Maher Zain", songImage: "Art Cover/112_maher_zain_ku_milik_mu.webp", songPath: "Lagu/SpotiDown.App - Ku Milik-Mu - Maher Zain.mp3" },
    { id: 355, songName: "Satu-Satu", songDes: "Idgitaf", songImage: "Art Cover/113_idgitaf_satu_satu.webp", songPath: "Lagu/Satu-Satu.mp3" },
    { id: 356, songName: "Ku Milik-Mu", songDes: "Maher Zain", songImage: "Art Cover/112_maher_zain_ku_milik_mu.webp", songPath: "Lagu/SpotiDown.App - Ku Milik-Mu - Maher Zain.mp3", hidden: true, keyword: ["maher zain", "ku milik-mu"] },
    { id: 357, songName: "Tampar", songDes: "Juicy Luicy", songImage: "Art Cover/114_juicy_luicy_tampar.webp", songPath: "Lagu/Tampar.mp3" },
    { id: 358, songName: "Dunia Tipu-Tipu", songDes: "Yura Yunita", songImage: "Art Cover/115_yura_yunita_dunia_tipu_tipu.webp", songPath: "Lagu/Dunia Tipu-Tipu.mp3" },
    { id: 359, songName: "Komang", songDes: "Raim Laode", songImage: "Art Cover/116_raim_laode_komang.webp", songPath: "Lagu/Komang.mp3" },
    { id: 360, songName: "Rumah Ke Rumah", songDes: "Hindia", songImage: "Art Cover/117_hindia_rumah_ke_rumah.webp", songPath: "Lagu/Rumah Ke Rumah.mp3" },
    { id: 361, songName: "Akad", songDes: "Payung Teduh", songImage: "Art Cover/118_payung_teduh_akad.webp", songPath: "Lagu/Akad.mp3" },
    { id: 362, songName: "Gala bunga matahari", songDes: "Sal Priadi", songImage: "Art Cover/119_sal_priadi_gala_bunga_matahari.webp", songPath: "Lagu/12 - Sal Priadi - Gala bunga matahari.mp3" },
    { id: 363, songName: "Jakarta Hari Ini", songDes: "For Revenge, Stereo Wall", songImage: "Art Cover/149_for_revenge_jakarta_hari_ini.webp", songPath: "Lagu/Jakarta Hari Ini.mp3" },
    { id: 364, songName: "Satu Bulan", songDes: "Bernadya", songImage: "Art Cover/121_bernadya_satu_bulan.webp", songPath: "Lagu/Satu Bulan.mp3" },
    { id: 365, songName: "Lantas", songDes: "Juicy Luicy", songImage: "Art Cover/122_juicy_luicy_lantas.webp", songPath: "Lagu/Lantas.mp3" },
    { id: 366, songName: "Interaksi", songDes: "Tulus", songImage: "Art Cover/123_tulus_interaksi.webp", songPath: "Lagu/Interaksi.mp3" },
    { id: 367, songName: "Runtuh", songDes: "Feby Putri, Fiersa Besari", songImage: "Art Cover/124_feby_putri_runtuh.webp", songPath: "Lagu/Runtuh.mp3" },
    { id: 368, songName: "Jiwa Yang Bersedih", songDes: "Ghea Indrawari", songImage: "Art Cover/125_ghea_indrawari_jiwa_yang_bersedih.webp", songPath: "Lagu/Jiwa Yang Bersedih.mp3" },
    { id: 369, songName: "Monokrom", songDes: "Tulus", songImage: "Art Cover/126_tulus_monokrom.webp", songPath: "Lagu/Monokrom.mp3" },
    { id: 370, songName: "Evaluasi", songDes: "Hindia", songImage: "Art Cover/127_hindia_evaluasi.webp", songPath: "Lagu/Evaluasi.mp3" },
    { id: 371, songName: "Mesin Waktu", songDes: "Budi Doremi", songImage: "Art Cover/128_budi_doremi_mesin_waktu.webp", songPath: "Lagu/Mesin Waktu.mp3" },
    { id: 372, songName: "Karena Kamu", songDes: "Geisha", songImage: "Art Cover/129_geisha_karena_kamu.webp", songPath: "Lagu/Karena Kamu.mp3" },
    { id: 373, songName: "Secukupnya", songDes: "Hindia", songImage: "Art Cover/130_hindia_secukupnya.webp", songPath: "Lagu/Secukupnya.mp3" },
    { id: 374, songName: "Laskar Pelangi", songDes: "Nidji", songImage: "Art Cover/131_nidji_laskar_pelangi.webp", songPath: "Lagu/Laskar Pelangi.mp3" },
    { id: 375, songName: "Lampu Kuning", songDes: "Juicy Luicy", songImage: "Art Cover/132_juicy_luicy_lampu_kuning.webp", songPath: "Lagu/Lampu Kuning.mp3" },
    { id: 376, songName: "Bersamamu", songDes: "Jaz", songImage: "Art Cover/133_jaz_bersamamu.webp", songPath: "Lagu/Bersamamu.mp3" },
    { id: 377, songName: "1000 Tahun Lamanya", songDes: "Tulus", songImage: "Art Cover/134_tulus_1000_tahun_lamanya.webp", songPath: "Lagu/1000 Tahun Lamanya.mp3" },
    { id: 378, songName: "Berdua Bersama", songDes: "Jaz", songImage: "Art Cover/153_jaz_berdua_bersama.webp", songPath: "Lagu/Berdua Bersama.mp3" },
    { id: 379, songName: "Takut", songDes: "Idgitaf", songImage: "Art Cover/136_idgitaf_takut.webp", songPath: "Lagu/Takut.mp3" },
    { id: 380, songName: "Film Favorit", songDes: "Sheila On 7", songImage: "Art Cover/138_sheila_on_7_film_favorit.webp", songPath: "Lagu/Film Favorit.mp3" },
    { id: 381, songName: "Ga Romantis", songDes: "Lyla", songImage: "Art Cover/139_lyla_ga_romantis.webp", songPath: "Lagu/Ga Romantis.mp3" },
    { id: 382, songName: "terima kasih", songDes: "Halstage", songImage: "Art Cover/140_halstage_terima_kasih.webp", songPath: "Lagu/terima kasih.mp3" },
    { id: 383, songName: "Cinta Dan Rahasia", songDes: "Yura Yunita, Glenn Fredly", songImage: "Art Cover/141_yura_yunita_cinta_dan_rahasia.webp", songPath: "Lagu/Cinta Dan Rahasia.mp3" },
    { id: 384, songName: "Mata Ke Hati (Acoustic Version)", songDes: "Hivi!", songImage: "Art Cover/143_hivi__mata_ke_hati__acoustic_version_.webp", songPath: "Lagu/Mata Ke Hati (Acoustic Version).mp3" },
    { id: 385, songName: "Nina", songDes: ".Feast", songImage: "Art Cover/145__feast_nina.webp", songPath: "Lagu/13 - Feast - Nina.mp3" },
    { id: 386, songName: "Serana", songDes: "For Revenge", songImage: "Art Cover/146_for_revenge_serana.webp", songPath: "Lagu/Serana.mp3" },
    { id: 387, songName: "Bunga Maaf", songDes: "The Lantis", songImage: "Art Cover/147_the_lantis_bunga_maaf.webp", songPath: "Lagu/Bunga Maaf.mp3" },
    { id: 388, songName: "Cincin", songDes: "Hindia", songImage: "Art Cover/148_hindia_cincin.webp", songPath: "Lagu/Cincin.mp3" },
    { id: 389, songName: "Peradaban", songDes: ".Feast", songImage: "Art Cover/151__feast_peradaban.webp", songPath: "Lagu/Peradaban.mp3" },
    { id: 390, songName: "Akhir Tak Bahagia", songDes: "Misellia", songImage: "Art Cover/152_misellia_akhir_tak_bahagia.webp", songPath: "Lagu/Akhir Tak Bahagia.mp3" },
    { id: 391, songName: "Bumerang", songDes: "Tulus", songImage: "Art Cover/154_tulus_bumerang.webp", songPath: "Lagu/Bumerang.mp3" },
    { id: 392, songName: "Kaka Main Salah", songDes: "Kapthenpurek, Silet Open Up", songImage: "Art Cover/155_kapthenpurek_kaka_main_salah.webp", songPath: "Lagu/Kaka Main Salah.mp3" },
    { id: 393, songName: "Dari Mata", songDes: "Jaz", songImage: "Art Cover/156_jaz_dari_mata.webp", songPath: "Lagu/Dari Mata.mp3" },
    { id: 394, songName: "Kesempurnaan Cinta", songDes: "Rizky Febian", songImage: "Art Cover/157_rizky_febian_kesempurnaan_cinta.webp", songPath: "Lagu/Kesempurnaan Cinta.mp3" },
    { id: 395, songName: "Mangu", songDes: "Fourtwnty, Charita Utami", songImage: "Art Cover/158_fourtwnty_mangu.webp", songPath: "Lagu/Mangu.mp3" },
    { id: 396, songName: "Kita usahakan rumah itu", songDes: "Sal Priadi", songImage: "Art Cover/159_sal_priadi_kita_usahakan_rumah_itu.webp", songPath: "Lagu/Kita usahakan rumah itu.mp3" },
    { id: 397, songName: "Nanti Kita Seperti Ini", songDes: "Batas Senja", songImage: "Art Cover/160_batas_senja_nanti_kita_seperti_ini.webp", songPath: "Lagu/Nanti Kita Seperti Ini.mp3" },
    { id: 398, songName: "Lesung Pipi", songDes: "Raim Laode", songImage: "Art Cover/161_raim_laode_lesung_pipi.webp", songPath: "Lagu/Lesung Pipi.mp3" },
    { id: 399, songName: "L", songDes: "Halstage", songImage: "Art Cover/162_halstage_l.webp", songPath: "Lagu/L.mp3" },
    { id: 400, songName: "Usik", songDes: "Feby Putri", songImage: "Art Cover/163_feby_putri_usik.webp", songPath: "Lagu/Usik.mp3" },
    { id: 401, songName: "Kembali Pulang", songDes: "Suara Kayu, Feby Putri", songImage: "Art Cover/164_suara_kayu_kembali_pulang.webp", songPath: "Lagu/Kembali Pulang.mp3" },
    { id: 402, songName: "Pura Pura Lupa", songDes: "Mahen", songImage: "Art Cover/165_mahen_pura_pura_lupa.webp", songPath: "Lagu/Pura Pura Lupa.mp3" },
    { id: 403, songName: "Asmalibrasi", songDes: "Soegi Bornean", songImage: "Art Cover/166_soegi_bornean_asmalibrasi.webp", songPath: "Lagu/Asmalibrasi.mp3" },
    { id: 404, songName: "perayaan mati rasa", songDes: "Umay Shahab, Natania Karin", songImage: "Art Cover/167_umay_shahab_perayaan_mati_rasa.webp", songPath: "Lagu/perayaan mati rasa.mp3" },
    { id: 405, songName: "Hari Bersamanya", songDes: "Sheila On 7", songImage: "Art Cover/168_sheila_on_7_hari_bersamanya.webp", songPath: "Lagu/Hari Bersamanya.mp3" },
    { id: 406, songName: "Surat Cinta Untuk Starla", songDes: "Virgoun", songImage: "Art Cover/169_virgoun_surat_cinta_untuk_starla.webp", songPath: "Lagu/SpotiDown.App - Surat Cinta Untuk Starla - Virgoun.mp3" },
    { id: 407, songName: "Bila Kau Tak Disampingku", songDes: "Sheila On 7", songImage: "Art Cover/170_sheila_on_7_bila_kau_tak_disampingku.webp", songPath: "Lagu/Bila Kau Tak Disampingku.mp3" },
    { id: 408, songName: "everything u are", songDes: "Hindia", songImage: "Art Cover/171_hindia_everything_u_are.webp", songPath: "Lagu/15 - Hindia - everything u are.mp3" },
    { id: 409, songName: "Hingga Tua Bersama", songDes: "Rizky Febian", songImage: "Art Cover/172_rizky_febian_hingga_tua_bersama.webp", songPath: "Lagu/16 - Rizky Febian - Hingga Tua Bersama.mp3" },
    { id: 410, songName: "Sedia Aku Sebelum Hujan", songDes: "Idgitaf", songImage: "Art Cover/173_idgitaf_sedia_aku_sebelum_hujan.webp", songPath: "Lagu/17 - Idgitaf - Sedia Aku Sebelum Hujan.mp3" },
    { id: 411, songName: "Cantik", songDes: "Tiara Andini, Arsy Widianto", songImage: "Art Cover/174_tiara_andini_cantik.webp", songPath: "Lagu/Cantik.mp3" },
    { id: 412, songName: "bergema sampai selamanya", songDes: "Nadhif Basalamah", songImage: "Art Cover/175_nadhif_basalamah_bergema_sampai_selamanya.webp", songPath: "Lagu/bergema sampai selamanya.mp3" },
    { id: 413, songName: "Sebuah Kisah Klasik", songDes: "Sheila On 7", songImage: "Art Cover/176_sheila_on_7_sebuah_kisah_klasik.webp", songPath: "Lagu/Sebuah Kisah Klasik.mp3" },
    { id: 414, songName: "Perahu Kertas", songDes: "Maudy Ayunda", songImage: "Art Cover/177_maudy_ayunda_perahu_kertas.webp", songPath: "Lagu/Perahu Kertas.mp3" },
    { id: 415, songName: "Bicara (feat. Monita Tahalea)", songDes: "TheOvertunes, Monita Tahalea", songImage: "Art Cover/178_theovertunes_bicara__feat__monita_tahalea_.webp", songPath: "Lagu/18 - TheOvertunes, Monita Tahalea - Bicara (feat. Monita Tahalea).mp3" },
    { id: 416, songName: "Bahagia Lagi", songDes: "Piche Kota", songImage: "Art Cover/179_piche_kota_bahagia_lagi.webp", songPath: "Lagu/Bahagia Lagi.mp3" },
    { id: 417, songName: "Bad Liar", songDes: "Imagine Dragons", songImage: "Art Cover/180_imagine_dragons_bad_liar.webp", songPath: "Lagu/Bad Liar.mp3" },
    { id: 418, songName: "Memories", songDes: "Maroon 5", songImage: "Art Cover/181_maroon_5_memories.webp", songPath: "Lagu/Memories.mp3" },
    { id: 419, songName: "Before You Go", songDes: "Lewis Capaldi", songImage: "Art Cover/182_lewis_capaldi_before_you_go.webp", songPath: "Lagu/Before You Go.mp3" },
    { id: 420, songName: "drunk text", songDes: "Henry Moodie", songImage: "Art Cover/183_henry_moodie_drunk_text.webp", songPath: "Lagu/drunk text.mp3" },
    { id: 421, songName: "Imagination", songDes: "Shawn Mendes", songImage: "Art Cover/184_shawn_mendes_imagination.webp", songPath: "Lagu/Imagination.mp3" },
    { id: 422, songName: "On My Way", songDes: "Alan Walker, Sabrina Carpenter, Farruko", songImage: "Art Cover/185_alan_walker_on_my_way.webp", songPath: "Lagu/On My Way.mp3" },
    { id: 423, songName: "Despacito", songDes: "Luis Fonsi, Daddy Yankee", songImage: "Art Cover/186_luis_fonsi_despacito.webp", songPath: "Lagu/Despacito.mp3" },
    { id: 424, songName: "Fix You", songDes: "Coldplay", songImage: "Art Cover/187_coldplay_fix_you.webp", songPath: "Lagu/Fix You.mp3" },
    { id: 425, songName: "A Sky Full of Stars", songDes: "Coldplay", songImage: "Art Cover/188_coldplay_a_sky_full_of_stars.webp", songPath: "Lagu/A Sky Full of Stars.mp3" },
    { id: 426, songName: "Happier", songDes: "Marshmello, Bastille", songImage: "Art Cover/189_marshmello_happier.webp", songPath: "Lagu/Happier.mp3" },
    { id: 427, songName: "Señorita", songDes: "Shawn Mendes, Camila Cabello", songImage: "Art Cover/190_shawn_mendes_se_orita.webp", songPath: "Lagu/Señorita.mp3" },
    { id: 428, songName: "Perfect", songDes: "One Direction", songImage: "Art Cover/192_one_direction_perfect.webp", songPath: "Lagu/Perfect.mp3" },
    { id: 429, songName: "18", songDes: "One Direction", songImage: "Art Cover/193_one_direction_18.webp", songPath: "Lagu/18.mp3" },
    { id: 430, songName: "At My Worst", songDes: "Pink Sweat$", songImage: "Art Cover/194_pink_sweat__at_my_worst.webp", songPath: "Lagu/At My Worst.mp3" },
    { id: 431, songName: "Dandelions", songDes: "Ruth B.", songImage: "Art Cover/195_ruth_b__dandelions.webp", songPath: "Lagu/Dandelions.mp3" },
    { id: 432, songName: "A Thousand Years", songDes: "James Arthur", songImage: "Art Cover/196_james_arthur_a_thousand_years.webp", songPath: "Lagu/SpotiDown.App - A Thousand Years - James Arthur.mp3" },
    { id: 433, songName: "The Man Who Can't Be Moved", songDes: "The Script", songImage: "Art Cover/197_the_script_the_man_who_can_t_be_moved.webp", songPath: "Lagu/The Man Who Can't Be Moved.mp3" },
    { id: 434, songName: "Right Now", songDes: "One Direction", songImage: "Art Cover/198_one_direction_right_now.webp", songPath: "Lagu/Right Now.mp3" },
    { id: 435, songName: "a thousand years", songDes: "Christina Perri", songImage: "Art Cover/199_christina_perri_a_thousand_years.webp", songPath: "Lagu/a thousand years.mp3" },
    { id: 436, songName: "Strong", songDes: "One Direction", songImage: "Art Cover/201_one_direction_strong.webp", songPath: "Lagu/Strong.mp3" },
    { id: 437, songName: "Someone You Loved", songDes: "Lewis Capaldi", songImage: "Art Cover/203_lewis_capaldi_someone_you_loved.webp", songPath: "Lagu/Someone You Loved.mp3" },
    { id: 438, songName: "Sunroof", songDes: "Nicky Youre, hey daisy", songImage: "Art Cover/204_nicky_youre_sunroof.webp", songPath: "Lagu/Sunroof.mp3" },
    { id: 439, songName: "On My Mind", songDes: "Maximillian", songImage: "Art Cover/206_maximillian_on_my_mind.webp", songPath: "Lagu/On My Mind.mp3" },
    { id: 440, songName: "blue", songDes: "yung kai", songImage: "Art Cover/207_yung_kai_blue.webp", songPath: "Lagu/blue.mp3" },
    { id: 441, songName: "In The Stars", songDes: "Benson Boone", songImage: "Art Cover/208_benson_boone_in_the_stars.webp", songPath: "Lagu/In The Stars.mp3" },
    { id: 442, songName: "Rude", songDes: "MAGIC!", songImage: "Art Cover/209_magic__rude.webp", songPath: "Lagu/Rude.mp3" },
    { id: 443, songName: "Savage Love (Laxed - Siren Beat)", songDes: "Jawsh 685, Jason Derulo", songImage: "Art Cover/210_jawsh_685_savage_love__laxed___siren_beat_.webp", songPath: "Lagu/Savage Love (Laxed - Siren Beat).mp3" },
    { id: 444, songName: "That’s Not How This Works (feat. Dan + Shay)", songDes: "Charlie Puth, Dan + Shay", songImage: "Art Cover/211_charlie_puth_that_s_not_how_this_works__feat__dan___shay_.webp", songPath: "Lagu/That’s Not How This Works (feat. Dan + Shay).mp3" },
    { id: 445, songName: "Here's Your Perfect", songDes: "Jamie Miller", songImage: "Art Cover/212_jamie_miller_here_s_your_perfect.webp", songPath: "Lagu/Here's Your Perfect.mp3" },
    { id: 446, songName: "It's You", songDes: "Ali Gatie", songImage: "Art Cover/213_ali_gatie_it_s_you.webp", songPath: "Lagu/It's You.mp3" },
    { id: 447, songName: "Be Alright", songDes: "Dean Lewis", songImage: "Art Cover/214_dean_lewis_be_alright.webp", songPath: "Lagu/Be Alright.mp3" },
    { id: 448, songName: "Photograph", songDes: "Ed Sheeran", songImage: "Art Cover/215_ed_sheeran_photograph.webp", songPath: "Lagu/Photograph.mp3" },
    { id: 449, songName: "Give Me Your Forever", songDes: "Zack Tabudlo", songImage: "Art Cover/216_zack_tabudlo_give_me_your_forever.webp", songPath: "Lagu/Give Me Your Forever.mp3" },
    { id: 450, songName: "Number One For Me", songDes: "Maher Zain", songImage: "Art Cover/217_maher_zain_number_one_for_me.webp", songPath: "Lagu/19 - Maher Zain - Number One For Me.mp3" },
    { id: 451, songName: "Number One For Me", songDes: "Maher Zain", songImage: "Art Cover/217_maher_zain_number_one_for_me.webp", songPath: "Lagu/19 - Maher Zain - Number One For Me.mp3", hidden: true, keyword: ["maher zain", "number one for me"] },
    { id: 452, songName: "Too Good At Goodbyes", songDes: "Sam Smith", songImage: "Art Cover/218_sam_smith_too_good_at_goodbyes.webp", songPath: "Lagu/Too Good At Goodbyes.mp3" },
    { id: 453, songName: "That’s So True", songDes: "Gracie Abrams", songImage: "Art Cover/219_gracie_abrams_that_s_so_true.webp", songPath: "Lagu/That’s So True.mp3" },
    { id: 454, songName: "12:45 - Stripped", songDes: "Etham", songImage: "Art Cover/220_etham_12_45___stripped.webp", songPath: "Lagu/12_45 - Stripped.mp3" },
    { id: 455, songName: "Like I Do", songDes: "J.Tajor", songImage: "Art Cover/221_j_tajor_like_i_do.webp", songPath: "Lagu/Like I Do.mp3" },
    { id: 456, songName: "comethru", songDes: "Jeremy Zucker", songImage: "Art Cover/222_jeremy_zucker_comethru.webp", songPath: "Lagu/comethru.mp3" },
    { id: 457, songName: "you broke me first", songDes: "Tate McRae", songImage: "Art Cover/223_tate_mcrae_you_broke_me_first.webp", songPath: "Lagu/you broke me first.mp3" },
    { id: 458, songName: "SNAP", songDes: "Rosa Linn", songImage: "Art Cover/224_rosa_linn_snap.webp", songPath: "Lagu/SNAP.mp3" },
    { id: 459, songName: "All of Me", songDes: "John Legend", songImage: "Art Cover/225_john_legend_all_of_me.webp", songPath: "Lagu/All of Me.mp3" },
    { id: 460, songName: "Thinking out Loud", songDes: "Ed Sheeran", songImage: "Art Cover/226_ed_sheeran_thinking_out_loud.webp", songPath: "Lagu/Thinking out Loud.mp3" },
    { id: 461, songName: "7 Years", songDes: "Lukas Graham", songImage: "Art Cover/227_lukas_graham_7_years.webp", songPath: "Lagu/7 Years.mp3" },
    { id: 462, songName: "Girls Like You", songDes: "Maroon 5", songImage: "Art Cover/228_maroon_5_girls_like_you.webp", songPath: "Lagu/Girls Like You.mp3" },
    { id: 463, songName: "There's Nothing Holdin' Me Back", songDes: "Shawn Mendes", songImage: "Art Cover/229_shawn_mendes_there_s_nothing_holdin__me_back.webp", songPath: "Lagu/There's Nothing Holdin' Me Back.mp3" },
    { id: 464, songName: "Sorry", songDes: "Justin Bieber", songImage: "Art Cover/230_justin_bieber_sorry.webp", songPath: "Lagu/Sorry.mp3" },
    { id: 465, songName: "Shape of You", songDes: "Ed Sheeran", songImage: "Art Cover/232_ed_sheeran_shape_of_you.webp", songPath: "Lagu/Shape of You.mp3" },
    { id: 466, songName: "Hotline Bling", songDes: "Drake", songImage: "Art Cover/233_drake_hotline_bling.webp", songPath: "Lagu/Hotline Bling.mp3" },
    { id: 467, songName: "pick up the phone", songDes: "Henry Moodie", songImage: "Art Cover/234_henry_moodie_pick_up_the_phone.webp", songPath: "Lagu/pick up the phone.mp3" },
    { id: 468, songName: "Without Me", songDes: "Halsey", songImage: "Art Cover/235_halsey_without_me.webp", songPath: "Lagu/Without Me.mp3" },
    { id: 469, songName: "Stitches", songDes: "Shawn Mendes", songImage: "Art Cover/236_shawn_mendes_stitches.webp", songPath: "Lagu/Stitches.mp3" },
    { id: 470, songName: "Blinding Lights", songDes: "The Weeknd", songImage: "Art Cover/237_the_weeknd_blinding_lights.webp", songPath: "Lagu/Blinding Lights.mp3" },
    { id: 471, songName: "An Art Gallery Could Never Be As Unique As You", songDes: "mrld", songImage: "Art Cover/238_mrld_an_art_gallery_could_never_be_as_unique_as_you.webp", songPath: "Lagu/An Art Gallery Could Never Be As Unique As You.mp3" },
    { id: 472, songName: "Love Yourself", songDes: "Justin Bieber", songImage: "Art Cover/239_justin_bieber_love_yourself.webp", songPath: "Lagu/Love Yourself.mp3" },
    { id: 473, songName: "I Don't Care", songDes: "Ed Sheeran, Justin Bieber", songImage: "Art Cover/240_ed_sheeran_i_don_t_care.webp", songPath: "Lagu/I Don't Care.mp3" },
    { id: 474, songName: "Off My Face", songDes: "Justin Bieber", songImage: "Art Cover/241_justin_bieber_off_my_face.webp", songPath: "Lagu/Off My Face.mp3" },
    { id: 475, songName: "Maps", songDes: "Maroon 5", songImage: "Art Cover/242_maroon_5_maps.webp", songPath: "Lagu/Maps.mp3" },
    { id: 476, songName: "Animals", songDes: "Maroon 5", songImage: "Art Cover/243_maroon_5_animals.webp", songPath: "Lagu/Animals.mp3" },
    { id: 477, songName: "Yellow", songDes: "Coldplay", songImage: "Art Cover/244_coldplay_yellow.webp", songPath: "Lagu/Yellow.mp3" },
    { id: 478, songName: "Eenie Meenie", songDes: "Sean Kingston, Justin Bieber", songImage: "Art Cover/245_sean_kingston_eenie_meenie.webp", songPath: "Lagu/Eenie Meenie.mp3" },
    { id: 479, songName: "Locked Away (feat. Adam Levine)", songDes: "R. City, Adam Levine", songImage: "Art Cover/246_r__city_locked_away__feat__adam_levine_.webp", songPath: "Lagu/Locked Away (feat. Adam Levine).mp3" },
    { id: 480, songName: "The Nights", songDes: "Avicii", songImage: "Art Cover/247_avicii_the_nights.webp", songPath: "Lagu/The Nights.mp3" },
    { id: 481, songName: "Until I Found You (with Em Beihold) - Em Beihold Version", songDes: "Stephen Sanchez, Em Beihold", songImage: "Art Cover/248_stephen_sanchez_until_i_found_you__with_em_beihold____em_beihold_version.webp", songPath: "Lagu/20 - Stephen Sanchez, Em Beihold - Until I Found You (with Em Beihold) - Em Beihold Version.mp3" },
    { id: 482, songName: "Train Wreck", songDes: "James Arthur", songImage: "Art Cover/249_james_arthur_train_wreck.webp", songPath: "Lagu/Train Wreck.mp3" },
    { id: 483, songName: "STAY (with Justin Bieber)", songDes: "The Kid LAROI, Justin Bieber", songImage: "Art Cover/250_the_kid_laroi_stay__with_justin_bieber_.webp", songPath: "Lagu/21 - The Kid LAROI, Justin Bieber - STAY (with Justin Bieber).mp3" },
    { id: 484, songName: "Lonely (with benny blanco)", songDes: "Justin Bieber, benny blanco", songImage: "Art Cover/251_justin_bieber_lonely__with_benny_blanco_.webp", songPath: "Lagu/SpotiDown.App - Lonely _with benny blanco_ - Justin Bieber.mp3" },
    { id: 485, songName: "Castle on the Hill", songDes: "Ed Sheeran", songImage: "Art Cover/252_ed_sheeran_castle_on_the_hill.webp", songPath: "Lagu/Castle on the Hill.mp3" },
    { id: 486, songName: "You'll Be in My Heart", songDes: "NIKI", songImage: "Art Cover/253_niki_you_ll_be_in_my_heart.webp", songPath: "Lagu/You'll Be in My Heart.mp3" },
    { id: 487, songName: "To the Bone", songDes: "Pamungkas", songImage: "Art Cover/254_pamungkas_to_the_bone.webp", songPath: "Lagu/To the Bone.mp3" },
    { id: 488, songName: "Those Eyes", songDes: "New West", songImage: "Art Cover/256_new_west_those_eyes.webp", songPath: "Lagu/Those Eyes.mp3" },
    { id: 489, songName: "Here With Me", songDes: "d4vd", songImage: "Art Cover/257_d4vd_here_with_me.webp", songPath: "Lagu/Here With Me.mp3" },
    { id: 490, songName: "double take", songDes: "Dhruv", songImage: "Art Cover/258_dhruv_double_take.webp", songPath: "Lagu/double take.mp3" },
    { id: 491, songName: "Location Unknown ◐ (feat. BEKA) - Brooklyn Session", songDes: "HONNE, BEKA", songImage: "Art Cover/259_honne_location_unknown____feat__beka____brooklyn_session.webp", songPath: "Lagu/Location Unknown ◐ (feat. BEKA) - Brooklyn Session.mp3" },
    { id: 492, songName: "Sailor Song", songDes: "Gigi Perez", songImage: "Art Cover/260_gigi_perez_sailor_song.webp", songPath: "Lagu/Sailor Song.mp3" },
    { id: 493, songName: "Lonely", songDes: "Akon", songImage: "Art Cover/262_akon_lonely.webp", songPath: "Lagu/Lonely.mp3" },
    { id: 494, songName: "Right Now (Na Na Na)", songDes: "Akon", songImage: "Art Cover/263_akon_right_now__na_na_na_.webp", songPath: "Lagu/Right Now (Na Na Na).mp3" },
    { id: 495, songName: "Shut Up and Dance", songDes: "WALK THE MOON", songImage: "Art Cover/264_walk_the_moon_shut_up_and_dance.webp", songPath: "Lagu/Shut Up and Dance.mp3" },
    { id: 496, songName: "I'm Yours", songDes: "Jason Mraz", songImage: "Art Cover/265_jason_mraz_i_m_yours.webp", songPath: "Lagu/I'm Yours.mp3" },
    { id: 497, songName: "Intentions (feat. Quavo)", songDes: "Justin Bieber, Quavo", songImage: "Art Cover/266_justin_bieber_intentions__feat__quavo_.webp", songPath: "Lagu/Intentions (feat. Quavo).mp3" },
    { id: 498, songName: "If the World Was Ending (feat. Julia Michaels)", songDes: "JP Saxe, Julia Michaels", songImage: "Art Cover/267_jp_saxe_if_the_world_was_ending__feat__julia_michaels_.webp", songPath: "Lagu/SpotiDown.App - If the World Was Ending _feat. Julia Michaels_ - JP Saxe.mp3" },
    { id: 499, songName: "Little Bit Better", songDes: "Caleb Hearn, ROSIE", songImage: "Art Cover/268_caleb_hearn_little_bit_better.webp", songPath: "Lagu/Little Bit Better.mp3" },
    { id: 500, songName: "Scars", songDes: "Keenan Te", songImage: "Art Cover/269_keenan_te_scars.webp", songPath: "Lagu/SpotiDown.App - Scars - Keenan Te.mp3" },
    { id: 501, songName: "death bed (coffee for your head)", songDes: "Powfu, beabadoobee", songImage: "Art Cover/272_powfu_death_bed__coffee_for_your_head_.webp", songPath: "Lagu/24 - Powfu, beabadoobee - death bed (coffee for your head).mp3", hidden: true, keyword: ["powfu", "beabadoobee", "death bed"] },
    { id: 502, songName: "Cowgirls Don't Cry", songDes: "Gamma Skies, Emmi", songImage: "Art Cover/270_gamma_skies_cowgirls_don_t_cry.webp", songPath: "Lagu/22 - Gamma Skies, Emmi - Cowgirls Don't Cry.mp3" },
    { id: 503, songName: "Staying", songDes: "Lizzy McAlpine", songImage: "Art Cover/271_lizzy_mcalpine_staying.webp", songPath: "Lagu/23 - Lizzy McAlpine - Staying.mp3" },
    { id: 504, songName: "Sandali", songDes: "Cup of Joe", songImage: "Art Cover/273_cup_of_joe_sandali.webp", songPath: "Lagu/25 - Cup of Joe - Sandali.mp3" },
    { id: 505, songName: "Here With Me", songDes: "Marshmello, CHVRCHES", songImage: "Art Cover/274_marshmello_here_with_me.webp", songPath: "Lagu/Here With Me.mp3" },
    { id: 506, songName: "24/7, 365", songDes: "elijah woods", songImage: "Art Cover/275_elijah_woods_24_7__365.webp", songPath: "Lagu/7, 365.mp3" },
    { id: 507, songName: "Like 1999", songDes: "Valley", songImage: "Art Cover/276_valley_like_1999.webp", songPath: "Lagu/Like 1999.mp3" },
    { id: 508, songName: "FRIENDS", songDes: "Marshmello, Anne-Marie", songImage: "Art Cover/277_marshmello_friends.webp", songPath: "Lagu/FRIENDS.mp3" },
    { id: 509, songName: "Sakura", songDes: "Rossa", songImage: "Art Cover/278_rossa_sakura.webp", songPath: "Lagu/Sakura.mp3" },
    { id: 510, songName: "boba date", songDes: "Stream Cafe", songImage: "Art Cover/279_boba_date__stream_cafe.webp", songPath: "Lagu/SpotiDownloader.com - boba date - Stream Cafe.mp3" },
    { id: 511, songName: "Kimi Dake wo Mamoritai", songDes: "Takeshi Tsuruno", songImage: "Art Cover/Kimi Dake wo Mamoritai.webp", songPath: "Lagu/Kimi Dake wo Mamoritai.mp3", hidden: true, keyword: ["takeshi tsuruno", "kimi dake wo mamoritai"] },
    { id: 512, songName: "Kupu - Kupu", songDes: "Tiara Andini", songImage: "Art Cover/Kupu - Kupu.webp", songPath: "Lagu/Kupu - Kupu.mp3" },
    { id: 513, songName: "Ultraman Orb | Versão Brasileira", songDes: "YouDubb", songImage: "Art Cover/Ultraman Orb _ Versão Brasileira.webp", songPath: "Lagu/Ultraman Orb _ Versão Brasileira.mp3", hidden: true, keyword: ["youdubb", "ultraman orb", "versao brasileira"] }
];

const visibleSongs = songs.filter(s => !s.hidden);

// pastikan lagu yang sedang diputar (termasuk yang rahasia) tetap ada di antrean
function withCurrent(list, songId) {
    if (list.some(s => s.id === songId)) return list;
    const cur = songs.find(s => s.id === songId);
    return cur ? [cur, ...list] : list;
}

// Tampilan mobile aktif kalau layar <= 768px ATAU perangkat layar sentuh
const mobileQuery = window.matchMedia('(max-width: 768px), (hover: none) and (pointer: coarse)');
const isMobileView = () => mobileQuery.matches;

function fitMobileScale() {
    const root = document.documentElement;

    if (!isMobileView()) {
        root.style.fontSize = '';
        return;
    }

    const ratio = window.innerWidth / window.screen.width;

    // Batasi rasio biar nggak pernah "kabur" jadi terlalu besar
    if (ratio > 1.2 && ratio <= 1.6) {
        root.style.fontSize = `${16 * ratio}px`;
    } else {
        root.style.fontSize = '';
    }
}

fitMobileScale();
window.addEventListener('orientationchange', fitMobileScale);

let order = [...visibleSongs];
let homeSongsOrder = [...visibleSongs];
let currentContextList = [...visibleSongs];
let lastRenderedSongs = homeSongsOrder;
let queue = [];

function addToQueue(song) {
    queue.push(song);
}
let currentIndex = 0;
let audio = new Audio(order[currentIndex].songPath);
audio.preload = "metadata";
let preloadAudio = new Audio();
preloadAudio.preload = "auto";
let preloadedPath = null;

function preloadNextTrack() {
    // Tentukan lagu apa yang akan diputar berikutnya (sama persis logikanya dengan playNextSong)
    let nextSong;
    if (queue.length > 0) {
        nextSong = queue[0];
    } else {
        const nextIdx = (currentIndex + 1) % order.length;
        nextSong = order[nextIdx];
    }

    if (!nextSong || nextSong.songPath === preloadedPath) return; // sudah di-preload / tidak ada lagu berikutnya

    preloadedPath = nextSong.songPath;
    preloadAudio.src = nextSong.songPath;
    preloadAudio.load(); // mulai download di background, tanpa diputar
}

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
let HISTORY_KEY = 'spotiware_play_history';
const HISTORY_MAX = 30;

function loadSavedHistory() {
    try {
        const ids = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
        return ids.map((id) => songs.find((s) => s.id === id)).filter(Boolean).slice(0, HISTORY_MAX);
    } catch (e) {
        return [];
    }
}
let playHistory = loadSavedHistory();

// ===== Playlist (localStorage) =====
let PLAYLIST_KEY = 'spotiware_playlists';
const LIKED_PLAYLIST_ID = 'liked_songs';
let pendingSongIdForPlaylist = null;
let pdCurrentPlaylistId = null;
let pdCurrentIsLiked = false;
let pdOpenedFromLibrary = false;

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

// ===== [DIUBAH] createPlaylist sekarang menyimpan createdAt & lastPlayedAt =====
function createPlaylist(name) {
    const playlists = getPlaylists();
    const newPlaylist = {
        id: 'pl_' + Date.now(),
        name: name.trim() || 'Playlist Baru',
        songIds: [],
        createdAt: Date.now(),
        lastPlayedAt: Date.now()
    };
    playlists.push(newPlaylist);
    savePlaylists(playlists);
    return newPlaylist;
}

// ===== [BARU] Ambil timestamp playlist, fallback ke angka di dalam id =====
function getPlaylistTimestamp(playlist, field) {
    if (playlist[field]) return playlist[field];
    const match = /^pl_(\d+)$/.exec(playlist.id);
    return match ? parseInt(match[1], 10) : 0;
}

// ===== [BARU] Update waktu terakhir playlist dibuka (untuk sort "Recents") =====
function touchPlaylistPlayed(playlistId) {
    const playlists = getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
        playlist.lastPlayedAt = Date.now();
        savePlaylists(playlists);
    }
}

function deletePlaylist(playlistId) {
    savePlaylists(getPlaylists().filter(p => p.id !== playlistId));
}

function addSongToPlaylist(playlistId, songId) {
    const playlists = getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist && !playlist.songIds.includes(songId)) {
        playlist.songIds.push(songId);
        if (!playlist.addedDates) playlist.addedDates = {};
        playlist.addedDates[songId] = Date.now();
        savePlaylists(playlists);
    }
}

function removeSongFromPlaylist(playlistId, songId) {
    const playlists = getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
        playlist.songIds = playlist.songIds.filter(id => id !== songId);
        if (playlist.addedDates) delete playlist.addedDates[songId];
        savePlaylists(playlists);
    }
}

function getSongsInPlaylist(playlist) {
    const addedDates = playlist.addedDates || {};
    return playlist.songIds
        .map(id => {
            const song = songs.find(s => s.id === id);
            if (!song) return null;
            return { ...song, addedAt: addedDates[id] || null };
        })
        .filter(Boolean);
}

function getPlaylistCoverSrc(playlist) {
    if (playlist.id === LIKED_PLAYLIST_ID) return null;
    if (playlist.coverImage) return playlist.coverImage;
    const songsInP = getSongsInPlaylist(playlist);
    return songsInP.length > 0 ? songsInP[0].songImage : null;
}

function renderDetailCover(playlist, isLiked) {
    const cover = document.getElementById('playlistDetailCover');
    const src = getPlaylistCoverSrc(playlist);
    if (src) {
        cover.innerHTML = `<img src="${src}" alt="">`;
        cover.style.background = '#2f2f2f';
    } else if (isLiked) {
        cover.innerHTML = '<i class="fa-solid fa-heart"></i>';
        cover.style.background = 'linear-gradient(135deg, #450af5, #c4efd9)';
    } else {
        cover.innerHTML = '<i class="fa-solid fa-music"></i>';
        cover.style.background = '#2f2f2f';
    }
    cover.classList.toggle('no-edit', isLiked);
    if (!isLiked) {
        cover.insertAdjacentHTML('beforeend',
            `<div class="cover-upload-overlay"><i class="fa-solid fa-pencil"></i><span>Choose photo</span></div>`);
    }
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
                <button class="grid-play-btn" data-playlist-id="${liked.id}" title="Play"><i class="fa-solid fa-play"></i></button>
                <div class="history-info">
                    <div class="history-title">Liked Songs</div>
                    <div class="history-artist">Playlist • ${liked.songIds.length} song</div>
                </div>
            </div>
        `;
    }

    // ===== [DIUBAH] Logic sort sekarang pakai timestamp asli, bukan reverse doang =====
    if (librarySortMode === 'alpha' || librarySortMode === 'creator') {
        others = [...others].sort((a, b) => a.name.localeCompare(b.name));
    } else if (librarySortMode === 'added') {
        others = [...others].sort((a, b) =>
            getPlaylistTimestamp(b, 'createdAt') - getPlaylistTimestamp(a, 'createdAt'));
    } else {
        // 'recents' -> berdasarkan kapan terakhir dibuka
        others = [...others].sort((a, b) =>
            getPlaylistTimestamp(b, 'lastPlayedAt') - getPlaylistTimestamp(a, 'lastPlayedAt'));
    }

    if (others.length === 0) {
        html += `<div class="history-empty">${libraryFilterQuery ? 'Playlist tidak ditemukan.' : ''}</div>`;
    } else {
        html += others.map(p => {
            const songsInP = getSongsInPlaylist(p);
            const coverImg = p.coverImage || (songsInP.length > 0 ? songsInP[0].songImage : null);
            const thumbHTML = coverImg
                ? `<img class="playlist-thumb" src="${coverImg}" alt="${p.name}">`
                : `<div class="playlist-icon"><i class="fa-solid fa-music"></i></div>`;
            return `
                <div class="history-item playlist-item" data-playlist-id="${p.id}">
                    ${thumbHTML}
                    <button class="grid-play-btn" data-playlist-id="${p.id}" title="Play"><i class="fa-solid fa-play"></i></button>
                    <div class="history-info">
                        <div class="history-title">${p.name}</div>
                        <div class="history-artist">Playlist • ${p.songIds.length} song</div>
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
            const playlist = getPlaylists().find(p => p.id === btn.dataset.playlistId);
            openDeletePlaylistModal(btn.dataset.playlistId, playlist ? playlist.name : 'Playlist ini');
        });
    });

    playlistListEl.querySelectorAll('.grid-play-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const playlist = getPlaylists().find(p => p.id === btn.dataset.playlistId);
            if (!playlist) return;
            const songsInP = getSongsInPlaylist(playlist);
            if (songsInP.length > 0) playSongFromList(songsInP[0].id, songsInP);
        });
    });

    if (document.querySelector('.main-left-part').classList.contains('compact-mode')) {
        renderLibraryCompactTable();
    }
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
    ensureLikedPlaylist();
    const playlists = getPlaylists();

    listEl.innerHTML = playlists.map(p => {
        const already = p.songIds.includes(pendingSongIdForPlaylist);
        const isLiked = p.id === LIKED_PLAYLIST_ID;
        const iconHTML = isLiked
            ? `<div class="add-to-playlist-icon liked"><i class="fa-solid fa-heart"></i></div>`
            : `<div class="add-to-playlist-icon"><i class="fa-solid fa-music"></i></div>`;
        return `
            <div class="add-to-playlist-row">
                <div class="add-to-playlist-left">
                    ${iconHTML}
                    <span class="add-to-playlist-name">${p.name}</span>
                </div>
                <button class="playlist-check-btn ${already ? 'checked' : ''}" data-playlist-id="${p.id}">
                    <i class="fa-solid fa-check"></i>
                </button>
            </div>
        `;
    }).join('');

    listEl.querySelectorAll('.playlist-check-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const playlistId = btn.dataset.playlistId;
            const playlist = getPlaylists().find(p => p.id === playlistId);
            if (!playlist) return;
            if (playlist.songIds.includes(pendingSongIdForPlaylist)) {
                removeSongFromPlaylist(playlistId, pendingSongIdForPlaylist);
            } else {
                addSongToPlaylist(playlistId, pendingSongIdForPlaylist);
            }
            btn.classList.toggle('checked');
            renderPlaylistList();
        });
    });
}

function syncTrackLikeButtons(songId) {
    const liked = isSongLiked(songId);
    document.querySelectorAll(`.track-like-btn[data-song-id="${songId}"]`).forEach(btn => {
        btn.classList.toggle('liked', liked);
        btn.title = liked ? 'Remove from Liked Songs' : 'Save to Liked Songs';
        const icon = btn.querySelector('i');
        icon.classList.toggle('fa-solid', liked);
        icon.classList.toggle('fa-regular', !liked);
    });

    // Kalau sedang membuka halaman Liked Songs itu sendiri dan lagu ini
    // baru saja di-unlike, render ulang supaya barisnya langsung hilang.
    if (pdCurrentIsLiked && !liked) {
        const likedPlaylist = getPlaylists().find(p => p.id === LIKED_PLAYLIST_ID);
        if (likedPlaylist) openPlaylistDetailView(likedPlaylist, true);
    }
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

function attachCardMoreButtonEvents() {
    document.querySelectorAll('.card-more-btn').forEach(btn => {
        if (btn.dataset.bound) return;
        btn.dataset.bound = '1';
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = btn.getBoundingClientRect();
            openSongContextMenu(rect.left, rect.bottom + 4, parseInt(btn.dataset.songId));
        });
    });
}

function attachAddToPlaylistButtonEvents() {
    attachCardMoreButtonEvents();
    document.querySelectorAll('.add-to-playlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const songId = parseInt(btn.dataset.songId);
            openAddToPlaylistModal(songId);
        });
    });
}

function renderSongs(songsToRender, options = {}) {
    const { playlistId = null } = options;
    lastRenderedSongs = songsToRender;
    const isHomeList = songsToRender === homeSongsOrder;

    let sec1 = document.getElementById('section-1');
    let sec2 = document.getElementById('section-2');
    let sec3 = document.getElementById('section-3');
    let sec4 = document.getElementById('section-4');

    if (sec1) sec1.innerHTML = '';
    if (sec2) sec2.innerHTML = '';
    if (sec3) sec3.innerHTML = '';
    if (sec4) sec4.innerHTML = '';

    songsToRender.forEach((song, index) => {
        const playlistBtnHTML = playlistId
            ? `<button class="remove-from-playlist-btn" data-song-id="${song.id}" data-playlist-id="${playlistId}" title="Hapus dari playlist"><i class="fa-solid fa-xmark"></i></button>`
            : `<button class="add-to-playlist-btn" data-song-id="${song.id}" title="Tambah ke Playlist"><i class="fa-solid fa-plus"></i></button>`;

        let cardHTML = `
            <div class="music-card" data-song-id="${song.id}">
                <div class="music-card-art">
                    <img data-src="${song.songImage}" alt="${song.songName}" class="lazy-img" decoding="async">
                    <div class="music-play-btn">
                        <i id="${song.id}" class="playMusic fa-solid fa-circle-play" data-audio="${song.songPath}"></i>
                    </div>
                </div>
                ${playlistBtnHTML}
                <div class="music-card-info">
                    <div class="music-card-text">
                        <div class="img-title">${song.songName}</div>
                        <div class="img-description">${song.songDes}</div>
                    </div>
                    <button class="card-more-btn" data-song-id="${song.id}" title="More"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                </div>
            </div>
        `;

        if (playlistId) {
            if (sec1) sec1.innerHTML += cardHTML;
        } else if (index < 30) {
            if (sec1) sec1.innerHTML += cardHTML;
        } else if (index < 60) {
            if (sec2) sec2.innerHTML += cardHTML;
        } else if (index < 90) {
            if (sec3) sec3.innerHTML += cardHTML;
        } else if (index < 120 || !isHomeList) {
            // Beranda: Made For You dibatasi 30 lagu (urutan 90-119).
            // Hasil pencarian tetap menampilkan semua lagu yang cocok.
            if (sec4) sec4.innerHTML += cardHTML;
        }
    });

    const allSections = document.querySelectorAll('.music-section');
    if (allSections.length >= 4) {
        allSections[1].style.display = playlistId ? 'none' : '';
        allSections[2].style.display = playlistId ? 'none' : '';
        allSections[3].style.display = playlistId ? 'none' : '';
    }

    attachPlayEvents();
    attachPlaylistButtonEvents();
    attachAddToPlaylistButtonEvents();
    initLazyImages();
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

            order = [...homeSongsOrder];
            currentContextList = [...homeSongsOrder];
            let pos = order.findIndex((s) => s.id === clickedId);
            if (pos === -1) {
                order.unshift(songs.find((s) => s.id === clickedId));
                pos = 0;
            }
            currentIndex = pos;

            audio.src = getCurrentSong().songPath;
            audio.currentTime = 0;
            audio.play();
            addToHistory(getCurrentSong());

            playerBar.classList.add('show');
            showNowPlayingPanel();

            highlightCurrentSong();
            updateNowBar();
        });
    });
}

let lazyImgObserver = null;

function initLazyImages() {
    if (lazyImgObserver) lazyImgObserver.disconnect();

    lazyImgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                lazyImgObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '150px' // mulai load sedikit sebelum benar-benar kelihatan
    });

    document.querySelectorAll('img.lazy-img[data-src]').forEach(img => {
        lazyImgObserver.observe(img);
    });
}

function setupSearch() {
    let searchInputEl = document.querySelector('.input-box');
    if (!searchInputEl) return;

    searchInputEl.addEventListener('input', (e) => {
        closeShowAllView();
        closePlaylistDetailView();

        let query = e.target.value.toLowerCase().trim();

        // Kalau lagi di tab Library (mobile) dan user mulai ngetik,
        // tampilkan lagi area hasil pencarian (main-right-part)
        if (isMobileView() && query.length > 0 && mainLeftPart && mainRightPart) {
            mainLeftPart.classList.remove('mobile-show');
            mainRightPart.classList.remove('mobile-hide');
            document.querySelectorAll('.bottom-nav-item').forEach(el => el.classList.remove('active'));
            document.querySelector('.bottom-nav-item[data-target="home"]')?.classList.add('active');
        }

        let filtered = songs.filter((song) => {
            if (song.hidden) {
                const keys = [].concat(song.keyword || song.songName).map(k => k.toLowerCase());
                return keys.some(k => k.includes(query));
            }
            return song.songName.toLowerCase().includes(query) ||
                   song.songDes.toLowerCase().includes(query);
        });

        renderSongs(filtered);
        toggleSectionTitles(query.length > 0);
    });
}

function toggleSectionTitles(isSearching) {
    document.querySelectorAll('.music-section h2').forEach((h2) => {
        h2.style.display = isSearching ? 'none' : 'block';
    });
    document.querySelectorAll('.show-all-link').forEach((link) => {
        link.style.display = isSearching ? 'none' : '';
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

const durationCache = {};

function loadTrackDurations() {
    document.querySelectorAll('.track-duration[data-song-path]').forEach((cell) => {
        const path = cell.dataset.songPath;

        if (durationCache[path] !== undefined) {
            cell.textContent = formatTime(durationCache[path]);
            return;
        }

        const tempAudio = new Audio();
        tempAudio.preload = 'metadata';
        tempAudio.src = path;

        tempAudio.addEventListener('loadedmetadata', () => {
            durationCache[path] = tempAudio.duration;
            cell.textContent = formatTime(tempAudio.duration);
        });

        tempAudio.addEventListener('error', () => {
            cell.textContent = '--:--';
        });
    });
}

function formatAddedDate(timestamp) {
    if (!timestamp) return '-';
    const d = new Date(timestamp);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function updatePlaylistPlayIcon() {
    const iconEl = document.querySelector('#playlistPlayBtn i');
    if (!iconEl) return;
    const ids = Array.from(document.querySelectorAll('#playlistTrackTableBody tr[data-song-id]'))
        .map((r) => parseInt(r.dataset.songId));
    const playingHere = playerBar.classList.contains('show') && !audio.paused &&
        ids.includes(getCurrentSong().id);
    iconEl.classList.toggle('fa-pause', playingHere);
    iconEl.classList.toggle('fa-play', !playingHere);
}

function updatePlaylistRowIcons() {
    document.querySelectorAll('#playlistTrackTableBody tr[data-song-id]').forEach(row => {
        const songId = parseInt(row.dataset.songId);
        const icon = row.querySelector('.track-num-play');
        if (!icon) return;
        const isCurrent = playerBar.classList.contains('show') && getCurrentSong().id === songId;
        if (isCurrent && !audio.paused) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
            row.classList.add('is-playing');
        } else {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
            row.classList.remove('is-playing');
        }
    });
}

let songOnRepeat = false;
let songOnShuffle = false;

function getCurrentSong() {
    if (!order || order.length === 0) return visibleSongs[0];
    if (currentIndex < 0 || currentIndex >= order.length) {
        currentIndex = 0; // self-heal kalau index kebablasan
    }
    return order[currentIndex] || visibleSongs[0];
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
    updatePlaylistPlayIcon();
}

function updateNowPlayingPanel() {
    let song = getCurrentSong();
    if (npImage) npImage.src = song.songImage;
    if (npTitle) npTitle.innerText = song.songName;
    if (npArtist) npArtist.innerText = song.songDes;

    let npFullscreenBg = document.getElementById('npFullscreenBg');
    if (npFullscreenBg) npFullscreenBg.style.backgroundImage = `url("${encodeURI(song.songImage)}")`;
}

// ===== Media Session (biar lagu tetap jalan di background & ada kontrol di notifikasi) =====
function updateMediaSession() {
    if (!('mediaSession' in navigator)) return;
    const song = getCurrentSong();

    navigator.mediaSession.metadata = new MediaMetadata({
        title: song.songName,
        artist: song.songDes,
        album: 'Spotiware',
        artwork: [
            { src: new URL(song.songImage, location.href).href, sizes: '512x512', type: 'image/webp' }
        ]
    });
}

function setupMediaSessionHandlers() {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.setActionHandler('play', () => audio.play());
    navigator.mediaSession.setActionHandler('pause', () => audio.pause());
    navigator.mediaSession.setActionHandler('previoustrack', playPrevSong);
    navigator.mediaSession.setActionHandler('nexttrack', playNextSong);
    navigator.mediaSession.setActionHandler('seekto', (d) => {
        if (d.seekTime != null) audio.currentTime = d.seekTime;
    });
}

function updateNowBar() {
    try {
        let song = getCurrentSong();
        if (!song) return;
        nowBar.getElementsByTagName('img')[0].src = song.songImage;
        nowBar.getElementsByClassName('img-title-info')[0].innerText = song.songName;
        nowBar.getElementsByClassName('img-des-info')[0].innerText = song.songDes;
        updateNowPlayingPanel();
        updateNowBarLikeIcon();
        renderQueuePanel();
        renderMobileSheet();
        updateMiniPlayerPopup();
        updateMediaSession();
    } catch (err) {
        console.error('updateNowBar error:', err);
    }
}

// ===== History functions =====
function addToHistory(song) {
    playHistory = playHistory.filter((s) => s.id !== song.id);
    playHistory.unshift(song);

    if (playHistory.length > HISTORY_MAX) {
        playHistory = playHistory.slice(0, HISTORY_MAX);
    }
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(playHistory.map((s) => s.id)));
    } catch (e) {}

    renderHistory();
    window.dispatchEvent(new Event('spotiware:history'));
}

function renderHistory() {
    if (!historyList) return;

    if (playHistory.length === 0) {
        historyList.innerHTML = `<div class="history-empty">No songs have been played yet.</div>`;
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
            showNowPlayingPanel();

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
        showNowPlayingPanel();

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
    updatePlaylistPlayIcon();
    updatePlaylistRowIcons();
    updateMiniPlayerPopup();
    updateMiniPlayerPopup();
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
    preloadNextTrack();
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
    updatePlaylistPlayIcon();
    updatePlaylistRowIcons();
    updateMiniPlayerPopup();
    updateMiniPlayerPopup();
    if ('mediaSession' in navigator && !isSwitchingTrack) {
        navigator.mediaSession.playbackState = 'paused';
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
        if (miniPopupProgressBar) {
            miniPopupProgressBar.value = progress;
            miniPopupProgressBar.style.background = `linear-gradient(to right, white ${progress}%, #555 ${progress}%)`;
        }
        if (audio.duration - audio.currentTime < 15 && preloadedPath !== (queue[0]?.songPath || order[(currentIndex + 1) % order.length]?.songPath)) {
            preloadNextTrack();
        }
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

        if (mainVolumeBar) {
            mainVolumeBar.value = this.value;
            updateVolumeFill(mainVolumeBar);
            updateVolumeIcon(this.value);
        }
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
        const playlistShuffleBtn = document.getElementById('playlistShuffleBtn');

        if (!songOnShuffle) {
            songOnShuffle = true;
            songOnRepeat = false;
            shuffle.classList.add('active');
            if (repeat) repeat.classList.remove('active');
            if (miniShuffle) miniShuffle.classList.add('active');
            if (miniRepeat) miniRepeat.classList.remove('active');
            if (playlistShuffleBtn) playlistShuffleBtn.classList.add('active');
            order = withCurrent(shuffleSongs(currentContextList), playingSongId);
        } else {
            songOnShuffle = false;
            shuffle.classList.remove('active');
            if (miniShuffle) miniShuffle.classList.remove('active');
            if (playlistShuffleBtn) playlistShuffleBtn.classList.remove('active');
            order = withCurrent([...currentContextList], playingSongId);
        }

        let newPos = order.findIndex((s) => s.id === playingSongId);
        currentIndex = newPos !== -1 ? newPos : 0;
        updateMiniPlayerPopup();
        preloadedPath = null;
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
            order = withCurrent([...currentContextList], playingSongId);
        } else {
            songOnRepeat = false;
            repeat.classList.remove('active');
            if (miniRepeat) miniRepeat.classList.remove('active');
        }

        let newPos = order.findIndex((s) => s.id === playingSongId);
        currentIndex = newPos !== -1 ? newPos : 0;
        preloadedPath = null;
    });
}

let isSwitchingTrack = false;

function loadAndPlayCurrent() {
    isSwitchingTrack = true;
    isLoadingTrack = true;
    const song = getCurrentSong();
    audio.src = song.songPath;
    audio.load();

    // Set metadata & state SEBELUM play() selesai, biar notifikasi HP tidak sempat hilang
    updateMediaSession();
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';

    const p = audio.play();
    if (p !== undefined) {
        p.then(() => {
            isLoadingTrack = false;
            isSwitchingTrack = false;
        }).catch((err) => {
            console.warn('play() ditolak, coba lagi:', err);
            audio.addEventListener('canplay', () => {
                audio.play().then(() => {
                    isLoadingTrack = false;
                    isSwitchingTrack = false;
                }).catch(() => { isSwitchingTrack = false; });
            }, { once: true });
        });
    } else {
        isLoadingTrack = false;
        isSwitchingTrack = false;
    }
}

const playNextSong = () => {
    try {
        if (queue.length > 0) {
            const nextSong = queue.shift();
            order.splice(currentIndex + 1, 0, nextSong);
            currentIndex = currentIndex + 1;
        } else if (order.length > 0) {
            currentIndex = (currentIndex + 1) % order.length;
        }
        loadAndPlayCurrent();
        addToHistory(getCurrentSong());
        highlightCurrentSong();
        updateNowBar();
    } catch (err) {
        console.error('playNextSong error, recovering:', err);
        recoverPlaybackState();
    }
};

const playPrevSong = () => {
    try {
        if (order.length > 0) {
            currentIndex = (currentIndex - 1 + order.length) % order.length;
        }
        loadAndPlayCurrent();
        addToHistory(getCurrentSong());
        highlightCurrentSong();
        updateNowBar();
    } catch (err) {
        console.error('playPrevSong error, recovering:', err);
        recoverPlaybackState();
    }
};

function recoverPlaybackState() {
    // Reset ke konteks yang masih valid supaya UI & playback tidak macet total
    order = currentContextList.length > 0 ? [...currentContextList] : [...homeSongsOrder];
    currentIndex = 0;
    try {
        loadAndPlayCurrent();
        addToHistory(getCurrentSong());
        highlightCurrentSong();
        updateNowBar();
        showToast('Playback recovered, restarting queue');
    } catch (e) {
        console.error('Recovery juga gagal:', e);
    }
}

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

let isLoadingTrack = false;

audio.addEventListener('stalled', () => {
    console.warn('audio stalled');
});

let errorSkipCount = 0;
let errorRetriedSrc = null;   // lagu yang sudah pernah di-retry

audio.addEventListener('error', () => {
    // Abaikan error sebelum ada lagu yang dimainkan (mis. preload awal halaman)
    if (!playerBar.classList.contains('show')) return;
    if (!audio.error) return;

    const failedSong = getCurrentSong();
    console.warn('Gagal memutar:', failedSong?.songPath,
        '| kode error:', audio.error.code, '|', audio.error.message);

    // Coba sekali lagi untuk lagu yang sama (siapa tahu koneksi cuma kedip)
    if (errorRetriedSrc !== audio.src) {
        errorRetriedSrc = audio.src;
        setTimeout(() => {
            audio.load();
            audio.play().catch(() => {}); // kalau gagal lagi, event 'error' berikutnya yang menangani
        }, 1200);
        return;
    }

    // Sudah di-retry tapi tetap gagal -> lewati ke lagu berikutnya
    errorRetriedSrc = null;
    errorSkipCount++;

    // 3 lagu berturut-turut gagal = masalahnya sistemik, berhenti saja (jangan lompat terus)
    if (errorSkipCount >= 3) {
        errorSkipCount = 0;
        audio.pause();
        play.classList.remove('fa-circle-pause');
        play.classList.add('fa-circle-play');
        makeAllPlay();
        showToast('Unable to play songs. Check that the audio files exist.');
        return;
    }

    showToast(`Couldn't play "${failedSong?.songName}", skipping`);
    playNextSong();
});

audio.addEventListener('playing', () => {
    errorSkipCount = 0;
    errorRetriedSrc = null;
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
    closeShowAllView();
    let searchInputEl = document.querySelector('.input-box');
    if (searchInputEl) searchInputEl.value = '';

    renderSongs(homeSongsOrder);
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

let libraryCollapseBtn = document.getElementById('libraryCollapseBtn');
if (libraryCollapseBtn) {
    libraryCollapseBtn.addEventListener('click', () => {
        const leftPart = document.querySelector('.main-left-part');
        if (!leftPart) return;
        leftPart.classList.toggle('collapsed');
        const collapsed = leftPart.classList.contains('collapsed');
        libraryCollapseBtn.title = collapsed ? 'Perluas Your Library' : 'Collapse Your Library';
    });
}

// ===== Modal Buat Playlist =====
let createPlaylistModal = document.getElementById('createPlaylistModal');
let createPlaylistModalInput = document.getElementById('createPlaylistModalInput');
let createPlaylistModalConfirm = document.getElementById('createPlaylistModalConfirm');
let createPlaylistModalCancel = document.getElementById('createPlaylistModalCancel');

function openCreatePlaylistModal() {
    createPlaylistModalInput.value = '';
    createPlaylistModal.classList.add('show');
    setTimeout(() => createPlaylistModalInput.focus(), 50);
}

function closeCreatePlaylistModal() {
    createPlaylistModal.classList.remove('show');
}

function confirmCreatePlaylist() {
    const name = createPlaylistModalInput.value.trim();
    if (name) {
        createPlaylist(name);
        renderPlaylistList();
        showToast('Playlist created');
    }
    closeCreatePlaylistModal();
}

document.getElementById('newPlaylistBtn')?.addEventListener('click', openCreatePlaylistModal);
createPlaylistModalConfirm?.addEventListener('click', confirmCreatePlaylist);
createPlaylistModalCancel?.addEventListener('click', closeCreatePlaylistModal);
createPlaylistModal?.addEventListener('click', (e) => {
    if (e.target === createPlaylistModal) closeCreatePlaylistModal();
});
createPlaylistModalInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmCreatePlaylist();
});

// ===== Modal Hapus Playlist =====
let deletePlaylistModal = document.getElementById('deletePlaylistModal');
let deletePlaylistModalText = document.getElementById('deletePlaylistModalText');
let deletePlaylistModalConfirm = document.getElementById('deletePlaylistModalConfirm');
let deletePlaylistModalCancel = document.getElementById('deletePlaylistModalCancel');
let pendingDeletePlaylistId = null;

function openDeletePlaylistModal(playlistId, playlistName) {
    pendingDeletePlaylistId = playlistId;
    deletePlaylistModalText.textContent = `"${playlistName}" will be removed from Your Library.`;
    deletePlaylistModal.classList.add('show');
}

function closeDeletePlaylistModal() {
    deletePlaylistModal.classList.remove('show');
    pendingDeletePlaylistId = null;
}

deletePlaylistModalConfirm?.addEventListener('click', () => {
    if (pendingDeletePlaylistId) {
        deletePlaylist(pendingDeletePlaylistId);
        renderPlaylistList();
    }
    closeDeletePlaylistModal();
});
deletePlaylistModalCancel?.addEventListener('click', closeDeletePlaylistModal);
deletePlaylistModal?.addEventListener('click', (e) => {
    if (e.target === deletePlaylistModal) closeDeletePlaylistModal();
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

// ===== Update nama/deskripsi & cover custom playlist =====
function updatePlaylistName(playlistId, newName) {
    const playlists = getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) { playlist.name = newName; savePlaylists(playlists); }
}

function updatePlaylistDescription(playlistId, desc) {
    const playlists = getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) { playlist.description = desc; savePlaylists(playlists); }
}

function updatePlaylistCover(playlistId, dataUrl) {
    const playlists = getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;
    if (dataUrl) playlist.coverImage = dataUrl;
    else delete playlist.coverImage;
    savePlaylists(playlists);
}
function resizeImageToDataUrl(file, maxSize, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            let w = img.width, h = img.height;
            if (w > h) { if (w > maxSize) { h *= maxSize / w; w = maxSize; } }
            else { if (h > maxSize) { w *= maxSize / h; h = maxSize; } }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            callback(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ===== Upload cover langsung dari halaman utama playlist =====
let coverUploadInput = document.getElementById('coverUploadInput');

document.getElementById('playlistDetailCover')?.addEventListener('click', () => {
    if (pdCurrentPlaylistId && !pdCurrentIsLiked && coverUploadInput) coverUploadInput.click();
});

coverUploadInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !pdCurrentPlaylistId) return;
    resizeImageToDataUrl(file, 300, (dataUrl) => {
        updatePlaylistCover(pdCurrentPlaylistId, dataUrl);
        const playlist = getPlaylists().find(p => p.id === pdCurrentPlaylistId);
        if (playlist) renderDetailCover(playlist, pdCurrentIsLiked);
        renderPlaylistList();
    });
    coverUploadInput.value = '';
});

// ===== Modal Edit Details (nama + deskripsi + cover) =====
let editDetailsModal = document.getElementById('editDetailsModal');
let editDetailsNameInput = document.getElementById('editDetailsNameInput');
let editDetailsDescInput = document.getElementById('editDetailsDescInput');
let editDetailsCover = document.getElementById('editDetailsCover');
let editDetailsCoverImg = document.getElementById('editDetailsCoverImg');
let editDetailsCoverPlaceholder = document.getElementById('editDetailsCoverPlaceholder');
let editDetailsCoverInput = document.getElementById('editDetailsCoverInput');
let editCoverMoreBtn = document.getElementById('editCoverMoreBtn');
let editCoverMenu = document.getElementById('editCoverMenu');
let editCoverChange = document.getElementById('editCoverChange');
let editCoverRemove = document.getElementById('editCoverRemove');
let pdEditDetailsBtn = document.getElementById('pdEditDetailsBtn');
let pendingEditCoverDataUrl = null;
let pendingEditCoverRemove = false;

function refreshEditCoverPreview() {
    const playlist = getPlaylists().find(p => p.id === pdCurrentPlaylistId);
    if (!playlist) return;

    let src;
    if (pendingEditCoverDataUrl) {
        src = pendingEditCoverDataUrl;
    } else if (pendingEditCoverRemove) {
        if (pdCurrentIsLiked) {
            src = null;
        } else {
            const s = getSongsInPlaylist(playlist);
            src = s.length ? s[0].songImage : null;
        }
    } else {
        src = getPlaylistCoverSrc(playlist);
    }

    if (src) {
        editDetailsCoverImg.src = src;
        editDetailsCoverImg.style.display = 'block';
        editDetailsCoverPlaceholder.style.display = 'none';
        editDetailsCover.style.background = '#2f2f2f';
    } else {
        editDetailsCoverImg.style.display = 'none';
        editDetailsCoverPlaceholder.style.display = 'flex';
        editDetailsCoverPlaceholder.className = 'edit-cover-placeholder fa-solid ' +
            (pdCurrentIsLiked ? 'fa-heart' : 'fa-music');
        editDetailsCover.style.background = pdCurrentIsLiked
            ? 'linear-gradient(135deg, #450af5, #c4efd9)' : '#2f2f2f';
    }

    // "Remove photo" cuma aktif kalau memang ada foto custom
    const hasCustom = !!pendingEditCoverDataUrl || (!pendingEditCoverRemove && !!playlist.coverImage);
    editCoverRemove.classList.toggle('disabled', !hasCustom);
}

function openEditDetailsModal() {
    if (!pdCurrentPlaylistId) return;
    const playlist = getPlaylists().find(p => p.id === pdCurrentPlaylistId);
    if (!playlist) return;

    pendingEditCoverDataUrl = null;
    pendingEditCoverRemove = false;
    editDetailsNameInput.value = playlist.name;
    editDetailsNameInput.disabled = pdCurrentIsLiked; // nama Liked Songs dikunci
    editDetailsDescInput.value = playlist.description || '';
    editCoverMenu.classList.remove('show');
    refreshEditCoverPreview();

    editDetailsModal.classList.add('show');
}

function closeEditDetailsModal() {
    if (editCoverMenu) editCoverMenu.classList.remove('show');
    editDetailsModal.classList.remove('show');
}

function confirmEditDetails() {
    if (!pdCurrentPlaylistId) return closeEditDetailsModal();

    if (!pdCurrentIsLiked) {
        const newName = editDetailsNameInput.value.trim();
        if (newName) {
            updatePlaylistName(pdCurrentPlaylistId, newName);
            document.getElementById('playlistDetailTitle').textContent = newName;
        }
    }

    const desc = editDetailsDescInput.value.trim();
    updatePlaylistDescription(pdCurrentPlaylistId, desc);
    document.getElementById('playlistDetailDescription').textContent = desc;

    if (pendingEditCoverDataUrl) updatePlaylistCover(pdCurrentPlaylistId, pendingEditCoverDataUrl);
    else if (pendingEditCoverRemove) updatePlaylistCover(pdCurrentPlaylistId, null);

    const playlist = getPlaylists().find(p => p.id === pdCurrentPlaylistId);
    if (playlist) renderDetailCover(playlist, pdCurrentIsLiked);

    renderPlaylistList();
    closeEditDetailsModal();
}

if (pdEditDetailsBtn) pdEditDetailsBtn.addEventListener('click', openEditDetailsModal);

// klik gambar = pilih foto
editDetailsCover?.addEventListener('click', () => editDetailsCoverInput.click());

// menu "..."
editCoverMoreBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    editCoverMenu.classList.toggle('show');
});
editCoverChange?.addEventListener('click', (e) => {
    e.stopPropagation();
    editCoverMenu.classList.remove('show');
    editDetailsCoverInput.click();
});
editCoverRemove?.addEventListener('click', (e) => {
    e.stopPropagation();
    editCoverMenu.classList.remove('show');
    pendingEditCoverDataUrl = null;
    pendingEditCoverRemove = true;
    refreshEditCoverPreview();
});

editDetailsCoverInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    resizeImageToDataUrl(file, 300, (dataUrl) => {
        pendingEditCoverDataUrl = dataUrl;
        pendingEditCoverRemove = false;
        refreshEditCoverPreview();
    });
    editDetailsCoverInput.value = '';
});

document.getElementById('editDetailsSave')?.addEventListener('click', confirmEditDetails);
document.getElementById('editDetailsCancel')?.addEventListener('click', closeEditDetailsModal);
document.getElementById('editDetailsCloseX')?.addEventListener('click', closeEditDetailsModal);
editDetailsModal?.addEventListener('click', (e) => {
    if (!e.target.closest('.edit-cover-menu, .edit-cover-more-btn')) {
        if (editCoverMenu) editCoverMenu.classList.remove('show');
    }
    if (e.target === editDetailsModal) closeEditDetailsModal();
});

// ===== Panel Add Songs ke playlist (gantiin slot Now Playing/Queue) =====
let addSongsPanel = document.getElementById('addSongsPanel');
let addSongsSearchInput = document.getElementById('addSongsSearchInput');
let addSongsList = document.getElementById('addSongsList');
let pdAddSongsBtn = document.getElementById('pdAddSongsBtn');

function renderAddSongsList(query) {
    const q = (query || '').toLowerCase().trim();
    const playlist = getPlaylists().find(p => p.id === pdCurrentPlaylistId);
    if (!playlist) return;

    const filtered = q
        ? visibleSongs.filter(s => s.songName.toLowerCase().includes(q) || s.songDes.toLowerCase().includes(q))
        : visibleSongs.slice(0, 50);

    addSongsList.innerHTML = filtered.map(song => {
        const already = playlist.songIds.includes(song.id);
        return `
            <div class="add-songs-row">
                <img src="${song.songImage}" alt="">
                <div class="add-songs-row-info">
                    <div class="add-songs-row-name">${song.songName}</div>
                    <div class="add-songs-row-artist">${song.songDes}</div>
                </div>
                <button class="playlist-check-btn ${already ? 'checked' : ''}" data-song-id="${song.id}">
                    <i class="fa-solid fa-check"></i>
                </button>
            </div>
        `;
    }).join('');

    addSongsList.querySelectorAll('.playlist-check-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const songId = parseInt(btn.dataset.songId);
            const current = getPlaylists().find(p => p.id === pdCurrentPlaylistId);
            if (current.songIds.includes(songId)) {
                removeSongFromPlaylist(pdCurrentPlaylistId, songId);
            } else {
                addSongToPlaylist(pdCurrentPlaylistId, songId);
            }
            btn.classList.toggle('checked');
        });
    });
}

function openAddSongsPanel() {
    if (!pdCurrentPlaylistId) return;
    addSongsSearchInput.value = '';
    renderAddSongsList('');

    if (queuePanel) { queuePanel.classList.remove('show'); if (queueBtn) queueBtn.classList.remove('active'); }
    if (nowPlayingPanel) nowPlayingPanel.classList.remove('show');
    addSongsPanel.classList.add('show');
}

function closeAddSongsPanel() {
    addSongsPanel.classList.remove('show');
    const playlist = getPlaylists().find(p => p.id === pdCurrentPlaylistId);
    if (playlist) openPlaylistDetailView(playlist, pdCurrentIsLiked);
    if (nowPlayingPanel && playerBar.classList.contains('show')) {
        nowPlayingPanel.classList.add('show');
    }
}

if (pdAddSongsBtn) pdAddSongsBtn.addEventListener('click', openAddSongsPanel);
if (addSongsSearchInput) {
    addSongsSearchInput.addEventListener('input', (e) => renderAddSongsList(e.target.value));
}
document.getElementById('addSongsCloseBtn')?.addEventListener('click', closeAddSongsPanel);

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
let ctxAddToQueue = document.getElementById('ctxAddToQueue');
let ctxAddToPlaylist = document.getElementById('ctxAddToPlaylist');
let contextMenuSongId = null;

document.getElementById('ctxRemoveFromPlaylist')?.addEventListener('click', () => {
    if (contextMenuSongId !== null && pdCurrentPlaylistId) {
        removeSongFromPlaylist(pdCurrentPlaylistId, contextMenuSongId);
        const playlist = getPlaylists().find(p => p.id === pdCurrentPlaylistId);
        if (playlist) openPlaylistDetailView(playlist, pdCurrentIsLiked);
        renderPlaylistList();
    }
    closeSongContextMenu();
});

function openSongContextMenu(x, y, songId, hideRemove = false) {
    contextMenuSongId = songId;
    if (!songContextMenu) return;

    const removeItem = document.getElementById('ctxRemoveFromPlaylist');
    const removeLabel = document.getElementById('ctxRemoveFromPlaylistLabel');
    const detailOpen = !hideRemove && document.getElementById('playlistDetailView')?.classList.contains('show') && pdCurrentPlaylistId;

    if (removeItem) {
        if (detailOpen) {
            removeItem.style.display = 'flex';
            if (removeLabel) {
                removeLabel.textContent = pdCurrentIsLiked ? 'Remove from Liked Songs' : 'Remove from this playlist';
            }
        } else {
            removeItem.style.display = 'none';
        }
    }

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
    const trackRow = e.target.closest('#playlistTrackTableBody tr[data-song-id]');
    const songId = card
        ? parseInt(card.dataset.songId)
        : historyItem
            ? parseInt(historyItem.dataset.id)
            : trackRow
                ? parseInt(trackRow.dataset.songId)
                : NaN;

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

if (ctxAddToQueue) {
    ctxAddToQueue.addEventListener('click', () => {
        if (contextMenuSongId !== null) {
            const song = songs.find(s => s.id === contextMenuSongId);
            if (song) {
                queue.push(song);
                preloadedPath = null;
                renderQueuePanel();
                renderMobileSheet();
                showToast('Added to Queue', isMobileView() ? 'Open' : null, () => openMobileSheet('queue'));
            }
        }
        closeSongContextMenu();
    });
}

// ===== Library sort menu =====
let librarySortBtn = document.getElementById('librarySortBtn');
let librarySortMenu = document.getElementById('librarySortMenu');
let librarySortLabel = document.getElementById('librarySortLabel');
let libraryViewMode = 'list';
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

const VIEW_ICON_MAP = {
    list: 'fa-list',
    compact: 'fa-bars',
    grid: 'fa-grip',
    gridlarge: 'fa-table-cells-large'
};

function updateLibrarySortIcon() {
    if (!librarySortBtn) return;
    const iconEl = librarySortBtn.querySelector('i');
    if (!iconEl) return;
    Object.values(VIEW_ICON_MAP).forEach(cls => iconEl.classList.remove(cls));
    iconEl.classList.remove('fa-bars-staggered');
    iconEl.classList.add(VIEW_ICON_MAP[libraryViewMode] || 'fa-list');
}

document.querySelectorAll('.view-icon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        libraryViewMode = btn.dataset.view;
        document.querySelectorAll('.view-icon-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const playlistListEl = document.getElementById('playlistList');
        const leftPart = document.querySelector('.main-left-part');

        if (libraryViewMode === 'compact') {
            leftPart.classList.add('compact-mode');
            if (playlistListEl) {
                playlistListEl.classList.remove('view-list', 'view-compact', 'view-grid', 'view-gridlarge');
                playlistListEl.classList.add('view-compact');
            }
            renderLibraryCompactTable();
        } else {
            leftPart.classList.remove('compact-mode');
            if (playlistListEl) {
                playlistListEl.classList.remove('view-list', 'view-compact', 'view-grid', 'view-gridlarge');
                playlistListEl.classList.add('view-' + libraryViewMode);
            }
        }
        updateLibrarySortIcon();
    });
});

function formatRelativeTime(timestamp) {
    if (!timestamp) return '-';
    const diffMs = Date.now() - timestamp;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
    const diffWeek = Math.floor(diffDay / 7);
    if (diffWeek < 5) return `${diffWeek} week${diffWeek !== 1 ? 's' : ''} ago`;
    return formatAddedDate(timestamp);
}

function renderLibraryCompactTable() {
    const tbody = document.getElementById('libraryCompactTableBody');
    if (!tbody) return;
    ensureLikedPlaylist();

    let playlists = getPlaylists();
    if (libraryFilterQuery) {
        playlists = playlists.filter(p =>
            p.name.toLowerCase().includes(libraryFilterQuery) ||
            (p.id === LIKED_PLAYLIST_ID && 'liked songs'.includes(libraryFilterQuery))
        );
    }

    const liked = playlists.find(p => p.id === LIKED_PLAYLIST_ID);
    let others = playlists.filter(p => p.id !== LIKED_PLAYLIST_ID);

    if (librarySortMode === 'alpha' || librarySortMode === 'creator') {
        others = [...others].sort((a, b) => a.name.localeCompare(b.name));
    } else if (librarySortMode === 'added') {
        others = [...others].sort((a, b) =>
            getPlaylistTimestamp(b, 'createdAt') - getPlaylistTimestamp(a, 'createdAt'));
    } else {
        others = [...others].sort((a, b) =>
            getPlaylistTimestamp(b, 'lastPlayedAt') - getPlaylistTimestamp(a, 'lastPlayedAt'));
    }

    let rows = '';

    if (liked) {
        rows += `
            <tr data-playlist-id="${liked.id}">
                <td>
                    <div class="compact-title-cell">
                        Liked Songs <span class="compact-subtype">• Playlist</span>
                    </div>
                </td>
                <td>${formatAddedDate(getPlaylistTimestamp(liked, 'createdAt'))}</td>
                <td>${formatRelativeTime(getPlaylistTimestamp(liked, 'lastPlayedAt'))}</td>
            </tr>
        `;
    }

    rows += others.map(p => `
        <tr data-playlist-id="${p.id}">
            <td>
                <div class="compact-title-cell">
                    ${p.name} <span class="compact-subtype">• Playlist</span>
                </div>
            </td>
            <td>${formatAddedDate(getPlaylistTimestamp(p, 'createdAt'))}</td>
            <td>${formatRelativeTime(getPlaylistTimestamp(p, 'lastPlayedAt'))}</td>
        </tr>
    `).join('');

    tbody.innerHTML = rows || `<tr><td colspan="3" style="text-align:center; color:var(--gray-mid);">Belum ada playlist.</td></tr>`;

    tbody.querySelectorAll('tr[data-playlist-id]').forEach(row => {
        row.addEventListener('click', () => {
            const playlist = getPlaylists().find(p => p.id === row.dataset.playlistId);
            if (playlist) openPlaylistDetailView(playlist, playlist.id === LIKED_PLAYLIST_ID);
        });
    });
}

// ===== Playlist Detail View (ala Spotify) =====
function openPlaylistDetailView(playlist, isLiked) {
    if (!document.getElementById('playlistDetailView').classList.contains('show')) {
        pdOpenedFromLibrary = isMobileView() && !!mainLeftPart && mainLeftPart.classList.contains('mobile-show');
    }

    closeShowAllView();

    // [BARU] Catat waktu playlist ini terakhir dibuka, dipakai untuk sort "Recents"
    pdCurrentPlaylistId = playlist.id;
    pdCurrentIsLiked = isLiked;
    touchPlaylistPlayed(playlist.id);

    const detailView = document.getElementById('playlistDetailView');
    const cover = document.getElementById('playlistDetailCover');
    const title = document.getElementById('playlistDetailTitle');
    const meta = document.getElementById('playlistDetailMeta');
    const tbody = document.getElementById('playlistTrackTableBody');

    const songsInPlaylist = getSongsInPlaylist(playlist);

    title.textContent = playlist.name;
    meta.textContent = `${songsInPlaylist.length} song${songsInPlaylist.length !== 1 ? 's' : ''}`;

    renderDetailCover(playlist, isLiked);

    document.getElementById('playlistDetailDescription').textContent = isLiked ? '' : (playlist.description || '');

    if (pdAddSongsBtn) pdAddSongsBtn.style.display = 'flex';
    if (pdEditDetailsBtn) pdEditDetailsBtn.style.display = isLiked ? 'none' : 'flex';

    tbody.innerHTML = songsInPlaylist.map((song, idx) => `
        <tr data-song-id="${song.id}">
            <td class="track-num-col">
                <span class="track-num-text">${idx + 1}</span>
                <i class="fa-solid fa-play track-num-play"></i>
            </td>
            <td>
                <div class="track-title-cell">
                    <img src="${song.songImage}" alt="">
                    <div class="track-title-text">
                        <span class="t-name">${song.songName}</span>
                        <span class="t-artist">${song.songDes}</span>
                    </div>
                </div>
            </td>
            <td class="pd-compact-only">${song.songDes}</td>
            <td class="pd-album-col">${song.songName}</td>
            <td class="pd-list-only">${formatAddedDate(song.addedAt)}</td>
            <td class="track-actions">
                <button class="track-like-btn ${isSongLiked(song.id) ? 'liked' : ''}" data-song-id="${song.id}"
                    title="${isSongLiked(song.id) ? 'Remove from Liked Songs' : 'Save to Liked Songs'}">
                    <i class="${isSongLiked(song.id) ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                </button>
            </td>
            <td class="track-duration" data-song-path="${song.songPath}">--:--</td>
            <td class="track-more-col">
                <button class="track-more-btn" data-song-id="${song.id}" title="More options">
                    <i class="fa-solid fa-ellipsis track-more-icon-desktop"></i>
                    <i class="fa-solid fa-ellipsis-vertical track-more-icon-mobile"></i>
                </button>
            </td>
        </tr>
    `).join('');

    tbody.querySelectorAll('tr[data-song-id]').forEach(row => {
        row.addEventListener('click', () => {
            const songId = parseInt(row.dataset.songId);
            if (playerBar.classList.contains('show') && getCurrentSong().id === songId) {
                play.click();
            } else {
                playSongFromList(songId, songsInPlaylist);
            }
        });
    });

    tbody.querySelectorAll('.track-like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openAddToPlaylistModal(parseInt(btn.dataset.songId));
        });
    });

    tbody.querySelectorAll('.track-more-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = btn.getBoundingClientRect();
            openSongContextMenu(rect.left, rect.bottom + 4, parseInt(btn.dataset.songId));
        });
    });
    
    document.getElementById('playlistPlayBtn').onclick = () => {
        if (songsInPlaylist.length === 0) return;
        const isPlayingFromThisPlaylist = playerBar.classList.contains('show') &&
            songsInPlaylist.some(s => s.id === getCurrentSong().id);
        if (isPlayingFromThisPlaylist) {
            play.click(); // toggle pause/resume
        } else {
            playSongFromList(songsInPlaylist[0].id, songsInPlaylist);
        }
    };

    document.querySelectorAll('.music-section').forEach(sec => sec.classList.add('hide'));
    detailView.classList.add('show');

    if (mainRightPart) mainRightPart.scrollTo({ top: 0 });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (mainLeftPart) mainLeftPart.classList.remove('mobile-show');
    if (mainRightPart) mainRightPart.classList.remove('mobile-hide');

    updatePlaylistPlayIcon();
    updatePlaylistRowIcons();
    loadTrackDurations();
}

function playSongFromList(songId, songList) {
    order = songList.length > 0 ? [...songList] : [...songs];
    currentContextList = [...order];
    let pos = order.findIndex(s => s.id === songId);
    currentIndex = pos !== -1 ? pos : 0;

    audio.src = getCurrentSong().songPath;
    audio.currentTime = 0;
    audio.play();
    addToHistory(getCurrentSong());

    playerBar.classList.add('show');
    showNowPlayingPanel();

    highlightCurrentSong();
    updateNowBar();
}

function closePlaylistDetailView() {
    const detailView = document.getElementById('playlistDetailView');
    if (detailView) detailView.classList.remove('show');
    document.querySelectorAll('.music-section').forEach(sec => sec.classList.remove('hide'));
}

function openShowAllView(title, songsList) {
    closePlaylistDetailView();
    lastRenderedSongs = songsList;
    document.querySelectorAll('.music-section').forEach(sec => sec.classList.add('hide'));

    document.getElementById('showAllTitle').textContent = title;
    const grid = document.getElementById('showAllGrid');

    grid.innerHTML = songsList.map(song => `
        <div class="music-card" data-song-id="${song.id}">
            <div class="music-card-art">
                <img data-src="${song.songImage}" alt="${song.songName}" class="lazy-img" decoding="async">
                <div class="music-play-btn">
                    <i id="${song.id}" class="playMusic fa-solid fa-circle-play" data-audio="${song.songPath}"></i>
                </div>
            </div>
            <button class="add-to-playlist-btn" data-song-id="${song.id}" title="Tambah ke Playlist"><i class="fa-solid fa-plus"></i></button>
            <div class="music-card-info">
                <div class="music-card-text">
                    <div class="img-title">${song.songName}</div>
                    <div class="img-description">${song.songDes}</div>
                </div>
                <button class="card-more-btn" data-song-id="${song.id}" title="More"><i class="fa-solid fa-ellipsis-vertical"></i></button>
            </div>
        </div>
    `).join('');

    attachPlayEvents();
    attachAddToPlaylistButtonEvents();
    initLazyImages();

    document.getElementById('showAllView').classList.add('show');
    if (mainRightPart) mainRightPart.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeShowAllView() {
    document.getElementById('showAllView').classList.remove('show');
    document.querySelectorAll('.music-section').forEach(sec => sec.classList.remove('hide'));
}

document.querySelectorAll('.show-all-link').forEach(link => {
    link.addEventListener('click', () => {
        const start = parseInt(link.dataset.start);
        const end = link.dataset.end ? parseInt(link.dataset.end) : homeSongsOrder.length;
        const sectionSongs = homeSongsOrder.slice(start, end);
        openShowAllView(link.dataset.title, sectionSongs);
    });
});

document.getElementById('showAllBackBtn')?.addEventListener('click', closeShowAllView);

function backFromPlaylistDetail() {
    const toLibrary = pdOpenedFromLibrary && isMobileView();
    pdOpenedFromLibrary = false;
    closePlaylistDetailView();

    if (toLibrary) {
        // kembali ke tab Library (mobile)
        if (mainLeftPart) mainLeftPart.classList.add('mobile-show');
        if (mainRightPart) mainRightPart.classList.add('mobile-hide');
        document.querySelectorAll('.bottom-nav-item').forEach((el) => el.classList.remove('active'));
        document.querySelector('.bottom-nav-item[data-target="library"]')?.classList.add('active');
        renderPlaylistList();
        window.scrollTo({ top: 0 });
    }
}

document.getElementById('playlistDetailBackBtn')?.addEventListener('click', backFromPlaylistDetail);

// ===== [DIUBAH] Dropdown menu List/Compact (butuh elemen #playlistViewMenu di HTML) =====
document.getElementById('playlistViewToggle')?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('playlistViewMenu')?.classList.toggle('show');
});

document.querySelectorAll('.view-menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        const mode = item.dataset.mode;
        const table = document.getElementById('playlistTrackTable');
        const label = document.getElementById('playlistViewLabel');
        table.classList.toggle('compact-mode', mode === 'compact');
        label.textContent = mode === 'compact' ? 'Compact' : 'List';
        document.querySelectorAll('.view-menu-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        document.getElementById('playlistViewMenu')?.classList.remove('show');
    });
});

document.addEventListener('click', (e) => {
    const menu = document.getElementById('playlistViewMenu');
    const toggle = document.getElementById('playlistViewToggle');
    if (menu && menu.classList.contains('show') && !menu.contains(e.target) && toggle && !toggle.contains(e.target)) {
        menu.classList.remove('show');
    }
});

document.getElementById('playlistShuffleBtn')?.addEventListener('click', function () {
    if (shuffle) shuffle.click();
});

// ===== Queue Panel =====
let queueBtn = document.getElementById('queueBtn');
let queuePanel = document.getElementById('queuePanel');
let queueCloseBtn = document.getElementById('queueCloseBtn');
let queueClearBtn = document.getElementById('queueClearBtn');

function showNowPlayingPanel() {
    if (queuePanel && queuePanel.classList.contains('show')) {
        queuePanel.classList.remove('show');
        if (queueBtn) queueBtn.classList.remove('active');
    }
    if (nowPlayingPanel) nowPlayingPanel.classList.add('show');
    document.body.classList.add('player-active');
}

if (queueBtn) {
    queueBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isShowing = queuePanel.classList.toggle('show');
        queueBtn.classList.toggle('active', isShowing);

        if (isShowing) {
            renderQueuePanel();
            if (nowPlayingPanel) nowPlayingPanel.classList.remove('show');
        } else if (nowPlayingPanel && playerBar.classList.contains('show')) {
            nowPlayingPanel.classList.add('show');
        }
    });
}
if (queueCloseBtn) {
    queueCloseBtn.addEventListener('click', () => {
        queuePanel.classList.remove('show');
        queueBtn.classList.remove('active');
        if (!isMobileView() && nowPlayingPanel && playerBar.classList.contains('show')) {
            nowPlayingPanel.classList.add('show');
        }
    });
}
if (queueClearBtn) {
    queueClearBtn.addEventListener('click', () => {
        queue = [];
        renderQueuePanel();
    });
}

function renderQueuePanel() {
    const nowPlayingEl = document.getElementById('queueNowPlaying');
    const nextListEl = document.getElementById('queueNextList');
    if (!nowPlayingEl || !nextListEl) return;

    if (!playerBar.classList.contains('show')) {
        nowPlayingEl.innerHTML = `<div class="history-empty">No songs have been played yet.</div>`;
        nextListEl.innerHTML = '';
        return;
    }

    const current = getCurrentSong();
    nowPlayingEl.innerHTML = `
        <div class="queue-item">
            <img src="${current.songImage}" alt="">
            <div>
                <div class="queue-item-title now-playing">${current.songName}</div>
                <div class="queue-item-artist">${current.songDes}</div>
            </div>
        </div>
    `;

    const upcoming = [...queue];

    if (upcoming.length === 0) {
        nextListEl.innerHTML = `<div class="history-empty">empty queue</div>`;
    } else {
        nextListEl.innerHTML = upcoming.map(song => `
            <div class="queue-item" data-song-id="${song.id}">
                <img src="${song.songImage}" alt="">
                <div>
                    <div class="queue-item-title">${song.songName}</div>
                    <div class="queue-item-artist">${song.songDes}</div>
                </div>
            </div>
        `).join('');

        nextListEl.querySelectorAll('.queue-item[data-song-id]').forEach(item => {
            item.addEventListener('click', () => {
                playSongFromList(parseInt(item.dataset.songId), order);
            });
        });
    }
}

// ===== Volume (desktop) =====
let mainVolumeBar = document.getElementById('mainVolumeBar');
let volumeBtn = document.getElementById('volumeBtn');

function updateVolumeIcon(value) {
    if (!volumeBtn) return;
    const icon = volumeBtn.querySelector('i');
    icon.className = value == 0 ? 'fa-solid fa-volume-xmark' : (value < 50 ? 'fa-solid fa-volume-low' : 'fa-solid fa-volume-high');
}

if (mainVolumeBar) {
    updateVolumeFill(mainVolumeBar);

    mainVolumeBar.addEventListener('input', function () {
        audio.volume = this.value / 100;
        updateVolumeIcon(this.value);
        updateVolumeFill(this);

        if (npVolumeBar) {
            npVolumeBar.value = this.value;
            updateVolumeFill(npVolumeBar);
        }
    });
}

if (volumeBtn) {
    volumeBtn.addEventListener('click', () => {
        if (audio.volume > 0) {
            audio.dataset.prevVolume = audio.volume;
            audio.volume = 0;
            if (mainVolumeBar) mainVolumeBar.value = 0;
        } else {
            const prev = parseFloat(audio.dataset.prevVolume) || 1;
            audio.volume = prev;
            if (mainVolumeBar) mainVolumeBar.value = prev * 100;
        }
        updateVolumeIcon(mainVolumeBar.value);
        updateVolumeFill(mainVolumeBar);

        if (npVolumeBar) {
            npVolumeBar.value = mainVolumeBar.value;
            updateVolumeFill(npVolumeBar);
        }
    });
}

// ===== Fullscreen button (reuse now playing panel fullscreen) =====
let fullscreenPlayerBtn = document.getElementById('fullscreenPlayerBtn');
if (fullscreenPlayerBtn) {
    fullscreenPlayerBtn.addEventListener('click', () => {
        if (npFullscreenBtn) npFullscreenBtn.click();
    });
}

// ===== Mini Player Popup =====
let miniPlayerBtn = document.getElementById('miniPlayerBtn');
let miniPlayerPopup = document.getElementById('miniPlayerPopup');
let miniPlayerCloseBtn = document.getElementById('miniPlayerCloseBtn');
let miniPlayerExpandBtn = document.getElementById('miniPlayerExpandBtn');
let miniPopupPlay = document.getElementById('miniPopupPlay');
let miniPopupTitle = document.getElementById('miniPopupTitle');
let miniPopupArtist = document.getElementById('miniPopupArtist');
let miniPlayerImage = document.getElementById('miniPlayerImage');
let miniPopupForward = document.getElementById('miniPopupForward');
let miniPopupBackward = document.getElementById('miniPopupBackward');
let miniPopupShuffle = document.getElementById('miniPopupShuffle');
let miniPopupRepeat = document.getElementById('miniPopupRepeat');
let miniPopupProgressBar = document.getElementById('miniPopupProgressBar');
let miniPopupLikeBtn = document.getElementById('miniPopupLikeBtn');

if (miniPlayerBtn) {
    miniPlayerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openRealMiniPlayer();
    });
}

if (miniPlayerCloseBtn) {
    miniPlayerCloseBtn.addEventListener('click', () => {
        miniPlayerPopup.classList.remove('show');
        miniPlayerBtn.classList.remove('active');
    });
}
if (miniPlayerExpandBtn) {
    miniPlayerExpandBtn.addEventListener('click', () => {
        if (npFullscreenBtn) npFullscreenBtn.click();
    });
}
if (miniPopupPlay) miniPopupPlay.addEventListener('click', () => play.click());
if (miniPopupForward) miniPopupForward.addEventListener('click', playNextSong);
if (miniPopupBackward) miniPopupBackward.addEventListener('click', playPrevSong);
if (miniPopupShuffle) miniPopupShuffle.addEventListener('click', () => { if (shuffle) shuffle.click(); });
if (miniPopupRepeat) miniPopupRepeat.addEventListener('click', () => { if (repeat) repeat.click(); });
if (miniPopupProgressBar) {
    miniPopupProgressBar.addEventListener('input', function () {
        this.style.background = `linear-gradient(to right, white ${this.value}%, #555 ${this.value}%)`;
        if (audio.duration) audio.currentTime = (this.value * audio.duration) / 100;
    });
}
if (miniPopupLikeBtn) {
    miniPopupLikeBtn.addEventListener('click', () => {
        toggleLikedSong(getCurrentSong().id);
        updateMiniPlayerPopup();
        updateNowBarLikeIcon();
    });
}

function updateMiniPlayerPopup() {
    if (!playerBar.classList.contains('show')) return;
    const song = getCurrentSong();
    miniPopupTitle.textContent = song.songName;
    miniPopupArtist.textContent = song.songDes;
    miniPlayerImage.src = song.songImage;

    const playIcon = miniPopupPlay.querySelector('i');
    playIcon.className = (!audio.paused) ? 'fa-solid fa-pause' : 'fa-solid fa-play';

    if (miniPopupShuffle) miniPopupShuffle.classList.toggle('active', songOnShuffle);
    if (miniPopupRepeat) miniPopupRepeat.classList.toggle('active', songOnRepeat);

    const liked = isSongLiked(song.id);
    const likeIcon = miniPopupLikeBtn.querySelector('i');
    likeIcon.classList.toggle('fa-solid', liked);
    likeIcon.classList.toggle('fa-regular', !liked);
    miniPopupLikeBtn.classList.toggle('liked', liked);
}

let pipWindow = null;

async function openRealMiniPlayer() {
    if (!('documentPictureInPicture' in window)) {
        alert('Browser kamu belum mendukung fitur mini player ini. Coba pakai Chrome/Edge terbaru.');
        return;
    }

    if (pipWindow) {
        pipWindow.focus();
        return;
    }

    pipWindow = await documentPictureInPicture.requestWindow({
        width: 260,
        height: 360,
    });

    // Reset sizing bawaan window baru biar nggak ada margin/scroll aneh
    pipWindow.document.documentElement.style.margin = '0';
    pipWindow.document.documentElement.style.height = '100%';
    pipWindow.document.body.style.margin = '0';
    pipWindow.document.body.style.height = '100%';
    pipWindow.document.body.style.overflow = 'hidden';
    pipWindow.document.body.style.background = '#181818';

    // Clone semua <link> dan <style> dari head halaman utama
    [...document.querySelectorAll('link[rel="stylesheet"], style')].forEach((el) => {
        const clone = el.cloneNode(true);
        pipWindow.document.head.appendChild(clone);
    });

    // Pindahin konten mini player popup ke window baru
    const content = document.getElementById('miniPlayerPopup');
    content.classList.add('show', 'pip-mode');
    pipWindow.document.body.appendChild(content);

    pipWindow.addEventListener('pagehide', () => {
        content.classList.remove('show', 'pip-mode');
        document.querySelector('.player-bar').appendChild(content);
        pipWindow = null;
    });
}

// ===== Notif kecil ("Added to Queue", dll) =====
let toastTimer = null;

function showToast(text, actionLabel, actionFn) {
    const toast = document.getElementById('appToast');
    const textEl = document.getElementById('appToastText');
    const actionEl = document.getElementById('appToastAction');
    if (!toast || !textEl || !actionEl) return;

    textEl.textContent = text;
    actionEl.textContent = actionLabel || '';
    actionEl.onclick = (actionLabel && actionFn)
        ? () => { toast.classList.remove('show'); actionFn(); }
        : null;

    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== Menu "Create" (+) di bottom nav (mobile) =====
const createNavBtn = document.getElementById('createNavBtn');
const createMenu = document.getElementById('createMenu');
const createBackdrop = document.getElementById('createBackdrop');

function openCreateMenu() {
    createMenu.classList.add('show');
    createBackdrop.classList.add('show');
    createNavBtn.classList.add('create-open');
    createNavBtn.querySelector('i').className = 'fa-solid fa-xmark';
}

function closeCreateMenu() {
    if (!createMenu) return;
    createMenu.classList.remove('show');
    createBackdrop.classList.remove('show');
    createNavBtn.classList.remove('create-open');
    createNavBtn.querySelector('i').className = 'fa-solid fa-plus';
}

if (createNavBtn && createMenu) {
    createNavBtn.addEventListener('click', () => {
        if (createMenu.classList.contains('show')) closeCreateMenu();
        else openCreateMenu();
    });

    // klik item menu bawah lain (Home/Library/About/Support) -> tutup menu Create
    document.querySelectorAll('.bottom-nav-item').forEach((el) => {
        if (el !== createNavBtn) el.addEventListener('click', closeCreateMenu);
    });
}

createBackdrop?.addEventListener('click', closeCreateMenu);

document.getElementById('createMenuPlaylist')?.addEventListener('click', () => {
    closeCreateMenu();
    openCreatePlaylistModal();
});
document.getElementById('createMenuQueue')?.addEventListener('click', () => {
    closeCreateMenu();
    openMobileSheet('queue');
});
document.getElementById('createMenuHistory')?.addEventListener('click', () => {
    closeCreateMenu();
    openMobileSheet('history');
});

// ===== Panel Queue & History dari bawah (mobile) =====
let mobileSheetMode = null; // 'queue' | 'history' | null (tertutup)
const mobileSheet = document.getElementById('mobileSheet');
const sheetBackdrop = document.getElementById('sheetBackdrop');
const mobileSheetTitle = document.getElementById('mobileSheetTitle');
const mobileSheetSub = document.getElementById('mobileSheetSub');
const mobileSheetBody = document.getElementById('mobileSheetBody');

function openMobileSheet(mode) {
    mobileSheetMode = mode;
    renderMobileSheet();
    mobileSheet.classList.add('show');
    sheetBackdrop.classList.add('show');
    mobileSheetBody.scrollTop = 0;
}

function closeMobileSheet() {
    mobileSheetMode = null;
    mobileSheet.classList.remove('show');
    sheetBackdrop.classList.remove('show');
}

document.getElementById('mobileSheetClose')?.addEventListener('click', closeMobileSheet);
sheetBackdrop?.addEventListener('click', closeMobileSheet);

function sheetItemHTML(song, attrs = '', titleClass = '') {
    return `
        <div class="sheet-item" data-song-id="${song.id}" ${attrs}>
            <img src="${song.songImage}" alt="" loading="lazy">
            <div class="sheet-item-info">
                <div class="sheet-item-title ${titleClass}">${song.songName}</div>
                <div class="sheet-item-artist">${song.songDes}</div>
            </div>
        </div>
    `;
}

// Mainkan lagu berdasarkan posisinya di daftar `order`
function playOrderIndex(idx) {
    currentIndex = idx;
    loadAndPlayCurrent();
    addToHistory(getCurrentSong());
    playerBar.classList.add('show');
    showNowPlayingPanel();
    highlightCurrentSong();
    updateNowBar();
}

function renderMobileSheet() {
    if (!mobileSheetMode || !mobileSheetBody) return;
    if (mobileSheetMode === 'history') renderHistorySheet();
    else renderQueueSheet();
}

function renderQueueSheet() {
    mobileSheetTitle.textContent = 'Queue';
    const isPlaying = playerBar.classList.contains('show');
    let html = '';

    if (isPlaying) {
        const current = getCurrentSong();
        mobileSheetSub.innerHTML = `Playing <b>${current.songDes}</b>`;
        html += `
            <div class="sheet-item sheet-item-now">
                <img src="${current.songImage}" alt="">
                <div class="sheet-item-info">
                    <div class="sheet-item-title current">${current.songName}</div>
                    <div class="sheet-item-artist">${current.songDes}</div>
                </div>
                <button type="button" class="sheet-play-btn" id="sheetPlayBtn">
                    <i class="fa-solid ${audio.paused ? 'fa-play' : 'fa-pause'}"></i>
                </button>
            </div>
        `;
    } else {
        mobileSheetSub.textContent = '';
    }

    if (queue.length > 0) {
        html += `<div class="sheet-section-title"><span>Next in queue</span><span class="sheet-clear" id="sheetClearQueue">Clear queue</span></div>`;
        html += queue.map((s, i) => sheetItemHTML(s, `data-queue-index="${i}"`)).join('');
    }

    if (isPlaying) {
        const upcoming = order.slice(currentIndex + 1, currentIndex + 21);
        if (upcoming.length > 0) {
            html += `<div class="sheet-section-title"><span>${songOnShuffle ? 'Shuffling from:' : 'Next from:'}</span></div>`;
            html += upcoming.map((s, i) => sheetItemHTML(s, `data-order-index="${currentIndex + 1 + i}"`)).join('');
        }
    }

    if (!html) html = `<div class="sheet-empty">Your queue is empty.</div>`;
    mobileSheetBody.innerHTML = html;

    // ketuk lagu dari "Next in queue" -> mainkan, lalu keluarkan dari queue
    mobileSheetBody.querySelectorAll('[data-queue-index]').forEach((el) => {
        el.addEventListener('click', () => {
            const i = parseInt(el.dataset.queueIndex);
            const [song] = queue.splice(i, 1);
            if (!song) return;
            order.splice(currentIndex + 1, 0, song);
            playOrderIndex(currentIndex + 1);
        });
    });

    // ketuk lagu dari "Next from" -> lompat ke lagu itu
    mobileSheetBody.querySelectorAll('[data-order-index]').forEach((el) => {
        el.addEventListener('click', () => playOrderIndex(parseInt(el.dataset.orderIndex)));
    });

    document.getElementById('sheetPlayBtn')?.addEventListener('click', () => play.click());
    document.getElementById('sheetClearQueue')?.addEventListener('click', () => {
        queue = [];
        renderQueuePanel();
        renderMobileSheet();
    });
}

function renderHistorySheet() {
    mobileSheetTitle.textContent = 'History';

    if (playHistory.length === 0) {
        mobileSheetSub.textContent = '';
        mobileSheetBody.innerHTML = `<div class="sheet-empty">No songs have been played yet.</div>`;
        return;
    }

    mobileSheetSub.textContent = `${playHistory.length} recently played`;
    mobileSheetBody.innerHTML = playHistory.map((s) => sheetItemHTML(s)).join('');

    mobileSheetBody.querySelectorAll('.sheet-item').forEach((el) => {
        el.addEventListener('click', () => {
            const id = parseInt(el.dataset.songId);
            const pos = order.findIndex((s) => s.id === id);
            playOrderIndex(pos !== -1 ? pos : 0);
        });
    });
}

// ikon play/pause di panel Queue ikut berubah
audio.addEventListener('play', renderMobileSheet);
audio.addEventListener('pause', renderMobileSheet);

setupMediaSessionHandlers();

document.addEventListener('keydown', (e) => {
    if (e.code !== 'Space') return;

    // Jangan intercept spasi kalau user lagi ngetik di input/textarea/elemen yang bisa diedit
    const tag = (e.target.tagName || '').toLowerCase();
    const isEditable = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
    if (isEditable) return;

    // Hanya aktif kalau sudah ada lagu yang diputar (now bar sedang tampil)
    if (!playerBar.classList.contains('show')) return;

    e.preventDefault(); // cegah halaman ikut scroll ke bawah
    play.click(); // pakai tombol play yang sudah ada, biar semua sinkron (now bar, mini player, dsb)
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
}

// ===== Hide / show Now Playing view (desktop) + titik 3 di phone frame =====
const npHideBtn = document.getElementById('npHideBtn');
const npShowEdge = document.getElementById('npShowEdge');
const npMoreBtn = document.getElementById('npMoreBtn');
const NP_HIDDEN_KEY = 'spotiware_np_hidden';

function setNowPlayingHidden(hidden) {
    document.body.classList.toggle('np-hidden', hidden);
    try { localStorage.setItem(NP_HIDDEN_KEY, hidden ? '1' : '0'); } catch (e) {}
}

npHideBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    setNowPlayingHidden(true);
});
npShowEdge?.addEventListener('click', () => setNowPlayingHidden(false));

// titik 3: Save to your Liked Songs, Add to Queue, Add to Playlist (untuk lagu yang sedang diputar)
npMoreBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!playerBar.classList.contains('show')) return;
    const rect = npMoreBtn.getBoundingClientRect();
    openSongContextMenu(rect.left, rect.bottom + 4, getCurrentSong().id, true);
});

// ingat pilihan terakhir pengguna
let _npWasHidden = false;
try { _npWasHidden = localStorage.getItem(NP_HIDDEN_KEY) === '1'; } catch (e) {}
setNowPlayingHidden(_npWasHidden);

// ===== Data per akun =====
const BASE_PLAYLIST_KEY = 'spotiware_playlists';
const BASE_HISTORY_KEY = 'spotiware_play_history';
let accountUid = undefined;

function switchAccountData(user) {
    const uid = user ? user.uid : null;
    if (uid === accountUid) return;
    accountUid = uid;

    if (uid) {
        PLAYLIST_KEY = BASE_PLAYLIST_KEY + ':' + uid;
        HISTORY_KEY = BASE_HISTORY_KEY + ':' + uid;
        // data lama (sebelum fitur ini) diberikan ke akun pertama yang login, sekali saja
        try {
            if (!localStorage.getItem('spotiware_legacy_claimed')) {
                const oldPl = localStorage.getItem(BASE_PLAYLIST_KEY);
                const oldHi = localStorage.getItem(BASE_HISTORY_KEY);
                if (oldPl && !localStorage.getItem(PLAYLIST_KEY)) localStorage.setItem(PLAYLIST_KEY, oldPl);
                if (oldHi && !localStorage.getItem(HISTORY_KEY)) localStorage.setItem(HISTORY_KEY, oldHi);
                localStorage.removeItem(BASE_PLAYLIST_KEY);
                localStorage.removeItem(BASE_HISTORY_KEY);
                localStorage.setItem('spotiware_legacy_claimed', uid);
            }
        } catch (e) {}
    } else {
        PLAYLIST_KEY = BASE_PLAYLIST_KEY;
        HISTORY_KEY = BASE_HISTORY_KEY;
    }

    playHistory = loadSavedHistory();
    queue = [];
    pdCurrentPlaylistId = null;
    renderHistory();
    renderPlaylistList();
    if (document.getElementById('playlistDetailView')?.classList.contains('show')) closePlaylistDetailView();
    window.dispatchEvent(new Event('spotiware:account-changed'));
}
if (window.firebase && firebase.auth) firebase.auth().onAuthStateChanged(switchAccountData);

// kursor di atas "<": sembunyikan scrollbar daftar lagu
npShowEdge?.addEventListener('mouseenter', () => document.body.classList.add('np-edge-hover'));
npShowEdge?.addEventListener('mouseleave', () => document.body.classList.remove('np-edge-hover'));
npShowEdge?.addEventListener('click', () => document.body.classList.remove('np-edge-hover'));

// Inisialisasi Aplikasi
homeSongsOrder = shuffleSongs(visibleSongs);
renderSongs(homeSongsOrder);
setupSearch();
renderHistory();
renderPlaylistList();
document.getElementById('playlistList')?.classList.add('view-' + libraryViewMode);
updateLibrarySortIcon();