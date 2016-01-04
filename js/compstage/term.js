var hacsac = hacsac || {};
hacsac.Term = function(side, parent) {

  this.svgNS = "http://www.w3.org/2000/svg";
  this.xlinkNS = "http://www.w3.org/1999/xlink";

  this.w = 10;
  this.h = 10;

  this.side = side;
  this.conn = undefined;
  this.parent = parent;

  var rect = document.createElementNS(this.svgNS, "rect");
  rect.setAttribute('fill', 'black');
  rect.setAttribute('width', this.w);
  rect.setAttribute('height', this.h);

  this.el = rect;

  //

  var that = this;

  this.el.onmousedown = function(evt) {
    var e = new CustomEvent('termmousedown', {
      'detail': {
        'term': that,
        'clientX': evt.clientX,
        'clientY': evt.clientY
      }
    });
    that.el.parentNode.dispatchEvent(e);
  };

  this.el.onmouseup = function(evt) {
    var e = new CustomEvent('termmouseup', {
      'detail': {
        'term': that,
        'clientX': evt.clientX,
        'clientY': evt.clientY
      }
    });
    that.el.parentNode.dispatchEvent(e);
  };
}

hacsac.Term.prototype.setPos = function(x, y) {

  this.el.setAttribute('x', x);
  this.el.setAttribute('y', y);

};

hacsac.Term.prototype.getPos = function() {

  var matrix = this.el.getCTM();

  return {
    x: matrix.e +
      parseFloat(this.el.getAttribute("x")) +
      (this.w / 2),
    y: matrix.f +
      parseFloat(this.el.getAttribute("y")) +
      (this.h / 2)
  };

};

hacsac.Term.prototype.isConnected = function() {
  var ret = this.conn === undefined ? false : true;
  return ret;
};

hacsac.Term.prototype.tryUpdateConn = function(side) {

  if (this.isConnected()) {
    this.conn.updateSide(side, this.getPos());
  }

};

hacsac.Term.prototype.getIdx = function() {
  return this.parent.getTermIdx(this);
};

hacsac.Term.prototype.disconn = function() {

  if (this.conn !== undefined) {
    this.conn.destroy();
  }

};

hacsac.Term.prototype.destroy = function() {

  this.disconn();
  delete this.w;
  delete this.h;
  delete this.side;
  delete this.conn;
  delete this.parent;
};
