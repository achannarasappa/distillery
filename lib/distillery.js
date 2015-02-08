var _ = require('lodash');
var Model = require('./model');
var Process = require('./process');

var Distillery = function(still, options) {
  
  if (!(this instanceof Distillery)) return new Distillery(still, options);

  this.options = _.defaults(options || {}, this.options);

  this.still = still;
  
};

Distillery.prototype.expect = require('./expect');

Distillery.prototype.distill = function(parameters) {
  
  var self = this;

  return Process(self.still(self).process, self.options)
    .execute(parameters)
    .then(function(response) {
      
      if (!_.isUndefined(response.hook))
        return response.hook(response);

      if (_.isUndefined(self.still(self).models))
        return response;
      
      return self.parse(response.html);

    })
  
};

Distillery.prototype.require = function(path) {
  
  return require(path)(this)
  
};

Distillery.prototype.parse = function(html) {
  
  return parseModels(html, this._createModels(this.still(this).models, this.options))
  
};

Distillery.prototype._createModels = function(definitions, options) {
  
  return _.mapValues(definitions, function(definition) {
    
    return Model(definition, options)
    
  })
  
};

var parseModels = function(html, models) {
  
  return _.mapValues(models, function(model) {
    
    return model.parse(html)
    
  })
  
};

module.exports = Distillery;
