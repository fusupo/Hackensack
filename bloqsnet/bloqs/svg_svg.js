// ////////////////////////////////////////////////////////////////////////////////
// //                                                                   SVG_SVG  //
// ////////////////////////////////////////////////////////////////////////////////

var SVG_svg = function(spec) {
    spec.type = "svg_svg";
    SVG_Proto.call(this, spec);
};
SVG_svg.prototype = Object.create(SVG_Proto.prototype);
SVG_svg.prototype.constructor = SVG_svg;

SVG_svg.prototype.get_svg = function() {
    var solution = this.solveParams();
    var svg_elm = document.createElementNS(bloqsnet.svgNS, "svg");
    this.setAttributes(svg_elm, solution);
    return svg_elm;
};

SVG_svg.prototype.def = {
    display: true,
    type: 'svg_svg',
    params: [
        paramObj(["version", "enum", ["1.1", "1.0"], "specific attributes", true]),
        paramObj(["baseProfile", "string", "none", "specific attributes", true]),
        paramObj(["x", "number", 0, "specific attributes", true]),
        paramObj(["y", "number", 0, "specific attributes", true]),
        paramObj(["width", "number", 0, "specific attributes", true]),
        paramObj(["height", "number", 0, "specific attributes", true]),
        paramObj(["preserveAspectRatio", "string", "xMidYMid meet", "specific attributes", true]), //enum xMinYMin | xMidYMin | xMidYMin | xMinYMid | ...etc also "meet" or "slice"
        paramObj(["contentScriptType", "string", "application/ecmascript", "specific attributes", true]),
        paramObj(["contentStyleType", "string", "text/css", "specific attributes", true]),
        paramObj(["viewBox", "string", "", "specific attributes", true])
    ].concat(
        svg_conditional_processing_attributes,
        svg_core_attributes
    ),
    p: [1, 1],
    c: [1, "n"]
};

bloqsnet.REGISTRY['svg_svg'] = SVG_svg;
