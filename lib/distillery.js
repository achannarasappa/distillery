var _ = require('lodash'),
  Model = require('./model'),
  Process = require('./process');

var Distillery = function(still, options){
  if (!(this instanceof Distillery)) return new Distillery(still, options);

  this.options = _.defaults(options || {}, this.options);

  this.still = still;
};

Distillery.prototype.expect = require('./expect');

Distillery.prototype.distill = function(parameters){
  var self = this;

  return Process(self.still(self).process, self.options)
    .execute(parameters)
    .then(function(response){
      if (!_.isUndefined(response.hook))
        return response.hook(response);

      if (_.isUndefined(self.still(self).models))
        return response;
      else
        return self.parse(response.html);

    })
};

Distillery.prototype.require = function(path){
  return require(path)(this)
};

Distillery.prototype.parse = function(html){
  return parseModels(html, createModels(this.still(this).models))
};

var createModels = function(definitions){
  return _.mapValues(definitions, function(definition){
    return Model(definition)
  })
};

var parseModels = function(html, models){
  return _.mapValues(models, function(model){
    return model.parse(html)
  })
};

module.exports = Distillery;