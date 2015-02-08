#!/usr/bin/env node

var log = require('captains-log')();
var path = require('path');
var fs = require('fs');
var Q = require('q');
var Ignite = require('../lib/ignite/ignite');
var Utility = require('../lib/utility');

module.exports = function(file, options) {

  var still = path.resolve(process.cwd(), file);

  log.info('Starting distillation');

  if (!fs.existsSync(still)) return log.error('Unable to find still at \'' + still + '\'');

  return Q.when(Ignite(require(still), Utility.parseKeyValuePairs('=', options.opts))
    .distill(Utility.parseKeyValuePairs('=', options.parameters)), function() {
    
      log.info('Completed distillation')
    
    }, function(err) {
    
      log.error(err);
    
    })

};
