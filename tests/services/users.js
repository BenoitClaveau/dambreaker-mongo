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
};

exports = module.exports = Users;