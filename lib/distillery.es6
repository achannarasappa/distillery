const _ = require('lodash');
import Model from './model';
import Process from './process';
import Expect from './expect';

class Distillery {

  constructor(still, options = {}) {

    if (_.isUndefined(still))
      throw new Error('Unable run distillery with out a still.');

    this.options = options;
    this.still = still(this);

  }

  distill(parameters, returnResponse) {

    return new Process(this.still.process, this.options)
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

      if (response.error)
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

const parseModels = (html, models) => _.map(models, (model) => model.parse(html));

export default Distillery;
