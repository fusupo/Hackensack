/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var tokenizer = __webpack_require__(1);
	var parser = __webpack_require__(4);
	var generator = __webpack_require__(7);
	var _ = __webpack_require__(3);
	//var example = '(defn avg (x y) ( / (+ x y ) 2)) (defn addOne (x) (+ x 1)) (print (avg (addOne 10) (addOne 20)))';
	// var example = '(+ 2 x)';
	// var tokens = tokenizer(example);
	// var tree = parser(tokens);
	// var output = generator(tree.roots);
	// //output = 'var core = require("./core.js");\n' + output;
	// //fs.writeFileSync('out.js', output);
	// console.log(output.toStr());

	// var example = '(+ 2 5)';
	// var tokens = tokenizer(example);
	// var tree = parser(tokens);
	// var output = generator(tree.roots);
	// console.log(output.toStr());

	// var example = '(+ 2 x)';
	// var tokens = tokenizer(example);
	// var tree = parser(tokens);
	// var output = generator(tree.roots, {
	//   x: 16
	// });
	// console.log(output.toStr());

	// var example = '(+ 2 x y)';
	// var tokens = tokenizer(example);
	// var tree = parser(tokens);
	// var output = generator(tree.roots, {
	//   x: 16
	// });
	// console.log(output.toStr());

	module.exports = minilisp = {
	  reduceExpr: function(expr, env) {
	    var tokens = tokenizer(expr);
	    var balancedP = balancedParens(tokens);
	    // _.reduce(tokens, function(m, o) {
	    //   if (o.type === 'operator' && (o.value === '(')) {
	    //     m++;
	    //   } else if (o.type === 'operator' && o.value === ')') {
	    //     m--;
	    //   }
	    //   return m;
	    // }, 0);
	    if (balancedP) {
	      var tree = parser(tokens);
	      var output = generator(tree.roots, env);
	      console.log(output.toStr());
	      return output.toStr();
	    }
	    return 0;
	  }
	};

	var balancedParens = function(input) {
	  var s = [];
	  for (var i = 0; i < input.length; i++) {
	    var c = input[i];
	    switch (c.value) {
	    case '(':
	    case '{':
	    case '[':
	      s.push(c.value);
	      break;
	    case ')':
	      var matchp = s.pop();
	      if (matchp !== '(') return false;
	      break;
	    case '}':
	      var matchp = s.pop();
	      if (matchp !== '{') return false;
	      break;
	    case ']':
	      var matchp = s.pop();
	      if (matchp !== '[') return false;
	      break;
	    }
	  }

	  if (s.length > 0) {
	    return false;
	  } else {
	    return true;
	  };
	};


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var constants = __webpack_require__(2);
	var _ = __webpack_require__(3);

	module.exports = function tokenizer(text) {
	  text = "" + text;
	  var result = [];
	  var tokenStream = new TokenStream(text);
	  while (!tokenStream.isDone()) {
	    var token = tokenStream.currentToken();

	    if (constants.isAToken(token)) {
	      result.push({
	        type: 'operator',
	        value: token
	      });
	    } else if (constants.isALetter(token)) {
	      while (constants.isALetter(tokenStream.nextToken()) ||
	             constants.isANumber(tokenStream.nextToken())) {
	        tokenStream.advance();
	        token += tokenStream.currentToken();
	      }
	      result.push({
	        type: 'keyword',
	        value: token
	      });
	    } else if (constants.isANumber(token)) {
	      while (constants.isANumber(tokenStream.nextToken())) {
	        tokenStream.advance();
	        token += tokenStream.currentToken();
	      }
	      result.push({
	        type: 'number',
	        value: token
	      });
	    } else if (token === constants.quote) {
	      while (constants.isALetter(tokenStream.nextToken())) {
	        tokenStream.advance();
	        token += tokenStream.currentToken();
	      }
	      tokenStream.advance();
	      token += tokenStream.currentToken();
	      result.push({
	        type: 'string',
	        value: token
	      });
	    }

	    tokenStream.advance();
	  }
	  return result;
	};

	var TokenStream = function(text) {
	  this.text = text;
	  this.index = 0;
	  this.done = false;
	};

	TokenStream.prototype.advance = function() {
	  if (this.index === this.text.length) {
	    this.done = true;
	  } else {
	    this.index++;
	  }
	};

	TokenStream.prototype.currentToken = function() {
	  return this.text[this.index];
	};

	TokenStream.prototype.isDone = function() {
	  return this.done;
	};

	TokenStream.prototype.nextToken = function() {
	  return this.text[this.index + 1];
	};

	TokenStream.prototype.prevToken = function() {
	  return this.text[this.index - 1];
	};


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(3);

	module.exports = {
	  openParens: '(',
	  closeParens: ')',
	  openBrackets: '[',
	  closeBrackets: ']',
	  plus: '+',
	  minus: '-',
	  times: '*',
	  divide: '/',
	  quote: '"',
	  isALetter: _.partial(_.contains, '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
	  isANumber: _.partial(_.contains, '0123456789'),
	  isAToken: _.partial(_.contains, '[]()*+-/'),
	  functionMap: {
	    '+': 'add',
	    '-': 'subtract',
	    '*': 'multiply',
	    '/': 'divide',
	    print: 'print',
	    ct: 'ct',
	    gt: 'gt'
	  },
	  coreFunctions: ['print', 'defn', 'ct', 'gt']
	};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Underscore.js 1.8.3
	//     http://underscorejs.org
	//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Underscore may be freely distributed under the MIT license.

	(function() {

	  // Baseline setup
	  // --------------

	  // Establish the root object, `window` in the browser, or `exports` on the server.
	  var root = this;

	  // Save the previous value of the `_` variable.
	  var previousUnderscore = root._;

	  // Save bytes in the minified (but not gzipped) version:
	  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	  // Create quick reference variables for speed access to core prototypes.
	  var
	    push             = ArrayProto.push,
	    slice            = ArrayProto.slice,
	    toString         = ObjProto.toString,
	    hasOwnProperty   = ObjProto.hasOwnProperty;

	  // All **ECMAScript 5** native function implementations that we hope to use
	  // are declared here.
	  var
	    nativeIsArray      = Array.isArray,
	    nativeKeys         = Object.keys,
	    nativeBind         = FuncProto.bind,
	    nativeCreate       = Object.create;

	  // Naked function reference for surrogate-prototype-swapping.
	  var Ctor = function(){};

	  // Create a safe reference to the Underscore object for use below.
	  var _ = function(obj) {
	    if (obj instanceof _) return obj;
	    if (!(this instanceof _)) return new _(obj);
	    this._wrapped = obj;
	  };

	  // Export the Underscore object for **Node.js**, with
	  // backwards-compatibility for the old `require()` API. If we're in
	  // the browser, add `_` as a global object.
	  if (true) {
	    if (typeof module !== 'undefined' && module.exports) {
	      exports = module.exports = _;
	    }
	    exports._ = _;
	  } else {
	    root._ = _;
	  }

	  // Current version.
	  _.VERSION = '1.8.3';

	  // Internal function that returns an efficient (for current engines) version
	  // of the passed-in callback, to be repeatedly applied in other Underscore
	  // functions.
	  var optimizeCb = function(func, context, argCount) {
	    if (context === void 0) return func;
	    switch (argCount == null ? 3 : argCount) {
	      case 1: return function(value) {
	        return func.call(context, value);
	      };
	      case 2: return function(value, other) {
	        return func.call(context, value, other);
	      };
	      case 3: return function(value, index, collection) {
	        return func.call(context, value, index, collection);
	      };
	      case 4: return function(accumulator, value, index, collection) {
	        return func.call(context, accumulator, value, index, collection);
	      };
	    }
	    return function() {
	      return func.apply(context, arguments);
	    };
	  };

	  // A mostly-internal function to generate callbacks that can be applied
	  // to each element in a collection, returning the desired result — either
	  // identity, an arbitrary callback, a property matcher, or a property accessor.
	  var cb = function(value, context, argCount) {
	    if (value == null) return _.identity;
	    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
	    if (_.isObject(value)) return _.matcher(value);
	    return _.property(value);
	  };
	  _.iteratee = function(value, context) {
	    return cb(value, context, Infinity);
	  };

	  // An internal function for creating assigner functions.
	  var createAssigner = function(keysFunc, undefinedOnly) {
	    return function(obj) {
	      var length = arguments.length;
	      if (length < 2 || obj == null) return obj;
	      for (var index = 1; index < length; index++) {
	        var source = arguments[index],
	            keys = keysFunc(source),
	            l = keys.length;
	        for (var i = 0; i < l; i++) {
	          var key = keys[i];
	          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
	        }
	      }
	      return obj;
	    };
	  };

	  // An internal function for creating a new object that inherits from another.
	  var baseCreate = function(prototype) {
	    if (!_.isObject(prototype)) return {};
	    if (nativeCreate) return nativeCreate(prototype);
	    Ctor.prototype = prototype;
	    var result = new Ctor;
	    Ctor.prototype = null;
	    return result;
	  };

	  var property = function(key) {
	    return function(obj) {
	      return obj == null ? void 0 : obj[key];
	    };
	  };

	  // Helper for collection methods to determine whether a collection
	  // should be iterated as an array or as an object
	  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
	  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	  var getLength = property('length');
	  var isArrayLike = function(collection) {
	    var length = getLength(collection);
	    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	  };

	  // Collection Functions
	  // --------------------

	  // The cornerstone, an `each` implementation, aka `forEach`.
	  // Handles raw objects in addition to array-likes. Treats all
	  // sparse array-likes as if they were dense.
	  _.each = _.forEach = function(obj, iteratee, context) {
	    iteratee = optimizeCb(iteratee, context);
	    var i, length;
	    if (isArrayLike(obj)) {
	      for (i = 0, length = obj.length; i < length; i++) {
	        iteratee(obj[i], i, obj);
	      }
	    } else {
	      var keys = _.keys(obj);
	      for (i = 0, length = keys.length; i < length; i++) {
	        iteratee(obj[keys[i]], keys[i], obj);
	      }
	    }
	    return obj;
	  };

	  // Return the results of applying the iteratee to each element.
	  _.map = _.collect = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length,
	        results = Array(length);
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      results[index] = iteratee(obj[currentKey], currentKey, obj);
	    }
	    return results;
	  };

	  // Create a reducing function iterating left or right.
	  function createReduce(dir) {
	    // Optimized iterator function as using arguments.length
	    // in the main function will deoptimize the, see #1991.
	    function iterator(obj, iteratee, memo, keys, index, length) {
	      for (; index >= 0 && index < length; index += dir) {
	        var currentKey = keys ? keys[index] : index;
	        memo = iteratee(memo, obj[currentKey], currentKey, obj);
	      }
	      return memo;
	    }

	    return function(obj, iteratee, memo, context) {
	      iteratee = optimizeCb(iteratee, context, 4);
	      var keys = !isArrayLike(obj) && _.keys(obj),
	          length = (keys || obj).length,
	          index = dir > 0 ? 0 : length - 1;
	      // Determine the initial value if none is provided.
	      if (arguments.length < 3) {
	        memo = obj[keys ? keys[index] : index];
	        index += dir;
	      }
	      return iterator(obj, iteratee, memo, keys, index, length);
	    };
	  }

	  // **Reduce** builds up a single result from a list of values, aka `inject`,
	  // or `foldl`.
	  _.reduce = _.foldl = _.inject = createReduce(1);

	  // The right-associative version of reduce, also known as `foldr`.
	  _.reduceRight = _.foldr = createReduce(-1);

	  // Return the first value which passes a truth test. Aliased as `detect`.
	  _.find = _.detect = function(obj, predicate, context) {
	    var key;
	    if (isArrayLike(obj)) {
	      key = _.findIndex(obj, predicate, context);
	    } else {
	      key = _.findKey(obj, predicate, context);
	    }
	    if (key !== void 0 && key !== -1) return obj[key];
	  };

	  // Return all the elements that pass a truth test.
	  // Aliased as `select`.
	  _.filter = _.select = function(obj, predicate, context) {
	    var results = [];
	    predicate = cb(predicate, context);
	    _.each(obj, function(value, index, list) {
	      if (predicate(value, index, list)) results.push(value);
	    });
	    return results;
	  };

	  // Return all the elements for which a truth test fails.
	  _.reject = function(obj, predicate, context) {
	    return _.filter(obj, _.negate(cb(predicate)), context);
	  };

	  // Determine whether all of the elements match a truth test.
	  // Aliased as `all`.
	  _.every = _.all = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (!predicate(obj[currentKey], currentKey, obj)) return false;
	    }
	    return true;
	  };

	  // Determine if at least one element in the object matches a truth test.
	  // Aliased as `any`.
	  _.some = _.any = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (predicate(obj[currentKey], currentKey, obj)) return true;
	    }
	    return false;
	  };

	  // Determine if the array or object contains a given item (using `===`).
	  // Aliased as `includes` and `include`.
	  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
	    if (!isArrayLike(obj)) obj = _.values(obj);
	    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
	    return _.indexOf(obj, item, fromIndex) >= 0;
	  };

	  // Invoke a method (with arguments) on every item in a collection.
	  _.invoke = function(obj, method) {
	    var args = slice.call(arguments, 2);
	    var isFunc = _.isFunction(method);
	    return _.map(obj, function(value) {
	      var func = isFunc ? method : value[method];
	      return func == null ? func : func.apply(value, args);
	    });
	  };

	  // Convenience version of a common use case of `map`: fetching a property.
	  _.pluck = function(obj, key) {
	    return _.map(obj, _.property(key));
	  };

	  // Convenience version of a common use case of `filter`: selecting only objects
	  // containing specific `key:value` pairs.
	  _.where = function(obj, attrs) {
	    return _.filter(obj, _.matcher(attrs));
	  };

	  // Convenience version of a common use case of `find`: getting the first object
	  // containing specific `key:value` pairs.
	  _.findWhere = function(obj, attrs) {
	    return _.find(obj, _.matcher(attrs));
	  };

	  // Return the maximum element (or element-based computation).
	  _.max = function(obj, iteratee, context) {
	    var result = -Infinity, lastComputed = -Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value > result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Return the minimum element (or element-based computation).
	  _.min = function(obj, iteratee, context) {
	    var result = Infinity, lastComputed = Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value < result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed < lastComputed || computed === Infinity && result === Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Shuffle a collection, using the modern version of the
	  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	  _.shuffle = function(obj) {
	    var set = isArrayLike(obj) ? obj : _.values(obj);
	    var length = set.length;
	    var shuffled = Array(length);
	    for (var index = 0, rand; index < length; index++) {
	      rand = _.random(0, index);
	      if (rand !== index) shuffled[index] = shuffled[rand];
	      shuffled[rand] = set[index];
	    }
	    return shuffled;
	  };

	  // Sample **n** random values from a collection.
	  // If **n** is not specified, returns a single random element.
	  // The internal `guard` argument allows it to work with `map`.
	  _.sample = function(obj, n, guard) {
	    if (n == null || guard) {
	      if (!isArrayLike(obj)) obj = _.values(obj);
	      return obj[_.random(obj.length - 1)];
	    }
	    return _.shuffle(obj).slice(0, Math.max(0, n));
	  };

	  // Sort the object's values by a criterion produced by an iteratee.
	  _.sortBy = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    return _.pluck(_.map(obj, function(value, index, list) {
	      return {
	        value: value,
	        index: index,
	        criteria: iteratee(value, index, list)
	      };
	    }).sort(function(left, right) {
	      var a = left.criteria;
	      var b = right.criteria;
	      if (a !== b) {
	        if (a > b || a === void 0) return 1;
	        if (a < b || b === void 0) return -1;
	      }
	      return left.index - right.index;
	    }), 'value');
	  };

	  // An internal function used for aggregate "group by" operations.
	  var group = function(behavior) {
	    return function(obj, iteratee, context) {
	      var result = {};
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index) {
	        var key = iteratee(value, index, obj);
	        behavior(result, value, key);
	      });
	      return result;
	    };
	  };

	  // Groups the object's values by a criterion. Pass either a string attribute
	  // to group by, or a function that returns the criterion.
	  _.groupBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
	  });

	  // Indexes the object's values by a criterion, similar to `groupBy`, but for
	  // when you know that your index values will be unique.
	  _.indexBy = group(function(result, value, key) {
	    result[key] = value;
	  });

	  // Counts instances of an object that group by a certain criterion. Pass
	  // either a string attribute to count by, or a function that returns the
	  // criterion.
	  _.countBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key]++; else result[key] = 1;
	  });

	  // Safely create a real, live array from anything iterable.
	  _.toArray = function(obj) {
	    if (!obj) return [];
	    if (_.isArray(obj)) return slice.call(obj);
	    if (isArrayLike(obj)) return _.map(obj, _.identity);
	    return _.values(obj);
	  };

	  // Return the number of elements in an object.
	  _.size = function(obj) {
	    if (obj == null) return 0;
	    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
	  };

	  // Split a collection into two arrays: one whose elements all satisfy the given
	  // predicate, and one whose elements all do not satisfy the predicate.
	  _.partition = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var pass = [], fail = [];
	    _.each(obj, function(value, key, obj) {
	      (predicate(value, key, obj) ? pass : fail).push(value);
	    });
	    return [pass, fail];
	  };

	  // Array Functions
	  // ---------------

	  // Get the first element of an array. Passing **n** will return the first N
	  // values in the array. Aliased as `head` and `take`. The **guard** check
	  // allows it to work with `_.map`.
	  _.first = _.head = _.take = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[0];
	    return _.initial(array, array.length - n);
	  };

	  // Returns everything but the last entry of the array. Especially useful on
	  // the arguments object. Passing **n** will return all the values in
	  // the array, excluding the last N.
	  _.initial = function(array, n, guard) {
	    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
	  };

	  // Get the last element of an array. Passing **n** will return the last N
	  // values in the array.
	  _.last = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[array.length - 1];
	    return _.rest(array, Math.max(0, array.length - n));
	  };

	  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	  // Especially useful on the arguments object. Passing an **n** will return
	  // the rest N values in the array.
	  _.rest = _.tail = _.drop = function(array, n, guard) {
	    return slice.call(array, n == null || guard ? 1 : n);
	  };

	  // Trim out all falsy values from an array.
	  _.compact = function(array) {
	    return _.filter(array, _.identity);
	  };

	  // Internal implementation of a recursive `flatten` function.
	  var flatten = function(input, shallow, strict, startIndex) {
	    var output = [], idx = 0;
	    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
	      var value = input[i];
	      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
	        //flatten current level of array or arguments object
	        if (!shallow) value = flatten(value, shallow, strict);
	        var j = 0, len = value.length;
	        output.length += len;
	        while (j < len) {
	          output[idx++] = value[j++];
	        }
	      } else if (!strict) {
	        output[idx++] = value;
	      }
	    }
	    return output;
	  };

	  // Flatten out an array, either recursively (by default), or just one level.
	  _.flatten = function(array, shallow) {
	    return flatten(array, shallow, false);
	  };

	  // Return a version of the array that does not contain the specified value(s).
	  _.without = function(array) {
	    return _.difference(array, slice.call(arguments, 1));
	  };

	  // Produce a duplicate-free version of the array. If the array has already
	  // been sorted, you have the option of using a faster algorithm.
	  // Aliased as `unique`.
	  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
	    if (!_.isBoolean(isSorted)) {
	      context = iteratee;
	      iteratee = isSorted;
	      isSorted = false;
	    }
	    if (iteratee != null) iteratee = cb(iteratee, context);
	    var result = [];
	    var seen = [];
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var value = array[i],
	          computed = iteratee ? iteratee(value, i, array) : value;
	      if (isSorted) {
	        if (!i || seen !== computed) result.push(value);
	        seen = computed;
	      } else if (iteratee) {
	        if (!_.contains(seen, computed)) {
	          seen.push(computed);
	          result.push(value);
	        }
	      } else if (!_.contains(result, value)) {
	        result.push(value);
	      }
	    }
	    return result;
	  };

	  // Produce an array that contains the union: each distinct element from all of
	  // the passed-in arrays.
	  _.union = function() {
	    return _.uniq(flatten(arguments, true, true));
	  };

	  // Produce an array that contains every item shared between all the
	  // passed-in arrays.
	  _.intersection = function(array) {
	    var result = [];
	    var argsLength = arguments.length;
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var item = array[i];
	      if (_.contains(result, item)) continue;
	      for (var j = 1; j < argsLength; j++) {
	        if (!_.contains(arguments[j], item)) break;
	      }
	      if (j === argsLength) result.push(item);
	    }
	    return result;
	  };

	  // Take the difference between one array and a number of other arrays.
	  // Only the elements present in just the first array will remain.
	  _.difference = function(array) {
	    var rest = flatten(arguments, true, true, 1);
	    return _.filter(array, function(value){
	      return !_.contains(rest, value);
	    });
	  };

	  // Zip together multiple lists into a single array -- elements that share
	  // an index go together.
	  _.zip = function() {
	    return _.unzip(arguments);
	  };

	  // Complement of _.zip. Unzip accepts an array of arrays and groups
	  // each array's elements on shared indices
	  _.unzip = function(array) {
	    var length = array && _.max(array, getLength).length || 0;
	    var result = Array(length);

	    for (var index = 0; index < length; index++) {
	      result[index] = _.pluck(array, index);
	    }
	    return result;
	  };

	  // Converts lists into objects. Pass either a single array of `[key, value]`
	  // pairs, or two parallel arrays of the same length -- one of keys, and one of
	  // the corresponding values.
	  _.object = function(list, values) {
	    var result = {};
	    for (var i = 0, length = getLength(list); i < length; i++) {
	      if (values) {
	        result[list[i]] = values[i];
	      } else {
	        result[list[i][0]] = list[i][1];
	      }
	    }
	    return result;
	  };

	  // Generator function to create the findIndex and findLastIndex functions
	  function createPredicateIndexFinder(dir) {
	    return function(array, predicate, context) {
	      predicate = cb(predicate, context);
	      var length = getLength(array);
	      var index = dir > 0 ? 0 : length - 1;
	      for (; index >= 0 && index < length; index += dir) {
	        if (predicate(array[index], index, array)) return index;
	      }
	      return -1;
	    };
	  }

	  // Returns the first index on an array-like that passes a predicate test
	  _.findIndex = createPredicateIndexFinder(1);
	  _.findLastIndex = createPredicateIndexFinder(-1);

	  // Use a comparator function to figure out the smallest index at which
	  // an object should be inserted so as to maintain order. Uses binary search.
	  _.sortedIndex = function(array, obj, iteratee, context) {
	    iteratee = cb(iteratee, context, 1);
	    var value = iteratee(obj);
	    var low = 0, high = getLength(array);
	    while (low < high) {
	      var mid = Math.floor((low + high) / 2);
	      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
	    }
	    return low;
	  };

	  // Generator function to create the indexOf and lastIndexOf functions
	  function createIndexFinder(dir, predicateFind, sortedIndex) {
	    return function(array, item, idx) {
	      var i = 0, length = getLength(array);
	      if (typeof idx == 'number') {
	        if (dir > 0) {
	            i = idx >= 0 ? idx : Math.max(idx + length, i);
	        } else {
	            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
	        }
	      } else if (sortedIndex && idx && length) {
	        idx = sortedIndex(array, item);
	        return array[idx] === item ? idx : -1;
	      }
	      if (item !== item) {
	        idx = predicateFind(slice.call(array, i, length), _.isNaN);
	        return idx >= 0 ? idx + i : -1;
	      }
	      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
	        if (array[idx] === item) return idx;
	      }
	      return -1;
	    };
	  }

	  // Return the position of the first occurrence of an item in an array,
	  // or -1 if the item is not included in the array.
	  // If the array is large and already in sort order, pass `true`
	  // for **isSorted** to use binary search.
	  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
	  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

	  // Generate an integer Array containing an arithmetic progression. A port of
	  // the native Python `range()` function. See
	  // [the Python documentation](http://docs.python.org/library/functions.html#range).
	  _.range = function(start, stop, step) {
	    if (stop == null) {
	      stop = start || 0;
	      start = 0;
	    }
	    step = step || 1;

	    var length = Math.max(Math.ceil((stop - start) / step), 0);
	    var range = Array(length);

	    for (var idx = 0; idx < length; idx++, start += step) {
	      range[idx] = start;
	    }

	    return range;
	  };

	  // Function (ahem) Functions
	  // ------------------

	  // Determines whether to execute a function as a constructor
	  // or a normal function with the provided arguments
	  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
	    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
	    var self = baseCreate(sourceFunc.prototype);
	    var result = sourceFunc.apply(self, args);
	    if (_.isObject(result)) return result;
	    return self;
	  };

	  // Create a function bound to a given object (assigning `this`, and arguments,
	  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	  // available.
	  _.bind = function(func, context) {
	    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
	    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
	    var args = slice.call(arguments, 2);
	    var bound = function() {
	      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
	    };
	    return bound;
	  };

	  // Partially apply a function by creating a version that has had some of its
	  // arguments pre-filled, without changing its dynamic `this` context. _ acts
	  // as a placeholder, allowing any combination of arguments to be pre-filled.
	  _.partial = function(func) {
	    var boundArgs = slice.call(arguments, 1);
	    var bound = function() {
	      var position = 0, length = boundArgs.length;
	      var args = Array(length);
	      for (var i = 0; i < length; i++) {
	        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
	      }
	      while (position < arguments.length) args.push(arguments[position++]);
	      return executeBound(func, bound, this, this, args);
	    };
	    return bound;
	  };

	  // Bind a number of an object's methods to that object. Remaining arguments
	  // are the method names to be bound. Useful for ensuring that all callbacks
	  // defined on an object belong to it.
	  _.bindAll = function(obj) {
	    var i, length = arguments.length, key;
	    if (length <= 1) throw new Error('bindAll must be passed function names');
	    for (i = 1; i < length; i++) {
	      key = arguments[i];
	      obj[key] = _.bind(obj[key], obj);
	    }
	    return obj;
	  };

	  // Memoize an expensive function by storing its results.
	  _.memoize = function(func, hasher) {
	    var memoize = function(key) {
	      var cache = memoize.cache;
	      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
	      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
	      return cache[address];
	    };
	    memoize.cache = {};
	    return memoize;
	  };

	  // Delays a function for the given number of milliseconds, and then calls
	  // it with the arguments supplied.
	  _.delay = function(func, wait) {
	    var args = slice.call(arguments, 2);
	    return setTimeout(function(){
	      return func.apply(null, args);
	    }, wait);
	  };

	  // Defers a function, scheduling it to run after the current call stack has
	  // cleared.
	  _.defer = _.partial(_.delay, _, 1);

	  // Returns a function, that, when invoked, will only be triggered at most once
	  // during a given window of time. Normally, the throttled function will run
	  // as much as it can, without ever going more than once per `wait` duration;
	  // but if you'd like to disable the execution on the leading edge, pass
	  // `{leading: false}`. To disable execution on the trailing edge, ditto.
	  _.throttle = function(func, wait, options) {
	    var context, args, result;
	    var timeout = null;
	    var previous = 0;
	    if (!options) options = {};
	    var later = function() {
	      previous = options.leading === false ? 0 : _.now();
	      timeout = null;
	      result = func.apply(context, args);
	      if (!timeout) context = args = null;
	    };
	    return function() {
	      var now = _.now();
	      if (!previous && options.leading === false) previous = now;
	      var remaining = wait - (now - previous);
	      context = this;
	      args = arguments;
	      if (remaining <= 0 || remaining > wait) {
	        if (timeout) {
	          clearTimeout(timeout);
	          timeout = null;
	        }
	        previous = now;
	        result = func.apply(context, args);
	        if (!timeout) context = args = null;
	      } else if (!timeout && options.trailing !== false) {
	        timeout = setTimeout(later, remaining);
	      }
	      return result;
	    };
	  };

	  // Returns a function, that, as long as it continues to be invoked, will not
	  // be triggered. The function will be called after it stops being called for
	  // N milliseconds. If `immediate` is passed, trigger the function on the
	  // leading edge, instead of the trailing.
	  _.debounce = function(func, wait, immediate) {
	    var timeout, args, context, timestamp, result;

	    var later = function() {
	      var last = _.now() - timestamp;

	      if (last < wait && last >= 0) {
	        timeout = setTimeout(later, wait - last);
	      } else {
	        timeout = null;
	        if (!immediate) {
	          result = func.apply(context, args);
	          if (!timeout) context = args = null;
	        }
	      }
	    };

	    return function() {
	      context = this;
	      args = arguments;
	      timestamp = _.now();
	      var callNow = immediate && !timeout;
	      if (!timeout) timeout = setTimeout(later, wait);
	      if (callNow) {
	        result = func.apply(context, args);
	        context = args = null;
	      }

	      return result;
	    };
	  };

	  // Returns the first function passed as an argument to the second,
	  // allowing you to adjust arguments, run code before and after, and
	  // conditionally execute the original function.
	  _.wrap = function(func, wrapper) {
	    return _.partial(wrapper, func);
	  };

	  // Returns a negated version of the passed-in predicate.
	  _.negate = function(predicate) {
	    return function() {
	      return !predicate.apply(this, arguments);
	    };
	  };

	  // Returns a function that is the composition of a list of functions, each
	  // consuming the return value of the function that follows.
	  _.compose = function() {
	    var args = arguments;
	    var start = args.length - 1;
	    return function() {
	      var i = start;
	      var result = args[start].apply(this, arguments);
	      while (i--) result = args[i].call(this, result);
	      return result;
	    };
	  };

	  // Returns a function that will only be executed on and after the Nth call.
	  _.after = function(times, func) {
	    return function() {
	      if (--times < 1) {
	        return func.apply(this, arguments);
	      }
	    };
	  };

	  // Returns a function that will only be executed up to (but not including) the Nth call.
	  _.before = function(times, func) {
	    var memo;
	    return function() {
	      if (--times > 0) {
	        memo = func.apply(this, arguments);
	      }
	      if (times <= 1) func = null;
	      return memo;
	    };
	  };

	  // Returns a function that will be executed at most one time, no matter how
	  // often you call it. Useful for lazy initialization.
	  _.once = _.partial(_.before, 2);

	  // Object Functions
	  // ----------------

	  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
	  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
	  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
	                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

	  function collectNonEnumProps(obj, keys) {
	    var nonEnumIdx = nonEnumerableProps.length;
	    var constructor = obj.constructor;
	    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

	    // Constructor is a special case.
	    var prop = 'constructor';
	    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

	    while (nonEnumIdx--) {
	      prop = nonEnumerableProps[nonEnumIdx];
	      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
	        keys.push(prop);
	      }
	    }
	  }

	  // Retrieve the names of an object's own properties.
	  // Delegates to **ECMAScript 5**'s native `Object.keys`
	  _.keys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    if (nativeKeys) return nativeKeys(obj);
	    var keys = [];
	    for (var key in obj) if (_.has(obj, key)) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve all the property names of an object.
	  _.allKeys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    var keys = [];
	    for (var key in obj) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve the values of an object's properties.
	  _.values = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var values = Array(length);
	    for (var i = 0; i < length; i++) {
	      values[i] = obj[keys[i]];
	    }
	    return values;
	  };

	  // Returns the results of applying the iteratee to each element of the object
	  // In contrast to _.map it returns an object
	  _.mapObject = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys =  _.keys(obj),
	          length = keys.length,
	          results = {},
	          currentKey;
	      for (var index = 0; index < length; index++) {
	        currentKey = keys[index];
	        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
	      }
	      return results;
	  };

	  // Convert an object into a list of `[key, value]` pairs.
	  _.pairs = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var pairs = Array(length);
	    for (var i = 0; i < length; i++) {
	      pairs[i] = [keys[i], obj[keys[i]]];
	    }
	    return pairs;
	  };

	  // Invert the keys and values of an object. The values must be serializable.
	  _.invert = function(obj) {
	    var result = {};
	    var keys = _.keys(obj);
	    for (var i = 0, length = keys.length; i < length; i++) {
	      result[obj[keys[i]]] = keys[i];
	    }
	    return result;
	  };

	  // Return a sorted list of the function names available on the object.
	  // Aliased as `methods`
	  _.functions = _.methods = function(obj) {
	    var names = [];
	    for (var key in obj) {
	      if (_.isFunction(obj[key])) names.push(key);
	    }
	    return names.sort();
	  };

	  // Extend a given object with all the properties in passed-in object(s).
	  _.extend = createAssigner(_.allKeys);

	  // Assigns a given object with all the own properties in the passed-in object(s)
	  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
	  _.extendOwn = _.assign = createAssigner(_.keys);

	  // Returns the first key on an object that passes a predicate test
	  _.findKey = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = _.keys(obj), key;
	    for (var i = 0, length = keys.length; i < length; i++) {
	      key = keys[i];
	      if (predicate(obj[key], key, obj)) return key;
	    }
	  };

	  // Return a copy of the object only containing the whitelisted properties.
	  _.pick = function(object, oiteratee, context) {
	    var result = {}, obj = object, iteratee, keys;
	    if (obj == null) return result;
	    if (_.isFunction(oiteratee)) {
	      keys = _.allKeys(obj);
	      iteratee = optimizeCb(oiteratee, context);
	    } else {
	      keys = flatten(arguments, false, false, 1);
	      iteratee = function(value, key, obj) { return key in obj; };
	      obj = Object(obj);
	    }
	    for (var i = 0, length = keys.length; i < length; i++) {
	      var key = keys[i];
	      var value = obj[key];
	      if (iteratee(value, key, obj)) result[key] = value;
	    }
	    return result;
	  };

	   // Return a copy of the object without the blacklisted properties.
	  _.omit = function(obj, iteratee, context) {
	    if (_.isFunction(iteratee)) {
	      iteratee = _.negate(iteratee);
	    } else {
	      var keys = _.map(flatten(arguments, false, false, 1), String);
	      iteratee = function(value, key) {
	        return !_.contains(keys, key);
	      };
	    }
	    return _.pick(obj, iteratee, context);
	  };

	  // Fill in a given object with default properties.
	  _.defaults = createAssigner(_.allKeys, true);

	  // Creates an object that inherits from the given prototype object.
	  // If additional properties are provided then they will be added to the
	  // created object.
	  _.create = function(prototype, props) {
	    var result = baseCreate(prototype);
	    if (props) _.extendOwn(result, props);
	    return result;
	  };

	  // Create a (shallow-cloned) duplicate of an object.
	  _.clone = function(obj) {
	    if (!_.isObject(obj)) return obj;
	    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	  };

	  // Invokes interceptor with the obj, and then returns obj.
	  // The primary purpose of this method is to "tap into" a method chain, in
	  // order to perform operations on intermediate results within the chain.
	  _.tap = function(obj, interceptor) {
	    interceptor(obj);
	    return obj;
	  };

	  // Returns whether an object has a given set of `key:value` pairs.
	  _.isMatch = function(object, attrs) {
	    var keys = _.keys(attrs), length = keys.length;
	    if (object == null) return !length;
	    var obj = Object(object);
	    for (var i = 0; i < length; i++) {
	      var key = keys[i];
	      if (attrs[key] !== obj[key] || !(key in obj)) return false;
	    }
	    return true;
	  };


	  // Internal recursive comparison function for `isEqual`.
	  var eq = function(a, b, aStack, bStack) {
	    // Identical objects are equal. `0 === -0`, but they aren't identical.
	    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	    if (a === b) return a !== 0 || 1 / a === 1 / b;
	    // A strict comparison is necessary because `null == undefined`.
	    if (a == null || b == null) return a === b;
	    // Unwrap any wrapped objects.
	    if (a instanceof _) a = a._wrapped;
	    if (b instanceof _) b = b._wrapped;
	    // Compare `[[Class]]` names.
	    var className = toString.call(a);
	    if (className !== toString.call(b)) return false;
	    switch (className) {
	      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
	      case '[object RegExp]':
	      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
	      case '[object String]':
	        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	        // equivalent to `new String("5")`.
	        return '' + a === '' + b;
	      case '[object Number]':
	        // `NaN`s are equivalent, but non-reflexive.
	        // Object(NaN) is equivalent to NaN
	        if (+a !== +a) return +b !== +b;
	        // An `egal` comparison is performed for other numeric values.
	        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
	      case '[object Date]':
	      case '[object Boolean]':
	        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	        // millisecond representations. Note that invalid dates with millisecond representations
	        // of `NaN` are not equivalent.
	        return +a === +b;
	    }

	    var areArrays = className === '[object Array]';
	    if (!areArrays) {
	      if (typeof a != 'object' || typeof b != 'object') return false;

	      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
	      // from different frames are.
	      var aCtor = a.constructor, bCtor = b.constructor;
	      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
	                               _.isFunction(bCtor) && bCtor instanceof bCtor)
	                          && ('constructor' in a && 'constructor' in b)) {
	        return false;
	      }
	    }
	    // Assume equality for cyclic structures. The algorithm for detecting cyclic
	    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

	    // Initializing stack of traversed objects.
	    // It's done here since we only need them for objects and arrays comparison.
	    aStack = aStack || [];
	    bStack = bStack || [];
	    var length = aStack.length;
	    while (length--) {
	      // Linear search. Performance is inversely proportional to the number of
	      // unique nested structures.
	      if (aStack[length] === a) return bStack[length] === b;
	    }

	    // Add the first object to the stack of traversed objects.
	    aStack.push(a);
	    bStack.push(b);

	    // Recursively compare objects and arrays.
	    if (areArrays) {
	      // Compare array lengths to determine if a deep comparison is necessary.
	      length = a.length;
	      if (length !== b.length) return false;
	      // Deep compare the contents, ignoring non-numeric properties.
	      while (length--) {
	        if (!eq(a[length], b[length], aStack, bStack)) return false;
	      }
	    } else {
	      // Deep compare objects.
	      var keys = _.keys(a), key;
	      length = keys.length;
	      // Ensure that both objects contain the same number of properties before comparing deep equality.
	      if (_.keys(b).length !== length) return false;
	      while (length--) {
	        // Deep compare each member
	        key = keys[length];
	        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
	      }
	    }
	    // Remove the first object from the stack of traversed objects.
	    aStack.pop();
	    bStack.pop();
	    return true;
	  };

	  // Perform a deep comparison to check if two objects are equal.
	  _.isEqual = function(a, b) {
	    return eq(a, b);
	  };

	  // Is a given array, string, or object empty?
	  // An "empty" object has no enumerable own-properties.
	  _.isEmpty = function(obj) {
	    if (obj == null) return true;
	    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
	    return _.keys(obj).length === 0;
	  };

	  // Is a given value a DOM element?
	  _.isElement = function(obj) {
	    return !!(obj && obj.nodeType === 1);
	  };

	  // Is a given value an array?
	  // Delegates to ECMA5's native Array.isArray
	  _.isArray = nativeIsArray || function(obj) {
	    return toString.call(obj) === '[object Array]';
	  };

	  // Is a given variable an object?
	  _.isObject = function(obj) {
	    var type = typeof obj;
	    return type === 'function' || type === 'object' && !!obj;
	  };

	  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
	  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
	    _['is' + name] = function(obj) {
	      return toString.call(obj) === '[object ' + name + ']';
	    };
	  });

	  // Define a fallback version of the method in browsers (ahem, IE < 9), where
	  // there isn't any inspectable "Arguments" type.
	  if (!_.isArguments(arguments)) {
	    _.isArguments = function(obj) {
	      return _.has(obj, 'callee');
	    };
	  }

	  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
	  // IE 11 (#1621), and in Safari 8 (#1929).
	  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
	    _.isFunction = function(obj) {
	      return typeof obj == 'function' || false;
	    };
	  }

	  // Is a given object a finite number?
	  _.isFinite = function(obj) {
	    return isFinite(obj) && !isNaN(parseFloat(obj));
	  };

	  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
	  _.isNaN = function(obj) {
	    return _.isNumber(obj) && obj !== +obj;
	  };

	  // Is a given value a boolean?
	  _.isBoolean = function(obj) {
	    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
	  };

	  // Is a given value equal to null?
	  _.isNull = function(obj) {
	    return obj === null;
	  };

	  // Is a given variable undefined?
	  _.isUndefined = function(obj) {
	    return obj === void 0;
	  };

	  // Shortcut function for checking if an object has a given property directly
	  // on itself (in other words, not on a prototype).
	  _.has = function(obj, key) {
	    return obj != null && hasOwnProperty.call(obj, key);
	  };

	  // Utility Functions
	  // -----------------

	  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
	  // previous owner. Returns a reference to the Underscore object.
	  _.noConflict = function() {
	    root._ = previousUnderscore;
	    return this;
	  };

	  // Keep the identity function around for default iteratees.
	  _.identity = function(value) {
	    return value;
	  };

	  // Predicate-generating functions. Often useful outside of Underscore.
	  _.constant = function(value) {
	    return function() {
	      return value;
	    };
	  };

	  _.noop = function(){};

	  _.property = property;

	  // Generates a function for a given object that returns a given property.
	  _.propertyOf = function(obj) {
	    return obj == null ? function(){} : function(key) {
	      return obj[key];
	    };
	  };

	  // Returns a predicate for checking whether an object has a given set of
	  // `key:value` pairs.
	  _.matcher = _.matches = function(attrs) {
	    attrs = _.extendOwn({}, attrs);
	    return function(obj) {
	      return _.isMatch(obj, attrs);
	    };
	  };

	  // Run a function **n** times.
	  _.times = function(n, iteratee, context) {
	    var accum = Array(Math.max(0, n));
	    iteratee = optimizeCb(iteratee, context, 1);
	    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
	    return accum;
	  };

	  // Return a random integer between min and max (inclusive).
	  _.random = function(min, max) {
	    if (max == null) {
	      max = min;
	      min = 0;
	    }
	    return min + Math.floor(Math.random() * (max - min + 1));
	  };

	  // A (possibly faster) way to get the current timestamp as an integer.
	  _.now = Date.now || function() {
	    return new Date().getTime();
	  };

	   // List of HTML entities for escaping.
	  var escapeMap = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    "'": '&#x27;',
	    '`': '&#x60;'
	  };
	  var unescapeMap = _.invert(escapeMap);

	  // Functions for escaping and unescaping strings to/from HTML interpolation.
	  var createEscaper = function(map) {
	    var escaper = function(match) {
	      return map[match];
	    };
	    // Regexes for identifying a key that needs to be escaped
	    var source = '(?:' + _.keys(map).join('|') + ')';
	    var testRegexp = RegExp(source);
	    var replaceRegexp = RegExp(source, 'g');
	    return function(string) {
	      string = string == null ? '' : '' + string;
	      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
	    };
	  };
	  _.escape = createEscaper(escapeMap);
	  _.unescape = createEscaper(unescapeMap);

	  // If the value of the named `property` is a function then invoke it with the
	  // `object` as context; otherwise, return it.
	  _.result = function(object, property, fallback) {
	    var value = object == null ? void 0 : object[property];
	    if (value === void 0) {
	      value = fallback;
	    }
	    return _.isFunction(value) ? value.call(object) : value;
	  };

	  // Generate a unique integer id (unique within the entire client session).
	  // Useful for temporary DOM ids.
	  var idCounter = 0;
	  _.uniqueId = function(prefix) {
	    var id = ++idCounter + '';
	    return prefix ? prefix + id : id;
	  };

	  // By default, Underscore uses ERB-style template delimiters, change the
	  // following template settings to use alternative delimiters.
	  _.templateSettings = {
	    evaluate    : /<%([\s\S]+?)%>/g,
	    interpolate : /<%=([\s\S]+?)%>/g,
	    escape      : /<%-([\s\S]+?)%>/g
	  };

	  // When customizing `templateSettings`, if you don't want to define an
	  // interpolation, evaluation or escaping regex, we need one that is
	  // guaranteed not to match.
	  var noMatch = /(.)^/;

	  // Certain characters need to be escaped so that they can be put into a
	  // string literal.
	  var escapes = {
	    "'":      "'",
	    '\\':     '\\',
	    '\r':     'r',
	    '\n':     'n',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };

	  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

	  var escapeChar = function(match) {
	    return '\\' + escapes[match];
	  };

	  // JavaScript micro-templating, similar to John Resig's implementation.
	  // Underscore templating handles arbitrary delimiters, preserves whitespace,
	  // and correctly escapes quotes within interpolated code.
	  // NB: `oldSettings` only exists for backwards compatibility.
	  _.template = function(text, settings, oldSettings) {
	    if (!settings && oldSettings) settings = oldSettings;
	    settings = _.defaults({}, settings, _.templateSettings);

	    // Combine delimiters into one regular expression via alternation.
	    var matcher = RegExp([
	      (settings.escape || noMatch).source,
	      (settings.interpolate || noMatch).source,
	      (settings.evaluate || noMatch).source
	    ].join('|') + '|$', 'g');

	    // Compile the template source, escaping string literals appropriately.
	    var index = 0;
	    var source = "__p+='";
	    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
	      source += text.slice(index, offset).replace(escaper, escapeChar);
	      index = offset + match.length;

	      if (escape) {
	        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
	      } else if (interpolate) {
	        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
	      } else if (evaluate) {
	        source += "';\n" + evaluate + "\n__p+='";
	      }

	      // Adobe VMs need the match returned to produce the correct offest.
	      return match;
	    });
	    source += "';\n";

	    // If a variable is not specified, place data values in local scope.
	    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

	    source = "var __t,__p='',__j=Array.prototype.join," +
	      "print=function(){__p+=__j.call(arguments,'');};\n" +
	      source + 'return __p;\n';

	    try {
	      var render = new Function(settings.variable || 'obj', '_', source);
	    } catch (e) {
	      e.source = source;
	      throw e;
	    }

	    var template = function(data) {
	      return render.call(this, data, _);
	    };

	    // Provide the compiled source as a convenience for precompilation.
	    var argument = settings.variable || 'obj';
	    template.source = 'function(' + argument + '){\n' + source + '}';

	    return template;
	  };

	  // Add a "chain" function. Start chaining a wrapped Underscore object.
	  _.chain = function(obj) {
	    var instance = _(obj);
	    instance._chain = true;
	    return instance;
	  };

	  // OOP
	  // ---------------
	  // If Underscore is called as a function, it returns a wrapped object that
	  // can be used OO-style. This wrapper holds altered versions of all the
	  // underscore functions. Wrapped objects may be chained.

	  // Helper function to continue chaining intermediate results.
	  var result = function(instance, obj) {
	    return instance._chain ? _(obj).chain() : obj;
	  };

	  // Add your own custom functions to the Underscore object.
	  _.mixin = function(obj) {
	    _.each(_.functions(obj), function(name) {
	      var func = _[name] = obj[name];
	      _.prototype[name] = function() {
	        var args = [this._wrapped];
	        push.apply(args, arguments);
	        return result(this, func.apply(_, args));
	      };
	    });
	  };

	  // Add all of the Underscore functions to the wrapper object.
	  _.mixin(_);

	  // Add all mutator Array functions to the wrapper.
	  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      var obj = this._wrapped;
	      method.apply(obj, arguments);
	      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
	      return result(this, obj);
	    };
	  });

	  // Add all accessor Array functions to the wrapper.
	  _.each(['concat', 'join', 'slice'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      return result(this, method.apply(this._wrapped, arguments));
	    };
	  });

	  // Extracts the result from a wrapped and chained object.
	  _.prototype.value = function() {
	    return this._wrapped;
	  };

	  // Provide unwrapping proxy for some methods used in engine operations
	  // such as arithmetic and JSON stringification.
	  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

	  _.prototype.toString = function() {
	    return '' + this._wrapped;
	  };

	  // AMD registration happens at the end for compatibility with AMD loaders
	  // that may not enforce next-turn semantics on modules. Even though general
	  // practice for AMD registration is to be anonymous, underscore registers
	  // as a named module because, like jQuery, it is a base library that is
	  // popular enough to be bundled in a third party lib, but not be part of
	  // an AMD load request. Those cases could generate an error when an
	  // anonymous define() is called outside of a loader request.
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return _;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	}.call(this));


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var constants = __webpack_require__(2);
	var _ = __webpack_require__(3);
	var Tree = __webpack_require__(5);
	var AstResult = __webpack_require__(6);

	var FUNC_NAMES = constants.coreFunctions.slice();

	module.exports = function Parser(tokens) {
	  var ast = new AstResult();
	  var parserMap = {
	    operator: processOperators,
	    keyword: processKeywords,
	    number: processValue,
	    string: processValue
	  };
	  _.each(tokens, function(token) {
	    var func = parserMap[token.type];
	    func(token, ast);
	  });

	  return ast;
	};

	function processOperators(token, ast) {
	  switch (token.value) {
	  case constants.openBrackets:
	    var tree = new Tree();
	    tree.setType('array');
	    ast.newTree(tree);
	    break;
	  case constants.openParens:
	    var tree = new Tree();
	    ast.newTree(tree);
	    break;
	  case constants.plus:
	  case constants.minus:
	  case constants.times:
	  case constants.divide:
	    ast.pointer.setType('function');
	    ast.pointer.setValue(token.value);
	    break;
	  case constants.closeBrackets:
	  case constants.closeParens:
	    ast.back();
	    break;
	  }
	}

	function processValue(token, ast) {
	  // values are children of function nodes so when we reach a value
	  // we just add it as a new child of the current node
	  var tree = new Tree();
	  if(ast.pointer === null) ast.newTree(tree);
	  tree.setType(token.type);
	  tree.setValue(token.value);
	  ast.pointer.insert(tree);
	}

	function processKeywords(token, ast) {
	  if (ast.pointer.get('type') === 'function' &&
	      ast.pointer.get('value') === 'defn') {
	    var tree = new Tree();
	    tree.setType('function_name');
	    tree.setValue(token.value);
	    FUNC_NAMES.push(token.value);
	    ast.pointer.insert(tree);
	  } else if (ast.pointer.get('value') === null &&
	             !_.contains(FUNC_NAMES, token.value)) {
	    ast.pointer.setType('arguments');
	    var tree = new Tree();
	    tree.setType('variable');
	    tree.setValue(token.value);
	    ast.pointer.insert(tree);
	  } else if (_.contains(FUNC_NAMES, token.value)) {
	    ast.pointer.setType('function');
	    ast.pointer.setValue(token.value);
	  } else {
	    // processValue(token, ast);
	    var tree = new Tree();
	    tree.setType('keyword');
	    tree.setValue(token.value);
	    ast.pointer.insert(tree);
	  }
	}


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(3);
	module.exports = Tree = function() {
	  this.data = {
	    type: null,
	    value: null
	  };
	  this.children = [];
	};

	Tree.prototype.setType = function(val) {
	  this.data.type = val;
	};

	Tree.prototype.setValue = function(val) {
	  this.data.value = val;
	};

	Tree.prototype.get = function(attr) {
	  return this.data[attr];
	};

	Tree.prototype.insert = function(tree) {
	  this.children.push(tree);
	};

	Tree.prototype.toStr = function(){
	  var val = this.get('value');
	  switch(this.get('type')){
	  case 'number':
	    return parseFloat(val);
	    break;
	  case 'string':
	  case 'keyword':
	    return val;
	    break;
	  case 'array':
	    var args = _.map(this.children, function(child){
	      return child.toStr();
	    });
	    return JSON.stringify(args);
	  case 'function':
	    var args = _.map(this.children, function(child){
	      return child.toStr();
	    });
	    return '('+ val + ' ' + args.join(' ') + ')'; 
	    break;
	  }
	}


