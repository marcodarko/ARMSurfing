

 
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
//click event that will store our user's input into firebase
$("#searchButton").on("click", function(){
	//grabbing user input 
	var userInput = $("#user-search").val().trim();
  // updates city name
  var shortQuery = [];
  for (var i= 0; i < userInput.length; i++)
    if(userInput[i] == ","){
        break
    }else{
        shortQuery.push(userInput[i]);
    }
	//object to store user input into firebase
	var surfObj = {
		location: userInput
	};
	
	//pushing our user input object into firebase
	surfStorage.ref().push(surfObj);
	//preventing the on submit default setting
	return false;
});

surfStorage.ref().on("child_added", function(newChild){
  //checking our data we're receiving from firebase
  //getting our user input from firebase
  var newLocation = newChild.val().location;
  //creating a new button for user to check recently searched spot conditions
  var storedSearchBtn = $("<button type='submit' class='recentButton' id='firebaseBtn'>").html(newLocation);
  //checking our new location
  //adding a data attribute to the button of newLocation
  storedSearchBtn.attr("data-location", newLocation);
  //appending user search and button to our firebaseTable
  $("#recentlySearchedResultsHere").append(storedSearchBtn);
  //creating an on click event which uses our showPreviousConditions function to display previous conditions
  storedSearchBtn.on("click", function(){
    //storing the data attribute from the storedSearchBtn in a variable
    locationName = $(this).attr("data-location");
    //updating the html with the location name
    $("#logoFont2").html(locationName);
    //calling our initmap function
    initMap();
  });

});

            // var maxTempF = weather.maxtempF;
// //              YOUTUBE API INITIALIZATION
//                 YOUTUBE  SEARCH FOR A KEYWORD
// //         KEY:   AIzaSyC6LO4qKI_80tPEvtewuNRj5KvYZyJyhIw
// //              #userSearch is user input variable

// event listener to search YoutTube when user clicks search button
$("#searchButton").on("click", function(){


	// on click, the surfboard logo calls the SVG Animator library to animate it
	new Vivus('animatedLogo', {duration: 100});

	var query = $('#user-search').val();

  // updates city name
  var shortQuery = [];
  for (var i= 0; i < query.length; i++)
    if(query[i] == ","){
        break
    }else{
        shortQuery.push(query[i]);
    }

   $("#logoFont2").html(shortQuery);

   shortQuery = shortQuery.join('');


	var key= "AIzaSyC6LO4qKI_80tPEvtewuNRj5KvYZyJyhIw";


	var queryURL="https://www.googleapis.com/youtube/v3/search?part=snippet&q="+shortQuery+" beach"+"&part=player&safeSearch=strict&videoEmbeddable=true&type=video&key="+key;
	
	
	
	$.ajax({
		url: queryURL,
		method: "GET",

	}).done(function(response) {

		var imageUrl= response.items[0].snippet.thumbnails.high.url;
		var videoID= response.items[0].id.videoId;
		$("#weatherContainer").css('background-image', "url("+imageUrl+")");
		$("#myVideo").attr("src","https://youtube.com/embed/"+videoID+"?autoplay=1&controls=0&showinfo=0&autohide=1&loop=1");
	});
});


//                          end YOUTUBE API


//********************************************************* Google API usage begins *******************************************************************//

