Polymer('input-percpx', {
  scalar: '{{foo}}', //9999999,
  updateVal: function() {
    this.value = '{' + this.scalar + '}' + this.$.unit.value;
    this.fire("change", '{' + this.scalar + '}' + this.$.unit.value);
  },
  mw: function(e) {
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    var newVal = parseFloat(this.scalar) + delta;
    this.scalar = newVal;
    this.updateVal();
  },
  ready: function() {
    if (this.value.slice(-1) === "%") {
      this.scalar = this.value.slice(0, -1);
      this.$.unit.value = "%";
    } else {
      this.scalar = this.value.slice(0, -2);
      this.$.unit.value = "px";
    }
    this.scalar = this.scalar.slice(1, -1);
    this.updateVal();
  }

});
