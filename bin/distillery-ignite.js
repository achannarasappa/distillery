#!/usr/bin/env node

var log = require('captains-log')();
var path = require('path');
var fs = require('fs');
var Ignite = require('../lib/ignite/ignite');
var Utility = require('../lib/utility');

module.exports = function(file, options) {

  var still = path.resolve(process.cwd(), file);

  log.info('Starting distillation');

  if (!fs.existsSync(still)) return log.error('Unable to find still at \'' + still + '\'');

  return Ignite(require(still), Utility.parseKeyValuePairs('=', options.opts))
    .distill(Utility.parseKeyValuePairs('=', options.parameters))
    .then(function(){
      log.info('Completed distillation')
    }).catch(function(err){
      log.error(err);
    })

};