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

  if (_.isPlainObject(parameterValue) && !_.isUndefined(parameterValue.transform) && !_.isFunction(parameterValue.transform))
    throw new DistilleryStillError('');

  if (_.isPlainObject(parameterValue) && !_.isUndefined(parameterValue.alias) && !_.isString(parameterValue.alias))
    throw new DistilleryStillError('');

  if (_.isPlainObject(parameterValue) && !_.isUndefined(parameterValue.type) && !_.isString(parameterValue.type))
    throw new DistilleryStillError('');

};

const validateExchangeResponseIndicator = (indicatorValue) => {

  if (!_.isFunction(indicatorValue) && !_.isPlainObject(indicatorValue))
    throw new DistilleryStillError('');

  if (_.isPlainObject(indicatorValue) && !_.has(indicatorValue, 'test'))
    throw new DistilleryStillError('');

  if (_.isPlainObject(indicatorValue) && !_.has(indicatorValue, 'name'))
    throw new DistilleryStillError('');

  if (_.isPlainObject(indicatorValue) && !_.isFunction(indicatorValue.test))
    throw new DistilleryStillError('');

  if (_.isPlainObject(indicatorValue) && !_.isString(indicatorValue.name))
    throw new DistilleryStillError('');

};

const validateExchangeResponse = (responseValue) => {

  if (!_.isUndefined(responseValue.name) && !_.isString(responseValue.name))
    throw new DistilleryStillError('');

  if (!_.isArray(responseValue.indicators))
    throw new DistilleryStillError('');

  if (responseValue.indicators < 1)
    throw new DistilleryStillError('');

  _.map(responseValue.indicators, validateExchangeResponseIndicator);

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

  if (definition.type === 'collection' && !_.isString(definition.collectionPath))
    throw new DistilleryStillError('');

  if (!_.isPlainObject(definition.properties))
    throw new DistilleryStillError('');

  _.mapValues(definition.properties, validateModelElement);

  if (!_.isFunction(definition.validate) && !_.isUndefined(definition.validate))
    throw new DistilleryStillError('');

  if (!_.isFunction(definition.transform) && !_.isUndefined(definition.transform))
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

  if (!_.isArray(definition.response))
    throw new DistilleryStillError('');

  if (definition.response.length < 1)
    throw new DistilleryStillError('');

  _.map(definition.response, validateExchangeResponse);

  return definition;

};

const validateStill = (still) => ({
  exchange: validateExchange(still.exchange),
  models: _.map(still.models, validateModel),
});

export { validateModel, validateExchange, validateStill };
