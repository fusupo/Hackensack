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
    circle_elm.setAttribute("cx", solution.cx);
    circle_elm.setAttribute("cy", solution.cy);
    circle_elm.setAttribute("r", solution.r);
    circle_elm.setAttribute("fill", solution.fill);
    return circle_elm;
};

SVG_circle.prototype.def = {
    display: true,
    type: 'svg_circle',
    params: [
        ["cx", "number", 0, "specific attributes"],
        ["cy", "number", 0, "specific attributes"],
        ["r", "number", 10, "specific attributes"],
        ["fill", "color", "#ffffff", "specific attributes"],
        ["transform", "string", "translate(0,0)", "specific attributes"]
    ]
        .concat(
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
