////////////////////////////////////////////////////////////////////////////////
//                                                               SVG_ANIMATE  //
////////////////////////////////////////////////////////////////////////////////

var SVG_animate = function(spec) {
    spec.type = "svg_animate";
    SVG_Proto.call(this, spec);
};
SVG_animate.prototype = Object.create(SVG_Proto.prototype);
SVG_animate.prototype.constructor = SVG_animate;

SVG_animate.prototype.render_svg = function() {
    if (this.cached_svg === undefined) {
        var returnSVG;
        if (this.spec.children.length > 0) {
            var child = this.spec.children[0];
            if (child !== "x") {
                var thisSVG = this.get_svg();
                returnSVG = child.render_svg().cloneNode(true);
                returnSVG.appendChild(thisSVG);
            }
        }
        this.cached_svg = returnSVG;
    }
    return this.cached_svg;
};

SVG_animate.prototype.get_svg = function() {
    var solution = this.solveParams();
    var anim_elm = document.createElementNS(bloqsnet.svgNS, "animate");
    this.setAttributes(anim_elm, solution);

    return anim_elm;
};

SVG_animate.prototype.def = {
    display: true,
    type: 'svg_animate',
    params: [
            ["attributeName", "string", "", "specific attributes"],
            ["attributeType", "string", "auto", "specific attributes"],

            ["from", "string", "", "specific attributes"],
            ["to", "string", "", "specific attributes"],
            ["by", "string", "", "specific attributes"],

            ["begin", "string", "", "specific attributes"],
            ["dur", "string", "1", "specific attributes"],
            ["end", "string", "", "specific attributes"],
            ["repeatCount", "string", "indefinite", "specific attributes"],
            ["fill", "string", "remove", "specific attributes"]
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
    c: [1, 1]
};

bloqsnet.REGISTRY["svg_animate"] = SVG_animate;
