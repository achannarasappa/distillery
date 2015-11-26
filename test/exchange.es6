const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const tough = require('tough-cookie');
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
      follow: 100,
    }
  });
  const response = fixtures.response.auctions;
  const request = fixtures.request.auctions;
  const responseInvalid = fixtures.response.error;
  const requestInvalid = fixtures.request.error;
  const blankCookie = new tough.CookieJar();
  const testCookie = (new tough.CookieJar()).setCookieSync('cl_session=aaa111', 'example.com');

  describe('Constructor', () => {

    it('should be an instance of Exchange', () => {

      expect(exchange).to.be.an.instanceof(Exchange);

    });

    it('should set an empty cookie jar if no jar is specified', () => {

      expect(exchange.options.jar).to.eql(blankCookie)

    });

    it('should set use the passed cookie jar is one is specified', () => {

      expect(new Exchange(definition, { jar: testCookie }).options.jar).to.eql(testCookie)

    });

    it('should extend exchange with the definition', () => {

      expect(exchange.request).to.eql(definition.request);
      expect(exchange.response).to.eql(definition.response);

    });

  });

  describe('.prototype._buildRequestArguments', () => {

    const [ url, init ] = exchange._buildRequestArguments({ tab: 'home', page: 1 });
    const [ urlCustom, initCustom ] = exchangeCustom._buildRequestArguments({ tab: 'home', page: 1 });

    it('should build a request init object', () => {

      expect(init).to.contain.all.keys([ 'body', 'headers', 'method' ]);

    });

    it('should append additional request options', () => {

      expect(initCustom.follow).to.eql(100);

    });

    it('should interpolate the url', () => {

      expect(url).to.eql('http://example.com/auctions?show_tab=home&page=10&items={show_items}&context=user&filter={filter}');

    });

    it('should throw an error if the parameters argument is not an object and not undefined', () => {

      expect(() => exchange._buildRequestArguments('test')).to.throw(DistilleryError);

    });

  });

  describe('.prototype._generateResponse', () => {

    const validResponse = exchange._getValidResponse(response);

    it('should add indicators, hook, and jar keys to the response when there is a validResponse', () => {

      const expectedIndicators = exchange._getValidResponseIndicators(validResponse.indicators, response);

      expect(exchange._generateResponse(request)(response)).to.contain.keys([ 'request', 'response', 'jar', 'still' ]);
      expect(exchange._generateResponse(request)(response).response).to.eql(response);
      expect(exchange._generateResponse(request)(response).response).to.eql(response);
      expect(exchange._generateResponse(request)(response).still.indicators).to.eql(expectedIndicators);
      expect(exchange._generateResponse(request)(response).still.hook).to.eql(validResponse.hook);
      expect(exchange._generateResponse(request)(response).jar).to.eql(blankCookie);

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

      expect(exchange._getValidResponse(response).name).to.eql('success')

    });

  });

  describe('.prototype._isResponseValid', () => {

    const distillery = new Distillery(fixtures.still.posts);
    const definition = distillery.still.exchange;
    const response = fixtures.response.posts;

    it('should validate the response validation function evaluates to true', () => {

      expect(exchange._isResponseValid(definition.response[0], response)).to.be.ok

    });

    it('should not validate the response validation function evaluates to false', () => {

      expect(exchange._isResponseValid(definition.response[1], response)).to.not.be.ok

    });

    it('should validate the first response that meets all the indicators when a predicate function is absent', () => {

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
            test: indicatorStub,
          },
        ],
      };

      exchange._isResponseValid(validEvaluatedResponse, response);
      expect(indicatorStub).to.be.calledOnce;

    });

  });

  describe('processParameter', () => {

    it('should substitute a parameter if one is passed', () => {

      const [ url ] = exchange._buildRequestArguments({ tab: 'home', page: 1 });

      expect(url).to.contain('page=1');
      expect(url).to.contain('show_tab=home');

    });

    it('should substitute a parameter if one is passed and validation passes', () => {

      const [ url ] = exchange._buildRequestArguments({ context: 'user', page: 1 });

      expect(url).to.contain('page=1');
      expect(url).to.contain('context=user');

    });

    it('should substitute a default parameter if one is available and no parameter is passed', () => {

      const [ url ] = exchange._buildRequestArguments({ tab: 'home', page: 1 });

      expect(url).to.contain('context=user');

    });

    it('should transform a parameter if a transform function is defined', () => {

      const [ url ] = exchange._buildRequestArguments({ tab: 'home', page: 1 });

      expect(url).to.contain('page=10');

    });

    it('should throw an error if a required parameter is not passed', () => {

      expect(() => exchange._buildRequestArguments()).to.throw();

    });

    it('should throw a DistilleryValidationError error if validation fails', () => {

      expect(() => exchange._buildRequestArguments({ context: 'mod', page: 1 })).to.throw(DistilleryValidationError);

    });

  });

  describe('createParameter', () => {

    it('should use the parameterDefinition as the parameter name if the parameterDefinition is a string', () => {

      const [ url ] = exchange._buildRequestArguments({ filter: 'boat', page: 1 });

      expect(url).to.contain('filter=boat');

    });

    it('should use the parameterDefinition.alias as the parameter name if the parameterDefinition.alias is a string', () => {

      const [ url ] = exchange._buildRequestArguments({ items: 'true', page: 1 });

      expect(url).to.contain('items=true');

    });

    it('should use the parameterDefinition.name as the parameter name if the parameterDefinition.name if parameterDefinition.alias is not a string', () => {

      const [ url ] = exchange._buildRequestArguments({ page: 20 });

      expect(url).to.contain('page=200');

    });

  });

  describe('generateParameters', () => {

    it('should pair the \'name\' property in the definition to the value from generateParameter in an object', () => {

      const [ url, { headers } ] = exchange._buildRequestArguments({ tab: 'home', page: 1 });

      expect(headers).to.be.a('object');
      expect(headers).to.have.property('Content-Type', 'application/x-www-form-urlencoded');

    });

    it('should use default headers and form data when the definition.request.parameters property is undefined', () => {

      const distilleryPosts = new Distillery(fixtures.still.posts);
      const definitionPosts = distilleryPosts.still.exchange;
      const exchangePosts = new Exchange(definitionPosts);
      const [ url, { headers, body } ] = exchangePosts._buildRequestArguments()

      expect(headers).to.eql({});
      expect(body).to.eql('');

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

      expect(() => exchangeWithoutQuery._buildRequestArguments({ page: 1 })).to.not.throw();

    });

    it('should throw an error when definition.request.predicate is defined and returns a falsy value', () => {

      const definitionValidationError = _.merge({}, distillery.still.exchange, {
        request: {
          predicate: () => false,
        }
      });
      const definitionValidationNoError = _.merge({}, distillery.still.exchange, {
        request: {
          predicate: () => true,
        }
      });
      const exchangeValidationError = new Exchange(definitionValidationError);
      const exchangeValidationNoError = new Exchange(definitionValidationNoError);

      expect(() => exchangeValidationError._buildRequestArguments({ page: 1 })).to.throw(DistilleryValidationError);
      expect(() => exchangeValidationNoError._buildRequestArguments({ page: 1 })).to.not.throw();

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
          predicate: (parameters) => _.has(parameters, 'page'),
        }
      });
      const exchangeValidationNoError = new Exchange(definitionValidationNoError);

      expect(() => exchangeValidationNoError._buildRequestArguments({ page: 1 })).to.not.throw();

    });

  })

});
