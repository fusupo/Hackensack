var bloqsnet = bloqsnet || {};
bloqsnet.MANIFEST = [];
bloqsnet.REGISTRY = {};
bloqsnet.svgNS = "http://www.w3.org/2000/svg";
// var fonts = {'Lobster' : {"font-family": "'Lobster', cursive",
//                           "src": "http://fonts.googleapis.com/css?family=Lobster"}
//             };

////////////////////////////////////////////////////////////////////////////////

var Base = function(spec){

    // init spec
    spec.type = spec.type || 'base';
    spec.children = [];
    spec.parent = undefined;
    spec.local_env = {"foo":"bar"};
    spec.env = [spec.local_env];
    
    // private member variable
    var that = this;
    
    // public member variable
    this.spec = spec;
    
    // private member function
    // privileged member function
    this.get_type = function(){
        return spec.type;
    };

    this.get_id = function(){
        return spec.id;
    };

    //
    
    this.solve = function (expr, env) {
        var res = undefined;
        if(env.length > 0){
            try{
                res = math.eval(expr, env[0]);
            }catch(err){
                res = this.solve(expr, _.clone(env).slice(1));
            }
        }
        return res;
    };

    this.solveParams = function(){
        var params_def = bloqsnet.REGISTRY[spec.type].def.params;
        var res = {};
        _.each(params_def, function(p_def){
            var expr =  spec[p_def[0]];
            switch(p_def[1]){
            case "number":
                if(typeof(expr) === "string"){
                    if(expr.slice(-1) === "%"){
                        res[p_def[0]] = that.solve(expr.slice(0, -1), spec.env) + "%";
                    }else{
                        res[p_def[0]] = that.solve(expr, spec.env);
                    }
                }else{
                    res[p_def[0]] = expr;
                }
                break;
            case "string":
                res[p_def[0]] = that.solve(expr, spec.env) || expr;
                break;
            default:
                res[p_def[0]] = expr;
                break;
            }
        });
        return res;
    };

    this.updateParam = function (p_name, val){
        var success = false;
        var p = _.findWhere(bloqsnet.REGISTRY[spec.type].def.params, {0: p_name});
        switch(p[1]){
        case "number":
            var res;
            if(typeof(val) === "string" && val.slice(-1) === "%"){
                res = this.solve(val.slice(0, -1), spec.env);
            }else{
                res = this.solve(val, spec.env);
            }
            if(res !== undefined){
                spec[p_name] = val;
                success = true;
            }
            break;
        case "string":
            spec[p_name] = val;
            success = true;
            break;
        case "color":
            spec[p_name] = val;
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
                spec[p_name] = val;
                success = true;
            }
            break;
        }

        if(success){
            this.updateLocalEnvironment();
        }
        
        return success;
    };

    //
    
    this.render_svg = function () {
        
        var xxx = this.get_svg();
        if(spec.children.length > 0) {
            var g = document.createElementNS (bloqsnet.svgNS, "g");
            for (var i = 0; i < spec.children.length; i++) {
                var child = spec.children[i];
                if(child !== "x"){
                    g.appendChild(spec.children[i].render_svg());
                }
            }
            xxx. appendChild (g);
        }     
        return xxx;
    };

    //
    
    this.getParentNode = function(){
        return spec.parent;
    };

    this.getChildNodes = function(){
        return spec.children;
    };

    this.addChild = function (child) {
        spec.children.unshift(child);
    };

    this.addChildAt = function (child, idx) {
        spec.children.splice(idx, 0, child);
    };

    this.swapChild = function (idx, val) {
        spec.children[idx] = val;
    };

    this.addParent = function (parent) {
        spec.parent = parent;
    };

    this.resetTerminals = function () {
        var card = bloqsnet.REGISTRY[spec.type].def["c"];
        var temp = {};

        if (card[1] === "n") {
            spec.children  = _.without(spec.children, "x");
            spec.children.push("x");
        }
        
    };

    //
    
    this.setLocalEnvironment = function(data){
        spec.local_env = data;
        spec.env = [spec.local_env];
        this.refreshEnvironment();
    };

    this.getEnvironment = function(){
        return spec.env;
    };

    this.refreshEnvironment = function(){
        if(spec.parent !== "x" && spec.parent !== undefined){
            spec.env=_.clone(spec.parent.getEnvironment());
            spec.env.unshift(spec.local_env);
        }
        _.each(spec.children, function(c){
            if(c !== "x"){
                c.refreshEnvironment();
            }
        });
    };
    
};

