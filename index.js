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
const {
    transform,
    streamify,
    noop,
    getFirst,
    getAll,
    theEnd
} = require('./lib/core');

module.exports = DamlessMongo;
module.exports.Aggregate = Aggregate;
module.exports.Crud = Crud;
module.exports.Find = Find;
module.exports.Http = Http;
module.exports.MongoQueryString = MongoQueryString;
module.exports.transform = transform;
module.exports.streamify = streamify;
module.exports.getFirst = getFirst;
module.exports.getAll = getAll;
module.exports.theEnd = theEnd;
module.exports.noop = noop;
