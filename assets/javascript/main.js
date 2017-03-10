// AIzaSyC6LO4qKI_80tPEvtewuNRj5KvYZyJyhIw
// YOUTUBE Key
// userSearch is user input variable
// #weatherContainer will have the video background




//                    YOUTUBE API INITIALIZATION


// The client ID is obtained from the {{ Google Cloud Console }}
// at {{ https://cloud.google.com/console }}.
// If you run this code from a server other than http://localhost,
// you need to register your own client ID.
var OAUTH2_CLIENT_ID = 'AIzaSyC6LO4qKI_80tPEvtewuNRj5KvYZyJyhIw';
var OAUTH2_SCOPES = [
'https://www.googleapis.com/auth/youtube'
];

// Upon loading, the Google APIs JS client automatically invokes this callback.
googleApiClientReady = function() {
	gapi.auth.init(function() {
		window.setTimeout(checkAuth, 1);
	});
}

// Attempt the immediate OAuth 2.0 client flow as soon as the page loads.
// If the currently logged-in Google Account has previously authorized
// the client specified as the OAUTH2_CLIENT_ID, then the authorization
// succeeds with no user intervention. Otherwise, it fails and the
// user interface that prompts for authorization needs to display.
function checkAuth() {
	gapi.auth.authorize({
		client_id: OAUTH2_CLIENT_ID,
		scope: OAUTH2_SCOPES,
		immediate: true
	}, handleAuthResult);
}

// Handle the result of a gapi.auth.authorize() call.
function handleAuthResult(authResult) {
	if (authResult && !authResult.error) {
    // Authorization was successful. Hide authorization prompts and show
    // content that should be visible after authorization succeeds.
    $('.pre-auth').hide();
    $('.post-auth').show();
    loadAPIClientInterfaces();
} else {
    // Make the #login-link clickable. Attempt a non-immediate OAuth 2.0
    // client flow. The current function is called when that flow completes.
    $('#login-link').click(function() {
    	gapi.auth.authorize({
    		client_id: OAUTH2_CLIENT_ID,
    		scope: OAUTH2_SCOPES,
    		immediate: false
    	}, handleAuthResult);
    });
}
}

// Load the client interfaces for the YouTube Analytics and Data APIs, which
// are required to use the Google APIs JS client. More info is available at
// https://developers.google.com/api-client-library/javascript/dev/dev_jscript#loading-the-client-library-and-the-api
function loadAPIClientInterfaces() {
	gapi.client.load('youtube', 'v3', function() {
		handleAPILoaded();
	});
}




//                 YOUTUBE  SEARCH FOR A KEYWORD

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
				$("#myVideo").attr("src","https://youtube.com/embed/"+videoID+"?autoplay=1&controls=0&showinfo=0&autohide=1");
			 });
});

//                          end YOUTUBE API
 