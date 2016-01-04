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
      //
      var bloq_json = bloq.toJSON();

      this.dscon([id, 'p', 0]);

      _.each(bloq_json.c, function(c, idx) {
        this.dscon([id, 'c', idx]);
      }, this);

      //
      bloq.kill();
      delete this.insts[id];

      this._call_back('remove', id);
    },

    con: function(a, b, silent) {
      console.log('//////////////////// CON', a, b);
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

        // this.rst_trm(silent);

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
          console.log(key, ':', param);
          //b.spec.params[key].update(param, {});
          b.spec.params[key].value = param;
        });
        this.insts[b.get_id()] = b;
        this._call_back('add', b);
      }, this);

      // wire them up
      _.each(data, function(d) {
        _.each(d.c, function(c, idx) {
          if (c !== "x") {
            console.log('\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ BOOYAH!');
            this.con([c, "p", 0], [d.id, "c", idx], false); //c, idx, d.id);
            // this.insts[d.id].swapChild(idx, this.insts[c]);
            // this.insts[c].addParent(this.insts[d.id]);
            // this.rst_trm(true);
            // this._call_back('change:connected', [a, b]);
          }
        }, this);
      }, this);

      this.inst = this.insts[id];

      this.inst.updateLocalEnvironment();
      this.inst.render_svg();
      console.log('crt complete');

      this._call_back('reset', this._inst);

    },

    rndr: function(id) {
      console.log("RNDR");
      // this.test_render = this.test_render === undefined ? $(this.new("test-render", "root", {}).render_svg()) : this.test_render;
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
      console.log("GET_SVG");
      this.test_render = this.test_render || $(this.new("test-render", "root", {}).render_svg());
      this.insts[id].sully_cached_svg_down();
      this.insts[id].render_svg();
      var rendered = $(this.insts[id].cached_svg);
      if (!rendered.is("svg")) {
        var svg = this.test_render;
        svg.empty();
        svg.append(rendered);
        rendered = svg;
      }
      return rendered;
    },

    updt_par: function(id, p_name, val) {
      var success = this.insts[id].updateParam(p_name, val);
      //if (success) {
      this._call_back('change:svg', this.get_svg(id));
        // }
    return success;
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

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
