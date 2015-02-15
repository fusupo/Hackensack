Polymer('input-preserveaspectratio', {
    align: '',
    meetSlice: '',
    updateVal: function(){
        var v = this.align === "none" ? "none" : this.align + ' ' + (this.meetSlice || '');
        v = v.slice(-1) === ' ' ? v.slice(0, -1) : v;
        this.fire("change", v);
    },
    ready: function() {
        var v = (this.value.split(' '));
        this.align = v[0];
        this.meetSlice = v[1];
    }
});
