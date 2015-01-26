/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY */
var app = app || {};

(function($) {

    'use strict';

    var EnvView = Backbone.View.extend({

        el: '#env',
        //el: "#env",

        initialize: function() {

            console.log('ENV VIEW INIT');

            this.listenTo(app.CompositionBloqs, 'change', this.change);
            this.listenTo(app.CompositionView, 'bloqSelection', this.update);

        },

        finalizeInitialization: function() {},

        clear: function() {

            this.$el.empty();

        },

        update: function(id) {
            this.clear();
            if (id != undefined) {
                var env = app.CompositionBloqs.vm.get(id).getEnvironment();
                _.each(env, function(ctx, idx) {
                    var gr = $('<div></div>');
                    gr.addClass("env-vars env-vars-" + idx);
                    _.each(ctx, function(v, k, l) {
                        var xxx = $("<div></div>").text(k + " : " + v);
                        xxx.addClass("env-var");
                        gr.append(xxx);
                    });
                    this.$el.append(gr);
                }, this);
            }
        },

        change: function(obj) {
            this.update(obj.id);
        }

    });

    app.EnvView = new EnvView();

})(jQuery);