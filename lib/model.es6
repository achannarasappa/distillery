const _ = require('lodash');
const cheerio = require('cheerio');

class Model {

  constructor(definition, options = {}) {

    this.options = options;

    if (validateDefinition(definition))
      _.extend(this, definition)

  }

  parse(html) {

    const $ = cheerio.load(html);

    if (this.type === 'collection')
      return this._parseCollection($);

    if (this.type === 'item')
      return this._applyFilters(this._parseItem($));

  }

  _applyFilters(item) {

    if (_.isFunction(this.validate) && _.isFunction(this.format))
      return (this.validate(item) ? this.format(item) : null);

    if (_.isFunction(this.validate))
      return (this.validate(item) ? item : null);

    if (_.isFunction(this.format))
      return this.format(item);

    return item

  }

  _parseIteration($) {

    return $(this.iterate).map((key, val) => cheerio.load('<html>' + $(val).html() + '</html>'))

  }

  _parseCollection($) {

    return _(this._parseIteration($))
      .map(($) => this._applyFilters(this._parseItem($)))
      .reject(_.isNull)
      .value()

  }

  _parseItem($) {

    return _.mapValues(this.elements, (element) => parseElement(element, $))

  }

}

const parseElement = (element, $) => {

  if (_.isFunction(element))
    return element($);

  if (_.isObject(element) && _.has(element, 'regex'))
    return _.chain($(element.path)
      .map(() => {

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

const validateDefinition = (definition) => {

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

export default Model;