var userSearch;
var map, geocoder, infowindow, marker;
var request = {};
var userLatLng;
var locationName = "";
//function to initalize the map this is initially called from the html via parameter callback=initMap
function initMap() {
    //********************************************** Create the map and center it initially to San Diego **************************************************//
    if (locationName == ""){

    if ($("#user-search").val() == "") {
        userSearch = "San Diego";
    } else {
        userSearch = $("#user-search").val();
    }
  }else{
    userSearch = locationName;
  }
    map = new google.maps.Map(document.getElementById('mapBox'), { zoom: 12, scrollwheel: false });

    geocoder = new google.maps.Geocoder;
    geocoder.geocode({ 'address': userSearch }, function(results, status) {
        if (status === 'OK') {
            map.setCenter(results[0].geometry.location);
            // new google.maps.Marker({
            //     map: map,
            //     position: results[0].geometry.location
            // });
        } else {
            window.alert('Geocode was not successful for the following reason: ' +
                status);
        }
    });

    //******************************************************** Create surf related markers on the Map  ****************************************************//

        //function to create the markers on the map 
        geocoder.geocode({
            'address': userSearch
        }, function(results, status) { //this anonymus function is called back when the results and status are received from geocode function 
            if (status == google.maps.GeocoderStatus.OK) {
                userLatLng = results[0].geometry.location; // Assign the latitude and longtude object from the first result to userLatLng variable

              	localWWAPI(userLatLng); // Call to the local Weather API
              	worldWideWeather(userLatLng); //Call to world wide weather API
                GetFoodPlaces(userLatLng);// Call to google places that gets food places nearby
            }

            //Request takes the userLatLng variable and hard coded radius, type
            request = {
                location: userLatLng,
                radius: '2000',
                keyword: 'surf spot'
            };
            infowindow = new google.maps.InfoWindow(); // create a new info window for the marker
            service = new google.maps.places.PlacesService(map); // create a new service object which will be used to call the nearbySearch method
            service.nearbySearch(request, callback); // use the nearbySearch method to find the places based on the userSearch and to create the markers
        });

    //************************************************************** Adding autocomplete search ************************************************************//
    //get the input field ans assign it to the input variable 
    var input = document.getElementById('user-search');
    var options = {
        types: ['establishment']
    };

    autocomplete = new google.maps.places.Autocomplete(input, options);


    geolocate();


}; //End of initMap function *******

//************************************************************** Other functions used by initMap *******************************************************//
//function used to dinamically create the markers
function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]); // call the createMarker function 
        }
    }
};
//function to create marker 
function createMarker(place) {
    var placeLoc = place.geometry.location;
    marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });

    //Add an event lilstener to the markers so when they are clicked the info window is displayed
    google.maps.event.addListener(marker, 'click', function() {
        var service = new google.maps.places.PlacesService(map);
        var request = { reference: place.reference };
        service.getDetails(request, function(details, status) {
            infowindow.setContent("<strong>" + details.name + "<strong>" + "<br />" + details.formatted_address + "<br />" + "<a href=" + details.website + ">"+ details.website + "</a>" + "<br />" + "<a href=" + details.url + ">"+ "Open with Google Maps" + "</a>" + "<br />" + details.formatted_phone_number);
        });
        infowindow.open(map, this);
        if (this.getAnimation() !== null) {
            this.setAnimation(null);
        } else {
            this.setAnimation(google.maps.Animation.BOUNCE);
        }
    });

};

// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var geolocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            var circle = new google.maps.Circle({
                center: geolocation,
                radius: position.coords.accuracy
            });
            autocomplete.setBounds(circle.getBounds());
        });
    }
};


//====================================================================================

//***************************world wide weather online********************************
//--------------------------------Local begin-----------------------------------------
function localWWAPI (userLatLng){
//Variable weatherLatlng for wwwAPI, passing userLatLng from google API, as wwwAPI only accepts lat,lng 
weatherLatlng = userLatLng.toString();
       weatherLatlng = weatherLatlng.substring(1, weatherLatlng.length -1);

//end point for wwwAPI
var apiKey = "094f52c21f8d4c3dbff24712170903";
var url = "https://api.worldweatheronline.com/premium/v1/weather.ashx?";
           url += "&q=" + weatherLatlng;
           url += "&format=json";
           url += "&key="+ apiKey;
           url += "&includelocation=yes";
           url += "&fx=" + "yes";

       $.ajax({
         url: url,
         method: 'GET',
       }).done(function(dataSnap) {

            var serverReq = dataSnap.data;
    		var currentTemp = serverReq.current_condition[0].temp_F;
    		var weatherIcon = serverReq.current_condition[0].weatherIconUrl[0].value;
    		var feelsLike = serverReq.current_condition[0].FeelsLikeF;
    		var humidity = serverReq.current_condition[0].humidity;
    		var windSpeed = serverReq.current_condition[0].windspeedMiles;


           $("#weatherIcon").attr("src", weatherIcon).css("border-radius", "100%");
           $(".tempF").html(currentTemp + " &deg;F");
           $(".feelsLike").html("Feels like: " + feelsLike + " &deg;F");
           $(".humidity").html("Humidity: " + humidity + "%");
           $(".windSpeed").html("Wind speed: " + windSpeed + " mph");
});
}
//---------------------------end of local----------------------------------------------

