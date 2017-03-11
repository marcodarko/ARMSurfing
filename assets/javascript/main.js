

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
	console.log("q: "+q);
	var request = gapi.client.youtube.search.list({
		q: q,
		part: 'snippet'
	});

	request.execute(function(response) {
		var str = JSON.stringify(response.result);
		console.log("received from YouTube: "+str);
		$('#weatherContainer').html('<pre>' + str + '</pre>');
	});
};

// event listener to search YoutTube when user clicks search button
$("#searchButton").on("click", function(){

	// on click, the surfboard logo calls the SVG Animator library to animate it
	new Vivus('animatedLogo', {duration: 100});

	var query = $('#user-search').val();
	var key= "AIzaSyC6LO4qKI_80tPEvtewuNRj5KvYZyJyhIw";


	var queryURL="https://www.googleapis.com/youtube/v3/search?part=snippet&q="+query+" beach"+"&part=player&safeSearch=strict&videoEmbeddable=true&type=video&key="+key;
	
	
	
	$.ajax({
		url: queryURL,
		method: "GET",

	}).done(function(response) {

		console.log(response);
		var imageUrl= response.items[0].snippet.thumbnails.high.url;
		var videoID= response.items[0].id.videoId;
		console.log(imageUrl);
		$("#weatherContainer").css('background-image', "url("+imageUrl+")");
		$("#myVideo").attr("src","https://youtube.com/embed/"+videoID+"?autoplay=1&controls=0&showinfo=0&autohide=1&loop=1");
	});
});


//                          end YOUTUBE API


   // ************************************** Google api **************************************************//

   var userSearch;
   var map, geocoder, infowindow, markers = [],
   marker;
   var request = {};
   var userLatLng;
   //function to initalize the map this is initially called from the html via parameter callback=initMap
   function initMap() {

       // Clear out the old markers.
       // markers.forEach(function(marker) {
       //     marker.setMap(null);
       // });
       // markers = [];


       if ($("#user-search").val() == "") {
       	userSearch = "San Diego";
       } else {
       	userSearch = $("#user-search").val();
       }

       map = new google.maps.Map(document.getElementById('mapBox'), { zoom: 12, scrollwheel: false });
       console.log(map);

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

       //variable to store the latitude and longitude
       userLatLng;

       //create markers only when there is a user search
       if ($("#user-search").val() !== "") {
           //function to create the markers on the map 
           geocoder.geocode({
           	'address': userSearch
           }, function(results, status) { //this anonymus function is called back when the results and status are received from geocode function 
           	if (status == google.maps.GeocoderStatus.OK) {
                   userLatLng = results[0].geometry.location; // Assign the latitude and longtude object from the first result to userLatLng variable
                   GetFoodPlaces(userLatLng);
               }

               //Request takes the userLatLng variable and hard coded radius, type
               request = {
               	location: userLatLng,
               	radius: '2000',
               	keyword: 'surf'
               };
               infowindow = new google.maps.InfoWindow(); // create a new info window for the marker
               service = new google.maps.places.PlacesService(map); // create a new service object which will be used to call the nearbySearch method
               service.nearbySearch(request, callback); // use the nearbySearch method to find the places based on the userSearch and to create the markers with the callback function

           });

       }




   };

   //function used to dinamically create the markers
   function callback(results, status) {
   	if (status === google.maps.places.PlacesServiceStatus.OK) {
   		for (var i = 0; i < results.length; i++) {
               createMarker(results[i]); // call the createMarker function 
               markers.push(createMarker(results[i])); //push the marker into the global variable markers array
               console.log(markers);
               console.log(marker);
           }
       }
   }
   //function to create marker 
   function createMarker(place) {
   	var placeLoc = place.geometry.location;
   	marker = new google.maps.Marker({
   		map: map,
   		position: place.geometry.location
   	});

       //Add an event lilstener to the markers so when they are clicked the info window is displayed
       google.maps.event.addListener(marker, 'click', function() {
       	infowindow.setContent('<div><strong>' + place.name + '</strong></div>');
       	infowindow.open(map, this);
       });

       return marker;
   }


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






