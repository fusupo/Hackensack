// ////////////////////////////////////////////////////////////////////////////////
// //                                                                     SVG_G  //
// ////////////////////////////////////////////////////////////////////////////////

var SVG_g = function(spec) {
    spec.type = "svg_g";
    SVG_Proto.call(this, spec);
};
SVG_g.prototype = Object.create(SVG_Proto.prototype);
SVG_g.prototype.constructor = SVG_g;

SVG_g.prototype.get_svg = function() {
    var solution = this.solveParams();
    var g_elm = document.createElementNS(bloqsnet.svgNS, "g");
    this.setAttributes(g_elm, solution);
    return g_elm;
};


SVG_g.prototype.def = {
    display: true,
    type: 'svg_g',
    params: [
        paramObj(["transform", "transform", [], "specific attributes", true])
    ].concat(
        svg_conditional_processing_attributes,
        svg_core_attributes
    ),
    p: [1, 1],
    c: [1, "n"]
};

bloqsnet.REGISTRY['svg_g'] = SVG_g;
