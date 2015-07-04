var fs = require('fs');
var _ = require('lodash');
var chalk = require('chalk');
var Distillery = require('../distillery');
var Model = require('./ignite-model');
import Process from './ignite-process';

/*var Ignite = function(still, options) {
  
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
        
        return self.parse(response.body);
        
      }

    })
  
};

Ignite.prototype._createModels = function(definitions, options) {
  
  return _.mapValues(definitions, function(definition) {
    
    return Model(definition, options)
    
  })
  
};*/

class Ignite extends Distillery {

  constructor(still, options={}) {

    super(still, options);

    this.options = _.defaults(options, {
      restore_html: false
    });
    this.still = still(this);

  }

  distill(parameters, returnResponse) {

    if (this.options.restore_html)
      return this._respondRestoreHtml();

    console.log(chalk.blue('\u2776') + chalk.gray(' initiating request'));

    return new Process(this.still.process, this.options)
      .execute(parameters)
      .then(this._respond(returnResponse))

  }

  _respondRestoreHtml() {

    var html = fs.readFileSync(this.options.restore_html, 'utf8');

    console.log(chalk.blue('\u2776') + chalk.gray(' request skipped, loading html and auto parsing models'));

    return this.parse(html);

  }

  _respond(returnResponse) {

    return (response) => {

      if (returnResponse) {

        console.log(chalk.blue('\u2777') + chalk.gray(' returnResponse set, returned raw response object'));

        return super._respond(returnResponse, response);

      }

      if (response.error) {

        console.log(chalk.blue('\u2777') + chalk.gray(' request encountered an error: ' + response.error));

        return super._respond(returnResponse, response);

      }

      if (!_.isUndefined(response.hook)) {

        console.log(chalk.blue('\u2777') + chalk.gray(' request complete, triggering hook'));

        return super._respond(returnResponse, response);

      }

      if (_.isUndefined(this.still.models)) {

        console.log(chalk.blue('\u2777') + chalk.gray(' request complete, returning response'));

        return super._respond(returnResponse, response);

      }

      console.log(chalk.blue('\u2777') + chalk.gray(' request complete, auto parsing models'));

      return this.parse(response.body);

    }

  }

  _createModels(definitions, options) {

    return _.mapValues(definitions, (definition) => new Model(definition, options))

  }

}

module.exports = Ignite;
