////////////////////////////////////////////////////////////////////////////////
//                                                               SVG_ANIMATE  //
////////////////////////////////////////////////////////////////////////////////
var SVG_animate = function(spec) {
    spec.type = "svg_animate";
    SVG_Proto.call(this, spec);
};
SVG_animate.prototype = Object.create(SVG_Proto.prototype);
SVG_animate.prototype.constructor = SVG_animate;
SVG_animate.prototype.def = {
    display: true,
    type: 'svg_animate',
    svg_elem: 'animate',
    categories: ['Animation Elements'],
    params: [
      paramObj(["attributeName", "string", "", "specific attributes", true]),
      paramObj(["attributeType", "string", "auto", "specific attributes", true]),

      paramObj(["from", "percpx", "{0}px", "specific attributes", true]),
      paramObj(["to", "percpx", "{0}px", "specific attributes", true]),
      paramObj(["by", "percpx", "{0}px", "specific attributes", true]),

      paramObj(["begin", "string", "", "specific attributes", true]),
      paramObj(["dur", "string", "{1}", "specific attributes", true]),
      paramObj(["end", "string", "", "specific attributes", true]),
      paramObj(["repeatCount", "string", "indefinite", "specific attributes", true]),
      paramObj(["fill", "string", "remove", "specific attributes", true])
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
bloqsnet.REGISTRY["svg_animate"] = SVG_animate;
