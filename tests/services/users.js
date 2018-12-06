/*!
 * damless
 * Copyright(c) 2018 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
*/
const Http = require("../../lib/services/http");

class Users extends Http {

    constructor(giveme) {
        super(giveme, "users")
    };

    customHttpFind(context, stream, headers) {
        this.find().pipe(stream).on("data", data => console.log(data))
    }

    httpUserByCity(context, stream, headers) {
        this.aggregate([
            { $group: { _id: "$address.city", count: { $sum: 1 }, logins: { $push: { login: "$login" }}}},
            { $project: { _id: 0, city: "$_id", count: 1, logins: 1}}, //_id: 0 -> remove id
            { $sort: { city: 1 } },
        ]).pipe(stream);
    }
};

exports = module.exports = Users;