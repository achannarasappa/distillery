const _ = require('lodash');
const cheerio = require('cheerio');
import { validateModel } from './validate';

const parseElement = (element, $) => {

  if (_.isFunction(element))
    return element($);

  if (_.isObject(element) && _.has(element, 'regex')) {

    const matchedElements = $(element.path)
      .map(function() {

        if (element.regex.test($(this).text()))
          return _.has(element, 'attr') ? $(this).attr(element.attr) : $(this).text();

        return null;

      });

    return _.chain(matchedElements)
      .reject(_.isNull)
      .first()
      .value();

  }

  if (_.isObject(element) && _.has(element, 'attr'))
    return $(element.path).first().attr(element.attr);

  if (_.isString(element))
    return $(element).first().text();

};

class Model {

  constructor(definition, options = {}) {

    this.options = options;

    if (validateModel(definition))
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

    if (_.isFunction(this.predicate) && _.isFunction(this.transform))
      return (this.predicate(item) ? this.transform(item) : null);

    if (_.isFunction(this.predicate))
      return (this.predicate(item) ? item : null);

    if (_.isFunction(this.transform))
      return this.transform(item);

    return item

  }

  _parseIteration($) {

    return $(this.collectionPath).map((key, val) => cheerio.load('<html>' + $(val).html() + '</html>'))

  }

  _parseCollection($) {

    return _(this._parseIteration($))
      .map(($) => this._applyFilters(this._parseItem($)))
      .reject(_.isNull)
      .value()

  }

  _parseItem($) {

    return _.mapValues(this.properties, (element) => parseElement(element, $))

  }

}

export default Model;
