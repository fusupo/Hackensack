/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY */
var app = app || {};

(function($) {

    'use strict';

    var LibraryView = Backbone.View.extend({

        el: "#library",
        //... is a list tag.
        //tagName:  'li',

        // Cache the template function for a single item.
        //template: _.template($('#item-template').html()),

        // The DOM events specific to an item.
        /*events: {
	        'click .toggle': 'toggleCompleted',
	        'dblclick label': 'edit',
	        'click .destroy': 'clear',
	        'keypress .edit': 'updateOnEnter',
	        'keydown .edit': 'revertOnEscape',
	        'blur .edit': 'close'
	     },*/

        // The TodoView listens for changes to its model, re-rendering. Since
        // there's a one-to-one correspondence between a **Todo** and a
        // **TodoView** in this app, we set a direct reference on the model for
        // convenience.
        initialize: function() {

        },

        addLibraryItemView: function(libraryItemView) {

            this.$el.append(libraryItemView.render().el);

        },

        render: function() {

            return this;

        }

    });

    app.LibraryView = new LibraryView();

})(jQuery);