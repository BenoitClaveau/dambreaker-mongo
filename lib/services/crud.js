/*!
 * damless-mongo
 * Copyright(c) 2021 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */

const { Error, UndefinedError } = require("oups");
const { transform } = require("damless");

class CrudService {

    constructor(giveme, collectionName, dbName) {
        if (!giveme) throw new UndefinedError("giveme");
        if (!collectionName) throw new UndefinedError("collectionName");
        if (typeof collectionName !== "string") throw new Error("collectionName isn't a string.");

        this.giveme = giveme;
        this.collectionName = collectionName;
        this.bucketName = `${collectionName}.gridfs`;
        this.dbName = dbName;   //could be null
    };

    /**
     * Singleton DB connection to avoid multiple database connection
     */
    async collection(options = {}) {
        const mongo = await this.giveme.resolve("mongo");
        const db = await mongo.singleConnect(this.dbName, options);
        return db.collection(this.collectionName);
    }

    /**
     * Create a database connection
     * Not Singleton
     * return { db, client }
     */
    async connect(options = {}) {
        const mongo = await this.giveme.resolve("mongo");
        const { db, client } = await mongo.singleConnect(this.dbName, options);
        const collection = db.collection(this.collectionName);
        return { db, client, collection };
    }


    // deprecated Use insert, update instead
    save(filter = ({ _id }) => ({ _id }), options, output) {
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

    insert(options, output) {
        return transform(async (chunk, enc) => {
            const o = typeof options == "function" ? options(chunk) : options;
            const res = await this.mongoInsertOne(chunk, o);
            if (typeof output == "function") return output(res, chunk);
            if (!res) throw new Error("Fail to insert document.", { document: d });
            return wrap(res);
        })
    }

    update(filter = ({ _id }) => ({ _id }), update, options = {}, output) {
        return transform(async (chunk, enc) => {
            const { _id, ...doc } = chunk;
            const f = typeof filter == "function" ? filter(chunk) : filter;
            const u = typeof update == "function" ? update(chunk) : update || doc;
            const o = typeof options == "function" ? options(chunk) : options;
            const res = await this.mongoUpdateOne(f, u, o);
            if (typeof output == "function") return output(res, chunk);
            if (!res) throw new Error("Fail to update document.", { filter: f, update: u });
            return wrap(res);
        })
    }

    replace(filter = ({ _id }) => ({ _id }), replacement, options, output) {
        return transform(async (chunk, enc) => {
            const { _id, ...doc } = chunk;
            const f = typeof filter == "function" ? filter(chunk) : filter;
            const r = typeof replacement == "function" ? replacement(chunk) : doc;
            const o = typeof options == "function" ? options(chunk) : options;
            const res = await this.mongoReplaceOne(f, r, o);
            if (typeof output == "function") return output(res, chunk);
            if (!res) throw new Error("Fail to replace document.", { filter: f, replacement: r });
            return wrap(res);
        })
    }

    delete(filter = ({ _id }) => ({ _id }), options, output) {
        return transform(async (chunk, enc) => {
            const f = typeof filter == "function" ? filter(chunk) : filter;
            const o = typeof options == "function" ? options(chunk) : options;
            const res = this.mongoDeleteOne(f, o);
            if (typeof output == "function") return output(res, chunk);
            if (!res) throw new Error("Fail to delete document.", { document: chunk });
            return wrap(res);
        })
    }

    deleteMany(filter = ({ _id }) => ({ _id }), options, output) {
        return transform(async (chunk, enc) => {
            const f = typeof filter == "function" ? filter(chunk) : filter;
            const o = typeof options == "function" ? options(chunk) : options;
            const res = this.mongoDeleteMany(f, o);
            if (typeof output == "function") return output(res, chunk);
            if (!res) throw new Error("Fail to delete document.", { document: chunk });
            return wrap(res);
        })
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

    async mongoCountDocuments(filter, options) {
        const collection = await this.collection();
        return await collection.countDocuments(filter, options);
    }

    async mongoEstimatedDocumentCount(options) {
        const collection = await this.collection();
        return await collection.estimatedDocumentCount(options);
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

    async dropDatabase(options) {
        const collection = await this.collection();
        return await collection.dropDatabase(options);
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
        catch (error) {
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

    async mongoFind(filter, options, operations = {}) {
        const collection = await this.collection();
        let cursor = await collection.find(filter, options);
        const { skip, limit, sort, project } = operations;
        if (skip) cursor = cursor.skip(skip);
        if (limit) cursor = cursor.limit(limit);
        if (sort) cursor = cursor.sort(sort);
        if (project) cursor = cursor.project(project);
        return cursor;
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

    // deprecated Use insert, update instead
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

    /**
     * GridFS
     */

    async gridfs(options = {}) {
        const mongo = await this.giveme.resolve("mongo");
        return await mongo.gridfs(this.bucketName, this.dbName, options);
    }

    async gridfsFiles(options = {}) {
        const mongo = await this.giveme.resolve("mongo");
        const db = await mongo.singleConnect(this.dbName, options);
        return db.collection(`${this.bucketName}.files`);
    }

    async gridfsOpenUploadStream(filename, options) {
        const bucket = await this.gridfs();
        if (!filename) throw new Error("Filename isn't defined.");
        return bucket.openUploadStream(filename, options);
    };

    async gridfsOpenDownloadStream(id, options) {
        const bucket = await this.gridfs();
        if (!id) throw new Error("id isn't defined.");
        return bucket.openDownloadStream(id, options);
    };

    async gridfsFindOne(filter, options) {
        const collection = await this.gridfsFiles();
        return await collection.find(filter, options);
    }
};

/* Original CommandResult cannot be serialized to json so we create a js object. */
wrap = (commandResult) => {
    if (!commandResult) return null;
    let {
        connection,
        message,
        result,
        ...others
    } = commandResult;

    if (result) {
        const {
            $clusterTime,
            electionId,
            operationTime,
            opTime,
            ...others
        } = result;

        result = {
            ...others
        }
    }

    const output = {
        ...result ? { result } : {},
        ...others
    }
    return output;
}

exports = module.exports = CrudService;