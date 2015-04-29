Polymer('input-percpx', {
    scalar: 9999999,
    updateVal: function() {
        console.log("what the fuck??");
        this.value = this.scalar + this.$.unit.value;
        this.fire("change", this.value);
    },
    mw: function(e) {
        console.log("mw");
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        var newVal = parseFloat(this.scalar) + delta;
        this.scalar = newVal; //.toString();

        this.updateVal();
    },
    ready: function() {
        console.log("mutehrfucking ready " + this.value);
        if (this.value.slice(-1) === "%") {
            this.scalar = this.value.slice(0, -1);
            this.$.unit.value = "%";
        } else {
            this.scalar = this.value.slice(0, -2);
            this.$.unit.value = "px";
        }
    }

});
