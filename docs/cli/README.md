## Ignite CLI  
### Overview  
The purpose of the Ignite command line interface is to make testing stills quicker and simpler. Ignite allows stills to be run from the command line with detailed output to assist developers.
### Installation  
```
npm install distillery-js -g
```
### Usage  
```
$ distillery ignite <stillPath> [-o <option>...] [-p <parameter>...]
```
#### stillPath  
The relative path to the still file
#### option  
Set distillery CLI options which are detailed below. All model options have default values shown while process options have no defaults.
* Process
    * `-o save_html=response.html` - Save HTML document to response.html
    * `-o save_cookie=response.cookie` - Save cookie set in the response to response.cookie
    * `-o restore_cookie=request.cookie` - Use cookie saved in request.cookie when making the request
* Models
    * `-o table=true` - Display detailed entities and properties
    * `-o table_item_count=10` - Number of items to display in the table of entities.
    * `-o item_max_length=50` - Number of characters after which to truncate an entity's property
    * `-o item_format=false` - Apply the model's `format` function to the entities, by default, the raw data returned without any custom formatting will be returned

#### parameter  
Set any parameters defined in the still's `process.request.query`, `process.request.headers`, or `process.request.form` section that would be normally set in the `.distill` method of the programmatic API. Parameters should follow the format of `-p <name>=<value>`
##### Example  
```
$ distillery ignite ./still.js -p id=4809527167
```