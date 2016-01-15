/*global Backbone */
var app = app || {};

(function($) {
  'use strict';
  var SrcBloqs = Backbone.Collection.extend({
    model: app.SrcBloq,
    localStorage: new Backbone.LocalStorage('bloqs-backbone')
  });
  app.SrcBloqs = new SrcBloqs();
})(jQuery);
