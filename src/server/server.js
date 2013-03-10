if (Meteor.isServer) {
  var LoggedIn = new Meteor.Collection('LoggedIn');
  Meteor.methods({
    ultimateClear : function(){
      LoggedIn.remove({});
    }
  });
}