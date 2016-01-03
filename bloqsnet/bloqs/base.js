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

  //

  this.solve_expr = function(expr) {
    console.log("MUTHERFUCK solve expr:" + expr);
    var start,
        node,
        filtered,
        res,
        keys,
        xxx,
        diff;
    start = (new Date()).getTime();
    node = math.parse(expr);
    console.log(node);
    filtered = node.filter(function(node) {
      return node.type == "SymbolNode";
    });
    res = expr;
    if (filtered.length > 0) {
      keys = _.keys(spec.env);
      xxx = _.every(filtered, function(i) {
        return _.contains(keys, i.name);
      });
      if (xxx) {
        try {
          res = math.eval(expr, spec.env);
        } catch (err) {

          //res = this.solve(expr, _.clone(env).slice(1));
          res = undefined;
        }
      }
    }
    res = isNaN(res) ? undefined : res;
    diff = (new Date()).getTime() - start;
    return res;
  };

  this.check_env = function() {
    console.log("check env, " + spec.type + "-" + spec.id + " : " + spec.env_dirty);
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
      console.log(spec.solution);
    }

    spec.env_dirty = false;
  };

  this.setLocalEnvironment = function(data) {
    //if (!_.isEqual(data, spec.local_env)) {
    console.log("SET LOCAL ENV: " + this.spec.type + "-" + this.spec.id);
    spec.local_env = data;
    this.refreshEnvironment();
    //}
  };

  this.refreshEnvironment = function() {

    console.log("REFRESH ENV: " + this.spec.type + "-" + this.spec.id);

    if (spec.parent !== "x" && spec.parent !== undefined) {
      spec.env = _.clone(spec.parent.getEnvironment());
      _.each(spec.local_env, function(v, k, l) {
        spec.env[k] = v;
      });
    } else {
      spec.env = spec.local_env;
    }

    //var spanks = false;

    // no need to propogate nothing
    if (!_.isEmpty(spec.env)) {

      _.each(spec.children, function(c) {
        if (c !== "x") {
          // spanks = true;
          c.refreshEnvironment();
        }
      });

    }

    // if (spanks === false) {
    //   this.foo();
    // } else {
    //   console.log("BAR, mutherfucker");
    // }
  };

  this.sully_env_down = function() {
    console.log("SULLY ENV: " + this.spec.type + "-" + this.spec.id);
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

  //
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

  console.log("UPDATE PARAM: " + this.spec.type + "-" + this.spec.id);

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
