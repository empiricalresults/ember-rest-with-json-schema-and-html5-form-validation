
App.JSONSchemaValidatedMixin = Ember.Mixin.create({
  schema: null, // override in subclasses
  init: function() {
    this._super();
    $.assert(this.schema !== null, 'JSONSchemaValidated initialized without a schema');
  },

  validate: function() {
    // Validates the object based on its schema nad returns true if the object is valid
    // The result will look something like:
    //  {
    //    "valid": false/true
    //    "errors": [{...},{...},...]
    //    "missing": [...]
    //  }
    var data = this.get_as_object();
    return tv4.validateMultiple(data, this.schema);
  }
});

App.RestorableMixin = Ember.Mixin.create({
  init: function() {
    this._super();
    this.content_copy = {};
  },

  freeze: function() {
    this.content_copy = this.get_as_object();
  },

  restore: function() {
    this.load_from_object(this.content_copy);
  }
});

App.RESTEnabledMixin = Ember.Mixin.create(
  {
  resource_name: null, // override in subclasses
  id_field: 'id', // set the id field for REST get/post

  init: function() {
    this.set(this.id_field, null);
    this._super();
    this.set('isLoaded', false);
    this.set('isLoading', false);
    this.set('isSaving', false);
    this.promise = null;
  },

  rest_get: function(id) {
    var self = this;
    self.promise = new Ember.RSVP.Promise();
    self.set('isLoading', true);
    $.getJSON(this.get_rest_url(id))
    .done(function(data) {
      self.set('isLoading', false);
      self.load_from_object(data);
      self.promise.resolve(data);
     })
    .fail(function(error) {
      self.set('isLoading', false);
      self.set('isLoaded', false);
      self.promise.reject(error);
    });
    return self.promise;  // for chaining
  },

  rest_put: function() {
    var self = this;
    var resource_id = this.get(this.id_field);
    $.assert(resource_id, "Cannot call PUT on an object without an id");
    self.set('isSaving', true);
    self.promise = new Ember.RSVP.Promise();
    $.ajax({
      url: this.get_rest_url(),
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(this.get_as_object()),
      dataType: 'json'
    })
    .done(function(data) {
      self.set('isSaving', false);
      self.load_from_object(data);
      self.promise.resolve(data);
    })
    .fail(function(error) {
      self.set('isSaving', false);
      self.promise.reject(error);
    });
    return self.promise;  // for chaining
  },

  rest_post: function() {
    var self = this;
    var resource_id = this.get(this.id_field);
    $.assert(!resource_id, "Cannot call POST on an object that already hs an id");
    self.set('isSaving', true);
    self.promise = new Ember.RSVP.Promise();
    $.ajax({
      url: this.get_rest_url(),
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(this.get_as_object()),
      dataType: 'json'
    })
      .done(function(data) {
        self.set('isSaving', false);
        self.load_from_object(data);
        self.promise.resolve(data);
      })
      .fail(function(error) {
        self.set('isSaving', false);
        self.promise.reject(error);
      });
    return self.promise;  // for chaining
  },

  get_rest_url: function(id) {
    var url = "{base}/{resource}/".format({
      base: App.Settings.get('backend_api_url'),
      resource: this.resource_name});
    var resource_id = id || this.get(this.id_field);
    if (resource_id) {
      url = "{url}{resource_id}/".format({url: url, resource_id: resource_id});
    }
    return url;
  }

});

App.Model = Ember.Object.extend(
  App.JSONSchemaValidatedMixin,
  App.RESTEnabledMixin,
  App.RestorableMixin,
  {
  load_from_object: function(obj) {
    // Loads instance attributes from an object (dictionary).
    // The default implementation just call setProperties
    this.setProperties(obj);
    this.set('isLoaded', true);
  },

  get_as_object: function() {
    // Returns the model instance as a object (dictionary)
    var self = this;
    var obj = {};
    _.each(Ember.keys(this), function (k) {
      if (_.contains(['promise', 'content_copy', 'isLoaded', 'isLoading', 'isSaving'], k) ) {
        return;
      }
      var v = self.get(k);
      if (v instanceof App.Model || v instanceof App.Collection) {
        obj[k] = v.get_as_object();
      } else {
        obj[k] = v;
      }
    });
    return obj;
  },

  save: function() {
    if (this.get(this.id_field)) {
      return this.rest_put();
    } else {
      return this.rest_post();
    }
  },

  load: function(resource_id) {
    return this.rest_get(resource_id);
  }
});

App.Model.reopenClass({
  create_from_obj: function(obj) {
    // Create a model instance from a javascript object (dictionary)
    // The default implementation simply sets all key-values as properties of this model
    var instance = this.create();
    instance.load_from_object(obj);
    return instance;
  },

  find: function(resource_id) {
    // Ember automatically calls ModelClass.find(id), so must be supported
    var instance = this.create();
    if (resource_id) {
      instance.set(this.id_field || 'id', resource_id);
      instance.load();
    }
    return instance;
  }
});


App.Collection = Ember.ArrayProxy.extend({
  model_class: null, // Model class for this collection

  load_from_object: function(array) {
    // Loads instance attributes from an object (array).
    // The default implementation loads each item in the array and pushes the mall into
    // the collection
    this.set('content', []);
    var self = this;
    _.each(array, function(obj){
      self.pushObject(self.model_class.create_from_obj(obj));
    });
  },

  get_as_object: function() {
    // Returns the model instance as an array of objects
    return this.map(function(model) {return model.get_as_object();});
  },

  validate: function() {
    var validations = this.map(function(model){return model.validate();});
    return {
      valid: _.every(_.pluck(validations, 'valid')),
      errors: _.pluck(validations, 'errors'),
      missing: _.pluck(validations, 'missing')
    };
  }
});

App.Collection.reopenClass({
  create_from_obj: function(obj) {
    // Create a model instance from a javascript object (dictionary)
    // The default implementation simply sets all key-values as properties of this model
    var instance = this.create();
    instance.load_from_object(obj);
    return instance;
  }
});
