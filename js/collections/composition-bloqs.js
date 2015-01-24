/*global Backbone */
var app = app || {};

(function($) {
    'use strict';

    // ------------------------------- //
    //  Compositon Bloqs Collection    //
    // ------------------------------- //

    var CompositionBloqs = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: app.CompositionBloq,

        initialize: function() {
            console.log("COMPOSITION BLOQS INITIALIZE !!");

            this.vm = undefined;
            this.vm = bloqsnet.gimmeTheThing();
        },

        reload: function(data) {

            //assuming there is a root
            var r = _.findWhere(data, {
                type: 'root'
            });
            this.vm.crt(data, r.id);

            //

            this.reset(_.map(data, function(v, k) {
                return new app.CompositionBloq(v);
            }));

        },

        get_svg: function(id) {

            return this.vm.rndr(id);

        },

        newBloq: function(type, pos) {

            var def = bloqsnet.REGISTRY[type].def;
            var bloq_spec = {
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
            };

            this.vm.add(bloq_spec);
            this.add(new app.CompositionBloq(bloq_spec));

        },

        updateParam: function(bloq_id, param_name, val) {
            return this.vm.updt_par(bloq_id, param_name, val);
        },

        disconnect: function(term, silent) {

            silent = silent || false;

            var other_term = this.getConnectedTerm(term);
            if (other_term !== "x") {
                var this_bloq = this.get(term[0]);
                var other_bloq = this.get(other_term[0]);

                this_bloq.removeConnection(term[1], term[2], true);
                other_bloq.removeConnection(other_term[1], other_term[2], silent);

                this.vm.discon(term[0], other_term[0]);
            }
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

            if (a[0] !== b[0] && a[1] != b[1]) {
                this.disconnect(a);
                this.disconnect(b);

                // from child to parent
                var st = a[1] === "p" ? a : b;
                var et = a[1] === "p" ? b : a;
                var s_bloq = this.get(st[0]);
                var e_bloq = this.get(et[0]);

                s_bloq.addConnection(st[1], st[2], et[0], true);
                e_bloq.addConnection(et[1], et[2], st[0], false);

                this.vm.con(st[0], et[2], et[0]);
            }

        },

        deleteBloq: function(id) {

            var bloq = this.get(id);
            var disconnectTerms = function(that) {
                return function(side) {
                    var terms = bloq.get(side);
                    _.each(terms, function(v, idx) {
                        if (v !== "x") {
                            that.disconnect([id, side, idx], true);
                        }
                    }, this);
                };
            }(this);

            disconnectTerms("c");
            disconnectTerms("p");

            this.refreshTerminals();

            this.remove(bloq);

            this.vm.rem(id);
        },

        refreshTerminals: function() {
            this.forEach(function(b) {
                b.resetTerminals();
            });

            this.vm.rst_trm();
        }

    });

    // Create our global collection of **Todos**.
    app.CompositionBloqs = new CompositionBloqs();

})(jQuery);