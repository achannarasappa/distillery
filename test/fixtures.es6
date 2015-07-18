var _ = require('lodash');

module.exports.postings = function(distillery) {

  return {
    process: {
      request: {
        url: 'https://accounts.craigslist.org/login/home?show_tab={show_tab_name}&page={page}&items={show_items}&context={context}',
        method: 'Get',
        query: {
          tab: {
            name: 'show_tab_name',
            required: true,
            'default': 'postings'
          },
          page: {
            name: 'page',
            required: true
          },
          items: {
            name: 'show_items'
          },
          context: {
            name: 'context',
            'default': 'user'
          }
        },
        headers: {
          content_type: {
            name: 'Content-Type',
            required: true,
            'default': 'application/x-www-form-urlencoded'
          }
        }
      },
      response: {
        success: {
          indicators: {
            success_code: distillery.expect.http_code(200),
            success_title: distillery.expect.html_element('title')
          },
          validate: function(indicators) {

            return indicators.success_code && indicators.success_title;

          }

        },
        success_2: {
          indicators: {
            success_code: distillery.expect.http_code(200)
          },
          validate: function(indicators) {

            return indicators.success_code;

          }

        },
        error: {
          indicators: {
            error_code: distillery.expect.http_code(400)
          },
          validate: function(indicators) {

            return indicators.error_code;

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
      },
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
        iterate: 'html > div',
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

};

module.exports.postings_response = {
  statusCode: 200,
  body: '<html><head><meta name="referrer" content="origin"><link rel="stylesheet" type="text/css" href="news.css?qrWw0huwcusMXAhSZ26Y"><link rel=shortcut icon href=favicon.ico><script type=text/javascript>\nfunction byId(id) {\n  return document.getElementById(id);\n}\n\nfunction vote(node) {\n  var v = node.id.split(/_/);   // {\'up\', \'123\'}\n  var item = v[1];\n\n  // hide arrows\n  byId(\'up_\'   + item).style.visibility = \'hidden\';\n  byId(\'down_\' + item).style.visibility = \'hidden\';\n\n  // ping server\n  var ping = new Image();\n  ping.src = node.href;\n\n  return false; // cancel browser nav\n} </script><title>The decline of Vancouver | Hacker News</title></head><body><center><table id=hnmain op=item border=0 cellpadding=0 cellspacing=0 width=85% bgcolor=#f6f6ef><tr><td bgcolor=#ff6600><table border=0 cellpadding=0 cellspacing=0 width=100% style=padding:2px><tr><td style=width:18px;padding-right:4px><a href=http://www.ycombinator.com><img src=y18.gif width=18 height=18 style=border:1px #ffffff solid;></a></td><td style=line-height:12pt; height:10px;><span class=pagetop><b><a href=news>Hacker News</a></b><img src=s.gif height=1 width=10><a href=newest>new</a> | <a href=newcomments>comments</a> | <a href=show>show</a> | <a href=ask>ask</a> | <a href=jobs>jobs</a> | <a href=submit>submit</a></span></td><td style=text-align:right;padding-right:4px;><span class=pagetop><a href=login?goto=item%3Fid%3D9245441>login</a></span></td></tr></table></td></tr><tr style=height:10px></tr><tr><td><table border=0><tr><td><center><a id=up_9245441 href=vote?for=9245441&amp;dir=up&amp;goto=item%3Fid%3D9245441><div class=votearrow title=upvote></div></a><span id=down_9245441></span></center></td><td class=title><span class=deadmark></span><a href=http://sofard.tumblr.com/post/113616107456/the-decline-of-vancouver>The decline of Vancouver</a><span class=sitebit comhead> (sofard.tumblr.com)</span></td></tr><tr><td colspan=1></td><td class=subtext><span class=score id=score_9245441>24 points</span> by <a href=user?id=mathattack>mathattack</a> <a href=item?id=9245441>1 hour ago</a>  | <a href=item?id=9245441>5 comments</a></td></tr><tr style=height:10px></tr><tr><td></td><td><form method=post action=comment><input type=hidden name=parent value=9245441><input type=hidden name=goto value=item?id=9245441><input type=hidden name=hmac value=7d6e16bde8578bfc44c2a04707fccfd54ae96441><textarea name=text rows=6 cols=60 style= placeholder=></textarea><br><br>\n<input type=submit value=add comment></form></td></tr></table><br><br>\n<table border=0><tr><td><table border=0><tr><td><img src=s.gif height=1 width=0></td><td valign=top><center><a id=up_9245620 href=vote?for=9245620&amp;dir=up&amp;goto=item%3Fid%3D9245441><div class=votearrow title=upvote></div></a><span id=down_9245620></span></center></td><td class=default><div style=margin-top:2px; margin-bottom:-10px; ><span class=comhead><a href=user?id=desdiv>desdiv</a> <a href=item?id=9245620>2 minutes ago</a> <span class=deadmark></span></span></div><br>\n<span class=comment><font color=#000000><i>A 2011 study by Landcor Data showed that 74 per cent of luxury purchases in Richmond and Vancouver’s west side were by buyers with mainland Chinese names with no western variant.</i><p>Not surprising, given that Richmond is 55% Chinese[0]. West side Vancouver is probably around the same.<p>[0] <a href=http://en.wikipedia.org/wiki/Richmond,_British_Columbia#Demographics rel=nofollow>http:&#x2F;&#x2F;en.wikipedia.org&#x2F;wiki&#x2F;Richmond,_British_Columbia#Demo...</a></font></span><p><font size=1><u><a href=reply?id=9245620&amp;goto=item%3Fid%3D9245441>reply</a></u></font></td></tr></table></td></tr><tr><td><table border=0><tr><td><img src=s.gif height=1 width=0></td><td valign=top><center><a id=up_9245611 href=vote?for=9245611&amp;dir=up&amp;goto=item%3Fid%3D9245441><div class=votearrow title=upvote></div></a><span id=down_9245611></span></center></td><td class=default><div style=margin-top:2px; margin-bottom:-10px; ><span class=comhead><a href=user?id=rdlecler1>rdlecler1</a> <a href=item?id=9245611>6 minutes ago</a> <span class=deadmark></span></span></div><br>\n<span class=comment><font color=#000000>I&#x27;ve lived in Vancouver. There are really only three industries: (dodgy) junior mining, retail, and real estate. Property is bought by absentee owners who take supply out of the market, drive up prices, but do not contribute to the economy. The city is more expensive than NY without the amenities (except the outdoors), culture, or opportunity. The city should be Canada&#x27;s powerhouse but it&#x27;s turned into a high price vacation area without tourism.</font></span><p><font size=1><u><a href=reply?id=9245611&amp;goto=item%3Fid%3D9245441>reply</a></u></font></td></tr></table></td></tr><tr><td><table border=0><tr><td><img src=s.gif height=1 width=40></td><td valign=top><center><a id=up_9245624 href=vote?for=9245624&amp;dir=up&amp;goto=item%3Fid%3D9245441><div class=votearrow title=upvote></div></a><span id=down_9245624></span></center></td><td class=default><div style=margin-top:2px; margin-bottom:-10px; ><span class=comhead><a href=user?id=ams6110>ams6110</a> <a href=item?id=9245624>0 minutes ago</a> <span class=deadmark></span></span></div><br>\n<span class=comment><font color=#000000>So what&#x27;s the motivation to buying property you don&#x27;t live in. Are they renting it out? The OP made it sound like many units are vacant. Are they buying and holding hoping to sell later for more?<p>Normally a boom in high-end housing is good for local trades (plumbers, electicians, carpenters, painters, decorators, etc) as the first thing most upper-tier home buyers do when they buy a place is renovate, remodel, or at least redecorate.</font></span><p><font size=1><u><a href=reply?id=9245624&amp;goto=item%3Fid%3D9245441>reply</a></u></font></td></tr></table></td></tr><tr><td><table border=0><tr><td><img src=s.gif height=1 width=0></td><td valign=top><center><a id=up_9245591 href=vote?for=9245591&amp;dir=up&amp;goto=item%3Fid%3D9245441><div class=votearrow title=upvote></div></a><span id=down_9245591></span></center></td><td class=default><div style=margin-top:2px; margin-bottom:-10px; ><span class=comhead><a href=user?id=larsiusprime>larsiusprime</a> <a href=item?id=9245591>14 minutes ago</a> <span class=deadmark></span></span></div><br>\n<span class=comment><font color=#000000>Sounds like Vancouver could use a little Georgism:\n<a href=http://en.wikipedia.org/wiki/Georgism rel=nofollow>http:&#x2F;&#x2F;en.wikipedia.org&#x2F;wiki&#x2F;Georgism</a></font></span><p><font size=1><u><a href=reply?id=9245591&amp;goto=item%3Fid%3D9245441>reply</a></u></font></td></tr></table></td></tr><tr><td><table border=0><tr><td><img src=s.gif height=1 width=40></td><td valign=top><center><a id=up_9245610 href=vote?for=9245610&amp;dir=up&amp;goto=item%3Fid%3D9245441><div class=votearrow title=upvote></div></a><span id=down_9245610></span></center></td><td class=default><div style=margin-top:2px; margin-bottom:-10px; ><span class=comhead><a href=user?id=koenigdavidmj>koenigdavidmj</a> <a href=item?id=9245610>7 minutes ago</a> <span class=deadmark></span></span></div><br>\n<span class=comment><font color=#000000>Or as a simpler, more politically palatable approximation, set up a pied-à-terre property tax for residential properties above a certain value that are lived in for less than three months per year.</font></span><p><font size=1><u><a href=reply?id=9245610&amp;goto=item%3Fid%3D9245441>reply</a></u></font></td></tr></table></td></tr></table><br><br>\n</td></tr><tr><td><img src=s.gif height=10 width=0><table width=100% cellspacing=0 cellpadding=1><tr><td bgcolor=#ff6600></td></tr></table><br>\n<center><center><a href=http://www.ycombinator.com/apply/>Applications are open for YC Summer 2015</a></center><br>\n<span class=yclinks><a href=newsguidelines.html>Guidelines</a> | <a href=newsfaq.html>FAQ</a> | <a href=mailto:hn@ycombinator.com>Support</a> | <a href=https://github.com/HackerNews/API>API</a> | <a href=lists>Lists</a> | <a href=bookmarklet.html>Bookmarklet</a> | <a href=dmca.html>DMCA</a> | <a href=http://www.ycombinator.com/>Y Combinator</a> | <a href=http://www.ycombinator.com/apply/>Apply</a> | <a href=mailto:hn@ycombinator.com>Contact</a></span><br><br>\n<form method=get action=//hn.algolia.com/>Search: <input type=text name=q value= size=17></form></center></td></tr></table></center></body></html>',
  headers: {
    server: 'cloudflare-nginx',
    date: 'Sun, 22 Mar 2015 04:47:08 GMT',
    'content-type': 'text/html; charset=utf-8',
    'transfer-encoding': 'chunked',
    connection: 'close',
    vary: 'Accept-Encoding',
    'cache-control': 'private, max-age=0',
    'x-frame-options': 'DENY',
    'strict-transport-security': 'max-age=31556900; includeSubDomains',
    'cf-ray': '1caf41bb99c0020e-IAD'
  },
  request: {
    uri: {
      protocol: 'https:',
      slashes: true,
      auth: null,
      host: 'news.ycombinator.com',
      port: 443,
      hostname: 'news.ycombinator.com',
      hash: null,
      search: '?id=9245441',
      query: 'id=9245441',
      pathname: '/item',
      path: '/item?id=9245441',
      href: 'https://news.ycombinator.com/item?id=9245441'
    },
    method: 'GET',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  }
};

module.exports.postings_response_invalid = {
  statusCode: 500,
  body: '<html><head><meta name="referrer" content="origin"><link rel="stylesheet" type="text/css" href="news.css?qrWw0huwcusMXAhSZ26Y"><link rel=shortcut icon href=favicon.ico><script type=text/javascript>\nfunction byId(id) {\n  return document.getElementById(id);\n}\n\nfunction vote(node) {\n  var v = node.id.split(/_/);   // {\'up\', \'123\'}\n  var item = v[1];\n\n  // hide arrows\n  byId(\'up_\'   + item).style.visibility = \'hidden\';\n  byId(\'down_\' + item).style.visibility = \'hidden\';\n\n  // ping server\n  var ping = new Image();\n  ping.src = node.href;\n\n  return false; // cancel browser nav\n} </script><title>The decline of Vancouver | Hacker News</title></head><body><center><table id=hnmain op=item border=0 cellpadding=0 cellspacing=0 width=85% bgcolor=#f6f6ef><tr><td bgcolor=#ff6600><table border=0 cellpadding=0 cellspacing=0 width=100% style=padding:2px><tr><td style=width:18px;padding-right:4px><a href=http://www.ycombinator.com><img src=y18.gif width=18 height=18 style=border:1px #ffffff solid;></a></td><td style=line-height:12pt; height:10px;><span class=pagetop><b><a href=news>Hacker News</a></b><img src=s.gif height=1 width=10><a href=newest>new</a> | <a href=newcomments>comments</a> | <a href=show>show</a> | <a href=ask>ask</a> | <a href=jobs>jobs</a> | <a href=submit>submit</a></span></td><td style=text-align:right;padding-right:4px;><span class=pagetop><a href=login?goto=item%3Fid%3D9245441>login</a></span></td></tr></table></td></tr><tr style=height:10px></tr><tr><td><table border=0><tr><td><center><a id=up_9245441 href=vote?for=9245441&amp;dir=up&amp;goto=item%3Fid%3D9245441><div class=votearrow title=upvote></div></a><span id=down_9245441></span></center></td><td class=title><span class=deadmark></span><a href=http://sofard.tumblr.com/post/113616107456/the-decline-of-vancouver>The decline of Vancouver</a><span class=sitebit comhead> (sofard.tumblr.com)</span></td></tr><tr><td colspan=1></td><td class=subtext><span class=score id=score_9245441>24 points</span> by <a href=user?id=mathattack>mathattack</a> <a href=item?id=9245441>1 hour ago</a>  | <a href=item?id=9245441>5 comments</a></td></tr><tr style=height:10px></tr><tr><td></td><td><form method=post action=comment><input type=hidden name=parent value=9245441><input type=hidden name=goto value=item?id=9245441><input type=hidden name=hmac value=7d6e16bde8578bfc44c2a04707fccfd54ae96441><textarea name=text rows=6 cols=60 style= placeholder=></textarea><br><br>\n<input type=submit value=add comment></form></td></tr></table><br><br>\n<table border=0><tr><td><table border=0><tr><td><img src=s.gif height=1 width=0></td><td valign=top><center><a id=up_9245620 href=vote?for=9245620&amp;dir=up&amp;goto=item%3Fid%3D9245441><div class=votearrow title=upvote></div></a><span id=down_9245620></span></center></td><td class=default><div style=margin-top:2px; margin-bottom:-10px; ><span class=comhead><a href=user?id=desdiv>desdiv</a> <a href=item?id=9245620>2 minutes ago</a> <span class=deadmark></span></span></div><br>\n<span class=comment><font color=#000000><i>A 2011 study by Landcor Data showed that 74 per cent of luxury purchases in Richmond and Vancouver’s west side were by buyers with mainland Chinese names with no western variant.</i><p>Not surprising, given that Richmond is 55% Chinese[0]. West side Vancouver is probably around the same.<p>[0] <a href=http://en.wikipedia.org/wiki/Richmond,_British_Columbia#Demographics rel=nofollow>http:&#x2F;&#x2F;en.wikipedia.org&#x2F;wiki&#x2F;Richmond,_British_Columbia#Demo...</a></font></span><p><font size=1><u><a href=reply?id=9245620&amp;goto=item%3Fid%3D9245441>reply</a></u></font></td></tr></table></td></tr><tr><td><table border=0><tr><td><img src=s.gif height=1 width=0></td><td valign=top><center><a id=up_9245611 href=vote?for=9245611&amp;dir=up&amp;goto=item%3Fid%3D9245441><div class=votearrow title=upvote></div></a><span id=down_9245611></span></center></td><td class=default><div style=margin-top:2px; margin-bottom:-10px; ><span class=comhead><a href=user?id=rdlecler1>rdlecler1</a> <a href=item?id=9245611>6 minutes ago</a> <span class=deadmark></span></span></div><br>\n<span class=comment><font color=#000000>I&#x27;ve lived in Vancouver. There are really only three industries: (dodgy) junior mining, retail, and real estate. Property is bought by absentee owners who take supply out of the market, drive up prices, but do not contribute to the economy. The city is more expensive than NY without the amenities (except the outdoors), culture, or opportunity. The city should be Canada&#x27;s powerhouse but it&#x27;s turned into a high price vacation area without tourism.</font></span><p><font size=1><u><a href=reply?id=9245611&amp;goto=item%3Fid%3D9245441>reply</a></u></font></td></tr></table></td></tr><tr><td><table border=0><tr><td><img src=s.gif height=1 width=40></td><td valign=top><center><a id=up_9245624 href=vote?for=9245624&amp;dir=up&amp;goto=item%3Fid%3D9245441><div class=votearrow title=upvote></div></a><span id=down_9245624></span></center></td><td class=default><div style=margin-top:2px; margin-bottom:-10px; ><span class=comhead><a href=user?id=ams6110>ams6110</a> <a href=item?id=9245624>0 minutes ago</a> <span class=deadmark></span></span></div><br>\n<span class=comment><font color=#000000>So what&#x27;s the motivation to buying property you don&#x27;t live in. Are they renting it out? The OP made it sound like many units are vacant. Are they buying and holding hoping to sell later for more?<p>Normally a boom in high-end housing is good for local trades (plumbers, electicians, carpenters, painters, decorators, etc) as the first thing most upper-tier home buyers do when they buy a place is renovate, remodel, or at least redecorate.</font></span><p><font size=1><u><a href=reply?id=9245624&amp;goto=item%3Fid%3D9245441>reply</a></u></font></td></tr></table></td></tr><tr><td><table border=0><tr><td><img src=s.gif height=1 width=0></td><td valign=top><center><a id=up_9245591 href=vote?for=9245591&amp;dir=up&amp;goto=item%3Fid%3D9245441><div class=votearrow title=upvote></div></a><span id=down_9245591></span></center></td><td class=default><div style=margin-top:2px; margin-bottom:-10px; ><span class=comhead><a href=user?id=larsiusprime>larsiusprime</a> <a href=item?id=9245591>14 minutes ago</a> <span class=deadmark></span></span></div><br>\n<span class=comment><font color=#000000>Sounds like Vancouver could use a little Georgism:\n<a href=http://en.wikipedia.org/wiki/Georgism rel=nofollow>http:&#x2F;&#x2F;en.wikipedia.org&#x2F;wiki&#x2F;Georgism</a></font></span><p><font size=1><u><a href=reply?id=9245591&amp;goto=item%3Fid%3D9245441>reply</a></u></font></td></tr></table></td></tr><tr><td><table border=0><tr><td><img src=s.gif height=1 width=40></td><td valign=top><center><a id=up_9245610 href=vote?for=9245610&amp;dir=up&amp;goto=item%3Fid%3D9245441><div class=votearrow title=upvote></div></a><span id=down_9245610></span></center></td><td class=default><div style=margin-top:2px; margin-bottom:-10px; ><span class=comhead><a href=user?id=koenigdavidmj>koenigdavidmj</a> <a href=item?id=9245610>7 minutes ago</a> <span class=deadmark></span></span></div><br>\n<span class=comment><font color=#000000>Or as a simpler, more politically palatable approximation, set up a pied-à-terre property tax for residential properties above a certain value that are lived in for less than three months per year.</font></span><p><font size=1><u><a href=reply?id=9245610&amp;goto=item%3Fid%3D9245441>reply</a></u></font></td></tr></table></td></tr></table><br><br>\n</td></tr><tr><td><img src=s.gif height=10 width=0><table width=100% cellspacing=0 cellpadding=1><tr><td bgcolor=#ff6600></td></tr></table><br>\n<center><center><a href=http://www.ycombinator.com/apply/>Applications are open for YC Summer 2015</a></center><br>\n<span class=yclinks><a href=newsguidelines.html>Guidelines</a> | <a href=newsfaq.html>FAQ</a> | <a href=mailto:hn@ycombinator.com>Support</a> | <a href=https://github.com/HackerNews/API>API</a> | <a href=lists>Lists</a> | <a href=bookmarklet.html>Bookmarklet</a> | <a href=dmca.html>DMCA</a> | <a href=http://www.ycombinator.com/>Y Combinator</a> | <a href=http://www.ycombinator.com/apply/>Apply</a> | <a href=mailto:hn@ycombinator.com>Contact</a></span><br><br>\n<form method=get action=//hn.algolia.com/>Search: <input type=text name=q value= size=17></form></center></td></tr></table></center></body></html>',
  headers: {
    server: 'cloudflare-nginx',
    date: 'Sun, 22 Mar 2015 04:47:08 GMT',
    'content-type': 'text/html; charset=utf-8',
    'transfer-encoding': 'chunked',
    connection: 'close',
    vary: 'Accept-Encoding',
    'cache-control': 'private, max-age=0',
    'x-frame-options': 'DENY',
    'strict-transport-security': 'max-age=31556900; includeSubDomains',
    'cf-ray': '1caf41bb99c0020e-IAD'
  },
  request: {
    uri: {
      protocol: 'https:',
      slashes: true,
      auth: null,
      host: 'news.ycombinator.com',
      port: 443,
      hostname: 'news.ycombinator.com',
      hash: null,
      search: '?id=9245441',
      query: 'id=9245441',
      pathname: '/item',
      path: '/item?id=9245441',
      href: 'https://news.ycombinator.com/item?id=9245441'
    },
    method: 'GET',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  }
};

module.exports.still = {
  posts: (distillery) => ({
    process: {
      request: {
        url: 'http://example.com/forum/tech',
        method: 'GET'
      },
      response: {
        success: {
          indicators: {
            title: distillery.expect.html_element('title', 'Technology'),
            url: distillery.expect.url('http://example.com/forum/tech'),
            code: distillery.expect.http_code(200),
            custom: (response) => true,
          },
          validate: (indicators) => indicators.title,
        },
        error: {
          indicators: {
            title: distillery.expect.html_element('title', 'Something went wrong'),
            url: distillery.expect.url('http://example.com/error'),
            code: distillery.expect.http_code(400),
          },
          validate: (indicators) => indicators.title && indicators.url,
        },
      },
    },
    models: [
      {
        name: 'posts',
        type: 'collection',
        elements: {
          id: 'div.id',
          title: 'a.title',
          category: {
            path: 'a.title',
            attr: 'href',
          },
        },
        iterate: 'html > body > div#post-list > div',
        validate: (post) => (post.id),
        format: (post) => {

          post.category = post.category.split('/')[1];

          return post;

        },
      },
      {
        name: 'page',
        type: 'item',
        elements: {
          current: 'a.current',
          last: 'a.last',
        },
        format: (page) => {

          const pageInt = _.mapValues(page, _.parseInt);

          return _.assign(pageInt, {
            next: pageInt.current < pageInt.last ? pageInt.current + 1 : pageInt.last,
            previous: 1 < pageInt.current ? pageInt.current - 1 : 1
          })

        },
      },
    ],
  }),
};

var html = module.exports.html = {
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
  ].join('')
};

module.exports.response = {
  posts: {
    request: {
      method: 'GET',
      uri: 'http://example.com/forum/tech',
    },
    body: html.posts,
  },
};

module.exports.objects = {
  posts: [
    [
      {
        id: 1000,
        title: 'Help computer!',
        category: 'tech'
      },
      {
        id: 1001,
        title: 'Why is Windows so slow?',
        category: 'tech'
      },
      {
        id: 1002,
        title: 'How can I get rid of all these toolbars?',
        category: 'tech'
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
