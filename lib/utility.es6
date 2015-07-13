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
  truncateString: _.curry((length, str) => {

    if (!_.isFinite(length))
      throw new Error('length must be a number.');

    if (!_.isString(str) && !_.isFinite(str))
      throw new Error('str must be a string or number.');

    return str.length > length ? str.substring(0, length) + '...' : str;

  }),
  splitStringArray: (delimiter, strings) => {

    if (!_.isString(delimiter))
      throw new Error('delimiter must be a string.');

    if (!_.isArray(strings))
      throw new Error('strings must be an array.');

    return _.chain(strings)
      .invoke('split', delimiter)
      .zipObject()
      .value();

  },
  replaceUndefined: _.curry((undefinedString, value) => (_.isUndefined(value) ? undefinedString : value))
};

var tokenize = _.curry((prepend, append, str) => prepend + str + append);

var mapFirstInPair = _.curry((func, pair) => [ func(pair[0]), pair[1] ]);

module.exports = Utility;
