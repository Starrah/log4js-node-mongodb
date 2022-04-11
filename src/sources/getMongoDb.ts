import mongodb = require('mongodb');
import { IMongoDefinition } from '../../types';

let client: mongodb.MongoClient;
let db: mongodb.Db;
let collection: mongodb.Collection;

const MongoClient = mongodb.MongoClient;
const dbLogger = mongodb.Logger;

/**
 * @see https://mongodb.github.io/node-mongodb-native/3.6/api/Logger.html#.setCurrentLogger
 */
dbLogger.setCurrentLogger((_msg, context) => {
    if (context?.type === 'debug') {
        console.debug(context);
    } else if (context?.type === 'info') {
        console.info(context);
    } else {
        console.error({
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

        if (config.logLevel) {
            dbLogger.setLevel(config.logLevel);
        }

        console.debug(logPrefix, config.url);

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
                        config: config,
                    },
                };
                console.error(logErr);

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
