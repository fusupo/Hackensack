var SrcBloqs = Backbone.Collection.extend({
  model: app.SrcBloq,
  localStorage: new Backbone.LocalStorage('bloqs-backbone')
});
