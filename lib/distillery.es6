var _ = require('lodash');
var Model = require('./model');
var Process = require('./process');

class Distillery {

  constructor(still, options={}) {

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

  require(path) {

    return require(path)(this)

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

Distillery.prototype.expect = require('./expect');

var parseModels = (html, models) => _.map(models, (model) =>model.parse(html));

module.exports = Distillery;
