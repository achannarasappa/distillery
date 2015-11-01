const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
import Distillery from '../lib/distillery';
import Exchange from '../lib/exchange';
import { DistilleryValidationError, DistilleryResponseError, DistilleryError } from '../lib/error';
import * as fixtures from './fixtures';

chai.use(sinonChai);

describe('Exchange', () => {

  const distillery = new Distillery(fixtures.still.auctions);
  const definition = distillery.still.exchange;
  const exchange = new Exchange(definition);
  const exchangeCustom = new Exchange(definition, {
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

    it('should be an instance of Exchange', () => {

      expect(exchange).to.be.an.instanceof(Exchange);

    });

    it('should set an empty cookie jar if no jar is specified', () => {

      expect(_.cloneDeep(exchange.options.jar)).to.eql(blankCookie)

    });

    it('should set use the passed cookie jar is one is specified', () => {

      expect(new Exchange(definition, { jar: testCookie }).options.jar).to.eql(testCookie)

    });

    it('should extend exchange with the definition', () => {

      expect(exchange.request).to.eql(definition.request);
      expect(exchange.response).to.eql(definition.response);

    });

  });

  describe('.prototype._buildConfiguration', () => {

    const configuration = exchange._buildConfiguration({ tab: 'home', page: 1 });
    const configurationCustom = exchangeCustom._buildConfiguration({ tab: 'home', page: 1 });

    it('should build a request configuration object', () => {

      expect(configuration).to.contain.all.keys([ 'method', 'jar', 'url', 'headers', 'form' ]);

    });

    it('should override distillery parameters and use custom requestOptions when passed', () => {

      expect(configurationCustom.url).to.eql('http://examplecustom.com');

    });

    it('should append additional request options', () => {

      expect(configurationCustom.maxRedirects).to.eql(100);

    });

    it('should interpolate the url', () => {

      expect(configuration.url).to.eql('http://example.com/auctions?show_tab=home&page=10&items={show_items}&context=user&filter={filter}');

    });

    it('should throw an error if the parameters argument is not an object and not undefined', () => {

      expect(() => exchange._buildConfiguration('test')).to.throw(DistilleryError);

    });

  });

  describe('.prototype._generateResponse', () => {

    const validResponse = exchange._getValidResponse(response);

    it('should add indicators, hook, and jar keys to the response when there is a validResponse', () => {

      expect(exchange._generateResponse(blankCookie)(response)).to.contain.keys([ 'indicators', 'hook', 'jar' ]);
      expect(exchange._generateResponse(blankCookie)(response).indicators).to.eql(exchange._getValidResponseIndicators(validResponse.indicators, response));
      expect(exchange._generateResponse(blankCookie)(response).hook).to.eql(validResponse.hook);
      expect(exchange._generateResponse(blankCookie)(response).jar).to.eql(blankCookie);

    });

    it('should throw a DistilleryResponseError when there is not a validResponse', () => {

      expect(() => exchange._generateResponse(blankCookie)(responseInvalid)).to.throw(DistilleryResponseError);

    });

  });

  describe('.prototype._getValidResponseIndicators', () => {

    it('should return an array with boolean values', () => {

      const expectedLength = _.keys(definition.response[0].indicators).length;

      expect(_.keys(exchange._getValidResponseIndicators(definition.response[0].indicators, response))).to.have.length(expectedLength);

    });

  });

  describe('.prototype._getValidResponse', () => {

    it('should find first valid response', () => {

      console.log(exchange._getValidResponse(response));
      
      expect(exchange._getValidResponse(response).name).to.eql('success')

    });

  });

  describe('.prototype._isResponseValid', () => {

    const distillery = new Distillery(fixtures.still.posts);
    const definition = distillery.still.exchange;
    const response = fixtures.response.posts;

    it('should validate the response validation function evaluates to true', () => {

      console.log(exchange._isResponseValid(definition.response[0], response));
      expect(exchange._isResponseValid(definition.response[0], response)).to.be.ok

    });

    it('should not validate the response validation function evaluates to false', () => {

      expect(exchange._isResponseValid(definition.response[1], response)).to.not.be.ok

    });

    it('should validate the first response that meets all the indicators when a validate function is absent', () => {

      const validEvaluatedResponse = {
        indicators: [
          (response) => 'ABC',
          (response) => true,
        ],
      };
      const invalidEvaluatedResponseSomeFalse = {
        indicators: [
          (response) => true,
          (response) => false,
        ],
      };
      const invalidEvaluatedResponseSomeNull = {
        indicators: [
          (response) => true,
          (response) => null,
        ],
      };
      const invalidEvaluatedResponseAllFalse = {
        indicators: [
          (response) => false,
          (response) => false,
        ],
      };

      expect(exchange._isResponseValid(validEvaluatedResponse, response)).to.be.ok;
      expect(exchange._isResponseValid(invalidEvaluatedResponseSomeFalse, response)).to.not.be.ok;
      expect(exchange._isResponseValid(invalidEvaluatedResponseSomeNull, response)).to.not.be.ok;
      expect(exchange._isResponseValid(invalidEvaluatedResponseAllFalse, response)).to.not.be.ok;

    });

    it('should use the indicators[<index>].test function to evaluate if an indicator is met when indicators[<index>] is an object', () => {

      const indicatorStub = sinon.stub().returns(true);
      const validEvaluatedResponse = {
        indicators: [
          indicatorStub,
        ],
      };

      exchange._isResponseValid(validEvaluatedResponse, response);
      expect(indicatorStub).to.be.calledOnce;

    });

    it('should use the indicators[<index>] function to evaluate if an indicator is met when indicators[<index>] is a function', () => {

      const indicatorStub = sinon.stub().returns(true);
      const validEvaluatedResponse = {
        indicators: [
          {
            name: 'stub',
            test: indicatorStub
          },
        ],
      };

      exchange._isResponseValid(validEvaluatedResponse, response);
      expect(indicatorStub).to.be.calledOnce;

    });

  });

  describe('processParameter', () => {

    it('should substitute a parameter if one is passed', () => {

      const configuration = exchange._buildConfiguration({ tab: 'home', page: 1 });

      expect(configuration.url).to.contain('page=1');
      expect(configuration.url).to.contain('show_tab=home');

    });

    it('should substitute a parameter if one is passed and validation passes', () => {

      const configuration = exchange._buildConfiguration({ context: 'user', page: 1 });

      expect(configuration.url).to.contain('page=1');
      expect(configuration.url).to.contain('context=user');

    });

    it('should substitute a default parameter if one is available and no parameter is passed', () => {

      const configuration = exchange._buildConfiguration({ tab: 'home', page: 1 });

      expect(configuration.url).to.contain('context=user');

    });

    it('should format a parameter if a format function is defined', () => {

      const configuration = exchange._buildConfiguration({ tab: 'home', page: 1 });

      expect(configuration.url).to.contain('page=10');

    });

    it('should throw an error if a required parameter is not passed', () => {

      expect(() => exchange._buildConfiguration()).to.throw();

    });

    it('should throw a DistilleryValidationError error if validation fails', () => {

      expect(() => exchange._buildConfiguration({ context: 'mod', page: 1 })).to.throw(DistilleryValidationError);

    });

  });

  describe('createParameter', () => {

    it('should use the parameterDefinition as the parameter name if the parameterDefinition is a string', () => {

      expect(exchange._buildConfiguration({ filter: 'boat', page: 1 }).url).to.contain('filter=boat');

    });

    it('should use the parameterDefinition.alias as the parameter name if the parameterDefinition.alias is a string', () => {

      expect(exchange._buildConfiguration({ items: 'true', page: 1 }).url).to.contain('items=true');

    });

    it('should use the parameterDefinition.name as the parameter name if the parameterDefinition.name if parameterDefinition.alias is not a string', () => {

      expect(exchange._buildConfiguration({ page: 20 }).url).to.contain('page=200');

    });

  });

  describe('generateParameters', () => {

    it('should pair the \'name\' property in the definition to the value from generateParameter in an object', () => {

      expect(exchange._buildConfiguration({ tab: 'home', page: 1 }).headers).to.be.a('object');
      expect(exchange._buildConfiguration({ tab: 'home', page: 1 }).headers).to.have.property('Content-Type', 'application/x-www-form-urlencoded');

    });

    it('should use default headers and form data when the definition.request.parameters property is undefined', () => {

      const distilleryPosts = new Distillery(fixtures.still.posts);
      const definitionPosts = distilleryPosts.still.exchange;
      const exchangePosts = new Exchange(definitionPosts);

      expect(exchangePosts._buildConfiguration().headers).to.eql({});
      expect(exchangePosts._buildConfiguration().form).to.eql({});

    });

    it('should not throw an error when no query parameters are defined', () => {

      const definitionWithoutQuery = _.merge({}, distillery.still.exchange, {
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
      const exchangeWithoutQuery = new Exchange(definitionWithoutQuery);

      expect(() => exchangeWithoutQuery._buildConfiguration({ page: 1 })).to.not.throw();

    });

    it('should throw an error when definition.request.validate is defined and returns a falsy value', () => {

      const definitionValidationError = _.merge({}, distillery.still.exchange, {
        request: {
          validate: () => false,
        }
      });
      const definitionValidationNoError = _.merge({}, distillery.still.exchange, {
        request: {
          validate: () => true,
        }
      });
      const exchangeValidationError = new Exchange(definitionValidationError);
      const exchangeValidationNoError = new Exchange(definitionValidationNoError);

      expect(() => exchangeValidationError._buildConfiguration({ page: 1 })).to.throw(DistilleryValidationError);
      expect(() => exchangeValidationNoError._buildConfiguration({ page: 1 })).to.not.throw();

    });

    it('should expose parameters by their aliased name', () => {

      const definitionValidationNoError = _.assign(_.clone(distillery.still.exchange), {
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
      const exchangeValidationNoError = new Exchange(definitionValidationNoError);

      expect(() => exchangeValidationNoError._buildConfiguration({ page: 1 })).to.not.throw();

    });

  })

});
