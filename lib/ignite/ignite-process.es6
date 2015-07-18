const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const request = require('request-promise').defaults({ jar: true });
const chalk = require('chalk');
const Table = require('cli-table');
const Utility = require('../utility');
const Process = require('../process');

const cliStyleTable = { head: [ 'blue' ] };

class IgniteProcess extends Process {

  constructor(definition, options={}) {

    super(definition, options);

    this.options = _.defaults(options, {
      jar: request.jar(),
      indicators: true,
      save_html: false,
      save_cookie: false,
      restore_cookie: false
    });

    _.extend(this, definition);

    if (options.restore_cookie) {

      const cookie = fs.readFileSync(this.options.restore_cookie, 'utf8');
      this.options.jar.setCookie(cookie, this.request.url);

    }

  }

  _generateResponse(jar) {

    return (response) => {

      const validResponseKey = this._getValidResponseKey(response);
      const summaryAnalysisTable = this._buildSummaryAnalysisTable(response, validResponseKey);
      const summaryTable = this._buildSummaryTable(response.statusCode, response.request.uri.href, validResponseKey);

      if (this.options.save_html)
        saveFile(this.options.save_html, response.body);

      if (this.options.save_cookie)
        saveFile(this.options.save_cookie, getCookieString(jar, this.request.url));

      console.log(summaryAnalysisTable);
      console.log(summaryTable);

      return super._generateResponse(jar)(response)

    }

  }

  _buildSummaryAnalysisTable(response, validResponseKey) {

    const table = new Table({
      head: [
        '',
        'Response Key',
        '',
        'Type',
        'Indicator',
        'Expected',
        'Actual'
      ],
      style: cliStyleTable
    });
    const rows = this._getSummaryAnalysis(response, validResponseKey);

    table.push(...rows);

    return table.toString()

  }

  _getSummaryAnalysis(response, validResponseKey) {

    return _(this.response)
      .pairs()
      .map(getResponseAnalysis(response, validResponseKey))
      .reduce((responses, response) => responses.concat(response), []);

  }

  _buildSummaryTable(status, url, key) {

    const table = new Table({ style: cliStyleTable });
    const rows = [
      {
        'Status Code': status
      },
      {
        URL: url
      },
      {
        'Response Key': Utility.replaceUndefined(chalk.red('No match'), key)
      }
    ];

    table.push(...rows);

    return table.toString();

  }

}

const saveFile = (relativePath, html) => {

  const absolutePath = path.resolve(process.cwd(), relativePath);

  return fs.writeFile(absolutePath, html);

};

const getCookieString = (jar, url) => {

  return jar.getCookies(url).toString()

};

const getResponseAnalysis = _.curry((response, validResponseKey, stillResponsePair) => {

  const [stillResponseKey, stillResponse] = stillResponsePair;
  const validResponse = (validResponseKey === stillResponseKey);

  return _(stillResponse.indicators)
    .pairs()
    .map(getIndicatorAnalysis(response, validResponse, stillResponseKey))
    .map(replaceUndefinedMap)
    .value()

});

const getIndicatorAnalysis = _.curry((response, validResponse, stillResponseKey, stillIndicatorPair) => {

  const [stillIndicatorKey, stillIndicator] = stillIndicatorPair;
  const indicator = stillIndicator(response, true);

  if (!_.isPlainObject(indicator) || !_.has(indicator, 'name') || !_.has(indicator, 'valid') || !_.has(indicator, 'actual'))
    return [
      booleanToCheck(validResponse),
      stillResponseKey,
      booleanToCheck(indicator),
      'custom',
      '',
      '',
      indicator
    ];

  return [
    booleanToCheck(validResponse),
    stillResponseKey,
    booleanToCheck(indicator),
    indicator.name,
    stillIndicatorKey,
    indicator.expected,
    indicator.actual
  ]



});

const replaceUndefinedMap = (array) => _.map(array, (value) => Utility.replaceUndefined(chalk.yellow('undefined'), value));

const booleanToCheck = (value) => (value ? chalk.green('\u2713') : chalk.red('\u2717'));

export default IgniteProcess;
