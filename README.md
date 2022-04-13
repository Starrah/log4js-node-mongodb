# Rest Appender for log4js-node

Sends [log] events to a [mongodb]. This is an optional appender for use with [log4js](https://log4js-node.github.io/log4js-node/).

## Configuration
```bash
npm install @onio/log4js-mongodb
npm install os
```
## Example

```javascript
import { configure, levels } from 'log4js';
import * as log4js from 'log4js';

const loggers: { [key: string]: log4js.Logger } = {};

/**
 * @description Get logger with configuration
 */
export default function getLogger(category?: string): log4js.Logger {
    if (!category) {
        category = '';
    }
    if (loggers[category] === undefined) {
        configureLog4js();
        loggers[category] = log4js.getLogger(category);
    }
    return loggers[category];
}

/**
 * @description Log4js konfiguration
 */
function configureLog4js(): void {
    const curentAppenders: Array<string> = [];
    curentAppenders.push('restAppender');
    curentAppenders.push('just_errors');

    configure({
        appenders: {
            dbAppender: {
                type: 'log4js-db-mongodb',
                mongoSetting: {
                    url: 'mongodb+srv://logging:iyBQ4FxqWOHwQiOI@bull-wsttp.mongodb.net/messenger',
                    options: {
                        useNewUrlParser: true,
                        useUnifiedTopology: true,
                        ignoreUndefined: true,
                    },
                    database: 'messenger',
                    collection: 'log',
                },
                layout: {},
            },
            just_errors: {
                type: 'logLevelFilter',
                appender: 'dbAppender',
                level: 'ERROR',
            },
        },
        categories: {
            default: {
                appenders: curentAppenders,
                level: 'DEBUG',
            },
        },
    });
}

const logger = getLogger();
logger.warn('App start');

```
