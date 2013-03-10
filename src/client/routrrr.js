if (Meteor.isClient) {

  var Markers = new Meteor.Collection('Markers');
  var LoggedIn = new Meteor.Collection('LoggedIn');
  var userArray = [];

  var findOthers = function(){
    var user = Meteor.userId();
    var others = LoggedIn.find({user: {$ne: user}}).fetch();

    for(var i = 0; i < others.length; i++){
      var otherInfo = others[i];
      var otherUser = Meteor.users.findOne({_id: others[i].user});
      console.log(otherUser, 'other');
      placeOtherUsers(otherInfo.position.ib, otherInfo.position.jb, otherUser);
    }
  };

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
      console.log(LoggedIn.find({user: {$ne : Meteor.userId()}}).fetch());
    };

    Meteor.autorun(function(){
      if(Meteor.user()){
        var origin = Session.get('origin');
      }

      if(!origin){
        console.log('nay');
      } else if (origin && !LoggedIn.findOne({user: Meteor.userId()})){
        LoggedIn.insert({user: Meteor.userId(), position: origin});
      } else {
        findOthers();
      }

    });


  });
}
