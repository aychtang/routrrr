if (Meteor.isClient) {

  var Markers = new Meteor.Collection('Markers');
  var LoggedIn = new Meteor.Collection('LoggedIn');
  var userArray = [];

  var findOthers = function(){
    var user = Meteor.userId();
    if(!beating){
      Meteor.setInterval(function(){
        var others = LoggedIn.find({user: {$ne: user}}).fetch();
        clearPeeps();
        for(var i = 0; i < others.length; i++){
          var otherInfo = others[i];
          var otherUser = Meteor.users.findOne({_id: others[i].user});
          placeOtherUsers(otherInfo.position.ib, otherInfo.position.jb, otherUser);
        }
      }, 1000)
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

  var beating = false;

  var startBeating = function(){
    if(!beating){
      Meteor.setInterval(function(){
      console.log('yo');
      Meteor.call('heartbeat', Meteor.userId());
    }, 5000)
      beating = true;
    } else {
      return false;
    }
  };

  Meteor.startup(function(){
    //Renders map on startup
    Template.map.rendered = function(){
      initialise();
    };

    Meteor.autorun(function(){
      if(Meteor.user()){
        var origin = Session.get('origin');
      }

      if(!origin){
        console.log('loading');
      } else if (origin && !LoggedIn.findOne({user: Meteor.userId()})){
        LoggedIn.insert({user: Meteor.userId(), position: origin});
      } else {
        findOthers();
        startBeating();
      }

    });
  });
}