/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = AstResults = function() {
	  this.roots = [];
	  this.history = [];
	  this.pointer = null;
	};

	AstResults.prototype.newTree = function(tree) {
	  if (this.pointer === null) {
	    this.roots.push(tree);
	    this.history.push(tree);
	    this.pointer = tree;
	  } else {
	    this.pointer.insert(tree);
	    this.history.push(tree);
	    this.pointer = tree;
	  }
	};

	AstResults.prototype.previous = function() {
	  if (!this.history.length) {
	    return null;
	  } else {
	    return this.history[this.history.length - 2];
	  }
	};

	AstResults.prototype.addChild = function(child) {
	  this.pointer.insert(child);
	  this.pointer = child;
	};

	AstResults.prototype.back = function() {
	  this.history.pop();
	  if (!this.history.length) {
	    this.pointer = null;
	  } else {
	    this.pointer = this.history[this.history.length - 1];
	  }
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var tokenizer = __webpack_require__(1);
	var parser = __webpack_require__(4);
	var _ = __webpack_require__(3);
	var constants = __webpack_require__(2);
	var core = __webpack_require__(8);

	var Controller = function(env) {
	  this.result = '';
	  this.computed = undefined;
	  this.env = env;
	};

	module.exports = interpreter = function(roots, env) {
	  var controller = new Controller(env);
	  var intrp = interpretNode(roots[0], controller);
	  return intrp;
	};

	function interpretNode(node, controller) {
	  var type = node.get('type');
	  var value = node.get('value');
	  if (type === 'function') {
	    if (value === 'defn') {
	      // writeCustomFunction(node, controller);
	    } else {
	      return writeFunction(node, controller);
	    }
	  } else if (type === 'keyword') {
	    if (_.has(controller.env, value)) {
	      var envVal = controller.env[value];
	      if (typeof envVal === 'string') {
	        var tokens = tokenizer(envVal);
	        var tree = parser(tokens);
	        node = interpretNode(tree.roots[0], controller);
	      } else if (typeof envVal === 'number') {
	        node.setValue(envVal);
	        node.setType('number');
	      } else if (Array.isArray(envVal)) {
	        // node.setValue(envVal);
	        // node.setType('array');
	        var tokens = tokenizer(JSON.stringify(envVal));
	        var tree = parser(tokens);
	        node = interpretNode(tree.roots[0], controller);
	      }
	    }
	  } 
	  return node;
	}

	function writeFunction(ast, controller) {
	  var value = ast.get('value');
	  var functionName = constants.functionMap[value];
	  if (functionName === undefined) {
	    functionName = value;
	  }
	  var func = core[functionName];
	  var rawArgs = _.map(ast.children, function(argument, idx) {
	    return interpretNode(argument, controller);
	  });
	  ast.children = rawArgs;
	  var argsAreResolvedP = _.reduce(rawArgs, function(m, o) {
	    return m && (o.get('type') === 'string' || o.get('type') === 'number' || o.get('type') === 'array');
	  }, true);
	  if (argsAreResolvedP) {
	    var finalArgs = _.map(rawArgs, function(arg) {
	      return resolveArg(arg);
	    });
	    var res = func.apply(null, finalArgs);
	    ast.setValue(res);
	    ast.setType(typeof res);
	    ast.children = [];
	  }
	  return ast;
	}

	function resolveArg(arg){
	  if (arg.get('type') === 'number') {
	    return parseFloat(arg.get('value'));
	  } else if(arg.get('type') === 'array'){
	    var elms = _.map(arg.children, function(child){
	      return resolveArg(child);
	    });
	    return elms;
	  } else {
	    return arg.get('value');
	  }
	}

	function writeCustomFunction(node, controller) {
	  var functionName = node.children[0];
	  var arguments = node.children[1];
	  var functionBody = node.children[2];

	  controller.result += 'var ' + functionName.get('value') + ' = function(';

	  var numArgs = arguments.children.length;

	  _.each(arguments.children, function(argNode, idx) {
	    controller.result += argNode.get('value');
	    if (numArgs > 1 && idx < numArgs - 1) {
	      controller.result += ', ';
	    }
	  });

	  controller.result += '){\n';

	  var customController = new Controller();
	  interpretNode(functionBody, customController);

	  controller.result += 'return ' + customController.result + ';';
	  controller.result += '\n}\n';
	}


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(3);
	module.exports = {
	  add: function() {
	    return _.reduce(_.rest(arguments), function(m, a){
	      return m + a;
	    }, _.first(arguments));
	  },
	  subtract: function() {
	    return _.reduce(_.rest(arguments), function(m, a){
	      return m - a;
	    }, _.first(arguments));
	  },
	  multiply: function() {
	    return _.reduce(_.rest(arguments), function(m, a){
	      return m * a;
	    }, _.first(arguments));
	  },
	  divide: function() {
	    return _.reduce(_.rest(arguments), function(m, a){
	      return m / a;
	    }, _.first(arguments));
	  },
	  print: function(x) {
	    console.log(x);
	  },
	  gt: function(a, i) {
	    return a[i];
	  },
	  ct: function(a) {
	    return a.length;
	  }
	};


/***/ }
/******/ ]);
var bloqsnet = bloqsnet || {};
bloqsnet.MANIFEST = [];
bloqsnet.PARA_REGISTRY = {};
bloqsnet.REGISTRY = {};
bloqsnet.svgNS = "http://www.w3.org/2000/svg";

