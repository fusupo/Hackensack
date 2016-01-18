'use strict';
var EnvView = Backbone.View.extend({

  el: '#env',
  //el: "#env",

  initialize: function() {

    console.log('ENV VIEW INIT');

    this.listenTo(app.CompositionBloqs, 'change:param', this.change);
    this.listenTo(app.CompositionView, 'bloqSelection', this.update);

  },

  finalizeInitialization: function() {},

  clear: function() {

    this.$el.empty();

  },

  update: function(id) {
    this.clear();
    if (id != undefined) {
      var node = app.vm.get(id);
      var first = true;
      do{
        var env = node.getEnvironment();
        var gr = $('<div></div>');
        gr.addClass(first ? "env-vars env-vars-0" : "env-vars env-vars"); // + idx);
        first = false && first;
        _.each(env, function(v, k, l) {
          var xxx = $("<div></div>").text(k + " : " + v);
          xxx.addClass("env-var");
          gr.append(xxx);
        });
        this.$el.append(gr);
        node = node.spec.parent;
      }while(node!==undefined && node !== 'x');
    }
  },

  change: function(obj) {
    this.update(obj.get_id());
  }

});
