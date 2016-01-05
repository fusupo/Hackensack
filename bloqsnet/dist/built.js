var bloqsnet = bloqsnet || {};
bloqsnet.MANIFEST = [];
bloqsnet.PARA_REGISTRY = {};
bloqsnet.REGISTRY = {};
bloqsnet.svgNS = "http://www.w3.org/2000/svg";

////////////////////////////////////////////////////////////////////////////////

var BaseParam = function(spec, initVal) {
  this.spec = spec;
  this.solved = undefined;
  this.value = initVal !== undefined ? initVal : spec.defaultVal; // || undefined;
  this.solve_expr = function(expr, env) {
    var start,
        node,
        filtered,
        res,
        keys,
        haveValsForVars,
        diff;
    start = (new Date()).getTime();
    node = math.parse(expr);
    console.log(node);
    filtered = node.filter(function(no) {
      console.log(no.type);
      return no.type == 'SymbolNode' || no.type == 'FunctionNode';
    });
    res = expr;
    if (filtered.length > 0) {
      keys = _.keys(env);
      haveValsForVars = _.every(filtered, function(i) {
        return _.contains(keys, i.name);
      });
      // if (haveValsForVars) {
      try {
        res = math.eval(expr, env);
      } catch (err) {
        res = undefined;
      }
      //}
    }
    //problem here is that sometimes we want a result thats NaN as in Array
    // but we don't want results that are NaN as a result of failed solution
    // how to tell the difference?
    //res = isNaN(res) ? undefined : res;
    diff = (new Date()).getTime() - start;
    return typeof res === "string" ? res.replace(/['"]+/g, '') : res;
    //return expr;
  };
};
BaseParam.prototype.toJSON = function() {
  return this.value;
};
BaseParam.prototype.toString = function() {
  return "";
};
BaseParam.prototype.update = function(val, env) {
  return this.solve_expr(val, env);
};
BaseParam.prototype.set = function(val) {
  // return this.solve_expr(val, env);
  this.value = val;
};
//////// NUMBER

var number_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
};
number_param.prototype = Object.create(BaseParam.prototype);
number_param.prototype.constructor = number_param;
number_param.prototype.update = function(val, env) {
  var success = false;
  this.solved = undefined;
  if (isNaN(val)) {
    this.solved = this.solve_expr(val, env);
  } else {
    this.solved = val;
  }
  if (this.solved !== undefined) {
    this.value = val;
    success = true;
  }
  return success;
};
bloqsnet.PARA_REGISTRY.number = number_param;

//////// PERCPX

var percpx_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
};
percpx_param.prototype = Object.create(BaseParam.prototype);
percpx_param.prototype.constructor = percpx_param;
percpx_param.prototype.update = function(val, env) {
  var success = false;
  this.solved = undefined;
  if (val.slice(-1) === "%") {
    this.solved = this.solve_expr(val.slice(0, -1), env) + "%";
  } else {
    this.solved = this.solve_expr(val.slice(0, -2), env) + "px";
  }
  if (this.solved !== undefined) {
    this.value = val;
    success = true;
  }
  return success;
};
bloqsnet.PARA_REGISTRY.percpx = percpx_param;

//////// STRING

var string_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
};
string_param.prototype = Object.create(BaseParam.prototype);
string_param.prototype.constructor = string_param;
string_param.prototype.update = function(val, env) {
  // var success = false;
  // this.solved = val;
  // this.value = val;
  // success = true;
  // return success;
  var success = false;
  this.solved = undefined;
  if (isNaN(val)) {
    this.solved = this.solve_expr(val, env);
  } else {
    this.solved = val;
  }
  if (this.solved !== undefined) {
    this.value = val;
    success = true;
  }
  return success;
};
bloqsnet.PARA_REGISTRY.string = string_param;

//////// ENUM

var enum_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
  this.value = this.spec.choices[0];
};
enum_param.prototype = Object.create(BaseParam.prototype);
enum_param.prototype.constructor = enum_param;
enum_param.prototype.update = function(val, env) {
  var success = false;
  this.solved = val;
  this.value = val;
  success = true;
  return success;
};
bloqsnet.PARA_REGISTRY.enum = enum_param;

//////// JSON

