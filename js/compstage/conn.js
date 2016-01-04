var hacsac = hacsac || {};
hacsac.Conn = function(to, ti) {

  this.svgNS = "http://www.w3.org/2000/svg";
  this.xlinkNS = "http://www.w3.org/1999/xlink";

  this.to = to;
  this.ti = ti;

  to.conn = this;
  ti.conn = this;

  var line = document.createElementNS(this.svgNS, "line");
  line.setAttribute('stroke', 'black');
  line.setAttribute('x1', '10');
  line.setAttribute('y1', '10');
  line.setAttribute('x2', '100');
  line.setAttribute('y2', '100');
  line.setAttribute("pointer-events", "none");

  this.el = line;
  this.updateSide("o", this.to.getPos());
  this.updateSide("i", this.ti.getPos());
}

hacsac.Conn.prototype.updateSide = function(side, pos) {
  switch (side) {
  case "o":
    this.el.setAttribute('x1', pos.x);
    this.el.setAttribute('y1', pos.y);
    break;
  case "i":
    this.el.setAttribute('x2', pos.x);
    this.el.setAttribute('y2', pos.y);
    break;
  }
};

hacsac.Conn.prototype.getOpposite = function(term) {
  var ret = undefined;
  if (this.to === term) {
    ret = this.ti;
  } else if (this.ti === term) {
    ret = this.to;
  }
  return ret;
};

hacsac.Conn.prototype.destroy = function() {
  this.to.conn = undefined;
  this.ti.conn = undefined;
  this.el.parentNode.removeChild(this.el);
  delete this.el;
  delete this.to;
  delete this.ti;
};
