/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY */
var app = app || {};

(function($) {

  'use strict';

  var ManifestView = Backbone.View.extend({

    el: '#manifest',

    initialize: function(srcBloqs, settings) {

      console.log('MANIFEST VIEW INIT');

      this.srcBloqs = srcBloqs;

      this.listenTo(srcBloqs, 'reset', this.resetManifest);

      this.settings = settings || {};
      this.currentSelectedBloq = undefined;
      this.mouseLine = undefined;
      this.zoom_scale = 1;

      this.linesData = [];
      this.bloqData = [];

    },

    finalizeInitialization: function() {

    },

    ////////////////////
    // DRAG BEHAVIORS //
    ////////////////////

    resetManifest: function() {

      var that = this;
      var w = this.w;
      var h = this.h;
      var box_w = this.box_w;
      var box_h = this.box_h;
      var data = this.manifestdata();

      _.each(data, function(d) {
        var li = $("<div>" + d.type + "</div>");
        li.data('type', d.type)
          .draggable({
            scroll: false,
            revert: true
            //  helper: "clone"
          });
        that.$el.append(li);
      });

    },

    ////////////////////////////////////
    // BEGIN DATA COMPOSITION METHODS //
    ////////////////////////////////////

    manifestdata: function() {
      var data = [];
      this.srcBloqs.forEach(function(datapoint) {
        data.push({
          idx: datapoint.get('idx'),
          type: datapoint.get('type')
        });
      });
      return data;
    }

  });

  app.ManifestView = new ManifestView(app.SrcBloqs, {});

})(jQuery);
