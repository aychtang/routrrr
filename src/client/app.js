(function() {

  var types = {
    markers: [],
    bounds: [],
    results: [],
    people: []
  };

  var map;
  var currentMarker;
  var origin;

  var clear = function(type) {
    for (var i = 0; i < types[type].length; i++) {
      types[type][i].setMap(null);
    }
    types[type].length = 0;
  };

  //places a marker at given lat and lon, inserts position into DB if there is no current marker by user
  var placeMarker = function(lat, lon) {
    var position = new google.maps.LatLng(lat, lon);
    currentMarker = new google.maps.Marker({
      position: position,
    });

    var data = {
      lat: position.lat(),
      lng: position.lng()
    };

    origin = origin || data;
    if (currentMarker !== origin) {
      types.markers.push(currentMarker);
    }
    currentMarker.setMap(map);
    Session.set('origin', data);
  };

  var googleClickHandler = function(event) {
    var newLat = event.latLng.lat();
    var newLon = event.latLng.lng();

    app.routeToPosition(newLat, newLon);
  };

  //Renders map and puts marker at lat/lon passed into argument.
  var initMap = function(lat, lon) {
    var myPosition = new google.maps.LatLng(lat, lon);
    var mapOptions = {
      center: myPosition,
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    service = new google.maps.places.PlacesService(map);

    google.maps.event.addListener(map, 'click', googleClickHandler);
  };

  var placeResult = function(lat, lon, resultObj) {
    var position = new google.maps.LatLng(lat, lon);

    var result = new google.maps.Marker({
      position: position,
    });

    var infowindow = new google.maps.InfoWindow({
      content: '<h1 class="cafeName">' + resultObj.name + '</h1><em class="cafeLocation">' + resultObj.vicinity + '</em>'
    });

    google.maps.event.addListener(result, 'click', function() {
      infowindow.open(map, this);
    });

    types.results.push(result);
    result.setMap(map);
  };

  var placeOtherUsers = function(lat, lon, otherUser) {
    var position = new google.maps.LatLng(lat, lon);
    var thisUser = Meteor.users.findOne({_id: otherUser._id});

    var userMarker = new google.maps.Marker({
      position: position,
      icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      title: thisUser.profile.name || 'other user'
    });

    types.people.push(userMarker)
    userMarker.setMap(map);
  };

  //function draws bounding box
  var drawBounds = function(newLat, newLon) {
    // Sets corners of the shape that is to be rendered on the map.
    var polyCoords = [
      new google.maps.LatLng(myLat, newLon),
      new google.maps.LatLng(myLat, myLon),
      new google.maps.LatLng(newLat, myLon),
      new google.maps.LatLng(newLat, newLon),
    ];

    // Checks each coord and determines their orientation
    var mostNorth = Math.max(myLat, newLat);
    var mostEast  = Math.max(myLon, newLon);
    var mostWest  = Math.min(myLon, newLon);
    var mostSouth = Math.min(myLat, newLat);

    // Finds the NE and SW corner, creates bounding box.
    var NE = new google.maps.LatLng(mostNorth, mostEast);
    var SW = new google.maps.LatLng(mostSouth, mostWest);
    var boundz = new google.maps.LatLngBounds(SW, NE);

    var request = {
      bounds: boundz,
      types: ['cafe']
    };

    var bound = new google.maps.Polygon({paths: polyCoords, strokeColor: "#333", strokeOpacity: 0.8, strokeWeight: 3, fillColor: "rgb(70, 182, 66)", fillOpacity: 0.25});

    types.bounds.push(bound);
    bound.setMap(map);

    // Searches the space within the bouding box for cafes.
    service.nearbySearch(request, function(results) {
      clear('results');
      for (var i = 0; i < results.length; i++) {
        if (results[i].rating > 4) {
          placeResult(results[i].geometry.location.lat(), results[i].geometry.location.lng(), results[i]);
        }
      }
    });
  };

  window.app = {
    routeToPosition: function(lat, lon) {
      clear('markers');
      placeMarker(lat, lon);
      clear('bounds');
      drawBounds(lat, lon);
    },

    //Sets the latitude and longitude of the user, calls map and marker makers
    setPosition: function(position) {
      var lat = position.coords.latitude;
      var lon = position.coords.longitude;
      myLat = lat;
      myLon = lon;
      initMap(lat, lon);
      placeMarker(lat, lon);
    },

    findOthers: function() {
      var user = Meteor.userId();
      if (!beating) {
        Meteor.setInterval(function() {
          var others = LoggedIn.find({user: {$ne: user}}).fetch();
          clear('people');
          for (var i = 0; i < others.length; i++) {
            var otherInfo = others[i];
            var otherUser = Meteor.users.findOne({_id: others[i].user});
            placeOtherUsers(otherInfo.position.lat, otherInfo.position.lng, otherUser);
          }
        }, 1500);
      }
    },

    //Initialises heartbeat interval
    startBeating: function() {
      if (!beating) {
        Meteor.setInterval(function() {
          Meteor.call('heartbeat', Meteor.userId());
        }, 500)
        beating = true;
      }
    }
  };

}());
