/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY */
var app = app || {};

(function($) {

    'use strict';

    var CompositionView = Backbone.View.extend({

        el: "#composition",

        initialize: function(srcBloqs, compositionBloqs, settings) {

            this.srcBloqs = srcBloqs;

            //this.listenTo(srcBloqs, 'change', this.redraw);
            //this.listenTo(srcBloqs, 'remove', this.redraw);
            this.listenTo(srcBloqs, 'reset', this.resetManifest);

            this.compositionBloqs = compositionBloqs;

            this.listenTo(compositionBloqs, 'add', this.redraw);
            this.listenTo(compositionBloqs, 'remove', this.redraw);
            this.listenTo(compositionBloqs, 'reset', this.draw);

            this.settings = settings || {};

            var divname = this.settings.div || this.el;
            this.div = d3.select(divname);

            this.w = settings.w || parseInt(this.div.style("width"));
            this.h = settings.h || parseInt(this.div.style("height"));
            this.box_w = settings.box_w || 100;
            this.box_h = settings.box_h || 40;
            this.setupD3();
        },
        setupD3: function() {
            var win_w = this.w; // using parseInt here to drop the 'px'
            var win_h = this.h; // likewise
            var l_perc = 0.2;
            var r_perc = 0.8;
            var l_w = win_w * l_perc;
            var r_w = win_w * r_perc;
            this.stage = this.div.append("svg:svg")
                .attr("viewBox", "0 0 " + win_w + " " + win_h)
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("class", "stage")
                .attr("width", win_w)
                .attr("height", win_h)
                .attr("id", "composition-composite-svg");

            var zoom1 = d3.behavior.zoom()
                .on("zoom", (function() {
                    var targ_y = d3.event.translate[1];
                    //console.log(targ_y);
                    if ((targ_y > 0) && (targ_y < win_h)) {
                        d3.select(this).attr("viewBox", "0 " + d3.event.translate[1] + " " + (win_w / 2) + " " + win_h);
                    } else if (targ_y > win_h) {
                        zoom1.translate([d3.event.translate[0], win_h]);
                        d3.select(this).attr("viewBox", "0 " + win_h + " " + (win_w / 2) + " " + win_h);
                    } else {
                        zoom1.translate([d3.event.translate[0], 0]);
                        d3.select(this).attr("viewBox", "0 0 " + (win_w / 2) + " " + win_h);
                    }
                }));
            this.stage_left = this.stage.append("svg:svg")
                .attr("viewBox", "0 0 " + l_w + " " + win_h)
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("id", "manifest-svg")
                .call(zoom1);
            this.stage_left
                .append("svg:rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", l_w)
                .attr("height", win_h * 2)
                .attr("fill", "#aaaaaa");

            // var zoom2 = d3.behavior.zoom()
            //     .on("zoom", (function() {
            //         //console.log(d3.event);
            //     }));
            this.stage_right = this.stage.append("svg:svg")
                .attr("viewBox", "0 0 " + r_w + " " + win_h)
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("x", l_w)
                .attr("id", "composition-stage-svg");
            //.call(zoom2);
            // this.stage_right
            //     .append("svg:rect")
            //     .attr("x", 0)
            //     .attr("y", 0)
            //     .attr("width", win_w / 2)
            //     .attr("height", win_h)
            //     .attr("fill", "#938475");

        },

        manifestDrag: function(d, e) {

            if (this.tempSrcBlock === null || this.tempSrcBlock === undefined) {
                this.tempSrcBlock = this.stage.append("svg:rect")
                    .attr("id", "tmp_src")
                    .attr("x", e.x)
                    .attr("y", e.y)
                    .attr("width", 100)
                    .attr("height", 100)
                    .attr("fill", "#ff0000");
            }
            this.tempSrcBlock.attr("x", e.x);
            this.tempSrcBlock.attr("y", e.y);
        },
        manifestDragEnd: function(d, e) {
            var m = d3.mouse(this.stage_right[0][0]);
            if ((m[0] > 0) && (m[0] < (this.w / 2))) {
                app.CompositionBloqs.add(new app.CompositionBloq({
                    id: "bloq-" + new Date().getTime(),
                    type: "xxx",
                    meta: {
                        x: m[0],
                        y: m[1]
                    },
                    params: {}
                }));
            }
            this.tempSrcBlock.remove();
            this.tempSrcBlock = null;
        },
        resetManifest: function() {

            var that = this;
            var data = this.manifestdata();
            var drag = d3.behavior.drag()
                // .origin(function(d) {
                //     console.log(d);
                //     return d;
                // })
                .on("dragstart", function(d) {
                    d3.event.sourceEvent.stopPropagation(); // silence other listeners
                })
                .on("drag", function(d) {
                    d3.event.sourceEvent.stopPropagation(); // silence other listeners
                    that.manifestDrag(d, d3.event);
                })
                .on("dragend", function(d) {
                    d3.event.sourceEvent.stopPropagation(); // silence other listeners
                    that.manifestDragEnd(d, d3.event);
                });
            var g = this.stage_left.selectAll()
                .data(data)
                .enter().append("svg:g")
                .attr("transform", function(d) {
                    return "translate(" + 50 + "," + (d.idx * 60) + ")";
                })
                .call(drag);

            g.append("svg:rect")

            .attr("width", 50)
                .attr("height", 50)
                .attr("fill", "#463810");

            g.append("svg:text")
                .attr("y", 20)
                .attr("pointer-events", "none")
                .attr("font-family", "sans-serif")
                .attr("font-size", "20px")
                .attr("fill", "black")
                .text(function(d) {
                    return d.type;
                });

        },
        manifestdata: function() {

            var data = [];
            this.srcBloqs.forEach(function(datapoint) {
                data.push({
                    idx: datapoint.get('idx'),
                    type: datapoint.get('type')
                });
            });

            return data;

        },
        plotdata: function() {

            var data = [];
            this.compositionBloqs.forEach(function(datapoint) {
                data.push({
                    x: datapoint.get('meta').x,
                    y: datapoint.get('meta').y,
                    type: datapoint.get('type'),
                    id: datapoint.get('id')
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
        redraw: function(item, coll, o) {

            if (this.plotdata().length > 0) {
                this.plot({});
            }

        },
        plot: function(options) {

            // Copy these data to avoid closure issues below
            var w = this.w;
            var h = this.h;
            var box_w = this.box_w;
            var box_h = this.box_h;
            var data = this.plotdata();

            <!-- Drag Behavior -->
            var drag = d3.behavior.drag()
                // .origin(function(d) {
                //     console.log(d);
                //     return d;
                // })
                .on("drag", function(d) {
                    var musketeers = app.CompositionBloqs.findWhere({
                        id: d3.select(this).attr('id')
                    });
                    musketeers.set({
                        meta: {
                            x: d3.event.x,
                            y: d3.event.y
                        }
                    });
                    d3.select(this)
                        .attr("transform", "translate(" + d3.event.x + "," + d3.event.y + ")");
                });

            //var rect = this.stage_right.selectAll("rect")
            //       .data(data);

            // UPDATE
            // Update old elements as needed.
            //--

            // ENTER
            // Create new elements as needed.
            var r = d3.select('#composition-composite-svg')
                .select('#composition-stage-svg')
                .selectAll('g')
                .data(data);

            var g = r.enter().append("svg:g")
                .attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                })
                .attr("id", function(d) {
                    return d.id;
                })
                .call(drag);

            g.append("svg:rect")
                .attr("width", box_w)
                .attr("height", box_h)
                .attr("fill", "#A3B2C1");

            g.append("svg:text")
                .attr("x", 5)
                .attr("y", 15)
                .attr("pointer-events", "none")
                .attr("font-family", "sans-serif")
                .attr("font-size", "12px")
                .attr("fill", "black")
                .text(function(d) {
                    return d.id + ':' + d.type;
                });

            // ENTER + UPDATE
            // Appending to the enter selection expands the update selection to include
            // entering elements; so, operations on the update selection after appending to
            // the enter selection will apply to both entering and updating nodes.
            //--

            // EXIT
            // Remove old elements as needed.
            r.exit().remove();

        }
    });

    app.CompositonView = new CompositionView(app.SrcBloqs, app.CompositionBloqs, {});

})(jQuery);