const _ = require('lodash');
const expect = require('expect.js');
import * as fixtures from './fixtures';
import { validateModel, validateExchange, validateStill } from '../lib/validate';
import Distillery from '../lib/distillery';
import { DistilleryStillError } from '../lib/error';

describe('Validate', () => {

  const distillery = new Distillery(fixtures.still.auctions);
  const definitionStill = _.clone(distillery.still);
  const definitionExchange = _.clone(distillery.still.exchange);
  const definitionModel = _.clone(distillery.still.models[0]);

  describe('.validateModel', () => {

    it('should return the input if no errors are thrown', () => {

      expect(validateModel(definitionModel)).to.eql(definitionModel);

    });

    it('should throw an error if definition.name is not a string', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        name: {},
      });

      expect(validateModel).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.type is not a string', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        type: {},
      });

      expect(validateModel).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.type is not \'collection\' or \'item\'', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        type: 'item1',
      });

      expect(validateModel).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.type is \'collection\' and definition.collectionPath is not a string', () => {

      const invalidDefinitionModel = _.omit(definitionModel, 'collectionPath');

      expect(validateModel).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.properties is not an object', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        properties: '',
      });

      expect(validateModel).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.properties[<key>] is not a string, object, or function', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        properties: {
          url: true,
        },
      });
      const validDefinitionModel = _.merge({}, definitionModel, {
        properties: {
          url: ($) => $('div#post-list > div').eq(0).html(),
        },
      });

      expect(validateModel).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(validateModel).withArgs(validDefinitionModel).to.not.throwError();

    });

    it('should throw an error if definition.properties[<key>] is an object but definition.properties[<key>].path is not a string', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        properties: {
          url: {
            path: {},
          },
        },
      });

      expect(validateModel).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.properties[<key>] is an object but neither definition.properties[<key>].attr nor definition.properties[<key>].regex are defined', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        properties: {
          url: {
            path: 'div.url',
          },
        },
      });

      expect(validateModel).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.properties[<key>] is an object but definition.properties[<key>].attr is not a string or undefined', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        properties: {
          url: {
            path: 'div.url',
            attr: {},
          },
        },
      });
      const validDefinitionModel = _.merge({}, definitionModel, {
        properties: {
          url: {
            path: 'div.url',
            regex: /www/,
          },
        },
      });

      expect(validateModel).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(validateModel).withArgs(validDefinitionModel).to.not.throwError();

    });

    it('should throw an error if definition.properties[<key>] is an object but definition.properties[<key>].regex is not a regular expression or undefined', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        properties: {
          url: {
            path: 'div.url',
            regex: {},
          },
        },
      });
      const validDefinitionModel = _.merge({}, definitionModel, {
        properties: {
          url: {
            path: 'div.url',
            regex: /www/,
          },
        },
      });

      expect(validateModel).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(validateModel).withArgs(validDefinitionModel).to.not.throwError();

    });

    it('should throw an error if definition.predicate is not a function or undefined', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        predicate: '',
      });
      const validDefinitionModel = _.omit(definitionModel, 'predicate');

      expect(validateModel).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(validateModel).withArgs(validDefinitionModel).to.not.throwError();

    });

    it('should throw an error if definition.transform is not a function or undefined', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        transform: '',
      });
      const validDefinitionModel = _.omit(definitionModel, 'transform');

      expect(validateModel).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(validateModel).withArgs(validDefinitionModel).to.not.throwError();

    });

  });

  describe('.validateExchange', () => {

    it('should return the input if no errors are thrown', () => {

      expect(validateExchange(definitionExchange)).to.eql(definitionExchange);

    });

    it('should throw an error if definition.request is not an object', () => {

      const invalidDefinitionExchange = _.merge({}, definitionExchange, {
        request: '',
      });

      expect(validateExchange).withArgs(invalidDefinitionExchange).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.request.url is not a string', () => {

      const invalidDefinitionExchange = _.merge({}, definitionExchange, {
        request: {
          url: false
        },
      });

      expect(validateExchange).withArgs(invalidDefinitionExchange).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.request.method is not a string', () => {

      const invalidDefinitionExchange = _.merge({}, definitionExchange, {
        request: {
          method: false
        },
      });

      expect(validateExchange).withArgs(invalidDefinitionExchange).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.request.method is not \'GET\', \'POST\', \'PATCH\', \'PUT\', \'DEL\', or \'HEAD\'', () => {

      const invalidDefinitionExchange = _.merge({}, definitionExchange, {
        request: {
          method: 'post1'
        },
      });

      expect(validateExchange).withArgs(invalidDefinitionExchange).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if exchange.request.parameters[<index>] is not a string or object', () => {

      const invalidDefinitionExchange = _.merge({}, definitionExchange, {
        request: {
          parameters: [
            () => true,
          ]
        },
      });

      const validDefinitionExchangeString = _.merge({}, definitionExchange, {
        request: {
          parameters: [
            'test',
          ]
        },
      });

      const validDefinitionExchangeObject = _.merge({}, definitionExchange, {
        request: {
          parameters: [
            {
              name: 'show_tab_name',
              alias: 'tab',
              required: true,
              def: 'postings',
            },
          ]
        },
      });

      expect(validateExchange).withArgs(invalidDefinitionExchange).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(validateExchange).withArgs(validDefinitionExchangeString).to.not.throwError();
      expect(validateExchange).withArgs(validDefinitionExchangeObject).to.not.throwError();

    });

    it('should throw an error if exchange.request.parameters[<index>].name is not a string', () => {

      const invalidDefinitionExchange = _.merge({}, definitionExchange, {
        request: {
          parameters: [
            {
              name: true
            }
          ]
        },
      });

      const validDefinitionExchangeString = _.merge({}, definitionExchange, {
        request: {
          parameters: [
            {
              name: 'test'
            }
          ]
        },
      });

      expect(validateExchange).withArgs(invalidDefinitionExchange).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(validateExchange).withArgs(validDefinitionExchangeString).to.not.throwError();

    });

    it('should throw an error if exchange.request.parameters[<index>].required is not a boolean or undefined', () => {

      const invalidDefinitionExchange = _.merge({}, definitionExchange, {
        request: {
          parameters: [
            {
              name: 'test1',
              required: 'true',
            }
          ]
        },
      });

      const validDefinitionExchangeBoolean = _.merge({}, definitionExchange, {
        request: {
          parameters: [
            {
              name: 'test1',
              required: true,
            }
          ]
        },
      });

      const validDefinitionExchangeUndefined = _.merge({}, definitionExchange, {
        request: {
          parameters: [
            {
              name: 'test1',
            }
          ]
        },
      });

      expect(validateExchange).withArgs(invalidDefinitionExchange).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(validateExchange).withArgs(validDefinitionExchangeBoolean).to.not.throwError();
      expect(validateExchange).withArgs(validDefinitionExchangeUndefined).to.not.throwError();

    });

    it('should throw an error if exchange.request.parameters[<index>].predicate is not a function or undefined', () => {

      const invalidDefinitionExchange = _.merge({}, definitionExchange, {
        request: {
          parameters: [
            {
              name: 'test1',
              predicate: true,
            }
          ]
        },
      });

      const validDefinitionExchangeFunction = _.merge({}, definitionExchange, {
        request: {
          parameters: [
            {
              name: 'test1',
              predicate: () => true,
            }
          ]
        },
      });

      const validDefinitionExchangeUndefined = _.merge({}, definitionExchange, {
        request: {
          parameters: [
            {
              name: 'test1',
            }
          ]
        },
      });

      expect(validateExchange).withArgs(invalidDefinitionExchange).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(validateExchange).withArgs(validDefinitionExchangeFunction).to.not.throwError();
      expect(validateExchange).withArgs(validDefinitionExchangeUndefined).to.not.throwError();

    });

    it('should throw an error if exchange.request.parameters[<index>].transform is not a function or undefined', () => {

      const invalidDefinitionExchange = _.merge({}, definitionExchange, {
        request: {
          parameters: [
            {
              name: 'test1',
              transform: true,
            }
          ]
        },
      });

      const validDefinitionExchangeFunction = _.merge({}, definitionExchange, {
        request: {
          parameters: [
            {
              name: 'test1',
              transform: () => true,
            }
          ]
        },
      });

      const validDefinitionExchangeUndefined = _.merge({}, definitionExchange, {
        request: {
          parameters: [
            {
              name: 'test1',
            }
          ]
        },
      });

      expect(validateExchange).withArgs(invalidDefinitionExchange).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(validateExchange).withArgs(validDefinitionExchangeFunction).to.not.throwError();
      expect(validateExchange).withArgs(validDefinitionExchangeUndefined).to.not.throwError();

    });

    it('should throw an error if exchange.request.parameters[<index>].alias is not a string or undefined', () => {

      const invalidDefinitionExchange = _.merge({}, definitionExchange, {
        request: {
          parameters: [
            {
              name: 'test1',
              alias: true,
            }
          ]
        },
      });

      const validDefinitionExchangeString = _.merge({}, definitionExchange, {
        request: {
          parameters: [
            {
              name: 'test1',
              alias: 'test',
            }
          ]
        },
      });

      const validDefinitionExchangeUndefined = _.merge({}, definitionExchange, {
        request: {
          parameters: [
            {
              name: 'test1',
            }
          ]
        },
      });

      expect(validateExchange).withArgs(invalidDefinitionExchange).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(validateExchange).withArgs(validDefinitionExchangeString).to.not.throwError();
      expect(validateExchange).withArgs(validDefinitionExchangeUndefined).to.not.throwError();

    });

    it('should throw an error if exchange.request.parameters[<index>].type is not a string or undefined', () => {

      const invalidDefinitionExchange = _.merge({}, definitionExchange, {
        request: {
          parameters: [
            {
              name: 'test1',
              type: true,
            }
          ]
        },
      });

      const validDefinitionExchangeString = _.merge({}, definitionExchange, {
        request: {
          parameters: [
            {
              name: 'test1',
              type: 'header',
            }
          ]
        },
      });

      const validDefinitionExchangeUndefined = _.merge({}, definitionExchange, {
        request: {
          parameters: [
            {
              name: 'test1',
            }
          ]
        },
      });

      expect(validateExchange).withArgs(invalidDefinitionExchange).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(validateExchange).withArgs(validDefinitionExchangeString).to.not.throwError();
      expect(validateExchange).withArgs(validDefinitionExchangeUndefined).to.not.throwError();

    });

    it('should throw an error if exchange.request.predicate is not a function or undefined', () => {

      const invalidDefinitionExchange = _.merge({}, definitionExchange, {
        request: {
          predicate: true
        },
      });

      const validDefinitionExchange = _.merge({}, definitionExchange, {
        request: {
          predicate: () => true
        },
      });

      expect(validateExchange).withArgs(invalidDefinitionExchange).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(validateExchange).withArgs(validDefinitionExchange).to.not.throwError();

    });

    it('should throw an error if definition.response is not an object', () => {

      const invalidDefinitionExchange = _.merge({}, definitionExchange, {
        response: '',
      });

      expect(validateExchange).withArgs(invalidDefinitionExchange).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.response does not have at least one response', () => {

      const invalidDefinitionExchange = _.assign(_.clone(definitionExchange), {
        response: []
      });

      expect(validateExchange).withArgs(invalidDefinitionExchange).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.response[<index>].indicators is not an array', () => {

      const invalidDefinitionExchange = _.assign(_.clone(definitionExchange), {
        response: [
          {
            name: 'invalid_response',
            indicators: false,
            predicate: (indicators) => true,
          },
        ]
      });
      const invalidDefinitionExchangeObject = _.assign(_.clone(definitionExchange), {
        response: [
          {
            name: 'invalid_response_object',
            indicators: {},
            predicate: (indicators) => true,
          },
        ]
      });

      expect(validateExchange).withArgs(invalidDefinitionExchange).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(validateExchange).withArgs(invalidDefinitionExchangeObject).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.response[<index>].name is not a string or undefined', () => {

      const invalidDefinitionExchange = _.assign(_.clone(definitionExchange), {
        response: [
          {
            name: false,
            indicators: [
              (response) => true,
            ],
          },
        ]
      });
      const validDefinitionExchangeString = _.assign(_.clone(definitionExchange), {
        response: [
          {
            name: 'valid_response',
            indicators: [
              (response) => true,
            ],
          },
        ]
      });
      const validDefinitionExchangeUndefined = _.assign(_.clone(definitionExchange), {
        response: [
          {
            indicators: [
              (response) => true,
            ],
          },
        ]
      });

      expect(validateExchange).withArgs(invalidDefinitionExchange).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(validateExchange).withArgs(validDefinitionExchangeString).to.not.throwError();
      expect(validateExchange).withArgs(validDefinitionExchangeUndefined).to.not.throwError();

    });

    it('should throw an error if definition.response[<indexA>].indicators does not have at least one indicator', () => {

      const invalidDefinitionExchange = _.assign(_.clone(definitionExchange), {
        response: [
          {
            name: 'invalid_response',
            indicators: [],
            predicate: (indicators) => true,
          },
        ]
      });

      expect(validateExchange).withArgs(invalidDefinitionExchange).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if exchange.response[<indexA>].indicators[<indexB>] is not a function or object', () => {

      const validDefinitionExchangeFunction = _.assign(_.clone(definitionExchange), {
        response: [
          {
            name: 'valid_response_function',
            indicators: [
              (response) => true,
            ],
            predicate: (indicators) => true,
          },
        ]
      });

      const validDefinitionExchangeObject = _.assign(_.clone(definitionExchange), {
        response: [
          {
            name: 'valid_response_object',
            indicators: [
              {
                name: 'object',
                test: (response) => true,
              },
            ],
            predicate: (indicators) => true,
          },
        ]
      });
      const invalidDefinitionExchange = _.assign(_.clone(definitionExchange), {
        response: [
          {
            name: 'invalid_response',
            indicators: [
              false,
            ],
            predicate: (indicators) => true,
          },
        ]
      });

      expect(validateExchange).withArgs(validDefinitionExchangeFunction).to.not.throwError();
      expect(validateExchange).withArgs(validDefinitionExchangeObject).to.not.throwError();
      expect(validateExchange).withArgs(invalidDefinitionExchange).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if exchange.response[<indexA>].indicators[<indexB>] is an object and does not have the keys \'test\' and \'name\'', () => {

      const validDefinitionExchange = _.assign(_.clone(definitionExchange), {
        response: [
          {
            name: 'valid_response',
            indicators: [
              {
                name: 'object',
                test: (response) => true,
              },
            ],
            predicate: (indicators) => true,
          },
        ]
      });
      const invalidDefinitionExchangeName = _.assign(_.clone(definitionExchange), {
        response: [
          {
            name: 'invalid_response',
            indicators: [
              {
                test: (response) => true,
              }
            ],
            predicate: (indicators) => true,
          },
        ]
      });
      const invalidDefinitionExchangeTest = _.assign(_.clone(definitionExchange), {
        response: [
          {
            name: 'invalid_response',
            indicators: [
              {
                name: 'object',
              }
            ],
            predicate: (indicators) => true,
          },
        ]
      });

      expect(validateExchange).withArgs(validDefinitionExchange).to.not.throwError();
      expect(validateExchange).withArgs(invalidDefinitionExchangeName).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(validateExchange).withArgs(invalidDefinitionExchangeTest).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if exchange.response[<indexA>].indicators[<indexB>] is an object and \'test\' is not a function or \'name\' is not a string', () => {

      const invalidDefinitionExchangeName = _.assign(_.clone(definitionExchange), {
        response: [
          {
            name: 'invalid_response',
            indicators: [
              {
                name: true,
                test: (response) => true,
              },
            ],
            predicate: (indicators) => true,
          },
        ]
      });
      const invalidDefinitionExchangeTest = _.assign(_.clone(definitionExchange), {
        response: [
          {
            name: 'invalid_response',
            indicators: [
              {
                name: 'object',
                test: true,
              },
            ],
            predicate: (indicators) => true,
          },
        ]
      });

      expect(validateExchange).withArgs(invalidDefinitionExchangeName).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(validateExchange).withArgs(invalidDefinitionExchangeTest).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if exchange.response[<indexA>].predicate is not a function or undefined', () => {

      const invalidDefinitionExchange = _.assign(_.clone(definitionExchange), {
        response: [
          {
            name: 'invalid_response',
            indicators: [
              (response) => true,
            ],
            predicate: false,
          },
        ]
      });
      const validDefinitionExchange = _.assign(_.clone(definitionExchange), {
        response: [
          {
            name: 'valid_response',
            indicators: [
              (response) => true,
            ],
          },
        ]
      });

      expect(validateExchange).withArgs(invalidDefinitionExchange).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(validateExchange).withArgs(validDefinitionExchange).to.not.throwError();

    });

    it('should throw an error if exchange.response[<indexA>].hook is not a function or undefined', () => {

      const invalidDefinitionExchange = _.assign(_.clone(definitionExchange), {
        response: [
          {
            name: 'invalid_response',
            indicators: [
              (response) => true,
            ],
            predicate: (indicators) => true,
            hook: false,
          },
        ]
      });

      expect(validateExchange).withArgs(invalidDefinitionExchange).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

  });

  describe('.validateStill', () => {

    it('should return the still if validation of individual components pass', () => {

      const invalidDefinitionStill = _.merge({}, definitionStill, {
        exchange: {
          response: false
        },
      });

      expect(validateStill(definitionStill)).to.eql(definitionStill);
      expect(validateStill).withArgs(definitionStill).to.not.throwError();
      expect(validateStill).withArgs(invalidDefinitionStill).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

  })

});
