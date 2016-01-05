/*global Backbone */
var app = app || {};

(function($) {

  'use strict';

  // ------------------------------- //
  //  Compositon Bloqs Collection    //
  // ------------------------------- //

  var CompositionBloqs = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: app.BloqsnetModel,

    initialize: function() {
      var that = this;
      app.vm = bloqsnet.gimmeTheThing({
        "add": function(bloq) {
          that.trigger("add", bloq);
        },
        "remove": function(m) {
          that.trigger("remove", m);
        },
        "reset": function(root) {
          that.trigger("reset", root);
        },
        "change:terminals": function(m, v, o) {
          that.trigger("change:terminals", m);
        },
        // "term:add": function(m) {
        //     that.trigger("term:add", m);
        // },
        // "term:rem": function(m) {
        //     that.trigger("term:rem", m);
        // },
        "change:connected": function(m, v, o) {
          that.trigger("change:connected", m);
        },
        "change:disconnected": function(m, v, o) {
          that.trigger("change:disconnected", m);
        },
        //"change:[attribute]" (model, value, options) — when a specific attribute has been updated.
        //"invalid" (model, error, options) — when a model's validation fails on the client.
        "change:svg": function(m, v, o) {
          that.trigger("change:svg", m);
        },
        "change:meta": function(m, v, o){
          that.trigger("change:meta", m);
        }
      });
    },

    reload: function(data) {
      this.reset();
      //assuming there is a root
      var r = _.findWhere(data, {
        type: 'root'
      });
      app.vm.crt(data, r.id);
    },

    reset: function(){
      app.vm.rst();
    },

    get_svg: function(id) {
      return app.vm.get_svg(id);
    },

    newBloq: function(type, pos) {
      app.vm.add(type, pos);
    },

    updateParam: function(bloq_id, param_name, val) {
      return app.vm.updt_par(bloq_id, param_name, val);
    },

    setParam: function(bloq_id, param_name, val){
      app.vm.set_par(bloq_id, param_name, val);      
    },

    disconnect: function(term, silent) {
      app.vm.dscon(term);
    },

    getConnectedTerm: function(term) {
      return app.vm.getConnectedTerm(term);
    },

    addConnection: function(a, b) {
      app.vm.con(a, b);
    },

    deleteBloq: function(id) {
      app.vm.rem(id);
      //this.refreshTerminals();
    },

    //        refreshTerminals: function() {
    //            app.vm.rst_trm();
    //        },

    getBloqs: function() {
      return app.vm.insts;
    },

    getBloq: function(id) {
      return app.vm.get(id);
    },

    getRootId:function(){
      var r = _.find(app.vm.insts, function(inst){
        return inst.spec.type === 'root';
      });
      return r.spec.id;
    },

    updateMeta: function(id, data) {
      _.each(data, function(v, k) {
        app.vm.updt_mta(id, k, v);
      });
    }
  });

  app.CompositionBloqs = new CompositionBloqs();

})(jQuery);
