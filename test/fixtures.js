var _ = require('lodash');

var fixtures = {

  postings: function(distillery) {

    return {
      process: {
        request: {
          url: 'https://accounts.craigslist.org/login/home?show_tab=postings',
          method: 'GET'
        },
        response: {
          success: {
            indicators: {
              success_code: distillery.expect.http_code(200),
              account_title: distillery.expect.html_element('head > title', 'craigslist account')
            },
            validate: function(indicators) {

              return indicators.success_code && indicators.account_title;

            }

          }
        }
      },
      models: [
        {
          name: 'postings',
          type: 'collection',
          elements: {
            status: 'td.status > small',
            title: 'td.title',
            area: 'td.areacat > small > b',
            category: 'td.areacat > small',
            posted_date: 'td.dates > small',
            id: 'td.postingID > small'
          },
          iterate: '#paginator > table > tr',
          validate: function(posting) {

            return (!_.isUndefined(posting.status) && !_.isUndefined(posting.title) && !_.isUndefined(posting.area) && !_.isUndefined(posting.category) && !_.isUndefined(posting.posted_date) && !_.isUndefined(posting.id))

          },
          format: function(posting) {

            var title = posting.title.replace(/(\r\n|\n|\r)/gm, '').trim().replace(/\s+/g, ' ').split(' - ');

            posting.title = title[0];
            posting.price = title[1];

            posting.category = posting.category.split(/\s{2,}/g)[1];

            return posting;

          }
        }
      ]
    }

  }

};

module.exports = fixtures;
