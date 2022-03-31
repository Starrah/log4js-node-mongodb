import mongodb = require('mongodb');
import { LoggingEvent, log4js, Level, Config, LayoutsParam } from 'log4js';

export interface MongoAppenderConfiguration extends Config {
    /** Log4js type */
    type: 'log4js-mongo';
    /** Parent connection to DB */
    mongoSetting: IMongoClient | IMongoDefinition;
    /** */
    layout: any;
    /** @description envirioment aplikace ktera loguje */
    //env?: IEnvInfo;
    /** @description nazev aplikace ktera loguje */
    //appName: string;
    /** @description content aplikace ktera loguje */
    //content?: any;
    /** @description min level pro zapis pokud se pouziva vice appenderu, vychazi z loggingEvent.level.level; */
    minLevel?: Level;
    /** @description max level pro zapis pokud se pouziva vice appenderu, vychazi z loggingEvent.level.level; */
    maxLevel?: Level;
}

/**
 * @description Mongo connection with the database and collection
 *
 * @export
 * @interface IMongoClient
 */
export interface IMongoClient {
    client: mongodb.MongoClient;
    database: string;
    collection: string;
}

/**
 * @description Mongo connection definition
 *
 * @export
 * @interface IMongoDefinition
 */
export interface IMongoDefinition {
    /** @description Mongo connection string: MONGO_URL="mongodb+srv://bull-wsttp.mongodb.net/" */
    url: string;
    options: {
        useNewUrlParser: boolean;
        useUnifiedTopology: boolean;
        ignoreUndefined: boolean;
    };
    database: string;
    collection: string;
    logLevel: LoggerLevel;
}

export interface IEnvInfo {
    platform?: string;
    hostName?: string;
    server?: string;
}
/*
export interface ILogMessage {
    /** @description datime of message
    timeStamp: Date;
    /** @description message level
    messageType: string;
    /** @description application name
    appName: string;
    /** @description application content
    content: {} | undefined;
    /** @description application envirioment
    env: any | undefined;
}
*/
export function configure(config: MongoAppenderConfiguration): Log4js;
