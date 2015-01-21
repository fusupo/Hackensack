/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY */
var app = app || {};

(function($) {

    'use strict';

    var CompositionView = Backbone.View.extend({

        el: "#composition",

        initialize: function(srcBloqs, compositionBloqs, settings) {

            console.log('COMPOSITION VIEW INIT');

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

            this.currentSelectedBloq = undefined;

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
                .attr("id", "composition-stage-svg")
                .call(this.stageDragBehavior());
            //.call(zoom2);

            this.stage_right
                .append("svg:rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", r_w)
                .attr("height", win_h)
                .attr("fill", "#938475");

            this.stage_right.append("g")
                .attr({
                    "id": "composition-bloqs-group"
                });

            this.stage_right.append("g")
                .attr({
                    "id": "composition-lines-group"
                });

        },

        setBloqSelection: function(b) {

            d3.selectAll(".face").classed({
                "selected": false
            });

            if (b !== undefined) {

                this.trigger('bloqSelection', d3.select(b).datum().id);

                d3.select(b).select(".face").classed({
                    "selected": true
                });

            } else {
                this.trigger('bloqSelection', undefined);
            }

            this.currentSelectedBloq = b;


        },

        ////////////////////
        // DRAG BEHAVIORS //
        ////////////////////

        // STAGE DRAG BEHAVIOR
        stageDragBehavior: function() {

            var that = this;

            return d3.behavior.drag()
                .on("dragstart", function(d) {
                    that.setBloqSelection(undefined);
                    d3.event.sourceEvent.stopPropagation(); // silence other listeners
                });

        },

        // MANIFEST DRAG BEHAVIOR
        manifestDragBehavior: function() {

            var that = this;

            return d3.behavior.drag()
                .on("dragstart", function(d) {
                    d3.event.sourceEvent.stopPropagation(); // silence other listeners
                })
                .on("drag", function(d) {
                    d3.event.sourceEvent.stopPropagation(); // silence other listeners
                    that.manifestOnDrag(d, d3.event);
                })
                .on("dragend", function(d) {
                    d3.event.sourceEvent.stopPropagation(); // silence other listeners
                    that.manifestOnDragEnd(d, d3.event);
                });

        },

        // MANIFEST ON DRAG
        manifestOnDrag: function(evt, targ) {

            if (this.tempSrcBlock === null || this.tempSrcBlock === undefined) {

                this.tempSrcBlock = this.stage.append("svg:g");
                // drop shadow
                this.tempSrcBlock.append("svg:rect")
                    .attr({
                        "x": 1,
                        "y": 2,
                        "width": this.box_w,
                        "height": this.box_h,
                        "fill": "#435261",
                        'class': 'dropshadow'
                    });

                // face
                this.tempSrcBlock.append("svg:rect")
                    .attr({
                        "width": this.box_w,
                        "height": this.box_h,
                        "fill": "#A3B2C1"
                    })
                    .classed({
                        "face": true
                    });

                // this.tempSrcBlock.append("svg:text")
                //     .attr("y", 20)
                //     .attr("pointer-events", "none")
                //     .attr("font-family", "sans-serif")
                //     .attr("font-size", "20px")
                //     .attr("fill", "black")
                //     .text(function(d) {
                //         return d.type;
                //     });;

                console.log(targ);
            }

            this.tempSrcBlock.attr("transform", "translate(" + targ.x + "," + targ.y + ")");

        },

        // MANIFEST ON DRAG END
        manifestOnDragEnd: function(d, e) {

            var m = d3.mouse(this.stage_right[0][0]);

            if ((m[0] > 0) && (m[0] < (this.w))) {
                app.CompositionBloqs.add(new app.CompositionBloq({
                    id: "bloq-" + new Date().getTime(),
                    type: "rect",
                    meta: {
                        x: m[0],
                        y: m[1]
                    },
                    params: {
                        width: 50,
                        height: 50,
                        x: 10,
                        y: 20,
                        style: "fill: #ff0f67"
                    },
                    p: ["x"],
                    c: []
                }));
            }

            this.tempSrcBlock.remove();
            this.tempSrcBlock = null;

        },

        // BLOQ DRAG BEHAVIOR
        bloqDragBehavior: function() {

            var that = this;
            return d3.behavior.drag()
                .origin(function() {
                    var t = d3.select(this);
                    return {
                        x: t.attr("x") + d3.transform(t.attr("transform")).translate[0],
                        y: t.attr("y") + d3.transform(t.attr("transform")).translate[1]
                    };
                })
                .on("dragstart", function(d) {
                    that.setBloqSelection(this);
                    d3.event.sourceEvent.stopPropagation(); // silence other listeners
                })
                .on("drag", function(d) {
                    that.updateLines();
                    var bloqModel = app.CompositionBloqs.findWhere({
                        id: d3.select(this).attr('id')
                    });
                    bloqModel.set({
                        meta: {
                            x: d3.event.x,
                            y: d3.event.y
                        }
                    });
                    d3.select(this)
                        .attr("transform", "translate(" + d3.event.x + "," + d3.event.y + ")");
                });
        },

        // TERMINAL DRAG BEHAVIOR
        terminalDragBehavior: function() {

            var that = this;
            return d3.behavior.drag()
                .on("dragstart", function(d) {
                    d3.event.sourceEvent.stopPropagation(); // silence other listeners
                })
                .on("drag", function(d) {
                    d3.event.sourceEvent.stopPropagation(); // silence other listeners
                    //that.manifestDrag(d, d3.event);
                })
                .on("dragend", function(d) {
                    d3.event.sourceEvent.stopPropagation(); // silence other listeners
                    //that.manifestDragEnd(d, d3.event);
                });
        },

        ////////////////////////
        // END DRAG BEHAVIORS //
        ////////////////////////

        resetManifest: function() {

            var that = this;
            var w = this.w;
            var h = this.h;
            var box_w = this.box_w;
            var box_h = this.box_h;
            var data = this.manifestdata();

            var g = this.stage_left.selectAll()
                .data(data)
                .enter().append("svg:g")
                .attr("transform", function(d) {
                    return "translate(" + 50 + "," + (d.idx * 60) + ")";
                })
                .call(this.manifestDragBehavior());

            // g.append("svg:rect")
            //     .attr("width", 50)
            //     .attr("height", 50)
            //     .attr("fill", "#463810");

            // drop shadow
            g.append("svg:rect")
                .attr({
                    "x": 1,
                    "y": 2,
                    "width": box_w,
                    "height": box_h,
                    "fill": "#435261",
                    'class': 'dropshadow'
                });

            // face
            g.append("svg:rect")
                .attr({
                    "width": box_w,
                    "height": box_h,
                    "fill": "#A3B2C1"
                })
                .classed({
                    "face": true
                });

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

        ////////////////////////////////////
        // BEGIN DATA COMPOSITION METHODS //
        ////////////////////////////////////
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
                    id: datapoint.get('id'),
                    c: datapoint.get("c"), //['x', 'x'],
                    p: datapoint.get("p"), //['x']
                    params: datapoint.get("params")
                });
            });

            return data;

        },

        linesdata: function() {

            var terminal_pos = function(pref, term) {
                var r = $('#composition-stage-svg');
                var t = $('#composition-composite-svg ' +
                    '#composition-bloqs-group ' +
                    '#' + term[0] + ' ' +
                    '.term-' + pref + ' ' +
                    '.term-' + term[1]);
                var matrix = t[0].getTransformToElement(r[0]);
                var x = parseInt(t[0].getAttribute("x")) || 0;
                x += matrix.e + 5;
                var y = parseInt(t[0].getAttribute("y")) || 0;
                y += matrix.f + 5;
                return ([x, y]);
            };

            var data = [];

            app.CompositionBloqs.forEach(function(d) {
                var p = d.get("p");
                var id = d.get("id");
                if (p) {
                    _.each(p, function(targ_id, idx, l) {
                        if (targ_id !== "x") {
                            var c_term = [id, idx];
                            var targ_bloq = app.CompositionBloqs.findWhere({
                                "id": targ_id
                            });
                            var targ_idx = _.indexOf(targ_bloq.get("c"), id);
                            var p_term = [targ_id, targ_idx];
                            data.push([terminal_pos("p", c_term), terminal_pos("c", p_term)]);
                        }
                    });
                }
            });

            return data;

        },
        //////////////////////////////////
        // END DATA COMPOSITION METHODS //
        //////////////////////////////////

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
                this.lines();
            }

        },

        lines: function() {

            var data = this.linesdata();
            var r = d3.select('#composition-composite-svg')
                .select('#composition-lines-group')
                .selectAll('.composition-line')
                .data(data);

            r.enter().append("svg:line")
                .attr({
                    "x1": function(d, i) {
                        return d[0][0];
                    },
                    "y1": function(d, i) {
                        return d[0][1];
                    },
                    "x2": function(d, i) {
                        return d[1][0];
                    },
                    "y2": function(d, i) {
                        return d[1][1];
                    },
                    "stroke": "black",
                    "class": "composition-line"
                });

        },

        updateLines: function() {

            var data = this.linesdata();
            var r = d3.select('#composition-composite-svg')
                .select('#composition-lines-group')
                .selectAll('.composition-line')
                .data(data);

            r.attr({
                "x1": function(d, i) {
                    return d[0][0];
                },
                "y1": function(d, i) {
                    return d[0][1];
                },
                "x2": function(d, i) {
                    return d[1][0];
                },
                "y2": function(d, i) {
                    return d[1][1];
                }
            });

        },

        plot: function(options) {

            var that = this;

            // Copy these data to avoid closure issues below
            var w = this.w;
            var h = this.h;
            var box_w = this.box_w;
            var box_h = this.box_h;
            var data = this.plotdata();

            //var rect = this.stage_right.selectAll("rect")
            //       .data(data);

            // UPDATE
            // Update old elements as needed.
            //--

            // ENTER
            // Create new elements as needed.
            var r = d3.select('#composition-composite-svg')
                .select('#composition-bloqs-group')
                .selectAll('.composition_bloq')
                .data(data);

            var g = r.enter().append("svg:g")
                .attr({
                    "transform": function(d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    },
                    "id": function(d) {
                        return d.id;
                    },
                    "class": "composition_bloq"
                })
                .call(this.bloqDragBehavior());

            // drop shadow
            g.append("svg:rect")
                .attr({
                    "x": 1,
                    "y": 2,
                    "width": box_w,
                    "height": box_h,
                    "fill": "#435261",
                    'class': 'dropshadow'
                });

            // face
            g.append("svg:rect")
                .attr({
                    "width": box_w,
                    "height": box_h,
                    "fill": "#A3B2C1"
                })
                .classed({
                    "face": true
                });

            //  These are the terminals

            //  First the terminals to childnodes (left side)
            var c = g.append("svg:g")
                .attr({
                    "class": "term-c",
                    "transform": "translate(-10, 0)"
                })
                .selectAll('.term')
                .data(function(d) {
                    return d.c;
                });

            c.enter().append("svg:rect")
                .attr({
                    y: function(d, i) {
                        return 12 * i;
                    },
                    width: 10,
                    height: 10,
                    fill: "#333333",
                    class: function(d, i) {
                        return "term-" + i;
                    }
                })
                .call(this.terminalDragBehavior());

            // then the terminals to parent node(s) (right sidw)
            var p = g.append("svg:g")
                .attr({
                    "class": "term-p",
                    "transform": "translate(" + box_w + ", 0)"
                })
                .selectAll('.term')
                .data(function(d) {
                    return d.p;
                });

            p.enter().append("svg:rect")
                .attr({
                    y: function(d, i) {
                        return 12 * i;
                    },
                    width: 10,
                    height: 10,
                    fill: "#333333",
                    class: function(d, i) {
                        return "term-" + i;
                    }
                })
                .call(this.terminalDragBehavior());

            //

            // label
            g.append("svg:text")
                .attr({
                    "x": 5,
                    "y": 15,
                    "pointer-events": "none",
                    "font-family": "sans-serif",
                    "font-size": "12px",
                    "fill": "black"
                })
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

    app.CompositionView = new CompositionView(app.SrcBloqs, app.CompositionBloqs, {});

})(jQuery);