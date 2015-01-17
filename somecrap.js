window.onload = function(){


    var svgNS = "http://www.w3.org/2000/svg";

    var fonts = {'Lobster' : {"font-family": "'Lobster', cursive",
                              "src": "http://fonts.googleapis.com/css?family=Lobster"}
                };
    
    var bloq_base = function (spec) {

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
    
        that.addChild = function (child) {
            spec.children.push(child);
        };

        that.addParent = function (parent) {
            spec.parent = parent;
        };
    
        return that;
    };

    var bloq_root = function (spec) {
    
        spec.type = 'root';
        var that = bloq_base(spec);
        that.get_svg = function () {
            var svg_elem = document.createElementNS(svgNS, "svg");
            svg_elem.setAttribute("width", spec.width);
            svg_elem.setAttribute("height", spec.height);
            svg_elem.setAttribute("style", "background-color: #999999");
            return svg_elem;
        };

        return that;
    
    };

    var bloq_rect = function (spec) {

        spec.type = 'rect';
        var that = bloq_base(spec);
        that.get_svg = function () {
            var rect_elm = document.createElementNS(svgNS, "rect");
            rect_elm.setAttribute("width", spec.width);
            rect_elm.setAttribute("height", spec.height);
            rect_elm.setAttribute("x", spec.x);
            rect_elm.setAttribute("y", spec.y);
            rect_elm.setAttribute("style", spec.style);
            return rect_elm;
        };

        return that;
    };

    var bloq_circle = function (spec) {
    
        spec.type = 'circle';
        var that = bloq_base(spec);
        that.get_svg = function () {
            var circle_elm = document.createElementNS(svgNS, "circle");
            circle_elm.setAttribute("cx", spec.x);
            circle_elm.setAttribute("cy", spec.y);
            circle_elm.setAttribute("r", spec.r);
            circle_elm.setAttribute("style", spec.style);
            return circle_elm;
        };
        return that;
    };

    var bloq_text = function (spec) {
        spec.type = 'text';
        var that = bloq_base(spec);
        that.get_svg = function () {
            var text_elm = document.createElementNS(svgNS, "text");
            text_elm.setAttribute("style", "font-family:" + spec.font + ";");
            text_elm.setAttribute("x", spec.x);
            text_elm.setAttribute("y", spec.y);
            text_elm.textContent = spec.text;

            return text_elm;
        };
        return that;
    };

    var bloq_image = function (spec) {
        spec.type = 'image';
        var that = bloq_base(spec);
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
        return that;
    };


     foo = function () {
        
         var div = document.getElementById("render");
         //div.setAttribute("style", "width:800px; height:600px");
         //document.body.appendChild(div);
        
         var root = bloq_root ({width: '100%',
                                height: '100%'});

         var rect = bloq_rect ({width: '50',
                                height: '50',
                                x: '10',
                                y: '20',
                                style: 'fill: #ff0f67'});

         var circ = bloq_circle ({x: '35',
                                  y: '100',
                                  r: '25',
                                  style: 'fill: #990f67'});

         var text = bloq_text({x: '10',
                               y: '60',
                               font: 'Lobster',
                               text: 'SOme Text Here'});

         var image = bloq_image({x: '1',
                                 y: '1',
                                 width: '300',
                                 height: '200',
                                 src: 'http://40.media.tumblr.com/e22987449a0ef1a0d748d82128d5624b/tumblr_ni3waoCNPp1u8oekbo1_1280.jpg',
                                 aspect: 'XMaxYMin meet'});

         root.addChild (image);
         image.addParent (root);
    
         root.addChild (rect);
         rect.addParent (root);

         root.addChild (circ);
         circ.addParent (root);

         root.addChild (text);
         text.addParent (root);
    
         div.appendChild (root.render_svg());
     };

};
