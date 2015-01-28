var _ = require('lodash'),
  request = require('request'),
  chalk = require('chalk'),
  Table = require('cli-table'),
  Utility = require('../utility'),
  Process = require('../process');

var IgniteProcess = function(definition, options){
  if (!(this instanceof IgniteProcess)) return new IgniteProcess(definition, options);

  this.options = _.defaults(options || {}, this.options);

  _.extend(this, Process.call(this, definition, options));

};

_.extend(IgniteProcess.prototype, Process.prototype);

IgniteProcess.prototype.options = {};

IgniteProcess.prototype._generateResponse =  function(response){
  console.log(this._getValidResponseKey(response));
  
  return Process.prototype._generateResponse.call(this, response)

};


module.exports = IgniteProcess;