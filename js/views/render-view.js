/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY */
var app = app || {};

(function($) {

    'use strict';

    var RenderView = Backbone.View.extend({

        el: '#render',
        //el: "#render",

        initialize: function() {

            console.log('RENDER VIEW INIT');

            this.listenTo(app.CompositionBloqs, 'change', this.bloqChange);
            this.listenTo(app.CompositionBloqs, 'change:param', this.bloqChange);
            this.listenTo(app.CompositionView, 'bloqSelection', this.bloqSelection);

            this.currId = undefined;

        },

        finalizeInitialization: function() {},

        bloqSelection: function(id) {

            this.clear();

            if (id !== undefined) {
                this.currId = id;
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

        draw: function() {
//console.log("draw");
            var rendered = app.CompositionBloqs.get_svg(this.currId);

            if (rendered.is("svg")) {
                this.$el.append(rendered);
            } else {
                var svg = $(app.vm.new("test-render", "root", {}).render_svg());
                svg.append(rendered);
                this.$el.append(svg);
            }

        }

    });

    app.RenderView = new RenderView();

})(jQuery);