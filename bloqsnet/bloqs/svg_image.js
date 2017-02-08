////////////////////////////////////////////////////////////////////////////////
//                                                                 SVG_IMAGE  //
////////////////////////////////////////////////////////////////////////////////
var SVG_image = function(spec){
    spec.type = 'svg_image';
    SVG_Proto.call(this, spec);
}
SVG_image.prototype = Object.create(SVG_Proto.prototype);
SVG_image.prototype.constructor = SVG_image;
SVG_image.prototype.def = {
    display: true,
    type: 'svg_image',
    svg_elem: 'image',
    categories: ['Graphic Elements',
                 'Graphic Referencing Elements'],
    params: [
        paramObj(["xlink:href", "string", "", "specific attributes", true]),
        paramObj(["x", "percpx", "", "specific attributes", true]),
        paramObj(["y", "percpx", "", "specific attributes", true]),
        paramObj(["width", "percpx", "", "specific attributes", true]),
        paramObj(["height", "percpx", "", "specific attributes", true]),
        paramObj(["preserveAspectRatio", "preserveAspectRatio", "xMidYMid meet", "specific attributes", true]), //enum xMinYMin | xMidYMin | xMidYMin | xMinYMid | ...etc also "meet" or "slice"
        paramObj(["transform", "transform", [], "specific attributes", true])
    ].concat(
        svg_conditional_processing_attributes,
        svg_core_attributes
    ),
    p: [1, 1],
    c: [1, "n"] //mostly to enable animnate subnodes (<animate>, <animateColor>, <animateMotion>, <animateTransform>, <mpath>, <set>)
    // (<desc>, <metadata>, <title>)
};

bloqsnet.REGISTRY["svg_image"] = SVG_image;

// bloqsnet.MANIFEST.push("image");
// bloqsnet.REGISTRY["image"] = {

//     def:{
//         params: [["x", "number", 0],
//                  ["y", "number", 0],
//                  ["width", "number", "100%"],
//                  ["height", "number", "100%"],
//                  ["src", "string", ""],
//                  ["aspect", "string", "xMinYMin meet"]],
//         p: [1, 1],
//         c: [0, 0]
//     },

//     func: function (spec) {

//         spec.type = 'image';

//         var that = bloqsnet.REGISTRY["base"].func(spec);

//         that.get_svg = function () {
//             var solution = that.solveParams();
//             var image_elm = document.createElementNS(bloqsnet.svgNS, "image");
//             image_elm.setAttribute("x", solution.x);
//             image_elm.setAttribute("y", solution.y);
//             image_elm.setAttribute("width", solution.width);
//             image_elm.setAttribute("height", solution.height);
//             image_elm.setAttributeNS("http://www.w3.org/1999/xlink", "href",  solution.src);
//             image_elm.setAttributeNS(null, 'visibility', 'visible');
//             image_elm.setAttribute("preserveAspectRatio", solution.aspect);
//             return image_elm;
//         };

//         return that;
//     }

// };
