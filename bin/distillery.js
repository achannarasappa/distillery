#!/usr/bin/env node

var program = require('commander');
var coercion = require('commander-coercions');
var info = require('../package.json');

program
  .version(info.version, '-v, --version');

program.command('ignite <file>')
  .option('-p, --parameters [value]', 'parameter to pass to the still', coercion.toListFromMultipleInvocations, [])
  .option('-o, --opts [value]', 'set distillery options', coercion.toListFromMultipleInvocations, [])
  .action(require('./distillery-ignite'));



program.parse(process.argv);