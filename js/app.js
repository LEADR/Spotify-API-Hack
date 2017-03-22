$(document).ready( function() {
    $("#search-btn").click( function() {

        // Clears content
        $('.main-cont').html('');
        $(".right-cont").html('');

        // Searches for text from search bar
        var query = $("#search-query").val();
        search(query);
    });
});

function findThumb(item) {
  var url;

  $.each(item.images, function(i, obj) {
    if ( (obj.width > 100) || (obj.height > 100) ) {
      return;
    } else {
      url = obj.url;
    }
  });

  return url;
}

// Creates UI element for each Artist result
function showArtist(artist) {       // Receives JSON object as argument
    // Creates list item element
    var result = $('<li></li>');
    result.addClass("list-group-item artist-result");
    result.attr("data-artist-id", artist.id);

    // Creates clickable image element
    var imageLink = $('<a href="#"></a>');
    imageLink.addClass("image-link");

    // Creates image element
    var imageElem = $('<img src="" alt="">');
    imageElem.addClass("thumb");
    imageElem.attr("src", findThumb(artist));

    // Creates clickable artist name
    var artistName = $('<a></a>');
    artistName.attr("href", "#")
    artistName.addClass("artist-link");
    artistName.text(artist.name);

    // Appends elements to list item element
    imageLink.append(imageElem);
    result.append(imageElem, artistName);

    // Binds click handlers to image & artist name elements
    result.children().click( function(event) {
        var listElem = $(this).parent("li");
        var artistId = $(listElem).data("artist-id");
        getArtist(artistId);
    });

    return result;
}

/*
function showTrack(track) {
  var result = $(".templates .artist-result").clone();

  result.data("track-id", track.id);

  var imageElem = result.find(".thumb");
  imageElem.attr("src", findThumb(track));

  var trackName = result.find(".track-title");
  trackName = track.name;

  return result;
}
*/

function search(query) {
    // Parses HTTP request data
    var request = {
        q: query,
        type: "artist",
        limit: 50,
    };

    // AJAX Request
    $.ajax({
        url: "https://api.spotify.com/v1/search",
        data: request,
        dataType: "json",
        type: "GET"
    })
    .done( function(result) {
        console.log("Artist search request successful.");

        // Creates <ul> JQuery element
        var list = $("<ul></ul>");
        list.addClass("list-group results-list");

        // Iterates through search results
        $.each(result.artists.items, function(i, item) {
            // Adds each artist list item to list
            var artist = showArtist(item);
            list.append(artist);
        });

        // Adds list to page
        $(".main-cont").append(list);
    })
    .fail( function(jqXHR, error, errorThrown) {
        console.log("Request unsuccessful.");
        console.log(error);
    });
}

function getArtist(artistId) {
    $.ajax({
        url: "https://api.spotify.com/v1/artists/"+artistId,
        dataType: "json",
        type: "GET"
    })
    .done( function(result) {
        console.log("Get artist request successful.");

        // Artist Header element instantiated
        var header = $("<h2></h2>").addClass("artist-header");
        header.html(result.name);
/*
        // Artist image element instantiated
        var image = $("<img></img>").addClass("artist-image");
        image.attr("src", result.images[0].url);
*/
        // Other elements instantiated
        var subHeader = $("<h4></h4").addClass("top-tracks");
        var tracksList = $("<ul></ul>").addClass("list-group tracks-list");

        // Artist section instatiated with children
        var artistPage = $("<section></section>").addClass("artist-page");
        artistPage.append(header, /*image,*/ subHeader, tracksList);

        getTopTracks(artistId, artistPage);
        getRelated(artistId, /*element*/);

        // Clears content from page
        $('.main-cont').html('');
        $(".form-control").val('');

        // Loads artist content to page
        $(".main-cont").append(artistPage);
    })
    .fail( function(jqXHR, error, errorThrown) {
        console.log("Get Artist Request unsuccessful.");
        console.log(error);
    });
}

function getTopTracks(artistId, parent) {
    $.ajax({
        url: "https://api.spotify.com/v1/artists/"+artistId+"/top-tracks",
        data: {country: "US"},
        dataType: "json",
        type: "GET"
    })
    .done( function(response) {
        console.log("Artist top tracks request successful.");

        var list = $("<ul>").addClass("list-group tracks-list");

        for (i = 0; i < response.tracks.length; i++) {

            // Stores JSON data for each top track
            var thisTrack = response.tracks[i];

            // Creates HTML elements from response data
            var result = $("<li></li>").addClass("list-group-item track-result");
            result.attr("data-track-id", thisTrack.id);
            var imageElem = $("<img></img>").addClass("thumb");
            imageElem.attr("src", findThumb(thisTrack.album));
            var imageLink = $("<a></a>").addClass("image-link");
            imageLink.append(imageElem);
            var trackName = $("<a></a>").addClass("track-title link");
            trackName.html(thisTrack.name);
            //
            // ADD LINK TO TRACK TITLE
            //
            result.append(imageLink, trackName);
            list.append(result);
        }
        // Adds HTML to DOM
        parent.append(list);
    })
    .fail( function(jqXHR, error, errorThrown) {
        console.log("Artist top tracks unsuccessful.");
        console.log(error);
    });
}

function getRelated(artistId, element) {
    $.ajax({
        url: "https://api.spotify.com/v1/artists/"+artistId+"/related-artists",
        dataType: "json",
        type: "GET"
    })
    .done( function(response) {
        console.log("Get Related Artists request successful.");
        console.log(response);

        // Iterates through first 5 related artists
        for (var i = 0; i < response.artists.length; i++) {
            showFirstTopTrack(response.artists[i].id);
        }
    })
    .fail( function(jqXHR, error, errorThrown) {
        console.log("Get Related Request unsuccessful.");
        console.log(error);
    });
}

function showFirstTopTrack(artistId) {
    $.ajax({
        url: "https://api.spotify.com/v1/artists/"+artistId+"/top-tracks",
        data: {country: "US"},
        dataType: "json",
        type: "GET"
    }).done( function(response) {
        console.log("Artist Top Tracks request successful.");
        console.log(response);

        var list = $("<ul></ul>");
        // showRelatedTrack(response.tracks[0], list);

        // Stores JSON data for each top track
        var thisTrack = response.tracks[0];

        // Creates HTML elements from response data
        var result = $("<li></li>").addClass("list-group-item track-result");
        result.attr("data-track-id", thisTrack.id);
        var imageElem = $("<img></img>").addClass("thumb");
        imageElem.attr("src", findThumb(thisTrack.album));
        var imageLink = $("<a></a>").addClass("image-link");
        imageLink.append(imageElem);
        var trackName = $("<a></a>").addClass("track-title link");
        trackName.html(thisTrack.name);
        var artistName = $("<a></a><br>").addClass("artist-link");
        $.each(thisTrack.artists, function(i, obj) {
            if (i > 0) {
                artistName.append( document.createTextNode( " & "));
            }
            artistName.append( document.createTextNode( obj.name));
        });
        //
        // ADD LINK TO TRACK TITLE
        //
        result.append(imageLink, artistName, trackName);
        list.append(result);

        $(".right-cont").append(list);
    }).fail( function(jqXHR, error, errorThrown) {
        console.log(artistId);
        console.log("Show Related Track Request unsuccessful.");
        console.log(error);
    });
}
