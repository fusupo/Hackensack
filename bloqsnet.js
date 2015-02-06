var bloqsnet = bloqsnet || {};
bloqsnet.MANIFEST = [];
bloqsnet.REGISTRY = {};
bloqsnet.svgNS = "http://www.w3.org/2000/svg";

////////////////////////////////////////////////////////////////////////////////

bloqsnet.gimmeTheThing = function(callbacks) {

    return {

        inst: undefined,
        insts: {},
        callbacks: callbacks,

        test_render: undefined,

        new: function(id, type, meta, params) {
            id = id || _.uniqueId('b');
            if (this.insts[id] === undefined) {
                var def = bloqsnet.REGISTRY[type].prototype.def;
                var pars = params || _.reduce(def.params, function(memo, p) {
                    memo[p[0]] = p[2];
                    return memo;
                }, {});
                return new bloqsnet.REGISTRY[type]({
                    id: id,
                    type: type,
                    meta: meta,
                    params: pars
                });
            } else {
                this.insts[id];
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
            c_bloq !== "x" ? c_bloq.addParent("x") : null;
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
            setAttribute(svg_elem, k, attr);
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

var svg_conditional_processing_attributes = [
    ["requiredExtensions", "string", "", "svg conditional processing attributes"],
    ["requiredFeatures", "string", "", "svg conditional processing attributes"],
    ["systemLanguage", "string", "", "svg conditional processing attributes"]
];

var svg_core_attributes = [
    ["id", "string", "", "svg core attributes"],
    ["xml:base", "string", "", "svg core attributes"],
    ["xml:lang", "string", "", "svg core attributes"],
    ["xml:space", "string", "", "svg core attributes"],
];


////////////////////////////////////////////////////////////////////////////////
//                                                                   SVG_SVG  //
////////////////////////////////////////////////////////////////////////////////

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
        ["version", "number", 1.1, "specific attributes"], //enum 1.0 | 1.1
        ["baseProfile", "string", "none", "specific attributes"],
        ["x", "number", 0, "specific attributes"],
        ["y", "number", 0, "specific attributes"],
        ["width", "number", 0, "specific attributes"],
        ["height", "number", 0, "specific attributes"],
        ["preserveAspectRatio", "string", "xMidYMid meet", "specific attributes"], //enum xMinYMin | xMidYMin | xMidYMin | xMinYMid | ...etc also "meet" or "slice"
        ["contentScriptType", "string", "application/ecmascript", "specific attributes"],
        ["contentStyleType", "string", "text/css", "specific attributes"],
        ["viewBox", "string", "", "specific attributes"]
    ]
        .concat(
            svg_conditional_processing_attributes,
            svg_core_attributes
        ),
    p: [1, 1],
    c: [1, "n"]
};

bloqsnet.REGISTRY['svg_svg'] = SVG_svg;

////////////////////////////////////////////////////////////////////////////////
//                                                                     SVG_G  //
////////////////////////////////////////////////////////////////////////////////

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
        ["transform", "string", "translate(0,0)", "specific attributes"]
    ]
        .concat(
            svg_conditional_processing_attributes,
            svg_core_attributes
        ),
    p: [1, 1],
    c: [1, "n"]
};

bloqsnet.REGISTRY['svg_g'] = SVG_g;

////////////////////////////////////////////////////////////////////////////////
//                                                                 SVG_SHAPE  //
////////////////////////////////////////////////////////////////////////////////

var Shape;

////////////////////////////////////////////////////////////////////////////////
//                                                                  SVG_RECT  //
////////////////////////////////////////////////////////////////////////////////

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
        ["x", "number", 0, "specific attributes"],
        ["y", "number", 0, "specific attributes"],
        ["width", "number", 10, "specific attributes"],
        ["height", "number", 10, "specific attributes"],
        ["rx", "number", 0, "specific attributes"],
        ["ry", "number", 0, "specific attributes"],
        ["fill", "color", "#ffffff", "specific attributes"],
        ["transform", "string", "translate(0,0)", "specific attributes"]
    ]
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

bloqsnet.REGISTRY["svg_rect"] = SVG_rect;

