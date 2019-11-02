// api info:
// https://developers.soundcloud.com/docs/api/sdks#javascript


var loadedSong;        //global for holding the stream 
var firstPlay = true;  //is this the first time play has been hit for a particular song?
var trackArray = []; //will hold an array of objects with relevant information about tracks (each track is represented by an object which is a member of the array)

var playButton = document.getElementById("playButton"); 
var pauseButton = document.getElementById("pauseButton");
var searchButton = document.getElementById("submit");
var userInput = document.getElementById("userInput");

searchButton.addEventListener("click", function(){ //searches for songs or artists/users
	console.log("searchButton event started");
		trackArray = []; //clears the array from the last search
		SC.get("/tracks/",{    //call to the API to look for songs
			limit: 200, q: userInput.value  //get in max of 200 results grabs user text from input box for the search
		}).then(function(searchLoad){ //searchLoad is a list of objects representing tracks in the format sent from the API
			for(let i=0;i<searchLoad.length;i++){
				var scTrack = {}; //creates empty object literal where only the information I'll be using is stored, this information will be global becuase it is being pushed into the global trackArray variable
				scTrack.id = searchLoad[i].id;  //assigns the track id to the object 
				scTrack.art  = searchLoad[i].artwork_url; //assiigns the artwork, etc...
				scTrack.user = searchLoad[i].user.username;
				scTrack.date = searchLoad[i].created_at;
				scTrack.song = searchLoad[i].title;
				trackArray.push(scTrack);  //pushes the object into the track array
		} //end loop
	}) //end .then()
	firstPlay = true; //resets the first play
	makesSearchList(); //calls function wrapped inside a set timeout
	console.log("search button event listener finished");
}) //end of event listener for search button

function makesSearchList(){ 
	window.setTimeout(function(){ //this line makes it work!
		var para=[]; //will be an array of html elements
		for(var i=0; i<10; i++) { //only loads ten at a time
			console.log(trackArray);
			console.log(i+" inside for loop");
			para.push(document.createElement("h6")); //creates a heading tag
			let node = document.createTextNode(trackArray[i].id); //sets the id of a track equal to what the inner text will be
			para[i].appendChild(node); //attaches that inner text to the h6 tag
			document.body.appendChild(para[i]); //attaches the h6 to the document
		} //end for 
	}, 3000) //end timeout
} //end function. the function works because trackArray is given time to load and is therefore not undefined.

playButton.addEventListener('click', function(){
	if(firstPlay==true){ 
		SC.stream("/tracks/"+trackArray[3].id).then(function(response){ //loads the song if it is the first time being played, will eventually be dynamic rather than calling [3] it will call [someVariable]
			loadedSong = response; //sets the stream to a global variable so that it can be accessed outside this playbutton event
			response.play(); //plays the song
			firstPlay = false; //the track has now had the play button hit once
		})
	}
	else{
		loadedSong.play();
	}
})

pauseButton.addEventListener('click', function(){
	loadedSong.pause();
})










// searchButton.addEventListener("click", function(){
// 	console.log("searchButton event started");
// 	// trackArray = [];
// 	// SC.get("/tracks/",{ 
// 	// 	limit: 200, q: userInput.value
// 	// 	}).then(function(searchLoad){
// 	// 		console.log(searchLoad)
// 	// 		for(let i=0;i<searchLoad.length;i++){
// 	// 			var scTrack = {};
// 	// 			scTrack.id = searchLoad[i].id;
// 	// 			scTrack.art  = searchLoad[i].artwork_url;
// 	// 			scTrack.user = searchLoad[i].user.username;
// 	// 			scTrack.date = searchLoad[i].created_at;
// 	// 			scTrack.song = searchLoad[i].title;
// 	// 			trackArray.push(scTrack);
// 	// 	}
// 	// })
// 	// console.log(trackArray);
// 	// firstPlay = true;
// 	// window.setTimeout(function(){
// 	// 	var para=[];
// 	// 	for(let i=0; i<10; i++){
// 	// 		para.push(document.createElement("h6"));
// 	// 		let node = document.createTextNode(trackArray[i].id);
// 	// 		para[i].appendChild(node);
// 	// 		document.body.appendChild(para[i]);
// 	// 	}
// 	// },2000)
// 	let makePromise = new Promise(function(resolve, reject){
// 		console.log("promise started");
// 		trackArray = [];
// 		SC.get("/tracks/",{ 
// 			limit: 200, q: userInput.value
// 		}).then(function(searchLoad){
// 			// console.log(searchLoad)
// 			for(let i=0;i<searchLoad.length;i++){
// 				var scTrack = {};
// 				scTrack.id = searchLoad[i].id;
// 				scTrack.art  = searchLoad[i].artwork_url;
// 				scTrack.user = searchLoad[i].user.username;
// 				scTrack.date = searchLoad[i].created_at;
// 				scTrack.song = searchLoad[i].title;
// 				trackArray.push(scTrack);
// 		}
// 	})
// 	// console.log(trackArray);
// 	firstPlay = true;
// 	resolve(searchLoad);
// 	console.log("promise finished");
// 	})
// 	makePromise.then(function(something){
// 		makesSearchList();
// 		// console.log(something);
// 		// console.log(trackArray);
// 		var para=[];
// 		console.log("before the for")
// 		for(var i=0; i<10; i++) {
// 			// console.log(i+"inside for loop"+trackArray[i].title);
// 			para.push(document.createElement("h6"));
// 			// let node = document.createTextNode(trackArray[i].id);
// 			let node = document.createTextNode("h6 number: "+i);
// 			para[i].appendChild(node);
// 			document.body.appendChild(para[i]);
// 		}
// 		console.log("after the for")
// 	})
// 	console.log("search button event listener finished");
// })