var _ = require('lodash');
var cheerio = require('cheerio');
var chalk = require('chalk');
var Table = require('cli-table');
var Utility = require('../utility');
var Model = require('../model');

/*var IgniteModel = function(definition, options) {
  
  if (!(this instanceof IgniteModel)) return new IgniteModel(definition, options);

  this.options = _.defaults(options || {}, this.options);
  
  _.extend(this, Model.call(this, definition, options));
  
};

_.extend(IgniteModel.prototype, Model.prototype);

IgniteModel.prototype.options = {
  table: true,
  table_item_count: 10,
  item_max_length: 50,
  item_format: false
};

IgniteModel.prototype.parse = function(html) {
  
  var $ = cheerio.load(html);
  var self = this;
  var collection;
  var iteration;

  console.log(chalk.gray('Model: ') + chalk.cyan(self.name));
  
  if (self.type === 'collection') {
    
    collection = self._parseCollection($);
    iteration = self._parseIteration($);

    // Display parsed models
    if (self.options.table) ((self.options.item_format) ? self._buildCollectionTable(collection) : self._buildIterationTable(iteration));

    // Display summary table
    self._buildSummaryTable(collection.length, (iteration.length - collection.length), iteration.length);
  
  }

  if (self.type === 'item') {
    
    if (self.options.item_format) {
      
      self._buildItemTable(self._applyFilters(self._parseItem($)))
      
    } else {
      
      self._buildItemTable(self._parseItem($))
      
    }
    
  }

  return Model.prototype.parse.call(this, html);
  
};

IgniteModel.prototype._buildItemTable = function(item) {

  var table = new Table({
    style: {
      head: [ 'blue' ]
    }
  });
  var row = {};

  _.forOwn(item, function(val, key) {
    
    row = {};
    row[key] = (_.isUndefined(val) ? chalk.red('not found') : val);
    table.push(row);
    
  });

  return console.log(table.toString())
  
};

IgniteModel.prototype._buildCollectionTable = function(collection) {
  
  var self = this;
  var table = new Table({
        head: _.keys(self.elements),
        style: {
          head: [ 'blue' ]
        }
      });
  
  _.chain(collection)
    .first(_.parseInt(self.options.table_item_count))
    .map(function(item) {

      return _.chain(item)
        .values()
        .map(Utility.truncateString(_.parseInt(self.options.item_max_length)))
        .value()
      
    })
    .map(function(item) {
      
      table.push(item)
      
    });

  return console.log(table.toString())
  
};

IgniteModel.prototype._buildIterationTable = function(iteration) {
  
  var self = this;
  var item;
  var table = new Table({
      head: _.keys(self.elements),
      style: {
        head: [ 'blue' ]
      }
    });
  
  _.chain(iteration)
    .first(_.parseInt(self.options.table_item_count))
    .map(function($) {
      
      item = self._parseItem($);
      
      return _.chain(item)
        .values()
        .map(Utility.truncateString(_.parseInt(self.options.item_max_length)))
        .map(function(property) {
          
          if (!_.isUndefined(self.validate))
            return self.validate(item) ? chalk.white(property) : chalk.gray(property)
          
          return chalk.white(property)
          
        })
        .value()
      
    })
    .map(function(item) {
      
      table.push(item)
      
    });

  return console.log(table.toString())
  
};

IgniteModel.prototype._buildSummaryTable = function(valid, rejected, total) {

  var table = new Table({
    style: {
      head: [ 'white' ]
    }
  });
  
  table.push(
    { Total: chalk.yellow(total) },
    { '\u2717 Rejected': chalk.red(rejected) },
    { '\u2713 Valid': chalk.green(valid) }
  );

  return console.log(table.toString())
  
};*/

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

    const rows = objectToCliArray(item);
    const table = new Table({
      style: {
        head: [ 'blue' ]
      }
    });

    table.push(...rows);

    return table.toString();

  }

  _buildCollectionTable(collection) {

    const columnHeaders = _.keys(this.elements);
    const table = new Table({
      head: columnHeaders,
      style: {
        head: [ 'blue' ]
      }
    });
    const rows = _.chain(collection)
      .first(this.options.table_item_count)
      .map((item) => _.map(item, this.truncateStringFn))
      .value();

    table.push(...rows);

    return table.toString();

  }

  _buildIterationTable(iteration) {

    var self = this;
    var item;
    var table = new Table({
      head: _.keys(self.elements),
      style: {
        head: [ 'blue' ]
      }
    });

    _.chain(iteration)
      .first(_.parseInt(self.options.table_item_count))
      .map(function($) {

        item = self._parseItem($);

        return _.chain(item)
          .values()
          .map(Utility.truncateString(_.parseInt(self.options.item_max_length)))
          .map(function(property) {

            if (!_.isUndefined(self.validate))
              return self.validate(item) ? chalk.white(property) : chalk.gray(property)

            return chalk.white(property)

          })
          .value()

      })
      .map(function(item) {

        table.push(item)

      });

    return table.toString();

  }

  _buildSummaryTable(valid, rejected, total) {

    const table = new Table({
      style: {
        head: [ 'white' ]
      }
    });

    table.push(
      { Total: chalk.yellow(total) },
      { '\u2717 Rejected': chalk.red(rejected) },
      { '\u2713 Valid': chalk.green(valid) }
    );

    return table.toString();

  }

}

const replaceUndefined = (value) => (_.isUndefined(value) ? chalk.red('not found') : value);

const objectToCliArray = (object) => _(object)
  .pairs()
  .map((pair) => ({[pair[0]]: replaceUndefined(pair[1])}))
  .value();

module.exports = IgniteModel;
