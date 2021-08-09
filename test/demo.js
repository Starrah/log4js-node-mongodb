'use strict';

var log4js = require('log4js');
var mongodb = require('mongodb');
var url = 'localhost:27017/test_log4js_mongo';

var log4js_config = {
    appenders: {
        console: {type: 'console'},
        mongodb: {
            type: '../lib',
            connectionString: url
        }
    },
    categories: {
        default: {appenders: ['console', 'mongodb'], level: 'debug'}, // output logs to both console and mongodb
    }
};

mongodb.MongoClient.connect('mongodb://' + url, function (err, client) {
    var db = client && client.db();
    if (err || !db) {
        return console.log(err || new Error('Unknown error, no database returned.'));
    }

    console.log('Successfully connected to MongoDb: %s', url);

    // clear
    var collection = db.collection('log');

    collection.removeMany({}, function () {
        log4js.configure(log4js_config);
        var logger = log4js.getLogger();
        var i = 500;

        for (var u = 0; u < i; u++) {
            logger.info(u);
        }

        var interval = setInterval(function () {
            logger.info(i);
            i++;
        }, 1);

        setTimeout(function () {
            clearInterval(interval);

            setTimeout(function () {
                client.close(function () {
                    process.exit(0);
                });
            }, 2000);
        }, 5000);
    });
});