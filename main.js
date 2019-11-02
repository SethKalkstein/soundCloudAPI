// api info:
// https://developers.soundcloud.com/docs/api/sdks#javascript

var loadedSong;        //global for holding the stream 
var firstPlay = true;  //is this the first time play has been hit for a particular song?
var searchTrackArray = []; //will hold an array of objects with relevant information about tracks (each track is represented by an object which is a member of the array)
var searchCounter = 0;
var selectedTracks = [];
var currentSong = 0;

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
		searchCounter=0;
		makesSearchList();
	}) //end .then()
	firstPlay = true; //resets the first play
	console.log("search button event listener finished");
}) //end of event listener for search button

function makesSearchList(){ 
	searchResults.innerHTML="";
	var info=[]; //will be an array of html elements
	let startPosition=searchCounter*10; //finds the current position within the array that is being displayed
	searchLength = 0;
	if(searchTrackArray.length - searchCounter*10 <= 9){
		searchLength = searchTrackArray.length -searchCounter*10;
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
				console.log(i+startPosition + " I've been clicked");
				currentSong = i + startPosition;
			})
			searchResults.appendChild(info[i]); //attaches the h6 to the document
	} //end for
	searchCounter ++; //incrimenets the counter
	console.log("search counter is: "+searchCounter);
	pageNumber.innerHTML=searchCounter+" of "+Math.ceil(searchTrackArray.length/10); //tells the user which page of search results they are on
} //end function. the function breaks when calling the specific searchTrackArray[] members because they are not defined



playButton.addEventListener('click', function(){
	// if(firstPlay==true){ 
		// response=null;
		SC.stream("/tracks/"+searchTrackArray[currentSong].id).then(function(response){ //loads the song if it is the first time being played, will eventually be dynamic rather than calling [3] it will call [someVariable]
			loadedSong = response; //sets the stream to a global variable so that it can be accessed outside this playbutton event
			response.play(); //plays the song

			// firstPlay = false; //the track has now had the play button hit once
		})
		console.log("Now Playing: " + searchTrackArray[currentSong].song + " by User: " + searchTrackArray[currentSong].user);
	// }
	// else{
	// 	loadedSong.play(); //play the song!
	// }
});

pauseButton.addEventListener('click', function(){
	loadedSong.pause(); //pause it!
});

searchStart.addEventListener("click", function(){
	searchCounter=0;
	makesSearchList(); //will always be the same results as the initial search load
});

searchNext.addEventListener("click", function(){
	if(searchCounter===searchTrackArray.length/10){
		console.log("blah")
		searchCounter=searchTrackArray.length/10-1;
		makesSearchList();
	}
	else if(searchTrackArray.length/10 - searchCounter < 1){ //if there are less than 10 items left in the array
		searchCounter=Math.floor(searchTrackArray.length/10);
		makesSearchList();
	}
	else{
		makesSearchList(); //loads the next search
	} //end else
});

searchPrev.addEventListener("click", function(){
	if(searchCounter===1){
		searchCounter=0;
		makesSearchList();
	}
	else{
		searchCounter -=2;
		makesSearchList();
	}
});

searchEnd.addEventListener("click", function(){
	if(searchTrackArray.length%10===0){ //when the number of results is divisible by 10
		searchCounter=searchTrackArray.length/10-1;
		makesSearchList();
	}
	else{
		searchCounter=Math.floor(searchTrackArray.length/10);
		makesSearchList();
	}
})