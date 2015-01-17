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
        }

    });

})(jQuery);