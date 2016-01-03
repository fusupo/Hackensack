////////////////////////////////////////////////////////////////////////////////
//                                                                 SVG_PROTO  //
////////////////////////////////////////////////////////////////////////////////

var SVG_Proto = function(spec) {
  spec.type = spec.type || "svg_proto";
  Base.call(this, spec);

  this.cached_svg = undefined;

  var setAttribute = function(svg_elm, key, val) {
    // NOTE: the undefined check here is a stopgap
    // it really should be mitigated further upstream
    if (val !== undefined && val !== "" && val !== "0px" && val !== "0px") {
      svg_elm.setAttribute(key, val);
    }
  };

  this.setAttributes = function(svg_elem, attrs) {
    _.each(attrs, function(attr, k) {
      if (_.findWhere(bloqsnet.REGISTRY[spec.type].prototype.def.params, {
        "name": k
      }).renderSvg === true) {
        switch (k) {
        case "transform":
          var val = "";
          _.each(attr, function(a) {
            switch (a.type) {
            case "trans":
              val += "translate(" + a.x + ", " + a.y + ") ";
              break;
            case "scale":
              val += "scale(" + a.x + ", " + a.y + ") ";
              break;
            case "rot":
              val += "rotate(" + a.r;
              if (a.x !== undefined)
                val += ", " + a.x + ", " + a.y;
              val += ") ";
              break;
            case "skewX":
              val += "skewX(" + a.x + ") ";
              break;
            case "skewY":
              val += "skewY(" + a.y + ") ";
              break;
            }
          });
          val = val.slice(0, -1);
          setAttribute(svg_elem, k, val);
          break;
        default:
          setAttribute(svg_elem, k, attr);
          break;
        }
      }
    });
  };

  this.setAttributesStr = function(svg_elem, attrs) {
    _.each(attrs, function(attr, k) {
      if (_.findWhere(bloqsnet.REGISTRY[spec.type].prototype.def.params, {
        "name": k
      }).renderSvg === true) {
        var val = "";
        switch (k) {
        case "transform":
          _.each(attr, function(a) {
            switch (a.type) {
            case "trans":
              val += "translate(" + a.x + ", " + a.y + ") ";
              break;
            case "scale":
              val += "scale(" + a.x + ", " + a.y + ") ";
              break;
            case "rot":
              val += "rotate(" + a.r;
              if (a.x !== undefined)
                val += ", " + a.x + ", " + a.y;
              val += ") ";
              break;
            case "skewX":
              val += "skewX(" + a.x + ") ";
              break;
            case "skewY":
              val += "skewY(" + a.y + ") ";
              break;
            }
          });

          val = val.slice(0, -1);

          break;
        default:
          val = attr;
          break;
        }

        var endOfOpenIdx = svg_elem.indexOf(">");
        var strStart = svg_elem.slice(0, endOfOpenIdx);
        var strEnd = svg_elem.slice(endOfOpenIdx);
        if (val !== undefined && val !== "") {
          svg_elem = strStart + " " + k + "=\"" + val + "\"" + strEnd;
        }
      }
    });
    return svg_elem;
  };
    //this.render_svg();
};

SVG_Proto.prototype = Object.create(Base.prototype);
SVG_Proto.prototype.constructor = SVG_Proto;

SVG_Proto.prototype.render_svg = function() {
  console.log('RENDER SVG, FOOL');
  if (this.cached_svg === undefined) {
    console.log('RENDER SVG : ' + this.spec.type + "-" + this.spec.id);
    this.cached_svg = this.get_svg();
    if (this.spec.children != undefined && this.spec.children.length > 0) {
      for (var i = 0; i < this.spec.children.length; i++) {
        var child = this.spec.children[i];
        if (child !== "x") {
          this.cached_svg.appendChild(this.spec.children[i].render_svg().cloneNode(true));
        }
      }
    }
  }
  console.log(this.cached_svg);
  return this.cached_svg;
};

SVG_Proto.prototype.get_svg = function() {
  console.log('GET SVG, FOOL');
  var solution = this.solveParams();
  var elm = document.createElementNS(bloqsnet.svgNS, this.def.svg_elem);
  this.setAttributes(elm, solution);

  var elmStr = "<" + this.def.svg_elem + "></" + this.def.svg_elem + ">";
  console.log(elmStr);
  elmStr = this.setAttributesStr(elmStr, solution);
  console.log(elmStr);
  return elm;
};

SVG_Proto.prototype.sully_cached_svg_down = function() {
  this.cached_svg = undefined;
  _.each(this.spec.children, function(c) {
    if (c !== "x") {
      c.sully_cached_svg_down();
    }
  });
};

SVG_Proto.prototype.def = {
  display: false,
  type: 'svg_proto'
};

bloqsnet.REGISTRY["svg_proto"] = SVG_Proto;

//                              DEFINING DEFAULT PARAM GROUPS (per svg spec)  //
////////////////////////////////////////////////////////////////////////////////

var paramObj = function(config) {
  var ret = {};

  ret.name = config[0];
  ret.type = config[1];

  if (ret.type === "enum") {
    ret.choices = config[2];
  } else {
    ret.defaultVal = config[2];
  }

  ret.groupName = config[3];
  ret.renderSvg = config[4];

  return ret;
};

var svg_conditional_processing_attributes = [
  paramObj(["requiredExtensions", "string", "", "svg conditional processing attributes", true]),
  paramObj(["requiredFeatures", "string", "", "svg conditional processing attributes", true]),
  paramObj(["systemLanguage", "string", "", "svg conditional processing attributes", true])
];

var svg_core_attributes = [
  paramObj(["id", "string", "", "svg core attributes", true]),
  paramObj(["xml:base", "string", "", "svg core attributes", true]),
  paramObj(["xml:lang", "string", "", "svg core attributes", true]),
  paramObj(["xml:space", "string", "", "svg core attributes", true])
];
