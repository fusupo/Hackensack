// ////////////////////////////////////////////////////////////////////////////////
// //                                                                  SVG_RECT  //
// ////////////////////////////////////////////////////////////////////////////////

var SVG_rect = function(spec) {
    spec.type = "svg_rect";
    SVG_Proto.call(this, spec);
};
SVG_rect.prototype = Object.create(SVG_Proto.prototype);
SVG_rect.prototype.constructor = SVG_rect;

SVG_rect.prototype.get_svg = function() {
    var solution = this.solveParams();
    var rect_elm = document.createElementNS(bloqsnet.svgNS, "rect");
    this.setAttributes(rect_elm, solution);
    return rect_elm;
};

SVG_rect.prototype.def = {
    display: true,
    type: 'svg_rect',
    params: [
        paramObj(["x", "percpx", "0px", "specific attributes", true]),
        paramObj(["y", "percpx", "0px", "specific attributes", true]),
        paramObj(["width", "percpx", "10px", "specific attributes", true]),
        paramObj(["height", "percpx", "10px", "specific attributes", true]),
        paramObj(["rx", "percpx", "0px", "specific attributes", true]),
        paramObj(["ry", "percpx", "0px", "specific attributes", true]),
        paramObj(["fill", "color", "#ffffff", "specific attributes", true]),
        paramObj(["transform", "transform", [], "specific attributes", true])
    ].concat(
        svg_conditional_processing_attributes,
        svg_core_attributes
        //graphical_event_attributes,
        //presentation_attributes,
        // - class,
        // - style,
        // - externalResourcesRequired,
    ),
    p: [1, 1],
    c: [1, "n"]
};

bloqsnet.REGISTRY["svg_rect"] = SVG_rect;
