var cheerio = require('cheerio'),
    _ = require('lodash');

var Expect = {
  http_code: function(expected){
    return function(response){
      return (response.response.statusCode === expected)
    }
  },
  url: function(expected){
    // TODO: Match url based on regex
    return function(response){
      return (response.response.request.uri.href === expected)
    }
  },
  html_element: function(path, expected){
    return function(response){
      var $ = cheerio.load(response.html);
      // TODO: Add support for matching attributes
      // TODO: Match html based on regex
      if (!_.isUndefined(expected))
        return ($(path).first().text() === expected);
      else
        return $(path).first().text()
    }
  }
};

module.exports = Expect;