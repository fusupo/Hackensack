////////////////////////////////////////////////////////////////////////////////
//                                                                      ROOT  //
////////////////////////////////////////////////////////////////////////////////

var Root = function(spec) {
    spec.type = "root";
    SVG_Proto.call(this, spec);
};
Root.prototype = Object.create(SVG_Proto.prototype); // See note below
Root.prototype.constructor = Root;

Root.prototype.updateLocalEnvironment = function() {
    this.setLocalEnvironment(JSON.parse(this.spec.params.data.value));
};

Root.prototype.get_svg = function() {
    var solution = this.solveParams();
    var svg_elem = document.createElementNS(bloqsnet.svgNS, "svg");
    this.setAttributes(svg_elem, solution);
    return svg_elem;
};

Root.prototype.def = {
    display: true,
    type: 'root',
    params: [
        paramObj(["width", "percpx", "100%", "specific attributes", true]),
        paramObj(["height", "percpx", "100%", "specific attributes", true]),
        paramObj(["data", "json", "{}", "specific attributes", false])
    ],
    p: [0, 0],
    c: [1, "n"]
};

bloqsnet.REGISTRY["root"] = Root;