var json_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
  // if(typeof(this.value) === "string"){
  //     this.value = JSON.parse(this.value);
  // }
};
json_param.prototype = Object.create(BaseParam.prototype);
json_param.prototype.constructor = json_param;
json_param.prototype.update = function(val, env) {
  var success = false;
  this.solved = undefined;
  try {
    this.solved = JSON.parse(val);
  } catch (err) {
    this.solved = undefined;
  }
  if (this.solved !== undefined) {
    this.value = val;
    success = true;
  }
  return success;
};
bloqsnet.PARA_REGISTRY.json = json_param;

//////// TRANSFORM

var transform_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
};
transform_param.prototype = Object.create(BaseParam.prototype);
transform_param.prototype.constructor = transform_param;
transform_param.prototype.update = function(val, env) {
  // too lazy to implement the error checking at the moment
  // better do it eventually tho
  var success = false;
  this.solved = [];
  _.each(val, function(p) {
    var sp = {};
    _.each(p, function(v, k) {
      if (k !== "type") {
        console.log(v);
        var vs = typeof(v) === "string" ? this.solve_expr(v, env) : v;
        console.log(vs);
        sp[k] = vs;
      } else {
        sp[k] = v;
      }
    }, this);
    this.solved.push(sp);
  }, this);

  this.value = val;
  success = true;
  return success;
};
bloqsnet.PARA_REGISTRY.transform = transform_param;

//////// COLOR

var color_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
};
color_param.prototype = Object.create(BaseParam.prototype);
color_param.prototype.constructor = color_param;
color_param.prototype.update = function(val, env) {
  var success = false;
  this.value = val;
  this.solved = val;
  success = true;
  return success;
};
bloqsnet.PARA_REGISTRY.color = color_param;

//////// PRESERVE ASPECT RATIO

var par_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
  //this.value = this.spec.choices[0];
};
par_param.prototype = Object.create(BaseParam.prototype);
par_param.prototype.constructor = par_param;
par_param.prototype.update = function(val, env) {
  var success = false;
  this.solved = val;
  this.value = val;
  success = true;
  return success;
};
bloqsnet.PARA_REGISTRY.preserveAspectRatio = par_param;

//////// VIEWBOX

var vb_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
  //this.value = this.spec.choices[0];
};
vb_param.prototype = Object.create(BaseParam.prototype);
vb_param.prototype.constructor = vb_param;
vb_param.prototype.update = function(val, env) {
  var success = false;
  this.solved = undefined;

  var preSolved = _.reduce(val.split(' '), function(m, e, k) {
    var s;
    if (e.slice(-1) === "%") {
      s = this.solve_expr(e.slice(0, -1), env) + "%";
    } else if (val.slice(-2) === "px") {
      s = this.solve_expr(e.slice(0, -2), env) + "px";
    } else {
      s = this.solve_expr(e, env);
    }

    if (s !== undefined) m.push(s);

    return m;
  }, [], this);

  if (preSolved.length === 4) {

    this.value = val;
    this.solved = preSolved.join(' ');
    success = true;
  }

  return success;
};
bloqsnet.PARA_REGISTRY.viewBox = vb_param;

////////////////////////////////////////////////////////////////////////////////

