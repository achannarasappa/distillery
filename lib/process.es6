const _ = require('lodash').mixin(require('./mixin'));
const request = require('request-promise').defaults({ jar: true });
import Expect from './expect';
import { validateProcess } from './validate';
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

const formatParameter = (parameter) => {

  if (_.isFunction(parameter.format))
    return _.assign(parameter, {
      value: parameter.format(parameter.value)
    });

  return parameter;

};

const processParameter = ({ name, alias, value, required, def, validate }) => {

  if (!_.isUndefined(value) && _.isFunction(validate) && validate(value))
    return [ name, value ];

  if (!_.isUndefined(value) && _.isFunction(validate) && !validate(value))
    throw new DistilleryValidationError('Parameter \'' + alias + '\' failed validation');

  if (!_.isUndefined(value))
    return [ name, value ];

  if (!_.isUndefined(def))
    return [ name, def ];

  if (required)
    throw new DistilleryValidationError('Required parameter \'' + alias + '\' missing from request.');

};

const generateParameters = (parameterDefinitions, parameterValues) => {

  const defaultParameters = { query: {}, form: {}, header: {} };

  if (_.isArray(parameterDefinitions))
    return _(parameterDefinitions)
      .map(createParameter(parameterValues))
      .map(defaultParameter)
      .map(formatParameter)
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

class Process {

  constructor(definition, options = {}) {

    this.options = _.defaults(options, { jar: request.jar() });

    if (validateProcess(definition))
      _.extend(this, definition);

  }

  execute(parameters) {

    const configuration = this._buildConfiguration(parameters);

    return request(configuration)
      .then(this._generateResponse(configuration.jar))

  }

  _buildConfiguration(parameters = {}) {

    if (!_.isObject(parameters))
      throw new DistilleryError('Process parameters must be an object.');

    const { query, header, form } = generateParameters(this.request.parameters, parameters);

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

      const validResponseKey = this._getValidResponseKey(response);

      if (_.isUndefined(validResponseKey))
        throw new DistilleryResponseError('No response conditions met.');

      return _.assign(response, {
        indicators: this._getValidResponseIndicators(this.response[validResponseKey].indicators, response),
        hook: this.response[validResponseKey].hook,
        jar: jar,
      });

    };

  }

  _getValidResponseIndicators(indicators, response) {

    return _.mapValues(indicators, (indicator) => indicator(response))

  }

  _getValidResponseKey(response) {

    return _.findKey(this.response, (responseDefinition) => this._isResponseValid(responseDefinition, response))

  }

  _isResponseValid(definition, response) {

    const evaluatedIndicators = _.mapValues(definition.indicators, (indicator) => indicator(response));

    if (_.isUndefined(definition.validate))
      return _.every(evaluatedIndicators, _.identity);

    return definition.validate(evaluatedIndicators)

  }

}

export default Process;
