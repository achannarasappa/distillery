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

IgniteProcess.prototype.options = {};

IgniteProcess.prototype._generateResponse =  function(response){
  var valid_response_key = this._getValidResponseKey(response);
  var valid_response_indicators;

  if (!_.isUndefined(valid_response_key)){
    valid_response_indicators = this._getValidResponseIndicators(this.response[valid_response_key].indicators, response);

    console.log(valid_response_indicators);
  }
  
  this._buildSummaryTable(response.response.statusCode, response.response.request.uri.href, valid_response_key);
  
  return Process.prototype._generateResponse.call(this, response)

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