bloqsnet.gimmeTheThing = function(callbacks) {

  return {

    inst: undefined,
    insts: {},
    callbacks: callbacks,
    test_render: undefined,
    maxId:0,

    new: function(id, type, meta, params) {
      if(id && id !== 'test-render'){
        this.maxId = Math.max(parseInt(id.substr(1))+1, this.maxId); 
      }else{
        id = 'b' + this.maxId;
        this.maxId++; 
      }
      params = params || {};
      if (this.insts[id] === undefined) {
        var def = bloqsnet.REGISTRY[type].prototype.def;
        var that = this;
        return new bloqsnet.REGISTRY[type]({
          id: id,
          type: type,
          meta: meta,
          params: _.reduce(def.params, function(memo, p) {
            memo[p.name] = new bloqsnet.PARA_REGISTRY[p.type](p, params[p.name]);
            return memo;
          }, {}, this),
          onTermAdd: function(idx) {
            that._call_back('term:add', [id, idx]);
          },
          onTermRem: function(idx) {
            that._call_back('term:rem', [id, idx]);
          }
        });
      }
    },
    
    rst: function(){
      this.inst= undefined;
      this.insts= {};
      this.callbacks= callbacks;
      this.test_render= undefined;
      this.maxId=0; 
      this._call_back('reset');
    },

    add: function(type, pos, params, meta) {
      var meta = {
        x: pos[0],
        y: pos[1]
      };
      var b = this.new(null, type, meta, null);
      this.insts[b.get_id()] = b;
      this._call_back('add', b);
    },

    rem: function(id) {
      var bloq = this.insts[id];
      var bloq_json = bloq.toJSON();
      this.dscon([id, 'p', 0]);
      _.each(bloq_json.c, function(c, idx) {
        this.dscon([id, 'c', idx]);
      }, this);
      bloq.kill();
      delete this.insts[id];
      this._call_back('remove', id);
    },

    con: function(a, b, silent) {
      silent = silent || false;
      if (a[0] !== b[0] && a[1] != b[1]) {
        this.dscon(a, silent);
        this.dscon(b, silent);
        // from child to parent
        var st = a[1] === "p" ? a : b;
        var et = a[1] === "p" ? b : a;
        var c_bloq = this.insts[st[0]];
        var p_bloq = this.insts[et[0]];
        p_bloq.swapChild(et[2], c_bloq);
        c_bloq.addParent(p_bloq);
        c_bloq.refreshEnvironment();
        this._call_back('term:add', b[0]);
        if (!silent) this._call_back('change:connected', [a, b]);
      }
    },

    get: function(id) {
      return this.insts[id];
    },

    dscon_chld: function(id, idx) {
      // from parent to child
      var p_bloq = this.insts[id];
      var c_bloq = p_bloq.getChildNodes()[idx];
      var success = false;
      if (c_bloq !== undefined && c_bloq !== "x") {
        c_bloq.addParent("x");
        p_bloq.swapChild(idx, "x");
        success = true;
      }
      return success;
    },

    dscon_prnt: function(id, idx) {
      // from child to parent
      var c_bloq = this.insts[id];
      var p_bloq = c_bloq.getParentNode();
      var success = false;
      if (p_bloq !== undefined && p_bloq !== "x") {
        console.log(" --- " + p_bloq.getChildIdx(id));
        p_bloq.swapChild(p_bloq.getChildIdx(id), "x");
        c_bloq.addParent("x");
        success = true;
      }
      return success;
    },

    dscon: function(term, silent) {
      silent = silent || false;
      var success = false;
      if (term[1] === "c") {
        success = this.dscon_chld(term[0], term[2]);
      } else {
        success = this.dscon_prnt(term[0], term[2]);
      }
      if (success) this.rst_trm(silent);
      if (!silent && success) this._call_back('change:disconnected', term);
    },

    getConnectedTerm: function(term) {
      var t;
      if (term[1] === "c") {
        t = this.insts[term[0]].getChildNodes()[term[2]];
        t = t === undefined ? t : t === "x" ? "x" : [t.get_id(), "p", 0];
      } else {
        var n = this.insts[term[0]];
        t = n.getParentNode();
        if (t !== "x") {
          var idx = 0;
          _.find(t.getChildNodes(), function(c, i) {
            idx = i;
            return c === n;
          });
          t = [t.get_id(), "c", idx];
        }
      }
      return t;
    },

    crt: function(data, id) {
      // create bloqs
      _.each(data, function(d) {
        var b = this.new(d.id, d.type, _.clone(d.meta));
        _.each(d.params, function(param, key) {
          b.spec.params[key].value = param;
        });
        this.insts[b.get_id()] = b;
        this._call_back('add', b);
      }, this);
      // wire them up
      _.each(data, function(d) {
        _.each(d.c, function(c, idx) {
          if (c !== "x") {
            this.con([c, "p", 0], [d.id, "c", idx], false); //c, idx, d.id);
          }
        }, this);
      }, this);
      this.inst = this.insts[id];
      this.inst.updateLocalEnvironment();
      this.inst.render_svg();
      // this._call_back('reset', this._inst);
    },

    rndr: function(id) {
      var rendered = $(this.insts[id].render_svg());
      if (!rendered.is("svg")) {
        var svg = this.test_render;
        svg.empty();
        svg.append(rendered);
        rendered = svg;
      }
      return rendered;
    },

    get_svg: function(id) {
      this.test_render = this.test_render || $(this.new("test-render", "root", {}).render_svg());
      this.insts[id].sully_cached_svg_down();
      this.insts[id].render_svg();
      var rendered = this.insts[id].cached_svg_str;
      // if (!rendered.is("svg")) {
      //   var svg = this.test_render;
      //   svg.empty();
      //   svg.append(rendered);
      //   rendered = svg;
      // }
      return rendered;
    },

    updt_par: function(id, p_name, val) {
      var success = this.insts[id].updateParam(p_name, val);
      //if (success) {
      this._call_back('change:svg', this.get_svg(id));
      // }
      return success;
    },

    set_par: function(id, p_name, val){
      this.insts[id].setParam(p_name, val);      
      this._call_back('change:svg', this.get_svg(id));
    },

    updt_mta: function(id, p_name, val) {
      this.insts[id].updateMeta(p_name, val);
      this._call_back('change:meta', [p_name, val]);
    },

    rst_trm: function(silent) {
      silent = silent || false;
      _.each(this.insts, function(i) {
        var didReset = i.resetTerminals();
        if (didReset && !silent) this._call_back('change:terminals', i);
      }, this);
    },

    //////////////////////////////

    _call_back: function(cbk_id, params) {
      if (this.callbacks[cbk_id] !== undefined) {
        this.callbacks[cbk_id](params);
      }
    }

  };

};

