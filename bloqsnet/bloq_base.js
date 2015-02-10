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
        
        var diff = (new Date).getTime() - start;
        //console.log(spec.id + ' --> ' + expr + ' - time:solve - ' + diff);
        return res;

    };

    this.check_env = function() {
        // if(spec.env_dirty){
        spec.env = collapse_env();
        var params_def = bloqsnet.REGISTRY[spec.type].prototype.def.params;
        spec.solution = _.reduce(params_def, function(m, p_def) {
            var expr = spec.params[p_def[0]];
            if(expr !== undefined && expr !== ""){
                switch (p_def[1]) {
                    case "number":
                        if (typeof(expr) === "string") {
                            if (expr.slice(-1) === "%") {
                                m[p_def[0]] = this.solve_expr(expr.slice(0, -1)) + "%";
                            } else {
                                m[p_def[0]] = this.solve_expr(expr);
                            }
                        } else {
                            m[p_def[0]] = expr;
                        }
                        break;
                    case "string":
                        m[p_def[0]] = this.solve_expr(expr) || expr;
                        break;
                    default:
                        m[p_def[0]] = expr;
                        break;
                }
            }
            return m;
        }, {}, this);
        //  }

        spec.env_dirty = false;
    };

    //                                             privileged member function  //
    this.get_type = function() {
        return spec.type;
    };

    this.get_id = function() {
        return spec.id;
    };

    this.get_params = function() {
        return spec.params;
    };

    // initialize empty params
    _.each(bloqsnet.REGISTRY[spec.type].prototype.def.params, function(p) {
        if (!_.has(spec.params, p[0])) {
            spec.params[p[0]] = "";
        }
    });

    //

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
        0: p_name
    });
    switch (p[1]) {
        case "number":
            var res;
            if (typeof(val) === "string" && val.slice(-1) === "%") {
                res = this.solve_expr(val.slice(0, -1));
            } else {
                res = this.solve_expr(val);
            }
            if (res !== undefined) {
                this.spec.params[p_name] = val;
                success = true;
            }
            break;
        case "string":
            this.spec.params[p_name] = val;
            success = true;
            break;
        case "color":
            this.spec.params[p_name] = val;
            success = true;
            break;
        case "json":
            var json;
            try {
                json = JSON.parse(val);
            } catch (err) {
                console.log(err);
                json = undefined;
            }
            if (json !== undefined) {
                this.spec.params[p_name] = val;
                success = true;
            }
            break;
    }

    if (success) {
        this.updateLocalEnvironment();
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
            case "env":
                break;
            case "local_env":
                break;
            default:
                m[k] = s;
                break;
        }
        return m;
    }, {});
};

Base.prototype.def = {
    display: false,
    type: 'base'
};

bloqsnet.REGISTRY["base"] = Base;
