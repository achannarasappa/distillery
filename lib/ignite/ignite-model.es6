const _ = require('lodash').mixin(require('../mixin'));
const cheerio = require('cheerio');
const chalk = require('chalk');
const Table = require('cli-table');
import Model from '../model';

const cliStyleDataTable = { head: [ 'blue' ] };
const cliStyleSummaryTable = { head: [ 'white' ] };
const intOptionKeys = [
  'table_item_count',
  'item_max_length',
];
const defaultOptions = {
  table: true,
  table_item_count: 10,
  item_max_length: 50,
  item_transform: false,
};

const replaceUndefinedIterations = _.replaceUndefined(chalk.yellow('not found'));

const markFailedValidations = _.curry((item, predicateFn, property) => ((!_.isUndefined(predicateFn) && predicateFn(item)) || _.isUndefined(predicateFn)) ? chalk.white(property) : chalk.gray(property));

const objectToCliArray = (object) => _(object)
  .pairs()
  .map((pair) => ({ [pair[0]]: _.replaceUndefined(chalk.red('not found'), pair[1]) }))
  .value();

const arrayToCliArray = (array, itemCount, truncateFn) => _(array)
  .take(itemCount, 1)
  .map((item) => _.map(item, truncateFn))
  .value();

const parseIntInArray = (value) => _.contains(intOptionKeys, value) ? _.parseInt(value) : value;

class IgniteModel extends Model {

  constructor(definition, options={}) {

    super(definition, options);

    this.options = _(options)
      .mapValues(parseIntInArray)
      .defaults(defaultOptions)
      .value();

    this.truncateFn = _.partial(_.trunc, _, this.options.item_max_length);

    _.extend(this, definition);

  }

  parse(html) {

    let [ dataTable, summaryTable ] = [ '', '' ];
    const title = chalk.gray('Model: ') + chalk.cyan(this.name);
    const $ = cheerio.load(html);

    if (this.type === 'collection')
      [ dataTable, summaryTable ] = this._getCollectionTables($);

    if (this.type === 'item')
      [ dataTable, summaryTable ] = this._getItemTables($);

    console.log(title);
    console.log(dataTable);
    console.log(summaryTable);

    return super.parse(html);

  }

  _getItemTables($) {

    const item = this.options.item_transform ? this._applyFilters(this._parseItem($)) : this._parseItem($);
    const dataTable = this._buildItemTable(item);

    return [ dataTable, '' ];

  }

  _getCollectionTables($) {

    let dataTable = '';
    const collection = this._parseCollection($);
    const iteration = this._parseIteration($);
    const summaryTable = this._buildSummaryTable(collection.length, iteration.length);

    if (this.options.table)
      dataTable = (this.options.item_transform) ? this._buildCollectionTable(collection) : this._buildIterationTable(iteration);

    return [ dataTable, summaryTable ];

  }

  _buildItemTable(item) {

    const table = new Table({ style: cliStyleDataTable });
    const rows = objectToCliArray(item);

    table.push(...rows);

    return table.toString();

  }

  _buildCollectionTable(collection) {

    const head = _.keys(this.properties);
    const table = new Table({ head, style: cliStyleDataTable });
    const rows = arrayToCliArray(collection, this.options.table_item_count, this.truncateFn);

    table.push(...rows);

    return table.toString();

  }

  _buildIterationTable(iteration) {

    const head = _.keys(this.properties);
    const table = new Table({ head, style: cliStyleDataTable });
    const rows = _(iteration)
      .take(this.options.table_item_count)
      .map(($) => this._parseItem($))
      .map((item) => _.map(item, replaceUndefinedIterations))
      .map((item) => _.map(item, this.truncateFn))
      .map((item) => _.map(item, markFailedValidations(item, this.predicate)))
      .value();

    table.push(...rows);

    return table.toString();

  }

  _buildSummaryTable(validCount, totalCount) {

    const table = new Table({ style: cliStyleSummaryTable });
    const rejectedCount = totalCount - validCount;
    const rows = [
      {
        Total: chalk.yellow(totalCount),
      },
      {
        '\u2717 Rejected': chalk.red(rejectedCount),
      },
      {
        '\u2713 Valid': chalk.green(validCount),
      },
    ];

    table.push(...rows);

    return table.toString();

  }

}

export default IgniteModel;