var Base = function(spec) {
  console.log("++ NEW: " + spec.type + "-" + spec.id);

  // init spec
  spec.type = spec.type || "base";
  spec.meta = spec.meta || {};
  spec.params = spec.params || {};

  spec.children = bloqsnet.REGISTRY[spec.type].prototype.def.c[0] > 0 ? ["x"] : undefined;
  spec.parent = bloqsnet.REGISTRY[spec.type].prototype.def.p[0] > 0 ? "x" : undefined;

  spec.local_env = {};
  spec.env = {};

  spec.env_dirty = true;
  spec.solution = {};

  //                                               private member variable  //
  //                                                public member variable  //
  this.spec = spec;
  //                                               private member function  //
  //                                            privileged member function  //

  this.get_type = function() {
    return spec.type;
  };

  this.get_id = function() {
    return spec.id;
  };

  this.get_params = function() {
    return _.reduce(spec.params, function(m, p, k) {
      m[k] = p.value;
      return m;
    }, {}, this);
  };

  this.env_val = function(var_name, env) {
    return spec.env[var_name];
  };

  this.solveParams = function() {
    this.check_env();
    return spec.solution;
  };

  this.updateMeta = function(p_name, val) {
    spec.meta[p_name] = val;
    return true;
  };

  //

  this.getParentNode = function() {
    return spec.parent;
  };

  this.getChildNodes = function() {
    return spec.children;
  };

  this.addChild = function(child) {
    spec.children.unshift(child);
  };

  this.addChildAt = function(child, idx) {
    spec.children.splice(idx, 0, child);
  };

  this.getChildIdx = function(id) {
    var r = -1,
        i;
    for (i = 0; i < spec.children.length; i++) {
      if (spec.children[i] !== "x" && spec.children[i].spec.id === id) {
        r = i;
      }
    }
    return r;
  };

  this.swapChild = function(idx, val) {
    spec.children[idx] = val;
  };

  this.addParent = function(parent) {
    spec.parent = parent;
  };

  this.resetTerminals = function() {
    var card, temp, before;
    card = bloqsnet.REGISTRY[spec.type].prototype.def.c;
    temp = {};
    before = spec.children;
    if (card[1] === "n") {
      spec.children = _.without(spec.children, "x");
      spec.children.push("x");
    }
    return !_.isEqual(spec.children, before);
  };

  this.check_env = function() {
    var params_def,
        raw_val,
        success;
    if (spec.env_dirty) {
      params_def = bloqsnet.REGISTRY[spec.type].prototype.def.params;
      spec.solution = _.reduce(params_def, function(m, p_def) {
        raw_val = spec.params[p_def.name].value;
        success = spec.params[p_def.name].update(raw_val, spec.env);
        m[p_def.name] = spec.params[p_def.name].solved;
        return m;
      }, {}, this);
    }
    spec.env_dirty = false;
  };

  this.setLocalEnvironment = function(data) {
    spec.local_env = data;
    this.refreshEnvironment();
  };

  this.refreshEnvironment = function() {
    if (spec.parent !== "x" && spec.parent !== undefined) {
      spec.env = _.clone(spec.parent.getEnvironment());
      _.each(spec.local_env, function(v, k, l) {
        spec.env[k] = v;
      });
    } else {
      spec.env = spec.local_env;
    }
    if (!_.isEmpty(spec.env)) {
      _.each(spec.children, function(c) {
        if (c !== "x") {
          c.refreshEnvironment();
        }
      });
    }
  };

  this.sully_env_down = function() {
    this.spec.env_dirty = true;
    _.each(this.spec.children, function(c) {
      if (c !== "x") {
        c.sully_env_down();
      }
    });
  };

  this.getEnvironment = function() {
    return spec.env;
  };

  this.kill = function() {
    if (spec.parent !== undefined && spec.parent !== "x") {
      var idx = -1;
      _.find(spec.parent.getChildNodes(), function(c, i) {
        idx = i;
        return c === this;
      });
      spec.parent.swapChild(idx, "x");
    }
    spec.parent = "x";
    _.each(spec.children, function(c, idx) {
      if (c !== "x") {
        c.addParent("x");
        spec.children[idx] = "x";
      }
    });
  };
};

