#Distillery
200 proof web scraping

##Overview
Build simple and maintainable web scrapers through configuration over code.
Create one configuration file that contains instructions for making a single HTTP request and how to distill the returned html into easily consumable objects.

##Installation
```
npm install distillery-js --save
```

##Stills
Stills are the configuration object that defines how to extract and present data from a single web page. A still is a function that returns an object with a specific structure shown here:
```javascript
module.exports = function(distillery) {
  
  return {
    process: {
      request: {
        ...
      },
      response: {
        ...
      }
    },
    models: [
      ...
    ]
  }
  
};
```

####`process`
The prcocess object contains the definition for how to make the HTTP request and how to handle the response.
####`process.request`
Data detailing how to complete a HTTP request.
####`process.request.url`
(string, required) - URL string which may contain tokenized variables. See token section below for more information.  
####Tokens
Tokens are placeholders for variables in the `process.request.url` that can be passed into a still to modify the request. Tokens are encapsulated by `{` and `}` in the url string. These can be used to make use of the same still for multiple similar requests.
#####Example
In this example the GitHub username is passed into the distillery instance to save the profile page of a user.
```javascript
// still.js
module.exports = function(distillery) {
  return {
    process: {
      request: {
        method: 'GET',
        url: 'https://github.com/{un}',
        query: 
            username: { name: 'un', required: true }
      }
  }
};
// example.js
var Distillery = require('distillery-js')
var still = require('./still.js')
var fs = require('fs')

Distillery(still)
  .distill({ username: 'achannarasappa' })
  .then(function(html) {
    fs.writeFileSync('user.html', html)
  })
```
Run with `$ node ./example.js`. The username variable can be modified in example.js to scrape the profile page of any github user.

####`process.request.method`
(*string*, *required*) - The HTTP verb which may be `GET`, `POST`, `PUT`, or `DELETE`  
####`process.request.query`
(*object*, *optional*) - Parameters to be interpolated with url tokens. Object key refers to the name that can be used to set the parameter in the `Distillery(still).distill()` method.  
#####`process.request.query[<key>].name`
(*string*, *required*) - Name of the token in the url string.
#####`process.request.query[<key>].required`
(*boolean*, *optional*) - If set to true, then an error will be thrown if this variable is not set in the `Distillery(still).distill()` method.
#####`process.request.query[<key>].default`
(*string*, *optional*) - Default value for the given parameter.
####`process.request.headers`
(*object*, *optional*) - Parameters to be sent as headers. See [Request documentation](https://github.com/request/request#custom-http-headers) of headers for more information. Object key refers to the name that can be used to set the parameter in the `Distillery(still).distill()` method.  
#####`process.request.headers[<key>].name`
(*string*, *required*) - Name of the [http header](http://en.wikipedia.org/wiki/List_of_HTTP_header_fields).
#####`process.request.headers[<key>].required`
See `process.request.query[<key>].required`.
#####`process.request.headers[<key>].default`
See `process.request.query[<key>].default`.
####`process.request.payload`
(*object*, *optional*) - Send request data as `application/x-www-form-urlencoded`. See [Request documentation](https://github.com/request/request#forms) on forms for more information.  Object key refers to the name that can be used to set the parameter in the `Distillery(still).distill()` method.  
#####`process.request.payload[<key>].name`
(*string*, *required*) - Name of the form parameter.
#####`process.request.payload[<key>].required`
See `process.request.query[<key>].required`.
#####`process.request.payload[<key>].default`
See `process.request.query[<key>].default`.
####`process.response`
Hooks, validators, and indicators to handle a HTTP response. Each sub-object is a potential response condition. This allows for handling 404 Not Found response differently from a 200 OK response.
####`process.response[<key>].indicators`
(*object*, *required*) - List conditions to look for that would indicate this specific response was returned from the server. Each sub-key is a user-assigned name for the indicator. There are a set of indicator that can be used detailed below. Indicators return values which can be interpreted by `process.response[<key>].validate` to determine if a response was valid.
#####Indicators
1. distillery.expect.http_code(code) - The [HTTP code](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) to expect the response to contain.
    * code (*integer*) - The HTTP to expect the response to contain
2. distillery.expect.url(url)
    * url (*string* or *regex*) - A string or regex pattern to match the final url against.

##API


##Examples
See [distillery-example-cl](https://github.com/achannarasappa/distillery-example-cl)