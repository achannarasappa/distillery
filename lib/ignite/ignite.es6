const fs = require('fs');
const _ = require('lodash');
const chalk = require('chalk');
const Distillery = require('../distillery');
import IgniteModel from './ignite-model';
import IgniteProcess from './ignite-process';

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

    return new IgniteProcess(this.still.process, this.options)
      .execute(parameters)
      .then(this._respond(returnResponse))

  }

  _respondRestoreHtml() {

    const html = fs.readFileSync(this.options.restore_html, 'utf8');

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

    return _.mapValues(definitions, (definition) => new IgniteModel(definition, options))

  }

}

export default Ignite;
