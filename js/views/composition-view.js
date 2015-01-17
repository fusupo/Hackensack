/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY */
var app = app || {};

(function($) {

    'use strict';

    var CompositionView = Backbone.View.extend({

        el: "#composition",

        initialize: function(collection, settings) {

            this.collection = collection;

            this.listenTo(collection, 'change', this.redraw);
            this.listenTo(collection, 'remove', this.redraw);
            this.listenTo(collection, 'reset', this.draw);

            this.settings = settings || {};

            var divname = this.settings.div || this.el;
            this.div = d3.select(divname);

            this.w = settings.w || 600;
            this.h = settings.h || 230;
            this.box_w = settings.box_w || 100;
            this.box_h = settings.box_h || 40;

        },

        plotdata: function() {

            var data = [];
            this.collection.forEach(function(datapoint) {
                data.push({
                    x: datapoint.get('x'),
                    y: datapoint.get('y')
                });
            });

            return data;

        },
        draw: function() {

            if (this.plotdata().length > 0) {
                this.plot({
                    newPlot: true
                });
            }

        },
        redraw: function() {

            console.log("redraw");

        },
        plot: function(options) {

            // Copy these data to avoid closure issues below
            var w = this.w;
            var h = this.h;
            var box_w = this.box_w;
            var box_h = this.box_h;
            var data = this.plotdata();

            if (options.newPlot) {

                <!-- Drag Behavior -->
                var drag = d3.behavior.drag()
                    .origin(function(d) {
                        return d;
                    })
                    .on("drag", function(d) {
                        d3.select(this)
                            .attr("x", d.x = Math.max((box_w / 2), Math.min(w - (box_w / 2), d3.event.x)))
                            .attr("y", d.y = Math.max((box_h / 2), Math.min(h - (box_h / 2), d3.event.y)));
                    });

                var stage = this.div.append("svg:svg")
                    .attr("class", "stage")
                    .attr("width", 600)
                    .attr("height", 200);
                stage.selectAll("rect")
                    .data(data)
                    .enter().append("svg:rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", box_w)
                    .attr("height", box_h)
                    .call(drag);
            } else {
                this.div.selectAll("rect")
                    .data(data)
                    .transition()
                    .duration(this.duration)
                    .attr("y", function(d) {
                        return 0;
                    })
                    .attr("height", function(d) {
                        return 0;
                    });
            }

        }
    });

    app.CompositonView = new CompositionView(app.CompositionBloqs, {});

})(jQuery);