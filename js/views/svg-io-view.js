/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY */
var app = app || {};

(function($) {

  'use strict';

  var IOSVGView = Backbone.View.extend({

    el: '#svg-io',

    initialize: function() {
      console.log('IO SVG VIEW INIT');
      //this.listenTo(app.CompositionBloqs, 'change:param', this.bloqChange);
      this.listenTo(app.CompositionBloqs, 'change:svg', this.svgChange);
      this.listenTo(app.CompositionView, 'bloqSelection', this.bloqSelection);
      this.currId = undefined;
    },

    finalizeInitialization: function() {
      this.textarea = CodeMirror.fromTextArea(document.getElementById('svg-io-textarea'), {
        lineNumbers: true,
        matchBrackets: true,
        //tabMode: "indent",
        mode: "text/html",
        lineWrapping: false
      });
      var that = this;
      this.textarea.on('change', function(inst, obj) {
        // only fire custom change event if text area content is fundamentally changed
        // as opposed to a format event
        //if (obj.origin === "setValue") {
        that.trigger('change', inst.getValue());
        //}
      });
    },

    bloqSelection: function(id) {
      this.clear();
      if (id !== undefined) {
        this.currId = app.CompositionBloqs.getRootId();//id;
        this.draw();
      } else {
        this.currId = undefined;
      }
    },

    // bloqChange: function() {
    //     this.bloqSelection(this.currId);
    // },

    svgChange: function() {
      this.bloqSelection(this.currId);
    },

    clear: function() {
      this.textarea.setValue('');
    },

    draw: function() {
      var rendered = app.CompositionBloqs.get_svg(this.currId);
      if (rendered !== undefined) {
        var s = new XMLSerializer();
        this.textarea.setValue(rendered.prop('outerHTML'));

        var that = this;
        setTimeout(function() {
          that.textarea.refresh();
          that.autoFormat();
        }, 1);
      }
    },

    autoFormat: function() {
      var totalLines = this.textarea.lineCount();
      var totalChars = this.textarea.getTextArea().value.length;
      this.textarea.autoFormatRange({
        line: 0,
        ch: 0
      }, {
        line: totalLines,
        ch: totalChars
      });
      this.textarea.setSelection({
        line: 0,
        ch: 0
      }, {
        line: 0,
        ch: 0
      });
    }
  });

  app.IOSVGView = new IOSVGView();

})(jQuery);
