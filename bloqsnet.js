var bloqsnet = bloqsnet || {};
bloqsnet.MANIFEST = [];
bloqsnet.REGISTRY = {};
bloqsnet.svgNS = "http://www.w3.org/2000/svg";
// var fonts = {'Lobster' : {"font-family": "'Lobster', cursive",
//                           "src": "http://fonts.googleapis.com/css?family=Lobster"}
//             };

////////////////////////////////////////////////////////////////////////////////

bloqsnet.MANIFEST.push("base");
bloqsnet.REGISTRY["base"] = {
    
    def: {},
    
    func: function (spec) {

        spec.type = spec.type || 'base';
        spec.children = [];
        spec.parent = undefined;

        //

        spec.local_env = {"foo":"bar"};
        spec.env = [spec.local_env];
        
        //

        var that = {};

        that.get_type = function () {
            return spec.type;
        };

        that.get_id = function () {
            return spec.id;
        };

        that.solve = function (expr, env) {
            var res = undefined;
            if(env.length > 0){
                try{
                    res = math.eval(expr, env[0]);
                }catch(err){
                    res = that.solve(expr, _.clone(env).slice(1));
                }
            }
            return res;
        };

        that.solveParams = function(){
            var params_def = bloqsnet.REGISTRY[spec.type].def.params;
            var res = {};
            _.each(params_def, function(p_def){
                switch(p_def[1]){
                case "number":
                    var exp = spec[p_def[0]];
                    if(typeof(exp) === "string"){
                        if(exp.slice(-1) === "%"){
                            res[p_def[0]] = that.solve(exp.slice(0, -1), spec.env) + "%";
                        }else{
                            res[p_def[0]] = that.solve(exp, spec.env);
                        }
                    }else{
                        res[p_def[0]] = spec[p_def[0]];
                    }
                    break;
                default:
                    res[p_def[0]] = spec[p_def[0]];
                    break;
                }
            });
            return res;
        };
        
        that.updateParam = function (p_name, val){
            var success = false;
            var p = _.findWhere(bloqsnet.REGISTRY[spec.type].def.params, {0: p_name});
            switch(p[1]){
            case "number":
                var res;
                if(typeof(val) === "string" && val.slice(-1) === "%"){
                    res = that.solve(val.slice(0, -1), spec.env);
                }else{
                    res = that.solve(val, spec.env);
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
                that.updateLocalEnvironment();
            }
            
            return success;
        };
        
        that.get_svg = function () {};

        that.render_svg = function () {
            
            var xxx = that.get_svg();
            if(spec.children.length > 0) {
                var g = document. createElementNS (bloqsnet.svgNS, "g");
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

        that.getParentNode = function(){
            return spec.parent;
        };

        that.getChildNodes = function(){
            return spec.children;
        };
        
        that.addChild = function (child) {
            spec.children.unshift(child);
        };

        that.addChildAt = function (child, idx) {
            spec.children.splice(idx, 0, child);
        };

        that.swapChild = function (idx, val) {
            spec.children[idx] = val;
        };
        
        that.addParent = function (parent) {
            spec.parent = parent;
        };

        that.resetTerminals = function () {
            var card = bloqsnet.REGISTRY[spec.type].def["c"];
            var temp = {};

            if (card[1] === "n") {
                spec.children  = _.without(spec.children, "x");
                spec.children.push("x");
            }
            
        };

        //

        that.updateLocalEnvironment = function(){
        };
        
        that.setLocalEnvironment = function(data){
            spec.local_env = data;
            spec.env = [spec.local_env];
            that.refreshEnvironment();
        };

        that.getEnvironment = function(){
            return spec.env;
        };

        that.refreshEnvironment = function(){
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
        
        return that;
        
    }
    
};
////////////////////////////////////////

bloqsnet.MANIFEST.push("root");
bloqsnet.REGISTRY["root"] = {
    
    def:{
        params: [["width", "number", "100%"],
                 ["height", "number", "100%"],
                 ["data", "json", "{}"]],
        p: [0, 0],
        c: [1, "n"]
    },
    
    func: function (spec) {
        
        spec.type = 'root';
        
        var that = bloqsnet.REGISTRY["base"].func(spec);

        that.updateLocalEnvironment = function(){
            that.setLocalEnvironment(JSON.parse(spec.data));
        };
        
        that.get_svg = function () {
            var solution = that.solveParams();
            var svg_elem = document.createElementNS(bloqsnet.svgNS, "svg");
            svg_elem.setAttribute("width", solution.width);
            svg_elem.setAttribute("height", solution.height);
            svg_elem.setAttribute("style", "background-color: #999999");
            return svg_elem;
        };

        return that;

    }
    
};

////////////////////////////////////////

bloqsnet.MANIFEST.push("rect");
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
    
    func: function (spec) {

        spec.type = 'rect';
        
        var that = bloqsnet.REGISTRY["base"].func(spec);
        
        that.get_svg = function () {
            var solution = that.solveParams();
            var rect_elm = document.createElementNS(bloqsnet.svgNS, "rect");
            rect_elm.setAttribute("width", solution.width);
            rect_elm.setAttribute("height", solution.height);
            rect_elm.setAttribute("x", solution.x);
            rect_elm.setAttribute("y", solution.y);
            rect_elm.setAttribute("fill", solution.fill);
            return rect_elm;
        };

        return that;
        
    }
    
};

////////////////////////////////////////

bloqsnet.MANIFEST.push("circle");
bloqsnet.REGISTRY["circle"] = {
    
    def: {
        params: [["cx", "number", 0],
                 ["cy", "number", 0],
                 ["r", "number", 10],
                 ["fill", "color", "#ff0000"]],
        p: [1, 1],
        c: [0, 0]
    },
    
    func: function (spec) {
        
        spec.type = 'circle';
        
        var that = bloqsnet.REGISTRY["base"].func(spec);

        that.get_svg = function () {
            var solution = that.solveParams();
            var circle_elm = document.createElementNS(bloqsnet.svgNS, "circle");
            circle_elm.setAttribute("cx", solution.cx);
            circle_elm.setAttribute("cy", solution.cy);
            circle_elm.setAttribute("r", solution.r);
            circle_elm.setAttribute("fill", solution.fill);
            return circle_elm;
        };

        return that;
        
    }
    
};

////////////////////////////////////////

bloqsnet.MANIFEST.push("text");
bloqsnet.REGISTRY["text"] = {
    
    def:{
        params: [["x", "number", 50],
                 ["y", "number", 50],
                 ["style", "string", ""],
                 ["text", "string", "default_text"]],
        p: [1, 1],
        c: [0, 0]
    },
    
    func: function (spec) {
        
        spec.type = 'text';

        var that = bloqsnet.REGISTRY["base"].func(spec);

        spec.font = "Lobster";
        
        that.get_svg = function () {
            var solution = that.solveParams();
            var text_elm = document.createElementNS(bloqsnet.svgNS, "text");
            text_elm.setAttribute("style", "fXSont-family:" + solution.font + ";");
            text_elm.setAttribute("x", solution.x);
            text_elm.setAttribute("y", solution.y);
            text_elm.textContent = solution.text;

            return text_elm;
        };

        return that;
        
    }
    
};

////////////////////////////////////////

bloqsnet.MANIFEST.push("image");
bloqsnet.REGISTRY["image"] = {
    
    def:{
        params: [["x", "number", 0],
                 ["y", "number", 0],
                 ["width", "number", "100%"],
                 ["height", "number", "100%"],
                 ["src", "string", ""],
                 ["aspect", "string", "xMinYMin meet"]],
        p: [1, 1],
        c: [0, 0]
    },
    
    func: function (spec) {
        
        spec.type = 'image';

        var that = bloqsnet.REGISTRY["base"].func(spec);

        that.get_svg = function () {
            var solution = that.solveParams();
            var image_elm = document.createElementNS(bloqsnet.svgNS, "image");
            image_elm.setAttribute("x", solution.x);
            image_elm.setAttribute("y", solution.y);
            image_elm.setAttribute("width", solution.width);
            image_elm.setAttribute("height", solution.height);
            image_elm.setAttributeNS("http://www.w3.org/1999/xlink", "href",  solution.src);
            image_elm.setAttributeNS(null, 'visibility', 'visible');
            image_elm.setAttribute("preserveAspectRatio", solution.aspect);
            return image_elm;
        };

        return that;
    }
    
};

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
            this.insts[spec.id] = bloqsnet.REGISTRY[spec.type].func(params);
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
                var t_inst = bloqsnet.REGISTRY[d.type].func(params);
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

bloqsnet.TEST_DATA = {
    
    "bloqs": [
        {
            id: "b1",
            type: "root",
            meta: {
                x: 300,
                y: 105
            },
            params: {
                width: "100%",
                height: "100%"
            },
            p:[],
            c:["b2", "b3", "b4", "b5"]
        },
        {
            id: "b2",
            type: "rect",
            meta: {
                x: 50,
                y: 10},
            params: {
                width: 50,
                height: 50,
                x: 10,
                y: 20,
                fill: "#ff0f67"
            },
            p:["b1"],
            c:[]
        },
        {
            id: "b3",
            type: "circle",
            meta: {
                x: 30,
                y: 60
            },
            params: {
                cx: 35,
                cy: 100,
                r: 25,
                fill: "#990f67"
            },
            p:["b1"],
            c:[]
        },
        {
            id: "b4",
            type: "text",
            meta: {
                x: 35,
                y: 110
            },
            params: {
                x: 10,
                y: 50,
                font: "Lobster",
                text: "SOmeo ther text here"
            },
            p:["b1"],
            c:[]
        },
        {
            id: "b5",
            type: "image",
            meta: {
                x: 55,
                y: 160
            },
            params: {
                x: 1,
                y: 1,
                width: 300,
                height: 200,
                src: "http://backbonejs.org/docs/images/backbone.png",
                aspect: "xMaxYMin meet"
            },
            p:["b1"],
            c:[]
        }
    ]
    
};
