var cheerio = require('cheerio');
var _ = require('lodash');

var Expect = {
  http_code: function(expected) {

    if (!_.isFinite(expected)) throw new Error('Expected http_code must be an number.');
    
    return function(response, verbose) {

      var valid = (response.statusCode === expected);
      
      if (verbose)
        return {
          name: 'http_code',
          expected: expected,
          actual: response.statusCode,
          valid: valid
        };

      return valid;
      
    }
    
  },
  url: function(expected) {

    if (!_.isRegExp(expected) && !_.isString(expected)) throw new Error('Expected url must be an string of regular expression.');

    return function(response, verbose) {

      var valid = _.isRegExp(expected) ? expected.test(response.request.uri.href) : (response.request.uri.href === expected);

      if (verbose)
          return {
            name: 'url',
            expected: expected,
            actual: response.request.uri.href,
            valid: valid
          };

      return valid;
      
    }
    
  },
  html_element: function(path, expected) {

    if (!_.isRegExp(expected) && !_.isString(expected) && !_.isUndefined(expected)) throw new Error('Expected html_element must be an string or regular expression if defined.');
    if (!_.isString(path)) throw new Error('Path for html_element must be an string.');

    return function(response, verbose) {

      var $ = cheerio.load(response.body);
      var valid;
      
      if (_.isRegExp(expected))
        valid = expected.test($(path).first().text());

      if (_.isString(expected))
        valid = ($(path).first().text() === expected);

      if (!_.isString(expected) && !_.isRegExp(expected))
        valid = $(path).first().text();

      if (verbose)
        return {
          name: 'html_element',
          expected: expected,
          actual: $(path).first().text(),
          valid: valid
        };

      return valid
      
    }
    
  }
};

module.exports = Expect;
