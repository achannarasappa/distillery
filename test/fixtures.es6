const _ = require('lodash');

const still = {
  posts: (distillery) => ({
    exchange: {
      request: {
        url: 'http://example.com/forum/tech',
        method: 'GET',
      },
      response: [
        {
          name: 'success',
          indicators: [
            {
              name: 'title',
              test: distillery.expect.html_element('title', 'Technology'),
            },
            {
              name: 'url',
              test: distillery.expect.url('http://example.com/forum/tech'),
            },
            {
              name: 'code',
              test: distillery.expect.http_code(200),
            },
            {
              name: 'custom',
              test: (response) => true,
            },
          ],
          validate: (indicators) => indicators.title,
        },
        {
          name: 'error',
          indicators: [
            {
              name: 'title',
              test: distillery.expect.html_element('title', 'Something went wrong'),
            },
            {
              name: 'url',
              test: distillery.expect.url('http://example.com/error'),
            },
            {
              name: 'code',
              test: distillery.expect.http_code(400),
            },
          ],
          validate: (indicators) => indicators.title && indicators.url,
        },
      ],
    },
    models: [
      {
        name: 'posts',
        type: 'collection',
        properties: {
          id: 'div.id',
          title: 'a.title',
          category: {
            path: 'a.title',
            attr: 'href',
          },
        },
        collectionPath: 'html > body > div#post-list > div',
        validate: (post) => (post.id),
        transform: (post) => {

          post.category = post.category.split('/')[1];

          return post;

        },
      },
      {
        name: 'page',
        type: 'item',
        properties: {
          current: 'a.current',
          last: 'a.last',
        },
        transform: (page) => {

          const pageInt = _.mapValues(page, _.parseInt);

          return _.assign(pageInt, {
            next: pageInt.current < pageInt.last ? pageInt.current + 1 : pageInt.last,
            previous: 1 < pageInt.current ? pageInt.current - 1 : 1,
          })

        },
      },
    ],
  }),
  auctions: (distillery) => ({
    exchange: {
      request: {
        url: 'http://example.com/auctions?show_tab={show_tab_name}&page={page}&items={show_items}&context={context}&filter={filter}',
        method: 'Get',
        parameters: [
          'filter',
          {
            name: 'show_tab_name',
            alias: 'tab',
            required: true,
            def: 'postings',
          },
          {
            name: 'page',
            required: true,
            transform: value => value * 10,
          },
          {
            name: 'show_items',
            alias: 'items',
          },
          {
            name: 'context',
            def: 'user',
            validate: value => _.contains([ 'user', 'admin' ], value),
          },
          {
            name: 'Content-Type',
            alias: 'content_type',
            type: 'header',
            required: true,
            def: 'application/x-www-form-urlencoded',
          },
        ],
      },
      response: [
        {
          name: 'success',
          indicators: [
            distillery.expect.http_code(200),
            distillery.expect.html_element('title'),
          ],
          validate: (indicators) => indicators[0] && indicators[1],
        },
        {
          name: 'success_2',
          indicators: [
            distillery.expect.http_code(200),
          ],
          validate: (indicators) => indicators[0],
        },
        {
          name: 'error',
          indicators: [
            distillery.expect.http_code(400),
          ],
          validate: (indicators) => indicators[0],
        },
      ],
    },
    models: [
      {
        name: 'auctions',
        type: 'collection',
        properties: {
          status: 'td.status',
          title: 'td.title',
          category: 'td.cat',
          id: 'td.id',
        },
        collectionPath: '#container > table > tr',
        validate: (posting) => (!_.isUndefined(posting.status) && !_.isUndefined(posting.title) && !_.isUndefined(posting.category) && !_.isUndefined(posting.id)),
      },
    ],
  }),
};

const html = {
  posts: [
    '<html>',
      '<head>',
        '<title>Technology</title>',
      '</head>',
      '<body>',
        '<div id="post-list">',
          '<div>',
            '<div class="id" class="post">1000</div>',
            '<a class="title" href="forum/tech/posts/1000">Help computer!</a>',
          '</div>',
          '<div>',
            '<div class="id" class="post">1001</div>',
            '<a class="title" href="forum/tech/posts/1001">Why is Windows so slow?</a>',
          '</div>',
          '<div>',
            '<div class="id" class="post">1002</div>',
            '<a class="title" href="forum/tech/posts/1002">How can I get rid of all these toolbars?</a>',
          '</div>',
          '<div>',
            '<a class="current">1</a>',
            '<a class="last">10</a>',
          '</div>',
        '</div>',
      '</body>',
    '</html>',
  ].join(''),
  auctions: [
    '<html>',
      '<head>',
        '<meta name="referrer" content="origin">',
        '<title>Car Auctions</title>',
      '</head>',
      '<body>',
        '<div id="container">',
          '<table>',
            '<tr>',
              '<td class="id">',
                '941254',
              '</td>',
              '<td class="status">',
                'Active',
              '</td>',
              '<td class="title">',
                '2011 Ford Mustang GT',
              '</td>',
              '<td class="cat">',
                'Coupe',
              '</td>',
            '</tr>',
            '<tr>',
              '<td class="id">',
                '941255',
              '</td>',
              '<td class="status">',
                'Pending',
              '</td>',
              '<td class="title">',
                '2013 Audi A4',
              '</td>',
              '<td class="cat">',
                'Sedan',
              '</td>',
            '</tr>',
            '<tr>',
              '<td class="id">',
                '941256',
              '</td>',
              '<td class="status">',
                'Ending Soon',
              '</td>',
              '<td class="title">',
                '2007 Honda CR-V',
              '</td>',
              '<td class="cat">',
                'SUV',
              '</td>',
            '</tr>',
          '</table>',
        '</div>',
      '</body>',
    '</html>',
  ].join(''),
  error: [
    '<html>',
      '<head>',
        '<title>Error!</title>',
      '</head>',
      '<body>',
        '<div id="container">',
          '<div class="message">Error!</div>',
        '</div>',
      '</body>',
    '</html>',
  ].join(''),
};

const response = {
  posts: {
    statusCode: 200,
    request: {
      method: 'GET',
      uri: {
        href: 'http://example.com/forum/tech',
      },
    },
    body: html.posts,
  },
  auctions: {
    statusCode: 200,
    request: {
      method: 'GET',
      uri: {
        href: 'https://example.com/auctions?show_tab=home&page=1&items={show_items}&context=user',
      },
    },
    body: html.auctions,
  },
  error: {
    statusCode: 500,
    request: {
      method: 'GET',
      uri: {
        href: 'https://example.com/auctions?show_tab=home&page=1&items={show_items}&context=user',
      },
    },
    body: html.error,
  },
};

const objects = {
  posts: [
    [
      {
        id: 1000,
        title: 'Help computer!',
        category: 'tech',
      },
      {
        id: 1001,
        title: 'Why is Windows so slow?',
        category: 'tech',
      },
      {
        id: 1002,
        title: 'How can I get rid of all these toolbars?',
        category: 'tech',
      },
    ],
    {
      current: 1,
      last: 10,
      next: 2,
      previous: 1,
    },
  ],
};

export { objects, still, response, html }
