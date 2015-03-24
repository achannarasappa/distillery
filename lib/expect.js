var cheerio = require('cheerio');
var _ = require('lodash');

var Expect = {
  http_code: function(expected) {

    if (!_.isFinite(expected)) throw new Error('Expected http_code must be an number.');
    
    return function(response) {
      
      return (response.statusCode === expected)
      
    }
    
  },
  url: function(expected) {

    if (!_.isRegExp(expected) && !_.isString(expected)) throw new Error('Expected url must be an string of regular expression.');
    
    return function(response) {

      if (_.isRegExp(expected))
        return expected.test(response.request.uri.href);
      
      return (response.request.uri.href === expected)
      
    }
    
  },
  html_element: function(path, expected) {

    if (!_.isRegExp(expected) && !_.isString(expected) && !_.isUndefined(expected)) throw new Error('Expected html_element must be an string or regular expression if defined.');
    if (!_.isString(path)) throw new Error('Path for html_element must be an string.');

    return function(response) {
      
      var $ = cheerio.load(response.body);
      // TODO: Add support for matching attributes
      
      if (_.isRegExp(expected))
        return expected.test($(path).first().text());
      
      if (_.isString(expected))
        return ($(path).first().text() === expected);

      return $(path).first().text()
      
    }
    
  }
};

module.exports = Expect;
