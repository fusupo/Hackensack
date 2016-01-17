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
      this.listenTo(this.compositionBloqs, 'add', this.addBloq);
      this.listenTo(compositionBloqs, 'remove', this.removeBloq);
      this.listenTo(compositionBloqs, 'change:connected', this.addConnection);
      this.listenTo(compositionBloqs, 'change:disconnected', this.removeConnection);
      this.listenTo(compositionBloqs, 'reloaded', this.onReloaded);

      this.listenTo(compositionBloqs, 'change:terminals', (function(m, v, o) {
        this.stage.resetNodeTerms(m.toJSON()['id']);
      }).bind(this));

      this.listenTo(compositionBloqs, 'term:add', (function(id, idx) {
        this.stage.addTerm(id[0], 'i');
      }).bind(this));

      this.listenTo(compositionBloqs, 'term:rem', (function(id, idx) {
        this.stage.remTerm(id[0], 'i', id[1]);
      }).bind(this));

      this.listenTo(compositionBloqs, 'reset', this.resetComposition);

      this.settings = settings || {};
      this.currentSelectedBloq = undefined;
      this.mouseLine = undefined;
      this.zoom_scale = 1;

      this.linesData = [];
      this.bloqData = [];
    },

    finalizeInitialization: function() {

      var divname = 'composition';

      this.w = this.settings.w || parseInt(this.$el.width());
      this.h = this.settings.h || parseInt(this.$el.height());
      this.box_w = this.settings.box_w || 100;
      this.box_h = this.settings.box_h || 40;

      var stage = new hacsac.Stage(divname, this.w, this.h);
      this.stage = stage;

      this.$el.droppable({
        drop: (function(event, ui) {
          var contPos = this.$el.position();
          var stageOffset = $(stage.xxx).offset();
          var offset_x = (contPos.left - stageOffset.left);
          var offset_y = (contPos.top - stageOffset.top);
          var targ_x = ui['offset']['left'] + offset_x - 150;
          var targ_y = ui['offset']['top'] + offset_y;
          var type = ui.draggable.data('type');
          app.CompositionBloqs.newBloq(type, [targ_x, targ_y]);
        }).bind(this)
      });

      stage.$el.on('mousedown:block:body', (function(e, id) {
        this.setBlockSelection(id);
      }).bind(this));

      stage.$el.on('mouseup:block:body', (function(e, id, x, y) {
        app.CompositionBloqs.updateMeta(id, {
          'x': x,
          'y': y
        });
      }).bind(this));

      stage.$el.on('mousedrag:block:body', function(e, id, x, y) {
        // app.CompositionBloqs.updateMeta(id, {
        //   'x': x,
        //   'y': y
        // });
      });

      stage.$el.on('mousedown:block:close', function(e, id) {
        app.CompositionBloqs.deleteBloq(id);
      });

      stage.$el.on('mousedown:stage:bg', (function(e) {
        this.setBlockSelection(undefined);
      }).bind(this));

      stage.$el.on('try:terminal:connect', function(e, id1, idx1, id2, idx2) {
        app.CompositionBloqs.addConnection([id1, 'p', idx1], [id2, 'c', idx2]);
      });

      stage.$el.on('try:terminal:disconnect', function(e, id1, idx1, id2, idx2) {
        app.CompositionBloqs.disconnect([id1, 'p', idx1]); //, [id2, 'c', idx2]);
      });
    },

    resetComposition: function() {
      this.stage.reset();
    },

    onReloaded: function(rootNode){
      var addNodes = (function(node){
        this.addBloq(node);
        var kids = node.getChildNodes();
        _.each(kids, function(kid, idx){
          if(kid !== 'x'){
            addNodes(kid);
            this.addConnection([[kid.get_id(), 'p', 0],[node.get_id(), 'c', idx]]);
          }
        }, this);
      }).bind(this);
      addNodes(rootNode);
    },

    setBlockSelection: function(id) {
      if (this.currSelectedBloq && this.currSelectedBloq !== id) {
        this.stage.removeNodeClass(this.currSelectedBloq, 'selected');
      }
      if (id) {
        this.stage.addNodeClass(id, 'selected');
      }
      this.currSelectedBloq = id;
      this.trigger('bloqSelection', id);
    },

    addBloq: function(d, coll, o) {
      var datapoint = d.toJSON();
      var id = datapoint['id'];
      this.stage.addNode(id, datapoint['type'], datapoint['meta'].x, datapoint['meta'].y);
      _.each(datapoint['c'], function(t) {
        this.stage.addTerm(id, 'i');
      }, this);
      _.each(datapoint['p'], function(t) {
        this.stage.addTerm(id, 'o');
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
            var this_term = [b.id, 'p', idx];
            var other_term = app.CompositionBloqs.getConnectedTerm(this_term);
            if (other_term !== 'x') {
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