////////////////////////////////////////////////////////////////////////////////

var BaseParam = function(spec, initVal) {
  this.spec = spec;
  this.solved = undefined;
  this.value = initVal !== undefined ? initVal : spec.defaultVal; // || undefined;
};
BaseParam.prototype.toJSON = function() {
  return this.value;
};
BaseParam.prototype.toString = function() {
  return "";
};
BaseParam.prototype.set = function(val) {
  this.value = val;
};
//////// NUMBER

var number_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
};
number_param.prototype = Object.create(BaseParam.prototype);
number_param.prototype.constructor = number_param;
bloqsnet.PARA_REGISTRY.number = number_param;

//////// PERCPX

var percpx_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
};
percpx_param.prototype = Object.create(BaseParam.prototype);
percpx_param.prototype.constructor = percpx_param;
bloqsnet.PARA_REGISTRY.percpx = percpx_param;

//////// STRING

var string_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
};
string_param.prototype = Object.create(BaseParam.prototype);
string_param.prototype.constructor = string_param;
bloqsnet.PARA_REGISTRY.string = string_param;

//////// ENUM

var enum_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
  this.value = this.spec.choices[0];
};
enum_param.prototype = Object.create(BaseParam.prototype);
enum_param.prototype.constructor = enum_param;
bloqsnet.PARA_REGISTRY.enum = enum_param;

