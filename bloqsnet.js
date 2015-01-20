var bloqsnet = bloqsnet || {};
bloqsnet.MANIFEST = [];
bloqsnet.REGISTRY = {};
bloqsnet.svgNS = "http://www.w3.org/2000/svg";
// var fonts = {'Lobster' : {"font-family": "'Lobster', cursive",
//                           "src": "http://fonts.googleapis.com/css?family=Lobster"}
//             };

////////////////////////////////////////////////////////////////////////////////

bloqsnet.MANIFEST.push("base");
bloqsnet.REGISTRY["base"] == function (spec) {

    spec.type = 'base';
    spec.children = [];
    spec.parent = undefined;

    var that = {};

    that.get_type = function () {
        return spec.type;
    };

    that.get_svg = function () {
        
    };

    that.render_svg = function () {
        var xxx = that.get_svg();
        if(spec.children.length > 0) {
            var g = document. createElementNS (svgNS, "g");
            for (var i = 0; i < spec.children.length; i++) {
                g.appendChild(spec.children[i].render_svg());
            }
            xxx. appendChild (g);
        }
        return xxx;
    };

    that.getParentNodes = function(){
        return undefined;
    };

    that.getChildNodes = function(){
        return undefined;
    };
    
    that.addChild = function (child) {
        spec.children.push(child);
    };

    that.addParent = function (parent) {
        spec.parent = parent;
    };
    
    return that;
};

////////////////////////////////////////

bloqsnet.MANIFEST.push("root");
bloqsnet.REGISTRY["root"] = function (spec) {
    
    spec.type = 'root';
    var that = bloqsnet.REGISTRY["base"](spec);
    that.get_svg = function () {
        var svg_elem = document.createElementNS(svgNS, "svg");
        svg_elem.setAttribute("width", spec.width);
        svg_elem.setAttribute("height", spec.height);
        svg_elem.setAttribute("style", "background-color: #999999");
        return svg_elem;
    };

    that.getChildNodes = function(){
        return ['x'];
    };
    
    return that;
    
};

////////////////////////////////////////

bloqsnet.MANIFEST.push("rect");
bloqsnet.REGISTRY["rect"] = function (spec) {

    spec.type = 'rect';
    var that = bloqsnet.REGISTRY["base"](spec);
    that.get_svg = function () {
        var rect_elm = document.createElementNS(svgNS, "rect");
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
};

////////////////////////////////////////

bloqsnet.MANIFEST.push("circle");
bloqsnet.REGISTRY["circle"] = function (spec) {
    
    spec.type = 'circle';
    var that = bloqsnet.REGISTRY["base"](spec);
    that.get_svg = function () {
        var circle_elm = document.createElementNS(svgNS, "circle");
        circle_elm.setAttribute("cx", spec.x);
        circle_elm.setAttribute("cy", spec.y);
        circle_elm.setAttribute("r", spec.r);
        circle_elm.setAttribute("style", spec.style);
        return circle_elm;
    };

    that.getParentNodes = function(){
        return ['...'];
    };
    
    return that;
};

////////////////////////////////////////

bloqsnet.MANIFEST.push("text");
bloqsnet.REGISTRY["text"] = function (spec) {
    spec.type = 'text';
    var that = bloqsnet.REGISTRY["base"](spec);
    that.get_svg = function () {
        var text_elm = document.createElementNS(svgNS, "text");
        text_elm.setAttribute("style", "fXSont-family:" + spec.font + ";");
        text_elm.setAttribute("x", spec.x);
        text_elm.setAttribute("y", spec.y);
        text_elm.textContent = spec.text;

        return text_elm;
    };

    that.getParentNodes = function(){
        return ['x'];
    };
    
    return that;
};

////////////////////////////////////////

bloqsnet.MANIFEST.push("image");
bloqsnet.REGISTRY["image"] = function (spec) {
    spec.type = 'image';
    var that = bloqsnet.REGISTRY["base"](spec);
    that.get_svg = function () {
        var image_elm = document.createElementNS(svgNS, "image");
        image_elm.setAttribute("x", spec.x);
        image_elm.setAttribute("y", spec.y);
        image_elm.setAttribute("width", spec.width);
        image_elm.setAttribute("height", spec.height);
        image_elm.setAttributeNS("http://www.w3.org/1999/xlink", "href",  spec.src);
        image_elm.setAttributeNS(null, 'visibility', 'visible');
        image_elm.setAttribute("preserveAspectRatio", spec.aspect);
        return image_elm;
    };

    that.getParentNodes = function(){
        return ['x'];
    };
    
    return that;
};

////////////////////////////////////////////////////////////////////////////////

bloqsnet.TEST_DATA = {
    "bloqs": {
        "b1": {
            id: "b1",
            type: "root",
            meta: {
                x: 10,
                y: 10
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
                x: 20,
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
                x: 35,
                y: 100,
                r: 25,
                style: "fill: $990f67"
            },
            p:["b1"],
            c:[]
        },
        "b4": {
            id: "b4",
            type: "text",
            meta: {
                x: 40,
                y: 110
            },
            params: {
                x: 10,
                y: 60,
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
                x: 50,
                y: 160
            },
            params: {
                x: 1,
                y: 1,
                width: 300,
                height: 200,
                src: "",
                aspect: "xMaxYMin meet"
            },
            p:["b1"],
            c:[]
        }
    }
};
