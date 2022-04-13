import log4js = require('log4js');
import { MongoAppenderConfiguration } from '../types/types';
import { getMongoCollection } from './sources/get-mongo-collection';
import mongodb = require('mongodb');

/** @description local variable to save connection to database */
let dbConnection: mongodb.Collection;

/**
 * Exported configuration function to init appender
 * @param { MongoAppenderConfiguration } config
 * @param { log4js.LayoutsParam } layouts
 */
const configure = (
    config: MongoAppenderConfiguration,
    layouts: log4js.LayoutsParam
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
 * @param {MongoAppenderConfiguration} config
 * @param {log4js.LayoutsParam} layouts
 * @return {*}
 */
function Log(config: MongoAppenderConfiguration, layouts: log4js.LayoutsParam) {
    const logPrefix = `${__filename}[${Log.name}]`;
    const fnLayouts = layouts;

    return (loggingEvent: log4js.LoggingEvent) => {
        console.debug(fnLayouts);

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
                                    JSON.stringify(respInsert)
                                );
                            }
                        }
                    );
                } else {
                    console.error(logPrefix, errConnection);
                }
            }
        );
    };
}
