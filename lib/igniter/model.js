var _ = require('lodash'),
    cheerio = require('cheerio'),
    chalk = require('chalk'),
    Table = require('cli-table'),
    Utility = require('../utility'),
    Model = require('../model');

Model.prototype.options = {
  string_truncate_length: 50,
  show_table: true
};

Model.prototype.parse = function(html){
  var $ = cheerio.load(html),
      self = this,
      definition = this.definition,
      collection,
      iteration,
      table;

  if (definition.type === 'collection') {
    collection = self._parseCollection(definition.validate, definition.format, definition.iterate, definition.elements, $);
    iteration = self._parseIteration(definition.iterate, $);

    console.log(chalk.yellow(iteration.length) + chalk.gray(' items matching the iterator, ' + chalk.green(collection.length)) + chalk.gray(' items valid.') );

    if (self.options.show_table) {
      table = new Table({
        head: _.keys(definition.elements),
        style: {
          head: ['white']
        }
      });

      _.map(iteration, function($){
        if (_.isNull(self._applyFilters(definition.validate, definition.format, self._parseItem(definition.elements, $)))){
          table.push(_.map(_.values(self._parseItem(definition.elements, $)), _.compose(chalk.gray, Utility.truncateString(self.string_truncate_length))))
        } else {
          table.push(_.map(_.values(self._parseItem(definition.elements, $)), _.compose(chalk.white, Utility.truncateString(self.string_truncate_length))))
        }
      });

      console.log(table.toString());
    }

    return collection;
  }

  if (definition.type === 'item')
    return this._parseItem(definition.elements, $);
};

module.exports = Model;