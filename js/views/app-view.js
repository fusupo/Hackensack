var app = app || {};

(function($) {

    'use strict';

    app.AppView = Backbone.View.extend({

        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        el: '#app',
        initialize: function() {

            app.SrcBloqs.reset(_.map(bloqsnet.MANIFEST, function(v, k) {
                return new app.SrcBloq({
                    idx: k,
                    type: v
                });
            }));

            _.map(bloqsnet.TEST_DATA.bloqs, function(x) {
                app.CompositionBloqs.add(x);
            });
        }

    });

})(jQuery);