/*!
 * damless-mongo
 * Copyright(c) 2018 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */

const { Error, UndefinedError } = require("oups");
const { streamify, transform } = require("../core");
const Find = require("./find");
const Aggregate = require("./aggregate");

class CrudService {
    
    constructor(giveme, collectionName, dbName) {
        if (!giveme) throw new UndefinedError("giveme");
        if (!collectionName) throw new UndefinedError("collectionName");
        if (typeof collectionName !== "string") throw new Error("collectionName isn't a string.");
        
        this.giveme = giveme;
        this.collectionName = collectionName;
        this.dbName = dbName;   //could be null
    };

    async collection() {
        const mongo = await this.giveme.resolve("mongo");
        const db = await mongo.connect(this.dbName);
        return db.collection(this.collectionName);
    }

    /* stream methods */

    saveOne(filter, document, options, output) {
        return streamify(async () => {
            const { _id, ...doc } = document;
            const previous = this.mongoFindOne(filter, options);
            const current = previous ? { ...previous, ...doc } : doc;
            const res = await this.mongoSave(current, options);
            if (typeof output == "function") return output(res);
            if (!res) throw new Error("Fail to save document.", { document });
            return current;
        });
    }

    save(filter = ({_id}) => ({_id}), options, output) {
        return transform(async (chunk, enc) => {
            const { _id, ...doc } = chunk;
            const f = typeof filter == "function" ? filter(chunk) : filter;
            const o = typeof options == "function" ? options(chunk) : options;
            const previous = this.mongoFindOne(f, o);
            const current = previous ? { ...previous, ...doc } : doc;
            const res = await this.mongoSave(current, options);
            if (typeof output == "function") return output(res, chunk);
            if (!res) throw new Error("Fail to save document.", { document: chunk });
            return current;
        })
    }

    insertOne(document, options, output) {
        return streamify(async () => {
            const res = await this.mongoInsertOne(document, options)
            if (typeof output == "function") return output(res);
            if (!res) throw new Error("Fail to insert document.", { document: d });
            return res;
        });
    }

    insert(options, output) {  
        return transform(async (chunk, enc) => {
            const o = typeof options == "function" ? options(chunk) : options;
            const res = await this.mongoInsertOne(chunk, o);
            if (typeof output == "function") return output(res, chunk);
            if (!res) throw new Error("Fail to insert document.", { document: d });
            return res.ops[0];
        })
    }

    updateOne(filter, update, options, output) {
        return streamify(async () => {
            const res = await this.mongoUpdateOne(filter, update, options);
            if (typeof output == "function") return output(res);
            if (!res) throw new Error("Fail to update document.", { filter: f, update: u });
            return res;
        });
    }

    update(filter = ({_id}) => ({_id}), update, options = {}, output) {
        return transform(async (chunk, enc) => {
            const { _id, ...doc } = chunk;
            const f = typeof filter == "function" ? filter(chunk) : filter;
            const u = typeof update == "function" ? update(chunk) : update || doc;
            const o = typeof options == "function" ? options(chunk) : options;
            const res = await this.mongoUpdateOne(f, u, o);
            if (typeof output == "function") return output(res, chunk);
            if (!res) throw new Error("Fail to update document.", { filter: f, update: u });
            return res;
        })
    }

    replaceOne(filter, replacement, options, output) {
        return streamify(async () => {
            const res = await this.mongoReplaceOne(filter, replacement, options);
            if (typeof output == "function") return output(res);
            if (!res) throw new Error("Fail to replace document.", { filter: f, replacement: r });
            return res;
        });
    }

    replace(filter = ({_id}) => ({_id}), replacement, options, output) {
        return transform(async (chunk, enc) => {
            const { _id, ...doc } = chunk;
            const f = typeof filter == "function" ? filter(chunk) : filter;
            const r = typeof replacement == "function" ? replacement(chunk) : doc;
            const o = typeof options == "function" ? options(chunk) : options;
            const res = await this.mongoReplaceOne(f, r, o);
            if (typeof output == "function") return output(res, chunk);
            if (!res) throw new Error("Fail to replace document.", { filter: f, replacement: r });
            return res.ops[0];
        })
    }

    deleteOne(filter, options, output) {
        return streamify(async () => {
            const res = await this.mongoDeleteOne(filter, options);
            if (typeof output == "function") return output(res);
            if (!res) throw new Error("Fail to delete document.", { document: chunk });
            return res;
        });
    }

    delete(filter = ({_id}) => ({_id}), options, output) {
        return transform(async (chunk, enc) => {
            const f = typeof filter == "function" ? filter(chunk) : filter;
            const o = typeof options == "function" ? options(chunk) : options;
            const res = this.mongoDeleteOne(f, o);
            if (typeof output == "function") return output(res, chunk);
            if (!res) throw new Error("Fail to delete document.", { document: chunk });
            return res.ops[0];
        })
    }

