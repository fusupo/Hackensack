var React = require('react');
var ReactDOM = require('react-dom');
var parensHighlightInput = require('../parenHighlightingInput/dist/bundle.js');

module.exports = ScalarUnitInput = React.createClass({
  getInitialState: function() {
    return {};
  },
  render: function() {
    var selectStyle = {
      marginLeft: '3px',
      WebkitAppearance: 'none'
    };
    return (
        <div>
        <ParensHighlightInput />
        <select style={selectStyle}>
        <option>%</option>
        <option>px</option>
        <option></option>
        </select>
        </div>
    );
  },
  foo: function(e){
    console.log(this.getCursorPosition(e.target)); 
    this.colorize(e.target.value, this.getCursorPosition(e.target));
  }
});
