// ////////////////////////////////////////////////////////////////////////////////
// //                                                                  SVG_LINE  //
// ////////////////////////////////////////////////////////////////////////////////
var SVG_line = function(spec) {
    spec.type = "svg_line";
    SVG_Proto.call(this, spec);
};
SVG_line.prototype = Object.create(SVG_Proto.prototype);
SVG_line.prototype.constructor = SVG_line;
SVG_line.prototype.def = {
    display: true,
    type: 'svg_line',
    svg_elem: 'line',
    categories: ['Basic Shapes',
                 'Graphic Elements',
                 'Shape Elements'],
    params: [
        paramObj(["x1", "percpx", "0px", "specific attributes", true]),
        paramObj(["y1", "percpx", "0px", "specific attributes", true]),
        paramObj(["x2", "percpx", "10px", "specific attributes", true]),
        paramObj(["y2", "percpx", "10px", "specific attributes", true]),
        paramObj(["stroke", "color", "#000000", "specific attributes", true]),
        paramObj(["stroke-width", "percpx", "2px", "specific attributes", true])
    ].concat(
        svg_conditional_processing_attributes,
        svg_core_attributes
    ),
    p: [1, 1],
    c: [1, "n"] //mostly to enable animnate subnodes (<animate>, <animateColor>, <animateMotion>, <animateTransform>, <mpath>, <set>)
    // (<desc>, <metadata>, <title>)
};
bloqsnet.REGISTRY["svg_line"] = SVG_line;
