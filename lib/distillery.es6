const _ = require('lodash');
import Model from './model';
import Exchange from './exchange';
import Expect from './expect';
import { validateStill } from './validate';
import { DistilleryError } from './error';

const parseModels = (html, models) => _.map(models, (model) => model.parse(html));

class Distillery {

  constructor(still, options = {}) {

    if (_.isUndefined(still))
      throw new DistilleryError('Unable run distillery with out a still.');

    this.options = options;
    this.still = validateStill(still(this));

  }

  distill(parameters, returnResponse) {

    return new Exchange(this.still.exchange, this.options)
      .execute(parameters)
      .then(this._respond(returnResponse))

  }

  parse(html) {

    return parseModels(html, this._createModels(this.still.models, this.options))

  }

  _createModels(definitions, options) {

    return _.map(definitions, (definition) => new Model(definition, options))

  }

  _respond(returnResponse) {

    return (response) => {

      if (returnResponse)
        return response;

      if (!_.isUndefined(response.hook))
        return response.hook(response);

      if (_.isUndefined(this.still.models))
        return response;

      return this.parse(response.body);

    }

  }

}

Distillery.prototype.expect = Expect;

export default Distillery;
