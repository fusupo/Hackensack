/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY */
var app = app || {};

(function($) {

    'use strict';

    var ParamsView = Backbone.View.extend({

        el: "#params",

        // events: {
        //     "input input": "update"
        // },

        initialize: function() {

            console.log('PARAMS VIEW INIT');

            this.paramsContainerTpl = _.template($('#params-container-template').html());
            this.paramsItemTpl = _.template($('#params-item-template').html());

            this.currBloqModel = undefined;

            this.listenTo(app.CompositionView, 'bloqSelection', this.bloqSelection);

        },

        update: function(e) {
            console.log(e.value);
            console.log(e.target);
        },

        bloqSelection: function(id) {

            if (this.currBloqModel === undefined || this.currBloqModel.id !== id) {

                this.clearParams();

                if (id !== undefined) {
                    var bm = this.currBloqModel = app.CompositionBloqs.get(id);
                    this.setParams(bloqsnet.REGISTRY[bm.get("type")].def.params);
                } else {
                    this.currBloqModel = undefined;
                }
            }

        },

        clearParams: function() {

            this.$el.empty();

        },

        setParams: function(params) {

            var that = this;
            var container = $(this.paramsContainerTpl({}));

            _.each(params, function(p) {
                var item = $(this.paramsItemTpl({
                    label: p[0],
                    val: this.currBloqModel.get("params")[p[0]]
                })).bind("input", (function(e) {
                    that.tryUpdateParam(p[0], e.target.value, p[1]);
                })).on('mousewheel', function(e) {
                    if (p[1] === "number") {
                        e.target.value = e.target.value - e.deltaY;
                        that.tryUpdateParam(p[0], e.target.value, p[1]);
                    };
                });

                $(container).append(item);
            }, this);

            this.$el.append(container);

        },

        tryUpdateParam: function(id, val) {
            var p = _.clone(this.currBloqModel.get('params'));

            // validate!
            p[id] = val;

            this.currBloqModel.set({
                params: p
            });

        }

    });

    app.ParamsView = new ParamsView();

})(jQuery);