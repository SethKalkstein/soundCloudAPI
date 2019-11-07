// api info:
// https://developers.soundcloud.com/docs/api/sdks#javascript

var loadedSong;        //global for holding the stream 
var firstPlay = true;  //is this the first time play has been hit for a particular song?
var searchTrackArray = []; //will hold an array of objects with relevant information about tracks (each track is represented by an object which is a member of the array)
var searchCounter = 0;
var selectedTracks = [];
var currentSong = 0;
var songLength = 0;
var skipLength = 10000; //in Milliseconds

var playButton = document.getElementById("playButton"); 
var pauseButton = document.getElementById("pauseButton");
var searchButton = document.getElementById("submit");
var userInput = document.getElementById("userInput");
var searchResults = document.getElementById("searchResults");
var searchNext = document.getElementById("searchNext");
var searchPrev = document.getElementById("searchPrev");
var searchEnd = document.getElementById("searchEnd");
var searchStart = document.getElementById("searchStart");
var pageNumber = document.getElementById("pageNumber");
var seekForward = document.getElementById("seekForward");
var seekBack = document.getElementById("seekBack");
var autoPlayCheck = document.getElementById("autoPlayCheck");
var repeatSongCheck = document.getElementById("repeatSong");
var repeatAllCheck = document.getElementById("repeatAll");


  function skipBack() {
	  console.log("About to Skip Back " + loadedSong.currentTime());
	let newTimePosition = loadedSong.currentTime() > skipLength ? loadedSong.currentTime() - skipLength : 0;
	loadedSong.seek(newTimePosition);
	console.log("Skipped Back " + loadedSong.currentTime());
  }

  function skipForward() {
	console.log("Skipped forward " + loadedSong.currentTime());
	let newTimePosition = loadedSong.currentTime() + skipLength < songLength ? loadedSong.currentTime() + skipLength : songLength;
	loadedSong.seek(newTimePosition);
	console.log("Skipped Forward " + loadedSong.currentTime());
  }

function makesSearchList(){ 
	
	var info = []; //will be an array of html elements
	let startPosition = searchCounter * 10; //current start position of displayed results
	let currentDisplayedResults = 0; //number of results
	let tracksUntilEnd = searchTrackArray.length - startPosition;
	console.log("search counter: " + searchCounter);
	searchResults.innerHTML = "";
	
	currentDisplayedResults = tracksUntilEnd <= 9 ? tracksUntilEnd : 10;

	for(let i = 0; i < currentDisplayedResults; i++) { //only loads ten at a time
		let currentPosition = i + startPosition;
		console.log(searchTrackArray[currentPosition]);
		console.log((currentPosition)+" inside for loop");
		info.push(document.createElement("h6")); //creates a heading tag
		let node = document.createTextNode(currentPosition + 1 + ". Song: " + searchTrackArray[currentPosition].song  + " User: " + searchTrackArray[currentPosition].user); //sets the id of a track equal to what the inner text will be
		info[i].appendChild(node); //attaches that inner text to the h6 tag
		info[i].addEventListener("click",()=> {
			console.log(currentPosition + " I've been clicked");
			currentSong = i + startPosition;
			firstPlay = true;
		})
		searchResults.appendChild(info[i]); //attaches the h6 to the document
	} 
	console.log("search counter is: " + searchCounter);
	pageNumber.innerHTML = searchCounter + 1 + " of " + Math.ceil(searchTrackArray.length / 10); 
} 

function getSongLength(){
	songLength = loadedSong.getDuration();
	console.log(songLength + " Purr and Purr");
}

// function autoPlay(){ 
// 	if(autoPlayCheck.checked) {
// 		songAdvancer(1);
// 		// autoPlayCheck.checked = false;
// 	}
// }

function endOfSongController() {
	let lastTrackPos = searchTrackArray.length - 1; 

	if(repeatSongCheck.checked){
		songAdvancer(0); //will set off events to reinitialize the same track
	} else if(currentSong == lastTrackPos && repeatAllCheck.checked ){
		songAdvancer(-lastTrackPos); //will go back the total number of tracks
	} else if (autoPlayCheck.checked){
		songAdvancer(1); //advance one song
	}
}

