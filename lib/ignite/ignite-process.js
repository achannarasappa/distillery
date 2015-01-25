var _ = require('lodash'),
  request = require('request'),
  chalk = require('chalk'),
  Table = require('cli-table'),
  Utility = require('../utility'),
  Process = require('../process');

var IgniteProcess = function(definition, options){
  if (!(this instanceof Process)) return new Process(definition, options);

  this.options = _.defaults(options || {}, this.options);

  _.extend(this, Process.call(this, definition, options));

};

_.extend(IgniteProcess.prototype, Process.prototype);

IgniteProcess.prototype.options = {};

IgniteProcess.prototype._generateResponse =  function(response){

  var valid_response_key = this._getValidResponseKey(this.response, response);

  if (_.isUndefined(valid_response_key))
    return {
      message: 'No response conditions met.',
      http_code: response.response.statusCode,
      url: response.response.request.uri.href
    };
  else
    return _.assign(response, {
      indicators: this._getValidResponseIndicators(this.response[valid_response_key].indicators, response),
      hook: this.response[valid_response_key].hook
    });

};


module.exports = IgniteProcess;