var app = app || {};

(function($) {

    'use strict';

    app.AppView = Backbone.View.extend({

        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        el: '#app',
        initialize: function() {

            console.log('APP VIEW INIT');

            $('#myLayoutA').w2layout({
                name: 'myLayoutA',
                panels: [{
                    type: 'main',
                    content: app.CompositionView.el
                }, {
                    type: 'right',
                    size: "30%",
                    resizable: true,
                    content: app.ParamsView.el
                }]
            });

            $('#myLayoutB').w2layout({
                name: 'myLayoutB',
                panels: [{
                    type: 'left',
                    size: "33%",
                    resizable: true,
                    content: $('#tabs')
                }, {
                    type: 'main',
                    content: app.RenderView.el
                }, {
                    type: 'right',
                    size: "15%",
                    resizable: true,
                    content: app.EnvView.el
                }],
                onRender: function(event) {

                }
            });

            app.CompositionView.finalizeInitialization();
            app.ParamsView.finalizeInitialization();

            $("#tabs").tabs();

            app.IOSpecView.finalizeInitialization();
            app.IOSVGView.finalizeInitialization();
            app.RenderView.finalizeInitialization();
            app.EnvView.finalizeInitialization();

            app.SrcBloqs.reset(_.map(_.filter(bloqsnet.REGISTRY, function(r) {
                return r.prototype.def.display;
            }), function(v, k) {
                return new app.SrcBloq({
                    idx: k,
                    type: v.prototype.def.type
                });
            }));
        }

    });

})(jQuery);