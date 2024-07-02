console.log("lets write js")
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds){
    if(isNaN(seconds) || seconds < 0){
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder){
    //let a = await fetch(`http://127.0.0.1.5500/${folder}/`)
//let a = await fetch(`/${folder}/`)
currFolder = folder;
 let a = await fetch(`http://127.0.0.1:5500/${currFolder}/`)
let response = await a.text();
let div = document.createElement("div")
div.innerHTML = response;
let as = div.getElementsByTagName("a")
 songs = []
for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if(element.href.endsWith(".mp3")){
        songs.push(element.href.split(`/${folder}/`)[1])
    }
}
 //show all the songs in the list
 let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
 songUL.innerHTML = ""
 for (const song of songs) {
     songUL.innerHTML = songUL.innerHTML + `<li><img class ="invert" src="music.svg" alt="">
             <div class="info">
             <div> ${song.replaceAll("%20", " ")} </div>
             <div> Anjali </div>
             </div>
             <div class="playnow">
              <span>Play Now</span>
             <img class = "invert" src="play.svg" alt="">
             </div></li>`;
 }

 // play the first song
 // var audio = new Audio(songs[0]);
 // audio.play();

 // audio.addEventListener("loadeddata", () => {
 //     let duration = audio.duration;
 //     console.log(audio.duration, audio.currentSrc, audio.currentTime)
 // });
// attach an event listner to each song

 Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
     e.addEventListener("click", element=>{

     playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
     })
     
 })

//return songs
} 

const playMusic = (track, pause=false)=>{
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currFolder}/` + track
    if(!pause){
        currentSong.play()
        play.src = "pause.svg"
    }
    
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
   let anchors =  div.getElementsByTagName("a")
   let cardContainer = document.querySelector(".cardContainer")
   Array.from(anchors).forEach(async e=>{

  
    
    if(e.href.includes("/songs")){
        let folder = e.href.split("/").slice(-1)[0]
        //get the meta data of the folder
        let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
        let response = await a.json();
        console.log(response)
        cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmins="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>

                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`

    }
   })

}

async function main(){

    
    // get the list of all the songs 
   await getSongs("songs/ncs")
    playMusic(songs[0], true)
    // console.log(songs)
    
    //display all the albums on the page
displayAlbums()
     

//attach an event listener to play forward and previous
play.addEventListener("click", ()=>{
    if(currentSong.paused){
        currentSong.play()
        play.src = "pause.svg"
    }
    else{
        currentSong.pause()
        play.src = "play.svg"
    }
})

//listen for time update event
currentSong.addEventListener("timeupdate", ()=>{
    console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.
     currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
     document.querySelector(".circle").style.left = (currentSong.currentTime/ currentSong.duration) * 100 + "%";
})

//add an event listener to seek bar
document.querySelector(".seekbar").addEventListener("click", e=>{
   let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime =((currentSong.duration)* percent)/100
})


//add an event listener for hamburger
document.querySelector(".hamburger").addEventListener("click", ()=>{
    document.querySelector(".left").style.left = "0"
})

//add an event listener for close button
document.querySelector(".close").addEventListener("click", ()=>{
    document.querySelector(".left").style.left = "-120%"
})

//add an event listener for previous button
previous.addEventListener("click",()=>{
    console.log("previous clicked")
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if((index+1)  >= 0){
        playMusic(songs[index-1])
    }
})

//add an event listener for forward button
forward.addEventListener("click",()=>{
    console.log("forward clicked")

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if((index+1)  < songs.length){
        playMusic(songs[index+1])
    }
   
})

//add an eventlistener to volume
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
    console.log("Setting volume to", e.target.value, "/100")
    currentSong.volume = parseInt(e.target.value)/100
})

   //load the playlist whenever card is clicked
   Array.from(document.getElementsByClassName("card")).forEach(e=>{
    e.addEventListener("click",async item=>{
       // console.log(item,item.currentTarget.dataset)
        songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
      
    })
})

//add eventlistener to mute the track

document.querySelector(".volume>img").addEventListener("click", e=>{
    console.log(e.target)
    console.log("changing", e.target.src)
    if(e.target.src.includes("volume.svg")){
        e.target.src = e.target.src.replace("volume.svg", "mute.svg")
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
        e.target.src = e.target.src.replace("mute.svg", "volume.svg")
        currentSong.volume = .10;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
       
    }
})


}
 
main()