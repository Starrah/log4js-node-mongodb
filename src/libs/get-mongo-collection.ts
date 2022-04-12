import { MongoAppenderConfiguration } from '../../types/types';
import getMongoDb from '../sources/get-mongo-db';
import { isMongoDefinition } from './is-mongo-definition';
import mongodb = require('mongodb');

/**
 * @description Init mongodb collection
 *
 * @param {MongoAppenderConfiguration} config
 */
export function getMongoCollection(
    config: MongoAppenderConfiguration,
    dbConnection: mongodb.Collection | undefined,
    cb: (err: Error | undefined, resp: mongodb.Collection | undefined) => void
): void {
    if (!dbConnection && config) {
        if (isMongoDefinition(config.mongoSetting)) {
            getMongoDb(config.mongoSetting, (err, collection) => {
                if (err || !collection) {
                    cb(err, undefined);
                } else {
                    cb(undefined, collection);
                }
            });
        } else {
            const result = config.mongoSetting.client
                .db(config.mongoSetting.database)
                .collection(config.mongoSetting.collection);
            cb(undefined, result);
        }
    }
}
