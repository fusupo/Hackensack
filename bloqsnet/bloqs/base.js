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
        var before = spec.children;
        
        if (card[1] === "n") {
            spec.children = _.without(spec.children, "x");
            spec.children.push("x");
        }

        return !_.isEqual(spec.children, before);
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
