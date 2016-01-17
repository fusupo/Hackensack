function createRichInput($original) {
  console.log('spmecrap');
  var newId = "richtext_" + $original.attr('id');
  var newElement = "<div class=\"richtext\" id=\"" + newId + "\"></div>";

  newId = '#' + newId;

  var width = 123; //$original.width();
  var height = 13; //$original.height();

  $original.wrap(newElement);
  var $newIdPre = $("<pre></pre>");
  $original.before($newIdPre);

  var $newId = $(newId);
  $newId.width(width).height(height);
  $newIdPre.width(width).height(height);

  $original.css({
    'background': 'transparent',
    'position': 'relative',
    'z-index': 100,
    'margin': 0,
    'height': height,
    'width': width,
    'border': '2px inset',
    'padding': 1
    //            'color': 'transparent'
  });

  $original.bind('propertychange keyup input paste click mousewheel', function() {
    var text = $original.val();
    $newIdPre.html(colorize(text, $original.getCursorPosition()));
  });
}

function colorize(text, pos) {
  var i = 0,
      current_times = 0;
  var startc = '(',
      endc = ')';
  var current = -1;

  var entities = {
    '>': '&gt;',
    '<': '&lt;'
  };
  var p2 = 0;
  var regex = new RegExp(Object.keys(entities).join("|"), 'g');
  var converted = text.replace(regex, function(x, j) {
    if (pos > j) p2 += entities[x].length - 1;
    return entities[x];
  });

  pos += p2;
  var parens = [],
      indices = [],
      o = {};
  var newText = converted.replace(/((?:\\)*)([()])/g, function(full, escape, x, idx) {
    var len = escape.split(/\\/g).length - 1;
    if (len % 2 == 0) {
      indices.push(idx);
      if (x == startc) ++i;
      o[idx] = {
        selected: false,
        type: x,
        depth: i,
        idx: idx,
        pair: -1,
        extra: escape
      };
      if (idx == pos) o[idx].selected = true;
      if (x == startc) parens.push(idx);
      else {
        if (parens.length > 0) {
          var p = parens.pop();
          o[idx].pair = p;
          if (o[p].selected) o[idx].selected = true;
          o[p].pair = idx;
          if (o[idx].selected) o[p].selected = true;
        }
        --i
      }
    }
  });
  var newtext = converted;
  indices = indices.sort(function(x, y) {
    return Number(y) - Number(x);
  });
  indices.forEach(function(i) {
    // newtext = newtext.substr(0, i);
    // newtext += o[i].extra;
    // newtext += "<span class='";
    // newtext += (o[i].pair == -1 ? "unmatched " : "paren_" + (o[i].depth % 5));
    // newtext += (o[i].selected ? " selected_paren" : "");
    // newtext += "'>" + o[i].type + "</span>";
    // newtext += newtext.substr(i + 1 + o[i].extra.length);
    newtext = newtext.substr(0, i) + o[i].extra +
      "<span class='" + (o[i].pair == -1 ? "unmatched " : "paren_" + (o[i].depth % 5)) +
      (o[i].selected ? " selected_paren" : "") + "'>" + o[i].type + "</span>" +
      newtext.substr(i + 1 + o[i].extra.length);
  });
  return newtext;
}

(function($) {
  $.fn.getCursorPosition = function() {
    var input = this.get(0);
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
  }
})(jQuery);

Polymer('input-percpx', {
  scalar: '{{foo}}', //9999999,
  scalarChanged: function(){
    console.log('SCALAR CHANGE!!!', this.scalar); 
    var text = this.scalar;//$(this.$.scalar).val();
    $($(this.$.scalar).siblings('pre')[0]).html(colorize(text, $(this.$.scalar).getCursorPosition()));
  },
  updateVal: function() {
    this.value = '{' + this.scalar + '}' + this.$.unit.value;
    console.log('UPDATE UPDAT EUPDATE ', this.scalar)
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
    console.log($('#scalar'));
    createRichInput($(this.$.scalar));

  }

});
