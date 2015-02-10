Polymer('input-transform', {
    transX: 0,
    transY: 0,
    scaleX: 0,
    scaleY: 0,
    rotA: 0,
    rotX: 0,
    rotY: 0,
    skewX: 0,
    skewY: 0,
    updateVal: function(){
        this.value = "";
        this.valueObj = {};
        
        if(this.transX !== 0 || this.transY !== 0){
            this.value += "translate(" + this.transX + ", " + this.transY + ") ";
            this.valueObj.translate = [this.transX, this.transY];
        }
        if(this.scaleX !== 0 || this.scaleY !== 0){
            this.value += "scale(" + this.scaleX + ", " + this.scaleY + ") ";
            this.valueObj.scale = [this.scaleX, this.scaleY];
        }
        if(this.rotA !== 0){
            this.value += "rotate(" + this.rotA;
            this.valueObj.rotate = [this.rotA];
            if(this.rotX !== 0 || this.rotY !== 0){
                this.value += ", " + this.rotX + ", " + this.rotY;
                this.valueObj.rotate.push(this.rotX);
                this.valueObj.rotate.push(this.rotY);
            }
            this.value +=  ") ";
        }
        if(this.skewX !== 0){
            this.value += "skewX(" + this.skewX + ") ";
            this.valueObj.skewX = this.skewX;
        }
        if(this.skewY !== 0){
            this.value += "skewX(" + this.skewY + ") ";
            this.valueObj.skewY = this.skewY;
        }

        this.value = this.value.slice(0,-1);
        this.fire("change", this.valueObj);
        
    },
    ready: function() {

        //this is pretty janky
        this.valueObj = JSON.parse(this.valueObj);
        
        if(this.valueObj !== undefined){
            if(this.valueObj.translate !== undefined){
                this.transX = this.valueObj.translate[0];
                this.transY = this.valueObj.translate[1];
            }
        
            if(this.valueObj.scale !== undefined){
                this.scaleX = this.valueObj.scale[0];
                this.scaleY = this.valueObj.scale[1];
            }
        
            if(this.valueObj.rotate !== undefined){
                this.rotA = this.valueObj.rotate[0];
                if(this.valueObj.rotate[1] !== undefined){
                    this.rotX = this.valueObj.rotate[1];
                    this.rotY = this.valueObj.rotate[2];
                }
            }
        
            if(this.valueObj.skewX !== undefined){
                this.skewX = this.valueObj.skewX;
            }
        
            if(this.valueObj.skewY !== undefined){
                this.skewY = this.valueObj.skewY;
            }
        
        }
    }
});
