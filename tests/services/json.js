/**
 * Customize json serializer
 */
const { Json } = require("damless");
const { ObjectID } = require("bson");

class MyJson extends Json {

    constructor() {
        super();
    }

    onValue(key, value, source) {
        if (/id$/i.test(key) && ObjectID.isValid(value)) return new ObjectID(value);
        return super.onValue(key, value, source);
    }
}

exports = module.exports = MyJson;