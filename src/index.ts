import log4js = require('log4js');
import { getMongoCollection } from './sources/get-mongo-collection';
import mongodb = require('mongodb');
import { MongoAppenderConfiguration } from '../types/types';

let dbConnection: mongodb.Collection;

/**
 * Exported configuration function to init appender
 * @param config
 */
export const configure = (
    config: MongoAppenderConfiguration,
    _layouts: log4js.LayoutsParam
) => {
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
    const logPrefix = `${__filename}[${Log.name}]`;

    return (loggingEvent: any) => {
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
