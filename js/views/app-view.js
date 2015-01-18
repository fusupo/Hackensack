var app = app || {};

(function($) {

    'use strict';

    app.AppView = Backbone.View.extend({

        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        el: '#app',
        initialize: function() {

            app.SrcBloqs.reset(_.map(BLOQS_MANIFEST, function(v, k) {
                return new app.SrcBloq({
                    idx: k,
                    name: v
                });
            }));

            var test_composition_bloqs = [
                new app.CompositionBloq({
                    x: 100,
                    y: 6,
                    id: "bloq-001"
                }),
                new app.CompositionBloq({
                    x: 2,
                    y: 4,
                    id: "bloq-002"
                }),
                new app.CompositionBloq({
                    x: 3,
                    y: 2,
                    id: "bloq-003"
                }),
                new app.CompositionBloq({
                    x: 4,
                    y: 4,
                    id: "bloq-004"
                }),
                new app.CompositionBloq({
                    x: 5,
                    y: 6,
                    id: "bloq-005"
                })
            ];

            //            app.CompositionBloqs.reset(test_composition_bloqs);
            _.map(test_composition_bloqs, function(x) {
                app.CompositionBloqs.add(x);
            });
        }

    });

})(jQuery);