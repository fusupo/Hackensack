/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY */
var app = app || {};

(function($) {

    'use strict';

    var IOSVGView = Backbone.View.extend({

        el: "#svg-io",

        initialize: function() {

            console.log('IO SVG VIEW INIT');

            this.listenTo(app.CompositionBloqs, 'change', this.bloqChange);
            this.listenTo(app.CompositionView, 'bloqSelection', this.bloqSelection);

            this.currId = undefined;

            this.textarea = CodeMirror.fromTextArea(document.getElementById('svg-io-textarea'), {
                lineNumbers: true,
                matchBrackets: true,
                tabMode: "indent",
                mode: "xml",
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

            var rendered = app.CompositionBloqs.get_svg(this.currId);
            var s = new XMLSerializer();
            var str = s.serializeToString(rendered);
            this.textarea.setValue(str);

            var that = this;
            setTimeout(function() {
                that.textarea.refresh();
            }, 1);

        }

    });

    app.IOSVGView = new IOSVGView();

})(jQuery);