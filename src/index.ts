import log4js = require('log4js');
import { InitDb } from './libs/init-db';
import mongodb = require('mongodb');
import { MongoAppenderConfiguration } from '../types';

let dbConnection: mongodb.Collection;

/**
 * Exported configuration function to init appender
 * @param config
 */
export const configure = (config: MongoAppenderConfiguration) => {
    config.minLevel = config.minLevel || log4js.levels.ERROR;
    config.maxLevel = config.maxLevel || log4js.levels.FATAL;

    return Log(config);
};

/**
 * @description Exported AppenderModule function to init
 * @export
 * @param {RestAppenderConfig} config
 * @returns
 */
export const MongoDbAppender: log4js.AppenderModule = {
    configure: configure,
};

/**
 * @description Base appender function
 * @param {RestAppenderConfig} config
 * @returns
 */
function Log(config: MongoAppenderConfiguration) {
    const logPrefix = `${__filename}[${Log.name}]:`;

    return (loggingEvent: any) => {
        const actLevel = log4js.levels.getLevel(loggingEvent.level.levelStr);

        if (
            config.minLevel &&
            config.maxLevel &&
            (actLevel.level < config.minLevel.level ||
                actLevel.level > config.maxLevel.level)
        ) {
            return;
        }

        InitDb(config, dbConnection, (errConnection, respConnection) => {
            if (!errConnection && respConnection) {
                dbConnection = respConnection;
                respConnection.insertOne(
                    loggingEvent,
                    (errInsert, respInsert) => {
                        if (errInsert) {
                            console.error(logPrefix, errInsert);
                        } else {
                            console.info(logPrefix, JSON.stringify(respInsert));
                        }
                    }
                );
            }
        });
    };
}
