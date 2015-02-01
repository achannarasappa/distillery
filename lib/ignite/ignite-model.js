var _ = require('lodash');
var cheerio = require('cheerio');
var chalk = require('chalk');
var Table = require('cli-table');
var Utility = require('../utility');
var Model = require('../model');

var IgniteModel = function(definition, options){
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

IgniteModel.prototype.parse = function(html){
  var $ = cheerio.load(html);
  var self = this;
  var collection;
  var iteration;

  if (self.type === 'collection') {
    collection = self._parseCollection($);
    iteration = self._parseIteration($);
    
    // Display parsed models
    if (self.options.table) console.log(((self.options.item_format) ? self._buildCollectionCLiTable(collection) : self._buildIterationCLiTable(iteration)));

    // Display summary table
    self._buildSummaryTable(collection.length, (iteration.length - collection.length), iteration.length);
  }

  return Model.prototype.parse.call(this, html);
};

IgniteModel.prototype._buildCollectionCLiTable = function(collection){
  var self = this;
  var table = new Table({
        head: _.keys(self.elements),
        style: {
          head: ['blue']
        }
      });
  
  _.chain(collection)
    .first(_.parseInt(self.options.table_item_count))
    .map(function(item){
      return _.chain(item)
        .values()
        .map(Utility.truncateString(_.parseInt(self.options.item_max_length)))
        .value()
    })
    .map(function(item){
      table.push(item)
    });

  return console.log(table.toString())
};

IgniteModel.prototype._buildIterationCLiTable = function(iteration){
  var self = this;
  var item;
  var table = new Table({
      head: _.keys(self.elements),
      style: {
        head: ['blue']
      }
    });
  
  _.chain(iteration)
    .first(_.parseInt(self.options.table_item_count))
    .map(function($){
      item = self._parseItem($);
      
      return _.chain(item)
        .values()
        .map(Utility.truncateString(_.parseInt(self.options.item_max_length)))
        .map(function(property){
          return self.validate(item) ? chalk.white(property) : chalk.gray(property)
        })
        .value()
    })
    .map(function(item){
      table.push(item)
    });

  return console.log(table.toString())
};

IgniteModel.prototype._buildSummaryTable = function(valid, rejected, total){

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

  return console.log(table.toString())
  
};

module.exports = IgniteModel;