if (Meteor.isClient) {

  var Markers = new Meteor.Collection('Markers');

  var initialise = function() {
    //initialise function creates the map, plots the first marker on users current position.
    //Finds location of user using Navigator API
    navigator.geolocation.getCurrentPosition(setPosition);

    /*CALL STACK
      -setPosition
        -initMap
        -placeMarkers
    */
  };

  Meteor.startup(function(){
    //Renders map on startup
    Template.map.rendered = function(){
      initialise();
      console.log(Meteor.userId());
    };

    Meteor.autorun(function(){
      var origin = Session.get('origin');
      if(!origin){
        console.log('nay');
      } else {
        console.log('yay')
      }
    });


  });
}
