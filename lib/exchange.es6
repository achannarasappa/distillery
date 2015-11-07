const _ = require('lodash').mixin(require('./mixin'));
const request = require('request-promise').defaults({ jar: true });
import Expect from './expect';
import { validateExchange } from './validate';
import { DistilleryValidationError, DistilleryResponseError, DistilleryError } from './error';

const createParameter = _.curry((parameterValues, parameterDefinition) => {

  if (_.isString(parameterDefinition))
    return {
      name: parameterDefinition,
      alias: parameterDefinition,
      value: parameterValues[parameterDefinition],
    };

  if (_.isString(parameterDefinition.alias))
    return _.assign(parameterDefinition, {
      value: parameterValues[parameterDefinition.alias],
    });

  return _.assign(parameterDefinition, {
    alias: parameterDefinition.name,
    value: parameterValues[parameterDefinition.name],
  });

});

const defaultParameter = (parameter) => {

  if (!_.isString(parameter.type))
    return _.assign(parameter, {
      type: 'query'
    });

  return parameter;

};

const transformParameter = (parameter) => {

  if (_.isFunction(parameter.transform) && !_.isUndefined(parameter.value))
    return _.assign(parameter, {
      value: parameter.transform(parameter.value)
    });

  return parameter;

};

const processParameter = ({ name, alias, value, required, def, predicate }) => {

  if (!_.isUndefined(value) && _.isFunction(predicate) && predicate(value))
    return [ name, value ];

  if (!_.isUndefined(value) && _.isFunction(predicate) && !predicate(value))
    throw new DistilleryValidationError('Parameter \'' + alias + '\' failed validation');

  if (!_.isUndefined(value))
    return [ name, value ];

  if (!_.isUndefined(def))
    return [ name, def ];
  
  if (required)
    throw new DistilleryValidationError('Required parameter \'' + alias + '\' missing from request.');

};

const validateParameters = _.curry((predicateFn, parameters) => {

  const combinedParameters = _.reduce(parameters, (transformedParameters, parameter) => _.assign(transformedParameters, {
    [parameter.alias ? parameter.alias : parameter.name]: parameter.value,
  }), {});

  if (_.isFunction(predicateFn) && !predicateFn(combinedParameters))
    throw new DistilleryValidationError('Combined parameter validation failed.');

  return parameters;

});

const generateParameters = (parameterDefinitions, parameterValues, predicateFn) => {

  const defaultParameters = { query: {}, form: {}, header: {} };

  if (_.isArray(parameterDefinitions))
    return _(parameterDefinitions)
      .map(createParameter(parameterValues))
      .map(defaultParameter)
      .map(transformParameter)
      .thru(validateParameters(predicateFn))
      .groupBy('type')
      .mapValues((parameters) => _(parameters)
        .map(processParameter)
        .reject(_.isUndefined)
        .zipObject()
        .value())
      .defaults(defaultParameters)
      .value();

  return defaultParameters;

};

class Exchange {

  constructor(definition, options = {}) {

    this.options = _.defaults(options, { jar: request.jar() });

    if (validateExchange(definition))
      _.extend(this, definition);

  }

  execute(parameters) {

    const configuration = this._buildConfiguration(parameters);

    return request(configuration)
      .then(this._generateResponse(configuration.jar))

  }

  _buildConfiguration(parameters = {}) {

    if (!_.isObject(parameters))
      throw new DistilleryError('Exchange parameters must be an object.');

    const { query, header, form } = generateParameters(this.request.parameters, parameters, this.request.predicate);

    const configuration = {
      method: this.request.method.toUpperCase(),
      jar: this.options.jar,
      url: _.interpolate(this.request.url, query),
      headers: header,
      form,
      resolveWithFullResponse: true,
      simple: false,
    };

    if (_.isObject(this.options.requestOptions))
      return _.defaults(this.options.requestOptions, configuration);

    return configuration;

  }

  _generateResponse(jar) {

    return (response) => {

      const validResponse = this._getValidResponse(response);

      if (_.isUndefined(validResponse))
        throw new DistilleryResponseError('No response conditions met.');

      return _.assign(response, {
        indicators: this._getValidResponseIndicators(validResponse.indicators, response),
        hook: validResponse.hook,
        jar: jar,
      });

    };

  }

  _getValidResponseIndicators(indicators, response) {

    return _.mapValues(indicators, (indicator) => indicator(response))

  }

  _getValidResponse(response) {

    return _.find(this.response, (responseDefinition) => this._isResponseValid(responseDefinition, response))

  }

  _isResponseValid(definition, response) {

    const evaluatedIndicators = _.reduce(definition.indicators, (acc, indicator, index) => {

      if (_.isFunction(indicator))
        return _.assign({}, acc, {
          [index]: indicator(response)
        });

      return _.assign({}, acc, {
        [indicator.name]: indicator.test(response)
      })

    }, {});

    if (_.isUndefined(definition.predicate))
      return _.every(evaluatedIndicators, _.identity);

    return definition.predicate(evaluatedIndicators)

  }

}

export default Exchange;
