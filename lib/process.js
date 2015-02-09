var _ = require('lodash');
var Q = require('q');
var request = require('request').defaults({ jar: true });
var Utility = require('./utility');
var Expect = require('./expect');

var Process = function(definition, options) {
  
  if (!(this instanceof Process)) return new Process(definition, options);

  this.options = _.defaults(options || {}, { jar: request.jar() });

  if (validateDefinition(definition)) _.extend(this, definition);
  this.method = this.request.method.toLowerCase();
  
};

Process.prototype.execute = function(parameters) {

  var deferred = Q.defer();
  var self = this;
  var configuration = this._buildConfiguration(parameters);

  if (!_.isObject(parameters)) throw new Error('Process parameters must be an object.');

  request[this.method](configuration, function(error, response, html) {

    if (error) {
      
      deferred.reject(error);
      
    } else {
      
      deferred.resolve(self._generateResponse({ error: error, response: response, html: html, jar: configuration.jar }));
    
    }
    
  });

  return deferred.promise;
  
};

Process.prototype._buildConfiguration = function(parameters) {

  return {
    jar: this.options.jar,
    url: Utility.interpolate(this.request.url, generateParameters(this.request.query, parameters)),
    headers: generateParameters(this.request.headers, parameters),
    form: generateParameters(this.request.payload, parameters)
  }

};

Process.prototype._generateResponse = function(response) {

// TODO: refactor response key get
  var validResponseKey = this._getValidResponseKey(response);

  if (_.isUndefined(validResponseKey))
    return {
      error: 'No response conditions met.',
      http_code: response.response.statusCode,
      url: response.response.request.uri.href
    };
  
  return _.assign(response, {
    indicators: this._getValidResponseIndicators(this.response[validResponseKey].indicators, response),
    hook: this.response[validResponseKey].hook
  });

};

Process.prototype._getValidResponseIndicators = function(indicators, response) {

  return _.mapValues(indicators, function(indicator) {
    
    return indicator(response)
    
  })
  
};

Process.prototype._getValidResponseKey = function(response) {
  
  var self = this;

  return _.findKey(this.response, function(definition) {
    
    return self._isResponseValid(definition, response);
    
  })
  
};

Process.prototype._isResponseValid = function(definition, response) {
  
  return definition.validate(_.mapValues(definition.indicators, function(indicator) {
    
    return indicator(response)
    
  }))
  
};

var generateParameters = function(definitions, parameters) {

  var params = {};

  _(definitions).forOwn(function(definition, key) {

    params[definition.name] = generateParameter(definition, parameters[key]);

  });

  return params;

};

var generateParameter = function(definition, parameter) {

  if (!_.isUndefined(parameter))
    return parameter;

  if (!_.isUndefined(definition.default))
    return definition.default;

  if (definition.required)
    throw new Error('Required parameter \'' + definition.name + '\' missing from request.');

};

var validateDefinition = function(definition) {

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
