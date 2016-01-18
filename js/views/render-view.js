'use strict';
var RenderView = Backbone.View.extend({

  el: '#render',

  initialize: function() {
    this.currId = undefined;
  },

  finalizeInitialization: function() {
    this.listenTo(app.IOSVGView, 'change', (function(e) {
      this.clear();
      this.draw(e);
    }).bind(this));
  },

  clear: function() {
    this.$el.empty();
  },

  draw: function(r) {
    this.$el.append($(r));
  }
});
