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

const validateExchangeParameter = (parameterValue) => {

  if (!_.isPlainObject(parameterValue) && !_.isString(parameterValue))
    throw new DistilleryStillError('');

  if (_.isPlainObject(parameterValue) && !_.isString(parameterValue.name))
    throw new DistilleryStillError('');

  if (_.isPlainObject(parameterValue) && !_.isUndefined(parameterValue.required) && !_.isBoolean(parameterValue.required))
    throw new DistilleryStillError('');

  if (_.isPlainObject(parameterValue) && !_.isUndefined(parameterValue.validate) && !_.isFunction(parameterValue.validate))
    throw new DistilleryStillError('');

  if (_.isPlainObject(parameterValue) && !_.isUndefined(parameterValue.format) && !_.isFunction(parameterValue.format))
    throw new DistilleryStillError('');

  if (_.isPlainObject(parameterValue) && !_.isUndefined(parameterValue.alias) && !_.isString(parameterValue.alias))
    throw new DistilleryStillError('');

  if (_.isPlainObject(parameterValue) && !_.isUndefined(parameterValue.type) && !_.isString(parameterValue.type))
    throw new DistilleryStillError('');

};

const validateExchangeResponseIndicator = (indicatorValue) => {

  if (!_.isFunction(indicatorValue))
    throw new DistilleryStillError('');

};

const validateExchangeResponse = (responseValue) => {

  if (!_.isPlainObject(responseValue.indicators))
    throw new DistilleryStillError('');

  if (_.keys(responseValue.indicators).length < 1)
    throw new DistilleryStillError('');

  _.mapValues(responseValue.indicators, validateExchangeResponseIndicator);

  if (!_.isFunction(responseValue.validate) && !_.isUndefined(responseValue.validate))
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

const validateExchange = (definition) => {

  if (!_.isPlainObject(definition.request))
    throw new DistilleryStillError('');

  if (!_.isString(definition.request.method))
    throw new DistilleryStillError('');

  if (!_.isString(definition.request.url))
    throw new DistilleryStillError('');

  if (!_.includes([ 'get', 'head', 'post', 'put', 'patch', 'del' ], definition.request.method.toLowerCase()))
    throw new DistilleryStillError('');

  if (_.has(definition.request, 'parameters'))
    _.map(definition.request.parameters, validateExchangeParameter);

  if (!_.isFunction(definition.request.validate) && !_.isUndefined(definition.request.validate))
    throw new DistilleryStillError('');

  if (!_.isPlainObject(definition.response))
    throw new DistilleryStillError('');

  if (_.keys(definition.response).length < 1)
    throw new DistilleryStillError('');

  _.mapValues(definition.response, validateExchangeResponse);

  return definition;

};

const validateStill = (still) => ({
  exchange: validateExchange(still.exchange),
  models: _.map(still.models, validateModel),
});

export { validateModel, validateExchange, validateStill };