//***********************Global Variables for World Weather-Marine BEGIN************************************
var weatherLatlng; //Set global variable weatherLatlng from google api to use for query on worldwide weather api
var serverReq;
var weather;
var swell;
var iconURL;
var maxTempF;
var tempF;
var currentTime;
var hourlyTempF;
//forloop globals

var hourlySwell;
var hourlySwellDir;
var hourlySwellPer;
var hourlyTime;
//arrays to hold data for graph
var weeklyForecast = []; //to make it an array of arrays [][]

var date;
var arrDate = [];

var arrForecast = [];
var arrWaterTemp = [];
var arrSwell = [];
var arrSwellDir = [];
var arrSwellPer = [];
var arrTime = [];

//current tide info
var tideType;
var tideTime;
var tideHeight;
//current astronomy data
var moonrise;
var moonset;
var sunrise;
var sunset;


function worldWideWeather (userLatLng){

//convert function to string to use coordinates as api only accepts lat, long
weatherLatlng = userLatLng.toString();
           weatherLatlng = weatherLatlng.substring(1, weatherLatlng.length -1);

        //variables for api and add parameters to var url to get data for UI
        var apiKey = "094f52c21f8d4c3dbff24712170903";
	    var url = "https://api.worldweatheronline.com/premium/v1/marine.ashx?";
		    url += "&q=" + weatherLatlng;
		    url += "&format=json";
		    url += "&key="+ apiKey;
		    url += "&includelocation=yes";
		    url += "&tide=yes";
		    url += "&tp=6";
		    url += "&fx=" + "yes";

	    $.ajax({
	      url: url,
	      method: 'GET',
	    }).success(function(data) {
	    	//
	    	serverReq = data.data;
	    	weather = serverReq.weather[0];

	    	swell = weather.hourly["0"].swellHeight_ft;

	    	iconURL = serverReq.weather[0].hourly["0"].weatherIconUrl["0"].value;

			$("#astronomyInfo").empty();
			$("#tideInfo").empty();

			//adds current astronomy data
			var astronomy = weather.astronomy[0];
				var moonrise = astronomy.moonrise;
				var moonset = astronomy.moonrise;
				var sunrise = astronomy.sunrise;
				var sunset = astronomy.sunset;
		$("#tideInfo").append("<tr><th>" + "Sunrise" + "</th><td>" + sunrise + "</td>" + "<td></td></tr>")
                               .append("<tr><th>" + "Sunset" + "</th><td>" + sunset + "</td>" + "<td></td></tr>")
                               .append("<tr><th>" + "Moonrise" + "</th><td>" + moonrise + "</td>" + "<td></td></tr>")
                               .append("<tr><th>" + "Moonset" + "</th><td>" + moonset + "</td>" + "<td></td></tr>");

			//add current tide info
			var tideInfo = weather.tides[0];
			for (var i = 0; i < 3; i++) {
				//adds data to table for current tide information
				tideType = tideInfo.tide_data[i].tide_type;
				tideTime = tideInfo.tide_data[i].tideTime;
				tideHeight = tideInfo.tide_data[i].tideHeight_mt;
				$("#tideInfo").append("<tr><th>" + tideType + "</th><td>" + tideTime + "</td><td>" + tideHeight + " ft" + "</td></tr>");


			};
			//empty out arrDate on every new search
			arrDate.length = 0;
			//dates for charts.js
			for (var i = 0; i < 5; i++){
	    		date = serverReq.weather[i].date;
	    			arrDate.push(moment(date).format("dd M/D"));
	    	}; 

	    	//SET OF FOR LOOPS TO PLOT DATA IN CHART.JS
	    	//empty out arrSwell on every event
	    	arrSwell.length = 0;
			for (var i = 0; i < 5; i++){
				var weather = serverReq.weather[i];
					for (var ia = 0; ia < 4; ia++) {
						var hourlyTempF = weather.hourly[ia].tempF;
							// arrTemp.push(hourlyTempF);
						var hourlySwell = weather.hourly[ia].swellHeight_ft;
							arrSwell.push(hourlySwell);
						var hourlySwellDir = weather.hourly[ia].swellDir16Point;
							// arrSwellDir.push(hourlySwellDir);
						var hourlySwellPer = weather.hourly[ia].swellPeriod_secs;
							// arrSwellPer.push(hourlySwellPer);
						var hourlyWaterTemp = weather.hourly[ia].waterTemp_F;
							// arrWaterTemp.push(hourlyWaterTemp);
						var hourlyTime = weather.hourly[ia].time;
							// arrTime.push(hourlyTime);
					};
				};
		    	chartJS();

	    }); 
}
//***********************Global Variables for World Weather-Marine END************************************
//***************************world wide weather online API END********************************

