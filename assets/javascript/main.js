// //              YOUTUBE API INITIALIZATION
//                 YOUTUBE  SEARCH FOR A KEYWORD
// //         KEY:   AIzaSyC6LO4qKI_80tPEvtewuNRj5KvYZyJyhIw
// //              #userSearch is user input variable

// After the API loads, call a function to enable the search box.
function handleAPILoaded() {
    $('#searchButton').attr('disabled', false);
}

// Search for a specified string.
function search() {
    var q = $('#user-search').val();
    console.log("q: " + q);
    var request = gapi.client.youtube.search.list({
        q: q,
        part: 'snippet'
    });

    request.execute(function(response) {
        var str = JSON.stringify(response.result);
        console.log("received from YouTube: " + str);
        $('#weatherContainer').html('<pre>' + str + '</pre>');
    });
};

// event listener to search YoutTube when user clicks search button
$("#searchButton").on("click", function() {

    // on click, the surfboard logo calls the SVG Animator library to animate it
    new Vivus('animatedLogo', { duration: 100 });

    var query = $('#user-search').val();
    var key = "AIzaSyC6LO4qKI_80tPEvtewuNRj5KvYZyJyhIw";


    var queryURL = "https://www.googleapis.com/youtube/v3/search?part=snippet&q=" + query + " beach" + "&part=player&safeSearch=strict&videoEmbeddable=true&type=video&key=" + key;



    $.ajax({
        url: queryURL,
        method: "GET",

    }).done(function(response) {

        console.log(response);
        var imageUrl = response.items[0].snippet.thumbnails.high.url;
        var videoID = response.items[0].id.videoId;
        console.log(imageUrl);
        $("#weatherContainer").css('background-image', "url(" + imageUrl + ")");
        $("#myVideo").attr("src", "https://youtube.com/embed/" + videoID + "?autoplay=1&controls=0&showinfo=0&autohide=1");
    });
});


//                          end YOUTUBE API


//********************************************************* Google API usage begins *******************************************************************//

