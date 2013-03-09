  var map;
  var user;
  var currentMarker;

  var initialise = function() {

    if(Meteor.user()){
      user = Meteor.user().profile.name;
    }

    //Renders map and puts marker at lat/lon passed into argument.
    var initMap = function(lat, lon){
      var myPosition = new google.maps.LatLng(lat, lon);

      var mapOptions = {
        center: myPosition,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    };

    //Sets the latitude and longitude of the user, calls map and marker makers
    var setPosition = function(position){
      var lat = position.coords.latitude;
      var lon = position.coords.longitude;
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

  //places a marker at given lat and lon, inserts position into DB if there is no current marker by user
  var placeMarker = function(lat, lon){
      var position = new google.maps.LatLng(lat, lon);
       currentMarker = new google.maps.Marker({
        position: position,
        title: user || 'yo!'
      });

      currentMarker.setMap(map);
      var isThere = Markers.findOne({user: Meteor.userId()});

      //checks if a marker from the user already exists in DB
      if(!isThere){
        Markers.insert({user : Meteor.userId(), position: myPosition});
      } else {
        console.log('Marker already logged in DB');
      }
    };

    //function draws bounding box
    var drawBounds = function(lat, lon){
      var bound;
        if(currentMarker){
          var polyCoords =[
            new google.maps.LatLng(37.774929, -122.419416),
            new google.maps.LatLng(37.749815, -122.419416),
            new google.maps.LatLng(37.749815, -122.434902),
            new google.maps.LatLng(37.774929, -122.434902)
          ]

          bound = new google.maps.Polygon({
            paths: polyCoords,
            strokeColor: "#333",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "rgb(70, 182, 66)",
            fillOpacity: 0.35
          });

          bound.setMap(map);
      }
    }

  Template.header.events = {
      'click .putMarker' : function () {
        placeMarker(37.749815, -122.434902);
        drawBounds();
      }
    };

  Meteor.startup(function(){
    //Renders map on startup
    Template.map.rendered = function(){
      initialise();
    };
  });
}
