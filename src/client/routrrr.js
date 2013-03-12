if (Meteor.isClient) {

  var LoggedIn = new Meteor.Collection('LoggedIn');
  var userArray = [];
  var beating = false;

  Template.nameList.returnPeople = function(){
    var people = LoggedIn.find({user: {$ne : Meteor.userId()}}).fetch();
    var userInfo = [];
    for(var i = 0; i < people.length; i++){
      userInfo.push(Meteor.users.findOne({_id: people[i].user}));
    }
    return userInfo;
  };

  Template.player.preserve(['.usas']);

  Template.player.events = {
    'click p' : function () {
      var thisDude = LoggedIn.findOne({user : this._id});
      clearMarkers();
      placeMarker(thisDude.position.mb, thisDude.position.nb);
      clearBounds();
      drawBounds(thisDude.position.mb, thisDude.position.nb);
    }
  };

  var initialise = function() {
    navigator.geolocation.getCurrentPosition(setPosition);

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
  };

  var startBeating = function(){
    if(!beating){
      Meteor.setInterval(function(){
      Meteor.call('heartbeat', Meteor.userId());
    }, 500)
      beating = true;
    } else {
      return false;
    }
  };

  Meteor.startup(function(){
    Template.map.rendered = function(){
      initialise();
    };
  });
}
