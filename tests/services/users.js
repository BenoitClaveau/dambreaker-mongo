/*!
 * damless
 * Copyright(c) 2021 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
*/
const Http = require("../../lib/services/http");
const { promisify } = require("util");
const stream = require("stream");
const pipeline = promisify(stream.pipeline);

class Users extends Http {

    constructor(giveme) {
        super(giveme, "users")
    };
    
    async customHttpFind(context, stream, headers) {
        const { filter, options } = this.qs.parse(context.querystring);

        const cursor = await this.mongoFind(filter, options);
        await pipeline(
            cursor,
            stream.on("data", data => console.log(data))
        );
    }

    async httpUserByCity(context, stream, headers) {
        
        const cursor = await this.mongoAggregate([
            { $group: { _id: "$address.city", count: { $sum: 1 }, logins: { $push: { login: "$login" }}}},
            { $project: { _id: 0, city: "$_id", count: 1, logins: 1}}, //_id: 0 -> remove id
            { $sort: { city: 1 } },
        ]);

        await pipeline(
            cursor,
            stream
        );
    }
};

exports = module.exports = Users;