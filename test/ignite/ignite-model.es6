const _ = require('lodash');
const expect = require('expect.js');
const cheerio = require('cheerio');
const stripAnsi = require('strip-ansi');
import Ignite from '../../lib/ignite/ignite';
import IgniteModel from '../../lib/ignite/ignite-model';
import * as fixtures from '../fixtures';

describe('IgniteModel', () => {

  const ignite = new Ignite(fixtures.still.posts);
  const itemDefinition = ignite.still.models[1];
  const itemIgniteModel = new IgniteModel(itemDefinition);
  const iterationDefinition = ignite.still.models[0];
  const iterationIgniteModel = new IgniteModel(iterationDefinition);
  const collectionDefinition = ignite.still.models[0];
  const collectionIgniteModel = new IgniteModel(collectionDefinition);
  const response = fixtures.response.posts;
  const $ = cheerio.load(response[0]);
  const iterationTableString = [
    '┌──────┬──────────────────────────────────────────┬───────────────────────┐\n',
    '│ id   │ title                                    │ category              │\n',
    '├──────┼──────────────────────────────────────────┼───────────────────────┤\n',
    '│ 1000 │ Help computer!                           │ forum/tech/posts/1000 │\n',
    '├──────┼──────────────────────────────────────────┼───────────────────────┤\n',
    '│ 1001 │ Why is Windows so slow?                  │ forum/tech/posts/1001 │\n',
    '├──────┼──────────────────────────────────────────┼───────────────────────┤\n',
    '│ 1002 │ How can I get rid of all these toolbars? │ forum/tech/posts/1002 │\n',
    '├──────┼──────────────────────────────────────────┼───────────────────────┤\n',
    '│      │                                          │ not found             │\n',
    '└──────┴──────────────────────────────────────────┴───────────────────────┘',
  ].join('');
  const collectionTableString = [
    '┌──────┬──────────────────────────────────────────┬──────────┐\n',
    '│ id   │ title                                    │ category │\n',
    '├──────┼──────────────────────────────────────────┼──────────┤\n',
    '│ 1000 │ Help computer!                           │ tech     │\n',
    '├──────┼──────────────────────────────────────────┼──────────┤\n',
    '│ 1001 │ Why is Windows so slow?                  │ tech     │\n',
    '├──────┼──────────────────────────────────────────┼──────────┤\n',
    '│ 1002 │ How can I get rid of all these toolbars? │ tech     │\n',
    '└──────┴──────────────────────────────────────────┴──────────┘',
  ].join('');
  const itemTableString = [
    '┌─────────┬────┐\n',
    '│ current │ 1  │\n',
    '├─────────┼────┤\n',
    '│ last    │ 10 │\n',
    '└─────────┴────┘',
  ].join('');
  const itemTableTransformedString = [
    '┌──────────┬────┐\n',
    '│ current  │ 1  │\n',
    '├──────────┼────┤\n',
    '│ last     │ 10 │\n',
    '├──────────┼────┤\n',
    '│ next     │ 2  │\n',
    '├──────────┼────┤\n',
    '│ previous │ 1  │\n',
    '└──────────┴────┘',
  ].join('');
  const summaryTableString = [
    '┌────────────┬───┐\n',
    '│ Total      │ 4 │\n',
    '├────────────┼───┤\n',
    '│ ✗ Rejected │ 1 │\n',
    '├────────────┼───┤\n',
    '│ ✓ Valid    │ 3 │\n',
    '└────────────┴───┘',
  ].join('');

  describe('constructor()', () => {

    it('should set default options', () => {

      expect(itemIgniteModel.options).to.only.have.keys('table', 'table_item_count', 'item_max_length', 'item_transform')

    });

  });

  describe('.prototype._getItemTable()', () => {

    it('should transform the item properties if the \'item_transform\' option is set', () => {

      const itemIgniteModelTransform = new IgniteModel(itemDefinition, { item_transform: true });
      const [dataTable, summaryTable] = itemIgniteModelTransform._getItemTables($);

      expect(stripAnsi(dataTable)).to.be(itemTableTransformedString);
      expect(stripAnsi(summaryTable)).to.be('');

    });

    it('should not transform the item properties if the \'item_transform\' option is not set', () => {

      const [dataTable, summaryTable] = itemIgniteModel._getItemTables($);

      expect(stripAnsi(dataTable)).to.be(itemTableString);
      expect(stripAnsi(summaryTable)).to.be('');

    });

  });

  describe('.prototype._getCollectionTable()', () => {

    it('should generate the string for a collection table if the \'item_transform\' option is set', () => {

      const collectionIgniteModelTransformed = new IgniteModel(collectionDefinition, { item_transform: true });
      const [dataTable, summaryTable] = collectionIgniteModelTransformed._getCollectionTables($);

      expect(stripAnsi(dataTable)).to.be(collectionTableString);
      expect(stripAnsi(summaryTable)).to.be(summaryTableString);

    });

    it('should generate the string for a iteration table if the \'item_transform\' option is false', () => {

      const collectionIgniteModelUntransformed = new IgniteModel(collectionDefinition, { item_transform: false });
      const [dataTable, summaryTable] = collectionIgniteModelUntransformed._getCollectionTables($);

      expect(stripAnsi(dataTable)).to.be(iterationTableString);
      expect(stripAnsi(summaryTable)).to.be(summaryTableString);

    });

    it('should generate the string for a iteration table if the \'item_transform\' option is not set', () => {

      const [dataTable, summaryTable] = collectionIgniteModel._getCollectionTables($);

      expect(stripAnsi(dataTable)).to.be(iterationTableString);
      expect(stripAnsi(summaryTable)).to.be(summaryTableString);

    });

    it('should not show a collection or iteration table if the \'table\' option is false', () => {

      const collectionIgniteModelTable = new IgniteModel(collectionDefinition, { table: false });
      const [dataTable, summaryTable] = collectionIgniteModelTable._getCollectionTables($);

      expect(stripAnsi(dataTable)).to.be('');
      expect(stripAnsi(summaryTable)).to.be(summaryTableString);

    });

  });

  describe('.prototype._buildItemTable()', () => {

    it('should generate the string for an item table', () => {

      const item = itemIgniteModel._parseItem($);

      expect(stripAnsi(itemIgniteModel._buildItemTable(item))).to.be(itemTableString)

    });

  });

  describe('.prototype._buildCollectionTable()', () => {

    it('should generate the string for an collection table', () => {

      const collection = collectionIgniteModel._parseCollection($);

      expect(stripAnsi(collectionIgniteModel._buildCollectionTable(collection))).to.be(collectionTableString)

    });

  });

  describe('.prototype._buildIterationTable()', () => {

    it('should generate the string for an iteration table', () => {

      const iteration = iterationIgniteModel._parseIteration($);

      expect(stripAnsi(iterationIgniteModel._buildIterationTable(iteration))).to.be(iterationTableString)

    });

  });

  describe('.prototype._buildSummaryTable()', () => {

    it('should generate the string for an iteration table', () => {

      const collection = collectionIgniteModel._parseCollection($);
      const iteration = iterationIgniteModel._parseIteration($);

      expect(stripAnsi(collectionIgniteModel._buildSummaryTable(collection.length, iteration.length))).to.be(summaryTableString)

    });

  });

});
