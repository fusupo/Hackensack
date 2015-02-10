////////////////////////////////////////////////////////////////////////////////
//                                                                 SVG_IMAGE  //
////////////////////////////////////////////////////////////////////////////////

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
