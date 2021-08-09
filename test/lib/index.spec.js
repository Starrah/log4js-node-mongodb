/*global describe, it, expect, beforeEach */
'use strict';

var log4js = require('log4js');
var mongodb = require('mongodb');
var sut = require('../../lib/index');
var connectionString = 'mongodb://localhost:27017/test_log4js_mongo';
var db;
var appenderTypePath = 'lib/index';
var sortBy = require('lodash/sortBy');

describe('log4js-node-mongoappender', function () {
    beforeEach(function (done) {
        if (db) {
            db.collection('log').drop(function () {
                db.collection('audit').drop(function () {
                    done();
                });
            });
        } else {
            new mongodb.MongoClient(connectionString, {useUnifiedTopology: true})
                .connect(function (err, client) {
                db = client.db();

                db.collection('log').drop(function () {
                    db.collection('audit').drop(function () {
                        done();
                    });
                });
            });
        }
    });

    it('should be initialized correctly', function () {
        expect(typeof sut.configure).toBe('function');
        expect(typeof sut.appender).toBe('function');
    });

    it('should throw an Error when the connectionString is not set', function () {
        expect(function () {
            return log4js.configure({
                appenders: {
                    mongodb: {
                        type: appenderTypePath,
                    }
                },
                categories: {default: {appenders: ['mongodb'], level: 'trace'}}
            });
        }).toThrow();
    });

    it('should log to the mongo database when initialized through the configure function', function (done) {
        log4js.configure({
            appenders: {
                mongodb: {
                    type: appenderTypePath,
                    connectionString: connectionString
                }
            },
            categories: {default: {appenders: ['mongodb'], level: 'trace'}}
        });
        log4js.getLogger().info('Ready to log!');
        log4js.getLogger().debug({ a: 1 });

        var id = new mongodb.ObjectID();
        log4js.getLogger().error({ _id: id });

        setTimeout(function () {
            db.collection('log').find({}).toArray(function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(3);
                res = sortBy(res, 'level.levelStr');
                expect(res[0].data).toEqual({ a: 1 });
                expect(res[0].level).toEqual({ level: 10000, levelStr: 'DEBUG', colour: 'cyan' });
                expect(res[1].data._id instanceof mongodb.ObjectID).toBeTruthy();
                expect(res[1].data._id && res[1].data._id.toString()).toEqual(id.toString());
                expect(res[1].level).toEqual({ level: 40000, levelStr: 'ERROR', colour: 'red' });
                expect(res[2].category).toBe('default');
                expect(res[2].data).toBe('Ready to log!');
                expect(res[2].level).toEqual({ level: 20000, levelStr: 'INFO', colour: 'green' });

                done();
            });
        }, 1500);
    });

    it('should log an object to the mongo database when initialized through the configure function', function (done) {
        log4js.configure({
            appenders: {
                mongodb: {
                    type: appenderTypePath,
                    connectionString: connectionString
                }
            },
            categories: {default: {appenders: ['mongodb'], level: 'trace'}}
        });
        log4js.getLogger().info({ ok: 1, date: new Date(), regex: new RegExp('aaa', 'i') });

        setTimeout(function () {
            db.collection('log').find({}).toArray(function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(1);
                expect(res[0].category).toBe('default');
                expect(res[0].data.ok).toBe(1);
                expect(res[0].data.date instanceof Date).toBeTruthy();
                expect(res[0].data.regex instanceof RegExp).toBeTruthy();
                expect(res[0].level).toEqual({ level: 20000, levelStr: 'INFO', colour: 'green' });

                done();
            });
        }, 500);
    });

    it('should log an error object to the mongo database when initialized through the configure function', function (done) {
        var error = new Error('wayne');
        log4js.configure({
            appenders: {
                mongodb: {
                    type: appenderTypePath,
                    connectionString: connectionString
                }
            },
            categories: {default: {appenders: ['mongodb'], level: 'trace'}}
        });
        log4js.getLogger().warn(error);

        setTimeout(function () {
            db.collection('log').find({}).toArray(function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(1);
                expect(res[0].category).toBe('default');
                expect(res[0].data).toEqual({ name: 'Error: wayne', message: 'wayne' });
                expect(res[0].level).toEqual({ level: 30000, levelStr: 'WARN', colour: 'yellow' });
                expect(error instanceof Error).toBeTruthy();

                done();
            });
        }, 500);
    });

    it('should log an object to the mongo database and replace keys that contains $ or .', function (done) {
        log4js.configure({
            appenders: {
                mongodb: {
                    type: appenderTypePath,
                    connectionString: connectionString
                }
            },
            categories: {default: {appenders: ['mongodb'], level: 'trace'}}
        });
        log4js.getLogger().info({ $and: [{ 'a.d': 3 }, { $or: { a: 1 } }], 'test.1.2': 5 });

        setTimeout(function () {
            db.collection('log').find({}).toArray(function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(1);
                expect(res[0].category).toBe('default');
                expect(res[0].data).toEqual({ _dollar_and: [{ a_dot_d: 3 }, { _dollar_or: { a: 1 } }], test_dot_1_dot_2: 5 });
                expect(res[0].level).toEqual({ level: 20000, levelStr: 'INFO', colour: 'green' });

                done();
            });
        }, 500);
    });

    it('should log to the mongo database with a given layout', function (done) {
        log4js.configure({
            appenders: {
                mongodb: {
                    type: appenderTypePath,
                    connectionString: connectionString,
                    layout: 'colored'
                }
            },
            categories: {default: {appenders: ['mongodb'], level: 'trace'}}
        });
        log4js.getLogger().info('Ready to log!');

        setTimeout(function () {
            db.collection('log').find({}).toArray(function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(1);
                expect(res[0].category).toBe('default');
                expect(res[0].data).toBe('Ready to log!');
                expect(res[0].level).toEqual({ level: 20000, levelStr: 'INFO', colour: 'green' });

                done();
            });
        }, 100);
    });

    it('should log to the mongo database given connection options', function (done) {
        log4js.configure({
            appenders: {
                mongodb: {
                    type: appenderTypePath,
                    connectionString: connectionString,
                    connectionOptions: {ssl: false, sslValidate: false, useUnifiedTopology: true}
                }
            },
            categories: {default: {appenders: ['mongodb'], level: 'trace'}}
        });
        log4js.getLogger().info('Ready to log!');

        setTimeout(function () {
            db.collection('log').find({}).toArray(function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(1);
                expect(res[0].category).toBe('default');
                expect(res[0].data).toBe('Ready to log!');
                expect(res[0].level).toEqual({level: 20000, levelStr: 'INFO', colour: 'green'});

                done();
            });
        }, 100);
    });

    it('should log to the mongo database with category default', function (done) {
        log4js.configure({
            appenders: {
                mongodb: {
                    type: appenderTypePath,
                    connectionString: connectionString
                }
            },
            categories: {default: {appenders: ['mongodb'], level: 'trace'}}
        });
        log4js.getLogger().info('Ready to log!');

        setTimeout(function () {
            db.collection('log').find({}).toArray(function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(1);
                expect(res[0].category).toBe('default');
                expect(res[0].data).toBe('Ready to log!');
                expect(res[0].level).toEqual({ level: 20000, levelStr: 'INFO', colour: 'green' });

                done();
            });
        }, 100);
    });

    it('should log to the mongo database with a category', function (done) {
        log4js.configure({
            appenders: {
                mongodb: {
                    type: appenderTypePath,
                    connectionString: connectionString
                }
            },
            categories: {
                default: {appenders: ['mongodb'], level: 'trace'},
                demo: {appenders: ['mongodb'], level: 'trace'}
            }
        });
        log4js.getLogger('demo').warn({ id: 1, name: 'test' });

        setTimeout(function () {
            db.collection('log').find({}).toArray(function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(1);
                expect(res[0].category).toBe('demo');
                expect(res[0].data).toEqual({ id: 1, name: 'test' });
                expect(res[0].level).toEqual({ level: 30000, levelStr: 'WARN', colour: 'yellow' });

                done();
            });
        }, 100);
    });

    it('should log to the mongo database with a given collection', function (done) {
        log4js.configure({
            appenders: {
                mongodb: {
                    type: appenderTypePath,
                    connectionString: connectionString,
                    collectionName: 'audit'
                }
            },
            categories: {
                default: {appenders: ['mongodb'], level: 'trace'},
                demo: {appenders: ['mongodb'], level: 'trace'}
            }
        });
       log4js.getLogger('demo').error({id: 1, name: 'test'});

       setTimeout(function () {
           db.collection('audit').find({}).toArray(function (err, res) {
               expect(err).toBeNull();
               expect(res.length).toBe(1);
               expect(res[0].category).toBe('demo');
               expect(res[0].data).toEqual({id: 1, name: 'test'});
               expect(res[0].level).toEqual({level: 40000, levelStr: 'ERROR', colour: 'red'});

               done();
           });
       }, 1000);
    });

    it('should log to the mongo database with write mode "normal"', function (done) {
        log4js.configure({
            appenders: {
                mongodb: {
                    type: appenderTypePath,
                    connectionString: connectionString,
                    write: 'normal'
                }
            },
            categories: {default: {appenders: ['mongodb'], level: 'trace'}}
        });
        log4js.getLogger().fatal('Ready to log!');

        setTimeout(function () {
            db.collection('log').find({}).toArray(function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(1);
                expect(res[0].category).toBe('default');
                expect(res[0].data).toBe('Ready to log!');
                expect(res[0].level).toEqual({ level: 50000, levelStr: 'FATAL', colour : 'magenta' });

                done();
            });
        }, 1000);
    });

    it('should log to the mongo database with write mode "safe"', function (done) {
        log4js.configure({
            appenders: {
                mongodb: {
                    type: appenderTypePath,
                    connectionString: connectionString,
                    write: 'safe'
                }
            },
            categories: {default: {appenders: ['mongodb'], level: 'trace'}}
        });
        log4js.getLogger().debug('Ready to log!');

        setTimeout(function () {
            db.collection('log').find({}).toArray(function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(1);
                expect(res[0].category).toBe('default');
                expect(res[0].data).toBe('Ready to log!');
                expect(res[0].level).toEqual({ level: 10000, levelStr: 'DEBUG', colour: 'cyan' });

                done();
            });
        }, 1000);
    });
});