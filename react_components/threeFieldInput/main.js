var React = require('./node_modules/react/dist/react.js');
var ReactDOM = require('./node_modules/react-dom/dist/react-dom.js');
var ThreeFieldInput = require('./threeFieldInput.js');

ReactDOM.render(
    React.createElement(ThreeFieldInput, {onChange:function(name, val){console.log(name, val)}}),
    document.getElementById('content')
);
ReactDOM.render(
    React.createElement(ThreeFieldInput, {val:'{(+ 20 10) 20 30}'}),
    document.getElementById('content2')
);
