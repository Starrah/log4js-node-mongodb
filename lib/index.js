var lxHelpers = require('lx-helpers');
var mongodb = require('mongodb');
var isEqual = require('lodash/isEqual');
var clone = require('lodash/clone');

// Modification in v3.0.0:buffer used for caching MongoClient(s).
// type: Array<{config: object, cilent: MongoClient}>
var clientBuffer = [];

/**
 * Returns a function to log data in mongodb.
 *
 * Modification in v3.0.0: layouts is provided as a parameter
 *
 * @param {Object} config The configuration object.
 * @param {string} config.connectionString The connection string to the mongo db.
 * @param {string=} config.layout The log4js layout.
 * @param {string=} config.write The write mode.
 * @param {Object} layouts the layouts provided by log4js.
 * @returns {Function}
 */
function mongodbAppender(config, layouts) {
    if (!config || !config.connectionString) {
        throw new Error('connectionString is missing. Cannot connect to mongdb.');
    }
    config = clone(config);
    delete config.type;

    var collection;
    var cache = [];
    var layout = config.layout || layouts.messagePassThroughLayout;
    var collectionName = config.collectionName || 'log';
    var connectionOptions = config.connectionOptions || {useUnifiedTopology: true}; // to prevent the warning raised by mongodb driver

    function ERROR(err) {
        Error.call(this);
        Error.captureStackTrace(this, this.constructor);

        this.name = err.toString();
        this.message = err.message || 'error';
    }

    function replaceKeys(src) {
        var result = {};

        function mixin(dest, source, cloneFunc) {
            if (lxHelpers.isObject(source)) {
                lxHelpers.forEach(source, function (value, key) {
                    // replace $ at start
                    if (key[0] === '$') {
                        key = key.replace('$', '_dollar_');
                    }

                    // replace all dots
                    key = key.replace(/\./g, '_dot_');

                    dest[key] = cloneFunc ? cloneFunc(value) : value;
                });
            }

            return dest;
        }

        if (!src || typeof src !== 'object' || typeof src === 'function' || src instanceof Date || src instanceof RegExp || src instanceof mongodb.ObjectID) {
            return src;
        }

        // wrap Errors in a new object because otherwise they are saved as an empty object {}
        if (lxHelpers.getType(src) === 'error') {
            return new ERROR(src);
        }

        // Array
        if (lxHelpers.isArray(src)) {
            result = [];

            lxHelpers.arrayForEach(src, function (item) {
                result.push(replaceKeys(item));
            });
        }

        return mixin(result, src, replaceKeys);
    }

    function getOptions() {
        var options = {writeConcern: {w: 0}};

        if (config.write === 'normal') {
            options.writeConcern.w = 1;
        }

        if (config.write === 'safe') {
            options.writeConcern.w = 1;
            options.journal = true;
        }

        return options;
    }

    function insert(loggingEvent) {
        var options = getOptions();

        if (collection) {
            if (options.writeConcern.w === 0) {
                // fast write
                collection.insertOne({
                    timestamp: loggingEvent.startTime,
                    data: loggingEvent.data,
                    level: loggingEvent.level,
                    category: loggingEvent.categoryName
                }, options);
            } else {
                // save write
                collection.insertOne({
                    timestamp: loggingEvent.startTime,
                    data: loggingEvent.data,
                    level: loggingEvent.level,
                    category: loggingEvent.categoryName
                }, options, function (error) {
                    if (error) {
                        console.error('log: Error writing data to log!');
                        console.error(error);
                        console.log('log: Connection: %s, collection: %, data: %j', config.connectionString, collectionName, loggingEvent);
                    }
                });
            }
        } else {
            cache.push(loggingEvent);
        }
    }

    // check connection string
    if (config.connectionString.indexOf('mongodb://') !== 0) {
        config.connectionString = 'mongodb://' + config.connectionString;
    }

    // connect to mongodb
    // Modification in v3.0.0: refactor to apply to mongodb v3, in which MongoClient.connect return MongiClient which has no 'collection' method.
    function onClientCreated (client) {
        collection = client.db().collection(config.collectionName || 'log');

        // process cache
        cache.forEach(function (loggingEvent) {
            setImmediate(function () {
                insert(loggingEvent);
            });
        });
    }

    // Modification in v3.0.0: if client exists in the clientBuffer, then simply reuse, instead of creating a new MongoClient and reconnecting to the DB.
    var lookupValueInBuffer = clientBuffer.find(
        function (o) {return isEqual(o.config, config);}
    );
    if (lookupValueInBuffer !== undefined){
        onClientCreated(lookupValueInBuffer.client);
    } else {
        new mongodb.MongoClient(config.connectionString, connectionOptions).connect(function (err, client) {
            if (err) {
                console.error('Error connecting to mongodb! URL: %s', config.connectionString);
                console.error(err);
            }
            clientBuffer.push({config: config, client: client}); // cache the client into the buffer
            onClientCreated(client);
        });
    }

    return function (loggingEvent) {
        // get the information to log
        if (Object.prototype.toString.call(loggingEvent.data[0]) === '[object String]') {
            // format string with layout
            loggingEvent.data = layout(loggingEvent);
        } else if (loggingEvent.data.length === 1) {
            loggingEvent.data = loggingEvent.data[0];
        }

        loggingEvent.data = replaceKeys(loggingEvent.data);

        // save in db
        insert(loggingEvent);
    };
}

function configure(config, layouts) {
    if (config.layout) {
        config.layout = layouts[config.layout];
    }

    return mongodbAppender(config, layouts);
}

exports.appender = mongodbAppender;
exports.configure = configure;
