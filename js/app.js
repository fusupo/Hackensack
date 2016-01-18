'use strict';
var app = app || {};
var $ = require('jquery');
var AppView = require('./views/app-view.js');
$(function() {
  // kick things off by creating the `App`
  new AppView();
});
