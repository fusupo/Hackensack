'use strict';
var Backbone = require('backbone');
var SrcBloq = require('../model/src-bloq.js');
module.exports = Backbone.Collection.extend({
  model: SrcBloq,
  //localStorage: new Backbone.LocalStorage('bloqs-backbone')
});
