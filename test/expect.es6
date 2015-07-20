const expect = require('expect.js');
const _ = require('lodash');
const Expect = require('../lib/expect');
const fixtures = require('./fixtures');

describe('Expect', () => {

  const response = fixtures.response.auctions;
  const responseInvalid = fixtures.response.error;

  describe('.http_code', () => {

    it('should return true if the expected http code matches the response status code', () => {

      expect(Expect.http_code(200)(response)).to.be(true);
      expect(Expect.http_code(500)(responseInvalid)).to.be(true);
      expect(Expect.http_code(400)(responseInvalid)).to.be(false);

    });

    it('should throw an error if the expected value is not a number', () => {

      expect(Expect.http_code).withArgs('test').withArgs(response).to.throwError();
      expect(Expect.http_code).withArgs(200).withArgs(response).to.not.throwError();

    });

    it('should return an object with the keys \'name\', \'expected\', \'actual\', and \'valid\' if the verbose option is set to true.', () => {

      expect(Expect.http_code(200)(response, true)).to.have.keys([ 'name', 'expected', 'actual', 'valid' ]);

    });

    it('should return the same result for the key \'valid\' as without the verbose option', () => {

      expect(Expect.http_code(200)(response, true).valid).to.be(true);

    });

  });

  describe('.url', () => {

    it('should return true if the expected string and actual url match exactly', () => {

      expect(Expect.url('https://example.com/auctions?show_tab=home&page=1&items={show_items}&context=user')(response)).to.be(true);
      expect(Expect.url('https://example.com/auctions?show_tab=home&page=1&items={show_items}&context=admin')(response)).to.be(false);

    });

    it('should return true if the expected regex and actual url match', () => {

      expect(Expect.url(/context=user/)(response)).to.be(true);

    });

    it('should throw an error if the expected value is not a regular expression or string', () => {

      expect(Expect.url).withArgs(1000).withArgs(response).to.throwError();
      expect(Expect.url).withArgs(/context=user/).withArgs(response).to.not.throwError();
      expect(Expect.url).withArgs('https://example.com/auctions?show_tab=home&page=1&items={show_items}&context=user').withArgs(response).to.not.throwError();

    });

    it('should return an object with the keys \'name\', \'expected\', \'actual\', and \'valid\' if the verbose option is set to true.', () => {

      expect(Expect.url(/context=user/)(response, true)).to.have.keys([ 'name', 'expected', 'actual', 'valid' ]);

    });

    it('should return the same result for the key \'valid\' as without the verbose option', () => {

      expect(Expect.url('https://example.com/auctions?show_tab=home&page=1&items={show_items}&context=user')(response, true).valid).to.be(true);
      expect(Expect.url(/context=user/)(response, true).valid).to.be(true);

    });

  });

  describe('.html_element', () => {

    it('should return true if the expected value is a string and the text of the css path matches that string exactly', () => {

      expect(Expect.html_element('head > title', 'Car Auctions')(response)).to.be(true);
      expect(Expect.html_element('head > title', 'Car')(response)).to.be(false);

    });

    it('should return true if the expected value is a regex and the text of the css path matches that regex', () => {

      expect(Expect.html_element('head > title', /Car/)(response)).to.be(true);
      expect(Expect.html_element('head > title', /Car test/)(response)).to.be(false);

    });

    it('should return the text of the css path when no expected value is passed', () => {

      expect(Expect.html_element('head > title')(response)).to.be('Car Auctions');

    });

    it('should throw an error if the expected value is not a regular expression, string, or undefined', () => {

      expect(Expect.html_element).withArgs('head > title', 1000).withArgs(response).to.throwError();
      expect(Expect.html_element).withArgs('head > title', /Car/).withArgs(response).to.not.throwError();
      expect(Expect.html_element).withArgs('head > title', 'Car Auctions').withArgs(response).to.not.throwError();
      expect(Expect.html_element).withArgs('head > title').withArgs(response).to.not.throwError();

    });

    it('should throw an error if the path is not a string', () => {

      expect(Expect.html_element).withArgs(1000).withArgs(response).to.throwError();

    });

    it('should return an object with the keys \'name\', \'expected\', \'actual\', and \'valid\' if the verbose option is set to true.', () => {

      expect(Expect.html_element('head > title', /Car/)(response, true)).to.have.keys([ 'name', 'expected', 'actual', 'valid' ]);

    });

    it('should return the same result for the key \'valid\' as without the verbose option', () => {

      expect(Expect.html_element('head > title', /Car/)(response, true).valid).to.be(true);

    });

  });

});