//////// JSON

var json_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
};
json_param.prototype = Object.create(BaseParam.prototype);
json_param.prototype.constructor = json_param;
bloqsnet.PARA_REGISTRY.json = json_param;

//////// TRANSFORM

var transform_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
};
transform_param.prototype = Object.create(BaseParam.prototype);
transform_param.prototype.constructor = transform_param;
bloqsnet.PARA_REGISTRY.transform = transform_param;

//////// COLOR

var color_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
};
color_param.prototype = Object.create(BaseParam.prototype);
color_param.prototype.constructor = color_param;
bloqsnet.PARA_REGISTRY.color = color_param;

//////// PRESERVE ASPECT RATIO

var par_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
};
par_param.prototype = Object.create(BaseParam.prototype);
par_param.prototype.constructor = par_param;
bloqsnet.PARA_REGISTRY.preserveAspectRatio = par_param;

//////// VIEWBOX

var vb_param = function(spec, initVal) {
  BaseParam.call(this, spec, initVal);
};
vb_param.prototype = Object.create(BaseParam.prototype);
vb_param.prototype.constructor = vb_param;
bloqsnet.PARA_REGISTRY.viewBox = vb_param;

////////////////////////////////////////////////////////////////////////////////

bloqsnet.gimmeTheThing = function(callbacks) {

  return {

    inst: undefined,
    insts: {},
    callbacks: callbacks,
    test_render: undefined,
    maxId:0,

    new: function(id, type, meta, params) {
      if(id && id !== 'test-render'){
        this.maxId = Math.max(parseInt(id.substr(1))+1, this.maxId); 
      }else{
        id = 'b' + this.maxId;
        this.maxId++; 
      }
      params = params || {};
      if (this.insts[id] === undefined) {
        var def = bloqsnet.REGISTRY[type].prototype.def;
        var that = this;
        return new bloqsnet.REGISTRY[type]({
          id: id,
          type: type,
          meta: meta,
          params: _.reduce(def.params, function(memo, p) {
            memo[p.name] = new bloqsnet.PARA_REGISTRY[p.type](p, params[p.name]);
            return memo;
          }, {}, this),
          onTermAdd: function(idx) {
            that._call_back('term:add', [id, idx]);
          },
          onTermRem: function(idx) {
            that._call_back('term:rem', [id, idx]);
          }
        });
      }
    },
    
    rst: function(){
      this.inst= undefined;
      this.insts= {};
      this.callbacks= callbacks;
      this.test_render= undefined;
      this.maxId=0; 
      this._call_back('reset');
    },

    add: function(type, pos, params, meta) {
      var meta = {
        x: pos[0],
        y: pos[1]
      };
      var b = this.new(null, type, meta, null);
      this.insts[b.get_id()] = b;
      this._call_back('add', b);
    },

    rem: function(id) {
      var bloq = this.insts[id];
      var bloq_json = bloq.toJSON();
      this.dscon([id, 'p', 0]);
      _.each(bloq_json.c, function(c, idx) {
        this.dscon([id, 'c', idx]);
      }, this);
      bloq.kill();
      delete this.insts[id];
      this._call_back('remove', id);
    },

    con: function(a, b, silent) {
      silent = silent || false;
      if (a[0] !== b[0] && a[1] != b[1]) {
        this.dscon(a, silent);
        this.dscon(b, silent);
        // from child to parent
        var st = a[1] === "p" ? a : b;
        var et = a[1] === "p" ? b : a;
        var c_bloq = this.insts[st[0]];
        var p_bloq = this.insts[et[0]];
        p_bloq.swapChild(et[2], c_bloq);
        c_bloq.addParent(p_bloq);
        c_bloq.refreshEnvironment();
        this._call_back('term:add', b[0]);
        if (!silent) this._call_back('change:connected', [a, b]);
      }
    },

    get: function(id) {
      return this.insts[id];
    },

    dscon_chld: function(id, idx) {
      // from parent to child
      var p_bloq = this.insts[id];
      var c_bloq = p_bloq.getChildNodes()[idx];
      var success = false;
      if (c_bloq !== undefined && c_bloq !== "x") {
        c_bloq.addParent("x");
        p_bloq.swapChild(idx, "x");
        success = true;
      }
      return success;
    },

    dscon_prnt: function(id, idx) {
      // from child to parent
      var c_bloq = this.insts[id];
      var p_bloq = c_bloq.getParentNode();
      var success = false;
      if (p_bloq !== undefined && p_bloq !== "x") {
        console.log(" --- " + p_bloq.getChildIdx(id));
        p_bloq.swapChild(p_bloq.getChildIdx(id), "x");
        c_bloq.addParent("x");
        success = true;
      }
      return success;
    },

    dscon: function(term, silent) {
      silent = silent || false;
      var success = false;
      if (term[1] === "c") {
        success = this.dscon_chld(term[0], term[2]);
      } else {
        success = this.dscon_prnt(term[0], term[2]);
      }
      if (success) this.rst_trm(silent);
      if (!silent && success) this._call_back('change:disconnected', term);
    },

    getConnectedTerm: function(term) {
      var t;
      if (term[1] === "c") {
        t = this.insts[term[0]].getChildNodes()[term[2]];
        t = t === undefined ? t : t === "x" ? "x" : [t.get_id(), "p", 0];
      } else {
        var n = this.insts[term[0]];
        t = n.getParentNode();
        if (t !== "x") {
          var idx = 0;
          _.find(t.getChildNodes(), function(c, i) {
            idx = i;
            return c === n;
          });
          t = [t.get_id(), "c", idx];
        }
      }
      return t;
    },

    crt: function(data, id) {
      // create bloqs
      _.each(data, function(d) {
        var b = this.new(d.id, d.type, _.clone(d.meta));
        _.each(d.params, function(param, key) {
          b.spec.params[key].value = param;
        });
        this.insts[b.get_id()] = b;
        this._call_back('add', b);
      }, this);
      // wire them up
      _.each(data, function(d) {
        _.each(d.c, function(c, idx) {
          if (c !== "x") {
            this.con([c, "p", 0], [d.id, "c", idx], false);
          }
        }, this);
      }, this);
      this.inst = this.insts[id];
      this.inst.updateLocalEnvironment();
      this.inst.render_svg();
      // this._call_back('reset', this._inst);
    },

    rndr: function(id) {
      var rendered = $(this.insts[id].render_svg());
      if (!rendered.is("svg")) {
        var svg = this.test_render;
        svg.empty();
        svg.append(rendered);
        rendered = svg;
      }
      return rendered;
    },

    get_svg: function(id) {
      this.test_render = this.test_render || $(this.new("test-render", "root", {}).render_svg());
      this.insts[id].sully_cached_svg_down();
      this.insts[id].render_svg();
      var rendered = this.insts[id].cached_svg_str;
      // if (!rendered.is("svg")) {
      //   var svg = this.test_render;
      //   svg.empty();
      //   svg.append(rendered);
      //   rendered = svg;
      // }
      return rendered;
    },

    updt_par: function(id, p_name, val) {
      var success = this.insts[id].updateParam(p_name, val);
      //if (success) {
      this._call_back('change:svg', this.get_svg(id));
      // }
      return success;
    },

    set_par: function(id, p_name, val){
      this.insts[id].setParam(p_name, val);      
      this._call_back('change:svg', this.get_svg(id));
    },

    updt_mta: function(id, p_name, val) {
      this.insts[id].updateMeta(p_name, val);
      this._call_back('change:meta', [p_name, val]);
    },

    rst_trm: function(silent) {
      silent = silent || false;
      _.each(this.insts, function(i) {
        var didReset = i.resetTerminals();
        if (didReset && !silent) this._call_back('change:terminals', i);
      }, this);
    },

    //////////////////////////////

    _call_back: function(cbk_id, params) {
      if (this.callbacks[cbk_id] !== undefined) {
        this.callbacks[cbk_id](params);
      }
    }

  };

};

