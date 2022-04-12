# Rest Appender for log4js-node

Sends [log] events to a [mongodb]. This is an optional appender for use with [log4js](https://log4js-node.github.io/log4js-node/).

## Configuration
```bash
npm install log4js
npm install log4js-db-mongodb
npm install os
```
## Example

```javascript
import log4js = require('log4js');
import os = require('os');

log4js.configure({
    appenders: {
        consoleAppender: { type: 'console' },
        dbAppender: {
                type: 'log4js-db-mongodb',
                mongoSetting: {
                    url: 'mongodb+srv://@bull-wsttp.mongodb.net/',
                    options: {
                        useNewUrlParser: true,
                        useUnifiedTopology: true,
                        ignoreUndefined: true,
                    },
                    database: 'messenger',
                    collection: 'log',
                },
                minLevel: levels.DEBUG,
                maxLevel: levels.FATAL,
            },
    },
    categories: {
        default: {
            appenders: ['consoleAppender', 'dbAppender'],
            level: 'DEBUG'
        }
    }
});
const logger = log4js.getLogger();
logger.warn('App start');

```

This configuration will send all messages to the `url` address.
