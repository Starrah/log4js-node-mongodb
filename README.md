# log4js-node-mongodb

> A log4js-node log appender to write logs into MongoDB, suitable for log4js v6.x.x and mongodb v3.x.x.

> This package is derived from [log4js-node-mongodb](https://github.com/litixsoft/log4js-node-mongodb), which can only 
be used with [log4js](https://www.npmjs.com/package/log4js) v2 and [mongodb](https://www.npmjs.com/package/mongodb) v2, 
and lack of maintenance in recent years. 

> [![Build Status](https://travis-ci.org/Starrah/log4js-node-mongodb.svg?branch=master)](https://travis-ci.org/Starrah/log4js-node-mongodb) [![david-dm](https://david-dm.org/Starrah/log4js-node-mongodb.svg)](https://david-dm.org/Starrah/log4js-node-mongodb/) [![david-dm](https://david-dm.org/Starrah/log4js-node-mongodb/dev-status.svg)](https://david-dm.org/Starrah/log4js-node-mongodb#info=devDependencies&view=table)

## Install

    $ npm install @starrah/log4js-node-mongodb

## Documentation

You can use this appender like all other log4js-node appenders. It just needs the connection-string to the mongo db. ([mongodb connection-string doku](http://docs.mongodb.org/manual/reference/connection-string/))
The default collection used is `log`. You can log a `string` or any kind of `object`. The objects are stored as they are and not converted to strings.

```js
const log4js = require('log4js');
const MONGO_URI = 'mongodb://localhost:27017/test_log4js_mongo'

log4js.configure({
    appenders: {
        console: {type: 'console'},
        mongodb: {
            type: '@starrah/log4js-node-mongodb', // according to log4js documentation, string passed here will be used as the argument of calling `require`, so you don't need to manully require this package in your code.
            connectionString: MONGO_URI
        }
    },
    categories: {
        default: {appenders: ['console', 'mongodb'], level: 'debug'}, // output logs to both console and mongodb 
        // default: {appenders: ['mongodb'], level: 'debug'}, // output logs to mongodb only 
    }
});
```

The log data is stored in the following format.

```js
{
    _id: ObjectID,
    timestamp: loggingEvent.startTime,
    data: loggingEvent.data,
    level: loggingEvent.level,
    category: loggingEvent.categoryName
}
```

Here some examples.

```js
const log4js = require('log4js');
const MONGO_URI = 'mongodb://localhost:27017/test_log4js_mongo'

log4js.configure({
    appenders: {
        console: {type: 'console'},
        mongodb: {
            type: '@starrah/log4js-node-mongodb', // according to log4js documentation, string passed here will be used as the argument of calling `require`, so you don't need to manully require this package in your code.
            connectionString: MONGO_URI
        }
    },
    categories: {
        audit: {appenders: ['mongodb'], level: 'debug'}, // output logs to mongodb only 
    }
});

var logger = log4js.getLogger('audit');

logger.debug('Hello %s, your are the %d user logged in!', 'wayne', 10);
/* saved as
{
    _id: new ObjectID(),
    timestamp: new Date(),
    data: 'Hello wayne, your are the 10 user logged in!',
    level: {
        level: 10000,
        levelStr: 'DEBUG'
    },
    category: 'audit'
}
 */

logger.info({id: 1, name: 'wayne'});
/* saved as
{
    _id: new ObjectID(),
    timestamp: new Date(),
    data: {
        id: 1,
        name: 'wayne'
    },
    level: {
        level: 20000,
        levelStr: 'INFO'
    },
    category: 'audit'
}
 */
```

For more usage, please see the [log4js documentation](https://log4js-node.github.io/log4js-node/).

### Configuration
There are some options which can by set through the config object.

#### connectionOptions
The connectionOptions object to pass to the mongo db client.

.|.
---|---
Type|`object`
Required|`false`
Default value|`{}`

```js
const log4js = require('log4js');

log4js.configure({
    appenders: {
        mongodb: {
            type: '@starrah/log4js-node-mongodb', 
            connectionString: 'mongodb://localhost:27017/test_log4js_mongo',
            connectionOptions : {server: {ssl: false, sslValidate: false}}
        }
    },
    categories: {default: {appenders: ['mongodb'], level: 'debug'}}
});
```

#### connectionString
The connection-string to the mongo db.

.|.
---|---
Type|`string`
Required|`true`
Default value|

```js
const log4js = require('log4js');

log4js.configure({
    appenders: {
        mongodb: {
            type: '@starrah/log4js-node-mongodb',
            connectionString: 'mongodb://localhost:27017/test_log4js_mongo',
        }
    },
    categories: {default: {appenders: ['mongodb'], level: 'debug'}}
});
```

#### collectionName
The name of the mongo db collection where the logs are stored.

.|.
---|---
Type|`string`
Required|`false`
Default value|`'log'`

```js
const log4js = require('log4js');

log4js.configure({
    appenders: {
        mongodb: {
            type: '@starrah/log4js-node-mongodb',
            connectionString: 'mongodb://localhost:27017/test_log4js_mongo',
            collectionName: 'audit'
        }
    },
    categories: {default: {appenders: ['mongodb'], level: 'debug'}}
});
```

#### write
The write mode of the mongo db insert operation. With this option you have control over the [write concern](http://docs.mongodb.org/manual/core/write-concern/) of mongo db.

.|.
---|---
Type|`string`
Required|`false`
Default value|`'fast'`

There are 3 options available. The default value is 'fast'.

.|mongo options object|error logging
---|---|---
fast|`{writeConcern: {w: 0}}`|`no`
normal|`{writeConcern: {{w: 1}}`|`yes`
safe|`{writeConcern: {{w: 1, journal: true}}`|`yes`

```js
const log4js = require('log4js');

log4js.configure({
    appenders: {
        mongodb: {
            type: '@starrah/log4js-node-mongodb',
            connectionString: 'mongodb://localhost:27017/test_log4js_mongo',
            write: 'fast' // or 'normal' 'safe'
        }
    },
    categories: {default: {appenders: ['mongodb'], level: 'debug'}}
});
```

#### layout
The log4js-node layout which is used when logging a string. ([log4js-node layouts](https://github.com/nomiddlename/log4js-node/wiki/Layouts))

.|.
---|---
Type|`string`
Required|`false`
Default value|`'messagePassThroughLayout'`

```js
const log4js = require('log4js');

log4js.configure({
    appenders: {
        mongodb: {
            type: '@starrah/log4js-node-mongodb',
            connectionString: 'mongodb://localhost:27017/test_log4js_mongo',
            layout: 'colored'
        }
    },
    categories: {default: {appenders: ['mongodb'], level: 'debug'}}
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](http://gruntjs.com/).

## Release History
### v3.0.0
* modify the API used to make it suitable for log4js v6 and mongdb v3

## Author
Original by [Litixsoft GmbH](http://www.litixsoft.de) ([origin repository](https://github.com/litixsoft/log4js-node-mongodb))
This package by [Starrah](https://github.com/Starrah) (npm [@starrah/log4js-node-mongodb](https://www.npmjs.com/package/@starrah/log4js-node-mongodb))

## License
Copyright (c) 2013-2017 Litixsoft GmbH <info@litixsoft.de>
Copyright (c) 2021 Starrah
Licensed under the MIT license.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
