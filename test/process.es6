const expect = require('expect.js');
const _ = require('lodash');
import Distillery from '../lib/distillery';
import Process from '../lib/process';
const fixtures = require('./fixtures');

describe('Process', () => {

  const distillery = new Distillery(fixtures.still.auctions);
  const definition = distillery.still.process;
  const process = new Process(definition);
  const response = fixtures.response.auctions;
  const responseInvalid = fixtures.response.error;
  const blankCookie = { _jar: { store: { idx: {} } } };
  const testCookie = { _jar: { store: { idx: { test: 'test cookie' } } } };

  describe('Constructor', () => {

    it('should be an instance of Process', () => {

      expect(process).to.be.an(Process);

    });

    it('should set an empty cookie jar if no jar is specified', () => {

      expect(process.options.jar).to.eql(blankCookie)

    });

    it('should set use the passed cookie jar is one is specified', () => {

      expect(new Process(definition, { jar: testCookie }).options.jar).to.eql(testCookie)

    });

    it('should extend process with the definition', () => {

      expect(process.request).to.eql(definition.request);
      expect(process.response).to.eql(definition.response);

    });

  });

  describe('.prototype._buildConfiguration', () => {

    const configuration = process._buildConfiguration({ tab: 'home', page: 1 });

    it('should build a request configuration object', () => {

      expect(configuration).to.have.key('method');
      expect(configuration).to.have.key('jar');
      expect(configuration).to.have.key('url');
      expect(configuration).to.have.key('headers');
      expect(configuration).to.have.key('form');

    });

    it('should interpolate the url', () => {

      expect(configuration.url).to.be('http://example.com/auctions?show_tab=home&page=1&items={show_items}&context=user');

    });

    it('should throw an error if the parameters argument is not an object and not undefined', () => {

      expect(process._buildConfiguration).withArgs('test').to.throwError();

    });

  });

  describe('.prototype._generateResponse', () => {

    const validResponseKey = process._getValidResponseKey(response);

    it('should add indicators, hook, and jar keys to the response when there is a validResponseKey', () => {

      expect(process._generateResponse(blankCookie)(response)).to.have.keys([ 'indicators', 'hook', 'jar' ]);
      expect(process._generateResponse(blankCookie)(response).indicators).to.eql(process._getValidResponseIndicators(definition.response[validResponseKey].indicators, response));
      expect(process._generateResponse(blankCookie)(response).hook).to.be(definition.response[validResponseKey].hook);
      expect(process._generateResponse(blankCookie)(response).jar).to.be(blankCookie);

    });

    it('should return an error object when there is not a validResponseKey', () => {

      expect(process._generateResponse(blankCookie)(responseInvalid)).to.have.keys([ 'error', 'http_code', 'url' ]);
      expect(process._generateResponse(blankCookie)(responseInvalid).http_code).to.be(responseInvalid.statusCode);
      expect(process._generateResponse(blankCookie)(responseInvalid).url).to.be(responseInvalid.request.uri.href);


    });

  });

  describe('.prototype._getValidResponseIndicators', () => {

    it('should return object with the keys as indicator names', () => {

      expect(process._getValidResponseIndicators(definition.response.success.indicators, response)).to.only.have.keys(_.keys(definition.response.success.indicators));

    });

  });

  describe('.prototype._getValidResponseKey', () => {

    it('should find first valid response', () => {

      expect(process._getValidResponseKey(response)).to.be('success')

    });

  });

  describe('.prototype._isResponseValid', () => {

    it('should validate the response the response validation function evaluates to true', () => {

      expect(process._isResponseValid(definition.response.success, response)).to.be.ok()

    });

    it('should not validate the response the response validation function evaluates to false', () => {

      expect(process._isResponseValid(definition.response.error, response)).to.not.be.ok()

    });

  });

  describe('generateParameter', () => {

    it('should substitute a parameter if one is passed', () => {

      const configuration = process._buildConfiguration({ tab: 'home', page: 1 });

      expect(configuration.url).to.contain('page=1');
      expect(configuration.url).to.contain('show_tab=home');

    });

    it('should substitute a default parameter if one is available and no parameter is passed', () => {

      const configuration = process._buildConfiguration({ tab: 'home', page: 1 });

      expect(configuration.url).to.contain('context=user');

    });

    it('should throw an error if a required parameter is not passed', () => {

      expect(process._buildConfiguration).to.throwError();

    });

  });

  describe('generateParameters', () => {

    it('should pair the \'name\' property in the definition to the value from generateParameter in an object', () => {

      expect(process._buildConfiguration({ tab: 'home', page: 1 }).headers).to.be.a('object');
      expect(process._buildConfiguration({ tab: 'home', page: 1 }).headers).to.have.property('Content-Type', 'application/x-www-form-urlencoded')

    });

  })

});
