var hacsac = hacsac || {};
hacsac.Stage = function Stage(el_id, w, h) {

  this.svgNS = "http://www.w3.org/2000/svg",
  this.xlinkNS = "http://www.w3.org/1999/xlink",

  this.nodes = {};
  this.conns = [];
  this.w = w;
  this.h = h;

  this.el = document.getElementById(el_id);
  this.$el = $(this.el);

  this.stage = document.createElementNS(this.svgNS, "svg");
  this.stage.setAttribute('style', 'border: 1px solid black');
  this.stage.setAttribute('width', w);
  this.stage.setAttribute('height', h);
  this.stage.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", this.xlinkNS);
  this.stage.setAttribute('version', "1.1");
  this.stage.setAttribute('viewBox', "0 0 " + this.w + " " + this.h);
  this.stage.setAttribute('preserveAspectRatio', "xMidYMax slice");
  this.stage.setAttribute('xmlns', "http://www.w3.org/2000/svg");

  this.el.appendChild(this.stage);

  var stage_w = 1920;
  var stage_h = 1080;
  var defs = document.createElementNS(this.svgNS, "defs");
  this.stage.appendChild(defs);

  var pat_w = stage_w / 10;
  var pat_h = stage_h / 10;
  var pat = document.createElementNS(this.svgNS, "pattern");
  pat.setAttribute("id", "tracking_pattern");
  pat.setAttribute("x", "0");
  pat.setAttribute("y", "0");
  pat.setAttribute("width", pat_w);
  pat.setAttribute("height", pat_h);
  pat.setAttribute("patternUnits", "userSpaceOnUse");
  defs.appendChild(pat);

  var pat_bg = document.createElementNS(this.svgNS, 'rect');
  pat_bg.setAttribute("id", "tracking_pattern_bg");
  pat_bg.setAttribute("x", 0);
  pat_bg.setAttribute("y", 0);
  pat_bg.setAttribute("width", pat_w);
  pat_bg.setAttribute("height", pat_h);
  pat_bg.setAttribute("style", "stroke: none; fill: #c9c9c9");
  pat.appendChild(pat_bg);

  var pat_rect_h = document.createElementNS(this.svgNS, 'rect');
  pat_rect_h.setAttribute("x", pat_w / 2);
  pat_rect_h.setAttribute("y", pat_h / 2 - 5);
  pat_rect_h.setAttribute("width", 2);
  pat_rect_h.setAttribute("height", 12);
  pat_rect_h.setAttribute("style", "stroke: none; fill: #999999");
  pat.appendChild(pat_rect_h);

  var pat_rect_v = document.createElementNS(this.svgNS, 'rect');
  pat_rect_v.setAttribute("x", pat_w / 2 - 5);
  pat_rect_v.setAttribute("y", pat_h / 2);
  pat_rect_v.setAttribute("width", 12);
  pat_rect_v.setAttribute("height", 2);
  pat_rect_v.setAttribute("style", "stroke: none; fill: #999999");
  pat.appendChild(pat_rect_v);

  var stage_def = document.createElementNS(this.svgNS, "svg");
  stage_def.setAttribute('width', stage_w);
  stage_def.setAttribute('height', stage_h);
  stage_def.setAttribute('id', 'stage-def');
  defs.appendChild(stage_def);

  var stage_def_bg_rect = document.createElementNS(this.svgNS, "rect");
  stage_def_bg_rect.setAttribute("x", 0);
  stage_def_bg_rect.setAttribute("y", 0);
  stage_def_bg_rect.setAttribute("width", stage_w);
  stage_def_bg_rect.setAttribute("height", stage_h);
  stage_def_bg_rect.setAttribute("fill", "url(#tracking_pattern)");
  stage_def.appendChild(stage_def_bg_rect);

  this.stage_def = stage_def;

  var xxx = document.createElementNS(this.svgNS, "use");
  this.xxx = xxx;

  xxx.setAttributeNS(this.xlinkNS, "xlink:href", "#stage-def");
  this.stage.appendChild(xxx);

  var nav_scale = 0.10;
  var nav_w = nav_scale * stage_w;
  var nav_h = nav_scale * stage_h;

  var nav_container = document.createElementNS(this.svgNS, "g");
  nav_container.setAttribute("transform", "translate(" + (this.w - nav_w) + "," + (this.h - nav_h) + ") scale(" + nav_scale + ")");

  var nav_use = document.createElementNS(this.svgNS, "use");
  nav_use.setAttributeNS(this.xlinkNS, "xlink:href", "#stage-def");

  var nav_border = document.createElementNS(this.svgNS, "rect");
  nav_border.setAttribute("x", this.w - nav_w);
  nav_border.setAttribute("y", this.h - nav_h);
  nav_border.setAttribute("width", nav_w);
  nav_border.setAttribute("height", nav_h);
  nav_border.setAttribute("stroke-width", "1");
  nav_border.setAttribute("stroke", "grey");
  nav_border.setAttribute("fill", "none");

  var nav_box = document.createElementNS(this.svgNS, "rect");
  nav_box.setAttribute("width", this.w);
  nav_box.setAttribute("height", this.h);
  nav_box.setAttribute("id", "navigator-box");
  nav_box.setAttribute("x", 0);
  nav_box.setAttribute("y", 0);
  nav_box.setAttribute("stroke-width", "10");
  nav_box.setAttribute("stroke", "red");
  nav_box.setAttribute("fill", "none");

  nav_container.appendChild(nav_use);
  nav_container.appendChild(nav_border);
  nav_container.appendChild(nav_box);
  this.stage.appendChild(nav_container);
  this.stage.appendChild(nav_border);

  this.currentX = 0;
  this.currentY = 0;
  this.targTerm = undefined;

  var mat = [1, 0, 0, 1, 0, 0];

  var updateNavBox = function(){
    if (mat[0] * stage_w < w) {
      mat[0] = w / stage_w;
      mat[3] = h / stage_h;
    }
    if (mat[4] > 0) mat[4] = 0;
    if (mat[5] > 0) mat[5] = 0;
    if (mat[4] < w - (stage_w * mat[0])) mat[4] = w - (stage_w * mat[0]);
    if (mat[5] < h - (stage_h * mat[3])) mat[5] = h - (stage_h * mat[3]);
    xxx.setAttributeNS(null, "transform", "matrix(" + mat.join(' ') + ")");
    var mat2 = [1/mat[0], mat[1],
                mat[2], 1/mat[3], -mat[4]/mat[0], -mat[5]/mat[3]
               ];
    nav_box.setAttributeNS(null, "transform", "matrix(" + mat2.join(' ') + ")");
  };

  stage_def_bg_rect.onwheel = (function(evt) {
    var d = evt.wheelDeltaY / 30;
    mat[0] += d / 100;
    mat[3] += d / 100;
    updateNavBox();
  }).bind(this);

  stage_def_bg_rect.onmousedown = (function(e) {
    var ox = e.clientX;
    var oy = e.clientY;
    this.$el.trigger("mousedown:stage:bg");
    stage_def_bg_rect.onmousemove = (function(e1) {
      var dx = ox - e1.clientX;
      var dy = oy - e1.clientY;
      mat[4] -= dx;
      mat[5] -= dy;
      updateNavBox(mat);
      ox -= dx;
      oy -= dy;
    }).bind(this);

    window.onmouseup = function(e2) {
      stage_def_bg_rect.onmousemove = undefined;
      stage_def_bg_rect.onmouseup = undefined;
    };
  }).bind(this);
};