Base.prototype.updateParam = function(p_name, val) {
  var success,
      p;
  success = false;
  p = _.findWhere(bloqsnet.REGISTRY[this.spec.type].prototype.def.params, {
    "name": p_name
  });
  success = this.spec.params[p_name].update(val, this.spec.env);
  if (success) {
    this.sully_env_down();
    this.updateLocalEnvironment();
  } else {
    console.log("didnt update param: " + p_name + ", type: " + p.type + ", val: " + val);
  }
  return success;
};

Base.prototype.setParam = function(p_name, val){
  this.spec.params[p_name].set(val);
};

Base.prototype.updateLocalEnvironment = function() {
  this.setLocalEnvironment({});
};

Base.prototype.toJSON = function() {
  return _.reduce(this.spec, function(m, s, k) {
    switch (k) {
    case "parent":
      if (s !== undefined) {
        if (s === "x") {
          m.p = ["x"];
        } else {
          m.p = [s.get_id()];
        }
      } else {
        m.p = [];
      }
      break;
    case "children":
      if (s !== undefined) {
        m.c = _.map(s, function(c) {
          if (c === "x") {
            return "x";
          } else {
            return c.get_id();
          }
        });
      } else {
        m.c = [];
      }
      break;
    case "id":
    case "type":
    case "meta":
      m[k] = s;
      break;
    case "params":
      m[k] = _.reduce(s, function(mem, val, key) {
        if (val.value !== undefined) {
          mem[key] = val.toJSON();
        }
        return mem;
      }, {});
      break;
    default:
      break;
    }
    return m;
  }, {});
};

Base.prototype.def = {
  display: false,
  type: "base",
  params: {}
};

bloqsnet.REGISTRY.base = Base;

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

// ////////////////////////////////////////////////////////////////////////////////
// //                                                                   SVG_SVG  //
// ////////////////////////////////////////////////////////////////////////////////

var SVG_svg = function(spec) {
    spec.type = "svg_svg";
    SVG_Proto.call(this, spec);
};
SVG_svg.prototype = Object.create(SVG_Proto.prototype);
SVG_svg.prototype.constructor = SVG_svg;

SVG_svg.prototype.get_svg = function() {
    var solution = this.solveParams();
    var svg_elm = document.createElementNS(bloqsnet.svgNS, "svg");
    this.setAttributes(svg_elm, solution);
    return svg_elm;
};

