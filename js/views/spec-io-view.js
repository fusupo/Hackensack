/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY */
var app = app || {};

(function($) {

    'use strict';

    var IOSpecView = Backbone.View.extend({

        el: '#spec-io',
        // el: "#spec-io",

        initialize: function() {

            console.log('IO SPEC VIEW INIT');

            //this.listenTo(app.CompositionBloqs, 'change', this.bloqChange);
            this.listenTo(app.CompositionView, 'bloqSelection', this.bloqSelection);

            this.currId = undefined;

            var that = this;
            this.$("#spec-io-reload").on('click', function() {
                app.CompositionBloqs.reload(JSON.parse(that.textarea.getValue()));
            });

            //this.$("#spec-io-clear").on("click", function() {
            //     console.log("clear");
            // });

            app.CompositionBloqs.on("all", function(f, r, j) {
                //console.log(f, r);
                //     console.log(r);
                //     console.log(j);
                that.draw();
            });

        },

        finalizeInitialization: function() {

            this.textarea = CodeMirror.fromTextArea(document.getElementById('spec-io-textarea'), {
                lineNumbers: true,
                matchBrackets: true,
                tabMode: "indent",
                mode: {
                    name: "javascript",
                    json: true
                },
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
            
            var json = _.map(app.CompositionBloqs.getBloqs(), function(b){
                    return b.toJSON();
            });

           // console.log(json);
            (function filter(obj) {
                if(typeof(obj)!== "string"){
                    $.each(obj, function(key, value){
                        if (value === "" || value === null){
                            delete obj[key];
                        } else if (Object.prototype.toString.call(value) === '[object Object]') {
                            filter(value);
                        } else if ($.isArray(value)) {
                            $.each(value, function (k,v) { filter(v); });
                        }
                    });
                }
            })(json);
             //console.log(json);
             var str = JSON.stringify(json);
             this.textarea.setValue(str);

             var that = this;
             setTimeout(function() {
                 that.textarea.refresh();
             }, 1);

            }

        });

    app.IOSpecView = new IOSpecView();

})(jQuery);
