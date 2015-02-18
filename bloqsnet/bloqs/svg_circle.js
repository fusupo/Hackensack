// ////////////////////////////////////////////////////////////////////////////////
// //                                                                SVG_CIRCLE  //
// ////////////////////////////////////////////////////////////////////////////////
var SVG_circle = function(spec) {
    spec.type = "svg_circle";
    SVG_Proto.call(this, spec);
};
SVG_circle.prototype = Object.create(SVG_Proto.prototype);
SVG_circle.prototype.constructor = SVG_circle;
SVG_circle.prototype.def = {
    display: true,
    type: 'svg_circle',
    svg_elem: 'circle',
    categories: ['Basic Shapes',
                 'Graphic Elements',
                 'Shape Elements'],
    params: [
        paramObj(["cx", "percpx",  "0px", "specific attributes", true]),
        paramObj(["cy", "percpx",  "0px", "specific attributes", true]),
        paramObj(["r", "percpx", "10px", "specific attributes", true]),
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
bloqsnet.REGISTRY["svg_circle"] = SVG_circle;
