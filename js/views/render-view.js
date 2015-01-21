/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY */
var app = app || {};

(function($) {

    'use strict';

    var RenderView = Backbone.View.extend({

        el: "#render",

        initialize: function() {

            console.log('RENDER VIEW INIT');

            this.listenTo(app.CompositionBloqs, 'change', this.bloqChange);
            this.listenTo(app.CompositionView, 'bloqSelection', this.bloqSelection);

            this.currId = undefined;
            this.renderTree = undefined;
        },

        bloqSelection: function(id) {

            this.clear();

            if (id !== undefined) {
                this.currId = id;
                var data = _.reduce(app.CompositionBloqs.toJSON(), function(memo, i) {
                    memo[i.id] = i;
                    return memo;
                }, {});

                this.renderTree = bloqsnet.create(data, id);
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

            var rendered = $(this.renderTree.render_svg());

            if (rendered.is("svg")) {
                this.$el.append(rendered);
            } else {
                var svg = $(bloqsnet.REGISTRY["root"].func({
                    "width": "100%",
                    "height": "100%"
                }).render_svg());
                svg.append(rendered);
                this.$el.append(svg);
            }

        }

    });

    app.RenderView = new RenderView();

})(jQuery);