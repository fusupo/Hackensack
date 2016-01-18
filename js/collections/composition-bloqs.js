  'use strict';
var Backbone = require('backbone');
// ------------------------------- //
//  Compositon Bloqs Collection    //
// ------------------------------- //
module.exports = Backbone.Collection.extend({
  // Reference to this collection's model.
  model: app.BloqsnetModel,
  surpressEvents: false,
  initialize: function() {
    var that = this;
    app.vm = bloqsnet.gimmeTheThing({
      "add": (function(bloq) {
        if(!this.surpressEvents) this.trigger("add", bloq);
      }).bind(this),
      "remove": (function(m) {
        if(!this.surpressEvents) this.trigger("remove", m);
      }).bind(this),
      "reset": (function(root) {
        if(!this.surpressEvents) this.trigger("reset", root);
      }).bind(this),
      "change:terminals": (function(m, v, o) {
        if(!this.surpressEvents) this.trigger("change:terminals", m);
      }).bind(this),
      // "term:add": function(m) {
      //     that.trigger("term:add", m);
      // },
      // "term:rem": function(m) {
      //     that.trigger("term:rem", m);
      // },
      "change:connected": (function(m, v, o) {
        if(!this.surpressEvents) this.trigger("change:connected", m);
      }).bind(this),
      "change:disconnected": (function(m, v, o) {
        if(!this.surpressEvents) this.trigger("change:disconnected", m);
      }).bind(this),
      //"change:[attribute]" (model, value, options) — when a specific attribute has been updated.
      //"invalid" (model, error, options) — when a model's validation fails on the client.
      "change:svg": (function(m, v, o) {
        if(!this.surpressEvents) this.trigger("change:svg", m);
      }).bind(this),
      "change:meta": (function(m, v, o){
        if(!this.surpressEvents) this.trigger("change:meta", m);
      }).bind(this)
    });
  },

  reload: function(data) {
    this.reset();
    this.surpressEvents = true;
    //assuming there is a root
    var r = _.findWhere(data, {
      type: 'root'
    });
    app.vm.crt(data, r.id);
    this.surpressEvents = false;
    this.trigger('reloaded', this.getBloq(this.getRootId()));
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
