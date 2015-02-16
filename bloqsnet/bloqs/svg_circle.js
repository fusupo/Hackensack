// ////////////////////////////////////////////////////////////////////////////////
// //                                                                SVG_CIRCLE  //
// ////////////////////////////////////////////////////////////////////////////////

var SVG_circle = function(spec) {
    spec.type = "svg_circle";
    SVG_Proto.call(this, spec);
};
SVG_circle.prototype = Object.create(SVG_Proto.prototype);
SVG_circle.prototype.constructor = SVG_circle;

SVG_circle.prototype.get_svg = function() {
    var solution = this.solveParams();
    var circle_elm = document.createElementNS(bloqsnet.svgNS, "circle");
    
    this.setAttributes(circle_elm, solution);
    // this.setAttribute("cx", solution.cx);
    // this.setAttribute("cy", solution.cy);
    // this.setAttribute("r", solution.r);
    // this.setAttribute("fill", solution.fill);
    return circle_elm;
};

SVG_circle.prototype.def = {
    display: true,
    type: 'svg_circle',
    params: [
        paramObj(["cx", "percpx",  "0px", "specific attributes", true]),
        paramObj(["cy", "percpx",  "0px", "specific attributes", true]),
        paramObj(["r", "percpx", "10px", "specific attributes", true]),
        paramObj(["fill", "color", "#ffffff", "specific attributes", true]),
        paramObj(["transform", "transform", '[]', "specific attributes", true])
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
    c: [0, 0]
};

bloqsnet.REGISTRY["svg_circle"] = SVG_circle;
