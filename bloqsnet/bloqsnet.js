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