var Base = function(spec) {
  console.log("++ NEW: " + spec.type + "-" + spec.id);

  // init spec
  spec.type = spec.type || "base";
  spec.meta = spec.meta || {};
  spec.params = spec.params || {};

  spec.children = bloqsnet.REGISTRY[spec.type].prototype.def.c[0] > 0 ? ["x"] : undefined;
  spec.parent = bloqsnet.REGISTRY[spec.type].prototype.def.p[0] > 0 ? "x" : undefined;

  spec.local_env = {};
  spec.env = {};

  spec.env_dirty = true;
  spec.solution = {};

  //                                               private member variable  //
  //                                                public member variable  //
  this.spec = spec;
  //                                               private member function  //
  //                                            privileged member function  //

  this.get_type = function() {
    return spec.type;
  };

  this.get_id = function() {
    return spec.id;
  };

  this.get_params = function() {
    return _.reduce(spec.params, function(m, p, k) {
      m[k] = p.value;
      return m;
    }, {}, this);
  };

  this.updateMeta = function(p_name, val) {
    spec.meta[p_name] = val;
    return true;
  };

  //

  this.getParentNode = function() {
    return spec.parent;
  };

  this.getChildNodes = function() {
    return spec.children;
  };

  // this.addChild = function(child) {
  //   spec.children.unshift(child);
  // };

  // this.addChildAt = function(child, idx) {
  //   spec.children.splice(idx, 0, child);
  // };

  this.getChildIdx = function(id) {
    var r = -1,
        i;
    for (i = 0; i < spec.children.length; i++) {
      if (spec.children[i] !== "x" && spec.children[i].spec.id === id) {
        r = i;
      }
    }
    return r;
  };

  this.swapChild = function(idx, val) {
    spec.children[idx] = val;
  };

  this.addParent = function(parent) {
    spec.parent = parent;
  };

  this.resetTerminals = function() {
    var card, temp, before;
    card = bloqsnet.REGISTRY[spec.type].prototype.def.c;
    temp = {};
    before = spec.children;
    if (card[1] === "n") {
      spec.children = _.without(spec.children, "x");
      spec.children.push("x");
    }
    return !_.isEqual(spec.children, before);
  };

  this.setLocalEnvironment = function(data) {
    spec.local_env = data;
    this.refreshEnvironment();
  };

  this.refreshEnvironment = function() {
    spec.env = spec.local_env;
  };

  this.findInParentEnvironment = function(key) {
    if (_.has(this.spec.env, key)) {
      return this.spec.env[key];
    } else if (this.spec.parent !== undefined && this.spec.parent !== 'x') {
      return this.spec.parent.findInParentEnvironment(key);
    }
    return undefined;
  };

  this.getEnvironment = function() {
    return spec.env;
  };

  this.kill = function() {
    if (spec.parent !== undefined && spec.parent !== "x") {
      var idx = -1;
      _.find(spec.parent.getChildNodes(), function(c, i) {
        idx = i;
        return c === this;
      });
      spec.parent.swapChild(idx, "x");
    }
    spec.parent = "x";
    _.each(spec.children, function(c, idx) {
      if (c !== "x") {
        c.addParent("x");
        spec.children[idx] = "x";
      }
    });
  };
};

