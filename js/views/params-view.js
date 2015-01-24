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
            this.paramsTextAreaItemTpl = _.template($('#params-textarea-item-template').html());

            this.currBloqModel = undefined;

            this.listenTo(app.CompositionView, 'bloqSelection', this.bloqSelection);

            this.checkColor = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;
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
                var item;

                switch (p[1]) {
                    case "number":
                        item = $(this.paramsItemTpl({
                            label: p[0],
                            val: this.currBloqModel.get("params")[p[0]]
                        })).bind("input", (function(e) {
                            that.tryUpdateParamNumber(p[0], e.target.value, p[1]);
                        })).on('mousewheel', function(e) {
                            var raw_val = e.target.value;
                            var val;
                            if (typeof(raw_val) === "string" && raw_val.slice(-1) === "%") {
                                val = raw_val.slice(0, -1);
                                if (!isNaN(val)) {
                                    val = parseFloat(val);
                                    e.target.value = (val + e.deltaY) + "%";
                                }
                            } else if (!isNaN(raw_val)) {
                                e.target.value = parseFloat(raw_val) + e.deltaY;
                            }
                            that.tryUpdateParamNumber(p[0], e.target.value, p[1]);
                        });

                        break;
                    case "color":
                        item = $(this.paramsItemTpl({
                            label: p[0],
                            val: this.currBloqModel.get("params")[p[0]]
                        })).colorpicker().on('changeColor', function(ev) {
                            that.tryUpdateParamColor(p[0], ev.color.toHex(), p[1]);
                        });
                        break;
                    case "string":
                        item = $(this.paramsItemTpl({
                            label: p[0],
                            val: this.currBloqModel.get("params")[p[0]]
                        })).bind("input", function(e) {
                            that.tryUpdateParamString(p[0], e.target.value, p[1]);
                        });
                        break;
                    case "json":
                        item = $(this.paramsTextAreaItemTpl({
                            label: p[0],
                            val: this.currBloqModel.get("params")[p[0]]
                        }));
                        console.log(this.currBloqModel.get("params")[p[0]]);
                        var wtf = CodeMirror.fromTextArea(item.find(".cm-control")[0], {
                            lineNumbers: true,
                            matchBrackets: true,
                            tabMode: "indent",
                            mode: {
                                name: "javascript",
                                json: true
                            },
                            lineWrapping: true
                        });
                        wtf.on("change", function(instance, changeObj) {
                            that.tryUpdateParamJSON(p[0], instance.getValue(), p[1]);
                        });
                        wtf.doc.setValue(this.currBloqModel.get("params")[p[0]]);
                        wtf.setSize("100%", 200);
                        setTimeout(function() {
                            wtf.refresh();
                        }, 1);
                        break;
                }

                $(container).append(item);

            }, this);

            this.$el.append(container);

        },

        commitUpdateParam: function(id, val) {

            var didUpdate = app.CompositionBloqs.updateParam(this.currBloqModel.get('id'), id, val);

            if (didUpdate) {
                var p = _.clone(this.currBloqModel.get('params'));
                p[id] = val;

                this.currBloqModel.set({
                    params: p
                });
            }
        },

        tryUpdateParamNumber: function(id, val) {
            //if (!isNaN(val)) {
            this.commitUpdateParam(id, val);
            //};
        },

        tryUpdateParamColor: function(id, val) {

            //                            if (this.checkColor.test(val)) {
            this.commitUpdateParam(id, val);
            //}

        },

        tryUpdateParamString: function(id, val) {

            this.commitUpdateParam(id, val);

        },

        tryUpdateParamJSON: function(id, val) {

            this.commitUpdateParam(id, val);

        }

    });

    app.ParamsView = new ParamsView();

})(jQuery);