var expect = require('expect.js');
var _ = require('lodash');
var Expect = require('../lib/expect');
var fixtures = require('./fixtures');

describe('Expect', function() {

  var response = fixtures.postings_response;
  var responseInvalid = fixtures.postings_response_invalid;

  describe('.http_code', function() {

    it('should return true if the expected http code matches the response status code', function() {

      expect(Expect.http_code(200)(response)).to.be(true);
      expect(Expect.http_code(500)(responseInvalid)).to.be(true);
      expect(Expect.http_code(400)(responseInvalid)).to.be(false);

    });

    it('should throw an error if the expected value is not a number', function() {

      expect(Expect.http_code).withArgs('test').withArgs(response).to.throwError();
      expect(Expect.http_code).withArgs(200).withArgs(response).to.not.throwError();

    });

  });

  describe('.url', function() {

    it('should return true if the expected string and actual url match exactly', function() {

      expect(Expect.url('https://news.ycombinator.com/item?id=9245441')(response)).to.be(true);
      expect(Expect.url('https://news.ycombinator.com/item?id=1')(response)).to.be(false);

    });

    it('should return true if the expected regex and actual url match', function() {

      expect(Expect.url(/item\?id=9245441/)(response)).to.be(true);

    });

    it('should throw an error if the expected value is not a regular expression or string', function() {

      expect(Expect.url).withArgs(1000).withArgs(response).to.throwError();
      expect(Expect.url).withArgs(/item\?id=9245441/).withArgs(response).to.not.throwError();
      expect(Expect.url).withArgs('https://news.ycombinator.com/item?id=9245441').withArgs(response).to.not.throwError();

    });

  });

  describe('.html_element', function() {

    it('should return true if the expected value is a string and the text of the css path matches that string exactly', function() {

      expect(Expect.html_element('head > title', 'The decline of Vancouver | Hacker News')(response)).to.be(true);
      expect(Expect.html_element('head > title', 'The decline of Vancouver')(response)).to.be(false);

    });

    it('should return true if the expected value is a regex and the text of the css path matches that regex', function() {

      expect(Expect.html_element('head > title', /Hacker News/)(response)).to.be(true);
      expect(Expect.html_element('head > title', /Hacker News test/)(response)).to.be(false);

    });

    it('should return the text of the css path when no expected value is passed', function() {

      expect(Expect.html_element('head > title')(response)).to.be('The decline of Vancouver | Hacker News');

    });

    it('should throw an error if the expected value is not a regular expression, string, or undefined', function() {

      expect(Expect.html_element).withArgs('head > title', 1000).withArgs(response).to.throwError();
      expect(Expect.html_element).withArgs('head > title', /Hacker News/).withArgs(response).to.not.throwError();
      expect(Expect.html_element).withArgs('head > title', 'The decline of Vancouver | Hacker News').withArgs(response).to.not.throwError();
      expect(Expect.html_element).withArgs('head > title').withArgs(response).to.not.throwError();

    });

    it('should throw an error if the path is not a string', function() {

      expect(Expect.html_element).withArgs(1000).withArgs(response).to.throwError();

    });

  });

});
