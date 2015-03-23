var app = app || {};

(function($) {

    'use strict';

    app.AppView = Backbone.View.extend({


        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        el: '#app',
        initialize: function() {

            console.log('APP VIEW INIT');

            app.ManifestView.finalizeInitialization();
            app.CompositionView.finalizeInitialization();
            app.ParamsView.finalizeInitialization();

            $("#tabs").tabs({
                heightStyle: "fill"
            });

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
