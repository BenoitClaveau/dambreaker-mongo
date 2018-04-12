/*!
 * dambreaker-mongo
 * Copyright(c) 2015 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
 */
const {streamify, streamifyOne} = require('./lib/services/streamify');

module.exports = require('./lib/dambreaker-mongo');
module.exports.Crud = require('./lib/services/crud');
module.exports.Rest = require('./lib/services/rest');
module.exports.streamify = streamify;
module.exports.streamifyOne = streamifyOne;
