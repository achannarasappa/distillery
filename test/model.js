var expect = require('expect.js');
var _ = require('lodash');
var cheerio = require('cheerio');
var Distillery = require('../');
var Model = require('../lib/model');
var fixtures = require('./fixtures');

describe('Model', function() {

  var distillery = new Distillery(fixtures.still.posts);
  var itemDefinition = fixtures.still.posts(distillery).models[1];
  var itemModel = new Model(itemDefinition);
  var itemObject = fixtures.objects.posts[1];
  var collectionDefinition = fixtures.still.posts(distillery).models[0];
  var collectionModel = new Model(collectionDefinition);
  var collectionObject = fixtures.objects.posts[0];
  var html = fixtures.html.posts;
  var $ = cheerio.load(html);

  describe('Constructor', function() {

    it('should be an instance of Model', function() {

      expect(collectionModel).to.be.an(Model);

    });

    it('should extend model with the definition', function() {

      expect(itemDefinition.name).to.eql(itemDefinition.name);
      expect(itemDefinition.type).to.eql(itemDefinition.type);
      expect(itemDefinition.elements).to.eql(itemDefinition.elements);

    });

  });

  describe('.prototype.parse', function() {

    it('should return an array of objects if model.type is \'collection\'', function() {

      expect(collectionModel.parse(html)).to.eql(collectionObject);

    });

    it('should return an object if model.type is \'item\'', function() {

      expect(itemModel.parse(html)).to.eql(itemObject);

    });

  });

  describe('.prototype._parseCollection', function() {

    it('should return an array with no null elements', function() {

      expect(collectionModel._parseCollection($)).to.not.contain(null)

    });

  });

  describe('.prototype._applyFilters', function() {

    it('should return null if both model.validate and model.format are defined and model.validate returns false', function() {

      expect(collectionModel._applyFilters({ title: 'How do I change the oil on a 2007 Honda CRV?', category: 'forum/cars/posts/2046' })).to.be(null);

    });

    it('should return the formatted item if both model.validate and model.format are defined and model.validate returns true', function() {

      expect(collectionModel._applyFilters({ id: 2046, title: 'How do I change the oil on a 2007 Honda CRV?', category: 'forum/cars/posts/2046' })).to.eql({ id: 2046, title: 'How do I change the oil on a 2007 Honda CRV?', category: 'cars' });

    });

    it('should return null if model.validate is defined and model.format is not defined and model.validate returns false', function() {

      expect(new Model(_.omit(collectionDefinition, 'format'))._applyFilters({ title: 'How do I change the oil on a 2007 Honda CRV?', category: 'forum/cars/posts/2046' })).to.be(null);

    });

    it('should return the item if model.validate is defined and model.format is not defined and model.validate returns true', function() {

      expect(new Model(_.omit(collectionDefinition, 'format'))._applyFilters({ id: 2046, title: 'How do I change the oil on a 2007 Honda CRV?', category: 'forum/cars/posts/2046' })).to.eql({ id: 2046, title: 'How do I change the oil on a 2007 Honda CRV?', category: 'forum/cars/posts/2046' });

    });

    it('should return the formatted item if model.validate is not defined and model.format is defined', function() {

      expect(new Model(_.omit(collectionDefinition, 'validate'))._applyFilters({ id: 2046, title: 'How do I change the oil on a 2007 Honda CRV?', category: 'forum/cars/posts/2046' })).to.eql({ id: 2046, title: 'How do I change the oil on a 2007 Honda CRV?', category: 'cars' });
      expect(new Model(_.omit(collectionDefinition, 'validate'))._applyFilters({ title: 'How do I change the oil on a 2007 Honda CRV?', category: 'forum/cars/posts/2046' })).to.eql({ title: 'How do I change the oil on a 2007 Honda CRV?', category: 'cars' });

    });

    it('should return the item if model.validate is not defined and model.format is not defined', function() {

      expect(new Model(_.omit(collectionDefinition, [ 'validate', 'format' ]))._applyFilters({ id: 2046, title: 'How do I change the oil on a 2007 Honda CRV?', category: 'forum/cars/posts/2046' })).to.eql({ id: 2046, title: 'How do I change the oil on a 2007 Honda CRV?', category: 'forum/cars/posts/2046' });
      expect(new Model(_.omit(collectionDefinition, [ 'validate', 'format' ]))._applyFilters({ title: 'How do I change the oil on a 2007 Honda CRV?', category: 'forum/cars/posts/2046' })).to.eql({ title: 'How do I change the oil on a 2007 Honda CRV?', category: 'forum/cars/posts/2046' });

    });

  });

  describe('.prototype._parseIteration', function() {

    it('should wrap each iteration in <html></html> tags', function() {

      var postHTML = [
        [
          '<html>',
            '<div class="id">1000</div>',
            '<a class="title" href="forum/tech/posts/1000">Help computer!</a>',
          '</html>'
        ].join(''),
        [
          '<html>',
            '<div class="id">1001</div>',
            '<a class="title" href="forum/tech/posts/1001">Why is Windows so slow?</a>',
          '</html>'
        ].join(''),
        [
          '<html>',
            '<div class="id">1002</div>',
            '<a class="title" href="forum/tech/posts/1002">How can I get rid of all these toolbars?</a>',
          '</html>'
        ].join(''),
        [
          '<html>',
            '<a class="current">1</a>',
            '<a class="last">10</a>',
          '</html>'
        ].join('')
      ];

      expect(collectionModel._parseIteration($)[0].html()).to.eql(postHTML[0]);
      expect(collectionModel._parseIteration($)[1].html()).to.eql(postHTML[1]);
      expect(collectionModel._parseIteration($)[2].html()).to.eql(postHTML[2]);
      expect(collectionModel._parseIteration($)[3].html()).to.eql(postHTML[3]);

    });

  });

  describe('.prototype._parseItem', function() {

    it('should return an object with all values as strings', function() {

      expect(itemModel._parseItem($)).to.eql({ current: 1, last: 10 })

    });

  });

  describe('parseElement', function() {

    var itemDefinitionRegexAttr = {
      name: 'post1000',
      type: 'item',
      elements: {
        id: 'div.id',
        title: {
          path: 'a.title',
          attr: 'href',
          regex: /computer/
        },
        category: {
          path: 'a.title',
          attr: 'href'
        }
      }
    };

    var itemDefinitionRegex = {
      name: 'post1000',
      type: 'item',
      elements: {
        id: 'div.id',
        title: {
          path: 'a.title',
          regex: /computer/
        },
        category: {
          path: 'a.title',
          attr: 'href'
        }
      }
    };

    var itemDefinitionAttr = {
      name: 'post1000',
      type: 'item',
      elements: {
        id: 'div.id',
        title: 'a.title',
        category: {
          path: 'a.title',
          attr: 'href'
        }
      }
    };

    var itemDefinitionFunction = {
      name: 'post1000',
      type: 'item',
      elements: {
        id: 'div.id',
        title: function($) {

          return $('div#post-list > div').eq(0).html()

        },
        category: {
          path: 'a.title',
          attr: 'href'
        }
      }
    };

    it('should return result of a user defined function with a cheerio selector at the first argument', function() {

      expect(new Model(itemDefinitionFunction)._parseItem($).title).to.be('<div class="id">1000</div><a class="title" href="forum/tech/posts/1000">Help computer!</a>')

    });

    it('should return the attribute text of the first occurrence of the element that matches \'regex\' if the element is an object and has the properties \'regex\' and \'attr\'', function() {

      expect(new Model(itemDefinitionRegexAttr)._parseItem($).title).to.be('forum/tech/posts/1000')

    });

    it('should return the inner text of the first occurrence of the element that matches \'regex\' if the element is an object and has the property \'regex\' and no \'attr\' property', function() {

      expect(new Model(itemDefinitionRegex)._parseItem($).title).to.be('Help computer!')

    });

    it('should return the attribute text of the first occurrence of the element if the element is an object and has the property \'attr\' and no \'regex\' property', function() {

      expect(new Model(itemDefinitionAttr)._parseItem($).category).to.be('forum/tech/posts/1000')

    });

    it('should return the inner text of the first occurrence of the element if the element is string', function() {

      expect(new Model(itemDefinitionAttr)._parseItem($).id).to.be('1000')

    });

  });

});
