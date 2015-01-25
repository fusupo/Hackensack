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
            this.listenTo(compositionBloqs, 'change change:p', this.redraw);
            this.listenTo(compositionBloqs, 'remove', this.redraw);
            this.listenTo(compositionBloqs, 'reset', this.redraw);

            this.settings = settings || {};

            var divname = this.settings.div || this.el;
            this.div = d3.select(divname);

            this.w = settings.w || parseInt(this.div.style("width"));
            this.h = settings.h || parseInt(this.div.style("height"));
            this.box_w = settings.box_w || 100;
            this.box_h = settings.box_h || 40;

            this.currentSelectedBloq = undefined;
            this.mouseLine = undefined;

            this.setupD3();

            app.CompositionBloqs.on("all", function(f) {
                console.log(f);
            });
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
                    console.log("dragstart");
                    d3.event.sourceEvent.stopPropagation(); // silence other listeners
                })
                .on("drag", function(d) {
                    console.log("drag");
                    d3.event.sourceEvent.stopPropagation(); // silence other listeners
                    //that.manifestOnDrag(d, d3.event);
                    if (that.tempSrcBloq === null || that.tempSrcBloq === undefined) {

                        that.tempSrcBloq = that.stage.append("svg:g");

                        that.d3Bloq(that.tempSrcBloq, that.box_w, that.box_h);

                        // label
                        // g.append("svg:text")
                        //     .attr("y", 20)
                        //     .attr("pointer-events", "none")
                        //     .attr("font-family", "sans-serif")
                        //     .attr("font-size", "20px")
                        //     .attr("fill", "black")
                        //     .text(function(d) {
                        //         return d.type;
                        //     });

                    }

                    that.tempSrcBloq.attr("transform", "translate(" + d3.event.x + "," + d3.event.y + ")");
                })
                .on("dragend", function(d) {
                    d3.event.sourceEvent.stopPropagation(); // silence other listeners
                    //that.manifestOnDragEnd(d, d3.event);
                    var m = d3.mouse(that.stage_right[0][0]);

                    if ((m[0] > 0) && (m[0] < (that.w))) {
                        app.CompositionBloqs.newBloq(d.type, [m[0], m[1]]);
                    }

                    that.tempSrcBloq.remove();
                    that.tempSrcBloq = null;
                });

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
                    //that.updateLines();
                    that.lines();
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

        closeButtBehavior: function() {

            var that = this;
            return d3.behavior.drag()
                .on("dragstart", function(d) {
                    app.CompositionBloqs.deleteBloq(d.id);
                    d3.event.sourceEvent.stopPropagation(); // silence other listeners
                });
        },

        hitTestTerms: function(point) {

            var r = $('#composition-stage-svg');
            var hit = undefined;
            d3.selectAll('.term').each(function(d, i) {

                var matrix = this.getTransformToElement(r[0]);
                var x = parseInt(this.getAttribute("x")) || 0;
                x += matrix.e; // + 5;
                var y = parseInt(this.getAttribute("y")) || 0;
                y += matrix.f; // + 5;

                if (point[0] > x &&
                    point[0] < (x + 10) &&
                    point[1] > y &&
                    point[1] < (y + 10)) {
                    hit = d;
                }
            });

            return hit;

        },

        // TERMINAL DRAG BEHAVIOR
        terminalDragBehavior: function() {

            var that = this;
            var mouse_terms;

            return d3.behavior.drag()
                .on("dragstart", function(d) {

                    var other = app.CompositionBloqs.getConnectedTerm(d);
                    mouse_terms = other === "x" ? [d, "x"] : [other, "x"];
                    app.CompositionBloqs.disconnect(d);
                    //that.removeLines();
                    var mouse_pos = d3.mouse(that.stage_right[0][0]);
                    that.mouseLine = [
                        mouse_terms[0] !== "x" ? that.terminalPos(mouse_terms[0]) : mouse_pos,
                        mouse_terms[1] !== "x" ? that.terminalPos(mouse_terms[1]) : mouse_pos
                    ];
                    that.lines();
                    //that.updateLines();
                    d3.event.sourceEvent.stopPropagation(); // silence other listeners
                })
                .on("drag", function(d) {
                    var mouse_pos = d3.mouse(that.stage_right[0][0]);
                    that.mouseLine = [
                        mouse_terms[0] !== "x" ? that.terminalPos(mouse_terms[0]) : mouse_pos,
                        mouse_terms[1] !== "x" ? that.terminalPos(mouse_terms[1]) : mouse_pos
                    ];
                    //that.updateLines();
                    that.lines();
                    d3.event.sourceEvent.stopPropagation(); // silence other listeners
                    //that.manifestDrag(d, d3.event);
                })
                .on("dragend", function(d, e, f) {
                    var mouse_pos = d3.mouse(that.stage_right[0][0]);
                    that.mouseLine = undefined;
                    var hit = that.hitTestTerms(mouse_pos);
                    if (hit !== undefined) {
                        app.CompositionBloqs.addConnection(mouse_terms[0], hit);
                    }
                    app.CompositionBloqs.refreshTerminals();
                    that.redraw();
                    d3.event.sourceEvent.stopPropagation(); // silence other listeners
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

            this.d3Bloq(g, box_w, box_h);

            // label
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

        terminalPos: function(term) {

            var r = $('#composition-stage-svg');
            var t = $('#composition-composite-svg ' +
                '#composition-bloqs-group ' +
                '#' + term[0] + ' ' +
                '.term-' + term[1] + ' ' +
                '.term-' + term[2]);
            var matrix = t[0].getTransformToElement(r[0]);
            var x = parseInt(t[0].getAttribute("x")) || 0;
            x += matrix.e + 5;
            var y = parseInt(t[0].getAttribute("y")) || 0;
            y += matrix.f + 5;

            return ([x, y]);

        },

        linesdata: function() {

            var edge_terms = [];
            app.CompositionBloqs.forEach(function(b) {
                var p = b.get("p");
                if (p !== undefined) {
                    _.each(p, function(targ_id, idx, l) {
                        var this_term = [b.id, "p", idx];
                        var other_term = app.CompositionBloqs.getConnectedTerm(this_term);
                        if (other_term !== "x") {
                            edge_terms.push([this_term, other_term]);
                        }
                    });
                }
            });

            var edge_coords = _.map(edge_terms, function(edge_term) {
                return [
                    this.terminalPos(edge_term[0]),
                    this.terminalPos(edge_term[1])
                ];
            }, this);

            if (this.mouseLine !== undefined) {
                edge_coords.push(this.mouseLine);
            }

            return edge_coords;

        },
        //////////////////////////////////
        // END DATA COMPOSITION METHODS //
        //////////////////////////////////

        redraw: function(item, coll, o) {

            //if (this.plotdata().length > 0) {
            this.plot({});
            this.lines();
            //}

        },

        lines: function() {

            var data = this.linesdata();
            var r = d3.select('#composition-lines-group')
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
                    "class": "composition-line",
                    "ponter-events": "none"
                });

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


            r.exit().remove();
        },

        plot: function(options) {

            var that = this;

            // Copy these data to avoid closure issues below
            var w = this.w;
            var h = this.h;
            var box_w = this.box_w;
            var box_h = this.box_h;
            var data = this.plotdata();

            // UPDATE
            // Update old elements as needed.
            //--

            // ENTER
            // Create new elements as needed.
            var r = d3.select('#composition-bloqs-group')
                .selectAll('.composition_bloq')
                .data(data, function(d) {
                    return d.id + d.p.concat(d.c).join();
                });

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

            this.d3Bloq(g, box_w, box_h);
            this.d3Terminals(g, "c", -10);
            this.d3Terminals(g, "p", box_w);
            this.d3CloseButt(g, box_w - 15, 5);

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

        },

        //  RENDER HELPERS  //

        d3DropShadow: function(sel, w, h) {

            sel.append("svg:rect")
                .attr({
                    "x": 1,
                    "y": 2,
                    "width": w,
                    "height": h,
                    "fill": "#435261",
                    'class': 'dropshadow'
                });

        },

        d3Face: function(sel, w, h) {

            sel.append("svg:rect")
                .attr({
                    "width": w,
                    "height": h,
                    "fill": "#A3B2C1"
                })
                .classed({
                    "face": true
                });

        },

        d3Bloq: function(sel, w, h) {
            this.d3DropShadow(sel, w, h);
            this.d3Face(sel, w, h);
        },

        d3CloseButt: function(sel, x, y) {
            // sel is presumably <g>
            var g = sel.append("svg:g")
                .attr("transform", "translate(" + x + ", " + y + ")");
            g.append("svg:rect")
                .attr({
                    "width": 10,
                    "height": 10,
                    "fill": "#cccccc"
                })
                .call(this.closeButtBehavior());
        },

        d3Terminals: function(sel, side, x) {

            var t = sel.append("svg:g")
                .attr({
                    "class": "term-" + side,
                    "transform": "translate(" + x + ", 0)"
                });

            var u = t.selectAll('.term')
                .data(function(d) {
                    return _.map(d[side], function(u, idx) {
                        return [d.id, side, idx];
                    });
                });

            u.enter().append("svg:rect")
                .attr({
                    y: function(d, i) {
                        return 12 * i;
                    },
                    width: 10,
                    height: 10,
                    fill: "#333333",
                    class: function(d, i) {
                        return "term term-" + i;
                    }
                })
                .call(this.terminalDragBehavior());

            //d3.selectAll(".term-c").exit().remove();
            u.exit().remove();
        }
    });

    app.CompositionView = new CompositionView(app.SrcBloqs, app.CompositionBloqs, {});

})(jQuery);