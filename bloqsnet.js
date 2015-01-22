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

        spec.type = 'base';
        spec.children = [];
        spec.parent = undefined;

        var that = {};

        that.get_type = function () {
            return spec.type;
        };

        that.get_params = function () { return []; };
        
        that.get_svg = function () {};

        that.render_svg = function () {
            var xxx = that.get_svg();
            if(spec.children.length > 0) {
                var g = document. createElementNS (bloqsnet.svgNS, "g");
                for (var i = 0; i < spec.children.length; i++) {
                    g.appendChild(spec.children[i].render_svg());
                }
                xxx. appendChild (g);
            }
            return xxx;
        };

        // that.getParentNodes = function(){
        //     return undefined;
        // };

        // that.getChildNodes = function(){
        //     return undefined;
        // };
        
        that.addChild = function (child) {
            spec.children.push(child);
        };

        that.addParent = function (parent) {
            spec.parent = parent;
        };
        
        return that;
    }
};
////////////////////////////////////////

bloqsnet.MANIFEST.push("root");
bloqsnet.REGISTRY["root"] = {
    def:{
        params: [["width", "number", "100%"],
                 ["height", "number", "100%"]],
        p: [0, 0],
        c: [1, "n"]
    },
    func: function (spec) {
        
        spec.type = 'root';
        
        var that = bloqsnet.REGISTRY["base"].func(spec);
        
        that.get_svg = function () {
            var svg_elem = document.createElementNS(bloqsnet.svgNS, "svg");
            svg_elem.setAttribute("width", spec.width);
            svg_elem.setAttribute("height", spec.height);
            svg_elem.setAttribute("style", "background-color: #999999");
            return svg_elem;
        };

        // that.getChildNodes = function(){
        //     return ['x'];
        // };
        
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
                 ["height", "number", 10]],
        p: [1, 1],
        c: [0, 0]
    },
    func: function (spec) {

        spec.type = 'rect';
        
        var that = bloqsnet.REGISTRY["base"].func(spec);
        
        that.get_svg = function () {
            var rect_elm = document.createElementNS(bloqsnet.svgNS, "rect");
            rect_elm.setAttribute("width", spec.width);
            rect_elm.setAttribute("height", spec.height);
            rect_elm.setAttribute("x", spec.x);
            rect_elm.setAttribute("y", spec.y);
            rect_elm.setAttribute("style", spec.style);
            return rect_elm;
        };

        that.getParentNodes = function(){
            return ['x'];
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
                 ["r", "number", 10]],
        p: [1, 1],
        c: [0, 0]
    },
    func: function (spec) {
        
        spec.type = 'circle';
        
        var that = bloqsnet.REGISTRY["base"].func(spec);

        that.get_svg = function () {
            var circle_elm = document.createElementNS(bloqsnet.svgNS, "circle");
            circle_elm.setAttribute("cx", spec.cx);
            circle_elm.setAttribute("cy", spec.cy);
            circle_elm.setAttribute("r", spec.r);
            circle_elm.setAttribute("style", spec.style);
            return circle_elm;
        };

        that.getParentNodes = function(){
            return ['...'];
        };
        
        return that;
    }
};

////////////////////////////////////////

bloqsnet.MANIFEST.push("text");
bloqsnet.REGISTRY["text"] = {
    def:{
        params: [["x", "number", 0],
                 ["y", "number", 0],
                 ["style", "string", ""],
                 ["text", "string", "<default text>"]],
        p: [1, 1],
        c: [0, 0]
    },
    func: function (spec) {
        
        spec.type = 'text';

        var that = bloqsnet.REGISTRY["base"].func(spec);
        
        that.get_svg = function () {
            var text_elm = document.createElementNS(bloqsnet.svgNS, "text");
            text_elm.setAttribute("style", "fXSont-family:" + spec.font + ";");
            text_elm.setAttribute("x", spec.x);
            text_elm.setAttribute("y", spec.y);
            text_elm.textContent = spec.text;

            return text_elm;
        };

        // that.getParentNodes = function(){
        //     return ['x'];
        // };
        
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
            var image_elm = document.createElementNS(bloqsnet.svgNS, "image");
            image_elm.setAttribute("x", spec.x);
            image_elm.setAttribute("y", spec.y);
            image_elm.setAttribute("width", spec.width);
            image_elm.setAttribute("height", spec.height);
            image_elm.setAttributeNS("http://www.w3.org/1999/xlink", "href",  spec.src);
            image_elm.setAttributeNS(null, 'visibility', 'visible');
            image_elm.setAttribute("preserveAspectRatio", spec.aspect);
            return image_elm;
        };

        // that.getParentNodes = function(){
        //     return ['x'];
        // };
    
        return that;
    }
};

////////////////////////////////////////////////////////////////////////////////

bloqsnet.create = function(data, id) {
    
    var r = data[id];
    var inst = bloqsnet.REGISTRY[r.type].func(r.params);
    _.each(r.c, function(child){
        if(child !== "x"){
            inst.addChild(bloqsnet.create(data, child));
        }
    });

    return inst;
    
};

////////////////////////////////////////////////////////////////////////////////

bloqsnet.TEST_DATA = {
    "bloqs": {
        "b1": {
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
        "b2": {
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
                style: "fill: #ff0f67"
            },
            p:["b1"],
            c:[]
        },
        "b3": {
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
                style: "fill: #990f67"
            },
            p:["b1"],
            c:[]
        },
        "b4": {
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
        "b5": {
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
    }
};
