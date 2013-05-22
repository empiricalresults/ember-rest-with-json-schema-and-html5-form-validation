
App.Router.map(function() {
  this.resource('profiles', function() {
    this.resource('profile', { path: ':profile_id' });
  });
});

App.IndexRoute = Ember.Route.extend({
  redirect: function() {
    var profile = App.Profile.create();
    profile.set("id", 'test_profile_uuid_1');
    profile.load();
    this.transitionTo('profile', profile);
  }
});

