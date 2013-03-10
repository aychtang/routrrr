if (Meteor.isClient) {

  if(!Markers){
    var Markers = new Meteor.Collection('Markers');
  }

  var initialise = function() {
    //initialise function creates the map, plots the first marker on users current position.
    //Finds location of user using Navigator API
    navigator.geolocation.getCurrentPosition(setPosition);
  };

  Meteor.startup(function(){
    //Renders map on startup
    Template.map.rendered = function(){
        initialise();
    };
  });
}
