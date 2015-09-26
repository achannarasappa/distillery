const _ = require('lodash');
const expect = require('expect.js');
import Distillery from '../lib/distillery';
import Process from '../lib/exchange';
import { DistilleryValidationError, DistilleryResponseError, DistilleryError } from '../lib/error';
import * as fixtures from './fixtures';

describe('Process', () => {

  const distillery = new Distillery(fixtures.still.auctions);
  const definition = distillery.still.process;
  const process = new Process(definition);
  const processCustom = new Process(definition, {
    requestOptions: {
      url: 'http://examplecustom.com',
      maxRedirects: 100,
    }
  });
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
    const configurationCustom = processCustom._buildConfiguration({ tab: 'home', page: 1 });

    it('should build a request configuration object', () => {

      expect(configuration).to.have.key('method');
      expect(configuration).to.have.key('jar');
      expect(configuration).to.have.key('url');
      expect(configuration).to.have.key('headers');
      expect(configuration).to.have.key('form');

    });

    it('should override distillery parameters and use custom requestOptions when passed', () => {

      expect(configurationCustom.url).to.be('http://examplecustom.com');

    });

    it('should append additional request options', () => {

      expect(configurationCustom.maxRedirects).to.be(100);

    });

    it('should interpolate the url', () => {

      expect(configuration.url).to.be('http://example.com/auctions?show_tab=home&page=10&items={show_items}&context=user&filter={filter}');

    });

    it('should throw an error if the parameters argument is not an object and not undefined', () => {

      expect(process._buildConfiguration).withArgs('test').to.throwError((error) => expect(error).to.be.a(DistilleryError));

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

    it('should throw a DistilleryResponseError when there is not a validResponseKey', () => {

      expect(() => process._generateResponse(blankCookie)(responseInvalid)).to.throwError((error) => expect(error).to.be.a(DistilleryResponseError));

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

    const distillery = new Distillery(fixtures.still.posts);
    const definition = distillery.still.process;
    const response = fixtures.response.posts;

    it('should validate the response validation function evaluates to true', () => {

      expect(process._isResponseValid(definition.response.success, response)).to.be.ok()

    });

    it('should not validate the response validation function evaluates to false', () => {

      expect(process._isResponseValid(definition.response.error, response)).to.not.be.ok()

    });

    it('should validate a response that meets all the indicators when a validate function is absent', () => {

      const validEvaluatedResponse = {
        indicators: {
          title: (response) => 'ABC',
          custom: (response) => true,
        }
      };
      const invalidEvaluatedResponseSomeFalse = {
        indicators: {
          title: (response) => true,
          custom: (response) => false,
        }
      };
      const invalidEvaluatedResponseSomeNull = {
        indicators: {
          title: (response) => true,
          custom: (response) => null,
        }
      };
      const invalidEvaluatedResponseAllFalse = {
        indicators: {
          title: (response) => false,
          custom: (response) => false,
        }
      };

      expect(process._isResponseValid(validEvaluatedResponse, response)).to.be.ok();
      expect(process._isResponseValid(invalidEvaluatedResponseSomeFalse, response)).to.not.be.ok();
      expect(process._isResponseValid(invalidEvaluatedResponseSomeNull, response)).to.not.be.ok();
      expect(process._isResponseValid(invalidEvaluatedResponseAllFalse, response)).to.not.be.ok();

    });

  });

  describe('processParameter', () => {

    it('should substitute a parameter if one is passed', () => {

      const configuration = process._buildConfiguration({ tab: 'home', page: 1 });

      expect(configuration.url).to.contain('page=1');
      expect(configuration.url).to.contain('show_tab=home');

    });

    it('should substitute a parameter if one is passed and validation passes', () => {

      const configuration = process._buildConfiguration({ context: 'user', page: 1 });

      expect(configuration.url).to.contain('page=1');
      expect(configuration.url).to.contain('context=user');

    });

    it('should substitute a default parameter if one is available and no parameter is passed', () => {

      const configuration = process._buildConfiguration({ tab: 'home', page: 1 });

      expect(configuration.url).to.contain('context=user');

    });

    it('should format a parameter if a format function is defined', () => {

      const configuration = process._buildConfiguration({ tab: 'home', page: 1 });

      expect(configuration.url).to.contain('page=10');

    });

    it('should throw an error if a required parameter is not passed', () => {

      expect(() => process._buildConfiguration()).to.throwError();

    });

    it('should throw a DistilleryValidationError error if validation fails', () => {

      expect(() => process._buildConfiguration({ context: 'mod', page: 1 })).to.throwError((e) => {

        expect(e).to.be.a(DistilleryValidationError);

      });

    });

  });

  describe('createParameter', () => {

    it('should use the parameterDefinition as the parameter name if the parameterDefinition is a string', () => {

      expect(process._buildConfiguration({ filter: 'boat', page: 1 }).url).to.contain('filter=boat');

    });

    it('should use the parameterDefinition.alias as the parameter name if the parameterDefinition.alias is a string', () => {

      expect(process._buildConfiguration({ items: 'true', page: 1 }).url).to.contain('items=true');

    });

    it('should use the parameterDefinition.name as the parameter name if the parameterDefinition.name if parameterDefinition.alias is not a string', () => {

      expect(process._buildConfiguration({ page: 20 }).url).to.contain('page=200');

    });

  });

  describe('generateParameters', () => {

    it('should pair the \'name\' property in the definition to the value from generateParameter in an object', () => {

      expect(process._buildConfiguration({ tab: 'home', page: 1 }).headers).to.be.a('object');
      expect(process._buildConfiguration({ tab: 'home', page: 1 }).headers).to.have.property('Content-Type', 'application/x-www-form-urlencoded');

    });

    it('should use default headers and form data when the definition.request.parameters property is undefined', () => {

      const distilleryPosts = new Distillery(fixtures.still.posts);
      const definitionPosts = distilleryPosts.still.process;
      const processPosts = new Process(definitionPosts);

      expect(processPosts._buildConfiguration().headers).to.eql({});
      expect(processPosts._buildConfiguration().form).to.eql({});

    });

    it('should not throw an error when no query parameters are defined', () => {

      const definitionWithoutQuery = _.merge({}, distillery.still.process, {
        request: {
          parameters: [
            {
              name: 'Content-Type',
              alias: 'content_type',
              type: 'header',
              required: true,
              def: 'application/x-www-form-urlencoded',
            },
          ],
        },
      });
      const processWithoutQuery = new Process(definitionWithoutQuery);

      expect(() => processWithoutQuery._buildConfiguration({ page: 1 })).to.not.throwError();

    });

    it('should throw an error when definition.request.validate is defined and returns a falsy value', () => {

      const definitionValidationError = _.merge({}, distillery.still.process, {
        request: {
          validate: () => false,
        }
      });
      const definitionValidationNoError = _.merge({}, distillery.still.process, {
        request: {
          validate: () => true,
        }
      });
      const processValidationError = new Process(definitionValidationError);
      const processValidationNoError = new Process(definitionValidationNoError);

      expect(() => processValidationError._buildConfiguration({ page: 1 })).to.throwError((error) => expect(error).to.be.a(DistilleryValidationError));
      expect(() => processValidationNoError._buildConfiguration({ page: 1 })).to.not.throwError();

    });

    it('should expose parameters by their aliased name', () => {

      const definitionValidationNoError = _.assign(_.clone(distillery.still.process), {
        request: {
          url: 'http://example.com/auctions?page={page}',
          method: 'get',
          parameters: [
            {
              name: 'p',
              alias: 'page',
              required: true,
            },
          ],
          validate: (parameters) => _.has(parameters, 'page'),
        }
      });
      const processValidationNoError = new Process(definitionValidationNoError);

      expect(() => processValidationNoError._buildConfiguration({ page: 1 })).to.not.throwError();

    });

  })

});
