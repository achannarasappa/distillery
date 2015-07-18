#!/usr/bin/env node

const log = require('captains-log')();
const path = require('path');
const fs = require('fs');
const Q = require('q');
const Utility = require('../lib/utility');
import Ignite from '../lib/ignite/ignite';

module.exports = (file, opts) => {

  let still;
  let ignite;
  const options = Utility.splitStringArray('=', opts.opts);
  const parameters = Utility.splitStringArray('=', opts.parameters);
  const stillPath = path.resolve(process.cwd(), file);

  log.info('Starting distillation');

  if (!fs.existsSync(stillPath))
    return log.error('Unable to find still at \'' + stillPath + '\'');

  still = require(stillPath);
  ignite = new Ignite(still, options);

  return Q.when(ignite.distill(parameters), () => log.info('Completed distillation'), (err) => log.error(err))

};
