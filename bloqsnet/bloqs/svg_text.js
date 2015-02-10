// ////////////////////////////////////////////////////////////////////////////////
// //                                                                  SVG_TEXT  //
// ////////////////////////////////////////////////////////////////////////////////

var SVG_text = function(spec) {
    spec.type = "svg_text";
    SVG_Proto.call(this, spec);
};
SVG_text.prototype = Object.create(SVG_Proto.prototype);
SVG_text.prototype.constructor = SVG_text;

SVG_text.prototype.get_svg = function() {
    var solution = this.solveParams();
    var text_elm = document.createElementNS(bloqsnet.svgNS, "text");
    text_elm.setAttribute("style", "fXSont-family:" + solution.font + ";");
    text_elm.setAttribute("x", solution.x);
    text_elm.setAttribute("y", solution.y);
    text_elm.setAttribute("fill", solution.fill);
    text_elm.setAttribute("opacity", solution.opacity);
    text_elm.textContent = solution.text;

    return text_elm;
};

SVG_text.prototype.def = {
    display: true,
    type: 'svg_text',
    params: [
            ["text", "string", "default", "specific attributes"],
            ["x", "number", 10, "specific attributes"],
            ["y", "number", 10, "specific attributes"],
            ["fill", "color", "#ffffff", "specific attributes"],
            ["opacity", "number", "1", "specific attributes"]
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

bloqsnet.REGISTRY["svg_text"] = SVG_text;
