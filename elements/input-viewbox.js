Polymer('input-viewbox', {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    updateVal: function(){
        // this.value = "";
        // this.valueObj = {};
        
        // if(this.transX !== 0 || this.transY !== 0){
        //     this.value += "translate(" + this.transX + ", " + this.transY + ") ";
        //     this.valueObj.translate = [this.transX, this.transY];
        // }
        // if(this.scaleX !== 0 || this.scaleY !== 0){
        //     this.value += "scale(" + this.scaleX + ", " + this.scaleY + ") ";
        //     this.valueObj.scale = [this.scaleX, this.scaleY];
        // }
        // if(this.rotA !== 0){
        //     this.value += "rotate(" + this.rotA;
        //     this.valueObj.rotate = [this.rotA];
        //     if(this.rotX !== 0 || this.rotY !== 0){
        //         this.value += ", " + this.rotX + ", " + this.rotY;
        //         this.valueObj.rotate.push(this.rotX);
        //         this.valueObj.rotate.push(this.rotY);
        //     }
        //     this.value +=  ") ";
        // }
        // if(this.skewX !== 0){
        //     this.value += "skewX(" + this.skewX + ") ";
        //     this.valueObj.skewX = this.skewX;
        // }
        // if(this.skewY !== 0){
        //     this.value += "skewX(" + this.skewY + ") ";
        //     this.valueObj.skewY = this.skewY;
        // }

        // this.value = this.value.slice(0,-1);
        this.fire("change", this.x + ' ' + this.y + ' ' + this.w + ' ' + this.h);
    },
    ready: function() {
        var v = this.value.split(' ');
        this.x = v[0];
        this.y = v[1];
        this.w = v[2];
        this.h = v[3];
    }
});
