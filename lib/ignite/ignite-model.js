var _ = require('lodash'),
    cheerio = require('cheerio'),
    chalk = require('chalk'),
    Table = require('cli-table'),
    Utility = require('../utility'),
    Model = require('../model');

Model.prototype.options = {
  table: true,
  table_item_count: 10,
  item_max_length: 50,
  item_format: false
};

Model.prototype.parse = function(html){
  var $ = cheerio.load(html),
      self = this,
      collection,
      iteration;

  if (self.type === 'collection') {
    collection = self._parseCollection($);
    iteration = self._parseIteration($);
    
    // Display parsed models
    if (self.options.table) console.log(((self.options.item_format) ? self._buildCollectionCLiTable(collection) : self._buildIterationCLiTable(iteration)).toString());

    // Display summary table
    console.log((self._buildSummaryTable(collection.length, (iteration.length - collection.length), iteration.length)).toString());

    return collection;
  }

  if (self.type === 'item')
    return self._parseItem($);
};

module.exports = Model;

Model.prototype._buildCollectionCLiTable = function(collection){
  var self = this,
      table = new Table({
    head: _.keys(self.elements),
    style: {
      head: ['blue']
    }
  });
  
  _.chain(collection)
    .first(self.options.table_item_count)
    .map(function(item){
      return _.chain(item)
        .values()
        .map(Utility.truncateString(self.options.item_max_length))
        .value()
    })
    .map(function(item){
      table.push(item)
    });
  
  return table
};

Model.prototype._buildIterationCLiTable = function(iteration){
  var self = this,
      item,
      table = new Table({
      head: _.keys(self.elements),
      style: {
        head: ['blue']
      }
    });
  
  _.chain(iteration)
    .first(self.options.table_item_count)
    .map(function($){
      item = self._parseItem($);
      
      return _.chain(item)
        .values()
        .map(Utility.truncateString(self.options.item_max_length))
        .map(function(property){
          return self.validate(item) ? chalk.white(property) : chalk.gray(property)
        })
        .value()
    })
    .map(function(item){
      table.push(item)
    });

  return table
};

Model.prototype._buildSummaryTable = function(valid, rejected, total){

  var table = new Table({
    style: {
      head: ['white']
    }
  });
  
  table.push(
    { 'Total': chalk.yellow(total) },
    { '\u2717 Rejected': chalk.red(rejected) },
    { '\u2713 Valid': chalk.green(valid) }
  );

  return table;
  
};
