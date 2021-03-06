// ////////////////////////////////////////////////////////////////////////////////
// //                                                               SVG_ELLIPSE  //
// ////////////////////////////////////////////////////////////////////////////////
var SVG_ellipse = function(spec) {
    spec.type = "svg_ellipse";
    SVG_Proto.call(this, spec);
};
SVG_ellipse.prototype = Object.create(SVG_Proto.prototype);
SVG_ellipse.prototype.constructor = SVG_ellipse;
SVG_ellipse.prototype.def = {
    display: true,
    type: 'svg_ellipse',
    svg_elem: 'ellipse',
    categories: ['Basic Shapes',
                 'Graphic Elements',
                 'Shape Elements'],
    params: [
        paramObj(["cx", "percpx", "0px", "specific attributes", true]),
        paramObj(["cy", "percpx", "0px", "specific attributes", true]),
        paramObj(["rx", "percpx", "10px", "specific attributes", true]),
        paramObj(["ry", "percpx", "5px", "specific attributes", true]),
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
    c: [1, "n"] //mostly to enable animnate subnodes (<animate>, <animateColor>, <animateMotion>, <animateTransform>, <mpath>, <set>)
        // (<desc>, <metadata>, <title>)
};
bloqsnet.REGISTRY["svg_ellipse"] = SVG_ellipse;
