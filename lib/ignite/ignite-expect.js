var cheerio = require('cheerio');
var _ = require('lodash');

var IgniteExpect = {
  http_code: function(expected) {
    
    return function(response) {
      
      return {
        name: 'http_code',
        expected: expected,
        actual: response.response.statusCode,
        valid: (response.response.statusCode === expected)
      }
      
    }
    
  },
  url: function(expected) {
    
    return function(response) {

      if (_.isRegExp(expected))
        return {
          name: 'url',
          expected: expected,
          actual: response.response.request.uri.href,
          valid: expected.test(response.response.request.uri.href)
        };
      
      return {
        name: 'url',
        expected: expected,
        actual: response.response.request.uri.href,
        valid: (response.response.request.uri.href === expected)
      }
      
    }
    
  },
  html_element: function(path, expected) {
    
    return function(response) {
      
      var $ = cheerio.load(response.html);
      // TODO: Add support for matching attributes
      if (_.isRegExp(expected))
        return {
          name: 'url',
          expected: expected,
          actual: $(path).first().text(),
          valid: expected.test($(path).first().text())
        };
      
      if (!_.isUndefined(expected))
        return {
          name: 'url',
          expected: expected,
          actual: $(path).first().text(),
          valid: ($(path).first().text() === expected)
        };
      
      return {
        name: 'url',
        expected: expected,
        actual: $(path).first().text(),
        valid: $(path).first().text()
      };
      
    }
    
  }
  
};

module.exports = IgniteExpect;