function songAdvancer(advanceSong){ //advance song represents the number of songs advanced, negative for previous songs
	if(currentSong + advanceSong >= 0 && currentSong + advanceSong < searchTrackArray.length ){
		firstPlay = true;
		currentSong += advanceSong;
		playSong();
	}
}


autoPlayCheck.addEventListener("click", function() {
	if(this.checked){
		repeatSongCheck.checked = false; 
	}
});

repeatSongCheck.addEventListener("click", function() {
	if(this.checked){
		repeatAllCheck.checked = false;
		autoPlayCheck.checked = false; 
	}
});

repeatAllCheck.addEventListener("click", function () {
	if(this.checked) {
		repeatSongCheck.checked = false;
		autoPlayCheck.checked = true;
	}
});

searchButton.addEventListener("click", function(){ //searches for songs
	searchTrackArray = []; //clears the array from the last search
	SC.get("/tracks/",{    //call to the API to look for songs
		limit: 200, q: userInput.value  //get in max of 200 results grabs user text from input box for the search
	}).then(function(searchLoad){ //searchLoad is an array of objects representing tracks in the format sent from the API
		//create array (searchTrackArray[]) of objects, globally, with only the info I need
		for(let i = 0;i < searchLoad.length; i++){
			var scTrack = {}; 
			scTrack.id = searchLoad[i].id;  //assigns the track id to the object 
			scTrack.art  = searchLoad[i].artwork_url; //assiigns the artwork, etc...
			scTrack.user = searchLoad[i].user.username;
			scTrack.date = searchLoad[i].created_at;
			scTrack.song = searchLoad[i].title;
			searchTrackArray.push(scTrack);  //pushes the object into the track array
	} 
	console.log(searchLoad);
}).then(function(){ 
	searchCounter = 0;
	makesSearchList();
}) //end .then()
console.log("search button event listener finished");
}) //end of event listener for search button

function playSong(){
	if(firstPlay == true){ 
		
		SC.stream("/tracks/" + searchTrackArray[currentSong].id).then(function(response){ //loads the song if it is the first time the play button is being pushed.

			loadedSong = response; //sets the stream to a global variable so that it can be accessed outside this playbutton event
			firstPlay = false; //the track has now had the play button hit one time
			
			loadedSong.play();
			loadedSong.on("play-start", getSongLength);
			// loadedSong.on("finish", autoPlay); 
			loadedSong.on("finish", endOfSongController); 

		})
				
		console.log("Now Playing: " + searchTrackArray[currentSong].song + " by User: " + searchTrackArray[currentSong].user);
	
	}
	else{
		loadedSong.play(); //play the song!
	}
}

playButton.addEventListener('click', function(){
	playSong();
});

pauseButton.addEventListener('click', function(){
	loadedSong.pause(); //pause it!
	// console.log(loadedSong.getDuration());
	console.log(loadedSong.currentTime());
});

searchStart.addEventListener("click", function(){
	searchCounter = 0;
	makesSearchList(); 
});

searchNext.addEventListener("click", function(){
	let numOfMenuPages = searchTrackArray.length / 10 - 1; //starting with zero
	//don't fire on last page of results
	if(!(searchCounter === numOfMenuPages || numOfMenuPages - searchCounter < 0)){
		searchCounter ++;
		makesSearchList();
	}	
});

searchPrev.addEventListener("click", function(){
	//don't fire on first page of results
	if(searchCounter != 0){
		searchCounter--;
		makesSearchList();
	}	
});

searchEnd.addEventListener("click", function(){
	let totalNumberOfTracks = searchTrackArray.length;
	//set counter to last menu index depending on how many total tracks there are
	searchCounter = totalNumberOfTracks % 10 === 0 ? totalNumberOfTracks / 10 - 1 : Math.floor(totalNumberOfTracks / 10);
	makesSearchList();
});

seekBack.addEventListener("click", () => {
	skipBack()
});

seekForward.addEventListener("click", () => {
	skipForward()
});

document.addEventListener("keydown", event => {
	if (event.keyCode == 37) {
		skipBack();
	} else if (event.keyCode == 39){
		skipForward();
	} else if (event.keyCode == 38){
		songAdvancer(-1); //previous song
	} else if (event.keyCode == 40) {
		songAdvancer(1);
	}
  });
