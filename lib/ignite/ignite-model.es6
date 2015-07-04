const _ = require('lodash');
const cheerio = require('cheerio');
const chalk = require('chalk');
const Table = require('cli-table');
const Utility = require('../utility');
const Model = require('../model');

const cliStyleDataTable = { head: [ 'blue' ] };
const cliStyleSummaryTable = { head: [ 'white' ] };

class IgniteModel extends Model {

  constructor(definition, options={}) {

    super(definition, options);

    this.options = _.defaults(options, {
      table: true,
      table_item_count: 10,
      item_max_length: 50,
      item_format: false
    });
    this.options.table_item_count = _.parseInt(this.options.table_item_count);
    this.options.item_max_length = _.parseInt(this.options.item_max_length);
    this.truncateStringFn = Utility.truncateString(this.options.item_max_length);

    _.extend(this, definition);

  }

  parse(html) {

    let dataTable = '';
    let summaryTable = '';
    const title = chalk.gray('Model: ') + chalk.cyan(this.name);
    const $ = cheerio.load(html);

    if (this.type === 'collection') {

      let collection = this._parseCollection($);
      let iteration = this._parseIteration($);

      // Display parsed models
      if (this.options.table)
        dataTable = (this.options.item_format) ? this._buildCollectionTable(collection) : this._buildIterationTable(iteration);

      // Display summary table
      summaryTable = this._buildSummaryTable(collection.length, (iteration.length - collection.length), iteration.length);

    }

    if (this.type === 'item') {

      let item = this.options.item_format ? this._applyFilters(this._parseItem($)) : this._parseItem($);

      dataTable = this._buildItemTable(item);

    }

    console.log(title);
    console.log(dataTable);
    console.log(summaryTable);

    return super.parse(html);

  }

  _buildItemTable(item) {

    const table = new Table({ style: cliStyleDataTable });
    const rows = objectToCliArray(item);

    table.push(...rows);

    return table.toString();

  }

  _buildCollectionTable(collection) {

    const head = _.keys(this.elements);
    const table = new Table({ head, style: cliStyleDataTable });
    const rows = arrayToCliArray(collection, this.options.table_item_count, this.truncateStringFn);

    table.push(...rows);

    return table.toString();

  }

  _buildIterationTable(iteration) {

    const head = _.keys(this.elements);
    const table = new Table({ head, style: cliStyleDataTable });
    const rows = _(iteration)
      .first(this.options.table_item_count)
      .map(($) => this._parseItem($))
      .map((item) => _.map(item, this.truncateStringFn))
      .map((item) => _.map(item, markFailedValidations(item, this.validate)))
      .value();

    table.push(...rows);

    return table.toString();

  }

  _buildSummaryTable(valid, rejected, total) {

    const table = new Table({ style: cliStyleSummaryTable });
    const rows = [
      {
        Total: chalk.yellow(total)
      },
      {
        '\u2717 Rejected': chalk.red(rejected)
      },
      {
        '\u2713 Valid': chalk.green(valid)
      }
    ];

    table.push(...rows);

    return table.toString();

  }

}

const replaceUndefined = (value) => (_.isUndefined(value) ? chalk.red('not found') : value);

const markFailedValidations = _.curry((item, validateFn, property) => {

  if (!_.isUndefined(validateFn))
    return validateFn(item) ? chalk.white(property) : chalk.gray(property);

  return chalk.white(property);

});

const objectToCliArray = (object) => _(object)
  .pairs()
  .map((pair) => ({ [pair[0]]: replaceUndefined(pair[1]) }))
  .value();

const arrayToCliArray = (array, itemCount, truncateFn) => _(array)
  .first(itemCount)
  .map((item) => _.map(item, truncateFn))
  .value();

export default IgniteModel;