Base.prototype.get_svg = function () {};
Base.prototype.updateLocalEnvironment = function(){};

bloqsnet.REGISTRY["base"] = {
    def: {},
    func: Base
};
bloqsnet.MANIFEST.push("base");

////////////////////////////////////////

var Root = function(spec){
    spec.type = "root";
    Base.call(this, spec);
};
Root.prototype = Object.create(Base.prototype); // See note below
Root.prototype.constructor = Root;

Root.prototype.updateLocalEnvironment = function(){
    this.setLocalEnvironment(JSON.parse(this.spec.data));
};

Root.prototype.get_svg = function () {
    var solution = this.solveParams();
    var svg_elem = document.createElementNS(bloqsnet.svgNS, "svg");
    svg_elem.setAttribute("width", solution.width);
    svg_elem.setAttribute("height", solution.height);
    svg_elem.setAttribute("style", "background-color: #999999");
    return svg_elem;
};

bloqsnet.REGISTRY["root"] = {
    def:{
        params: [["width", "number", "100%"],
                 ["height", "number", "100%"],
                 ["data", "json", "{}"]],
        p: [0, 0],
        c: [1, "n"]
    },
    func: Root
};
bloqsnet.MANIFEST.push("root");

////////////////////////////////////////

var Rect = function(spec){
    spec.type = "rect";
    Base.call(this, spec);
};
Rect.prototype = Object.create(Base.prototype);
Rect.prototype.constructor = Rect;

Rect.prototype.get_svg = function(){
    var solution = this.solveParams();
    var rect_elm = document.createElementNS(bloqsnet.svgNS, "rect");
    rect_elm.setAttribute("width", solution.width);
    rect_elm.setAttribute("height", solution.height);
    rect_elm.setAttribute("x", solution.x);
    rect_elm.setAttribute("y", solution.y);
    rect_elm.setAttribute("fill", solution.fill);
    return rect_elm;
};

bloqsnet.REGISTRY["rect"] = {
    def:{
        params: [["x", "number", 0],
                 ["y", "number", 0],
                 ["width", "number", 10],
                 ["height", "number", 10],
                 ["fill", "color", "#ff0000"]],
        p: [1, 1],
        c: [0, 0]
    },
    func: Rect
};
bloqsnet.MANIFEST.push("rect");

////////////////////////////////////////

// bloqsnet.MANIFEST.push("circle");
// bloqsnet.REGISTRY["circle"] = {
    
//     def: {
//         params: [["cx", "number", 0],
//                  ["cy", "number", 0],
//                  ["r", "number", 10],
//                  ["fill", "color", "#ff0000"]],
//         p: [1, 1],
//         c: [0, 0]
//     },
    
//     func: function (spec) {
        
//         spec.type = 'circle';
        
//         var that = bloqsnet.REGISTRY["base"].func(spec);

//         that.get_svg = function () {
//             var solution = that.solveParams();
//             var circle_elm = document.createElementNS(bloqsnet.svgNS, "circle");
//             circle_elm.setAttribute("cx", solution.cx);
//             circle_elm.setAttribute("cy", solution.cy);
//             circle_elm.setAttribute("r", solution.r);
//             circle_elm.setAttribute("fill", solution.fill);
//             return circle_elm;
//         };

//         return that;
        
//     }
    
// };

