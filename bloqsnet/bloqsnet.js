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
};
BaseParam.prototype.toJSON = function() {
  return this.value;
};
BaseParam.prototype.toString = function() {
  return "";
};
BaseParam.prototype.set = function(val) {
  this.value = val;
};
//////// NUMBER

var number_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
};
number_param.prototype = Object.create(BaseParam.prototype);
number_param.prototype.constructor = number_param;
bloqsnet.PARA_REGISTRY.number = number_param;

//////// PERCPX

var percpx_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
};
percpx_param.prototype = Object.create(BaseParam.prototype);
percpx_param.prototype.constructor = percpx_param;
bloqsnet.PARA_REGISTRY.percpx = percpx_param;

//////// STRING

var string_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
};
string_param.prototype = Object.create(BaseParam.prototype);
string_param.prototype.constructor = string_param;
bloqsnet.PARA_REGISTRY.string = string_param;

//////// ENUM

var enum_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
  this.value = this.spec.choices[0];
};
enum_param.prototype = Object.create(BaseParam.prototype);
enum_param.prototype.constructor = enum_param;
bloqsnet.PARA_REGISTRY.enum = enum_param;

//////// JSON

var json_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
};
json_param.prototype = Object.create(BaseParam.prototype);
json_param.prototype.constructor = json_param;
bloqsnet.PARA_REGISTRY.json = json_param;

//////// TRANSFORM

var transform_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
};
transform_param.prototype = Object.create(BaseParam.prototype);
transform_param.prototype.constructor = transform_param;
bloqsnet.PARA_REGISTRY.transform = transform_param;

//////// COLOR

var color_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
};
color_param.prototype = Object.create(BaseParam.prototype);
color_param.prototype.constructor = color_param;
bloqsnet.PARA_REGISTRY.color = color_param;

//////// PRESERVE ASPECT RATIO

var par_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
};
par_param.prototype = Object.create(BaseParam.prototype);
par_param.prototype.constructor = par_param;
bloqsnet.PARA_REGISTRY.preserveAspectRatio = par_param;

//////// VIEWBOX

var vb_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
};
vb_param.prototype = Object.create(BaseParam.prototype);
vb_param.prototype.constructor = vb_param;
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
            this.con([c, "p", 0], [d.id, "c", idx], false);
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
