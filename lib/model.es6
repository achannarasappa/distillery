var _ = require('lodash');
var cheerio = require('cheerio');

var Model = function(definition, options) {
  
  if (!(this instanceof Model)) return new Model(definition, options);

  this.options = _.defaults(options || {}, this.options);

  if (validateDefinition(definition)) _.extend(this, definition)

};

Model.prototype.parse = function(html) {
  
  var $ = cheerio.load(html);

  if (this.type === 'collection')
    return this._parseCollection($);

  if (this.type === 'item')
    return this._applyFilters(this._parseItem($));

};

Model.prototype._applyFilters = function(item) {

  if (_.isFunction(this.validate) && _.isFunction(this.format))
    return (this.validate(item) ? this.format(item) : null);
  
  if (_.isFunction(this.validate))
    return (this.validate(item) ? item : null);

  if (_.isFunction(this.format))
    return this.format(item);
  
  return item
  
};

Model.prototype._parseIteration = function($) {
  
  return $(this.iterate).map(function(key, val) {

    return cheerio.load('<html>' + $(val).html() + '</html>');
    
  })

};

Model.prototype._parseCollection = function($) {
  
  var self = this;

  return _.reject(_.map(self._parseIteration($), function($) {
    
    return self._applyFilters(self._parseItem($))
    
  }), _.isNull);

};

Model.prototype._parseItem = function($) {
  
  var self = this;
  
  return _.mapValues(self.elements, function(element) {
    
    return parseElement(element, $);
    
  })

};

var parseElement = function(element, $) {

  if (_.isFunction(element))
    return element($);

  if (_.isObject(element) && _.has(element, 'regex'))
    return _.chain($(element.path)
      .map(function() {

        if (element.regex.test($(this).text()))
          return _.has(element, 'attr') ? $(this).attr(element.attr) : $(this).text();

        return null;

      }))
      .reject(_.isNull)
      .first()
      .value();
  
  if (_.isObject(element) && _.has(element, 'attr'))
    return $(element.path).first().attr(element.attr);

  if (_.isString(element))
    return $(element).first().text();

};

var validateDefinition = function(definition) {

  if (!_.isObject(definition))
    throw new Error('Model definition is ' + (typeof definition) + ' expecting object.');

  if (!_.isString(definition.type))
    throw new Error('Model definition.type is ' + (typeof definition.type) + ' expecting string.');
  
  if (!_.isString(definition.name))
    throw new Error('Model definition.name is ' + (typeof definition.name) + ' expecting string.');

  if (definition.type.toLowerCase() !== 'collection' && definition.type.toLowerCase() !== 'item')
    throw new Error('Model definition.type expects \'collection\' or \'item\'.');

  if (definition.type.toLowerCase() === 'collection' && !_.isString(definition.iterate))
    throw new Error('Model definition.iterate is ' + (typeof definition.iterate) + ' expecting string for collections.');

  if (!_.isObject(definition.elements))
    throw new Error('Model definition.elements is ' + (typeof definition.elements) + ' expecting object.');

  _.forOwn(definition.elements, function(element, key) {
    
    if (!_.isString(element) && !_.isPlainObject(element) && !_.isFunction(element))
      throw new Error('Model definition.elements.' + key + ' is ' + (typeof element) + ' expecting object, string, or function.');

    if (_.isPlainObject(element) && !_.isString(element.path))
      throw new Error('Model definition.elements.' + key + '.path is ' + (typeof element.attr) + ' expecting string.');

  });
  
  return true;
  
};

module.exports = Model;