Base.prototype.updateParam = function(p_name, val) {
  var success,
      p;
  success = false;
  p = _.findWhere(bloqsnet.REGISTRY[this.spec.type].prototype.def.params, {
    "name": p_name
  });
  success = this.spec.params[p_name].update(val, this.spec.env);
  if (success) {
    //this.sully_env_down();
    //this.updateLocalEnvironment();
  } else {
    console.log("didnt update param: " + p_name + ", type: " + p.type + ", val: " + val);
  }
  return success;
};

Base.prototype.setParam = function(p_name, val) {
  this.spec.params[p_name].set(val);
};

Base.prototype.updateLocalEnvironment = function() {
  this.setLocalEnvironment({});
};

Base.prototype.toJSON = function() {
  return _.reduce(this.spec, function(m, s, k) {
    switch (k) {
    case 'parent':
      if (s !== undefined) {
        if (s === 'x') {
          m.p = ['x'];
        } else {
          m.p = [s.get_id()];
        }
      } else {
        m.p = [];
      }
      break;
    case 'children':
      if (s !== undefined) {
        m.c = _.map(s, function(c) {
          if (c === 'x') {
            return 'x';
          } else {
            return c.get_id();
          }
        });
      } else {
        m.c = [];
      }
      break;
    case 'id':
    case 'type':
    case 'meta':
      m[k] = s;
      break;
    case 'params':
      m[k] = _.reduce(s, function(mem, val, key) {
        if (val.value !== undefined) {
          mem[key] = val.toJSON();
        }
        return mem;
      }, {});
      break;
    default:
      break;
    }
    return m;
  }, {});
};

