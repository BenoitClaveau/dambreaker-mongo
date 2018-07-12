/*!
 * damless-mongo
 * Copyright(c) 2018 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
 */
module.exports = require('./lib/damless-mongo');
module.exports.Crud = require('./lib/services/crud');
module.exports.Http = require('./lib/services/http');
module.exports.MongoQueryString = require('./lib/services/mongo-querystring');