var userSearch;
var map, geocoder, infowindow, marker;
var request = {};
var userLatLng;
//function to initalize the map this is initially called from the html via parameter callback=initMap
function initMap() {

    //********************************************** Create the map and center it initially to San Diego **************************************************//
    if ($("#user-search").val() == "") {
        userSearch = "San Diego";
        console.log(userSearch);
        $("#logoFont2").html(userSearch);
    } else {
        userSearch = $("#user-search").val();
        console.log(userSearch);
        $("#logoFont2").html(userSearch); //adds location to id logoFont2
    } 

    map = new google.maps.Map(document.getElementById('mapBox'), { zoom: 12, scrollwheel: false });

    geocoder = new google.maps.Geocoder;
    geocoder.geocode({ 'address': userSearch }, function(results, status) {
        console.log(status);
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

    //create markers only when there is a user search
   
        //function to create the markers on the map 
        geocoder.geocode({
            'address': userSearch
        }, function(results, status) { //this anonymus function is called back when the results and status are received from geocode function 
            if (status == google.maps.GeocoderStatus.OK) {
                userLatLng = results[0].geometry.location; // Assign the latitude and longtude object from the first result to userLatLng variable
              	worldWideWeather(userLatLng);
                   console.log(userLatLng.lat())
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


    geolocate()


    //*************************************************************** Add the give directions to the markers ***********************************************//    

    $.ajax({
            method: "POST",
            dataType: "json",
            url: "https://proxy-cbc.herokuapp.com/proxy",
            data: {
                url: "https://maps.googleapis.com/maps/api/directions/json?origin=Boston,MA&destination=Concord,MA&waypoints=Charlestown,MA|Lexington,MA&key=AIzaSyDlgpSK2LLlZPwHPXu2FKoscGmmDo0aEtA"
            }
        })
        .done(function(response) {
            console.log(response);
        });


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
            infowindow.setContent(details.name + "<br />" + details.formatted_address + "<br />" + details.website + "<br />" + details.rating + "<br />" + details.formatted_phone_number);
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
//---------------------------world wide weather online--------------------------------
//--------------------------------Local-----------------------------------------------
// var localAPIKey = "094f52c21f8d4c3dbff24712170903";
// var url = "https://api.worldweatheronline.com/premium/v1/weather.ashx?";
// 	url += "&q=" + userSearch;
//     url += "&format=json";
//     url += "&key="+ localAPIKey;
//     url += "&includelocation=yes";
//     url += "&fx=" + "yes";
// 	$.ajax({
// 	      url: url,
// 	      method: 'GET',
// 	    }).done(function(data) {
// 	    	console.log(data)
// 	    });
//---------------------------end of local----------------------------------------------

//***********************Global Variables for World Weather-Marine***************************
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
           console.log(weatherLatlng);

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
	    console.log(weatherLatlng);

	    $.ajax({
	      url: url,
	      method: 'GET',
	    }).done(function(data) {
	    	//
	    	serverReq = data.data;
	    	console.log(serverReq);
	    	weather = serverReq.weather[0];

	    	swell = weather.hourly["0"].swellHeight_ft;
	    	console.log(swell);

	    	iconURL = serverReq.weather[0].hourly["0"].weatherIconUrl["0"].value;
	    	console.log(iconURL)

	    	$("#weatherIcon").attr("src", iconURL);

	    	maxTempF = weather.maxtempF;

	    	tempF = weather.hourly["0"].tempF;
	    	console.log(tempF);

	    	currentTime = moment();
	    	console.log("Current Time is: " + currentTime);

	    	$(".tempF").html( maxTempF + " &deg;F");

			$("#timeInfoHere").empty();

			//adds current astronomy data
			var astronomy = weather.astronomy[0];
				var moonrise = astronomy.moonrise;
				var moonset = astronomy.moonrise;
				var sunrise = astronomy.sunrise;
				var sunset = astronomy.sunset;
			$("#astronomyInfo").html("<tr><th>" + "Sunrise" + "</th><td>" + sunrise + "</td></tr>")
							   .html("<tr><th>" + "Sunset" + "</th><td>" + sunset + "</td></tr>")
							   .html("<tr><th>" + "Moonrise" + "</th><td>" + moonrise + "</td></tr>")
							   .html("<tr><th>" + "Moonset" + "</th><td>" + moonset + "</td></tr>");

			//add current tide info
			var tideInfo = weather.tides[0];
			for (var i = 0; i < 4; i++) {
				//adds data to table for current tide information
				tideType = tideInfo.tide_data[i].tide_type;
				tideTime = tideInfo.tide_data[i].tideTime;
				tideHeight = tideInfo.tide_data[i].tideHeight_mt;
				$("#tideInfo").html("<tr><th>" + tideType + "</th><td>" + tideTime + "</td><td>" + tideHeight + " ft" + "</td></tr>")


			};


	    	// for (y = 0; y < 7; y++) {
	    	// 	weeklyForecast = serverReq.weather[y];
	    	// 	console.log(weeklyForecast);
	    	// 		arrForecast.push(weeklyForecast);
	    		// hourlyTempF = serverReq.weather[y].hourly[i].tempF;
	    		// // console.log(hourlyTempF, ",");
	    		// iconURL = serverReq.weather[y].hourly[i].weatherIconUrl[0].value
	    		// 	//maybe set an arr for the icons to use for graph come back to it
	    		// hourlySwell = serverReq.weather[y].hourly[i].swellHeight_ft;
	    		// 	arrSwell.push(hourlySwell);
	    		// hourlySwellDir = serverReq.weather[0].hourly[i].swellDir16Point;
	    		// 	arrSwellDir.push(hourlySwellDir);
	    		// hourlySwellPer = serverReq.weather[0].hourly[i].swellPeriod_secs;
	    		// 	arrSwellPer.push(hourlySwellPer);
	    		// hourlyWaterTemp = serverReq.weather[0].hourly[i].waterTemp_F;
	    		// 	arrWaterTemp.push(hourlyWaterTemp);
	    		// hourlyTime = serverReq.weather[0].hourly[i].time;
	    		// 	arrTime.push(hourlyTime);

		    	for (i = 0; i < 4; i++) {
		    		hourlyTempF = serverReq.weather[0].hourly[i].tempF;
		    		// console.log(hourlyTempF, ",");
		    		// iconURL = serverReq.weather[0].weatherIconUrl[i].value;
		    			//maybe set an arr for the icons to use for graph come back to it
		    		hourlySwell = serverReq.weather[0].hourly[i].swellHeight_ft;
		    			arrSwell.push(hourlySwell);
		    		hourlySwellDir = serverReq.weather[0].hourly[i].swellDir16Point;
		    			arrSwellDir.push(hourlySwellDir);
		    		hourlySwellPer = serverReq.weather[0].hourly[i].swellPeriod_secs;
		    			arrSwellPer.push(hourlySwellPer);
		    		hourlyWaterTemp = serverReq.weather[0].hourly[i].waterTemp_F;
		    			arrWaterTemp.push(hourlyWaterTemp);
		    		hourlyTime = serverReq.weather[0].hourly[i].time;
		    			arrTime.push(hourlyTime);
		    	// 	// var hourlyTime = moment(serverReq.weather[i].hourly[0].time).format("hh:mm A");

		    	// 	// console.log("Time: " + hourlyTime);

		    	// 	// $("#timeInfoHere").append("<tr><td>" + hourlyTime + "</td><td>" + "<img src='" + iconURL + "' class='img-responsive d-inline weatherIcon'> " + hourlyTempF + " &deg;F" + "</td><td>" + hourlySwell + " ft." + "</td><td>" + hourlySwellDir + "</td><td>" + hourlySwellPer + " secs" + "</td><td>" + hourlyWaterTemp + " &deg;F" + "</td></tr>");

		    		
		    	// };
		    };

	    }); 
	    //arrays for to use data for chart.js
	    console.log(arrForecast);
	    console.log(arrWaterTemp);
	    console.log(arrTime);
	    console.log(arrSwellPer);
	    console.log(arrSwellDir);
	    console.log(arrSwell);


}
//====================================================================================
//********************************* Charts.js  ***************************************
var ctx = $("#myChart");
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["6AM", "Noon", "6PM", "12AM"],
        datasets: [{
            label: 'Max Surf in ft',
            data: arrSwell,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 2
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});
//====================================================================================

//Attach an event listener to search button and call the initMap function to update map location 
$("#searchButton").on('click', initMap);

//  GOOGLE PLACES  
// KEY:  AIzaSyC6_5yYr2hXqg3o87v99-IiRAsdJW2ZlFs


function GetFoodPlaces(userLatLng){


  var GPquery = $('#user-search').val();
  var GPkey= "AIzaSyC6_5yYr2hXqg3o87v99-IiRAsdJW2ZlFs";

  var foodLatLng = userLatLng.toString(); 
  foodLatLng = foodLatLng.substring(1, foodLatLng.length -1);

  var GPqueryURL="https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+foodLatLng+"&radius=1000&type=restaurant&key="+GPkey;
  
  
      $.ajax({
      method: "POST",
      dataType: "json",
      url: "https://proxy-cbc.herokuapp.com/proxy",
      data: {
        url: GPqueryURL
      }
    })
    .done(function(response){

      console.log("Google Places: ");
      console.log(response);
      $("FSResultsHere").empty();

      for (i=0; i< 5; i++){

          var newDiv= $("<div class='foodPlace'>");
          var icon=$("<img><br>").attr("src",response.data.results[i].icon).attr("alt","icon");
          var title=response.data.results[i].photos[0].html_attributions;
          var br=$("<br>");
          var open= "OPEN";
          var closed= "CLOSED";
          if (response.data.results[i].opening_hours.open_now === true) {
            var openNow=$("<span class='openNow'>").html(open);
          }
          else{
            var openNow=$("<span class='closedNow'>").html(closed);
          }

          newDiv.append(icon).append(title).append(br).append(openNow);
          $("#FSResultsHere").append(newDiv).fadeIn('slow');
      };

    });


};
