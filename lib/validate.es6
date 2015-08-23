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

const validateProcessParameter = (parameterValue) => {

  if (!_.isString(parameterValue.name))
    throw new DistilleryStillError('');

  if (!_.isUndefined(parameterValue.required) && !_.isBoolean(parameterValue.required))
    throw new DistilleryStillError('');

  if (!_.isUndefined(parameterValue.validate) && !_.isFunction(parameterValue.validate))
    throw new DistilleryStillError('');

  if (!_.isUndefined(parameterValue.format) && !_.isFunction(parameterValue.format))
    throw new DistilleryStillError('');

};

const validateProcessResponseIndicator = (indicatorValue) => {

  if (!_.isFunction(indicatorValue))
    throw new DistilleryStillError('');

};

const validateProcessResponse = (responseValue) => {

  if (!_.isPlainObject(responseValue.indicators))
    throw new DistilleryStillError('');

  if (_.keys(responseValue.indicators).length < 1)
    throw new DistilleryStillError('');

  _.mapValues(responseValue.indicators, validateProcessResponseIndicator);

  if (!_.isFunction(responseValue.validate))
    throw new DistilleryStillError('');

  if (!_.isFunction(responseValue.hook) && !_.isUndefined(responseValue.hook))
    throw new DistilleryStillError('');

};

const validateModel = (definition) => {

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

};

const validateProcess = (definition) => {

  if (!_.isPlainObject(definition.request))
    throw new DistilleryStillError('');

  if (!_.includes([ 'get', 'head', 'post', 'put', 'patch', 'del' ], definition.request.method.toLowerCase()))
    throw new DistilleryStillError('');

  if (_.has(definition.request, 'query'))
    _.mapValues(definition.request.query, validateProcessParameter);

  if (_.has(definition.request, 'headers'))
    _.mapValues(definition.request.headers, validateProcessParameter);

  if (_.has(definition.request, 'payload'))
    _.mapValues(definition.request.payload, validateProcessParameter);

  if (!_.isPlainObject(definition.response))
    throw new DistilleryStillError('');

  if (_.keys(definition.response).length < 1)
    throw new DistilleryStillError('');

  _.mapValues(definition.response, validateProcessResponse);

  return definition;

};

export { validateModel, validateProcess };
