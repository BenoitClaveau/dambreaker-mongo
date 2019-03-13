/**
 * Customize json serializer
 */
const { Json } = require("damless");
const { ObjectID } = require("mongodb");

class MyJson extends Json {

    typed(obj, source) {
        if (obj instanceof ObjectID) return obj;
        return super.typed(obj, source);
    }

    onValue(key, val, source) {
        const value = super.onValue(key, val, source);
        switch (typeof value) {
            case "string":
                if (/id?$/i.test(key) && ObjectID.isValid(value)) return new ObjectID(value);
                return value;
            default:
                return value
        }
    }
}

exports = module.exports = MyJson;