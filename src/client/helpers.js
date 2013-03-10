  var markerArray = [];
  var boundArray = [];
  var resultArray = [];
  var peopleArray = [];
  var map;
  var currentMarker;
  var origin;

  var clearMarkers = function(){
    for(var i = 0; i < markerArray.length; i++){
      markerArray[i].setMap(null);
    }
  };

  var clearBounds = function(){
    for(var i = 0; i < boundArray.length; i++){
      boundArray[i].setMap(null);
    }
  };

  var clearResults = function(){
    for(var i = 0; i < resultArray.length; i++){
      resultArray[i].setMap(null);
    }
  };

   var clearPeeps = function(){
    for(var i = 0; i < peopleArray.length; i++){
      peopleArray[i].setMap(null);
    }
  };

  //places a marker at given lat and lon, inserts position into DB if there is no current marker by user
  var placeMarker = function(lat, lon){
    var position = new google.maps.LatLng(lat, lon);
    currentMarker = new google.maps.Marker({
      position: position,
      title: 'yo!'
    });

    origin = origin || currentMarker;
    if(currentMarker !== origin){
      markerArray.push(currentMarker);
    }
    clearMarkers();
    currentMarker.setMap(map);
    Session.set('origin', origin.position);
  };

  var googleClickHandler = function(event){
      var newLat = event.latLng.lat();
      var newLon = event.latLng.lng();

      placeMarker(newLat, newLon);
      drawBounds(newLat, newLon);
  };

  //Renders map and puts marker at lat/lon passed into argument.
  var initMap = function(lat, lon){
    var myPosition = new google.maps.LatLng(lat, lon);
    var mapOptions = {
      center: myPosition,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    service = new google.maps.places.PlacesService(map);

    google.maps.event.addListener(map, 'click', googleClickHandler);
  };

  //Sets the latitude and longitude of the user, calls map and marker makers
  var setPosition = function(position){
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    myLat = lat;
    myLon = lon;
    initMap(lat, lon);
    placeMarker(lat, lon);
  };

  var placeResult = function(lat, lon, resultObj){
    var position = new google.maps.LatLng(lat, lon);
     result = new google.maps.Marker({
      position: position,
      title: 'yo!'
    });

    var infowindow = new google.maps.InfoWindow({
      content: '<h1>'+ resultObj.name + '</h1><img class="mindblow" src="http://instame.me/uploads/D4h.gif"></img>'
    });

    google.maps.event.addListener(result, 'click', function() {
    infowindow.open(map,this);
    });

    resultArray.push(result);
    result.setMap(map);
  }

  var placeOtherUsers = function(lat, lon, otherUser){
    var position = new google.maps.LatLng(lat, lon);
    var thisUser = LoggedIn.findOne({user: otherUser._id});
    console.log('this', thisUser)
     userMarker = new google.maps.Marker({
      position: position,
      title: 'THIS IS A OTHER USER YO'
    });
    peopleArray.push(userMarker);
    userMarker.setMap(map);
  }

  //function draws bounding box
  var drawBounds = function(newLat, newLon){
    var bound;

        var polyCoords =[
          new google.maps.LatLng(myLat, newLon),
          new google.maps.LatLng(myLat, myLon),
          new google.maps.LatLng(newLat, myLon),
          new google.maps.LatLng(newLat, newLon),
        ]

        var mostNorth = Math.max(myLat, newLat);
        var mostEast  = Math.max(myLon, newLon);
        var mostWest  = Math.min(myLon, newLon);
        var mostSouth = Math.min(myLat, newLat);

        var NE = new google.maps.LatLng(mostNorth, mostEast);
        var SW = new google.maps.LatLng(mostSouth, mostWest);
        var boundz = new google.maps.LatLngBounds(SW, NE);
        var request = {
          bounds: boundz,
          types: ['cafe']
        };

        bound = new google.maps.Polygon({
          paths: polyCoords,
          strokeColor: "#333",
          strokeOpacity: 0.8,
          strokeWeight: 3,
          fillColor: "rgb(70, 182, 66)",
          fillOpacity: 0.20
        });

        boundArray.push(bound);
        clearBounds();
        bound.setMap(map);

        service.nearbySearch(request, function(results){
          clearResults();
          for(var i = 0; i < results.length; i++){
            if(results[i].rating > 4.1){
              placeResult(results[i].geometry.location.ib, results[i].geometry.location.jb, results[i]);
            }
          }
        });
  };
