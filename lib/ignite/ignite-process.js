var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var log = require('captains-log')();
var chalk = require('chalk');
var Table = require('cli-table');
var Utility = require('../utility');
var Process = require('../process');

var IgniteProcess = function(definition, options){
  if (!(this instanceof IgniteProcess)) return new IgniteProcess(definition, options);

  this.options = _.defaults(options || {}, this.options);

  _.extend(this, Process.call(this, definition, options));

};

_.extend(IgniteProcess.prototype, Process.prototype);

IgniteProcess.prototype.options = {
  indicators: true,
  save_html: false,
  save_cookie: false
};

IgniteProcess.prototype._generateResponse =  function(response){
  var valid_response_key = this._getValidResponseKey(response);
  
  // Save HTML to disk
  if (this.options.save_html) fs.writeFile(path.resolve(process.cwd(), this.options.save_html), response.html);
  
  // Save cookie to disk
  if (this.options.save_cookie) fs.writeFile(path.resolve(process.cwd(), this.options.save_cookie), response.jar.getCookies(response.response.request.uri.href));
  
  this._buildResponseIndicatorsTable(response, valid_response_key);
  this._buildSummaryTable(response.response.statusCode, response.response.request.uri.href, valid_response_key);
  
  return Process.prototype._generateResponse.call(this, response)

};

IgniteProcess.prototype._isResponseValid = function(definition, response) {
  return Process.prototype._isResponseValid.call(this, definition, response).valid
};

IgniteProcess.prototype._buildResponseIndicatorsTable = function(response, valid_response_key){
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
      head: ['blue']
    }
  });

  _.forOwn(this.response, function(res, res_key){
    _.forOwn(res.indicators, function(indicator, indicator_key){
      indicator = indicator(response);
      
      table.push([
        (valid_response_key === res_key ? chalk.green('\u2713') : chalk.red('\u2717')),
        res_key,
        (indicator.valid ? chalk.green('\u2713') : chalk.red('\u2717') ),
        indicator.name,
        indicator_key,
        indicator.expected,
        indicator.actual
      ])
    })
  });

  return console.log(table.toString())
};

IgniteProcess.prototype._buildSummaryTable = function(status, url, key){
  var table = new Table({
    style: {
      head: ['blue']
    }
  });

  table.push(
    { 'Status Code': status },
    { 'URL': url },
    { 'Response Key': _.isUndefined(key) ? chalk.red('No match') : chalk.green(key) }
  );

  return console.log(table.toString())
};


module.exports = IgniteProcess;