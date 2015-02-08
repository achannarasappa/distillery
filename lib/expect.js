var cheerio = require('cheerio');
var _ = require('lodash');

var Expect = {
  http_code: function(expected) {
    
    return function(response) {
      
      return (response.response.statusCode === expected)
      
    }
    
  },
  url: function(expected) {
    
    return function(response) {

      if (_.isRegExp(expected))
        return expected.test(response.response.request.uri.href);
      
      return (response.response.request.uri.href === expected)
      
    }
    
  },
  html_element: function(path, expected) {
    
    return function(response) {
      
      var $ = cheerio.load(response.html);
      // TODO: Add support for matching attributes
      
      if (_.isRegExp(expected))
        return expected.test($(path).first().text());
      
      if (!_.isUndefined(expected))
        return ($(path).first().text() === expected);
      
      return $(path).first().text()
      
    }
    
  }
};

module.exports = Expect;
