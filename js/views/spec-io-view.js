/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY */
var app = app || {};

(function($) {

    'use strict';

    var IOSpecView = Backbone.View.extend({

        el: "#spec-io",

        initialize: function() {

            console.log('IO SPEC VIEW INIT');

            this.listenTo(app.CompositionBloqs, 'change', this.bloqChange);
            this.listenTo(app.CompositionView, 'bloqSelection', this.bloqSelection);

            this.currId = undefined;

            this.textarea = CodeMirror.fromTextArea(document.getElementById('spec-io-textarea'), {
                lineNumbers: true,
                matchBrackets: true,
                tabMode: "indent",
                mode: "json",
                lineWrapping: true
            });

        },

        bloqSelection: function(id) {

            this.clear();

            if (id !== undefined) {
                this.currId = id;

                this.draw();
            } else {
                this.currId = undefined;
            }

        },

        bloqChange: function() {

            this.bloqSelection(this.currId);

        },

        clear: function() {

            this.textarea.setValue('');

        },

        draw: function() {

            var str = JSON.stringify(app.CompositionBloqs.toJSON());
            this.textarea.setValue(str);

        }

    });

    app.IOSpecView = new IOSpecView();

})(jQuery);