    findOne(filter, options) {
        return streamify(async () => {
            const res = await this.mongoFindOne(filter, options);
            if (!res) throw new  Error("Fail to read document.", { filter });
            return res;
        });
    }

    find(filter, options) {
        return new Find(this, filter, options);
    }

    aggregate(pipeline, options) {
        return new Aggregate(this, pipeline, options);
    }

    count(filter, options) {
        return streamify(async () => {
            const count = await this.mongoCount(filter, options)
            return { count };
        });
    }

    /* mongo api */

    async mongoInsertOne(doc, options) {
        const collection = await this.collection();
        return await collection.insertOne(doc, options);
    }

    async mongoInsertMany(docs, options) {
        const collection = await this.collection();
        return await collection.insertMany(docs, options);
    }

    async mongoAggregate(pipeline, options) {
        const collection = await this.collection();
        return await collection.aggregate(pipeline, options);
    }

    async mongoBulkWrite(operations, options) {
        const collection = await this.collection();
        return await collection.bulkWrite(operations, options);
    }

    async mongoCreateIndex(fieldOrSpec, options) {
        const collection = await this.collection();
        return await collection.createIndex(fieldOrSpec, options);
    }

    async mongoCreateIndexes(indexSpecs, options) {
        const collection = await this.collection();
        return await collection.createIndexes(indexSpecs, options);
    }

    async mongoCount(filter, options) {
        const collection = await this.collection();
        return await collection.count(filter, options);
    }

    async mongoDeleteOne(filter, options) {
        const collection = await this.collection();
        return await collection.deleteOne(filter, options);
    }

    async mongoDeleteMany(filter, options) {
        const collection = await this.collection();
        return await collection.deleteMany(filter, options);
    }

    async mongoDistinct(key, query, options) {
        const collection = await this.collection();
        return await collection.distinct(key, query, options);
    }

    async mongoDrop(options) {
        const collection = await this.collection();
        return await collection.drop(options);
    }

    /* mongo api extension */
    async mongoDropIfExists(options) {
        try {
            return await this.mongoDrop(options);
        } 
        catch(error) {
            //console.info(error);
        }
    }

    async mongoDropIndex(indexName, options) {
        const collection = await this.collection();
        return await collection.dropIndex(indexName, options);
    }

    async mongoDropIndexes(options) {
        const collection = await this.collection();
        return await collection.dropIndexes(options);
    }

    async mongoFindOne(filter, options) {
        const collection = await this.collection();
        return await collection.findOne(filter, options);
    }

    async mongoFind(filter, options) {
        const collection = await this.collection();
        return await collection.find(filter, options);
    }

    async mongoFindOneAndDelete(filter, options) {
        const collection = await this.collection();
        return await collection.findOneAndDelete(filter, options);
    }

    async mongoFindOneAndReplace(filter, replacement, options) {
        const collection = await this.collection();
        return await collection.findOneAndReplace(filter, replacement, options);
    }

    async mongoFindOneAndUpdate(filter, update, options) {
        const collection = await this.collection();
        return await collection.findOneAndUpdate(filter, update, options);
    }

    async mongoGeoHaystackSearch(x, y, options) {
        const collection = await this.collection();
        return await collection.geoHaystackSearch(x, y, options);
    }

    async mongoGeoNear(x, y, options) {
        const collection = await this.collection();
        return await collection.geoNear(x, y, options);
    }

    async mongoGroup(keys, condition, initial, reduce, finalize, command, options) {
        const collection = await this.collection();
        return await collection.group(keys, condition, initial, reduce, finalize, command, options);
    }

    async mongoMapReduce(map, reduce, options) {
        const collection = await this.collection();
        return await collection.mapReduce(map, reduce, options);
    }

    async mongoReplaceOne(filter, doc, options) {
        const collection = await this.collection();
        return await collection.replaceOne(filter, doc, options);
    }

    async mongoSave(doc, options) {
        const collection = await this.collection();
        return await collection.save(doc, options);
    }

    async mongoUpdateOne(filter, doc, options) {
        const collection = await this.collection();
        return await collection.updateOne(filter, doc, options);
    }

    async mongoUpdateMany(filter, docs, options) {
        const collection = await this.collection();
        return await collection.updateMany(filter, docs, options);
    }

    // async mongoValidateCollection(collectionName, options) {
    //     const db = await this.mongo.connect(this.dbName);
    //     return await db.validateCollection(collectionName, options);
    // }
};

exports = module.exports = CrudService;