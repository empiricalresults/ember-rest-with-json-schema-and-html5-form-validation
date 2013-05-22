QUnit.begin(function() {
  App.TestSchema = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "title": "test-schema",
    "description": "used for unit testing rest models",
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "required_string": {
        "type": "string",
        "minLength": 5
      },
      "nested_object": {
        "title": "nested-object",
        "description": "Sample Nested Object",
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "phone": {
            "type": "string",
              "maxLength": 20
          },
          "email": {
            "type": "string",
              "format" : "email"
          }
        }
      }
    },
    "required": ["required_string"]
  };

  App.TestModel = App.Model.extend({
    schema: App.TestSchema,
    resource_name: 'test_model'
  });
  App.TestCollection = App.Collection.extend({
    model_class: App.TestModel
  });
});

module("Model Tests", {
  setup: function() {
    App.reset();
  }
});

test("create_from_obj", function(){
  expect(2);
  var instance = App.TestModel.create_from_obj({
    key1: "some key",
    obj1: {
      some: "object"
    }
  });
  equal(instance.get('key1'), "some key");
  equal(instance.get('obj1').some, "object");
});

test("get_as_object", function(){
  expect(5);
  var instance = App.TestModel.create_from_obj({
    key1: "some key",
    key2: App.TestModel.create_from_obj({nested_key: "other value"})
  });
  var obj = instance.get_as_object();
  ok(_.has(obj, 'key1'));
  ok(_.has(obj, 'key2'));
  equal(obj.key1, "some key");
  ok(_.has(obj.key2, 'nested_key'));
  equal(obj.key2.nested_key, "other value");
});

test("RestorableMixin", function(){
  expect(4);
  var instance = App.TestModel.create_from_obj({
    key1: "some key",
    key2: App.TestModel.create_from_obj({nested_key: "other value"})
  });
  instance.freeze();
  instance.set('key1', 'bad value');
  instance.set('key2', App.TestModel.create_from_obj({nested_key: "unrelated value"}));
  var obj = instance.get_as_object();
  notEqual(obj.key1, "some key");
  notEqual(obj.key2.nested_key, "other value");
  instance.restore();
  obj = instance.get_as_object();
  equal(obj.key1, "some key");
  equal(obj.key2.nested_key, "other value");
});


module("Collection Tests", {
  setup: function() {
    App.reset();
  }
});

test("create_from_obj", function(){
  expect(4);
  var instance = App.TestCollection.create_from_obj([
      {
        key1: "some key",
        obj1: {
          some: "object"
        }
      },
      {
        key1: "another key",
        obj1: {
          another: "object"
        }
      }]);
  equal(instance.objectAt(0).get('key1'), "some key");
  equal(instance.objectAt(0).get('obj1').some, "object");
  equal(instance.objectAt(1).get('key1'), "another key");
  equal(instance.objectAt(1).get('obj1').another, "object");
});

test("get_as_object", function(){
  expect(11);
  var collection = App.TestCollection.create({content: []});
  collection.pushObject(
    App.TestModel.create_from_obj({
      key1: "some key",
      key2: App.TestModel.create_from_obj({nested_key: "some value"})
    }));
  collection.pushObject(
    App.TestModel.create_from_obj({
      key1: "another key",
      key2: App.TestModel.create_from_obj({nested_key: "other value"})
    }));
  var arr = collection.get_as_object();
  equal(arr.length, 2);
  ok(_.has(arr[0], 'key1'));
  ok(_.has(arr[0], 'key2'));
  equal(arr[0].key1, "some key");
  ok(_.has(arr[0].key2, 'nested_key'));
  equal(arr[0].key2.nested_key, "some value");
  ok(_.has(arr[1], 'key1'));
  ok(_.has(arr[1], 'key2'));
  equal(arr[1].key1, "another key");
  ok(_.has(arr[1].key2, 'nested_key'));
  equal(arr[1].key2.nested_key, "other value");
});

module("Validation tests", {
  setup: function() {
    App.reset();
  }
});