//====================================================================================

//********************************* Charts.js BEGIN ***************************************

var myChart
function chartJS(){
		var ctx = $("#myChart"); 
		myChart = new Chart(ctx, {
		    type: 'bar',
		    data: {
		        labels: ["6AM", "Noon", "6PM", "12AM"],
		        datasets: [{
		            label: arrDate[0],
		            data: arrSwell.slice(0, 4),
		            backgroundColor: [
		                'rgba(255, 99, 132, 0.2)',
		                'rgba(255, 99, 132, 0.2)',
		                'rgba(255, 99, 132, 0.2)',
		                'rgba(255, 99, 132, 0.2)',
		            ],
		            borderColor: [
		                'rgba(255,99,132,1)',
		                'rgba(255,99,132,1)',
		                'rgba(255,99,132,1)',
		                'rgba(255,99,132,1)',
		            ],
		            borderWidth: 2
		        },
		        {
		            label: arrDate[1],
		            data: arrSwell.slice(4, 8),
		            backgroundColor: [
		                'rgba(54, 162, 235, 0.2)',
		                'rgba(54, 162, 235, 0.2)',
		                'rgba(54, 162, 235, 0.2)',
		                'rgba(54, 162, 235, 0.2)',
		            ],
		            borderColor: [
		                'rgba(54, 162, 235, 1)',
		                'rgba(54, 162, 235, 1)',
		                'rgba(54, 162, 235, 1)',
		                'rgba(54, 162, 235, 1)',
		            ],
		            borderWidth: 2
		        },
		        {
		            label: arrDate[2],
		            data: arrSwell.slice(8, 12),
		            backgroundColor: [
		                'rgba(255, 206, 86, 0.2)',
		                'rgba(255, 206, 86, 0.2)',
		                'rgba(255, 206, 86, 0.2)',
		                'rgba(255, 206, 86, 0.2)',
		            ],
		            borderColor: [
		                'rgba(255, 206, 86, 1)',
		                'rgba(255, 206, 86, 1)',
		                'rgba(255, 206, 86, 1)',
		                'rgba(255, 206, 86, 1)',
		            ],
		            borderWidth: 2
		        },
		        {
		            label: arrDate[3],
		            data: arrSwell.slice(12, 16),
		            backgroundColor: [
		                'rgba(75, 192, 192, 0.2)',
		                'rgba(75, 192, 192, 0.2)',
		                'rgba(75, 192, 192, 0.2)',
		                'rgba(75, 192, 192, 0.2)',
		            ],
		            borderColor: [
		                'rgba(75, 192, 192, 1)',
		                'rgba(75, 192, 192, 1)',
		                'rgba(75, 192, 192, 1)',
		                'rgba(75, 192, 192, 1)',
		            ],
		            borderWidth: 2
		        },
		        {
		            label: arrDate[4],
		            data: arrSwell.slice(16, 20),
		            backgroundColor: [
		                'rgba(153, 102, 255, 0.2)',
		                'rgba(153, 102, 255, 0.2)',
		                'rgba(153, 102, 255, 0.2)',
		                'rgba(153, 102, 255, 0.2)',
		            ],
		            borderColor: [
		                'rgba(153, 102, 255, 1)',
		                'rgba(153, 102, 255, 1)',
		                'rgba(153, 102, 255, 1)',
		                'rgba(153, 102, 255, 1)',
		            ],
		            borderWidth: 2
		        }]
		    },
		    options: {
		        scales: {
		            yAxes: [{
		                ticks: {
		                    beginAtZero:true
		                },
		                scaleLabel: {
		        			display: true,
		        			labelString: 'Maximum Swell Ft',
		        		}
		            }]
		        },
		        title: {
            		display: true,
            		text: '5-day Swell Forecast in ft.',
            		fontColor: "#fff",
            		fontSize: 16
      			},	
		    },
		    responsive: true,
		});
};
//resets chart.js after event
function resetCanvas() {
	myChart.destroy();
	chartJS();
}
//********************************* Charts.js END  ***************************************
//====================================================================================

