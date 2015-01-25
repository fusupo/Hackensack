/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY */
var app = app || {};

(function($) {

    'use strict';

    var EnvView = Backbone.View.extend({

        el: "#env",

        initialize: function() {

            console.log('ENV VIEW INIT');

            this.listenTo(app.CompositionBloqs, 'change', this.change);
            this.listenTo(app.CompositionView, 'bloqSelection', this.update);

        },

        clear: function() {

            this.$el.empty();

        },

        update: function(id) {
            this.clear();
            var env = app.CompositionBloqs.vm.get(id).getEnvironment();
            console.log(env);
            _.each(env, function(ctx) {
                var gr = $('<div></div>');
                gr.attr("style", 'border: 1px solid red;');
                _.each(ctx, function(v, k, l) {
                    var xxx = $("<div></div>").text(k + " : " + v);
                    gr.append(xxx);
                });
                this.$el.append(gr);
            }, this);
        },

        change: function(obj) {
            this.update(obj.id);
        }

    });

    app.EnvView = new EnvView();

})(jQuery);