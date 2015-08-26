const _ = require('lodash').mixin(require('./mixin'));
const request = require('request-promise').defaults({ jar: true });
import Expect from './expect';
import { validateProcess } from './validate';
import { DistilleryValidationError } from './error';

const generateParameters = (parameterDefinitions, parameterValues) => _(parameterDefinitions)
  .pairs()
  .map(([parameterName, parameterDefinition]) => {

    if (_.has(parameterDefinition, 'format'))
      return [ parameterName, parameterDefinition, parameterDefinition.format(parameterValues[parameterName]) ];

    return [ parameterName, parameterDefinition, parameterValues[parameterName] ];

  })
  .map(([parameterName, parameterDefinition, parameterValue]) => [ parameterDefinition.name, generateParameter(parameterDefinition.name, parameterDefinition.required, parameterDefinition.default, parameterValue, parameterDefinition.validate) ])
  .zipObject()
  .omit(_.isUndefined)
  .value();

const generateParameter = (parameterName, parameterRequired, parameterDefault, parameterValue, parameterValidation) => {

  if (!_.isUndefined(parameterValue) && _.isFunction(parameterValidation) && parameterValidation(parameterValue))
    return parameterValue;

  if (!_.isUndefined(parameterValue) && _.isFunction(parameterValidation) && !parameterValidation(parameterValue))
    throw new DistilleryValidationError('Parameter \'' + parameterName + '\' failed validation');

  if (!_.isUndefined(parameterValue))
    return parameterValue;

  if (!_.isUndefined(parameterDefault))
    return parameterDefault;

  if (parameterRequired)
    throw new DistilleryValidationError('Required parameter \'' + parameterName + '\' missing from request.');

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

    if (_.isUndefined(definition.validate))
      return _.every(evaluatedIndicators, _.identity);

    return definition.validate(evaluatedIndicators)

  }

}

export default Process;