hacsac.Stage.prototype.addNode = function(id, type, x, y) {

  var mouseLine = undefined;
  var n = new hacsac.Node(id, type);

  n.setPos(x, y);
  this.stage_def.appendChild(n.el);
  this.nodes[id] = n;

  var that = this;

  n.$el.on("mousedown:body", function(e, id) {
    that.$el.trigger("mousedown:block:body", id);
  });

  n.el.addEventListener('closemousedown', (function(e) {
    this.$el.trigger("mousedown:block:close", id);
  }).bind(this));

  n.el.addEventListener('bodymousedown', (function(e) {
    this.currentX = e.detail.clientX;
    this.currentY = e.detail.clientY;
    this.stage_def.onmousemove = (function(e1) {
      var cx = e1.clientX;
      var cy = e1.clientY;
      var dx = cx - this.currentX;
      var dy = cy - this.currentY;
      var pos = n.getPos();
      this.currentX = cx;
      this.currentY = cy;
      this.moveNode(n.id, pos.x + dx, pos.y + dy);
      this.$el.trigger("mousedrag:block:body", [id, pos.x + dx, pos.y + dy]);
    }).bind(this);
      this.stage_def.onmouseup = (function(e2) {
      this.stage_def.onmousemove = undefined;
      this.stage_def.onmouseup = undefined;
    }).bind(this);
    }).bind(this));

      n.el.addEventListener('termmousedown', function(e) {
      var term = e.detail.term;
      var isConnected = term.isConnected();
      that.targTerm = term;
      var targPos = term.getPos();
      if (isConnected) {
      console.log('supposedly connnected');
      that.targTerm = term.conn.getOpposite(term);
      var evtobj;
      if (term.side === 'o') {
      evtobj = [term.parent.id, term.getIdx(), that.targTerm.parent.id, that.targTerm.getIdx()];
      } else {
      evtobj = [that.targTerm.parent.id, that.targTerm.getIdx(), term.parent.id, term.getIdx()];
      }
      that.$el.trigger("try:terminal:disconnect", evtobj);
      term.disconn();
      if (term.side === 'i') {
      term.parent.remTerm('i', term.getIdx());
      }
    }
      var anchorPos = that.targTerm.getPos();
      mouseLine = document.createElementNS(that.svgNS, "line");
      mouseLine.setAttributeNS(null, "class", "mouse-line");
      // mouseLine.setAttribute('stroke', 'black');
      mouseLine.setAttribute('x1', anchorPos.x);
      mouseLine.setAttribute('y1', anchorPos.y);
      mouseLine.setAttribute('x2', targPos.x);
      mouseLine.setAttribute('y2', targPos.y);
      //mouseLine.setAttribute("pointer-events", "none");
      that.stage_def.appendChild(mouseLine);
      that.currentX = e.detail.clientX;
      that.currentY = e.detail.clientY;
      that.stage_def.onmousemove = function(e1) {
      var cx = e1.clientX;
      var cy = e1.clientY;
      var dx = cx - that.currentX;
      var dy = cy - that.currentY;
      var posx = parseFloat(mouseLine.getAttribute('x2'));
      var posy = parseFloat(mouseLine.getAttribute('y2'));
      that.currentX = cx;
      that.currentY = cy;
      mouseLine.setAttribute('x2', posx + dx);
      mouseLine.setAttribute('y2', posy + dy);
    };
      that.stage_def.onmouseup = function(e2) {
      that.stage_def.removeChild(mouseLine);
      mouseLine = undefined;
      that.targTerm = undefined;
      that.stage_def.onmousemove = undefined;
      that.stage_def.onmouseup = undefined;
    };
      });

      n.el.addEventListener('termmouseup', function(e) {
      var term = e.detail.term;
      if (that.targTerm !== undefined &&
        term !== that.targTerm &&
        term.isConnected() === false &&
        that.targTerm.isConnected() === false &&
        term.side !== that.targTerm.side &&
        term.parent !== that.targTerm.parent) {
      var id1;
      var idx1;
      var id2;
      var idx2;
      if (term.side === "o") {
      id1 = term.parent.id;
      idx1 = term.parent.getTermIdx(term);
      id2 = that.targTerm.parent.id;
      idx2 = that.targTerm.parent.getTermIdx(that.targTerm);
      } else {
      id2 = term.parent.id;
      idx2 = term.parent.getTermIdx(term);
      id1 = that.targTerm.parent.id;
      idx1 = that.targTerm.parent.getTermIdx(that.targTerm);
      }
      that.$el.trigger('try:terminal:connect', [id1, idx1, id2, idx2]);
    }
      });

      return n;
    };

      hacsac.Stage.prototype.removeNode = function(id) {
      var n = this.nodes[id];
      var ti = n.ti;
      var to = n.to;
      for (var j = 0; j < to.length; j++) {
      var conn = to[j].conn;
      if (conn !== undefined) {
      var opp = conn.getOpposite(to[j]);
      opp.parent.remTerm('i', opp.getIdx());
    }
      }
      this.stage_def.removeChild(n.el);
      delete this.nodes[id];
      n.destroy();
    };

      hacsac.Stage.prototype.moveNode = function(id, x, y) {
      var n = this.nodes[id];
      n.setPos(x, y);
    };

      hacsac.Stage.prototype.addNodeClass = function(id, className) {
      var n = this.nodes[id];
      n.addClass(className);
    };

      hacsac.Stage.prototype.removeNodeClass = function(id, className) {
      var n = this.nodes[id];
      n.removeClass(className);
    };

      hacsac.Stage.prototype.addTerm = function(id, side) {
      var n = this.nodes[id];
      n.addTerm(side);
    };

      hacsac.Stage.prototype.remTerm = function(id, side, idx) {
      var n = this.nodes[id];
      n.remTerm(side, idx);
    };

      hacsac.Stage.prototype.connect = function(id1, idx1, id2, idx2) {
      var n1 = this.nodes[id1];
      var n2 = this.nodes[id2];
      var to = n1.getTerm("o", idx1);
      var ti = n2.getTerm("i", idx2);
      var conn = new hacsac.Conn(to, ti);
      this.stage_def.appendChild(conn.el);
      if (n2.getTermIdx(ti) === n2.getMaxTermIdx('i')) {
      n2.addTerm("i");
      }
};

      hacsac.Stage.prototype.resetNodeTerms = function(id) {
      this.nodes[id].refreshTerms();
    };

      hacsac.Stage.prototype.reset = function() {
      _.each(this.nodes, function(n) {
      this.removeNode(n.id);
    }, this);
};
