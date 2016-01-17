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

  // this.addChild = function(child) {
  //   spec.children.unshift(child);
  // };

  // this.addChildAt = function(child, idx) {
  //   spec.children.splice(idx, 0, child);
  // };

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

  this.setLocalEnvironment = function(data) {
    spec.local_env = data;
    this.refreshEnvironment();
  };

  this.refreshEnvironment = function() {
    spec.env = spec.local_env;
  };

  this.findInParentEnvironment = function(key) {
    if (_.has(this.spec.env, key)) {
      return this.spec.env[key];
    } else if (this.spec.parent !== undefined && this.spec.parent !== 'x') {
      return this.spec.parent.findInParentEnvironment(key);
    }
    return undefined;
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
    //this.sully_env_down();
    //this.updateLocalEnvironment();
  } else {
    console.log("didnt update param: " + p_name + ", type: " + p.type + ", val: " + val);
  }
  return success;
};

Base.prototype.setParam = function(p_name, val) {
  this.spec.params[p_name].set(val);
};

Base.prototype.updateLocalEnvironment = function() {
  this.setLocalEnvironment({});
};

Base.prototype.toJSON = function() {
  return _.reduce(this.spec, function(m, s, k) {
    switch (k) {
    case 'parent':
      if (s !== undefined) {
        if (s === 'x') {
          m.p = ['x'];
        } else {
          m.p = [s.get_id()];
        }
      } else {
        m.p = [];
      }
      break;
    case 'children':
      if (s !== undefined) {
        m.c = _.map(s, function(c) {
          if (c === 'x') {
            return 'x';
          } else {
            return c.get_id();
          }
        });
      } else {
        m.c = [];
      }
      break;
    case 'id':
    case 'type':
    case 'meta':
      m[k] = s;
      break;
    case 'params':
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
  type: 'base',
  params: {}
};

bloqsnet.REGISTRY.base = Base;
