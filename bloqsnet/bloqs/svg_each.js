////////////////////////////////////////////////////////////////////////////////
//                                                                  SVG_EACH  //
////////////////////////////////////////////////////////////////////////////////

var SVG_each = function(spec) {
  spec.type = 'svg_each';
  SVG_Proto.call(this, spec);
};
SVG_each.prototype = Object.create(SVG_Proto.prototype);
SVG_each.prototype.constructor = SVG_each;

SVG_each.prototype.render_svg = function() {
  console.log('RENDER_EACH');
  //if (this.cached_svg === undefined) {
  this.cached_svg_str = this.get_svg_str();
  if (this.spec.children.length > 0) {
    var child = this.spec.children[0];
    if (child !== 'x') {
      var child_svg = child.render_svg();
      var l = this.findInParentEnvironment(this.spec.params.list.value);
      //this.spec.parent.getEnvironment();
      _.each(l, function(d, idx) {
        var obj = {};
        obj[this.spec.id + '_d'] = d;
        obj[this.spec.id + '_idx'] = idx;
        var insertidx = this.cached_svg_str.indexOf('>');
        this.cached_svg_str = this.cached_svg_str.substr(0, insertidx + 1) +
          this.reduce_exprs(child_svg, obj) +
          this.cached_svg_str.substr(insertidx + 1);
      }, this);
    }
  }
  //}
  return this.cached_svg_str;
};

SVG_each.prototype.def = {
  display: true,
  type: 'svg_each',
  svg_elem: 'g',
  params: [
    paramObj(['transform', 'transform', [], 'specific attributes', true]),
    paramObj(['list', 'string', '', 'specific attributes', false])
  ],
  p: [1, 1],
  c: [1, 1]
};

bloqsnet.REGISTRY['svg_each'] = SVG_each;
