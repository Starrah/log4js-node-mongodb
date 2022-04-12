import { LoggingEvent, Level, Log4js } from 'log4js';
import mongodb = require('mongodb');

export function configure(config: MongoAppenderConfiguration): Log4js;
////////////////////////////////////////////////////////////////////////////////////////////////

export interface MongoAppenderConfiguration {
    /** Log4js type */
    type: 'log4js-db-mongodb';
    /** Parent connection to DB */
    mongoSetting: IMongoClient | IMongoDefinition;
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
    options: mongodb.MongoClientOptions;
    database: string;
    collection: string;
    logLevel: mongodb.LoggerLevel;
}
