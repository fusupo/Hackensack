Polymer({
    plusTranslate: function(){
        this.spec.push({type:"trans",
                        x:0,
                        y:0});
        this.updateVal();
    },
    plusScale: function(){
        this.spec.push({type:"scale",
                        x:0,
                        y:0});
        this.updateVal();
    },
    plusRotate: function(){
        this.spec.push({type:"rot",
                        r:0,
                        x:0,
                        y:0});
        this.updateVal();
    },
    plusSkewX: function(){
        this.spec.push({type:"skewX",
                        x:0});
        this.updateVal();
    },
    plusSkewY: function(){
        this.spec.push({type:"skewY",
                        y:0});
        this.updateVal();
    },
    updateVal: function(){
        var ret = '';
        for(var i=0; i<this.spec.length; i++){
            var e = this.spec[i];
            switch(e.type){
                case "trans":
                    ret+= 'translate(' + e.x+ ', ' + e.y + ')';
                    break;
                case "scale":
                    ret+= 'scale(' + e.x+ ', ' + e.y + ')';
                    break;
                case "rot":
                    ret+= 'rotate(' + e.r + ', ' + e.x+ ', ' + e.y + ')';
                    break;
                case "skewX":
                    ret+= 'skewX(' + e.x + ')';
                    break;
                case "skewY":
                    ret+= 'skewY(' + e.y + ')';
                    break;
            }
        }
        this.fire("change", this.spec);
    },
    remVal: function(e, detail, sender){
        var model = e.target.templateInstance.model.m;
        var idx = -1;
        for(var i=0; i<this.spec.length; i++){
            if(this.spec[i] === model){
                idx = i;
                break;
            }
        }
        this.spec.splice(idx, 1);
    },
    created: function(){
        console.log(this.spec);
        this.spec = new Array();
    },
    ready: function() {
            //this si pretty janky
        var targ = JSON.parse(this.valueObj);
        console.log(this.valueObj);
        console.log(targ);
        this.spec = targ;
        
        //this.spec = [];
        //this.spec = this.spec || [];
        //console.log( this.spec );
    }
});
