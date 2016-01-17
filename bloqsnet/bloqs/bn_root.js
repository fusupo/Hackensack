////////////////////////////////////////////////////////////////////////////////
//                                                                      ROOT  //
////////////////////////////////////////////////////////////////////////////////

var Root = function(spec) {
  spec.type = "root";
  SVG_Proto.call(this, spec);
};
Root.prototype = Object.create(SVG_Proto.prototype); // See note below
Root.prototype.constructor = Root;

Root.prototype.render_svg = function() {
  this.updateLocalEnvironment();
  if (this.cached_svg === undefined) {
    this.cached_svg_str = this.get_svg_str();
    // if (this.spec.children.length > 0) {
    var child = this.spec.children[0];
    if (child !== "x") {
      var child_svg = child.render_svg();
      var insertIdx = this.cached_svg_str.indexOf(">");
      this.cached_svg_str = this.cached_svg_str.substr(0, insertIdx + 1) +
        child_svg +
        this.cached_svg_str.substr(insertIdx + 1);
      // }, this);
    }

    var obj = JSON.parse(this.spec.params.data.value);
    this.cached_svg_str = this.reduce_exprs(this.cached_svg_str, obj);
    // }
  }
  return this.cached_svg_str;
};

Root.prototype.updateLocalEnvironment = function() {
  console.log("BN ROOT UPDATE LOCAL ENV!!");
  this.setLocalEnvironment(JSON.parse(this.spec.params.data.value));
};

Root.prototype.def = {
  display: true,
  type: 'root',
  svg_elem: 'svg',
  params: [
    paramObj(["width", "percpx", "{100}%", "specific attributes", true]),
    paramObj(["height", "percpx", "{100}%", "specific attributes", true]),
    paramObj(["data", "json", "{}", "specific attributes", false])
  ],
  p: [0, 0],
  c: [1, "n"]
};

bloqsnet.REGISTRY["root"] = Root;
