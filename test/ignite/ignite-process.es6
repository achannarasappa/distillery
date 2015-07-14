import IgniteProcess from '../../lib/ignite/ignite-process';
const expect = require('expect.js');
const _ = require('lodash');
const Ignite = require('../../lib/ignite/ignite');
const fixtures = require('../fixtures');

describe('IgniteProcess', () => {

  const ignite = new Ignite(fixtures.still.posts);
  const definition = ignite.still.process;
  const igniteProcess = new IgniteProcess(definition);
  const response = fixtures.response.posts;

  describe('constructor()', () => {

    it('should set default options', () => {

      expect(igniteProcess.options).to.only.have.keys('jar', 'indicators', 'save_html', 'save_cookie', 'restore_cookie')

    });

  });

  describe('.prototype._getSummaryAnalysis()', () => {

    it('should have one array for every indicator for every response', () => {

      expect(igniteProcess._getSummaryAnalysis(response, 'success')).to.have.length(7)

    });

  });

  describe('getResponseAnalysis', () => {

    it('should have one array for every indicator in the given response', () => {

      const successIndicators = _.filter(igniteProcess._getSummaryAnalysis(response, 'success'), (indicatorAnalysis) => _.contains(indicatorAnalysis, 'success'));
      const errorIndicators = _.filter(igniteProcess._getSummaryAnalysis(response, 'success'), (indicatorAnalysis) => _.contains(indicatorAnalysis, 'error'));

      expect(successIndicators).to.have.length(4);
      expect(errorIndicators).to.have.length(3);

    });

    it('should not return any arrays with undefined elements', () => {

      const undefinedIndicators = _.filter(igniteProcess._getSummaryAnalysis(response, 'success'), (indicatorAnalysis) => _.contains(indicatorAnalysis, undefined));

      expect(undefinedIndicators).to.have.length(0);

    });

  });

  describe('getIndicatorAnalysis', () => {

    it('should return a row with a name column of \'custom\' if the indicator does not have a \'name\', \'valid\', or \'actual\' property or is not a plain object.', () => {

      const customIndicator = igniteProcess._getSummaryAnalysis(response, 'success')[3][3];

      expect(customIndicator).to.be('custom')

    });

    it('should return a row with a length of 7', () => {

      const firstIndicator = _.first(igniteProcess._getSummaryAnalysis(response, 'success'));

      expect(firstIndicator).to.have.length(7)

    });

  });

});
