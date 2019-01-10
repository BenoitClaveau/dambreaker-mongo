/*!
 * damless
 * Copyright(c) 2018 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
*/
const Http = require("../../lib/services/http");
const { promisify } = require("util");
const { pipeline } = require("stream");
const pipelineAsync = promisify(pipeline);

class Users extends Http {

    constructor(giveme) {
        super(giveme, "users")
    };

    async customHttpFind(context, stream, headers) {
        await pipelineAsync(
            this.find(),
            stream.on("data", data => console.log(data))
        );
    }

    async httpUserByCity(context, stream, headers) {
        await pipelineAsync(
            this.aggregate([
                { $group: { _id: "$address.city", count: { $sum: 1 }, logins: { $push: { login: "$login" }}}},
                { $project: { _id: 0, city: "$_id", count: 1, logins: 1}}, //_id: 0 -> remove id
                { $sort: { city: 1 } },
            ]),
            stream
        );
    }
};

exports = module.exports = Users;