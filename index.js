/*!
 * damless-mongo
 * Copyright(c) 2018 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
 */
const DamlessMongo = require('./lib/damless-mongo');
const {
    Aggregate,
    Crud,
    Find,
    Http,
    MongoQueryString,
} = require('./lib/services');

module.exports = DamlessMongo;
module.exports.Aggregate = Aggregate;
module.exports.Crud = Crud;
module.exports.Find = Find;
module.exports.Http = Http;
module.exports.MongoQueryString = MongoQueryString;
