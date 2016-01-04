/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY */
var app = app || {};

(function($) {

  'use strict';

  var IOSpecView = Backbone.View.extend({

    el: '#spec-io',

    initialize: function() {
      this.currId = undefined;
      var that = this;
      this.$("#spec-io-paste").on('click', function() {

      });
      this.$("#spec-io-reload").on('click', function() {
        app.CompositionBloqs.reload(JSON.parse(that.textarea.getValue()));
      });
      this.$("#spec-io-clear").on("click", function() {
        that.clear();
      });
      app.CompositionBloqs.on("all", function(f, r, j) {
        that.draw();
      });
    },

    finalizeInitialization: function() {
      this.textarea = CodeMirror.fromTextArea(document.getElementById('spec-io-textarea'), {
        lineNumbers: true,
        matchBrackets: true,
        tabMode: "indent",
        mode: {
          name: "javascript",
          json: true
        },
        lineWrapping: true
      });
      new Clipboard('#spec-io-copy', {
        text: (function() {
          console.log(this.textarea.getDoc().getValue());
          return this.textarea.getDoc().getValue();
        }).bind(this)
      });
      this.$("#spec-io-copy").on('click', (function() {
      }).bind(this));
    },

    clear: function() {
      this.textarea.setValue('');
      app.CompositionBloqs.reset();
    },

    draw: function() {
      var json = _.map(app.CompositionBloqs.getBloqs(), function(b) {
        return b.toJSON();
      });
      (function filter(obj) {
        if (typeof(obj) !== "string") {
          $.each(obj, function(key, value) {
            if (value === "" || value === null) {
              delete obj[key];
            } else if (Object.prototype.toString.call(value) === '[object Object]') {
              filter(value);
            } else if ($.isArray(value)) {
              $.each(value, function(k, v) {
                filter(v);
              });
            }
          });
        }
      })(json);
      var str = JSON.stringify(json);
      this.textarea.setValue(str);
      setTimeout((function() {
        this.textarea.refresh();
      }).bind(this), 1);
    }
  });

  app.IOSpecView = new IOSpecView();

})(jQuery);
