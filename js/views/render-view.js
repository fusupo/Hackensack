/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY */
var app = app || {};

(function($) {

  'use strict';

  var RenderView = Backbone.View.extend({

    el: '#render',

    initialize: function() {
      console.log('RENDER VIEW INIT');
      //this.listenTo(app.CompositionBloqs, 'change', this.bloqChange);
      //this.listenTo(app.CompositionBloqs, 'change:param', this.bloqChange);
      //this.listenTo(app.CompositionView, 'bloqSelection', this.bloqSelection);
      this.currId = undefined;
    },

    finalizeInitialization: function() {
      var that = this;
      this.listenTo(app.IOSVGView, 'change', function(e) {
        that.clear();
        that.draw(e);
      });
    },

    bloqSelection: function(id) {
      this.clear();
      if (id !== undefined) {
        this.currId = id;
        console.log("BLOQ SELECTION");
        this.draw();
      } else {
        this.currId = undefined;
      }
    },

    bloqChange: function() {
      this.bloqSelection(this.currId);
    },

    clear: function() {
      this.$el.empty();
    },

    draw: function(r) {
      this.$el.append($(r));
    }

  });

  app.RenderView = new RenderView();

})(jQuery);
