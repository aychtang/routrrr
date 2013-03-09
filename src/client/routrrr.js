  var map;
  var user;
  var currentMarker;
  var origin;
  var myPosition;

  var initialise = function() {

    if(Meteor.user()){
      user = Meteor.user().profile.name;
    }

    //Renders map and puts marker at lat/lon passed into argument.
    var initMap = function(lat, lon){
      myPosition = new google.maps.LatLng(lat, lon);
      var mapOptions = {
        center: myPosition,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
      service = new google.maps.places.PlacesService(map);

      google.maps.event.addListener(map, 'click', function(event) {
        var newLat = event.latLng.lat();
        var newLon = event.latLng.lng();

        placeMarker(newLat, newLon);
        drawBounds(newLat, newLon);
      });
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

    //Finds location of user using Navigator API
    navigator.geolocation.getCurrentPosition(setPosition);
  };


if(!Markers){
  var Markers = new Meteor.Collection('Markers');
}

if (Meteor.isClient) {

  var markerArray = [];
  var boundArray = [];

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

  //places a marker at given lat and lon, inserts position into DB if there is no current marker by user
  var placeMarker = function(lat, lon){
      var position = new google.maps.LatLng(lat, lon);
       currentMarker = new google.maps.Marker({
        position: position,
        title: user || 'yo!'
      });

      origin = origin || currentMarker;

      if(currentMarker !== origin){
        markerArray.push(currentMarker);
      }
      clearMarkers();
      currentMarker.setMap(map);
    };

    //function draws bounding box
    var drawBounds = function(newLat, newLon){
      var bound;

        if(currentMarker){
          var polyCoords =[
            new google.maps.LatLng(myLat, newLon),
            new google.maps.LatLng(myLat, myLon),
            new google.maps.LatLng(newLat, myLon),
            new google.maps.LatLng(newLat, newLon),
          ]

          var NE = new google.maps.LatLng(myLat, myLon);
          var SW = new google.maps.LatLng(newLat, newLon);
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
            console.log(results);
          });
      }
    };

  Meteor.startup(function(){

    //Renders map on startup
    Template.map.rendered = function(){
      initialise();
    };
  });
}