////////////////////////////////////////////////////////////////////////////////
//                                                                SVG_CIRCLE  //
////////////////////////////////////////////////////////////////////////////////

var SVG_circle = function(spec) {
    spec.type = "svg_circle";
    SVG_Proto.call(this, spec);
};
SVG_circle.prototype = Object.create(SVG_Proto.prototype);
SVG_circle.prototype.constructor = SVG_circle;

SVG_circle.prototype.get_svg = function() {
    var solution = this.solveParams();
    var circle_elm = document.createElementNS(bloqsnet.svgNS, "circle");
    circle_elm.setAttribute("cx", solution.cx);
    circle_elm.setAttribute("cy", solution.cy);
    circle_elm.setAttribute("r", solution.r);
    circle_elm.setAttribute("fill", solution.fill);
    return circle_elm;
};

SVG_circle.prototype.def = {
    display: true,
    type: 'svg_circle',
    params: [
        ["cx", "number", 0, "specific attributes"],
        ["cy", "number", 0, "specific attributes"],
        ["r", "number", 10, "specific attributes"],
        ["fill", "color", "#ffffff", "specific attributes"],
        ["transform", "string", "translate(0,0)", "specific attributes"]
    ]
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

bloqsnet.REGISTRY["svg_circle"] = SVG_circle;

////////////////////////////////////////////////////////////////////////////////
//                                                               SVG_ELLIPSE  //
////////////////////////////////////////////////////////////////////////////////

var SVG_ellipse = function(spec) {
    spec.type = "svg_ellipse";
    SVG_Proto.call(this, spec);
};
SVG_ellipse.prototype = Object.create(SVG_Proto.prototype);
SVG_ellipse.prototype.constructor = SVG_ellipse;

SVG_ellipse.prototype.get_svg = function() {
    var solution = this.solveParams();
    var ellipse_elm = document.createElementNS(bloqsnet.svgNS, "ellipse");
    this.setAttributes(ellipse_elm, solution);
    return ellipse_elm;
};

SVG_ellipse.prototype.def = {
    display: true,
    type: 'svg_ellipse',
    params: [
        ["cx", "number", 0, "specific attributes"],
        ["cy", "number", 0, "specific attributes"],
        ["rx", "number", 10, "specific attributes"],
        ["ry", "number", 5, "specific attributes"],
        ["fill", "color", "#ffffff", "specific attributes"],
        ["transform", "string", "translate(0,0)", "specific attributes"]
    ]
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

bloqsnet.REGISTRY["svg_ellipse"] = SVG_ellipse;

////////////////////////////////////////////////////////////////////////////////
//                                                                  SVG_TEXT  //
////////////////////////////////////////////////////////////////////////////////

var SVG_text = function(spec) {
    spec.type = "svg_text";
    SVG_Proto.call(this, spec);
};
SVG_text.prototype = Object.create(SVG_Proto.prototype);
SVG_text.prototype.constructor = SVG_text;

SVG_text.prototype.get_svg = function() {
    var solution = this.solveParams();
    var text_elm = document.createElementNS(bloqsnet.svgNS, "text");
    text_elm.setAttribute("style", "fXSont-family:" + solution.font + ";");
    text_elm.setAttribute("x", solution.x);
    text_elm.setAttribute("y", solution.y);
    text_elm.setAttribute("fill", solution.fill);
    text_elm.setAttribute("opacity", solution.opacity);
    text_elm.textContent = solution.text;

    return text_elm;
};

SVG_text.prototype.def = {
    display: true,
    type: 'svg_text',
    params: [
            ["text", "string", "default", "specific attributes"],
            ["x", "number", 10, "specific attributes"],
            ["y", "number", 10, "specific attributes"],
            ["fill", "color", "#ffffff", "specific attributes"],
            ["opacity", "number", "1", "specific attributes"]
        ]
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

SVG_animate.prototype.render_svg = function() {
    if (this.cached_svg === undefined) {
        var returnSVG;
        if (this.spec.children.length > 0) {
            var child = this.spec.children[0];
            if (child !== "x") {
                var thisSVG = this.get_svg();
                returnSVG = child.render_svg().cloneNode(true);
                returnSVG.appendChild(thisSVG);
            }
        }
        this.cached_svg = returnSVG;
    }
    return this.cached_svg;
};

SVG_animate.prototype.get_svg = function() {
    var solution = this.solveParams();
    var anim_elm = document.createElementNS(bloqsnet.svgNS, "animate");
    this.setAttributes(anim_elm, solution);

    return anim_elm;
};

SVG_animate.prototype.def = {
    display: true,
    type: 'svg_animate',
    params: [
            ["attributeName", "string", "", "specific attributes"],
            ["attributeType", "string", "auto", "specific attributes"],

            ["from", "string", "", "specific attributes"],
            ["to", "string", "", "specific attributes"],
            ["by", "string", "", "specific attributes"],

            ["begin", "string", "", "specific attributes"],
            ["dur", "string", "1", "specific attributes"],
            ["end", "string", "", "specific attributes"],
            ["repeatCount", "string", "indefinite", "specific attributes"],
            ["fill", "string", "remove", "specific attributes"]
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
    c: [1, 1]
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

Root.prototype.updateLocalEnvironment = function() {
    this.setLocalEnvironment(JSON.parse(this.spec.params.data));
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
        ["width", "number", "100%", "specific attributes"],
        ["height", "number", "100%", "specific attributes"],
        ["data", "json", "{}", "specific attributes"]
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
    if (this.cached_svg === undefined) {
        var xxx = this.get_svg();
        if (this.spec.children.length > 0) {
            var child = this.spec.children[0];
            if (child !== "x") {
                _.each(this.env_val(this.spec.params.list), function(d, idx) {
                    var obj = {};
                    obj[this.spec.id + "_d"] = d;
                    obj[this.spec.id + "_idx"] = idx;
                    this.setLocalEnvironment(obj);
                    child.sully_cached_svg_down();
                    xxx.appendChild(child.render_svg().cloneNode(true));
                }, this);
            }
        }
        this.cached_svg = xxx;
    }
    return this.cached_svg;
};

SVG_each.prototype.get_svg = function() {
    var solution = this.solveParams();
    var svg_elem = document.createElementNS(bloqsnet.svgNS, "g");
    this.setAttributes(svg_elem, solution);
    return svg_elem;
};

SVG_each.prototype.def = {
    display: true,
    type: 'svg_each',
    params: [
        ["transform", "string", "translate(0,0)", "specific attributes"],
        ["list", "string", "", "specific attributes"]
    ],
    p: [1, 1],
    c: [1, 1]
};

bloqsnet.REGISTRY["svg_each"] = SVG_each;

////////////////////////////////////////////////////////////////////////////////
//                                                                 SVG_IMAGE  //
////////////////////////////////////////////////////////////////////////////////

// bloqsnet.MANIFEST.push("image");
// bloqsnet.REGISTRY["image"] = {

//     def:{
//         params: [["x", "number", 0],
//                  ["y", "number", 0],
//                  ["width", "number", "100%"],
//                  ["height", "number", "100%"],
//                  ["src", "string", ""],
//                  ["aspect", "string", "xMinYMin meet"]],
//         p: [1, 1],
//         c: [0, 0]
//     },

//     func: function (spec) {

//         spec.type = 'image';

//         var that = bloqsnet.REGISTRY["base"].func(spec);

//         that.get_svg = function () {
//             var solution = that.solveParams();
//             var image_elm = document.createElementNS(bloqsnet.svgNS, "image");
//             image_elm.setAttribute("x", solution.x);
//             image_elm.setAttribute("y", solution.y);
//             image_elm.setAttribute("width", solution.width);
//             image_elm.setAttribute("height", solution.height);
//             image_elm.setAttributeNS("http://www.w3.org/1999/xlink", "href",  solution.src);
//             image_elm.setAttributeNS(null, 'visibility', 'visible');
//             image_elm.setAttribute("preserveAspectRatio", solution.aspect);
//             return image_elm;
//         };

//         return that;
//     }

// };

////////////////////////////////////////////////////////////////////////////////
