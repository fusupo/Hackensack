/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY */
var app = app || {};

(function($) {

    'use strict';

    var ParamsView = Backbone.View.extend({

        el: '#params',

        // events: {
        //     "input input": "update"
        // },

        initialize: function() {

            console.log('PARAMS VIEW INIT');

            this.paramsContainerTpl = _.template($('#params-container-template').html());
            this.paramsGroupTpl = _.template($('#params-group-template').html());
            this.paramsItemTpl = _.template($('#params-item-template').html());
            this.paramsPercPxItemTpl = _.template($('#params-percpx-item-template').html());
            this.paramsTransformItemTpl = _.template($('#params-transform-item-template').html());
            this.paramsColorItemTpl = _.template($('#params-color-item-template').html());
            this.paramsTextAreaItemTpl = _.template($('#params-textarea-item-template').html());

            this.currBloqModel = undefined;

            this.listenTo(app.CompositionView, 'bloqSelection', this.bloqSelection);

            this.checkColor = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;

        },

        finalizeInitialization: function() {

        },

        update: function(e) {
            console.log(e.value);
            console.log(e.target);
        },

        bloqSelection: function(id) {

            if (this.currBloqModel === undefined || this.currBloqModel.id !== id) {

                this.clearParams();

                if (id !== undefined) {
                    var bm = this.currBloqModel = app.CompositionBloqs.getBloq(id);
                    this.setParams(bloqsnet.REGISTRY[bm.get_type()].prototype.def.params);
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

            var groups = _.groupBy(params, function(p) {
                return p.groupName;
            });

            _.each(groups, function(g, k) {
                var groupId = "params-group-" + (k.replace(/ /g, "-"));
                var g_elm = $(this.paramsGroupTpl({
                    groupName: k,
                    groupId: groupId
                }));

                _.each(g, function(p) {
                    var item;

                    switch (p.type) {
                            
                        case "number":
                            item = $(this.paramsItemTpl({
                                label: p.name,
                                val: this.currBloqModel.get_params()[p.name]
                            })).bind("input", function(e) {
                                that.tryUpdateParamNumber(p.name, e.target.value, p.type);
                            }).on('mousewheel', function(e) {
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
                                that.tryUpdateParamNumber(p.name, e.target.value, p.type);
                                return false;
                            });
                            break;
                        case "percpx":
                            item = $(this.paramsPercPxItemTpl({
                                label: p.name,
                                val: this.currBloqModel.get_params()[p.name]
                            })).bind("change", function(e){
                                that.commitUpdateParam(p.name, e.originalEvent.detail);
                            });
                            break;
                        case "transform":
                            console.log(JSON.stringify(this.currBloqModel.get_params()[p.name]));
                            item = $(this.paramsTransformItemTpl({
                                label: p.name,
                                val: JSON.stringify(this.currBloqModel.get_params()[p.name])//this.currBloqModel.get_params()[p.name]
                            })).bind("change", function(e){
                                that.commitUpdateParam(p.name, e.originalEvent.detail);
                            });
                            break;
                        case "color":
                            item = this.createColorControl(p);
                            break;
                            
                        case "string":
                            item = $(this.paramsItemTpl({
                                label: p.name,
                                val: this.currBloqModel.get_params()[p.name]
                            })).bind("input", function(e) {
                                that.tryUpdateParamString(p.name, e.target.value, p.type);
                            });
                            break;
                            
                        case "json":
                            item = $(this.paramsTextAreaItemTpl({
                                label: p.name,
                                val: this.currBloqModel.get_params()[p.name]
                            }));
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
                                that.tryUpdateParamJSON(p.name, instance.getValue(), p.type);
                            });
                            var grog = this.currBloqModel.get_params();
                            var v = grog[p.name];
                            wtf.doc.setValue(v);
                            wtf.setSize("100%", 200);
                            setTimeout(function() {
                                wtf.refresh();
                            }, 1);
                            break;
                    }

                    $(g_elm).find('form').append(item);

                }, this);
                $(container).append(g_elm);

            }, this);

            this.$el.append(container);


            $(container).accordion({
                collapsible: true
            });
        },

        /////////////////////////////////////////////////////////////////////////

        createColorControl: function(p) {
            var that = this;
            return $(this.paramsColorItemTpl({
                label: p.name,
                val: this.currBloqModel.get_params()[p.name]
            })).spectrum({
                color: p[2],
                move: function(tinycolor) {
                    console.log($(this).find('.form-control').val());
                    that.tryUpdateParamColor(p.name, tinycolor.toHexString(), p.type);
                }
            });
        },

        /////////////////////////////////////////////////////////////////////////

        commitUpdateParam: function(id, val) {
            //console.log(id, val);
            var didUpdate = app.CompositionBloqs.updateParam(this.currBloqModel.get_id(), id, val);

            // if (didUpdate) {
            //     var p = _.clone(this.currBloqModel.get_params());
            //     p[id] = val;

            //     this.currBloqModel.set({
            //         params: p
            //     });
            // }
            //app.CompositionBloqs.trigger('change:param', this.currBloqModel);
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
