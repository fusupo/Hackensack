// ////////////////////////////////////////////////////////////////////////////////
// //                                                               SVG_ELLIPSE  //
// ////////////////////////////////////////////////////////////////////////////////

var SVG_ellipse = function(spec) {
    spec.type = "svg_ellipse";
    SVG_Proto.call(this, spec);
};
SVG_ellipse.prototype = Object.create(SVG_Proto.prototype);
SVG_ellipse.prototype.constructor = SVG_ellipse;

SVG_ellipse.prototype.get_svg = function() {
    var solution = this.solveParams();
    var ellipse_elm = document.createElementNS(bloqsnet.svgNS, "ellipse");
    this.setAttributes(ellipse_elm, solution);
    return ellipse_elm;
};

SVG_ellipse.prototype.def = {
    display: true,
    type: 'svg_ellipse',
    params: [
        ["cx", "number", 0, "specific attributes"],
        ["cy", "number", 0, "specific attributes"],
        ["rx", "number", 10, "specific attributes"],
        ["ry", "number", 5, "specific attributes"],
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

bloqsnet.REGISTRY["svg_ellipse"] = SVG_ellipse;
