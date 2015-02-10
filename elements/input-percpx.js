Polymer('input-percpx', {
    scalar: 9999999,
    updateVal: function(){
        this.value = this.scalar + this.$.unit.value;
        this.fire("change", this.value);
    },
    ready: function() {
        if(this.value.slice(-1) === "%"){
            this.scalar = this.value.slice(0,-1);
            this.$.unit.value = "%";
        }else{
            this.scalar = this.value.slice(0,-2);
            this.$.unit.value = "px";
        }
    }
});
