var _ = require('lodash');

var Utility = {
  interpolateString: (str, obj) => {

    if (!_.isString(str))
      throw new Error('str must be a string.');

    if (!_.isObject(obj))
      throw new Error('obj must be a object.');

    return _(obj)
      .pairs()
      .map(mapFirstInPair(tokenize('{', '}')))
      .reduce(function(result, pair) {

        return result.replace(pair[0], pair[1])

      }, str)
  
  },
  splitStringArray: (delimiter, strings) => {

    if (!_.isString(delimiter))
      throw new Error('delimiter must be a string.');

    if (!_.isArray(strings))
      throw new Error('strings must be an array.');

    return _(strings)
      .invoke('split', delimiter)
      .zipObject()
      .value();

  },
  replaceUndefined: _.curry((undefinedString, value) => (_.isUndefined(value) ? undefinedString : value))
};

var tokenize = _.curry((prepend, append, str) => prepend + str + append);

var mapFirstInPair = _.curry((func, pair) => [ func(pair[0]), pair[1] ]);

module.exports = Utility;
