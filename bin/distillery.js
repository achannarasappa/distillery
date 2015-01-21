#!/usr/bin/env node

var program = require('commander'),
    coercion = require('commander-coercions'),
    info = require('../package.json');

program
  .version(info.version, '-v, --version');

program.command('ignite')
  .option('-p, --parameters [value]', 'parameter to pass to the still', coercion.toListFromMultipleInvocations, [])
  .action(require('./distillery-ignite'));



program.parse(process.argv);