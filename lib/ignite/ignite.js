var _ = require('lodash');
var chalk = require('chalk');
var Distillery = require('../distillery');
var Model = require('./ignite-model');
var Process = require('./ignite-process');

Distillery.prototype.distill = function(parameters){
  var self = this;

  console.log(chalk.blue('\u2776') + chalk.gray(' initiating request to ') + this.still(this).process.request.url );

  return Process(self.still(self).process, self.options)
    .execute(parameters)
    .then(function(response){

      if (!_.isUndefined(response.hook)){
        console.log(chalk.blue('\u2777') + chalk.gray(' request complete, triggering hook'));
        return response.hook(response);
      }

      if (_.isUndefined(self.still(self).models)) {
        console.log(chalk.blue('\u2777') + chalk.gray(' request complete, returning response'));
        return response;
      } else {
        console.log(chalk.blue('\u2777') + chalk.gray(' request complete, auto parsing models'));
        return self.parse(response.html);
      }

    })
};

Distillery.prototype._createModels = function(definitions, options){
  return _.mapValues(definitions, function(definition){
    return Model(definition, options)
  })
};

module.exports = Distillery;