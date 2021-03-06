const _ = require('lodash').mixin(require('./mixin'));
const tough = require('tough-cookie');
const fetch = require('node-fetch');
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

  const defaultParameters = { query: {}, header: {} };

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

    this.options = _.defaults(options, { jar: new tough.CookieJar() });

    if (validateExchange(definition))
      _.extend(this, definition);

  }

  execute(parameters) {

    const requestArguments = this._buildRequestArguments(parameters);
    const request = new fetch.Request(...requestArguments);

    return fetch(...requestArguments)
      .then(this._generateResponse(request))

  }

  _buildRequestArguments(parameters = {}) {

    if (!_.isObject(parameters))
      throw new DistilleryError('Exchange parameters must be an object.');

    const { query, header, form } = generateParameters(this.request.parameters, parameters, this.request.predicate);
    const url = _.interpolate(this.request.url, query);
    const init = {
      method: this.request.method,
      headers: _.assign(header, _.pick({ cookie: this.options.jar.getCookieStringSync(url) }, _.identity)),
      body: _.formUrlEncode(form),
    };

    if (_.isObject(this.options.requestOptions))
      return [ url, _.defaults(this.options.requestOptions, init) ];

    return [ url, init ];

  }

  _generateResponse(request) {

    return (response) => {

      return response.text()
        .then((bodyText) =>  _.assign(response, { bodyText }))
        .then((response) => {

          const validResponse = this._getValidResponse(response);

          if (_.isUndefined(validResponse))
            throw new DistilleryResponseError('No response conditions met.');

          return {
            response,
            request,
            jar: this.options.jar,
            still: {
              indicators: this._getValidResponseIndicators(validResponse.indicators, response),
              hook: validResponse.hook,
            },
          };

        });
    }

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
