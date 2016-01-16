// ////////////////////////////////////////////////////////////////////////////////
// //                                                                  SVG_TEXT  //
// ////////////////////////////////////////////////////////////////////////////////
var SVG_text = function(spec) {
  spec.type = "svg_text";
  SVG_Proto.call(this, spec);
};
SVG_text.prototype = Object.create(SVG_Proto.prototype);
SVG_text.prototype.constructor = SVG_text;
// SVG_text.prototype.get_svg = function() {
//   // TODO: Try an factor this out, as has been done with other svg elements
//   var solution = this.solveParams();
//   var elm = document.createElementNS(bloqsnet.svgNS, this.def.svg_elem);
//   this.setAttributes(elm, solution);
//   elm.textContent = solution.text;
//   return elm;
// };
SVG_text.prototype.render_svg = function() {
  console.log('RENDER SVG TEXT, FOOL');
  console.log('RENDER SVG : ' + this.spec.type + '-' + this.spec.id);
  this.cached_svg_str = this.get_svg_str();
  if (this.spec.children != undefined && this.spec.children.length > 0) {
    for (var i = 0; i < this.spec.children.length; i++) {
      var child = this.spec.children[i];
      if (child !== 'x') {
        this.spec.children[i].render_svg();
        var insertIdx = this.cached_svg_str.indexOf('>');
        this.cached_svg_str = this.cached_svg_str.substr(0, insertIdx + 1) +
          this.spec.children[i].cached_svg_str +
          this.cached_svg_str.substr(insertIdx + 1);
      }
    }
  }
  return this.cached_svg_str;
};

SVG_text.prototype.get_svg_str = function() {
  console.log('GET SVG TEXT STR, FOOL');
  // var solution = this.solveParams();
  // console.log(solution);
  var params_def = bloqsnet.REGISTRY[this.spec.type].prototype.def.params;
  var solution2 = _.reduce(params_def, function(m, p_def) {
    m[p_def.name] = this.spec.params[p_def.name].value;
    return m;
  }, {}, this);
  console.log(solution2);
  var elmStr = '<' + this.def.svg_elem + '>'+solution2.text+'</' + this.def.svg_elem + '>';
  elmStr = this.setAttributesStr(elmStr, solution2);
  return elmStr;
};

SVG_text.prototype.def = {
  display: true,
  type: 'svg_text',
  svg_elem: 'text',
  categories: ['Graphics Elements',
               'Text Content Elements'
              ],
  params: [
    paramObj(["text", "string", "\"default\"", "specific attributes", false]),
    paramObj(["x", "percpx", "10px", "specific attributes", true]),
    paramObj(["y", "percpx", "10px", "specific attributes", true]),
    paramObj(["fill", "color", "#ffffff", "specific attributes", true]),
    paramObj(["opacity", "number", "1", "specific attributes", true])
  ].concat(
    svg_conditional_processing_attributes,
    svg_core_attributes
  ),
  p: [1, 1],
  c: [1, "n"]
};
bloqsnet.REGISTRY["svg_text"] = SVG_text;
