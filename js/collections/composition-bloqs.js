/*global Backbone */
var app = app || {};

(function($) {
    'use strict';

    // ------------------------------ //
    // Compositon Bloqs Collection    //
    // ------------------------------ //

    var CompositionBloqs = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: app.CompositionBloq



    });

    // Create our global collection of **Todos**.
    app.CompositionBloqs = new CompositionBloqs();

})(jQuery);