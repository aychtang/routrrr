if (Meteor.isServer) {
  var Markers = new Meteor.Collection('Markers');
  Meteor.methods({
    ultimateClear : function(){
      Markers.remove({});
    }
  });
}