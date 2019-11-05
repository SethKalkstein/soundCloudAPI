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
	}
  });

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



searchButton.addEventListener("click", function(){ //searches for songs or artists/users
		searchTrackArray = []; //clears the array from the last search
		SC.get("/tracks/",{    //call to the API to look for songs
			limit: 200, q: userInput.value  //get in max of 200 results grabs user text from input box for the search
		}).then(function(searchLoad){ //searchLoad is a list of objects representing tracks in the format sent from the API
			for(let i=0;i<searchLoad.length;i++){
				var scTrack = {}; //creates empty object literal where only the information I'll be using is stored, this information will be global becuase it is being pushed into the global searchTrackArray variable
				scTrack.id = searchLoad[i].id;  //assigns the track id to the object 
				scTrack.art  = searchLoad[i].artwork_url; //assiigns the artwork, etc...
				scTrack.user = searchLoad[i].user.username;
				scTrack.date = searchLoad[i].created_at;
				scTrack.song = searchLoad[i].title;
				searchTrackArray.push(scTrack);  //pushes the object into the track array
		} //end loop
		console.log(searchLoad);
	}).then(function(){ 
		searchCounter = 0;
		makesSearchList();
	}) //end .then()
	firstPlay = true; //resets the first play
	console.log("search button event listener finished");
}) //end of event listener for search button

function makesSearchList(){ 
	
	var info = []; //will be an array of html elements
	let startPosition = searchCounter * 10; //finds the current position within the array that is being displayed
	let searchLength = 0;

	searchResults.innerHTML = "";

	if(searchTrackArray.length - searchCounter * 10 <= 9){
		searchLength = searchTrackArray.length -searchCounter * 10;
 	} else{
 		searchLength = 10;
 	}
	for(let i=0; i<searchLength; i++) { //only loads ten at a time
			console.log(searchTrackArray[i+startPosition]);
			console.log((i+startPosition)+" inside for loop");
			info.push(document.createElement("h6")); //creates a heading tag
			let node = document.createTextNode(i+startPosition + 1 + ". Song: " + searchTrackArray[i+startPosition].song  + " User: " + searchTrackArray[i+startPosition].user); //sets the id of a track equal to what the inner text will be
			info[i].appendChild(node); //attaches that inner text to the h6 tag
			info[i].addEventListener("click",()=> {
				console.log(i + startPosition + " I've been clicked");
				currentSong = i + startPosition;
				firstPlay = true;
			})
			searchResults.appendChild(info[i]); //attaches the h6 to the document
	} //end for
	searchCounter ++; //incrimenets the counter
	console.log("search counter is: "+searchCounter);
	pageNumber.innerHTML = searchCounter + " of " + Math.ceil(searchTrackArray.length / 10); //tells the user which page of search results they are on
} //end function. the function breaks when calling the specific searchTrackArray[] members because they are not defined



playButton.addEventListener('click', function(){
	if(firstPlay == true){ 
		// response = null;
		SC.stream("/tracks/" + searchTrackArray[currentSong].id).then(function(response){ //loads the song if it is the first time the play button is being pushed.

			loadedSong = response; //sets the stream to a global variable so that it can be accessed outside this playbutton event
			// response.play(); //plays the song
			loadedSong.play();
			// console.log(loadedSong.getDuration());
			firstPlay = false; //the track has now had the play button hit one time
			// console.log(loadedSong.getDuration() + "Meow");
			loadedSong.on("play-start", getSongLength);
			// function(){
			// 	songLength = loadedSong.getDuration();
			// 	console.log(songLength + " Purr and Purr");
			// });
		})
		// .then(function(){ 
		// 	searchCounter = 5;
		// 	makesSearchList();
		// 	// console.log(response.getDuration());
		// });
		
		
	//	then(() => console.log(loadedSong.getDuration()));
		
		
		console.log("Now Playing: " + searchTrackArray[currentSong].song + " by User: " + searchTrackArray[currentSong].user);
	
	}
	else{
		loadedSong.play(); //play the song!
	}
});

function getSongLength(){
	songLength = loadedSong.getDuration();
	console.log(songLength + " Purr and Purr");
}


pauseButton.addEventListener('click', function(){
	loadedSong.pause(); //pause it!
	// console.log(loadedSong.getDuration());
	console.log(loadedSong.currentTime());
});

searchStart.addEventListener("click", function(){
	searchCounter = 0;
	makesSearchList(); //will always be the same results as the initial search load 
});

searchNext.addEventListener("click", function(){
	if(searchCounter === searchTrackArray.length / 10){
		console.log("blah")
		searchCounter = searchTrackArray.length / 10 - 1;
		makesSearchList();
	}
	else if(searchTrackArray.length / 10 - searchCounter < 1){ //if there are less than 10 items left in the array
		searchCounter = Math.floor(searchTrackArray.length / 10);
		makesSearchList();
	}
	else{
		makesSearchList(); //loads the next search
	} //end else
});

searchPrev.addEventListener("click", function(){
	if(searchCounter === 1){
		searchCounter = 0;
		makesSearchList();
	}
	else{
		searchCounter -= 2;
		makesSearchList();
	}
});

searchEnd.addEventListener("click", function(){
	if(searchTrackArray.length % 10 === 0){ //when the number of results is divisible by 10
		searchCounter = searchTrackArray.length / 10 - 1;
		makesSearchList();
	}
	else{
		searchCounter = Math.floor(searchTrackArray.length / 10);
		makesSearchList();
	}
});

// //function to set the timeout for the creation of the modal
// function durationLoader(){
// 	setTimeout(()=>console.log(loadedSong.getDuration() + "Meow"), 3000);
// }
// //add an event listener to the page upon loading
// playButton.addEventListener("click", durationLoader);