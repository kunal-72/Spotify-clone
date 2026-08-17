let hamburder = document.querySelector('.header-1 img');


let close = document.querySelector('.close');

let songs;
let currFolder;


// this is to set the time  of songs
function formatTime(seconds) {
    // Ensure input is a whole number
    const totalSeconds = Math.floor(seconds);

    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    // Format with leading zeros
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(secs).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder
    let URL = `http://127.0.0.1:5500${folder}`
    let res = await fetch(URL);
    let data = await res.text();
    let div = document.createElement('div');
    div.innerHTML = data;

    let as = div.querySelectorAll('a');

    songs = [];

    for (let i = 0; i < as.length; i++) {
        if (as[i].href.endsWith('.mp3')) {
            let element = as[i];
            let decodedURL = decodeURI(element.href);
            songs.push(decodedURL.split(`${folder}`)[1])
        }
    }




    //show all songs in play-list
    let playList = document.querySelector('.play-list');
    playList.innerHTML = '';
    for (const song of songs) {
        let song1 = `  <div class="songs-1">
                        <div>
                            <img src="/img/music.svg" class="invert" alt="" srcset="">
                        </div>
                        <div class="info">${song.replaceAll('%20', " ")}</div>
                        <div>Play Now</div>
                        <div>
                            <img src="/img/playsong.svg" class="invert"
                                style="height: 15px;" alt="" srcset="">
                        </div>
                    </div>`

        playList.innerHTML = playList.innerHTML + song1
    }



    let songList = document.querySelectorAll('.songs-1');
    songList.forEach(element => {
        element.addEventListener('click', () => {
            playMusic(element.querySelector('.info').innerHTML)
        })
    });

    return songs;

}




let currentSong = new Audio();
let currentSongIndex = 0;
let playMusic = (track, pause = false) => {
    currentSong.src = `${currFolder}` + track;
    console.log(track)

    if (!pause) {
        currentSong.play();
        playBtn.src = '/img/pausebtn.svg';
    }
    document.querySelector(".curr-song").innerHTML = track;
   
}





async function displayAlbums() {
    let URL = `http://127.0.0.1:5500/Songs/`;
    let response = await fetch(URL);
    let data = await response.text();


    let div = document.createElement('div');
    div.innerHTML = data;

    let cardContainer = document.querySelector('.card-container');
    cardContainer.innerHTML = '';

    let anchorsTag = div.querySelectorAll('a');
    for (let i = 0; i < anchorsTag.length; i++) {
        if (anchorsTag[i].href.includes('/Songs/')) {
            let folder = anchorsTag[i].href.split('/').slice(-1)[0].replaceAll('%20', " ");


            let a = await fetch(`http://127.0.0.1:5500/Songs/${folder}/info.json`);
            let response = await a.json();
           

            let card = ` <div class="card"    data-folder="${folder}">
                <img src="/Songs/${folder}/cover.jpg" alt="">
                <h4>${response.title}</h4>
                <p>${response.description}</p>
                <div class="circle-button">
                    <i class="fa-solid fa-play"></i>
                </div>
            </div>`

            cardContainer.innerHTML = cardContainer.innerHTML + card
        }
    }



    let album = cardContainer.children;

    for (const element of album) {
        element.addEventListener('click', async (e) => {
            songs = await getSongs(`/Songs/${e.currentTarget.dataset.folder}/`);
            
            playMusic(songs[0]);
        })
    }

}


async function main() {

    // get songs list
    await getSongs('/Songs/Finding her/'); 
    playMusic(songs[0], true);

    await displayAlbums()


    // event listner to hamburger
    hamburder.addEventListener('click', () => {
        console.log('clicked')
        document.querySelector('.left').style.left = 0;
    })

    // event listner to close btn
    close.addEventListener('click', () => {
        console.log('clicked')
        document.querySelector('.left').style.left = '-300px';
    })


    currentSong.addEventListener('timeupdate', () => {
        document.querySelector(".time").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
        // to translate circle
        document.querySelector(".thumb").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";


    })


    let prevBtn = document.querySelector('#prevBtn');

    let nextBtn = document.querySelector('#nextBtn');


    playBtn.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playBtn.src = '/img/pausebtn.svg';

        } else {
            currentSong.pause();
            playBtn.src = '/img/playsong.svg'

        }
    })



    prevBtn.addEventListener('click', () => {

        console.log((currentSong.src.split('/').slice(-1)[0]))
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0].replaceAll("%20", " "));     
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
        }

    })






    nextBtn.addEventListener('click', () => {
        console.log("Next currentSong");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0].replaceAll("%20", " "));     
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }



    })




    document.querySelector('.seekbar').addEventListener('click', (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".thumb").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;         // time update
    })




    let input = document.querySelector('.volume-controler input')
    input.addEventListener('change', (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume == 0) {
            console.log(document.querySelector(".volume-controler img").src )
            document.querySelector(".volume-controler img").src = '/img/mute.svg'
        }else{
            document.querySelector(".volume-controler img").src = '/img/volume.svg'
        }


    })




    document.querySelector(".volume-controler img").addEventListener("click", (e)=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace ("volume.svg","mute.svg");
            currentSong.volume = 0;
            document.querySelector(".volume-controler input").value = 0;
        }else{
            e.target.src = e.target.src.replace ("mute.svg", "volume.svg");
            currentSong.volume = .10;
            document.querySelector(".volume-controler input").value = 10;
        }
    })


}

main();


