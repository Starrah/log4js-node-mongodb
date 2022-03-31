import mongodb = require('mongodb');
import { IMongoDefinition } from '../../types';
import * as log4js from 'log4js';

let client: mongodb.MongoClient | undefined;
let db: mongodb.Db | undefined;
let collection: mongodb.Collection;
const MongoClient = mongodb.MongoClient;
const dbLogger = mongodb.Logger;
const logger = log4js.getLogger();

/**
 * @see https://mongodb.github.io/node-mongodb-native/3.6/api/Logger.html#.setCurrentLogger
 */
dbLogger.setCurrentLogger((_msg, context) => {
    if (context?.type === 'debug') {
        logger.debug(context);
    } else if (context?.type === 'info') {
        logger.info(context);
    } else {
        logger.error({
            error: new Error(context?.message),
            extraInfo: {
                logPrefix: `${__filename}[getMongoDb]: `,
                context: context,
            },
        });
    }
});

/**
 * @description It keeps MongoDb connection in RAM.
 * @param {(err: Error | undefined, client: MongoClient | undefined ) => void)} cb Callback function with error and db.
 */
export default function getMongoDb(
    config: IMongoDefinition,
    cb: (
        err: Error | undefined,
        collection: mongodb.Collection | undefined
    ) => void
): void {
    if (client) {
        cb(undefined, collection);
    } else {
        const logPrefix = `${__filename}[${getMongoDb.name}]: `;

        dbLogger.setLevel(config.logLevel);
        logger.debug(`${logPrefix}Connect to ${config.url}`);

        MongoClient.connect(config.url, config.options, (err, newClient) => {
            if (err || !newClient) {
                const error = !newClient
                    ? new Error('No mongo client set.')
                    : err;

                const logErr = {
                    error: error,
                    extraInfo: {
                        function: logPrefix,
                        newClient: newClient,
                    },
                };
                logger.error(logErr);

                cb(err, undefined);
            } else {
                client = newClient;
                db = client.db(config.database);
                collection = db.collection(config.collection);
                cb(undefined, collection);
            }
        });
    }
}

/**
 * @description Close MongoDb connection
 * @export
 * @param {() => void} cb
 */
export function closeMongoDb(cb: () => void): void {
    if (client) {
        client.close(() => {
            cb();
        });
    } else {
        cb();
    }
}
