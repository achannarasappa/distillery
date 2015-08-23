const _ = require('lodash');
const expect = require('expect.js');
import * as fixtures from './fixtures';
import Validate from '../lib/validate';
import Distillery from '../lib/distillery';
import { DistilleryStillError } from '../lib/error';

describe('Validate', () => {

  const distillery = new Distillery(fixtures.still.auctions);
  const definitionProcess = distillery.still.process;
  const definitionModel = distillery.still.models[0];

  describe('.model', () => {

    it('should return the input if no errors are thrown', () => {

      expect(Validate.model(definitionModel)).to.eql(definitionModel);

    });

    it('should throw an error if definition.name is not a string', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        name: {},
      });

      expect(Validate.model).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.type is not a string', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        type: {},
      });

      expect(Validate.model).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.type is not \'collection\' or \'item\'', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        type: 'item1',
      });

      expect(Validate.model).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.type is \'collection\' and definition.iterate is not a string', () => {

      const invalidDefinitionModel = _.omit(definitionModel, 'iterate');

      expect(Validate.model).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.elements is not an object', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        elements: '',
      });

      expect(Validate.model).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

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

      expect(Validate.model).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(Validate.model).withArgs(validDefinitionModel).to.not.throwError();

    });

    it('should throw an error if definition.elements[<key>] is an object but definition.elements[<key>].path is not a string', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        elements: {
          url: {
            path: {},
          },
        },
      });

      expect(Validate.model).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.elements[<key>] is an object but neither definition.elements[<key>].attr nor definition.elements[<key>].regex are defined', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        elements: {
          url: {
            path: 'div.url',
          },
        },
      });

      expect(Validate.model).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.elements[<key>] is an object but definition.elements[<key>].attr is not a string or undefined', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        elements: {
          url: {
            path: 'div.url',
            attr: {}
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

      expect(Validate.model).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(Validate.model).withArgs(validDefinitionModel).to.not.throwError();

    });

    it('should throw an error if definition.elements[<key>] is an object but definition.elements[<key>].regex is not a regular expression or undefined', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        elements: {
          url: {
            path: 'div.url',
            regex: {}
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

      expect(Validate.model).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(Validate.model).withArgs(validDefinitionModel).to.not.throwError();

    });

    it('should throw an error if definition.validate is not a function or undefined', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        validate: '',
      });
      const validDefinitionModel = _.omit(definitionModel, 'validate');

      expect(Validate.model).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(Validate.model).withArgs(validDefinitionModel).to.not.throwError();

    });

    it('should throw an error if definition.format is not a function or undefined', () => {

      const invalidDefinitionModel = _.merge({}, definitionModel, {
        format: '',
      });
      const validDefinitionModel = _.omit(definitionModel, 'format');

      expect(Validate.model).withArgs(invalidDefinitionModel).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));
      expect(Validate.model).withArgs(validDefinitionModel).to.not.throwError();

    });

  });

  describe('.process', () => {

    it('should return the input if no errors are thrown', () => {

      expect(Validate.process(definitionProcess)).to.eql(definitionProcess);

    });

    it('should throw an error if definition.request is not an object', () => {

      const invalidDefinitionProcess = _.merge({}, definitionProcess, {
        request: '',
      });

      expect(Validate.process).withArgs(invalidDefinitionProcess).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.request.method is not \'GET\', \'POST\', \'PATCH\', \'PUT\', \'DEL\', or \'HEAD\'', () => {

      const invalidDefinitionProcess = _.merge({}, definitionProcess, {
        request: {
          method: 'post1'
        },
      });

      expect(Validate.process).withArgs(invalidDefinitionProcess).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if process.request.query[<key>].name is not a string', () => {

      const invalidDefinitionProcess = _.merge({}, definitionProcess, {
        request: {
          query: {
            test: {
              name: true
            }
          }
        },
      });

      expect(Validate.process).withArgs(invalidDefinitionProcess).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if process.request.query[<key>].required is not a boolean or undefined', () => {

      const invalidDefinitionProcess = _.merge({}, definitionProcess, {
        request: {
          query: {
            test: {
              name: 'test1',
              required: 'true',
            },
          },
        },
      });

      expect(Validate.process).withArgs(invalidDefinitionProcess).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if process.request.query[<key>].validate is not a function or undefined', () => {

      const invalidDefinitionProcess = _.merge({}, definitionProcess, {
        request: {
          query: {
            test: {
              name: 'test1',
              validate: true,
            },
          },
        },
      });

      expect(Validate.process).withArgs(invalidDefinitionProcess).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if process.request.query[<key>].format is not a function or undefined', () => {

      const invalidDefinitionProcess = _.merge({}, definitionProcess, {
        request: {
          query: {
            test: {
              name: 'test1',
              format: true,
            },
          },
        },
      });

      expect(Validate.process).withArgs(invalidDefinitionProcess).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if process.request.headers[<key>].name is not a string', () => {

      const invalidDefinitionProcess = _.merge({}, definitionProcess, {
        request: {
          headers: {
            test: {
              name: true
            }
          }
        },
      });

      expect(Validate.process).withArgs(invalidDefinitionProcess).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if process.request.headers[<key>].required is not a boolean or undefined', () => {

      const invalidDefinitionProcess = _.merge({}, definitionProcess, {
        request: {
          headers: {
            test: {
              name: 'test1',
              required: 'true',
            },
          },
        },
      });

      expect(Validate.process).withArgs(invalidDefinitionProcess).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if process.request.headers[<key>].validate is not a function or undefined', () => {

      const invalidDefinitionProcess = _.merge({}, definitionProcess, {
        request: {
          headers: {
            test: {
              name: 'test1',
              validate: true,
            },
          },
        },
      });

      expect(Validate.process).withArgs(invalidDefinitionProcess).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if process.request.headers[<key>].format is not a function or undefined', () => {

      const invalidDefinitionProcess = _.merge({}, definitionProcess, {
        request: {
          headers: {
            test: {
              name: 'test1',
              format: true,
            },
          },
        },
      });

      expect(Validate.process).withArgs(invalidDefinitionProcess).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });it('should throw an error if process.request.headers[<key>].name is not a string', () => {

      const invalidDefinitionProcess = _.merge({}, definitionProcess, {
        request: {
          headers: {
            test: {
              name: true
            }
          }
        },
      });

      expect(Validate.process).withArgs(invalidDefinitionProcess).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if process.request.payload[<key>].required is not a boolean or undefined', () => {

      const invalidDefinitionProcess = _.merge({}, definitionProcess, {
        request: {
          payload: {
            test: {
              name: 'test1',
              required: 'true',
            },
          },
        },
      });

      expect(Validate.process).withArgs(invalidDefinitionProcess).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if process.request.payload[<key>].validate is not a function or undefined', () => {

      const invalidDefinitionProcess = _.merge({}, definitionProcess, {
        request: {
          payload: {
            test: {
              name: 'test1',
              validate: true,
            },
          },
        },
      });

      expect(Validate.process).withArgs(invalidDefinitionProcess).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if process.request.payload[<key>].format is not a function or undefined', () => {

      const invalidDefinitionProcess = _.merge({}, definitionProcess, {
        request: {
          payload: {
            test: {
              name: 'test1',
              format: true,
            },
          },
        },
      });

      expect(Validate.process).withArgs(invalidDefinitionProcess).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.response is not an object', () => {

      const invalidDefinitionProcess = _.merge({}, definitionProcess, {
        response: '',
      });

      expect(Validate.process).withArgs(invalidDefinitionProcess).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.response does not have at least one response', () => {

      const invalidDefinitionProcess = _.merge({}, definitionProcess, {
        response: {},
      });

      expect(Validate.process).withArgs(invalidDefinitionProcess).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if process.response[<key>].indicators is not an object', () => {

      const invalidDefinitionProcess = _.merge({}, definitionProcess, {
        response: {
          invalid_response: {
            indicators: false,
            validate: (indicators) => true,
          },
        },
      });

      expect(Validate.process).withArgs(invalidDefinitionProcess).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if definition.response[<keyA>].indicators does not have at least one indicator', () => {

      const invalidDefinitionProcess = _.merge({}, definitionProcess, {
        response: {
          valid_response: {
            indicators: {},
            validate: (indicators) => true,
          },
        },
      });

      expect(Validate.process).withArgs(invalidDefinitionProcess).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if process.response[<keyA>].indicators[<keyB>] is not a function', () => {

      const invalidDefinitionProcess = _.merge({}, definitionProcess, {
        response: {
          valid_response: {
            indicators: {
              invalid_indicator: false,
            },
            validate: (indicators) => true,
          },
        },
      });

      expect(Validate.process).withArgs(invalidDefinitionProcess).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if process.response[<keyA>].validate is not a function', () => {

      const invalidDefinitionProcess = _.merge({}, definitionProcess, {
        response: {
          valid_response: {
            indicators: {
              valid_indicator: (response) => true,
            },
            validate: false
          },
        },
      });

      expect(Validate.process).withArgs(invalidDefinitionProcess).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

    it('should throw an error if process.response[<keyA>].hook is not a function or undefined', () => {

      const invalidDefinitionProcess = _.merge({}, definitionProcess, {
        response: {
          valid_response: {
            indicators: {
              valid_indicator: (response) => true,
            },
            validate: (indicators) => true,
            hook: false
          },
        },
      });

      expect(Validate.process).withArgs(invalidDefinitionProcess).to.throwError((error) => expect(error).to.be.a(DistilleryStillError));

    });

  });

});
