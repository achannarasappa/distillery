#!/usr/bin/env node

var log = require('captains-log')();
var path = require('path');
var fs = require('fs');
var Q = require('q');
var Ignite = require('../lib/ignite/ignite');
var Utility = require('../lib/utility');

module.exports = (file, opts) => {

  var options = Utility.splitStringArray('=', opts.opts);
  var parameters = Utility.splitStringArray('=', opts.parameters);
  var stillPath = path.resolve(process.cwd(), file);
  var still;

  log.info('Starting distillation');

  if (!fs.existsSync(stillPath))
    return log.error('Unable to find still at \'' + stillPath + '\'');

  still = require(stillPath);

  return Q.when(new Ignite(still, options)
    .distill(parameters), () => log.info('Completed distillation'), (err) => log.error(err))

};