test("Model validate: valid", function(){
  expect(1);
  var instance = App.TestModel.create_from_obj({
    id: "some_id",
    required_string: "some required str",
    nested_object: App.TestModel.create_from_obj({
      name: "some name",
      phone: "some phone",
      email: "email@example.com"})
  });
  ok(instance.validate().valid);
});

test("Model validate: invalid - required missing", function(){
  expect(1);
  var instance = App.TestModel.create_from_obj({
    id: "some_id",
    required_string: "",
    nested_object: App.TestModel.create_from_obj({
      name: "some name",
      phone: "some phone",
      email: "email@example.com"})
  });
  ok(!instance.validate().valid);
});

test("Collection validate: valid", function(){
  expect(1);
  var collection = App.TestCollection.create({content: []});
  collection.pushObject(App.TestModel.create_from_obj({
    id: "some_id",
    required_string: "some required str",
    nested_object: App.TestModel.create_from_obj({
      name: "some name",
      phone: "some phone",
      email: "email@example.com"})
  }));
  collection.pushObject(App.TestModel.create_from_obj({
    id: "another_id",
    required_string: "another required str",
    nested_object: App.TestModel.create_from_obj({
      name: "another name",
      phone: "another phone",
      email: "another@example.com"})
  }));
  ok(collection.validate().valid);
});

test("Model Collection: invalid - required missing", function(){
  expect(2);
  var collection = App.TestCollection.create({content: []});
  collection.pushObject(App.TestModel.create_from_obj({
    id: "some_id",
    required_string: "some required str",
    nested_object: App.TestModel.create_from_obj({
      name: "some name",
      phone: "some phone",
      email: "email@example.com"})
  }));
  collection.pushObject(App.TestModel.create_from_obj({
    id: "another_id",
    required_string: "",
    nested_object: App.TestModel.create_from_obj({
      name: "another name",
      phone: "another phone",
      email: "another@example.com"})
  }));
  var validations = collection.validate();
  ok(!validations.valid);
  ok(validations.errors[1]);
});

module("Model REST GET Tests", {
  setup: function() {
    App.reset();
    $.mockjaxClear(); // clear any existing mock jax entries
    var url = '{base_url}/test_model/f4ca509bf056473786b3a0936758e884/'
      .format({base_url: App.Settings.get('backend_api_url')});
    $.mockjax({
      url: url,
      type: 'get',
      status: 200,
      dataType: 'json',
      response: function() {
        this.responseText = JSON.stringify({
          "id": "f4ca509bf056473786b3a0936758e884",
          "required_string": "some string",
          "nested_object": {"name": "joe smith", "phone": 123456789}
        });
      }
    });
  }
});

asyncTest("REST GET: id from model", function() {
  expect(5);
  var model = App.TestModel.create();
  model.set('id', 'f4ca509bf056473786b3a0936758e884');
  model.rest_get().then(function() {
    start(); // success!
    equal(model.get('id'), 'f4ca509bf056473786b3a0936758e884');
    ok(model.get('isLoaded'));
    equal(model.get('required_string'), 'some string');
    equal(model.get('nested_object').name, 'joe smith');
    equal(model.get('nested_object').phone, 123456789);
  }, function() {
    ok(false); // failure
  });
});

asyncTest("REST GET: id specified", function() {
  expect(5);
  var model = App.TestModel.create();
  model.rest_get('f4ca509bf056473786b3a0936758e884').then(function() {
    start(); // success!
    equal(model.get('id'), 'f4ca509bf056473786b3a0936758e884');
    ok(model.get('isLoaded'));
    equal(model.get('required_string'), 'some string');
    equal(model.get('nested_object').name, 'joe smith');
    equal(model.get('nested_object').phone, 123456789);
  }, function() {
    ok(false); // failure
  });
});

