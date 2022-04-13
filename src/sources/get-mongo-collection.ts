import { MongoAppenderConfiguration } from '../../types/types';
import getMongoDb from './get-mongo-db';
import { isMongoDefinition } from './helpers/is-mongo-definition';
import mongodb = require('mongodb');

/**
 * @description Init mongodb collection
 *
 * @export
 * @param {(mongodb.Collection | undefined)} dbCollection saved connection
 * @param {MongoAppenderConfiguration} config Configuration to mongo
 * @param {((err: Error | undefined, resp: mongodb.Collection | undefined) => void)} cb
 */
export function getMongoCollection(
    dbCollection: mongodb.Collection | undefined,
    config: MongoAppenderConfiguration,
    cb: (err: Error | undefined, resp: mongodb.Collection | undefined) => void,
): void {
    if (dbCollection) {
        cb(undefined, dbCollection);
    } else if (config) {
        if (isMongoDefinition(config.mongoSetting)) {
            getMongoDb(config.mongoSetting, (err, collection) => {
                if (err || !collection) {
                    cb(err, undefined);
                } else {
                    cb(undefined, collection);
                }
            });
        } else {
            const result: mongodb.Collection = config.mongoSetting.client
                .db(config.mongoSetting.database)
                .collection(config.mongoSetting.collection);
            cb(undefined, result);
        }
    } else {
        cb(new Error('No config or collection definned!'), undefined);
    }
}
