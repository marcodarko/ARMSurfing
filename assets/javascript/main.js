
 var basicQueryURL = "http://api.worldweatheronline.com/premium/v1/marine.ashx?key=39b54ca9715647da97a205941170903&format=json&tide=yes&q=";
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyC9wP1vydAT-A-xzYxjEKjAPnnjyq0znsI",
    authDomain: "armsurfing-9502f.firebaseapp.com",
    databaseURL: "https://armsurfing-9502f.firebaseio.com",
    storageBucket: "armsurfing-9502f.appspot.com",
    messagingSenderId: "231633652696"
  };
  firebase.initializeApp(config);
  
  var surfStorage = firebase.database();
  //function we'll use to get data from our surf api
  function surfAPI(newURL) {

  	$.ajax({
  		url: newURL,
  		method: "GET",
  		crossDomain: true,
  		dataType: 'jsonp',
  		success: function(resp) {
  			console.log(resp);
  		}
  	});
  }

$("#searchBtn").on("click", function(){
	//use "userSearch" for input value
	var userInput = $("#searchText").val().trim();
	//create new api url thats associated with user input
	var newQueryURL = basicQueryURL + userInput;
	//object to store user input into firebase
	var surfObj = {

		location: userInput
	};
	//passing new url into surfAPI function
	surfAPI(newQueryURL);
	//pushing our user input object into firebase
	surfStorage.ref().push(surfObj);
	//preventing the on submit default setting
	return false;
})

surfStorage.ref().on("child_added", function(newChild){
	//checking our data we're receiving from firebase
	console.log(newChild);
	//getting our user input from firebase
	var newLocation = newChild.val().location;
	console.log(newLocation);
	//appending the user input into the table
	$("#timeInfoHere").append("<tr><td>" + newLocation + "</td></tr>");

})