asyncTest("REST GET: failure", function() {
  expect(1);
  var model = App.TestModel.create();
  $.mockjaxClear();
  var url = '{base_url}/test_model/f4ca509bf056473786b3a0936758e884/'
    .format({base_url: App.Settings.get('backend_api_url')});
  $.mockjax({
    url: url,
    type: 'get',
    status: 404});
  model.rest_get('f4ca509bf056473786b3a0936758e884').then(function() {
    ok(false); // Shouldn't get here
  }, function() {
    start();
    ok(!model.get('isLoaded'));
  });
});


module("Model REST PUT Tests", {
  setup: function() {
    App.reset();
    App.model_instance = App.TestModel.create_from_obj({
      id: "f4ca509bf056473786b3a0936758e884",
      required_string: "some string",
      "nested_object": {"name": "joe smith", "phone": 123456789}
    });

    $.mockjaxClear(); // clear any existing mock jax entries
    var url = '{base_url}/test_model/f4ca509bf056473786b3a0936758e884/'
      .format({base_url: App.Settings.get('backend_api_url')});
    $.mockjax({
      url: url,
      type: 'put',
      status: 200,
      dataType: 'json',
      response: function() {
        this.responseText = JSON.stringify({
          "id": "f4ca509bf056473786b3a0936758e884",
          "required_string": "another string - server can change things!",
          "nested_object": {"name": "joe smith", "phone": 123456789}
        });
      }
    });
  }
});

asyncTest("REST PUT: success", function() {
  expect(5);
  var model = App.model_instance;
  model.rest_put().then(function() {
    start(); // success!
    equal(model.get('id'), 'f4ca509bf056473786b3a0936758e884');
    ok(model.get('isLoaded'));
    equal(model.get('required_string'), 'another string - server can change things!');
    equal(model.get('nested_object').name, 'joe smith');
    equal(model.get('nested_object').phone, 123456789);
  }, function() {
    start();
    ok(false); // failure
  });
});

asyncTest("REST PUT: failure", function() {
  expect(1);
  var model = App.model_instance;
  $.mockjaxClear();
  var url = '{base_url}/test_model/f4ca509bf056473786b3a0936758e884/'
    .format({base_url: App.Settings.get('backend_api_url')});
  $.mockjax({
    url: url,
    type: 'put',
    status: 400});
  model.rest_put().then(function() {
    start();
    ok(false);  // should not succeed
  }, function() {
    start();
    ok(true);  // should fail
  });
});

module("Model REST POST Tests", {
  setup: function() {
    App.reset();
    App.model_instance = App.TestModel.create_from_obj({
      required_string: "some string",
      "nested_object": {"name": "joe smith", "phone": 123456789}
    });

    $.mockjaxClear(); // clear any existing mock jax entries
    var url = '{base_url}/test_model/'.format({base_url: App.Settings.get('backend_api_url')});
    $.mockjax({
      url: url,
      type: 'post',
      status: 200,
      dataType: 'json',
      response: function() {
        this.responseText = JSON.stringify({
          "id": "f4ca509bf056473786b3a0936758e884",
          "required_string": "some string",
          "nested_object": {"name": "joe smith", "phone": 123456789}
        });
      }
    });
  }
});

asyncTest("REST POST: success", function() {
  expect(5);
  var model = App.model_instance;
  model.rest_post().then(function() {
    start(); // success!
    equal(model.get('id'), 'f4ca509bf056473786b3a0936758e884');
    ok(model.get('isLoaded'));
    equal(model.get('required_string'), 'some string');
    equal(model.get('nested_object').name, 'joe smith');
    equal(model.get('nested_object').phone, 123456789);
  }, function() {
    start();
    ok(false); // failure
  });
});

asyncTest("REST PUT: failure", function() {
  expect(1);
  var model = App.model_instance;
  $.mockjaxClear();
  var url = '{base_url}/test_model/'.format({base_url: App.Settings.get('backend_api_url')});
  $.mockjax({
    url: url,
    type: 'post',
    status: 400});
  model.rest_post().then(function() {
    start();
    ok(false);  // should not succeed
  }, function() {
    start();
    ok(true);  // should fail
  });
});
