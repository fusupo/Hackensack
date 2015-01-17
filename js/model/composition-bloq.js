/*global Backbone */
var app = app || {};

(function() {
    'use strict';

    // Todo Model
    // ----------

    // Our basic **Todo** model has `title`, `order`, and `completed` attributes.
    app.CompositionBloq = Backbone.Model.extend({
        // Default attributes for the todo
        // and ensure that each todo created has `title` and `completed` keys.
        // defaults: {
        //     id: '',
        //     type: '',
        //     x: 0,
        //     y: 0
        // }

        initialize: function(point) {
            this.set({
                id: point.id,
                x: point.x,
                y: point.y
            });
        }

        // Toggle the `completed` state of this todo item.
        // toggle: function () {
        //     this.save({
        // 	completed: !this.get('completed')
        //     });
        // }
    });
})();