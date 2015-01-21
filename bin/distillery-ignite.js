#!/usr/bin/env node

var log = require('captains-log')();
var path = require('path');
var Ignite = require('../lib/ignite/ignite');
var Utility = require('../lib/utility');

module.exports = function(file, options) {

  log.info('Starting distillation');

  Ignite(require(path.resolve(__dirname, file)))
    .distill(Utility.parseKeyValuePairs('=', options.parameters))
    .then(function(res){
      log.info('Completed distillation')
    }).catch(function(err){
      log.error(err);
    })

};