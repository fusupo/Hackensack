'use strict';
var $ = require('jquery');
var Backbone = require('backbone');
var SrcBloq = require('../model/src-bloq.js');
var SrcBloqs = require('../collections/src-bloqs.js');
var CompositionBloqs = require('../collections/composition-bloqs.js');
var ManifestView = require('./manifest-view.js');
var CompositionView = require('./composition-view.js');
var ParamsView = require('./params-view.js');
var RenderView = require('./render-view.js');
var IOSpecView = require('./spec-io-view.js');
var IOSVGView = require('./svg-io-view.js');
var EnvView = require('./env-view.js');

module.exports = Backbone.View.extend({
  // Instead of generating a new element, bind to the existing skeleton of
  // the App already present in the HTML.
  el: '#app',
  initialize: function() {
    app.SrcBloqs = new SrcBloqs();
    app.CompositionBloqs = new CompositionBloqs();
    app.ManifestView = new ManifestView(app.SrcBloqs, {});
    app.CompositionView = new CompositionView(app.CompositionBloqs, {});
    app.ParamsView = new ParamsView();
    app.RenderView = new RenderView();
    app.IOSpecView = new IOSpecView();
    app.IOSVGView = new IOSVGView();
    app.EnvView = new EnvView();

    console.log('APP VIEW INIT');

    app.ManifestView.finalizeInitialization();
    app.CompositionView.finalizeInitialization();
    app.ParamsView.finalizeInitialization();

    $('#tabs').tabs({
      heightStyle: 'fill'
    });

    app.IOSpecView.finalizeInitialization();
    app.IOSVGView.finalizeInitialization();
    app.RenderView.finalizeInitialization();
    app.EnvView.finalizeInitialization();

    app.SrcBloqs.reset(_.map(_.filter(bloqsnet.REGISTRY, function(r) {
      return r.prototype.def.display;
    }), function(v, k) {
      var idx = k;
      var type = v.prototype.def.type;
      return new SrcBloq({
        idx: idx,
        type: type
      });
    }));
  }
});
