var _ = require('lodash'),
  cheerio = require('cheerio');

var Model = function(definition, options){
  if (!(this instanceof Model)) return new Model(definition, options);

  this.options = _.defaults(options || {}, this.options);

  if (validateDefinition(definition)) _.extend(this, definition)

};

Model.prototype.parse = function(html){
  var $ = cheerio.load(html);

  if (this.type === 'collection')
    return this._parseCollection($);

  if (this.type === 'item')
    return this._parseItem($);

};

Model.prototype._applyFilters = function(item){
  // TODO: Make filters optional

  return (this.validate(item)) ? this.format(item) : null;
  
};

Model.prototype._parseIteration = function($){
  
  return $(this.iterate).map(function(key, val){
    // TODO: Optimize return of cheerio object
    return cheerio.load($(val).html());
  })

};

Model.prototype._parseCollection = function($){
  var self = this;

  return _.reject(_.map(self._parseIteration($), function($){
    return self._applyFilters(self._parseItem($))
  }), _.isNull);

};

Model.prototype._parseItem = function($){
  var self = this;
  
  return _.mapValues(self.elements, function(element){
    return parseElement(element, $);
  })

};

var parseElement = function(element, $){
  // TODO: Regex matching support

  if (_.isObject(element))
    return $(element.path).first().attr(element.attr);

  if (_.isString(element))
    return $(element).first().text();

};

var validateDefinition = function(definition){

  if (!_.isObject(definition))
    throw new Error('Model definition is ' + (typeof definition) + ' expecting object.');

  if (!_.isString(definition.type))
    throw new Error('Model definition.type is ' + (typeof definition.type) + ' expecting string.');

  if (definition.type.toLowerCase() !== 'collection' && definition.type.toLowerCase() !== 'item')
    throw new Error('Model definition.type expects \'collection\' or \'item\'.');

  if (definition.type.toLowerCase() !== 'collection' && !_.isString(definition.iterate))
    throw new Error('Model definition.iterate is ' + (typeof definition.iterate) + ' expecting string for collections.');

  if (!_.isObject(definition.elements))
    throw new Error('Model definition.elements is ' + (typeof definition.elements) + ' expecting object.');

  _.forOwn(definition.elements, function(element, key){
    if (!_.isString(element) && !_.isObject(element))
      throw new Error('Model definition.elements.' + key + ' is ' + (typeof element) + ' expecting object or string.');

    if (_.isObject(element) && !_.isString(element.attr))
      throw new Error('Model definition.elements.' + key + '.attr is ' + (typeof element.attr) + ' expecting string.');

    if (_.isObject(element) && !_.isString(element.path))
      throw new Error('Model definition.elements.' + key + '.path is ' + (typeof element.attr) + ' expecting string.');
  });

  if (!_.isUndefined(definition.validate) && !_.isFunction(definition.validate))
    throw new Error('Model definition.validate is ' + (typeof definition.validate) + ' expecting function or undefined.');

/*  if (!_.isUndefined(definition.validate) && !_.isBoolean(definition.validate({})))
    throw new Error('Model definition.validate returns ' + (typeof definition.validate({})) + ' expecting boolean.');*/

  if (!_.isUndefined(definition.format) && !_.isFunction(definition.format))
    throw new Error('Model definition.format is ' + (typeof definition.format) + ' expecting function or undefined.');

  return true;
};

module.exports = Model;