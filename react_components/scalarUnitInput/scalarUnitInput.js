var React = require('react');
var ReactDOM = require('react-dom');
var ParensHighlightInput = require('../parenHighlightingInput/parensHighlightingInput.js');

var ScalarUnitInput = React.createClass({
    getInitialState: function(){
        return {
            scalar: Math.NEGATIVE_INFINITY,
            unit: '',
            units: [
                '%',
                'px'
            ]
        };
    },
    getDefaultProps: function(){
        return {
            name: 'foobarx',
            val: '####'
        };
    },
    componentWillMount: function(){
        var val = this.props.val || this.state.val;
        var selectedUnit;
        var idxL;
        var scalar;
        if(val){
            selectedUnit = this. state. units. find (function(unit){
                return unit === val.substr(-unit.length);
            });
            selectedUnit = selectedUnit || '';
            idxL = val.lastIndexOf('}') - 1;
            scalar = idxL !== -1 ? val.substr(1, idxL) : val;
        }else{
            selectedUnit = '';
            scalar = '';
        }
        this.setState({
            val: val,
            unit: selectedUnit,
            scalar: scalar
        });
    },
    componentWillReceiveProps: function(nextProps) {
        if(nextProps.val){
            this.setState({val: nextProps.val}); 
        } 
    },
    render: function() {
        var selectStyle = {
            marginLeft: '3px',
            WebkitAppearance: 'none'
        };
        var divStyle = {
            display: 'flex',  
            flexDirection: 'row',
            width: '100%',
        };
        var divLStyle = {
        };
        var divMStyle = {
            flexGrow: 10,
            position: 'relative'
        };
        var divRStyle = {
        };
        var options = this.state.units.map(function(unit, idx){
            var ret;
            ret = <option key={idx} value={unit}>{unit}</option>;
            return ret;
        }, this);
        options.push(<option key={this.state.units.length} value=''></option>) 
        return (
                <div style={divStyle}>
                <div style={divLStyle}>
                <label>{this.props.name}</label>
                </div>
                <div style={divMStyle}>
                <ParensHighlightInput val={this.state.scalar} onChange={this.onScalarChange}/>
                </div>
                <div style={divRStyle}>
                <select style={selectStyle} value={this.state.unit} onChange={this.onUnitChange}>{options}</select>
                </div>
                </div>
        );
    },
    onUnitChange: function(e){
        this.setState({
            unit:e.target.value
        });
        this.onChange('{' + this.state.scalar + '}' + e.target.value);
    },
    onScalarChange: function(val){
        this.setState({
            scalar:val
        });
        this.onChange('{' + val + '}' + this.state.unit);
    },
    onChange:function(val){
        if(this.props.onChange !== undefined) this.props.onChange(this.props.name, val);
    }
});
module.exports = ScalarUnitInput;
