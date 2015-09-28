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

    it('should throw an error if definition.type is \'collection\' and definition.iterate is not a string', () => {

      const invalidDefinitionModel = _.omit(definitionModel, 'iterate');

      expect(validateModel).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.elements is not an object', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        elements: '',
      });

      expect(validateModel).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.elements[<key>] is not a string, object, or function', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        elements: {
          url: true,
        },
      });
      const validDefinitionModel = _.merge({}, definitionModel, {
        elements: {
          url: ($) => $('div#post-list > div').eq(0).html(),
        },
      });

      expect(validateModel).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(validateModel).withArgs(validDefinitionModel).to.not.throwError();

    });

    it('should throw an error if definition.elements[<key>] is an object but definition.elements[<key>].path is not a string', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        elements: {
          url: {
            path: {},
          },
        },
      });

      expect(validateModel).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.elements[<key>] is an object but neither definition.elements[<key>].attr nor definition.elements[<key>].regex are defined', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        elements: {
          url: {
            path: 'div.url',
          },
        },
      });

      expect(validateModel).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.elements[<key>] is an object but definition.elements[<key>].attr is not a string or undefined', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        elements: {
          url: {
            path: 'div.url',
            attr: {},
          },
        },
      });
      const validDefinitionModel = _.merge({}, definitionModel, {
        elements: {
          url: {
            path: 'div.url',
            regex: /www/,
          },
        },
      });

      expect(validateModel).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(validateModel).withArgs(validDefinitionModel).to.not.throwError();

    });

    it('should throw an error if definition.elements[<key>] is an object but definition.elements[<key>].regex is not a regular expression or undefined', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        elements: {
          url: {
            path: 'div.url',
            regex: {},
          },
        },
      });
      const validDefinitionModel = _.merge({}, definitionModel, {
        elements: {
          url: {
            path: 'div.url',
            regex: /www/,
          },
        },
      });

      expect(validateModel).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(validateModel).withArgs(validDefinitionModel).to.not.throwError();

    });

    it('should throw an error if definition.validate is not a function or undefined', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        validate: '',
      });
      const validDefinitionModel = _.omit(definitionModel, 'validate');

      expect(validateModel).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(validateModel).withArgs(validDefinitionModel).to.not.throwError();

    });

    it('should throw an error if definition.format is not a function or undefined', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        format: '',
      });
      const validDefinitionModel = _.omit(definitionModel, 'format');

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

    it('should throw an error if exchange.request.parameters[<index>].validate is not a function or undefined', () => {

      const invalidDefinitionExchange = _.merge({}, definitionExchange, {
        request: {
          parameters: [
            {
              name: 'test1',
              validate: true,
            }
          ]
        },
      });

      const validDefinitionExchangeFunction = _.merge({}, definitionExchange, {
        request: {
          parameters: [
            {
              name: 'test1',
              validate: () => true,
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

    it('should throw an error if exchange.request.parameters[<index>].format is not a function or undefined', () => {

      const invalidDefinitionExchange = _.merge({}, definitionExchange, {
        request: {
          parameters: [
            {
              name: 'test1',
              format: true,
            }
          ]
        },
      });

      const validDefinitionExchangeFunction = _.merge({}, definitionExchange, {
        request: {
          parameters: [
            {
              name: 'test1',
              format: () => true,
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

    it('should throw an error if exchange.request.validate is not a function or undefined', () => {

      const invalidDefinitionExchange = _.merge({}, definitionExchange, {
        request: {
          validate: true
        },
      });

      const validDefinitionExchange = _.merge({}, definitionExchange, {
        request: {
          validate: () => true
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

    it('should throw an error if exchange.response[<key>].indicators is not an object', () => {

      const invalidDefinitionExchange = _.assign(_.clone(definitionExchange), {
        response: [
          {
            name: 'invalid_response',
            indicators: false,
            validate: (indicators) => true,
          },
        ]
      });

      expect(validateExchange).withArgs(invalidDefinitionExchange).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.response[<keyA>].indicators does not have at least one indicator', () => {

      const invalidDefinitionExchange = _.assign(_.clone(definitionExchange), {
        response: [
          {
            name: 'invalid_response',
            indicators: {},
            validate: (indicators) => true,
          },
        ]
      });

      expect(validateExchange).withArgs(invalidDefinitionExchange).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if exchange.response[<keyA>].indicators[<keyB>] is not a function', () => {

      const invalidDefinitionExchange = _.assign(_.clone(definitionExchange), {
        response: [
          {
            name: 'invalid_response',
            indicators: {
              invalid_indicator: false,
            },
            validate: (indicators) => true,
          },
        ]
      });

      expect(validateExchange).withArgs(invalidDefinitionExchange).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if exchange.response[<keyA>].validate is not a function or undefined', () => {

      const invalidDefinitionExchange = _.assign(_.clone(definitionExchange), {
        response: [
          {
            name: 'invalid_response',
            indicators: {
              valid_indicator: (response) => true,
            },
            validate: false,
          },
        ]
      });
      const validDefinitionExchange = _.assign(_.clone(definitionExchange), {
        response: [
          {
            name: 'valid_response',
            indicators: {
              valid_indicator: (response) => true,
            },
          },
        ]
      });

      expect(validateExchange).withArgs(invalidDefinitionExchange).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(validateExchange).withArgs(validDefinitionExchange).to.not.throwError();

    });

    it('should throw an error if exchange.response[<keyA>].hook is not a function or undefined', () => {

      const invalidDefinitionExchange = _.assign(_.clone(definitionExchange), {
        response: [
          {
            name: 'invalid_response',
            indicators: {
              valid_indicator: (response) => true,
            },
            validate: (indicators) => true,
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
