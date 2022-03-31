import { AppenderFunction, LayoutsParam, LoggingEvent } from 'log4js';
import log4js = require('log4js');
import os = require('os');
import mongodb = require('mongodb');
import getMongoDb from './sources/getMongoDb';
import {
    IMongoClient,
    IMongoDefinition,
    MongoAppenderConfiguration,
} from '../types/types';

const logger = log4js.getLogger();
let dbConnection: mongodb.Collection;

/**
 * Exported configuration function to init appender
 * @param config
 */ /*
export const configure = (config: MongoAppenderConfiguration) => {
    config.minLevel = config.minLevel || log4js.levels.ERROR;
    config.maxLevel = config.maxLevel || log4js.levels.FATAL;
    config.env = config.env || {
        hostName: os.hostname(),
        platform: os.platform(),
    };

    InitDb(config);

    return LogMessage(config, config.layouts);
};
*/

function configure(config: MongoAppenderConfiguration, layouts: LayoutsParam) {
    config.minLevel = config.minLevel || log4js.levels.ERROR;
    config.maxLevel = config.maxLevel || log4js.levels.FATAL;
    config.env = config.env || {
        hostName: os.hostname(),
        platform: os.platform(),
    };

    InitDb(config);

    let layout = layouts.messagePassThroughLayout;
    if (config.layout) {
        layout = layouts.layout(config.layout.type, config.layout);
    }
    return LogMessage(config, layout);
}

/**
 * @description Exported AppenderModule function to init
 * @export
 * @param {log4js.AppenderModule} config
 * @returns
 */
export const MongoAppender: log4js.AppenderModule = {
    configure: configure,
};

/**
 *
 *
 * @param {(IMongoClient | IMongoDefinition)} client
 * @return {*}  {client is IMongoDefinition}
 * @see https://stackoverflow.com/questions/14425568/interface-type-check-with-typescript -> How about User-Defined Type Guards?
 */
function isClient(
    client: IMongoClient | IMongoDefinition
): client is IMongoDefinition {
    return (<IMongoDefinition>client).collection !== undefined;
}

/**
 * @description Init Db connection
 *
 * @param {MongoAppenderConfiguration} config
 */
function InitDb(config: MongoAppenderConfiguration): void {
    if (!dbConnection && config) {
        if (isClient(config.mongoSetting)) {
            getMongoDb(config.mongoSetting, (err, connection) => {
                if (err || !connection) {
                    logger.error(err);
                } else {
                    dbConnection = connection;
                }
            });
        } else {
            dbConnection = config.mongoSetting.client
                .db(config.database)
                .collection(config.collection);
        }
    }
}

/**
 * @description Base appender function
 *
 * @param {MongoAppenderConfiguration} config
 * @param {log4js.LayoutsParam} layouts
 * @return {*}  {AppenderFunction}
 */
function LogMessage(
    config: MongoAppenderConfiguration,
    layout: log4js.LayoutFunction
): AppenderFunction {
    const logPrefix = `${__filename}[${LogMessage.name}]`;

    return (loggingEvent: LoggingEvent) => {
        const actLevel = log4js.levels.getLevel(loggingEvent.level.levelStr);

        if (
            config.minLevel &&
            config.maxLevel &&
            (actLevel.level < config.minLevel.level ||
                actLevel.level > config.maxLevel.level)
        ) {
            return;
        }
        //const data = formatMessageBody(config, loggingEvent);
        //const data2 = layout(loggingEvent);

        let jsonData: any = loggingEvent;

        if (layout) {
            const data = layout(loggingEvent);
            try {
                jsonData = JSON.parse(data);
            } catch (err) {}
        }

        dbConnection.insertOne(jsonData, (err) => {
            if (err) {
                logger.error(logPrefix + err);
            }
        });
    };
}

/**
 * @description Format message to our own format
 *
 * @param {MongoAppenderConfiguration} config
 * @param {LoggingEvent} loggingEvent
 * @return {*}
function formatMessageBody(
    config: MongoAppenderConfiguration,
    loggingEvent: LoggingEvent
): ILogMessage {
    const messageData: ILogMessage = {
        timeStamp: loggingEvent.startTime,
        messageType: loggingEvent.level.levelStr,
        appName: config.appNam,
        content: loggingEvent,
        env: config.env,
    };

    return messageData;
}
*/
