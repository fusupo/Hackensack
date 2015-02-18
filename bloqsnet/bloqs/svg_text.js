// ////////////////////////////////////////////////////////////////////////////////
// //                                                                  SVG_TEXT  //
// ////////////////////////////////////////////////////////////////////////////////
var SVG_text = function(spec) {
    spec.type = "svg_text";
    SVG_Proto.call(this, spec);
};
SVG_text.prototype = Object.create(SVG_Proto.prototype);
SVG_text.prototype.constructor = SVG_text;
SVG_text.prototype.get_svg = function() {
    // TODO: Try an factor this out, as has been done with other svg elements
    var solution = this.solveParams();
    var elm = document.createElementNS(bloqsnet.svgNS, this.def.svg_elem);
    this.setAttributes(elm, solution);
    elm.textContent = solution.text;
    return elm;
};
SVG_text.prototype.def = {
    display: true,
    type: 'svg_text',
    svg_elem: 'text',
    categories: ['Graphics Elements',
                 'Text Content Elements'],
    params: [
        paramObj(["text", "string", "default", "specific attributes", false]),
        paramObj(["x", "percpx", "10px", "specific attributes", true]),
        paramObj(["y", "percpx", "10px", "specific attributes", true]),
        paramObj(["fill", "color", "#ffffff", "specific attributes", true]),
        paramObj(["opacity", "number", "1", "specific attributes", true])
    ].concat(
        svg_conditional_processing_attributes,
        svg_core_attributes
    ),
    p: [1, 1],
    c: [1, "n"]
};
bloqsnet.REGISTRY["svg_text"] = SVG_text;