SVG_svg.prototype.def = {
    display: true,
    type: 'svg_svg',
    categories: ['container', 'structural'],
    params: [
        //paramObj(["version", "enum", ["1.1", "1.0"], "specific attributes", true]),
        //paramObj(["baseProfile", "string", "none", "specific attributes", true]),
        paramObj(["x", "percpx", '0px', "specific attributes", true]),
        paramObj(["y", "percpx", '0px', "specific attributes", true]),
        paramObj(["width", "percpx", '100%', "specific attributes", true]),
        paramObj(["height", "percpx", '100%', "specific attributes", true]),
        paramObj(["preserveAspectRatio", "preserveAspectRatio", "xMidYMid meet", "specific attributes", true]), //enum xMinYMin | xMidYMin | xMidYMin | xMinYMid | ...etc also "meet" or "slice"
        //paramObj(["contentScriptType", "string", "application/ecmascript", "specific attributes", true]),
        //paramObj(["contentStyleType", "string", "text/css", "specific attributes", true]),
        paramObj(["viewBox", "viewBox", "0 0 100 100", "specific attributes", true])
    ].concat(
        svg_conditional_processing_attributes,
        svg_core_attributes
    ),
    p: [1, 1],
    c: [1, "n"]
};

bloqsnet.REGISTRY['svg_svg'] = SVG_svg;

// ////////////////////////////////////////////////////////////////////////////////
// //                                                                     SVG_G  //
// ////////////////////////////////////////////////////////////////////////////////
var SVG_g = function(spec) {
    spec.type = "svg_g";
    SVG_Proto.call(this, spec);
};
SVG_g.prototype = Object.create(SVG_Proto.prototype);
SVG_g.prototype.constructor = SVG_g;
SVG_g.prototype.def = {
    display: true,
    type: 'svg_g',
    svg_elem: 'g',
    categories: ['Container element',
                 'structural element'],
    params: [
        paramObj(["transform", "transform", [], "specific attributes", true])
    ].concat(
        svg_conditional_processing_attributes,
        svg_core_attributes
    ),
    p: [1, 1],
    c: [1, "n"]
};
bloqsnet.REGISTRY['svg_g'] = SVG_g;

// ////////////////////////////////////////////////////////////////////////////////
// //                                                                SVG_CIRCLE  //
// ////////////////////////////////////////////////////////////////////////////////
var SVG_circle = function(spec) {
    spec.type = "svg_circle";
    SVG_Proto.call(this, spec);
};
SVG_circle.prototype = Object.create(SVG_Proto.prototype);
SVG_circle.prototype.constructor = SVG_circle;
SVG_circle.prototype.def = {
    display: true,
    type: 'svg_circle',
    svg_elem: 'circle',
    categories: ['Basic Shapes',
                 'Graphic Elements',
                 'Shape Elements'],
    params: [
        paramObj(["cx", "percpx",  "0px", "specific attributes", true]),
        paramObj(["cy", "percpx",  "0px", "specific attributes", true]),
        paramObj(["r", "percpx", "10px", "specific attributes", true]),
        paramObj(["fill", "color", "#ffffff", "specific attributes", true]),
        paramObj(["transform", "transform", [], "specific attributes", true])
    ].concat(
        svg_conditional_processing_attributes,
        svg_core_attributes
        //graphical_event_attributes,
        //presentation_attributes,
        // - class,
        // - style,
        // - externalResourcesRequired,
    ),
    p: [1, 1],
    c: [1, "n"] //mostly to enable animnate subnodes (<animate>, <animateColor>, <animateMotion>, <animateTransform>, <mpath>, <set>)
        // (<desc>, <metadata>, <title>)
};
bloqsnet.REGISTRY["svg_circle"] = SVG_circle;

// ////////////////////////////////////////////////////////////////////////////////
// //                                                               SVG_ELLIPSE  //
// ////////////////////////////////////////////////////////////////////////////////
var SVG_ellipse = function(spec) {
    spec.type = "svg_ellipse";
    SVG_Proto.call(this, spec);
};
SVG_ellipse.prototype = Object.create(SVG_Proto.prototype);
SVG_ellipse.prototype.constructor = SVG_ellipse;
SVG_ellipse.prototype.def = {
    display: true,
    type: 'svg_ellipse',
    svg_elem: 'ellipse',
    categories: ['Basic Shapes',
                 'Graphic Elements',
                 'Shape Elements'],
    params: [
        paramObj(["cx", "percpx", "0px", "specific attributes", true]),
        paramObj(["cy", "percpx", "0px", "specific attributes", true]),
        paramObj(["rx", "percpx", "10px", "specific attributes", true]),
        paramObj(["ry", "percpx", "5px", "specific attributes", true]),
        paramObj(["fill", "color", "#ffffff", "specific attributes", true]),
        paramObj(["transform", "transform", [], "specific attributes", true])
    ].concat(
            svg_conditional_processing_attributes,
            svg_core_attributes
            //graphical_event_attributes,
            //presentation_attributes,
            // - class,
            // - style,
            // - externalResourcesRequired,
        ),
    p: [1, 1],
    c: [1, "n"] //mostly to enable animnate subnodes (<animate>, <animateColor>, <animateMotion>, <animateTransform>, <mpath>, <set>)
        // (<desc>, <metadata>, <title>)
};
bloqsnet.REGISTRY["svg_ellipse"] = SVG_ellipse;

