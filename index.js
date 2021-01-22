/*!
 * damless-mongo
 * Copyright(c) 2021 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
 */
const DamlessMongo = require('./lib/damless-mongo');
const {
    Crud,
    Http,
    MongoQueryString,
    Mutex
} = require('./lib/services');

const {
    ObjectID
} = require('mongodb');

module.exports = DamlessMongo;
module.exports.Crud = Crud;
module.exports.Http = Http;
module.exports.MongoQueryString = MongoQueryString;
module.exports.MongoQMutexueryString = Mutex;
module.exports.ObjectID = ObjectID;
