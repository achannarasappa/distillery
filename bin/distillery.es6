#!/usr/bin/env node

const program = require('commander');
const coercion = require('commander-coercions');
const info = require('../package.json');

program
  .version(info.version, '-v, --version');

program.command('ignite <file>')
  .option('-p, --parameters [value]', 'parameter to pass to the still', coercion.toListFromMultipleInvocations, [])
  .option('-o, --opts [value]', 'set distillery options', coercion.toListFromMultipleInvocations, [])
  .action(require('./distillery-ignite'));

program.parse(process.argv);
