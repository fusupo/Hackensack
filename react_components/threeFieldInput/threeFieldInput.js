var React = require('react');
var ReactDOM = require('react-dom');
var ParensHighlightInput = require('../parenHighlightingInput/parensHighlightingInput.js');

var ThreeFieldInput = React.createClass({
    getInitialState: function(){
        return {
            scalar1: '',
            scalar2: '',
            scalar3: ''
        };
    },
    getDefaultProps: function(){
        return {
            name: 'foobarx',
            val: '{}'
        };
    },
    componentWillMount: function(){
        var val = this.props.val || this.state.val;
        if(val){
            var idxL = val.lastIndexOf('}') - 1;
            var newState = {
                val: val
            };
            var scalar = idxL !== -1 ? val.substr(1, idxL) : val;
            scalar = this.parseInput(scalar);
            scalar.forEach(function(v, idx){
                newState['scalar'+(idx + 1)] = v;
            });
            this.setState(newState);
        }
    },
    parseInput: function(expr){
        var tokens = expr.split('');
        var subexprs = [];
        var subexpr = '';
        var balance = 0;
        while (tokens.length) {
            var token = tokens.shift();
            switch (token) {
            case '(':
                balance++;
                subexpr += token;
                break;
            case ')':
                balance--;
                subexpr += token;
                break;
            case ' ':
                if (balance === 0) {
                    subexprs.push(subexpr);
                    subexpr='';
                }else{
                    subexpr += token;
                }
                break;
            default:
                subexpr += token;
                break;
            }
        }
        if(subexpr.length > 0){
            subexprs.push(subexpr);
        }
        return subexprs;
    },
    componentWillReceiveProps: function(nextProps) {
        if(nextProps.val){
            var val = nextProps.val;
            var idxL = val.lastIndexOf('}') - 1;
            var newState = {
                val: val
            };
            var scalar = idxL !== -1 ? val.substr(1, idxL) : val;
            scalar =this.parseInput(scalar); 
            scalar.forEach(function(v, idx){
                newState['scalar'+(idx + 1)] = v;
            });
            this.setState(newState);
        } 
    },
    render: function() {
        var divMasterStyle = {
            display: 'flex',  
            flexDirection: 'row',
            width: '100%'
        };
        var divInnerStyle = {
            display: 'flex',  
            flexDirection: 'row',
            width: '100%'
        };
        var divLStyle = {
        };
        var divMStyle = {
            flexGrow: 1,
            position: 'relative'
        };
        var divM2Style = {
            flexGrow: 1,
            position: 'relative'
        };
        var divRStyle = {
            flexGrow: 1,
            position: 'relative'
        };
        var inputWidth = undefined;//'80px';
        return (
                <div style={divMasterStyle}>
                <div style={divLStyle}>
                <label>{this.props.name}</label>
                </div>
                <div style={divInnerStyle}>
                <div style={divMStyle}>
                <ParensHighlightInput val={this.state.scalar1} onChange={this.onScalar1Change} width={inputWidth}/>
                </div>
                <div style={divM2Style}>
                <ParensHighlightInput val={this.state.scalar2} onChange={this.onScalar2Change} width={inputWidth}/>
                </div>
                <div style={divRStyle}>
                <ParensHighlightInput val={this.state.scalar3} onChange={this.onScalar3Change} width={inputWidth}/>
                </div>
                </div>
                </div>
        );
    },
    onScalar1Change: function(val){
        this.setState({
            scalar1:val
        });
        this.onChange();
    },
    onScalar2Change: function(val){
        this.setState({
            scalar2:val
        });
        this.onChange();
    },
    onScalar3Change: function(val){
        this.setState({
            scalar3:val
        });
        this.onChange();
    },
    onChange:function(){
        var val = '{' + this.state.scalar1;
        val += this.state.scalar2 ? ' ' + this.state.scalar2 : '';
        val += this.state.scalar3 ? ' ' + this.state.scalar3 : '';
        val += '}';
        
        if(this.props.onChange !== undefined) this.props.onChange(this.props.name, val);
    }
});
module.exports = ThreeFieldInput;
