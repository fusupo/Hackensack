var bloqsnet = bloqsnet || {};
bloqsnet.MANIFEST = [];
bloqsnet.PARA_REGISTRY = {};
bloqsnet.REGISTRY = {};
bloqsnet.svgNS = "http://www.w3.org/2000/svg";

////////////////////////////////////////////////////////////////////////////////

var BaseParam = function(spec, initVal){
    this.spec = spec;
    this.solved = undefined;
    this.value = initVal !== undefined ? initVal : spec.defaultVal;// || undefined;
    this.solve_expr = function(expr, env) {

        var start = (new Date).getTime();
        
        var node = math.parse(expr);
        var filtered = node.filter(function (node) {
            return node.type == 'SymbolNode';
        });

        var res = expr;
        
        if(filtered.length > 0){
            var keys = _.keys(env);
            var haveValsForVars = _.every(filtered, function(i){
                return _.contains(keys, i.name);
            });
            
            if(haveValsForVars){
                try {
                    res = math.eval(expr, env);
                } catch (err) {
                    res = undefined;
                }
            }
        }

        res = isNaN(res) ? undefined : res;
        var diff = (new Date).getTime() - start;

        return res;

    };
};
BaseParam.prototype.toJSON = function(){ return {}; };
BaseParam.prototype.toString = function(){ return ""; };
BaseParam.prototype.update = function(val, env){
    return this.solve_expr(val, env);
};

//////// NUMBER

var number_param = function(spec, initVal){
    BaseParam.call(this, spec, initVal);
};
number_param.prototype = Object.create(BaseParam.prototype);
number_param.prototype.constructor = number_param;
number_param.prototype.update = function(val, env){
    var success = false;
    this.solved = undefined;
    if (isNaN(val)) {
        this.solved = this.solve_expr(val, env);
    }else{
        this.solved = val;
    }
    if (this.solved !== undefined) {
        this.value = val;
        success = true;
    }
    return success;
};
bloqsnet.PARA_REGISTRY["number"] = number_param;

//////// PERCPX

