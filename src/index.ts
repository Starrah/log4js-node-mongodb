import log4js = require('log4js');
import { MongoAppenderConfiguration } from '../types/types';
import { getMongoCollection } from './sources/get-mongo-collection';
import mongodb = require('mongodb');

/** @description local variable to save connection to database */
let dbConnection: mongodb.Collection;

/**
 * Exported configuration function to init appender
 *
 * @param { MongoAppenderConfiguration } config Configuration for appender
 * @param { log4js.LayoutsParam } layouts Layout for appender
 */
export const configure = (
    config: MongoAppenderConfiguration,
    layouts: log4js.LayoutsParam,
) => {
    return Log(config, layouts);
};

/**
 * @description Exported AppenderModule function to init
 * @returns
 */
export const MongoDbAppender: log4js.AppenderModule = {
    configure: configure,
};

/**
 * @description Base appender function
 *
 * @param {MongoAppenderConfiguration} config Configuration for appender
 * @param {log4js.LayoutsParam} layouts Layout for appender
 * @return {*}  {log4js.AppenderFunction}
 */
function Log(
    config: MongoAppenderConfiguration,
    _layouts: log4js.LayoutsParam,
): log4js.AppenderFunction {
    const logPrefix = `${__filename}[${Log.name}]`;

    return (loggingEvent: log4js.LoggingEvent) => {
        getMongoCollection(
            dbConnection,
            config,
            (errConnection, respConnection) => {
                if (!errConnection && respConnection) {
                    dbConnection = respConnection;
                    respConnection.insertOne(
                        loggingEvent,
                        (errInsert, respInsert) => {
                            if (errInsert) {
                                console.error(logPrefix, errInsert);
                            } else {
                                console.info(
                                    logPrefix,
                                    JSON.stringify(respInsert),
                                );
                            }
                        },
                    );
                } else {
                    console.error(logPrefix, errConnection);
                }
            },
        );
    };
}
