const cheerio = require('cheerio');
const _ = require('lodash');
import { DistilleryStillError } from './error';

const getValidHtmlElement = (path, expected, $) => {

  if (_.isRegExp(expected))
    return expected.test($(path).first().text());

  if (_.isString(expected))
    return ($(path).first().text() === expected);

  if (!_.isString(expected) && !_.isRegExp(expected))
    return $(path).first().text();

};

const Expect = {
  http_code: (expected) => {

    if (!_.isFinite(expected))
      throw new DistilleryStillError('Expected http_code must be an number.');
    
    return (response, verbose) => {

      const valid = (response.statusCode === expected);
      
      if (verbose)
        return {
          name: 'http_code',
          expected: expected,
          actual: response.statusCode,
          valid: valid,
        };

      return valid;
      
    }
    
  },
  url: (expected) => {

    if (!_.isRegExp(expected) && !_.isString(expected))
      throw new DistilleryStillError('Expected url must be an string of regular expression.');

    return (response, verbose) => {

      const valid = _.isRegExp(expected) ? expected.test(response.request.uri.href) : (response.request.uri.href === expected);

      if (verbose)
          return {
            name: 'url',
            expected: expected,
            actual: response.request.uri.href,
            valid: valid,
          };

      return valid;
      
    }
    
  },
  html_element: (path, expected) => {

    if (!_.isRegExp(expected) && !_.isString(expected) && !_.isUndefined(expected))
      throw new DistilleryStillError('Expected html_element must be an string or regular expression if defined.');

    if (!_.isString(path))
      throw new DistilleryStillError('Path for html_element must be an string.');

    return (response, verbose) => {

      const $ = cheerio.load(response.body);
      const valid = getValidHtmlElement(path, expected, $);

      if (verbose)
        return {
          name: 'html_element',
          expected: expected,
          actual: $(path).first().text(),
          valid: valid,
        };

      return valid
      
    }
    
  },
};

export default Expect;
