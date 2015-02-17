////////////////////////////////////////////////////////////////////////////////
//                                                                  SVG_EACH  //
////////////////////////////////////////////////////////////////////////////////

var SVG_each = function(spec) {
    spec.type = "svg_each";
    SVG_Proto.call(this, spec);
};
SVG_each.prototype = Object.create(SVG_Proto.prototype);
SVG_each.prototype.constructor = SVG_each;

SVG_each.prototype.render_svg = function() {
        //if (this.cached_svg === undefined) {
            var xxx = this.get_svg();
            if (this.spec.children.length > 0) {
                var child = this.spec.children[0];
                if (child !== "x") {
                    var l = this.env_val(this.spec.params.list.value);
                    _.each(l, function(d, idx) {
                        var obj = {};
                        obj[this.spec.id + "_d"] = d;
                        obj[this.spec.id + "_idx"] = idx;
                        this.setLocalEnvironment(obj);
                        child.sully_cached_svg_down();
                        xxx.appendChild(child.render_svg().cloneNode(true));
                    }, this);
                }
            }
            this.cached_svg = xxx;
        // }
return this.cached_svg;
};

SVG_each.prototype.get_svg = function() {
    var solution = this.solveParams();
    var svg_elem = document.createElementNS(bloqsnet.svgNS, "g");
    this.setAttributes(svg_elem, solution);
    return svg_elem;
};

SVG_each.prototype.def = {
    display: true,
    type: 'svg_each',
    params: [
        paramObj(["transform", "transform", [], "specific attributes", true]),
        paramObj(["list", "string", "", "specific attributes", false])
    ],
    p: [1, 1],
    c: [1, 1]
};

bloqsnet.REGISTRY["svg_each"] = SVG_each;
