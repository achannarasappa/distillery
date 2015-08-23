const _ = require('lodash');
import { DistilleryStillError } from './error';

const validateModelElement = (elementValue) => {

  if (!_.isString(elementValue) && !_.isPlainObject(elementValue) && !_.isFunction(elementValue))
    throw new DistilleryStillError('');

  if (_.isPlainObject(elementValue) && !_.isString(elementValue.path))
    throw new DistilleryStillError('');

  if (_.isPlainObject(elementValue) && _.isUndefined(elementValue.attr) && _.isUndefined(elementValue.regex))
    throw new DistilleryStillError('');

  if (_.isPlainObject(elementValue) && !_.isUndefined(elementValue.attr) && !_.isString(elementValue.attr))
    throw new DistilleryStillError('');

  if (_.isPlainObject(elementValue) && !_.isUndefined(elementValue.regex) && !_.isRegExp(elementValue.regex))
    throw new DistilleryStillError('');

};

const Validate = {
  model: (definition) => {

    if (!_.isString(definition.name))
      throw new DistilleryStillError('');

    if (!_.isString(definition.type))
      throw new DistilleryStillError('');

    if (!_.includes([ 'collection', 'item' ], definition.type))
      throw new DistilleryStillError('');

    if (definition.type === 'collection' && !_.isString(definition.iterate))
      throw new DistilleryStillError('');

    if (!_.isPlainObject(definition.elements))
      throw new DistilleryStillError('');

    _.mapValues(definition.elements, validateModelElement);

    if (!_.isFunction(definition.validate) && !_.isUndefined(definition.validate))
      throw new DistilleryStillError('');

    if (!_.isFunction(definition.format) && !_.isUndefined(definition.format))
      throw new DistilleryStillError('');

    return definition;

  },
  process: (definition) => {}
};

export default Validate;