// ////////////////////////////////////////////////////////////////////////////////
// //                                                                  SVG_LINE  //
// ////////////////////////////////////////////////////////////////////////////////
var SVG_line = function(spec) {
    spec.type = "svg_line";
    SVG_Proto.call(this, spec);
};
SVG_line.prototype = Object.create(SVG_Proto.prototype);
SVG_line.prototype.constructor = SVG_line;
SVG_line.prototype.def = {
    display: true,
    type: 'svg_line',
    svg_elem: 'line',
    categories: ['Basic Shapes',
                 'Graphic Elements',
                 'Shape Elements'],
    params: [
        paramObj(["x1", "percpx", "0px", "specific attributes", true]),
        paramObj(["y1", "percpx", "0px", "specific attributes", true]),
        paramObj(["x2", "percpx", "10px", "specific attributes", true]),
        paramObj(["y2", "percpx", "10px", "specific attributes", true]),
        paramObj(["stroke", "color", "#000000", "specific attributes", true]),
        paramObj(["stroke-width", "percpx", "2px", "specific attributes", true])
    ].concat(
        svg_conditional_processing_attributes,
        svg_core_attributes
    ),
    p: [1, 1],
    c: [1, "n"] //mostly to enable animnate subnodes (<animate>, <animateColor>, <animateMotion>, <animateTransform>, <mpath>, <set>)
    // (<desc>, <metadata>, <title>)
};
bloqsnet.REGISTRY["svg_line"] = SVG_line;

