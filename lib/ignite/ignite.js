var fs = require('fs');
var _ = require('lodash');
var chalk = require('chalk');
var Distillery = require('../distillery');
var Model = require('./ignite-model');
var Process = require('./ignite-process');

var Ignite = function(still, options) {
  
  if (!(this instanceof Ignite)) return new Ignite(still, options);

  this.options = _.defaults(options || {}, this.options);
  this.still = still;

  _.extend(this, Distillery.call(this, still, options));
  
};

_.extend(Ignite.prototype, Distillery.prototype);

Ignite.prototype.options = {
  restore_html: false
};

Ignite.prototype.distill = function(parameters) {
  
  var self = this;

  if (self.options.restore_html) {
    
    console.log(chalk.blue('\u2776') + chalk.gray(' request skipped, loading html and auto parsing models'));
    
    return self.parse(fs.readFileSync(self.options.restore_html, 'utf8'));
    
  }

  console.log(chalk.blue('\u2776') + chalk.gray(' initiating request'));

  return Process(self.still(self).process, self.options)
    .execute(parameters)
    .then(function(response) {

      if (response.error) {

        console.log(chalk.blue('\u2777') + chalk.gray(' request encountered an error: ' + response.error));
        
        return response;
        
      }

      if (!_.isUndefined(response.hook)) {
        
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

Ignite.prototype.expect = require('./ignite-expect');

Ignite.prototype._createModels = function(definitions, options) {
  
  return _.mapValues(definitions, function(definition) {
    
    return Model(definition, options)
    
  })
  
};

module.exports = Ignite;