////////////////////////////////////////

// bloqsnet.MANIFEST.push("text");
// bloqsnet.REGISTRY["text"] = {
    
//     def:{
//         params: [["x", "number", 50],
//                  ["y", "number", 50],
//                  ["style", "string", ""],
//                  ["text", "string", "default_text"]],
//         p: [1, 1],
//         c: [0, 0]
//     },
    
//     func: function (spec) {
        
//         spec.type = 'text';

//         var that = bloqsnet.REGISTRY["base"].func(spec);

//         spec.font = "Lobster";
        
//         that.get_svg = function () {
//             var solution = that.solveParams();
//             var text_elm = document.createElementNS(bloqsnet.svgNS, "text");
//             text_elm.setAttribute("style", "fXSont-family:" + solution.font + ";");
//             text_elm.setAttribute("x", solution.x);
//             text_elm.setAttribute("y", solution.y);
//             text_elm.textContent = solution.text;

//             return text_elm;
//         };

//         return that;
        
//     }
    
// };

////////////////////////////////////////

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

bloqsnet.create = function(data, id) {

    
    var r = data[id];
    var inst = bloqsnet.REGISTRY[r.type].func(_.clone(r.params));
    _.each(r.c, function(child){
        if(child !== "x"){
            inst.addChild(bloqsnet.create(data, child));
        }
    });

    return inst;
    
};

bloqsnet.gimmeTheThing = function(){
    
    return {
        
        inst: undefined,
        insts: {},

        add: function(spec){
            var params = _.clone(spec.params);
            params.id = spec.id;
            this.insts[spec.id] = new bloqsnet.REGISTRY[spec.type].func(params);
            return this.insts[spec.id];
        },
        rem: function(id){
            // not: the unwiring logic still resides in the host
            delete this.insts[id];
            this.rst_trm();
        },
        con: function(id, idx, trg){
            // from child to parent
            var p_bloq = this.insts[id];
            var c_bloq = this.insts[trg];
            c_bloq.swapChild(idx, p_bloq);
            p_bloq.addParent(c_bloq);
            this.rst_trm();
        },
        get: function(id){
            return this.insts[id];    
        },
        discon: function(id1, id2){
            var findIfHasChild = function(id, that){
                return _.find(that.insts, function(i){
                    return _.find(i.getChildNodes(), function(cn){
                        return cn === "x" ? false : cn.get_id() === id;
                    }, that);
                }, that);
            };
            var findChildAndDisconnect = function(qux, id, that){
                var idx;
                var baz = _.find(qux.getChildNodes(), function(cn, i){
                    if(cn !== "x" && cn.get_id() === id){
                        idx = i;
                        return true;
                    }else{
                        return false;
                    }});
                
                baz.addParent("x");
                qux.swapChild(idx, "x");
            };
            var foo = findIfHasChild(id1, this);
            
            if(foo !== undefined){
                findChildAndDisconnect(foo,id1,this);
            }else{
                foo = findIfHasChild(id2, this);
                findChildAndDisconnect(foo,id2, this);
            }
        },
        crt: function(data, id){
            _.each(data, function(d){
                var params = _.clone(d.params);
                params.id = d.id;
                var t_inst = new bloqsnet.REGISTRY[d.type].func(params);
                this.insts[d.id] = t_inst;
            }, this);
            
            _.each(data, function(d){
                _.each(d.c, function (c, idx){
                    if(c!=="x"){
                        this.con(c, idx, d.id);
                    }
                }, this);
            }, this);
            
            this.inst = this.insts[id];
            return this._inst;
        },
        rndr: function(id){
            return this.insts[id].render_svg();
        },
        updt_par: function(id, p_name, val){
            return this.insts[id].updateParam(p_name, val);
        },
        rst_trm: function(){
            _.each(this.insts, function(i){
                i.resetTerminals();
            });
        }
    };
    
};

////////////////////////////////////////////////////////////////////////////////