Base.prototype.def = {
  display: false,
  type: 'base',
  params: {}
};

bloqsnet.REGISTRY.base = Base;

////////////////////////////////////////////////////////////////////////////////
//                                                                 SVG_PROTO  //
////////////////////////////////////////////////////////////////////////////////

var SVG_Proto = function(spec) {
  spec.type = spec.type || 'svg_proto';
  Base.call(this, spec);

  this.cached_svg = undefined;

  var setAttribute = function(svg_elm, key, val) {
    // NOTE: the undefined check here is a stopgap
    // it really should be mitigated further upstream
    if (val !== undefined && val !== '' && val !== '0px' && val !== '0px') {
      svg_elm.setAttribute(key, val);
    }
  };

  this.setAttributesStr = function(svg_elem, attrs) {
    _.each(attrs, function(attr, k) {
      if (_.findWhere(bloqsnet.REGISTRY[spec.type].prototype.def.params, {
        'name': k
      }).renderSvg === true) {
        var val = '';
        switch (k) {
        case 'transform':
          _.each(attr, function(a) {
            switch (a.type) {
            case 'trans':
              val += 'translate(' + a.x + ', ' + a.y + ') ';
              break;
            case 'scale':
              val += 'scale(' + a.x + ', ' + a.y + ') ';
              break;
            case 'rot':
              val += 'rotate(' + a.r;
              if (a.x !== undefined)
                val += ', ' + a.x + ', ' + a.y + '';
              val += ') ';
              break;
            case 'skewX':
              val += 'skewX(' + a.x + ') ';
              break;
            case 'skewY':
              val += 'skewY(' + a.y + ') ';
              break;
            }
          });

          val = val.slice(0, -1);

          break;
        default:
          val =   attr ;
          break;
        }

        var endOfOpenIdx = svg_elem.indexOf('>');
        var strStart = svg_elem.slice(0, endOfOpenIdx);
        var strEnd = svg_elem.slice(endOfOpenIdx);
        if (val !== undefined && val !== '') {
          svg_elem = strStart + ' ' + k + '=\'' + val + '\'' + strEnd;
        }
      }
    });
    return svg_elem;
  };
};

SVG_Proto.prototype = Object.create(Base.prototype);
SVG_Proto.prototype.constructor = SVG_Proto;

SVG_Proto.prototype.render_svg = function() {
  //if (this.cached_svg === undefined) {
  this.cached_svg_str = this.get_svg_str();
  if (this.spec.children != undefined && this.spec.children.length > 0) {
    for (var i = this.spec.children.length - 1; i >= 0; i--) {
      var child = this.spec.children[i];
      if (child !== 'x') {
        this.spec.children[i].render_svg();
        var insertIdx = this.cached_svg_str.indexOf('>');
        this.cached_svg_str = this.cached_svg_str.substr(0, insertIdx + 1) +
          this.spec.children[i].cached_svg_str +
          this.cached_svg_str.substr(insertIdx + 1);
      }
    }
  }
  //}
  return this.cached_svg_str;
};

SVG_Proto.prototype.get_svg_str = function() {
  var params_def = bloqsnet.REGISTRY[this.spec.type].prototype.def.params;
  var solution2 = _.reduce(params_def, function(m, p_def) {
    m[p_def.name] = this.spec.params[p_def.name].value;
    return m;
  }, {}, this);
  var elmStr = '<' + this.def.svg_elem + '></' + this.def.svg_elem + '>';
  elmStr = this.setAttributesStr(elmStr, solution2);
  return elmStr;
};

SVG_Proto.prototype.sully_cached_svg_down = function() {
  this.cached_svg = undefined;
  _.each(this.spec.children, function(c) {
    if (c !== 'x') {
      c.sully_cached_svg_down();
    }
  });
};

