var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var request = require('request-promise').defaults({ jar: true });
var chalk = require('chalk');
var Table = require('cli-table');
var Utility = require('../utility');
var Process = require('../process');

var IgniteProcess = function(definition, options) {
  
  if (!(this instanceof IgniteProcess)) return new IgniteProcess(definition, options); 

  this.options = _.defaults(options || {}, { jar: request.jar() });
  
  _.extend(this, Process.call(this, definition, options));
  _.extend(this, definition);

  if (options.restore_cookie)
    this.options.jar.setCookie(fs.readFileSync(options.restore_cookie, 'utf8'), this.request.url);
  
};

_.extend(IgniteProcess.prototype, Process.prototype);

IgniteProcess.prototype.options = {
  indicators: true,
  save_html: false,
  save_cookie: false,
  restore_cookie: false
};

IgniteProcess.prototype._generateResponse =  function(jar) {

  var self = this;

  return function(response) {

    var validResponseKey = self._getValidResponseKey(response);

    // Save HTML to disk
    if (self.options.save_html) fs.writeFile(path.resolve(process.cwd(), self.options.save_html), response.body);

    // Save cookie to disk
    if (self.options.save_cookie) fs.writeFile(path.resolve(process.cwd(), self.options.save_cookie), jar.getCookies(self.request.url).toString());

    self._buildResponseIndicatorsTable(response, validResponseKey);
    self._buildSummaryTable(response.statusCode, response.request.uri.href, validResponseKey);

    return Process.prototype._generateResponse.call(self, jar)(response)

  }

};

IgniteProcess.prototype._buildResponseIndicatorsTable = function(response, validResponseKey) {
  
  var table = new Table({
    head: [
      '',
      'Response Key',
      '',
      'Type',
      'Indicator',
      'Expected',
      'Actual'
    ],
    style: {
      head: [ 'blue' ]
    }
  });

  _.forOwn(this.response, function(res, resKey) {

    _.forOwn(res.indicators, function(indicator, indicatorKey) {
      
      indicator = indicator(response, true);

      if (!_.isPlainObject(indicator) || !_.has(indicator, 'name') || !_.has(indicator, 'valid') || !_.has(indicator, 'actual'))
        indicator = {
          name: 'custom',
          expected: '',
          actual: '',
          valid: indicator
        };

      var row = _.map([
        (validResponseKey === resKey ? chalk.green('\u2713') : chalk.red('\u2717')),
        resKey,
        (indicator.valid ? chalk.green('\u2713') : chalk.red('\u2717')),
        indicator.name,
        indicatorKey,
        indicator.expected,
        indicator.actual

      ], function(cell) {

        return (_.isUndefined(cell) ? chalk.yellow('undefined') : cell)

      });

      table.push(row)
      
    })
    
  });

  return console.log(table.toString())
  
};

IgniteProcess.prototype._buildSummaryTable = function(status, url, key) {
  
  var table = new Table({
    style: {
      head: [ 'blue' ]
    }
  });

  table.push(
    { 'Status Code': status },
    { URL: url },
    { 'Response Key': _.isUndefined(key) ? chalk.red('No match') : chalk.green(key) }
  );

  return console.log(table.toString())
  
};

module.exports = IgniteProcess;
