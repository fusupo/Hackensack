/*global Backbone */
var app = app || {};

(function() {
  'use strict';

  app.CompositionBloq = Backbone.Model.extend({

    _resetTerminalsSide: function(side, silent) {

      silent = silent || false;

      var terms = _.clone(this.get(side));
      var card = bloqsnet.REGISTRY[this.get("type")].prototype.def[side];
      var temp = {};

      if (card[1] === "n") {
        terms = _.without(terms, "x");
        terms.push("x");
      }

      temp[side] = terms;

      this.set(temp, {
        silent: silent
      });

    },

    _updateTerminal: function(side, idx, v, silent) {

      silent = silent || false;

      var terms = _.clone(this.get(side));
      var temp = {};

      terms[idx] = v;
      temp[side] = terms;

      this.set(temp, {
        silent: silent
      });

    },

    ////////////////////////////////////////////////////////////////////////

    resetTerminals: function(silent) {

      silent = silent || false;

      this._resetTerminalsSide("c", true);
      this._resetTerminalsSide("p", silent);

    },

    addConnection: function(side, idx, v, silent) {

      silent = silent || false;

      this._updateTerminal(side, idx, v, true);
      this._resetTerminalsSide(side, silent);

    },

    removeConnection: function(side, idx, silent) {

      silent = silent || false;

      this._updateTerminal(side, idx, "x", silent);

    }

  });

})();
