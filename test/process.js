var expect = require('expect.js');
var _ = require('lodash');
var Distillery = require('../');
var Process = require('../lib/process');
var fixtures = require('./fixtures');

describe('Process', function() {

  var definition = Distillery(fixtures.postings).still(Distillery(fixtures.postings)).process;
  var process = Process(definition);
  var response = fixtures.postings_response;
  var responseInvalid = fixtures.postings_response_invalid;
  var blankCookie = { _jar: { store: { idx: {} } } };
  var testCookie = { _jar: { store: { idx: { test: 'test cookie' } } } };

  describe('Constructor', function() {

    it('should be an instance of Process', function() {

      expect(process).to.be.an(Process);

    });

    it('should set an empty cookie jar if no jar is specified', function() {

      expect(Process(definition).options.jar).to.eql(blankCookie)

    });

    it('should set use the passed cookie jar is one is specified', function() {

      expect(Process(definition, { jar: testCookie }).options.jar).to.eql(testCookie)

    });

    it('should extend process with the definition', function() {

      expect(process.request).to.eql(definition.request);
      expect(process.response).to.eql(definition.response);

    });

  });

  describe('.prototype._buildConfiguration', function() {

    var configuration = process._buildConfiguration({ tab: 'home', page: 1 });

    it('should build a request configuration object', function() {

      expect(configuration).to.have.key('method');
      expect(configuration).to.have.key('jar');
      expect(configuration).to.have.key('url');
      expect(configuration).to.have.key('headers');
      expect(configuration).to.have.key('form');

    });

    it('should interpolate the url', function() {

      expect(configuration.url).to.be('https://accounts.craigslist.org/login/home?show_tab=home&page=1&items={show_items}&context=user');

    });

    it('should throw an error if the parameters argument is not an object and not undefined', function() {

      expect(process._buildConfiguration).withArgs('test').to.throwError();

    });

  });

  describe('.prototype._generateResponse', function() {

    var validResponseKey = process._getValidResponseKey(response);

    it('should add indicators, hook, and jar keys to the response when there is a validResponseKey', function() {

      expect(process._generateResponse(blankCookie)(response)).to.have.keys([ 'indicators', 'hook', 'jar' ]);
      expect(process._generateResponse(blankCookie)(response).indicators).to.eql(process._getValidResponseIndicators(definition.response[validResponseKey].indicators, response));
      expect(process._generateResponse(blankCookie)(response).hook).to.be(definition.response[validResponseKey].hook);
      expect(process._generateResponse(blankCookie)(response).jar).to.be(blankCookie);

    });

    it('should return an error object when there is not a validResponseKey', function() {

      expect(process._generateResponse(blankCookie)(responseInvalid)).to.have.keys([ 'error', 'http_code', 'url' ]);
      expect(process._generateResponse(blankCookie)(responseInvalid).http_code).to.be(responseInvalid.statusCode);
      expect(process._generateResponse(blankCookie)(responseInvalid).url).to.be(responseInvalid.request.uri.href);


    });

  });

  describe('.prototype._getValidResponseIndicators', function() {

    it('should return object with the keys as indicator names', function() {

      expect(process._getValidResponseIndicators(definition.response.success.indicators, response)).to.only.have.keys(_.keys(definition.response.success.indicators));

    });

  });

  describe('.prototype._getValidResponseKey', function() {

    it('should find first valid response', function() {

      expect(process._getValidResponseKey(response)).to.be('success')

    });

  });

  describe('.prototype._isResponseValid', function() {

    it('should validate the response the response validation function evaluates to true', function() {

      expect(process._isResponseValid(definition.response.success, response)).to.be.ok()

    });

    it('should not validate the response the response validation function evaluates to false', function() {

      expect(process._isResponseValid(definition.response.error, response)).to.not.be.ok()

    });

  });

  describe('generateParameter', function() {

    it('should substitute a parameter if one is passed', function() {

      var configuration = process._buildConfiguration({ tab: 'home', page: 1 });

      expect(configuration.url).to.contain('page=1');
      expect(configuration.url).to.contain('show_tab=home');

    });

    it('should substitute a default parameter if one is available and no parameter is passed', function() {

      var configuration = process._buildConfiguration({ tab: 'home', page: 1 });

      expect(configuration.url).to.contain('context=user');

    });

    it('should throw an error if a required parameter is not passed', function() {

      expect(process._buildConfiguration).to.throwError();

    });

  });

  describe('generateParameters', function() {

    it('should pair the \'name\' property in the definition to the value from generateParameter in an object', function() {

      expect(process._buildConfiguration({ tab: 'home', page: 1 }).headers).to.be.a('object');
      expect(process._buildConfiguration({ tab: 'home', page: 1 }).headers).to.have.property('Content-Type', 'application/x-www-form-urlencoded')

    });

  })

});
