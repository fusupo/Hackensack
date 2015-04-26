function Stage(el_id, w, h) {

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

    //

    var stage_w = 1920;
    var stage_h = 1080;
    var defs = document.createElementNS(this.svgNS, "defs");
    this.stage.appendChild(defs);

    //

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

    //

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

    //

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

    //

    this.currentX = 0;
    this.currentY = 0;
    this.targTerm = undefined;

    //

    var mat = [1, 0, 0, 1, 0, 0];
    // stage_def_bg_rect.onwheel = function(evt){

    //     var d = evt.wheelDeltaY/120;
    //     var isNeg = Math.abs(d) !== d;
    //     mat[0] += d/100;
    //     mat[3] += d/100;
    //     xxx.setAttributeNS(null, "transform", "matrix(" + mat.join(' ') + ")");

    //     console.log(mat[3] * stage_h);
    // };

    var that = this;
    stage_def_bg_rect.onmousedown = function(e) {

        that.$el.trigger("mousedown:stage:bg");

        var ox = e.clientX;
        var oy = e.clientY;

        stage_def_bg_rect.onmousemove = function(e1) {

            var dx = ox - e1.clientX;
            var dy = oy - e1.clientY;

            //

            mat[4] -= dx;
            mat[5] -= dy;

            if (mat[4] > 0) mat[4] = 0;
            if (mat[5] > 0) mat[5] = 0;
            if (mat[4] < (-stage_w + that.w)) mat[4] = -stage_w + that.w;
            if (mat[5] < (-stage_h + that.h)) mat[5] = -stage_h + that.h;

            xxx.setAttributeNS(null, "transform", "matrix(" + mat.join(' ') + ")");

            //

            var mat2 = [mat[0],
                mat[1],
                mat[2],
                mat[3], -mat[4], -mat[5]
            ];

            nav_box.setAttributeNS(null, "transform", "matrix(" + mat2.join(' ') + ")");

            //

            ox -= dx;
            oy -= dy;

        };

        window.onmouseup = function(e2) {
            stage_def_bg_rect.onmousemove = undefined;
            stage_def_bg_rect.onmouseup = undefined;
        };

    };

}

Stage.prototype.addNode = function(id, type, x, y) {

    var n = new Node(id, type);

    n.setPos(x, y);
    this.stage_def.appendChild(n.el);
    this.nodes[id] = n;

    var that = this;
    ////////////////////

    n.$el.on("mousedown:body", function(e, id) {
        that.$el.trigger("mousedown:block:body", id);
    });

    ////////////////////

    var mouseLine = undefined;

    n.el.addEventListener('closemousedown', function(e) {
        //that.removeNode(id);
        that.$el.trigger("mousedown:block:close", id);
    });

    n.el.addEventListener('bodymousedown', function(e) {

        that.currentX = e.detail.clientX;
        that.currentY = e.detail.clientY;

        that.stage_def.onmousemove = function(e1) {
            var cx = e1.clientX;
            var cy = e1.clientY;
            var dx = cx - that.currentX;
            var dy = cy - that.currentY;
            var pos = n.getPos();

            that.currentX = cx;
            that.currentY = cy;

            that.moveNode(n.id, pos.x + dx, pos.y + dy);
        };

        that.stage_def.onmouseup = function(e2) {
            that.stage_def.onmousemove = undefined;
            that.stage_def.onmouseup = undefined;
        };

    });

    n.el.addEventListener('termmousedown', function(e) {

        var term = e.detail.term;
        var isConnected = term.isConnected();
        that.targTerm = term;
        var targPos = term.getPos();

        if (isConnected) {
            console.log('supposedly connnected');
            that.targTerm = term.conn.getOpposite(term);

            //
            var evtobj;
            if (term.side === 'o') {
                evtobj = [term.parent.id, term.getIdx(), that.targTerm.parent.id, that.targTerm.getIdx()];
            } else {
                evtobj = [that.targTerm.parent.id, that.targTerm.getIdx(), term.parent.id, term.getIdx()];
            }
            that.$el.trigger("try:terminal:disconnect", evtobj);
            //

            term.disconn();
            if (term.side === 'i') {
                term.parent.remTerm('i', term.getIdx());
            }
        }

        var anchorPos = that.targTerm.getPos();
        mouseLine = document.createElementNS(that.svgNS, "line");
        mouseLine.setAttribute('stroke', 'black');
        mouseLine.setAttribute('x1', anchorPos.x);
        mouseLine.setAttribute('y1', anchorPos.y);
        mouseLine.setAttribute('x2', targPos.x);
        mouseLine.setAttribute('y2', targPos.y);
        mouseLine.setAttribute("pointer-events", "none");
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

    ////////////////////

    return n;

};

Stage.prototype.removeNode = function(id) {

    var n = this.nodes[id];
    var ti = n.ti;
    var to = n.to;
    // for(var i = 0; i < ti.length; i++) {
    //     var conn = ti[i].conn;
    //     if(conn !== undefined){
    //         var opp = conn.getOpposite(ti[i]);
    //         opp.parent.remTerm('o', opp.getIdx());
    //     }
    // }

    for(var j = 0; j < to.length; j++) {
        var conn = to[j].conn;
        if(conn !== undefined){
            var opp = conn.getOpposite(to[j]);
            opp.parent.remTerm('i', opp.getIdx());
        }
    }
    
    this.stage_def.removeChild(n.el);
    delete this.nodes[id];
    n.destroy();

};

Stage.prototype.moveNode = function(id, x, y) {

    var n = this.nodes[id];
    n.setPos(x, y);

};

Stage.prototype.addTerm = function(id, side) {

    var n = this.nodes[id];
    n.addTerm(side);

};

Stage.prototype.remTerm = function(id, side, idx) {

    console.log("foo");
    var n = this.nodes[id];
    n.remTerm(side, idx);

};

Stage.prototype.connect = function(id1, idx1, id2, idx2) {

    var n1 = this.nodes[id1];
    var n2 = this.nodes[id2];
    var to = n1.getTerm("o", idx1);
    var ti = n2.getTerm("i", idx2);

    var conn = new Conn(to, ti);
    this.stage_def.appendChild(conn.el);

    //
    console.log(n2.getTermIdx(ti) + " === " + n2.getMaxTermIdx('i'));
    
    if(n2.getTermIdx(ti) === n2.getMaxTermIdx('i')){
        n2.addTerm("i");
    }
    
};

// Stage.prototype.disconnect = function(id, side, idx) {

//     var n = this.nodes[id]
// };

Stage.prototype.resetNodeTerms = function(id) {
    this.nodes[id].refreshTerms();
};