//Attach an event listener to search button and call the initMap function to update map location 
$("#searchButton").on('click',  function() {
	resetCanvas();
	initMap();
});


  function GetFoodPlaces(userLatLng){

    $("#FSResultsHere").empty();

  var GPquery = $('#user-search').val();
  var GPkey= "AIzaSyC6_5yYr2hXqg3o87v99-IiRAsdJW2ZlFs";

  var foodLatLng = userLatLng.toString(); 
  foodLatLng = foodLatLng.substring(1, foodLatLng.length -1);

  var GPqueryURL="https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+foodLatLng+"&radius=4000&type=restaurant&key="+GPkey;
  
  
      $.ajax({
      method: "POST",
      dataType: "json",
      url: "https://proxy-cbc.herokuapp.com/proxy",
      data: {
        url: GPqueryURL
      }
    })
    .done(function(response){
     
     

      for (i=0; i< 5; i++){

          var newDiv= $("<div class='foodPlace'>");
          var icon=$("<img><br>").attr("src",response.data.results[i].icon).attr("alt","icon");
          var title=response.data.results[i].photos[0].html_attributions[0];
          $(title).attr("target", "_blank");
          var br=$("<br>");
          var row=$("<div>");

            for(j=1; j<=response.data.results[i].rating; j++){
              // prints a star for each rating number
              var star=$("<span class='stars'>").html("&#9733;");
              row.append(star);
            }

          var open= "OPEN";
          var closed= "CLOSED";
          if (response.data.results[i].opening_hours.open_now === true) {
            var openNow=$("<span class='openNow'>").html(open);
          }
          else{
            var openNow=$("<span class='closedNow'>").html(closed);
          }

          newDiv.append(icon).append(title).append(br).append(row).append(openNow);
          $("#FSResultsHere").append(newDiv);



      };

    }).fail(function(){

      notie.alert({ type: 1, text: 'Boo! No food around here..', position: 'bottom' })

    });

};

// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var geolocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            var circle = new google.maps.Circle({
                center: geolocation,
                radius: position.coords.accuracy
            });
            autocomplete.setBounds(circle.getBounds());
        });
    }
  };
      

$(window).ready(function(){

notie.input({
  text: 'Do you want to receive surf updates:',
  submitText: 'Submit',
  cancelText: 'Nah, bro',
  cancelCallback: function (value) {
    notie.alert({ type: 3, text: 'No problem, enjoy!'  });
     new Vivus('animatedMain', {duration: 100});
    //database.push(value);
  },
  submitCallback: function (value) {
    notie.alert({ type: 1, text: 'You entered: ' + value+".  We'll keep you updated!" });
    new Vivus('animatedMain', {duration: 100});
  },
  value: '',
  type: 'email',
  placeholder: 'name@example.com'
})

});

//Attach an event listener to search button and call the initMap function to update map location 
$("#searchButton").on('click', initMap);

//************************************************************** End of Google Maps Api usage *************************************************************//
