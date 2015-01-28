/*global Backbone */
var app = app || {};

(function($) {
    'use strict';

    // ------------------------------- //
    //  Compositon Bloqs Collection    //
    // ------------------------------- //

    var CompositionBloqs = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: app.BloqsnetModel,

        initialize: function() {
            console.log("COMPOSITION BLOQS INITIALIZE !!");

            var that = this;
            app.vm = bloqsnet.gimmeTheThing({
                "add": function(bloq){that.trigger("add", bloq);},
                "remove": function(){that.trigger("remove");},
                "reset": function(root){that.trigger("reset", root);},
                "change": function(){that.trigger("change");} //"change:[attribute]" (model, value, options) — when a specific attribute has been updated.
                //"invalid" (model, error, options) — when a model's validation fails on the client.
            });
        },

        reload: function(data) {

            //assuming there is a root
            var r = _.findWhere(data, {
                type: 'root'
            });
            app.vm.crt(data, r.id);

        },

        get_svg: function(id) {

            return app.vm.rndr(id);

        },

        newBloq: function(type, pos) {

            app.vm.add(type, pos);
            
        },

        updateParam: function(bloq_id, param_name, val) {
            
            return app.vm.updt_par(bloq_id, param_name, val);
            
        },

        disconnect: function(term, silent) {

            app.vm.dscon(term);

        },

        getConnectedTerm: function(term) {

            return app.vm.getConnectedTerm(term);
            
        },

        addConnection: function(a, b) {

            app.vm.con(a, b);
        },

        deleteBloq: function(id) {

            app.vm.rem(id);
            this.refreshTerminals();
            
        },

        refreshTerminals: function() {

            app.vm.rst_trm();
            
        },

        getBloqs: function(){

            return app.vm.insts;
            
        },

        getBloq: function(id){

            return app.vm.get(id);
        },

        updateMeta: function(id, data){
            
            _.each(data, function(v, k){
                app.vm.updt_mta(id, k, v);
            });
            
        }
    });

    // Create our global collection of **Todos**.
    app.CompositionBloqs = new CompositionBloqs();

})(jQuery);
