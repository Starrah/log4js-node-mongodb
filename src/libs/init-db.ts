import { MongoAppenderConfiguration } from '../../types';
import getMongoDb from '../sources/getMongoDb';
import { isClient } from './is-client';
import mongodb = require('mongodb');

/**
 * @description Init Db connection
 *
 * @param {MongoAppenderConfiguration} config
 */
export function InitDb(
    config: MongoAppenderConfiguration,
    dbConnection: mongodb.Collection | undefined,
    cb: (err: Error | undefined, resp: mongodb.Collection | undefined) => void
): void {
    if (!dbConnection && config) {
        if (isClient(config.mongoSetting)) {
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