SVG_Proto.prototype.reduce_exprs = function(svg, obj) {
  var exprs = svg.match(/\{.*?\}|.+?(?=\{|$)/g);
  return _.map(exprs, function(str) {
    if (str.substr(0, 1) === '{') {
      var expr = str.substr(1, str.length - 2);
      str = expr === "" ? "" : minilisp.reduceExpr(expr, obj);
      if (isNaN(parseFloat(str)) && str[0] === '(' && str[str.length - 1] === ')') {
        str = '{' + str + '}';
      }
    }
    return str;
  }, this).join('');
};

SVG_Proto.prototype.def = {
  display: false,
  type: 'svg_proto'
};

bloqsnet.REGISTRY['svg_proto'] = SVG_Proto;

//                              DEFINING DEFAULT PARAM GROUPS (per svg spec)  //
////////////////////////////////////////////////////////////////////////////////

var paramObj = function(config) {
  var ret = {};
  ret.name = config[0];
  ret.type = config[1];
  if (ret.type === 'enum') {
    ret.choices = config[2];
  } else {
    ret.defaultVal = config[2];
  }
  ret.groupName = config[3];
  ret.renderSvg = config[4];
  return ret;
};

var svg_conditional_processing_attributes = [
  paramObj(['requiredExtensions', 'string', '', 'svg conditional processing attributes', true]),
  paramObj(['requiredFeatures', 'string', '', 'svg conditional processing attributes', true]),
  paramObj(['systemLanguage', 'string', '', 'svg conditional processing attributes', true])
];

var svg_core_attributes = [
  paramObj(['id', 'string', '', 'svg core attributes', true]),
  paramObj(['xml:base', 'string', '', 'svg core attributes', true]),
  paramObj(['xml:lang', 'string', '', 'svg core attributes', true]),
  paramObj(['xml:space', 'string', '', 'svg core attributes', true])
];

// ////////////////////////////////////////////////////////////////////////////////
// //                                                                   SVG_SVG  //
// ////////////////////////////////////////////////////////////////////////////////

var SVG_svg = function(spec) {
    spec.type = "svg_svg";
    SVG_Proto.call(this, spec);
};
SVG_svg.prototype = Object.create(SVG_Proto.prototype);
SVG_svg.prototype.constructor = SVG_svg;

SVG_svg.prototype.get_svg = function() {
    var solution = this.solveParams();
    var svg_elm = document.createElementNS(bloqsnet.svgNS, "svg");
    this.setAttributes(svg_elm, solution);
    return svg_elm;
};

SVG_svg.prototype.def = {
    display: true,
    type: 'svg_svg',
    categories: ['container', 'structural'],
    params: [
        //paramObj(["version", "enum", ["1.1", "1.0"], "specific attributes", true]),
        //paramObj(["baseProfile", "string", "none", "specific attributes", true]),
        paramObj(["x", "percpx", '0px', "specific attributes", true]),
        paramObj(["y", "percpx", '0px', "specific attributes", true]),
        paramObj(["width", "percpx", '100%', "specific attributes", true]),
        paramObj(["height", "percpx", '100%', "specific attributes", true]),
        paramObj(["preserveAspectRatio", "preserveAspectRatio", "xMidYMid meet", "specific attributes", true]), //enum xMinYMin | xMidYMin | xMidYMin | xMinYMid | ...etc also "meet" or "slice"
        //paramObj(["contentScriptType", "string", "application/ecmascript", "specific attributes", true]),
        //paramObj(["contentStyleType", "string", "text/css", "specific attributes", true]),
        paramObj(["viewBox", "viewBox", "0 0 100 100", "specific attributes", true])
    ].concat(
        svg_conditional_processing_attributes,
        svg_core_attributes
    ),
    p: [1, 1],
    c: [1, "n"]
};

bloqsnet.REGISTRY['svg_svg'] = SVG_svg;

////////////////////////////////////////////////////////////////////////////////
//                                                                     SVG_G  //
////////////////////////////////////////////////////////////////////////////////
var SVG_g = function(spec) {
  spec.type = "svg_g";
  SVG_Proto.call(this, spec);
};
SVG_g.prototype = Object.create(SVG_Proto.prototype);
SVG_g.prototype.constructor = SVG_g;
SVG_g.prototype.def = {
  display: true,
  type: 'svg_g',
  svg_elem: 'g',
  categories: ['Container element',
               'structural element'
              ],
  params: [
    paramObj(["transform", "transform", [], "specific attributes", true])
  ].concat(
    svg_conditional_processing_attributes,
    svg_core_attributes
  ),
  p: [1, 1],
  c: [1, "n"]
};
bloqsnet.REGISTRY['svg_g'] = SVG_g;

// ////////////////////////////////////////////////////////////////////////////////
// //                                                                SVG_CIRCLE  //
// ////////////////////////////////////////////////////////////////////////////////
var SVG_circle = function(spec) {
    spec.type = "svg_circle";
    SVG_Proto.call(this, spec);
};
SVG_circle.prototype = Object.create(SVG_Proto.prototype);
SVG_circle.prototype.constructor = SVG_circle;
SVG_circle.prototype.def = {
    display: true,
    type: 'svg_circle',
    svg_elem: 'circle',
    categories: ['Basic Shapes',
                 'Graphic Elements',
                 'Shape Elements'],
    params: [
        paramObj(["cx", "percpx",  "{0}px", "specific attributes", true]),
        paramObj(["cy", "percpx",  "{0}px", "specific attributes", true]),
        paramObj(["r", "percpx", "{10}px", "specific attributes", true]),
        paramObj(["fill", "color", "#ffffff", "specific attributes", true]),
        paramObj(["transform", "transform", [], "specific attributes", true])
    ].concat(
        svg_conditional_processing_attributes,
        svg_core_attributes
        //graphical_event_attributes,
        //presentation_attributes,
        // - class,
        // - style,
        // - externalResourcesRequired,
    ),
    p: [1, 1],
    c: [1, "n"] //mostly to enable animnate subnodes (<animate>, <animateColor>, <animateMotion>, <animateTransform>, <mpath>, <set>)
        // (<desc>, <metadata>, <title>)
};
bloqsnet.REGISTRY["svg_circle"] = SVG_circle;

// ////////////////////////////////////////////////////////////////////////////////
// //                                                               SVG_ELLIPSE  //
// ////////////////////////////////////////////////////////////////////////////////
var SVG_ellipse = function(spec) {
    spec.type = "svg_ellipse";
    SVG_Proto.call(this, spec);
};
SVG_ellipse.prototype = Object.create(SVG_Proto.prototype);
SVG_ellipse.prototype.constructor = SVG_ellipse;
SVG_ellipse.prototype.def = {
    display: true,
    type: 'svg_ellipse',
    svg_elem: 'ellipse',
    categories: ['Basic Shapes',
                 'Graphic Elements',
                 'Shape Elements'],
    params: [
        paramObj(["cx", "percpx", "0px", "specific attributes", true]),
        paramObj(["cy", "percpx", "0px", "specific attributes", true]),
        paramObj(["rx", "percpx", "10px", "specific attributes", true]),
        paramObj(["ry", "percpx", "5px", "specific attributes", true]),
        paramObj(["fill", "color", "#ffffff", "specific attributes", true]),
        paramObj(["transform", "transform", [], "specific attributes", true])
    ].concat(
            svg_conditional_processing_attributes,
            svg_core_attributes
            //graphical_event_attributes,
            //presentation_attributes,
            // - class,
            // - style,
            // - externalResourcesRequired,
        ),
    p: [1, 1],
    c: [1, "n"] //mostly to enable animnate subnodes (<animate>, <animateColor>, <animateMotion>, <animateTransform>, <mpath>, <set>)
        // (<desc>, <metadata>, <title>)
};
bloqsnet.REGISTRY["svg_ellipse"] = SVG_ellipse;

// ////////////////////////////////////////////////////////////////////////////////
// //                                                                  SVG_LINE  //
// ////////////////////////////////////////////////////////////////////////////////
var SVG_line = function(spec) {
    spec.type = "svg_line";
    SVG_Proto.call(this, spec);
};
SVG_line.prototype = Object.create(SVG_Proto.prototype);
SVG_line.prototype.constructor = SVG_line;
SVG_line.prototype.def = {
    display: true,
    type: 'svg_line',
    svg_elem: 'line',
    categories: ['Basic Shapes',
                 'Graphic Elements',
                 'Shape Elements'],
    params: [
        paramObj(["x1", "percpx", "0px", "specific attributes", true]),
        paramObj(["y1", "percpx", "0px", "specific attributes", true]),
        paramObj(["x2", "percpx", "10px", "specific attributes", true]),
        paramObj(["y2", "percpx", "10px", "specific attributes", true]),
        paramObj(["stroke", "color", "#000000", "specific attributes", true]),
        paramObj(["stroke-width", "percpx", "2px", "specific attributes", true])
    ].concat(
        svg_conditional_processing_attributes,
        svg_core_attributes
    ),
    p: [1, 1],
    c: [1, "n"] //mostly to enable animnate subnodes (<animate>, <animateColor>, <animateMotion>, <animateTransform>, <mpath>, <set>)
    // (<desc>, <metadata>, <title>)
};
bloqsnet.REGISTRY["svg_line"] = SVG_line;

// ////////////////////////////////////////////////////////////////////////////////
// //                                                                  SVG_RECT  //
// ////////////////////////////////////////////////////////////////////////////////
var SVG_rect = function(spec) {
    spec.type = "svg_rect";
    SVG_Proto.call(this, spec);
};
SVG_rect.prototype = Object.create(SVG_Proto.prototype);
SVG_rect.prototype.constructor = SVG_rect;
SVG_rect.prototype.def = {
    display: true,
    type: 'svg_rect',
    svg_elem: 'rect',
    categories: ['Basic Shapes',
                 'Graphic Elements',
                 'Shape Elements'],
    params: [
      paramObj(["x", "percpx", "{0}px", "specific attributes", true]),
      paramObj(["y", "percpx", "{0}px", "specific attributes", true]),
      paramObj(["width", "percpx", "{10}px", "specific attributes", true]),
      paramObj(["height", "percpx", "{10}px", "specific attributes", true]),
      paramObj(["rx", "percpx", "{0}px", "specific attributes", true]),
      paramObj(["ry", "percpx", "{0}px", "specific attributes", true]),
      paramObj(["fill", "color", "#ffffff", "specific attributes", true]),
      paramObj(["transform", "transform", [], "specific attributes", true])
    ].concat(
      svg_conditional_processing_attributes,
      svg_core_attributes
      //graphical_event_attributes,
      //presentation_attributes,
      // - class,
      // - style,
      // - externalResourcesRequired,
    ),
  p: [1, 1],
  c: [1, "n"] //mostly to enable animnate subnodes (<animate>, <animateColor>, <animateMotion>, <animateTransform>, <mpath>, <set>)
  // (<desc>, <metadata>, <title>)
};
bloqsnet.REGISTRY["svg_rect"] = SVG_rect;

// ////////////////////////////////////////////////////////////////////////////////
// //                                                                  SVG_TEXT  //
// ////////////////////////////////////////////////////////////////////////////////
var SVG_text = function(spec) {
  spec.type = "svg_text";
  SVG_Proto.call(this, spec);
};
SVG_text.prototype = Object.create(SVG_Proto.prototype);
SVG_text.prototype.constructor = SVG_text;
// SVG_text.prototype.get_svg = function() {
//   // TODO: Try an factor this out, as has been done with other svg elements
//   var solution = this.solveParams();
//   var elm = document.createElementNS(bloqsnet.svgNS, this.def.svg_elem);
//   this.setAttributes(elm, solution);
//   elm.textContent = solution.text;
//   return elm;
// };
SVG_text.prototype.render_svg = function() {
  console.log('RENDER SVG TEXT, FOOL');
  console.log('RENDER SVG : ' + this.spec.type + '-' + this.spec.id);
  this.cached_svg_str = this.get_svg_str();
  if (this.spec.children != undefined && this.spec.children.length > 0) {
    for (var i = 0; i < this.spec.children.length; i++) {
      var child = this.spec.children[i];
      if (child !== 'x') {
        this.spec.children[i].render_svg();
        var insertIdx = this.cached_svg_str.indexOf('>');
        this.cached_svg_str = this.cached_svg_str.substr(0, insertIdx + 1) +
          this.spec.children[i].cached_svg_str +
          this.cached_svg_str.substr(insertIdx + 1);
      }
    }
  }
  return this.cached_svg_str;
};

SVG_text.prototype.get_svg_str = function() {
  console.log('GET SVG TEXT STR, FOOL');
  // var solution = this.solveParams();
  // console.log(solution);
  var params_def = bloqsnet.REGISTRY[this.spec.type].prototype.def.params;
  var solution2 = _.reduce(params_def, function(m, p_def) {
    m[p_def.name] = this.spec.params[p_def.name].value;
    return m;
  }, {}, this);
  console.log(solution2);
  var elmStr = '<' + this.def.svg_elem + '>'+solution2.text+'</' + this.def.svg_elem + '>';
  elmStr = this.setAttributesStr(elmStr, solution2);
  return elmStr;
};

SVG_text.prototype.def = {
  display: true,
  type: 'svg_text',
  svg_elem: 'text',
  categories: ['Graphics Elements',
               'Text Content Elements'
              ],
  params: [
    paramObj(["text", "string", "\"default\"", "specific attributes", false]),
    paramObj(["x", "percpx", "10px", "specific attributes", true]),
    paramObj(["y", "percpx", "10px", "specific attributes", true]),
    paramObj(["fill", "color", "#ffffff", "specific attributes", true]),
    paramObj(["opacity", "number", "1", "specific attributes", true])
  ].concat(
    svg_conditional_processing_attributes,
    svg_core_attributes
  ),
  p: [1, 1],
  c: [1, "n"]
};
bloqsnet.REGISTRY["svg_text"] = SVG_text;

////////////////////////////////////////////////////////////////////////////////
//                                                               SVG_ANIMATE  //
////////////////////////////////////////////////////////////////////////////////
var SVG_animate = function(spec) {
    spec.type = "svg_animate";
    SVG_Proto.call(this, spec);
};
SVG_animate.prototype = Object.create(SVG_Proto.prototype);
SVG_animate.prototype.constructor = SVG_animate;
SVG_animate.prototype.def = {
    display: true,
    type: 'svg_animate',
    svg_elem: 'animate',
    categories: ['Animation Elements'],
    params: [
      paramObj(["attributeName", "string", "", "specific attributes", true]),
      paramObj(["attributeType", "string", "auto", "specific attributes", true]),

      paramObj(["from", "percpx", "{0}px", "specific attributes", true]),
      paramObj(["to", "percpx", "{0}px", "specific attributes", true]),
      paramObj(["by", "percpx", "{0}px", "specific attributes", true]),

      paramObj(["begin", "string", "", "specific attributes", true]),
      paramObj(["dur", "string", "{1}", "specific attributes", true]),
      paramObj(["end", "string", "", "specific attributes", true]),
      paramObj(["repeatCount", "string", "indefinite", "specific attributes", true]),
      paramObj(["fill", "string", "remove", "specific attributes", true])
    ] // enum : "remove" | "freeze"
    .concat(
      svg_conditional_processing_attributes,
      svg_core_attributes
      //graphical_event_attributes,
      //presentation_attributes,
      // - class,
      // - style,
      // - externalResourcesRequired,
    ),
  p: [1, 1],
  c: [0, 0]
};
bloqsnet.REGISTRY["svg_animate"] = SVG_animate;

////////////////////////////////////////////////////////////////////////////////
//                                                                      ROOT  //
////////////////////////////////////////////////////////////////////////////////

var Root = function(spec) {
  spec.type = "root";
  SVG_Proto.call(this, spec);
};
Root.prototype = Object.create(SVG_Proto.prototype); // See note below
Root.prototype.constructor = Root;

Root.prototype.render_svg = function() {
  this.updateLocalEnvironment();
  if (this.cached_svg === undefined) {
    this.cached_svg_str = this.get_svg_str();
    // if (this.spec.children.length > 0) {
    var child = this.spec.children[0];
    if (child !== "x") {
      var child_svg = child.render_svg();
      var insertIdx = this.cached_svg_str.indexOf(">");
      this.cached_svg_str = this.cached_svg_str.substr(0, insertIdx + 1) +
        child_svg +
        this.cached_svg_str.substr(insertIdx + 1);
      // }, this);
    }

    var obj = JSON.parse(this.spec.params.data.value);
    this.cached_svg_str = this.reduce_exprs(this.cached_svg_str, obj);
    // }
  }
  return this.cached_svg_str;
};

Root.prototype.updateLocalEnvironment = function() {
  console.log("BN ROOT UPDATE LOCAL ENV!!");
  this.setLocalEnvironment(JSON.parse(this.spec.params.data.value));
};

Root.prototype.def = {
  display: true,
  type: 'root',
  svg_elem: 'svg',
  params: [
    paramObj(["width", "percpx", "{100}%", "specific attributes", true]),
    paramObj(["height", "percpx", "{100}%", "specific attributes", true]),
    paramObj(["data", "json", "{}", "specific attributes", false])
  ],
  p: [0, 0],
  c: [1, "n"]
};

bloqsnet.REGISTRY["root"] = Root;

////////////////////////////////////////////////////////////////////////////////
//                                                                  SVG_EACH  //
////////////////////////////////////////////////////////////////////////////////

var SVG_each = function(spec) {
  spec.type = 'svg_each';
  SVG_Proto.call(this, spec);
};
SVG_each.prototype = Object.create(SVG_Proto.prototype);
SVG_each.prototype.constructor = SVG_each;

SVG_each.prototype.render_svg = function() {
  console.log('RENDER_EACH');
  //if (this.cached_svg === undefined) {
  this.cached_svg_str = this.get_svg_str();
  if (this.spec.children.length > 0) {
    var child = this.spec.children[0];
    if (child !== 'x') {
      var child_svg = child.render_svg();
      var l = this.findInParentEnvironment(this.spec.params.list.value);
      var tenv = {};
      tenv[this.spec.id + '_d'] = "*undetermined";
      tenv[this.spec.id + '_idx'] = "*[0.."+(l.length - 1)+"]";
      this.setLocalEnvironment(tenv);
      //this.spec.parent.getEnvironment();
      _.each(l, function(d, idx) {
        var obj = {};
        obj[this.spec.id + '_d'] = d;
        obj[this.spec.id + '_idx'] = idx;
        var insertidx = this.cached_svg_str.indexOf('>');
        this.cached_svg_str = this.cached_svg_str.substr(0, insertidx + 1) +
          this.reduce_exprs(child_svg, obj) +
          this.cached_svg_str.substr(insertidx + 1);
      }, this);
    }
  }
  //}
  return this.cached_svg_str;
};

SVG_each.prototype.def = {
  display: true,
  type: 'svg_each',
  svg_elem: 'g',
  params: [
    paramObj(['transform', 'transform', [], 'specific attributes', true]),
    paramObj(['list', 'string', '', 'specific attributes', false])
  ],
  p: [1, 1],
  c: [1, 1]
};

bloqsnet.REGISTRY['svg_each'] = SVG_each;
