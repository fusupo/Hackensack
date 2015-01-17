// var app = app || {};

// (function($) {

var LibraryItemView = Backbone.View.extend({

    template: _.template($('#library-item-template').html()),

    initialize: function() {

        _.bindAll(this, 'render');

    },

    render: function() {
        console.log(this.model.name);
        $(this.el)
            .html(this.template({
                id: this.model.name,
                label: this.model.name
            }));
        //.addClass('manifest_draggable')
        // .data('xxx', this.options)
        // .draggable({
        //     revert: "invalid",
        //     revertDuration: 100,
        //     cursorAt: {
        //         top: 15,
        //         left: 16
        //     },
        //     helper: function() {
        //         return $(this).clone()
        //             .appendTo('body')
        //             .css({
        //                 zIndex: 5
        //             })
        //             .addClass('stage_draggable')
        //             .show();
        //     },
        //     cursor: 'move'
        // });

        return this;
    }
});

//})(jQuery);                     //