var R = require('ramda');

var Utility = {
  interpolate: function(str, obj) {
    
    return R.pipe(R.toPairs, mapFirstInPair(tokenize('{', '}')), R.fromPairs, reduceObjIdx(replaceStr, str))(obj);
  
  },
  truncateString: R.curry(function(length, str) {
    
    return str.length > length ? str.substring(0, length) + '...' : str;
    
  }),
  parseKeyValuePairs: function(delimiter, strings) {
    
    return R.isArrayLike(strings) ? R.fromPairs(R.map(R.split(delimiter), strings)) : R.split(delimiter)(strings)
  
  }
};

var tokenize = R.curry(function(prepend, append, str) {
  
  return prepend + str + append;
  
});

var mapFirstInPair = R.curry(function(func, arr) {
  
  return R.map(function(pair) {
    
    return [ func(pair[0]), pair[1] ];
    
  }, arr)
  
});

var replaceStr = R.curry(function(str, val, key) {
  
  return R.replace(key, val, str);
  
});

var reduceObjIdx = R.curry(function(func, init, obj) {
  
  var reduction = init;

  R.mapObj.idx(function(val, key) {
    
    reduction = func(reduction, val, key)
    
  }, obj);

  return reduction;
  
});

module.exports = Utility;
