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
