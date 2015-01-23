/*global Backbone */
var app = app || {};

(function() {
    'use strict';

    app.CompositionBloq = Backbone.Model.extend({

        addConnection: function(side, idx, v, silent) {

            silent = silent || false;

            var terms = _.clone(this.get(side));
            terms[idx] = v;
            var temp = {};

            var card = bloqsnet.REGISTRY[this.get("type")].def[side];
            if (card[1] === "n") {
                //console.log(terms);
                terms = _.without(terms, "x");
                terms.push("x");
                // console.log(terms);
            }

            temp[side] = terms;
            this.set(temp, {
                silent: silent
            });

        },

        removeConnection: function(side, idx, silent) {

            silent = silent || false;

            var terms = _.clone(this.get(side));
            terms[idx] = "x";
            var temp = {};
            temp[side] = terms;
            this.set(temp, {
                silent: silent
            });

        }

    });

})();