  var initialise = function() {

    //Renders map and puts marker at lat/lon passed into argument.
    var displayPosition = function(lat, lon){
      var myPosition = new google.maps.LatLng(lat, lon);

      var mapOptions = {
        center: myPosition,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

      var marker = new google.maps.Marker({
        position: myPosition,
        map: map,
        title: "Yo World!"
      });
    };

    //Sets the latitude and longitude of the user and calls displayPosition()
    var returnPosition = function(position){
      var lat = position.coords.latitude;
      var lon = position.coords.longitude;

      displayPosition(lat, lon);
    };

    //Finds location of user using Navigator API
    navigator.geolocation.getCurrentPosition(returnPosition);
  };

if (Meteor.isClient) {
  Handlebars.registerHelper('isLoggedIn', function(){
    if(Meteor.user()){
      return true;
    }
    return false;
  });
  var Markers = new Meteor.Collection('Markers');

  Meteor.startup(function(){
    //Renders map on startup
    Template.map.rendered = function(){
      initialise();
    };
  });
}
