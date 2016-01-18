var React = require('react');
var ReactDOM = require('react-dom');

module.exports = ParensHighlightInput = React.createClass({
  getInitialState: function() {
    return {highlightHtml:''};
  },
  getDefaultProps: function(){
    return {
      width: 124,
      height: 13,
      fontSize: 10
    };
  },
  render: function() {
    var divStyle = {
       display: 'inline-block',
      // overflow: 'hidden',
      verticalAlign: 'top',
      color: '#282828',
      background: '#fff',
      // outline: 0,
      margin: '2px',
      width: this.props.width + 'px',
      height: this.props.height + 'px'
    };
    var preStyle = {
      display: 'inline-block',
      zIndex: 100,
      position: 'absolute',
      // overflow: 'hidden',
      fontFamily: 'Source Code Pro, monaco, courier',
      fontSize: this.props.fontSize + 'px',
      margin: '0px',
      border: '1px inset',
      padding: '0px',
      width: this.props.width + 'px',
      height: this.props.height + 'px',
      background: 'transparent',
      pointerEvents: 'none'
    };
    var inputStyle = {
      color: '#282828',
      background: '#fff',
      // outline: 0,
      fontFamily: 'Source Code Pro, monaco, courier',
      fontSize: this.props.fontSize + 'px',
      position: 'absolute',
      zIndex: 1,
      margin: '0px',
      border: '1px inset',
      padding: '0px',
      width: this.props.width + 'px',
      height: this.props.height + 'px'
    };
    return (
        <div style={divStyle}>
        <input style={inputStyle} onChange={this.foo} onKeyUp={this.foo} onInput={this.foo} onPaste={this.foo} onClick={this.foo}></input>
        <pre style={preStyle} dangerouslySetInnerHTML={{__html: this.state.highlightHtml}}></pre>
        </div>
    );
  },
  foo: function(e){
    console.log(this.getCursorPosition(e.target)); 
    this.colorize(e.target.value, this.getCursorPosition(e.target));
  },
  getCursorPosition: function(input) {
    if (!input) return; // No (input) element found
    if ('selectionStart' in input) {
      // Standard-compliant browsers
      return input.selectionStart;
    } else if (document.selection) {
      // IE
      input.focus();
      var sel = document.selection.createRange();
      var selLen = document.selection.createRange().text.length;
      sel.moveStart('character', -input.value.length);
      return sel.text.length - selLen;
    }
  },
  colorize: function(text, pos) {
    // var i = 0, current_times = 0;
    // var startc = '(', endc = ')';
    // var current = -1;
    
    // var entities = {'>': '&gt;','<':'&lt;'}; 
    // var p2 = 0;
    // var regex = new RegExp(Object.keys(entities).join("|"),'g');   
    // var converted = text.replace(regex, function(x, j) {
    //   if(pos > j) p2 += entities[x].length - 1; 
    //   return entities[x];
    // });
    
    // pos += p2;
    // var parens = [], indices = [], o = {};
    // var newText = converted.replace(/((?:\\)*)([()])/g, function(full, escape, x, idx) {
    //   var len = escape.split(/\\/g).length - 1;
    //   if (len % 2 == 0) {
    //     indices.push(idx);
    //     if (x == startc) ++i;
    //     o[idx] = { selected: false, type: x, depth: i, idx: idx, pair: -1, extra: escape };
    //     if (idx == pos) o[idx].selected = true;
    //     if (x == startc) parens.push(idx);
    //     else {
    //       if (parens.length > 0) {
    //         var p = parens.pop();
    //         o[idx].pair = p;
    //         if (o[p].selected) o[idx].selected = true;
    //         o[p].pair = idx;
    //         if (o[idx].selected) o[p].selected = true;
    //       }
    //       --i;
    //     }
    //   }
    // });
    // newText = converted;     
    // indices = indices.sort(function(x,y) { return Number(y) - Number(x); });
    // indices.forEach(function(i) {
    //   newText = newText.substr(0,i) + o[i].extra +
    //     "<span class='" + (o[i].pair == -1 ? "unmatched " : "paren_" + (o[i].depth % 5)) + 
    //     (o[i].selected ? " selected_paren": "") + "'>" + o[i].type + "</span>" + 
    //     newText.substr(i + 1 + o[i].extra.length);
    // });
    // console.log(newText);
    // var balancedParens = function(input) {
    //   var s = [];
    //   for (var i = 0; i < input.length; i++) {
    //     var c = input[i];
    //     switch (c) {
    //     case '(':
    //     case '{':
    //     case '[':
    //       s.push(c);
    //       break;
    //     case ')':
    //       var matchp = s.pop();
    //       if (matchp !== '(') return false;
    //       break;
    //     case '}':
    //       var matchp = s.pop();
    //       if (matchp !== '{') return false;
    //       break;
    //     case ']':
    //       var matchp = s.pop();
    //       if (matchp !== '[') return false;
    //       break;
    //     }
    //   }

    //   if (s.length > 0) {
    //     return false;
    //   } else {
    //     return true;
    //   };
    // }
    var textArr = text.split('');
    var newText = "";
    var balance = [];
    var colors = ['#00ff00',
                  '#b6e4b6',
                  '#c0c000',
                  '#008000',
                  '#808000'];
    textArr.forEach(function(i, idx){
      switch(i){
      case '(':
        textArr[idx] = str = '<span ';
        textArr[idx] += 'style="color: ' + colors[balance.length % 5];
        textArr[idx] += ';">'+i+'</span>';
        balance.push(i);
        break;
      case ')':
        var match = balance.pop();
        textArr[idx] = str = '<span ';
        textArr[idx] += 'style="color: ' + colors[balance.length % 5];
        textArr[idx] += ';">'+i+'</span>';
        break;
      default:
        textArr[idx]='<span>'+i+'</span>';
        break;
      }
    });
    newText = textArr.join('');
    this.setState({highlightHtml: newText});
    //return newText;
  }
});