// ////////////////////////////////////////////////////////////////////////////////
// //                                                                  SVG_RECT  //
// ////////////////////////////////////////////////////////////////////////////////
var SVG_rect = function(spec) {
    spec.type = "svg_rect";
    SVG_Proto.call(this, spec);
};
SVG_rect.prototype = Object.create(SVG_Proto.prototype);
SVG_rect.prototype.constructor = SVG_rect;
SVG_rect.prototype.def = {
    display: true,
    type: 'svg_rect',
    svg_elem: 'rect',
    categories: ['Basic Shapes',
                 'Graphic Elements',
                 'Shape Elements'],
    params: [
        paramObj(["x", "percpx", "0px", "specific attributes", true]),
        paramObj(["y", "percpx", "0px", "specific attributes", true]),
        paramObj(["width", "percpx", "10px", "specific attributes", true]),
        paramObj(["height", "percpx", "10px", "specific attributes", true]),
        paramObj(["rx", "percpx", "0px", "specific attributes", true]),
        paramObj(["ry", "percpx", "0px", "specific attributes", true]),
        paramObj(["fill", "color", "#ffffff", "specific attributes", true]),
        paramObj(["transform", "transform", [], "specific attributes", true])
    ].concat(
        svg_conditional_processing_attributes,
        svg_core_attributes
        //graphical_event_attributes,
        //presentation_attributes,
        // - class,
        // - style,
        // - externalResourcesRequired,
    ),
    p: [1, 1],
    c: [1, "n"] //mostly to enable animnate subnodes (<animate>, <animateColor>, <animateMotion>, <animateTransform>, <mpath>, <set>)
        // (<desc>, <metadata>, <title>)
};
bloqsnet.REGISTRY["svg_rect"] = SVG_rect;

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
    // TODO: Try an factor this out, as has been done with other svg elements
    var solution = this.solveParams();
    var elm = document.createElementNS(bloqsnet.svgNS, this.def.svg_elem);
    this.setAttributes(elm, solution);
    elm.textContent = solution.text;
    return elm;
};
SVG_text.prototype.def = {
    display: true,
    type: 'svg_text',
    svg_elem: 'text',
    categories: ['Graphics Elements',
                 'Text Content Elements'],
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

////////////////////////////////////////////////////////////////////////////////
//                                                               SVG_ANIMATE  //
////////////////////////////////////////////////////////////////////////////////
var SVG_animate = function(spec) {
    spec.type = "svg_animate";
    SVG_Proto.call(this, spec);
};
SVG_animate.prototype = Object.create(SVG_Proto.prototype);
SVG_animate.prototype.constructor = SVG_animate;
SVG_animate.prototype.def = {
    display: true,
    type: 'svg_animate',
    svg_elem: 'animate',
    categories: ['Animation Elements'],
    params: [
        paramObj(["attributeName", "string", "", "specific attributes", true]),
      paramObj(["attributeType", "string", "\"auto\"", "specific attributes", true]),

      paramObj(["from", "percpx", "0px", "specific attributes", true]),
      paramObj(["to", "percpx", "0px", "specific attributes", true]),
      paramObj(["by", "percpx", "0px", "specific attributes", true]),

      paramObj(["begin", "string", "", "specific attributes", true]),
      paramObj(["dur", "string", "1", "specific attributes", true]),
      paramObj(["end", "string", "", "specific attributes", true]),
      paramObj(["repeatCount", "string", "\"indefinite\"", "specific attributes", true]),
      paramObj(["fill", "string", "\"remove\"", "specific attributes", true])
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
  c: [0, 0]
};
bloqsnet.REGISTRY["svg_animate"] = SVG_animate;

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
  if (this.cached_svg === undefined) {
    this.cached_svg_str = this.get_svg_str();
    // if (this.spec.children.length > 0) {
    var child = this.spec.children[0];
    if (child !== "x") {
      var child_svg = child.render_svg();
      // var l = this.env_val(this.spec.params.list.value);
      // _.each(l, function(d, idx) {
      var obj = JSON.parse(this.spec.params.data.value);
      var insertIdx = this.cached_svg_str.indexOf(">");
      this.cached_svg_str = this.cached_svg_str.substr(0, insertIdx + 1) +
        this.reduce_exprs(child_svg, obj) +
        this.cached_svg_str.substr(insertIdx + 1);
      // }, this);
    }
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
    paramObj(["width", "percpx", "100%", "specific attributes", true]),
    paramObj(["height", "percpx", "100%", "specific attributes", true]),
    paramObj(["data", "json", "{}", "specific attributes", false])
  ],
  p: [0, 0],
  c: [1, "n"]
};

bloqsnet.REGISTRY["root"] = Root;

////////////////////////////////////////////////////////////////////////////////
//                                                                  SVG_EACH  //
////////////////////////////////////////////////////////////////////////////////

var SVG_each = function(spec) {
  spec.type = "svg_each";
  SVG_Proto.call(this, spec);
};
SVG_each.prototype = Object.create(SVG_Proto.prototype);
SVG_each.prototype.constructor = SVG_each;

SVG_each.prototype.render_svg = function() {
  //if (this.cached_svg === undefined) {
  this.cached_svg_str = this.get_svg_str();
  if (this.spec.children.length > 0) {
    var child = this.spec.children[0];
    if (child !== "x") {
      var child_svg = child.render_svg();
      var l = this.env_val(this.spec.params.list.value);
      _.each(l, function(d, idx) {
        var obj = {};
        obj[this.spec.id + "_d"] = d;
        obj[this.spec.id + "_idx"] = idx;
        var insertIdx = this.cached_svg_str.indexOf(">");
        this.cached_svg_str = this.cached_svg_str.substr(0, insertIdx + 1) +
          this.reduce_exprs(child_svg, obj) +
          this.cached_svg_str.substr(insertIdx + 1);
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
    paramObj(["transform", "transform", [], "specific attributes", true]),
    paramObj(["list", "string", "", "specific attributes", false])
  ],
  p: [1, 1],
  c: [1, 1]
};

bloqsnet.REGISTRY["svg_each"] = SVG_each;
