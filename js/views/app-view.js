var app = app || {};

(function($) {

    'use strict';

    app.AppView = Backbone.View.extend({

        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        el: '#app',
        initialize: function() {
            for (var idx in BLOQS_MANIFEST) {

                app.LibraryView.addLibraryItemView(new LibraryItemView({
                    model: {
                        idx: idx,
                        name: BLOQS_MANIFEST[idx]
                    }
                }));
            }

            app.CompositionBloqs.reset([
                new app.CompositionBloq({
                    x: 1,
                    y: 6,
                    id: 1
                }),
                new app.CompositionBloq({
                    x: 2,
                    y: 4,
                    id: 2
                }),
                new app.CompositionBloq({
                    x: 3,
                    y: 2,
                    id: 3
                }),
                new app.CompositionBloq({
                    x: 4,
                    y: 4,
                    id: 4
                }),
                new app.CompositionBloq({
                    x: 5,
                    y: 6,
                    id: 5
                })
            ]);
        }

    });

})(jQuery);