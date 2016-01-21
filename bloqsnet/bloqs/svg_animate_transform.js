////////////////////////////////////////////////////////////////////////////////
//                                                               SVG_ANIMATE  //
////////////////////////////////////////////////////////////////////////////////
var SVG_animate_transform = function(spec) {
    spec.type = "svg_animate_transform";
    SVG_Proto.call(this, spec);
};
SVG_animate_transform.prototype = Object.create(SVG_Proto.prototype);
SVG_animate_transform.prototype.constructor = SVG_animate_transform;
SVG_animate_transform.prototype.def = {
    display: true,
    type: 'svg_animate_transform',
    svg_elem: 'animateTransform',
    categories: ['Animation Elements'],
    params: [
        paramObj(["attributeName", "string", "transform", "specific attributes", true]),
        paramObj(["from", "threeField", "{1}", "specific attributes", true]),
        paramObj(["to", "threeField", "{2}", "specific attributes", true]),
        paramObj(["by", "threeField", "{}", "specific attributes", true]),
        paramObj(["dur", "percpx", "{1}", "specific attributes", true]),
        paramObj(["repeatCount", "string", "indefinite", "specific attributes", true]),
        paramObj(["type", "string", "scale", "specific attributes", true]),

    ] // enum : "remove" | "freeze"
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
bloqsnet.REGISTRY["svg_animate_transform"] = SVG_animate_transform;
