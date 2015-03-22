var _ = require('lodash');
var Model = require('./model');
var Process = require('./process');

var Distillery = function(still, options) {
  
  if (!(this instanceof Distillery)) return new Distillery(still, options);

  if (_.isUndefined(still))
    throw new Error('Unable run distillery with out a still.');

  this.options = _.defaults(options || {}, this.options);
  this.still = still;
  
};

Distillery.prototype.expect = require('./expect');

Distillery.prototype.distill = function(parameters, returnResponse) {
  
  var self = this;

  return Process(self.still(self).process, self.options)
    .execute(parameters)
    .then(self._respond(returnResponse))
  
};

Distillery.prototype.require = function(path) {
  
  return require(path)(this)
  
};

Distillery.prototype.parse = function(html) {
  
  return parseModels(html, this._createModels(this.still(this).models, this.options))
  
};

Distillery.prototype._createModels = function(definitions, options) {
  
  return _.map(definitions, function(definition) {
    
    return Model(definition, options)
    
  })
  
};

Distillery.prototype._respond = function(returnResponse) {

  var self = this;
  
  return function(response) {
    
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

};

var parseModels = function(html, models) {
  
  return _.map(models, function(model) {
    
    return model.parse(html)
    
  })
  
};

module.exports = Distillery;
