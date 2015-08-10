const _ = require('lodash').mixin(require('./mixin'));
const request = require('request-promise').defaults({ jar: true });
import Expect from './expect';

const generateParameters = (parameterDefinitions, parameterValues) => _(parameterDefinitions)
    .pairs()
    .map(([parameterName, parameterDefinition]) => [ parameterDefinition.name, generateParameter(parameterDefinition.name, parameterDefinition.required, parameterDefinition.default, parameterValues[parameterName]) ])
    .zipObject()
    .omit(_.isUndefined)
    .value();

const generateParameter = (parameterName, parameterRequired, parameterDefault, parameterValue) => {

  if (!_.isUndefined(parameterValue))
    return parameterValue;

  if (!_.isUndefined(parameterDefault))
    return parameterDefault;

  if (parameterRequired)
    throw new Error('Required parameter \'' + parameterName + '\' missing from request.');

};

class Process {

  constructor(definition, options = {}) {

    this.options = _.defaults(options, { jar: request.jar() });

    if (validateDefinition(definition))
      _.extend(this, definition);

  }

  execute(parameters) {

    const configuration = this._buildConfiguration(parameters);

    return request(configuration)
      .then(this._generateResponse(configuration.jar))

  }

  _buildConfiguration(parameters = {}) {

    const configuration = {
      method: this.request.method.toUpperCase(),
      jar: this.options.jar,
      url: _.interpolate(this.request.url, generateParameters(this.request.query, parameters)),
      headers: generateParameters(this.request.headers, parameters),
      form: generateParameters(this.request.payload, parameters),
      resolveWithFullResponse: true,
      simple: false,
    };

    if (!_.isObject(parameters))
      throw new Error('Process parameters must be an object.');

    if (_.isObject(this.options.requestOptions))
      return _.defaults(this.options.requestOptions, configuration);

    return configuration;

  }

  _generateResponse(jar) {

    return (response) => {

      const validResponseKey = this._getValidResponseKey(response);

      if (_.isUndefined(validResponseKey))
        return {
          error: 'No response conditions met.',
          http_code: response.statusCode,
          url: response.request.uri.href,
        };

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

    return definition.validate(evaluatedIndicators)

  }

}

const validateDefinition = (definition) => {

  if (!_.isObject(definition))
    throw new Error('Process definition is ' + (typeof definition) + ' expecting object.');

  if (!_.isObject(definition.request))
    throw new Error('Process definition.request is ' + (typeof definition.request) + ' expecting object.');

  if (!_.isString(definition.request.method))
    throw new Error('Process definition.request.method is ' + (typeof definition.request.method) + ' expecting string.');

  if (definition.request.method.toLowerCase() !== 'get' && definition.request.method.toLowerCase() !== 'post')
    throw new Error('Process definition.request.method expects \'get\' or \'post\'.');

  _.map([ 'query', 'payload', 'header' ], function(type) {

    if (!_.isUndefined(definition.request[type])) {

      if (!_.isObject(definition.request[type]))
        throw new Error('Process definition.request.' + type + ' is ' + (typeof definition.request[type]) + ' expecting object.');

      _.forOwn(definition.request[type], function(param, key) {

        if (!_.isString(param.name))
          throw new Error('Process definition.request.' + type + '.' + key + '.name is ' + (typeof param.name) + ' expecting string.');

        if (!_.isUndefined(param.required) && !_.isBoolean(param.required))
          throw new Error('Process definition.request.' + type + '.' + key + '.required is ' + (typeof param.required) + ' expecting boolean.');

        if (!_.isUndefined(param.default) && !_.isString(param.default))
          throw new Error('Process definition.request.' + type + '.' + key + '.default is ' + (typeof param.default) + ' expecting string.');

      });

    }

  });

  if (!_.isObject(definition.response))
    throw new Error('Process definition.response is ' + (typeof definition.response) + ' expecting object.');

  _.forOwn(definition.response, function(response, resKey) {

    if (!_.isObject(response))
      throw new Error('Process definition.response.' + resKey + ' is ' + (typeof response) + ' expecting object.');

    if (!_.isObject(response.indicators))
      throw new Error('Process definition.response.' + resKey + '.indicators is ' + (typeof response.indicators) + ' expecting object.');

    _.forOwn(response.indicators, function(indicator, indKey) {

      if (!_.isFunction(indicator))
        throw new Error('Process definition.response.' + resKey + '.indicators.' + indKey + ' is ' + (typeof indicator) + ' expecting function.');

      if (_.has(Expect, indicator))
        throw new Error('Process definition.response.' + resKey + '.indicators.' + indKey + ' of is not a supported expectation.');

    });

    if (!_.isFunction(response.validate))
      throw new Error('Model definition.response.' + resKey + '.validate is ' + (typeof response.validate) + ' expecting function.');

  });

  return true;

};

export default Process;
