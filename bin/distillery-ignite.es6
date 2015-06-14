#!/usr/bin/env node

var log = require('captains-log')();
var path = require('path');
var fs = require('fs');
var Q = require('q');
var Ignite = require('./ignite/ignite');
var Utility = require('./utility');

module.exports = function(file, options) {

  var still = path.resolve(process.cwd(), file);

  log.info('Starting distillation');

  if (!fs.existsSync(still)) return log.error('Unable to find still at \'' + still + '\'');

  return Q.when(Ignite(require(still), Utility.splitStringArray('=', options.opts))
    .distill(Utility.splitStringArray('=', options.parameters)), function() {
    
      log.info('Completed distillation')
    
    }, function(err) {
    
      log.error(err);
    
    })

};
