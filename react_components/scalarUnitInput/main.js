var React = require('./node_modules/react/dist/react.js');
var ReactDOM = require('./node_modules/react-dom/dist/react-dom.js');
var ScalarUnitInput = require('./scalarUnitInput.js');

ReactDOM.render(
    React.createElement(ScalarUnitInput, {val:'{50}%'}),
    document.getElementById('content')
);
ReactDOM.render(
    React.createElement(ScalarUnitInput, {val: ''}),
    document.getElementById('content2')
);
