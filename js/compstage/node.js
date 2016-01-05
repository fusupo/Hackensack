var hacsac = hacsac || {};
hacsac.Node = function(id, type) {

  this.svgNS = "http://www.w3.org/2000/svg";
  this.xlinkNS = "http://www.w3.org/1999/xlink";

  this.id = id;
  this.type = type;
  this.ti = [];
  this.to = [];
  this.matrix = [1, 0, 0, 1, 0, 0];

  this.w = 100;
  this.h = 40;

  var g = document.createElementNS(this.svgNS, "g");
  g.setAttributeNS(null, "class", "node");

  var bodyRect = document.createElementNS(this.svgNS, "rect");
  bodyRect.setAttributeNS(null, "class", "draggable node-body");
  bodyRect.setAttribute('width', this.w);
  bodyRect.setAttribute('height', this.h);

  var shadowRect = document.createElementNS(this.svgNS, "rect");
  shadowRect.setAttributeNS(null, "class", "draggable node-shadow");
  shadowRect.setAttribute('width', this.w);
  shadowRect.setAttribute('height', this.h);

  var text = document.createElementNS(this.svgNS, "text");
  text.setAttribute("x", 5);
  text.setAttribute("y", "1em");
  text.setAttribute("font-family", "Source Code Pro");
  text.setAttribute("pointer-events", "none");
  text.setAttribute("font-size", ".75em");
  text.textContent = id + ':' + type;

  var closeRect = document.createElementNS(this.svgNS, "rect");
  closeRect.setAttribute('fill', 'red');
  closeRect.setAttribute('x', this.w - 15);
  closeRect.setAttribute('y', 5);
  closeRect.setAttribute('width', 10);
  closeRect.setAttribute('height', 10);

  g.appendChild(shadowRect);
  g.appendChild(bodyRect);
  g.appendChild(closeRect);
  g.appendChild(text);

  this.el = g;
  this.$el = $(g);

  bodyRect.onmousedown = (function(evt) {
    var e = new CustomEvent('bodymousedown', {
      'detail': {
        'clientX': evt.clientX,
        'clientY': evt.clientY
      }
    });
    this.el.dispatchEvent(e);
    this.$el.trigger('mousedown:body', this.id);
  }).bind(this);

  closeRect.onmousedown = (function(evt) {
    var e = new Event('closemousedown');
    this.el.dispatchEvent(e);
  }).bind(this);

};

hacsac.Node.prototype.setPos = function(x, y) {

  this.matrix[4] = x;
  this.matrix[5] = y;

  this.el.setAttributeNS(null, "transform", "matrix(" + this.matrix.join(' ') + ")");

  //

  var i;
  var term;

  for (i = 0; i < this.ti.length; i++) {
    term = this.ti[i];
    term.tryUpdateConn("i");
  }

  for (i = 0; i < this.to.length; i++) {
    term = this.to[i];
    term.tryUpdateConn("o");
  }

};

hacsac.Node.prototype.getPos = function() {

  return {
    x: this.matrix[4],
    y: this.matrix[5]
  };

};

hacsac.Node.prototype.addTerm = function(side) {

  var term = new hacsac.Term(side, this);
  this.el.appendChild(term.el);

  switch (side) {
  case "i":
    this.ti.push(term);
    break;
  case "o":
    this.to.push(term);
    break;
  }

  this.refreshTerms();

};

hacsac.Node.prototype.remTerm = function(side, idx) {

  var termSide = this["t" + side];
  var term = termSide[idx];
  term.destroy();
  this.el.removeChild(term.el);
  termSide = termSide.splice(idx, 1);

  this.refreshTerms();

};

hacsac.Node.prototype.refreshTerms = function() {

  var i;
  var term;

  for (i = 0; i < this.ti.length; i++) {
    term = this.ti[i];
    term.setPos(-term.w, (term.h + 2) * i);
  }

  for (i = 0; i < this.to.length; i++) {
    term = this.to[i];
    term.setPos(this.w, (term.h + 2) * i);
  }

  //

  for (i = 0; i < this.ti.length; i++) {
    term = this.ti[i];
    term.tryUpdateConn("i");
  }

  for (i = 0; i < this.to.length; i++) {
    term = this.to[i];
    term.tryUpdateConn("o");
  }

};

hacsac.Node.prototype.getTerm = function(side, idx) {

  return this["t" + side][idx];

};

hacsac.Node.prototype.getTermIdx = function(term) {

  var ret = this.ti.indexOf(term);
  if (ret === -1) {
    ret = this.to.indexOf(term);
  }

  return ret;

};

hacsac.Node.prototype.getMaxTermIdx = function(side) {
  return this["t" + side].length - 1;
};

hacsac.Node.prototype.addClass = function(className){
  var classes = this.el.getAttributeNS(null, "class").split(' ');
  if(!_.contains(classes, className)){
    classes.push(className); 
    this.el.setAttributeNS(null, "class", classes.join(' '));
  }
};

hacsac.Node.prototype.removeClass = function(className){
  var classes = this.el.getAttributeNS(null, "class").split(' ');
  classes = _.reject(classes, function(cn){
    return cn === className;
  });
  this.el.setAttributeNS(null, "class", classes.join(' '));
};

hacsac.Node.prototype.destroy = function() {

  console.log('destroy node ' + this.id);

  var i;
  var term;

  for (i = 0; i < this.ti.length; i++) {
    term = this.ti[i];
    term.destroy();
    delete this.ti[i];
  }

  for (i = 0; i < this.to.length; i++) {
    term = this.to[i];
    term.destroy();
    delete this.ti[i];
  }

  delete this.id;
  delete this.type;
  delete this.ti;
  delete this.to;
  delete this.matrix;
  delete this.w;
  delete this.h;

};
