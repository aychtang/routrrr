  var map;
  var user;

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
      var marker = new google.maps.Marker({
        position: position,
        title: user || 'yo!'
      });

      marker.setMap(map);
      var isThere = Markers.findOne({user: Meteor.userId()});

      //checks if a marker from the user already exists in DB
      if(!isThere){
        Markers.insert({user : Meteor.userId(), position: myPosition});
      } else {
        console.log('Marker already logged in DB');
      }
      console.log('yo', marker, map);
    };

  Template.header.events = {
      'click .putMarker' : function () {
        placeMarker(37.749815, -122.434902);
      }
    };

  Meteor.startup(function(){
    //Renders map on startup
    Template.map.rendered = function(){
      initialise();
    };
  });
}
