if (Meteor.isServer) {
  var LoggedIn = new Meteor.Collection('LoggedIn');
  Meteor.methods({
    heartbeat: function(userId){
      var thisUser = LoggedIn.findOne({user: userId});
      if(thisUser){
        LoggedIn.update(thisUser, {$set: {timestamp: new Date().getTime()}});
      }
    }
  });

  Meteor.startup(function(){
    Meteor.setInterval(function(){
      var now = new Date().getTime();
      LoggedIn.find({timestamp: {$lt: (now - 4 * 1000) }}).fetch().forEach(function(data){LoggedIn.remove(data)});
    }, 1500)
  })
}