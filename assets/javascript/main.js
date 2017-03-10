   //Google api 

   var userSearch;
   var map, geocoder, infowindow, markers = [],
       marker;
   var request = {};
   //function to initalize the map this is initially called from the html via parameter callback=initMap
   function initMap() {

       // Clear out the old markers.
       markers.forEach(function(marker) {
           marker.setMap(null);
       });
       markers = [];


       if ($("#user-search").val() == "") {
           userSearch = "San Diego";
       } else {
           userSearch = $("#user-search").val();
       }

       map = new google.maps.Map(document.getElementById('mapBox'), { zoom: 12 });
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
       var userLatLng;

       //create markers only when there is a user search
       if ($("#user-search").val() !== "") {
           //function to create the markers on the map 
           geocoder.geocode({
               'address': userSearch
           }, function(results, status) { //this anonymus function is called back when the results and status are received from geocode function 
               if (status == google.maps.GeocoderStatus.OK) {
                   userLatLng = results[0].geometry.location; // Assign the latitude and longtude object from the first result to userLatLng variable
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
