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
    categories: ['container', 'structural'],
    params: [
        //paramObj(["version", "enum", ["1.1", "1.0"], "specific attributes", true]),
        //paramObj(["baseProfile", "string", "none", "specific attributes", true]),
        paramObj(["x", "percpx", '0px', "specific attributes", true]),
        paramObj(["y", "percpx", '0px', "specific attributes", true]),
        paramObj(["width", "percpx", '100%', "specific attributes", true]),
        paramObj(["height", "percpx", '100%', "specific attributes", true]),
        paramObj(["preserveAspectRatio", "preserveAspectRatio", "xMidYMid meet", "specific attributes", true]), //enum xMinYMin | xMidYMin | xMidYMin | xMinYMid | ...etc also "meet" or "slice"
        //paramObj(["contentScriptType", "string", "application/ecmascript", "specific attributes", true]),
        //paramObj(["contentStyleType", "string", "text/css", "specific attributes", true]),
        paramObj(["viewBox", "viewBox", "0 0 100 100", "specific attributes", true])
    ].concat(
        svg_conditional_processing_attributes,
        svg_core_attributes
    ),
    p: [1, 1],
    c: [1, "n"]
};

bloqsnet.REGISTRY['svg_svg'] = SVG_svg;
