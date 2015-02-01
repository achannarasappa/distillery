var _ = require('lodash');
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
  indicators: true
};

IgniteProcess.prototype._generateResponse =  function(response){
  var valid_response_key = this._getValidResponseKey(response);
  
  this._buildResponseIndicatorsTable(response, valid_response_key);
  this._buildSummaryTable(response.response.statusCode, response.response.request.uri.href, valid_response_key);
  
  return Process.prototype._generateResponse.call(this, response)

};

IgniteProcess.prototype._buildResponseIndicatorsTable = function(response, valid_response_key){
  var self = this;
  var table = new Table({
    head: [
      '',
      'response',
      '',
      'indicator',
      'expected',
      'actual'
    ],
    style: {
      head: ['blue']
    }
  });

  _.forOwn(this.response, function(res, res_key){
    _.forOwn(res.indicators, function(indicator, indicator_key){
      table.push([
        (valid_response_key === res_key ? chalk.green('\u2713') : chalk.red('\u2717')),
        res_key,
        (indicator(response) ? chalk.green('\u2713') : chalk.red('\u2717') ),
        indicator_key,
        '',
        ''
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