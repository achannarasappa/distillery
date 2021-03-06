const _ = require('lodash');

const mixin = {
  interpolate: (str, obj) => _(obj)
      .pairs()
      .map(([token, value]) => [ '{' + token + '}', value ])
      .reduce((result, [token, value]) => result.replace(token, value), str),
  splitStringArray: (delimiter, strings) =>  _(strings)
      .invoke('split', delimiter)
      .zipObject()
      .value(),
  replaceUndefined: _.curry((undefinedString, value) => (_.isUndefined(value) ? undefinedString : value)),
  formUrlEncode: (obj) => _(obj)
    .pairs()
    .map((pair) => _.map(pair, encodeURIComponent))
    .map((pair) => pair.join('='))
    .value()
    .join('&'),
};

module.exports = mixin;
