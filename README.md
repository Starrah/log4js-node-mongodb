# Rest Appender for log4js-node

Sends [log] events to a [REST] api. This is an optional appender for use with [log4js](https://log4js-node.github.io/log4js-node/).

## Configuration
```bash
npm install log4js
npm install log4js-rest
npm install os
```
## Example

```javascript
import log4js = require('log4js');
import { Log4JsRestAppender } from 'log4js-rest';
import os = require('os');

log4js.configure({
    appenders: {
        consoleAppender: { type: 'console' },
        restAppender: {
            type: Log4JsRestAppender,
            url: 'https://your.rest-api.server/log-api/',
            appName: 'suppliers',
            level: 'INFO',
            env: { host: os.hostname(), type: os.platform(), hostname: os.hostname(), },
            minLevel: log4js.levels.WARN,
            maxLevel: log4js.levels.FATAL,
            collectionName:'your_collection_name_in_db'
        }
    },
    categories: {
        default: {
            appenders: ['consoleAppender', 'restAppender'],
            level: 'DEBUG'
        }
    }
});
const logger = log4js.getLogger();
logger.warn('App start');

```

This configuration will send all messages to the `url` address.
