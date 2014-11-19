$(document).ready( function() {
  $("#search-btn").click( function() {
    $('.main-cont').html('');
    var query = $("#search-query").val();
    search(query);
  });
});

function findArtistThumb(item) {
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

function showArtist(artist) {
  var result = $(".templates .list-item").clone();

  result.attr("data-artist-id", artist.id);

  var imageElem = result.find(".thumb");
  imageElem.attr("src", findArtistThumb(artist));

  var artistName = result.find(".artist-link");
  artistName.text(artist.name);

  result.children().click( function(event) {
    var listElem = $(this).parent("li");
    var artistId = $(listElem).data("artist-id");
    getArtist(artistId);
  });

  return result;
}

function search(query) {
  var request = {
    q: query,
    type: "artist",
    limit: 50,
  };

  $.ajax({
    url: "https://api.spotify.com/v1/search",
    data: request,
    dataType: "json",
    type: "GET"
  })
  .done( function(result) {
    console.log("Request successful.");

    var list = $(".templates .results-list").clone();

    $.each(result.artists.items, function(i, item){
      var artist = showArtist(item);
      list.append(artist);
      $(".main-cont").append(list);
    });
  })
  .fail( function(jqXHR, error, errorThrown) {
    console.log("Request unsuccessful.");
    console.log(error);
  });
}

function getArtist(artistId) {
  $.ajax({
    url: "https://api.spotify.com/v1/artists/"+artistId,
    data: {id: artistId},
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

    $('.main-cont').html('');
    $(".form-control").val('');
    $(".main-cont").append(artistPage);
  })
  .fail( function() {
    console.log("Request unsuccessful.");
    console.log(error);
  });
}
