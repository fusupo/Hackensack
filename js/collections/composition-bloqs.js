/*global Backbone */
var app = app || {};

(function($) {
    'use strict';

    // ------------------------------ //
    // Compositon Bloqs Collection    //
    // ------------------------------ //

    var CompositionBloqs = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: app.CompositionBloq,

        newBloq: function(type, pos) {
            var def = bloqsnet.REGISTRY[type].def;
            this.add(new app.CompositionBloq({
                id: _.uniqueId('b'),
                type: type,
                meta: {
                    x: pos[0],
                    y: pos[1]
                },
                params: _.reduce(def.params, function(memo, p) {
                    memo[p[0]] = p[2];
                    return memo;
                }, {}),
                p: _.times(def.p[0], function(n) {
                    return "x";
                }),
                c: _.times(def.c[0], function(n) {
                    return "x";
                })
            }));

        },

        disconnect: function(term) {

            var other_term = this.getConnectedTerm(term);
            if (other_term !== "x") {
                var this_bloq = this.get(term[0]);
                var other_bloq = this.get(other_term[0]);
                var this_term_arr = _.clone(this_bloq.get(term[1]));
                var other_term_arr = _.clone(other_bloq.get(other_term[1]));
                var this_obj = {};
                var other_obj = {};

                this_term_arr[term[2]] = "x";
                other_term_arr[other_term[2]] = "x";

                this_obj[term[1]] = this_term_arr;
                other_obj[other_term[1]] = other_term_arr;

                this_bloq.set(this_obj, {
                    silent: true
                });
                other_bloq.set(other_obj);
            }

            console.log(this.models);
        },

        getConnectedTerm: function(term) {

            var bloq = this.get(term[0]);
            var side = bloq.get(term[1]);
            var other_id = side[term[2]];

            if (other_id !== "x") {
                var other_bloq = this.get(other_id);
                var other_side_type = term[1] === "c" ? "p" : "c";
                var other_side = other_bloq.get(other_side_type);
                var other_idx = _.indexOf(other_side, term[0]);

                return [other_id, other_side_type, other_idx];
            } else {
                return "x";
            }

        },

        addConnection: function(a, b) {
            console.log(a, b);
            if (a[0] !== b[0]) {
                this.disconnect(a);
                this.disconnect(b);

                var st = a[1] === "p" ? a : b;
                var et = a[1] === "p" ? b : a;
                var s_bloq = this.get(st[0]);
                var e_bloq = this.get(et[0]);
                var s_terms = _.clone(s_bloq.get(st[1]));
                var e_terms = _.clone(e_bloq.get(et[1]));
                var s_obj = {};
                var e_obj = {};

                s_terms[st[2]] = et[0];
                e_terms[et[2]] = st[0];

                s_obj[st[1]] = s_terms;
                e_obj[et[1]] = e_terms;

                s_bloq.set(s_obj, {
                    silent: true
                });
                e_bloq.set(e_obj);

            }
        }

    });

    // Create our global collection of **Todos**.
    app.CompositionBloqs = new CompositionBloqs();

})(jQuery);