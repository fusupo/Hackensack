// ////////////////////////////////////////////////////////////////////////////////
// //                                                                  SVG_RECT  //
// ////////////////////////////////////////////////////////////////////////////////
var SVG_rect = function(spec) {
    spec.type = "svg_rect";
    SVG_Proto.call(this, spec);
};
SVG_rect.prototype = Object.create(SVG_Proto.prototype);
SVG_rect.prototype.constructor = SVG_rect;
SVG_rect.prototype.def = {
    display: true,
    type: 'svg_rect',
    svg_elem: 'rect',
    categories: ['Basic Shapes',
                 'Graphic Elements',
                 'Shape Elements'],
    params: [
      paramObj(["x", "percpx", "{0}px", "specific attributes", true]),
      paramObj(["y", "percpx", "{0}px", "specific attributes", true]),
      paramObj(["width", "percpx", "{10}px", "specific attributes", true]),
      paramObj(["height", "percpx", "{10}px", "specific attributes", true]),
      paramObj(["rx", "percpx", "{0}px", "specific attributes", true]),
      paramObj(["ry", "percpx", "{0}px", "specific attributes", true]),
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
bloqsnet.REGISTRY["svg_rect"] = SVG_rect;
