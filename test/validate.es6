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

  });

});
