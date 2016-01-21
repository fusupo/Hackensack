var React = require('./node_modules/react/dist/react.js');
var ReactDOM = require('./node_modules/react-dom/dist/react-dom.js');
var ParensHighlightingInput = require('./parensHighlightingInput.js');

ReactDOM.render(
    React.createElement(ParensHighlightingInput, {width: '100px'}),
    document.getElementById('content')
);
ReactDOM.render(
    React.createElement(ParensHighlightingInput, null),
    document.getElementById('content2')
);