var percpx_param =  function(spec, initVal){
    BaseParam.call(this, spec, initVal);
};
percpx_param.prototype = Object.create(BaseParam.prototype);
percpx_param.prototype.constructor = percpx_param;
percpx_param.prototype.update = function(val, env){
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
bloqsnet.PARA_REGISTRY["percpx"] = percpx_param;

//////// STRING

var string_param =  function(spec, initVal){
    BaseParam.call(this, spec, initVal);
};
string_param.prototype = Object.create(BaseParam.prototype);
string_param.prototype.constructor = string_param;
string_param.prototype.update = function(val, env){
    var success = false;
    this.solved = val;
    this.value = val;
    success = true;
    return success;
};
bloqsnet.PARA_REGISTRY["string"] = string_param;

//////// ENUM

var enum_param =  function(spec, initVal){
    BaseParam.call(this, spec, initVal);
    this.value = this.spec.choices[0];
};
enum_param.prototype = Object.create(BaseParam.prototype);
enum_param.prototype.constructor = enum_param;
enum_param.prototype.update = function(val, env){
    var success = false;
    this.solved = val;
    this.value = val;
    success = true;
    return success;
};
bloqsnet.PARA_REGISTRY["enum"] = enum_param;

//////// JSON

var json_param =  function(spec, initVal){
    BaseParam.call(this, spec, initVal);
    // if(typeof(this.value) === "string"){
    //     this.value = JSON.parse(this.value);
    // }
};
json_param.prototype = Object.create(BaseParam.prototype);
json_param.prototype.constructor = json_param;
json_param.prototype.update = function(val, env){
    var success = false;
    this.solved = undefined;
    try {
        this.solved = JSON.parse(val);
    } catch (err) {
        console.log(err);
        this.solved = undefined;
    }
    if (this.solved !== undefined) {
        this.value = val;
        success = true;
    }
    return success;
};
bloqsnet.PARA_REGISTRY["json"] = json_param;

//////// TRANSFORM

var transform_param =  function(spec, initVal){
    BaseParam.call(this, spec, initVal);
};
transform_param.prototype = Object.create(BaseParam.prototype);
transform_param.prototype.constructor = transform_param;
transform_param.prototype.update = function(val, env){
    var success = false;
    this.value = val;
    this.solved = val;
    success = true;
    return success;
};
bloqsnet.PARA_REGISTRY["transform"] = transform_param;

//////// COLOR

var color_param =  function(spec, initVal){
    BaseParam.call(this, spec, initVal);
};
color_param.prototype = Object.create(BaseParam.prototype);
color_param.prototype.constructor = color_param;
color_param.prototype.update = function(val, env){
    var success = false;
    this.value = val;
    this.solved = val;
    success = true;
    return success;
};
bloqsnet.PARA_REGISTRY["color"] = color_param;

////////////////////////////////////////////////////////////////////////////////

bloqsnet.gimmeTheThing = function(callbacks) {

    return {

        inst: undefined,
        insts: {},
        callbacks: callbacks,

        test_render: undefined,

        new: function(id, type, meta, params) {
            id = id || _.uniqueId('b');
            params = params || {};
            if (this.insts[id] === undefined) {
                var def = bloqsnet.REGISTRY[type].prototype.def;
                return new bloqsnet.REGISTRY[type]({
                    id: id,
                    type: type,
                    meta: meta,
                    params:  _.reduce(def.params, function(memo, p) {
                        memo[p.name] = new bloqsnet.PARA_REGISTRY[p.type](p, params[p.name]);
                        return memo;
                    }, {}, this)
                });
            }
        },
        
        add: function(type, pos) {
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
            bloq.kill();
            delete this.insts[id];
        },
        
        con: function(a, b, silent) {
            silent = silent || false;
            if (a[0] !== b[0] && a[1] != b[1]) {
                this.dscon(a, silent);
                this.dscon(b, silent);

                // from child to parent
                var st = a[1] === "p" ? a : b;
                var et = a[1] === "p" ? b : a;
                var p_bloq = this.insts[st[0]];
                var c_bloq = this.insts[et[0]];

                c_bloq.swapChild(et[2], p_bloq);
                p_bloq.addParent(c_bloq);
                p_bloq.refreshEnvironment();
                
                this.rst_trm(silent);

                if (!silent) this._call_back('change');
                //change:terminal(s)?
                //change:connection?
            }
        },
        
        get: function(id) {
            return this.insts[id];
        },
        
        dscon_chld: function(id, idx) {
            // from parent to child
            var p_bloq = this.insts[id];
            var c_bloq = p_bloq.getChildNodes()[idx];
            if(c_bloq !== "x") c_bloq.addParent("x");
            p_bloq.swapChild(idx, "x");
            //this.rst_trm();
        },
        
        dscon_prnt: function(id, idx) {
            // from child to parent
            var c_bloq = this.insts[id];
            var p_bloq = c_bloq.getParentNode();
            if (p_bloq !== undefined && p_bloq !== "x") p_bloq.swapChild(idx, "x");
            c_bloq.addParent("x");
            //this.rst_trm();
        },
        
        dscon: function(term, silent) {
            silent = silent || false;
            if (term[1] === "c") {
                this.dscon_chld(term[0], term[2]);
            } else {
                this.dscon_prnt(term[0], term[2]);
            }

            if (!silent) this._call_back('change');
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
                var b = this.new(d.id, d.type, _.clone(d.meta), _.clone(d.params));
                this.insts[b.get_id()] = b;
            }, this);

            // wire them up
            _.each(data, function(d) {
                _.each(d.c, function(c, idx) {
                    if (c !== "x") {
                        //this.con([d.id, "c", idx], [c, "p", 0], true); //c, idx, d.id);
                        this.insts[d.id].swapChild(idx, this.insts[c]);
                        this.insts[c].addParent(this.insts[d.id]);
                        this.rst_trm(true);
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
            this.test_render = this.test_render === undefined ? $(this.new("test-render", "root", {}).render_svg()) : this.test_render;
            var rendered = $(this.insts[id].render_svg());
            if (!rendered.is("svg")) {
                var svg = this.test_render;
                svg.empty();
                svg.append(rendered);
                rendered = svg;
            }
            return rendered;
        },
        
        updt_par: function(id, p_name, val) {
            return this.insts[id].updateParam(p_name, val);
        },
        
        updt_mta: function(id, p_name, val) {
            return this.insts[id].updateMeta(p_name, val);
        },
        
        rst_trm: function(silent) {
            silent = silent || false;
            _.each(this.insts, function(i) {
                i.resetTerminals();
            });
            if (!silent) this._call_back('change');
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

var Base = function(spec) {

    // init spec
    spec.type = spec.type || 'base';
    spec.meta = spec.meta || {};
    spec.params = spec.params || {};

    spec.children = bloqsnet.REGISTRY[spec.type].prototype.def.c[0] > 0 ? ["x"] : undefined;
    spec.parent = bloqsnet.REGISTRY[spec.type].prototype.def.p[0] > 0 ? "x" : undefined;

    spec.local_env = {};
    spec.env_chain = [spec.local_env];
    spec.env = {};

    spec.env_dirty = true;
    spec.solution = {};

    // // initialize empty params
    // _.each(bloqsnet.REGISTRY[spec.type].prototype.def.params, function(p) {
    //     if (!_.has(spec.params, p.name)) {
    //         spec.params[p.name] = "";
    //     }
    // });

    // //
    
    //                                                private member variable  //
    var that = this;

    //                                                 public member variable  //
    this.spec = spec;

    //                                                private member function  //

    var collapse_env = function() {
        return _.reduce(spec.env_chain, function(m, e) {
            _.each(e, function(datum, k, l) {
                if (!_.has(m, k)) {
                    m[k] = datum;
                }
            });
            return m;
        }, {});
    };

    //                                             privileged member function  //
    this.solve_expr = function(expr) {

        var start = (new Date).getTime();
        
        var node = math.parse(expr);
        var filtered = node.filter(function (node) {
            return node.type == 'SymbolNode';
        });

        var res = expr;
        
        if(filtered.length > 0){
            var keys = _.keys(spec.env);
            var xxx = _.every(filtered, function(i){
                return _.contains(keys, i.name);
            });
            
            if(xxx){
                //console.log('************************');
                try {
                    res = math.eval(expr, spec.env);
                } catch (err) {
                    //res = this.solve(expr, _.clone(env).slice(1));
                    res = undefined;
                }
            }
        }

        res = isNaN(res) ? undefined : res;
        
        var diff = (new Date).getTime() - start;
        
        return res;

    };

    this.check_env = function() {
        // if(spec.env_dirty){
        spec.env = collapse_env();
        var params_def = bloqsnet.REGISTRY[spec.type].prototype.def.params;
        spec.solution = _.reduce(params_def, function(m, p_def) {
            var raw_val = spec.params[p_def.name].value;
            var success = spec.params[p_def.name].update(raw_val, spec.env);
            m[p_def.name] = spec.params[p_def.name].solved;
            return m;
        }, {}, this);
        //  }

        spec.env_dirty = false;
    };

    this.get_type = function() {
        return spec.type;
    };

    this.get_id = function() {
        return spec.id;
    };

    this.get_params = function() {
        return _.reduce(spec.params, function(m, p, k){
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

    this.swapChild = function(idx, val) {
        spec.children[idx] = val;
    };

    this.addParent = function(parent) {
        spec.parent = parent;
    };

    this.resetTerminals = function() {
        var card = bloqsnet.REGISTRY[spec.type].prototype.def["c"];
        var temp = {};

        if (card[1] === "n") {
            spec.children = _.without(spec.children, "x");
            spec.children.push("x");
        }

    };

    this.setLocalEnvironment = function(data) {
        spec.local_env = data;
        spec.env_chain = [spec.local_env];
        this.refreshEnvironment();
    };

    this.getEnvironment = function() {
        return spec.env_chain;
    };

    this.refreshEnvironment = function() {
        if (spec.parent !== "x" && spec.parent !== undefined) {
            spec.env_chain = _.clone(spec.parent.getEnvironment());
            spec.env_chain.unshift(spec.local_env);
        }
        _.each(spec.children, function(c) {
            if (c !== "x") {
                c.refreshEnvironment();
            }
        });
        spec.env = collapse_env();
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
    var success = false;
    var p = _.findWhere(bloqsnet.REGISTRY[this.spec.type].prototype.def.params, {
        "name": p_name
    });

    success = this.spec.params[p_name].update(val, this.spec.env);
    
    if (success) {
        this.updateLocalEnvironment();
    }else{
        console.log('didnt update param: ' + p_name + ', type: ' + p.type + ', val: ' + val);
    }

    return success;
    
};

Base.prototype.updateLocalEnvironment = function() {};

Base.prototype.toJSON = function() {
    return _.reduce(this.spec, function(m, s, k) {
        switch (k) {
            case "parent":
                if (s !== undefined) {
                    if (s === "x") {
                        m["p"] = ["x"];
                    } else {
                        m["p"] = [s.get_id()];
                    }
                } else {
                    m["p"] = [];
                }
                break;
            case "children":
                if (s !== undefined) {
                    m["c"] = _.map(s, function(c) {
                        if (c === "x") {
                            return "x";
                        } else {
                            return c.get_id();
                        }
                    });
                } else {
                    m["c"] = [];
                }
                break;
            case "id":
            case "type":
            case "meta":
                m[k] = s;
                break;
            case "params":
                m[k] = _.reduce(s, function(mem, val, key){
                    if(val.value !== undefined) mem[key] = val.value;
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

bloqsnet.REGISTRY["base"] = Base;

////////////////////////////////////////////////////////////////////////////////
//                                                                 SVG_PROTO  //
////////////////////////////////////////////////////////////////////////////////

var SVG_Proto = function(spec) {
    spec.type = spec.type || "svg_proto";
    Base.call(this, spec);

    var that = this;

    this.cached_svg = undefined;

    var setAttribute = function(svg_elm, key, val) {
        // NOTE: the undefined check here is a stopgap
        // it really should be mitigated further upstream
        if (val !== undefined && val !== "") {
            svg_elm.setAttribute(key, val);
        }
    };

    this.setAttributes = function(svg_elem, attrs) {
        _.each(attrs, function(attr, k, l) {
            if(_.findWhere(bloqsnet.REGISTRY[spec.type].prototype.def.params,
                           {"name": k}).renderSvg === true){

                switch(k){
                    case "transform":
                        var val = "";
                        if(attr.translate !== undefined)
                            val += "translate(" + attr.translate[0] + ", " + attr.translate[1] + ") ";
                        
                        if(attr.scale !== undefined)
                            val += "scale(" + attr.scale[0] + ", " + attr.scale[1] + ") ";
                        
                        if(attr.rotate !== undefined){
                            val += "rotate(" + attr.rotate[0];
                            if(attr.rotate[1] !== undefined)
                                val += ", " + attr.rotate[1] + ", " + attr.rotate[2];
                            val += ") ";
                        }
                        
                        if(attr.skewX !== undefined)
                            val += "skewX(" + attr.skewX + ") ";
                        
                        if(attr.skewY !== undefined)
                            val += "skewY(" + attr.skewY + ") ";

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

    this.sully_cached_svg_down = function() {
        //console.log('sully_svg_children:' + this.spec.id);
        this.cached_svg = undefined;
        _.each(this.spec.children, function(c) {
            if (c !== "x") {
                c.sully_cached_svg_down();
            }
        });
    };

    this.sully_cached_svg_up = function() {
        //console.log('sully_svg_parent:' + this.spec.id);
        this.cached_svg = undefined;

        if (this.spec.parent != undefined && this.spec.parent !== "x") {
            this.spec.parent.sully_cached_svg_up();
        }
    };
    
};
SVG_Proto.prototype = Object.create(Base.prototype);
SVG_Proto.prototype.constructor = SVG_Proto;

SVG_Proto.prototype.updateParam = function(p_name, val) {
    this.cached_svg = undefined;
    this.sully_cached_svg_up();
    this.sully_cached_svg_down();
    Base.prototype.updateParam.call(this, p_name, val);
    //Base.prototype.updateParam(p_name, val);
};

SVG_Proto.prototype.render_svg = function() {
    //console.log("render: " + this.spec.id);

    if (this.cached_svg === undefined) {
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

    return this.cached_svg;
};

SVG_Proto.prototype.get_svg = function() {};

SVG_Proto.prototype.def = {
    display: false,
    type: 'svg_proto'
};

bloqsnet.REGISTRY["svg_proto"] = SVG_Proto;

//                              DEFINING DEFAULT PARAM GROUPS (per svg spec)  //

////////////////////////////////////////////////////////////////////////////////

var paramObj = function(config){
    var ret = {};

    ret.name = config[0];
    ret.type = config[1];

    if(ret.type === "enum"){
        ret.choices = config[2];
    }else{
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
    params: [
        paramObj(["version", "enum", ["1.1", "1.0"], "specific attributes", true]),
        paramObj(["baseProfile", "string", "none", "specific attributes", true]),
        paramObj(["x", "number", 0, "specific attributes", true]),
        paramObj(["y", "number", 0, "specific attributes", true]),
        paramObj(["width", "number", 0, "specific attributes", true]),
        paramObj(["height", "number", 0, "specific attributes", true]),
        paramObj(["preserveAspectRatio", "string", "xMidYMid meet", "specific attributes", true]), //enum xMinYMin | xMidYMin | xMidYMin | xMinYMid | ...etc also "meet" or "slice"
        paramObj(["contentScriptType", "string", "application/ecmascript", "specific attributes", true]),
        paramObj(["contentStyleType", "string", "text/css", "specific attributes", true]),
        paramObj(["viewBox", "string", "", "specific attributes", true])
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

SVG_g.prototype.get_svg = function() {
    var solution = this.solveParams();
    var g_elm = document.createElementNS(bloqsnet.svgNS, "g");
    this.setAttributes(g_elm, solution);
    return g_elm;
};


SVG_g.prototype.def = {
    display: true,
    type: 'svg_g',
    params: [
        paramObj(["transform", "transform", {}, "specific attributes", true])
    ].concat(
        svg_conditional_processing_attributes,
        svg_core_attributes
    ),
    p: [1, 1],
    c: [1, "n"]
};

bloqsnet.REGISTRY['svg_g'] = SVG_g;

// ////////////////////////////////////////////////////////////////////////////////
// //                                                                  SVG_RECT  //
// ////////////////////////////////////////////////////////////////////////////////

var SVG_rect = function(spec) {
    spec.type = "svg_rect";
    SVG_Proto.call(this, spec);
};
SVG_rect.prototype = Object.create(SVG_Proto.prototype);
SVG_rect.prototype.constructor = SVG_rect;

SVG_rect.prototype.get_svg = function() {
    var solution = this.solveParams();
    var rect_elm = document.createElementNS(bloqsnet.svgNS, "rect");
    this.setAttributes(rect_elm, solution);
    return rect_elm;
};

SVG_rect.prototype.def = {
    display: true,
    type: 'svg_rect',
    params: [
        paramObj(["x", "percpx", "0px", "specific attributes", true]),
        paramObj(["y", "percpx", "0px", "specific attributes", true]),
        paramObj(["width", "percpx", "10px", "specific attributes", true]),
        paramObj(["height", "percpx", "10px", "specific attributes", true]),
        paramObj(["rx", "percpx", "0px", "specific attributes", true]),
        paramObj(["ry", "percpx", "0px", "specific attributes", true]),
        paramObj(["fill", "color", "#ffffff", "specific attributes", true]),
        paramObj(["transform", "transform", {}, "specific attributes", true])
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
    c: [0, 0]
};

bloqsnet.REGISTRY["svg_rect"] = SVG_rect;

////////////////////////////////////////////////////////////////////////////////
//                                                                      ROOT  //
////////////////////////////////////////////////////////////////////////////////

var Root = function(spec) {
    spec.type = "root";
    SVG_Proto.call(this, spec);
};
Root.prototype = Object.create(SVG_Proto.prototype); // See note below
Root.prototype.constructor = Root;

Root.prototype.updateLocalEnvironment = function() {
    this.setLocalEnvironment(JSON.parse(this.spec.params.data.value));
};

Root.prototype.get_svg = function() {
    var solution = this.solveParams();
    var svg_elem = document.createElementNS(bloqsnet.svgNS, "svg");
    this.setAttributes(svg_elem, solution);
    return svg_elem;
};

Root.prototype.def = {
    display: true,
    type: 'root',
    params: [
        paramObj(["width", "percpx", "100%", "specific attributes", true]),
        paramObj(["height", "percpx", "100%", "specific attributes", true]),
        paramObj(["data", "json", "{}", "specific attributes", false])
    ],
    p: [0, 0],
    c: [1, "n"]
};

bloqsnet.REGISTRY["root"] = Root;
