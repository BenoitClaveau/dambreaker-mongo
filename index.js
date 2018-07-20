/*!
 * damless-mongo
 * Copyright(c) 2018 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
 */
module.exports = require('./lib/damless-mongo');
module.exports.Aggregate = require('./lib/services').Aggregate;
module.exports.Crud = require('./lib/services').Crud;
module.exports.Find = require('./lib/services').Find;
module.exports.Http = require('./lib/services').Http;
module.exports.MongoQueryString = require('./lib/services').MongoQueryString;
module.exports.transform = require('./lib/core/streamify').transform;
module.exports.streamify = require('./lib/core/streamify').streamify;
