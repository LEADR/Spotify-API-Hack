$(document).ready( function() {
    $("#search-btn").click( function() {
        $('.main-cont').html('');               // Clears content
        var query = $("#search-query").val();   // Stores text from search bar
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
    var result = $('<li data-artist-id=""></li>');
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
    var artistName = $('<a href="#"></a>');
    artistName.addClass("artist-link");
    artistName.text(artist.name);

    // Appends elements to list item element
    imageLink.append(imageElem);
    result.append(imageElem);
    result.append(artistName);

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
    console.log("Request successful.");

    var artistPage = $(".artist-page").clone();
    var header = artistPage.find(".artist-header");
    var image = artistPage.find(".artist-image");

    header.html(result.name);
    image.attr("src", result.images[0].url);

    getTopTracks(artistId, artistPage);
    getRelated(artistId);     // getRelated(artistId, element);

    $('.main-cont').html('');
    $(".form-control").val('');
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
    console.log("Request successful.");

    var list = $("<ul>").addClass("tracks-list");

    for (i = 0; i < response.tracks.length; i++) {

      var result = $(".templates .track-result").clone();
      var thisTrack = response.tracks[i];

      result.attr("data-track-id", thisTrack.id);

      var imageElem = result.find(".thumb");
      imageElem.attr("src", findThumb(thisTrack.album));

      var trackName = result.find(".track-title");
      trackName.html(thisTrack.name);

      list.append(result);
    }

    parent.append(list);
  })
  .fail( function(jqXHR, error, errorThrown) {
      console.log(artistId);
    console.log("Get Top Tracks Request unsuccessful.");
    console.log(error);
  });
}

function getRelated(artistId, element) {
  $.ajax({
    url: "https://api.spotify.com/v1/artists/"+artistId+"/related-artists",
    dataType: "json",
    type: "GET"
  }).done( function(response) {
    console.log("Request successful.");
    console.log(response);

    for (var i=0; i<5; i++) {
      showRelated(response.artists[i].id);
    }

    /*
    $.each(response.artists, function(i, item) {
      // showRelated(item.id);
      console.log(item);
    });
    */

  }).fail( function(jqXHR, error, errorThrown) {
      console.log(artistId);
    console.log("Get Related Request unsuccessful.");
    console.log(error);
  });
}

function showRelatedTrack(trackObject, parent) {
  console.log(trackObject);

  var listItem = $(".related-result").clone();

  listItem.find(".thumb").attr("src", findThumb(trackObject.album));
  listItem.find(".track-title").html(trackObject.name);
  listItem.find(".artist-link").html(trackObject.artists[0].name);
  listItem.attr("data-track-id", trackObject.id);
  listItem.attr("data-artist-id", trackObject.artists[0].id);
  listItem.attr("data-album-id", trackObject.album.id);

  parent.append(listItem);
}

function showRelated(artistId) {
  $.ajax({
    url: "https://api.spotify.com/v1/artists/"+artistId+"/top-tracks",
    data: {country: "US"},
    dataType: "json",
    type: "GET"
  }).done( function(response) {
    console.log("Request successful.");
    console.log(response);

    var list = $("<ul>");

    showRelatedTrack(response.tracks[0], list);

    $(".right-cont").append(list);

  }).fail( function(jqXHR, error, errorThrown) {
      console.log(artistId);
    console.log("Show Related Track Request unsuccessful.");
    console.log(error);
  });
}
