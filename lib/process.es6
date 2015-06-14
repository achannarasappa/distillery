var _ = require('lodash');
var request = require('request-promise').defaults({ jar: true });
var Utility = require('./utility');
var Expect = require('./expect');

class Process {

  constructor(definition, options) {

    this.options = _.defaults(options || {}, { jar: request.jar() });

    if (validateDefinition(definition))
      _.extend(this, definition);

  }

  execute(parameters) {

    var configuration = this._buildConfiguration(parameters);

    return request(configuration)
      .then(this._generateResponse(configuration.jar))

  }

  _buildConfiguration(parameters) {

    parameters = parameters || {};

    if (!_.isObject(parameters))
      throw new Error('Process parameters must be an object.');

    return {
      method: this.request.method.toUpperCase(),
      jar: this.options.jar,
      url: Utility.interpolateString(this.request.url, generateParameters(this.request.query, parameters)),
      headers: generateParameters(this.request.headers, parameters),
      form: generateParameters(this.request.payload, parameters),
      resolveWithFullResponse: true,
      simple: false
    }

  }

  _generateResponse(jar) {

    var self = this;

    return (response) => {

      var validResponseKey = self._getValidResponseKey(response);

      if (_.isUndefined(validResponseKey))
        return {
          error: 'No response conditions met.',
          http_code: response.statusCode,
          url: response.request.uri.href
        };

      return _.assign(response, {
        indicators: self._getValidResponseIndicators(self.response[validResponseKey].indicators, response),
        hook: self.response[validResponseKey].hook,
        jar: jar
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

    var evaluatedIndicators = _.mapValues(definition.indicators, (indicator) => indicator(response));

    return definition.validate(evaluatedIndicators)

  }

}

var generateParameters = (definitions, parameters) => {

  return _.chain(definitions)
    .pairs()
    .map((definition) => [ definition[1].name, generateParameter(definition[1], parameters[definition[0]]) ])
    .zipObject()
    .omit(_.isUndefined)
    .value();

};

var generateParameter = (definition, parameter) => {

  if (!_.isUndefined(parameter))
    return parameter;

  if (!_.isUndefined(definition.default))
    return definition.default;

  if (definition.required)
    throw new Error('Required parameter \'' + definition.name + '\' missing from request.');

};

var validateDefinition = (definition) => {

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

module.exports = Process;
