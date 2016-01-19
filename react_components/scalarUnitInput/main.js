var React = require('./node_modules/react/dist/react.js');
var ReactDOM = require('./node_modules/react-dom/dist/react-dom.js');
var ScalarUnitInput = require('./scalarUnitInput.js');

// window.onLoad = function() {
ReactDOM.render(
    React.createElement(ScalarUnitInput, null),
    document.getElementById('content')
);
// ReactDOM.render(
//     React.createElement(ScalarUnitInput, null),
//     document.getElementById('content2')
// );
// }
