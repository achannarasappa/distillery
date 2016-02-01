const _ = require('lodash').mixin(require('../mixin'));
const fs = require('fs');
const path = require('path');
const request = require('request-promise').defaults({ jar: true });
const chalk = require('chalk');
const Table = require('cli-table');
import Exchange from '../exchange';

const cliStyleTable = { head: [ 'blue' ] };

const replaceUndefinedMap = (array) => _.map(array, (value) => _.replaceUndefined(chalk.yellow('undefined'), value));

const booleanToCheck = (value) => (value ? chalk.green('\u2713') : chalk.red('\u2717'));

const saveFile = (relativePath, html) => {

  const absolutePath = path.resolve(process.cwd(), relativePath);

  return fs.writeFile(absolutePath, html);

};

const getCookieString = (jar, url) => jar.getCookies(url).toString();

const getResponseAnalysis = _.curry((response, validResponse, stillResponse) => {

  const isValidResponse = _.has(stillResponse, 'name') ? (validResponse === stillResponse.name) : (validResponse === stillResponse.index);
  const validResponseKey = _.has(stillResponse, 'name') ? stillResponse.name : stillResponse.index;

  return _(stillResponse.indicators)
    .pairs()
    .map(getIndicatorAnalysis(response, isValidResponse, validResponseKey))
    .map(replaceUndefinedMap)
    .value()

});

const getIndicatorAnalysis = _.curry((response, validResponse, stillResponseKey, [stillIndicatorKey, stillIndicator]) => {

  const indicator = _.isFunction(stillIndicator) ? stillIndicator(response, true) : stillIndicator.test(response, true);

  if (!_.isPlainObject(indicator) || !_.has(indicator, 'name') || !_.has(indicator, 'valid') || !_.has(indicator, 'actual'))
    return [
      booleanToCheck(validResponse),
      stillResponseKey,
      booleanToCheck(indicator),
      'custom',
      '',
      '',
      indicator,
    ];

  return [
    booleanToCheck(validResponse),
    stillResponseKey,
    booleanToCheck(indicator),
    indicator.name,
    stillIndicatorKey,
    indicator.expected,
    indicator.actual,
  ]

});

const addResponseIndexes = (definition) => _.assign(definition, {
  response: _.reduce(definition.response, (responsesIndexed, response, index) => responsesIndexed.concat(_.assign(response, { index })), []),
});

const getValidResponseKey = (validResponse) => {

  if (_.has(validResponse, 'name'))
    return validResponse.name;

  if (_.has(validResponse, 'index'))
    return validResponse.index;

  return validResponse;

};

class IgniteExchange extends Exchange {

  constructor(definition, options = {}) {

    super(definition, options);

    this.options = _.defaults(options, {
      jar: request.jar(),
      indicators: true,
      save_html: false,
      save_cookie: false,
      restore_cookie: false,
    });

    _.extend(this, addResponseIndexes(definition));

    if (options.restore_cookie) {

      const cookie = fs.readFileSync(this.options.restore_cookie, 'utf8');
      this.options.jar.setCookie(cookie, this.request.url);

    }

  }

  _generateResponse(jar) {

    return (response) => {

      const validResponse = this._getValidResponse(response);
      const validResponseKey = getValidResponseKey(validResponse);
      const summaryAnalysisTable = this._buildSummaryAnalysisTable(response, validResponseKey);
      const summaryTable = this._buildSummaryTable(response.statusCode, response.request.uri.href, validResponseKey);

      if (this.options.save_html)
        saveFile(this.options.save_html, response.bodyText);

      if (this.options.save_cookie)
        saveFile(this.options.save_cookie, getCookieString(jar, this.request.url));

      console.log(summaryAnalysisTable);
      console.log(summaryTable);

      return super._generateResponse(jar)(response)

    }

  }

  _buildSummaryAnalysisTable(response, validResponse) {

    const table = new Table({
      head: [
        '',
        'Response Key',
        '',
        'Type',
        'Indicator',
        'Expected',
        'Actual',
      ],
      style: cliStyleTable,
    });
    const rows = this._getSummaryAnalysis(response, validResponse);

    table.push(...rows);

    return table.toString()

  }

  _getSummaryAnalysis(response, validResponse) {

    return _(this.response)
      .map(getResponseAnalysis(response, validResponse))
      .reduce((responses, response) => responses.concat(response), []);

  }

  _buildSummaryTable(status, url, key) {

    const table = new Table({ style: cliStyleTable });
    const rows = [
      {
        'Status Code': status,
      },
      {
        URL: url,
      },
      {
        'Response Key': _.replaceUndefined(chalk.red('No match'), key),
      },
    ];

    table.push(...rows);

    return table.toString();

  }

}

export default IgniteExchange;
