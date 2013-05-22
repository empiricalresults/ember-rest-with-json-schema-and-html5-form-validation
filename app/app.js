/*
 * Hey! This is an Ember application. It's built using a 
 * neuter task (see this project's Gruntfile for what that means).
 *
 * `require`s in this file will be stripped and replaced with
 * the string contents of the file they refer to wrapped in
 * a closure.
 *
 * Each file contains its own commenting, so feel free to crack
 * them open if you want more information about what is going on.
*/

/*
  this file is generated as part of the build process.
  If you haven't run that yet, you won't see it.

  It is excluded from git commits since it's a 
  generated file.
*/
require('dependencies/compiled/templates');

/*
  Creates a new instance of an Ember application and
  specifies what HTML element inside index.html Ember
  should manage for you.
*/

window.App = Ember.Application.create({
  LOG_TRANSITIONS: true,
  rootElement: window.TESTING ? '#qunit-fixture' : '#demo-app'
});

if (window.TESTING) {
  window.App.deferReadiness();
}

require('app/ember-bootstrap/main');
require('app/settings');
require('app/plugins');
require('app/lib/rest');
require('app/models/schema');
require('app/models/formtext');
require('app/models/profile');
require('app/controllers/profile');
require('app/routes/router');
require('app/models/mock');
require('app/routes/router');
