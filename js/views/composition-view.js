/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY */
var app = app || {};

(function($) {
  //foo
  'use strict';

  var CompositionView = Backbone.View.extend({

    el: '#composition',

    initialize: function(compositionBloqs, settings) {

      console.log('COMPOSITION VIEW INIT');

      this.compositionBloqs = compositionBloqs;
      var that = this;
      this.listenTo(this.compositionBloqs, 'add', this.addBloq);
      this.listenTo(compositionBloqs, 'remove', this.removeBloq);
      this.listenTo(compositionBloqs, 'change:connected', this.addConnection);
      this.listenTo(compositionBloqs, 'change:disconnected', this.removeConnection);
      this.listenTo(compositionBloqs, 'change:terminals', function(m, v, o) {
        console.log("CHANG TERMINAL" + m.toJSON()['id']);
        that.stage.resetNodeTerms(m.toJSON()['id']);
        //addterm
      }); //this.resetTerms);

      this.listenTo(compositionBloqs, 'term:add', function(id, idx) {
        console.log('ADDTERM: ' + id[0]);
        that.stage.addTerm(id[0], 'i');
      });

      this.listenTo(compositionBloqs, 'term:rem', function(id, idx) {
        console.log('REMTERM: ' + id[0]);
        that.stage.remTerm(id[0], 'i', id[1]);
      });

      // this.listenTo(compositionBloqs, 'reset', this.resetComposition);

      this.settings = settings || {};
      this.currentSelectedBloq = undefined;
      this.mouseLine = undefined;
      this.zoom_scale = 1;

      // app.CompositionBloqs.on("all", function(f, r, j) {
      //     console.log(f, r);
      //     // console.log(r);
      //     // console.log(j);
      // });

      this.linesData = [];
      this.bloqData = [];
    },

    finalizeInitialization: function() {

      var divname = "composition";

      this.w = this.settings.w || parseInt(this.$el.width());
      this.h = this.settings.h || parseInt(this.$el.height());
      this.box_w = this.settings.box_w || 100;
      this.box_h = this.settings.box_h || 40;

      var stage = new hacsac.Stage(divname, this.w, this.h);
      this.stage = stage;

      var that = this;
      this.$el.droppable({
        drop: function(event, ui) {

          var contPos = that.$el.position();
          var stageOffset = $(stage.xxx).offset();
          var offset_x = (contPos.left - stageOffset.left);
          var offset_y = (contPos.top - stageOffset.top);
          var targ_x = ui['offset']['left'] + offset_x - 150;
          var targ_y = ui['offset']['top'] + offset_y;

          var type = ui.draggable.data('type');

          app.CompositionBloqs.newBloq(type, [targ_x, targ_y]);

          console.log(type);
        }
      });

      stage.$el.on("mousedown:block:body", function(e, id) {
        that.setBlockSelection(id);
      });

      stage.$el.on("mousedrag:block:body", function(e, id, x, y){
        app.CompositionBloqs.updateMeta(id, {"x":x,"y":y});
      });

      stage.$el.on("mousedown:block:close", function(e, id) {
        app.CompositionBloqs.deleteBloq(id);
      });

      stage.$el.on("mousedown:stage:bg", function(e) {
        that.setBlockSelection(undefined);
      });

      stage.$el.on("try:terminal:connect", function(e, id1, idx1, id2, idx2) {
        app.CompositionBloqs.addConnection([id1, "p", idx1], [id2, "c", idx2]);
      });

      stage.$el.on("try:terminal:disconnect", function(e, id1, idx1, id2, idx2) {
        app.CompositionBloqs.disconnect([id1, "p", idx1]); //, [id2, "c", idx2]);
      });
    },

    setBlockSelection: function(id) {

      this.trigger("bloqSelection", id);

      // d3.selectAll(".face").classed({
      //     "selected": false
      // });

      // if (b !== undefined) {
      //     this.trigger('bloqSelection', d3.select(b).datum().id);
      //     d3.select(b).select(".face").classed({
      //         "selected": true
      //     });
      // } else {
      //     this.trigger('bloqSelection', undefined);
      // }

      // this.currentSelectedBloq = b;

    },

    addBloq: function(d, coll, o) {
      var datapoint = d.toJSON();
      // this.bloqData.push({
      //     x: datapoint['meta'].x,
      //     y: datapoint['meta'].y,
      //     type: datapoint['type'],
      //     id: datapoint['id'],
      //     c: datapoint["c"], 
      //     p: datapoint["p"],
      //     params: datapoint["params"]
      // });
      var id = datapoint['id'];
      this.stage.addNode(id, datapoint['type'], datapoint['meta'].x, datapoint['meta'].y);
      _.each(datapoint["c"], function(t) {
        this.stage.addTerm(id, "i");
      }, this);
      _.each(datapoint["p"], function(t) {
        this.stage.addTerm(id, "o");
      }, this);
    },

    removeBloq: function(id) {
      this.stage.removeNode(id);
    },

    addConnection: function(e) {

      console.log('CONNECT -- ' + e);
      this.stage.connect(e[0][0], e[0][2], e[1][0], e[1][2]);

    },

    removeConnection: function(e) {

      console.log('DISCONNECT -- ' + e);
      // this.stage.remTerm(e[0],e[1] == 'p' ? 'o' : 'i',e[2]);

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

    closeButtBehavior: function() {
      var that = this;
      return d3.behavior.drag()
        .on("dragstart", function(d) {
          app.CompositionBloqs.deleteBloq(d.id);
          d3.event.sourceEvent.stopPropagation(); // silence other listeners
        });
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
          var mouse_pos = d3.mouse(that.stage_right[0][0]);
          that.mouseLine = mouse_terms[0] !== "x" ? that.terminalPos(mouse_terms[0]) : mouse_pos;
          that.mouseLine = that.mouseLine.concat(mouse_terms[1] !== "x" ? that.terminalPos(mouse_terms[1]) : mouse_pos);
          var selection = d3.select('#composition-lines-group')
                .selectAll('.mouse-line');
          var r = selection.data([that.mouseLine]);
          r.enter().append("svg:line")
            .attr({
              "x1": function(d, i) {
                return d[0];
              },
              "y1": function(d, i) {
                return d[1];
              },
              "x2": function(d, i) {
                return d[2];
              },
              "y2": function(d, i) {
                return d[3];
              },
              "stroke": "black",
              "class": "mouse-line",
              "ponter-events": "none",
              "id": "mouse-line"
            });
          d3.event.sourceEvent.stopPropagation(); // silence other listeners
        })
        .on("drag", function(d) {
          var mouse_pos = d3.mouse(that.stage_right[0][0]);
          that.mouseLine = [
            mouse_terms[0] !== "x" ? that.terminalPos(mouse_terms[0]) : mouse_pos,
            mouse_terms[1] !== "x" ? that.terminalPos(mouse_terms[1]) : mouse_pos
          ];
          var mouse_pos = d3.mouse(that.stage_right[0][0]);
          that.mouseLine = mouse_terms[0] !== "x" ? that.terminalPos(mouse_terms[0]) : mouse_pos;
          that.mouseLine = that.mouseLine.concat(mouse_terms[1] !== "x" ? that.terminalPos(mouse_terms[1]) : mouse_pos);

          var selection = d3.select('#composition-lines-group')
                .selectAll('.mouse-line');
          var r = selection.data([that.mouseLine]);
          r.attr({
            "x1": function(d, i) {
              return d[0];
            },
            "y1": function(d, i) {
              return d[1];
            },
            "x2": function(d, i) {
              return d[2];
            },
            "y2": function(d, i) {
              return d[3];
            }
          });
          //

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

          var selection = d3.select('#composition-lines-group')
                .selectAll('.mouse-line');
          var r = selection.data([]);
          r.exit().remove();

          //that.resetLinesData();
          //that.linesToo();

          d3.event.sourceEvent.stopPropagation(); // silence other listeners
        });

    },

    ////////////////////////
    // END DRAG BEHAVIORS //
    ////////////////////////

    ////////////////////////////////////
    // BEGIN DATA COMPOSITION METHODS //
    ////////////////////////////////////



    resetLinesData: function() {
      var bar_terms = [];
      var bloqs = this.compositionBloqs.getBloqs();
      _.each(bloqs, function(b) {
        b = b.toJSON();
        var p = b.p;
        if (p !== undefined) {
          _.each(p, function(targ_id, idx, l) {
            var this_term = [b.id, "p", idx];
            var other_term = app.CompositionBloqs.getConnectedTerm(this_term);
            if (other_term !== "x") {
              var bar_term = this_term.concat(this.terminalPos(this_term));
              bar_term = bar_term.concat(other_term.concat(this.terminalPos(other_term)));
              bar_terms.push(bar_term);
            }
          }, this);
        }
      }, this);

      this.linesData = bar_terms;
    },

    //////////////////////////////////
    // END DATA COMPOSITION METHODS //
    //////////////////////////////////




  });

  app.CompositionView = new CompositionView(app.CompositionBloqs, {});

})(jQuery);
