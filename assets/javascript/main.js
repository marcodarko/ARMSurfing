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
   $("#logoFont2").html(query);

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
    } else {
        userSearch = $("#user-search").val();
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
                keyword: 'surf spot'
            };
            infowindow = new google.maps.InfoWindow(); // create a new info window for the marker
            service = new google.maps.places.PlacesService(map); // create a new service object which will be used to call the nearbySearch method
            service.nearbySearch(request, callback); // use the nearbySearch method to find the places based on the userSearch and to create the markers

        });

    }
    //************************************************************** Adding autocomplete search ************************************************************//
    //get the input field ans assign it to the input variable 
    var input = document.getElementById('user-search');
    var options = {
        types: ['establishment']
    };

    autocomplete = new google.maps.places.Autocomplete(input, options);


    geolocate();


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
        var service = new google.maps.places.PlacesService(map);
        var request = { reference: place.reference };
        service.getDetails(request, function(details, status) {
            infowindow.setContent("<strong>" + details.name + "<strong>" + "<br />" + details.formatted_address + "<br />" + "<a href=" + details.website + ">"+ details.website + "</a>" + "<br />" + details.rating + "<br />" + details.formatted_phone_number);
        });
        infowindow.open(map, this);
        if (this.getAnimation() !== null) {
            this.setAnimation(null);
        } else {
            this.setAnimation(google.maps.Animation.BOUNCE);
        }
    });
  };

  function GetFoodPlaces(userLatLng){

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
      console.log("Google Places: ");
      console.log(response);
     

      for (i=0; i< 5; i++){

          var newDiv= $("<div class='foodPlace'>");
          var icon=$("<img><br>").attr("src",response.data.results[i].icon).attr("alt","icon");
          var title=response.data.results[i].photos[0].html_attributions[0];
          var br=$("<br>");
          var row=$("<div>");

            for(j=1; j<=response.data.results[i].rating; j++){
              // prints a star for each rating number
              var star=$("<span>").html("&#9733;");
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
          $("#FSResultsHere").append(newDiv).fadeIn('slow');



      };

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
  new Vivus('animatedMain', {duration: 100});

notie.input({
  text: 'Do you want to receive surf updates:',
  submitText: 'Submit',
  cancelText: 'Nah, bro',
  cancelCallback: function (value) {
    notie.alert({ type: 3, text: 'No problem, enjoy!'  });
    //database.push(value);
  },
  submitCallback: function (value) {
    notie.alert({ type: 1, text: 'You entered: ' + value+".  We'll keep you updated!" })
  },
  value: '',
  type: 'email',
  placeholder: 'name@example.com'
})

});


//Attach an event listener to search button and call the initMap function to update map location 
$("#searchButton").on('click', initMap);

//************************************************************** End of Google Maps Api usage *************************************************************//
