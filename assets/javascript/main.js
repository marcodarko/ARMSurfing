
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

	var newQueryURL = basicQueryURL + userInput;
	
	var surfObj = {

		location: userInput
	};

	surfAPI(newQueryURL);

	surfStorage.ref().push(surfObj);

	return false;
})

surfStorage.ref().on("child_added", function(newChild){

	console.log(newChild);
	var newLocation = newChild.val().location;
	console.log(newLocation);
	$("#timeInfoHere").append("<tr><td>" + newLocation + "</td></tr>");

})

