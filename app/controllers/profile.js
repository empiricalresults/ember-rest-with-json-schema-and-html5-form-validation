App.ProfileController = Ember.ObjectController.extend({
  formtext: App.FormText.Profile,
  is_editing: false,

  start_edit: function() {
    this.get('model').freeze();
    this.set('is_editing', true);
  },

  cancel_edit: function() {
    this.get('model').restore();
    this.set('is_editing', false);
  },

  save_edit: function() {
    this.get('model').save().then(function() {
      this.set('is_editing', false);
    });
  }

});
