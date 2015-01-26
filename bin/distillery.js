#!/usr/bin/env node

var program = require('commander'),
    coercion = require('commander-coercions'),
    info = require('../package.json');
function collect(val, memo) {
  memo.push(val);
  return memo;
}
program
  .version(info.version, '-v, --version');

program.command('ignite <file>')
  .option('-p, --parameters [value]', 'parameter to pass to the still', coercion.toListFromMultipleInvocations, [])
  .option('-o, --opts [value]', 'set distillery options', coercion.toListFromMultipleInvocations, [])
  .action(require('./distillery-ignite'));



program.parse(process.argv);