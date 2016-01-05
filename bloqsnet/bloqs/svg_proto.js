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
  //if (this.cached_svg === undefined) {
  console.log('RENDER SVG : ' + this.spec.type + "-" + this.spec.id);
  this.cached_svg_str = this.get_svg_str();
  if (this.spec.children != undefined && this.spec.children.length > 0) {
    for (var i = 0; i < this.spec.children.length; i++) {
      var child = this.spec.children[i];
      if (child !== "x") {
        this.spec.children[i].render_svg();
        var insertIdx = this.cached_svg_str.indexOf(">");
        this.cached_svg_str = this.cached_svg_str.substr(0, insertIdx + 1) +
          this.spec.children[i].cached_svg_str +
          this.cached_svg_str.substr(insertIdx + 1);
      }
    }
  }
    //}
return this.cached_svg_str;
};

SVG_Proto.prototype.get_svg_str = function() {
  console.log('GET SVG STR, FOOL');
  // var solution = this.solveParams();
  // console.log(solution);
  var params_def = bloqsnet.REGISTRY[this.spec.type].prototype.def.params;
  var solution2 = _.reduce(params_def, function(m, p_def) {
    m[p_def.name] = this.spec.params[p_def.name].value;
    return m;
  }, {}, this);
  console.log(solution2);
  var elmStr = "<" + this.def.svg_elem + "></" + this.def.svg_elem + ">";
  elmStr = this.setAttributesStr(elmStr, solution2);
  return elmStr;
};

SVG_Proto.prototype.sully_cached_svg_down = function() {
  this.cached_svg = undefined;
  _.each(this.spec.children, function(c) {
    if (c !== "x") {
      c.sully_cached_svg_down();
    }
  });
};

SVG_Proto.prototype.reduce_exprs = function(svg, obj){
  return _.map(svg.match(/\{.*?\}|.+?(?=\{|$)/g), function(str) {
    if (str.substr(0, 1) === "{") {
      var expr = str.substr(1, str.length - 2);
      var node = math.parse(expr, obj);
      var transformed = node.transform(function(n, path, parent) {
        if (n.type === "SymbolNode") {
          if (_.has(obj, n.name)) {
            return new math.expression.node.ConstantNode(obj[n.name]);
          }
          return n;
        } else {
          return n;
        }
      });
      var r = transformed.toString().replace(/\s+/g, '');;
      try{
        r = math.compile(transformed.toString()).eval({});
      }catch(e){
        r = '{'+ r +'}';
      }
      str = r;
    }
    return str;
  }).join('');
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
