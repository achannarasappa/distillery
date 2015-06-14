var _ = require('lodash');
var Model = require('./model');
var Process = require('./process');

class Distillery {

  constructor(still, options) {

    if (_.isUndefined(still))
      throw new Error('Unable run distillery with out a still.');

    this.options = _.defaults(options || {}, this.options);
    this.still = still;

  }

  distill(parameters, returnResponse) {

    return Process(this.still(this).process, this.options)
      .execute(parameters)
      .then(this._respond(returnResponse))

  }

  require(path) {

    return require(path)(this)

  }

  parse(html) {

    return parseModels(html, this._createModels(this.still(this).models, this.options))

  }

  _createModels(definitions, options) {

    return _.map(definitions, (definition) => Model(definition, options))

  }

  _respond(returnResponse) {

    var self = this;

    return (response) => {

      if (returnResponse)
        return response;

      if (response.error)
        return response;

      if (!_.isUndefined(response.hook))
        return response.hook(response);

      if (_.isUndefined(self.still(self).models))
        return response;

      return self.parse(response.body);

    }

  }

}

Distillery.prototype.expect = require('./expect');

var parseModels = (html, models) => _.map(models, (model) =>model.parse(html));

module.exports = Distillery;
