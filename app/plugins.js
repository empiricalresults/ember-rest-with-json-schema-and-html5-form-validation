// Form Validation and tooltip support
App.Plugins = {
  add_validation_rules: function() {
    // Add HTML5 validation rules based on the the schema
    var schema = this.get('schema'),
      name = this.get('name');
    if (!schema || !name || !_.has(schema.properties, name)) {
      return; // Nothing to do
    }
    if (schema.required && _.contains(schema.required, name)) {
      this.set('required', true);
    }
    var rules = schema.properties[name];
    if (_.has(rules,'maxLength')) {
      this.set('maxLength', rules.maxLength);
    }
    if (rules.format === 'email') {
      this.set('type', 'email');
    } else if (rules.format === 'date-time') {
      this.set('type', 'date');
    }
  },

  add_form_text: function() {
    // Adds labels, titles, and tooltips based on the formtext object for this field
    var text = this.get('formtext'),
      name = this.get('name');
    if (!text || !name || !_.has(text, name)) {
      return; // Nothing to do
    }
    if (text[name].label) {
      this.set('label', text[name].label);
      this.set('title', text[name].label);
    }
    if (text[name].tooltip) {
      this.$("[name='"+ name + "']").popover({
        title: this.get('title'),
        content: text[name].tooltip,
        trigger: 'focus'
      });
    }

  }
};

// Ember Plugins
Ember.TextSupport.reopen({
  attributeBindings: ['placeholder', 'disabled', 'maxlength', 'tabindex', "required", "maxLength"],
  didInsertElement: function() {
    App.Plugins.add_validation_rules.call(this);
    App.Plugins.add_form_text.call(this);
  }
});

Ember.TextSupport.reopen({
  attributeBindings: ['placeholder', 'disabled', 'maxlength', 'tabindex', "required", "maxLength"]
});


// Ember-Bootstrap Plugin

Bootstrap.TextSupport.reopen({
  requiredBinding: "parentView.required",
  maxLengthBinding: "parentView.maxLength"
});

Bootstrap.Forms.Field.reopen({
  didInsertElement: function() {
    this.set('labelView.inputElementId', this.get('inputField.elementId'));
    App.Plugins.add_validation_rules.call(this);
    App.Plugins.add_form_text.call(this);
  }
});

// jQuery/helper plugins
jQuery.extend( {
  pretty_print: function(obj) {
    return JSON.stringify(obj, null, '\t');
  },

  assert: function(value, message) {
    if (value) {
      return;
    }
    console.warn(message);
    console.trace();
    throw "Assertion Failed:" + message;
  }
});

// Other plugins

// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Augment String.prototype to allow for easier formatting.
// From http://jsfiddle.net/cWavF/10/, original code from: https://gist.github.com/1049426.
// Usage:"{kw1} {kw2}".format({kw2:"world", kw1:"hello"})
String.prototype.format = function(i, safe, arg) {
  function format() {
    var str = this;
    _.each(arguments, function(arg) {
      if (typeof arg !== 'object') {
        return;
      }
      _.each(_.keys(arg), function(k) {
        var value = typeof arg[k] === 'object' ? JSON.stringify(arg[k]) : arg[k];
        var rx = new RegExp('\\{(?!\\{)'+k+'\\}(?!\\})', 'g');
        str = str.replace(rx, value);
      });
    });
    return str.replace("{{", "{").replace("}}", "}");
  }
  format.native = String.prototype.format;
  return format;
}();


