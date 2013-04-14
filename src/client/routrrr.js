if (Meteor.isClient) {

  LoggedIn = new Meteor.Collection('LoggedIn');
  beating = false;

  Template.nameList.returnPeople = function(){
    var people = LoggedIn.find({user: {$ne : Meteor.userId()}}).fetch();
    var userInfo = [];
    for (var i = 0; i < people.length; i++){
      userInfo.push(Meteor.users.findOne({_id: people[i].user}));
    }

    return userInfo;
  };

  Template.player.preserve(['.users']);

  Template.player.events = {
    'click .users' : function () {
      var thisUser = LoggedIn.findOne({user : this._id});
      app.routeToPosition(thisUser.position.jb, thisUser.position.kb);
    }
  };

  var initialise = function() {
    navigator.geolocation.getCurrentPosition(app.setPosition);

    Meteor.autorun(function() {
      if (Meteor.user()) {
        var origin = Session.get('origin');
      }
      if (!origin) {
        console.log('loading...');
      } else if (origin && !LoggedIn.findOne({user: Meteor.userId()})){
        LoggedIn.insert({user: Meteor.userId(), position: origin});
      } else {
        app.findOthers();
        app.startBeating();
      }

    });
  };

  Meteor.startup(function() {
    Template.map.rendered = function() {
      initialise();
    };
  });
}
