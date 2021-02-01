/*!
 * damless-mongo
 * Copyright(c) 2021 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */

"use strict";

const { UndefinedError, HttpError } = require("oups");
const Crud = require('./crud');
const { promisify } = require("util");
const stream = require("stream");
const pipeline = promisify(stream.pipeline);

/**
 * context.mongo must be defined
 * 
 * default rest api
 * 
 * GET/:id                          => httpFindOne
 * GET/?query-string as filter      => httpFind
 * POST                             => httpInsertOne
 * PUT/:id                          => httpSaveOne
 * PATCH/:id                        => httpUpdateOne with $set
 * DELETE /:id                      => httpDeleteOne
 */
class HttpService extends Crud {

    static *services() {
        yield { name: "mongo-querystring", location: `${__dirname}/mongo-querystring`, reload: false };
    }

    constructor(giveme, collectionName, dbName) {
        super(giveme, collectionName, dbName);
    }

    async mount() {
        this.qs = await this.giveme.resolve("mongo-querystring");
    }

    /* http api */

    async httpFindOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        if (!context.mongo && context.params.id) filter = { ...filter || {}, _id: context.params.id };

        const res = await this.mongoFindOne(filter, options);
        stream
            .mode("object")
            .end(wrap(res));
    }


    async httpFind(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        const { filter, options, ...operations } = context.mongo || this.qs.parse(context.querystring) || {};

        const cursor = await this.mongoFind(filter, options, operations);

        return await pipeline(
            cursor,
            stream
        );
    }

    async httpAggregate(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        const { pipeline, options } = context.mongo || {};

        const cursor = await this.mongoAggregate(pipeline, options);

        return await pipeline(
            cursor,
            stream
        );
    }

    async httpInsertOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        return await pipeline(
            stream.mode("object"),
            this.insert(),
            stream
        );
    }

    async httpInsertMany(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        return await pipeline(
            stream,
            this.insert(),
            stream
        );
    }

    /* user $set, $unset, $rename */
    async httpUpdateOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        if (!context.mongo && context.params.id) filter = { ...filter || {}, _id: context.params.id };

        return await pipeline(
            stream.mode("object"),
            this.update(filter, options),
            stream
        );
    }

    /* user $set, $unset, $rename */
    async httpUpdateMany(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};

        return await pipeline(
            stream,
            this.update(filter, options),
            stream
        );
    }

    async httpReplaceOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        if (!context.mongo && context.params.id) filter = { ...filter || {}, _id: context.params.id };

        return await pipeline(
            stream.mode("object"),
            this.replace(filter, options),
            stream
        );
    }

    async httpReplaceMany(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};

        return await pipeline(
            stream,
            this.replace(filter, options),
            stream
        );
    }

    async httpDeleteOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        if (!context.mongo && context.params.id) filter = { ...filter || {}, _id: context.params.id };

        const res = await this.mongoDeleteOne(filter, options);
        stream
            .mode("object")
            .end(wrap(res));
    }

    async httpDeleteMany(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};

        const res = await this.mongoDeleteMany(filter, options);
        stream
            .mode("object")
            .end(wrap(res));
    }

    async httpSaveOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        if (!context.mongo && context.params.id) filter = { ...filter || {}, _id: context.params.id };

        return await pipeline(
            stream.mode("object"),
            this.save(filter, options),
            stream
        );
    }

    async httpSaveMany(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};

        return await pipeline(
            stream,
            this.save(filter, options),
            stream
        );
    }

    async httpCountDocuments(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        const { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};

        const count = await this.mongoCountDocuments(filter, options);
        stream
            .mode("object")
            .end({ count });
    }

    async httpDownload(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, attachment } = context.mongo || this.qs.parse(context.querystring) || {};

        const item = await this.gridfsFindOne(filter);
        if (!item) throw new HttpError(404);

        const file = await this.gridfsOpenDownloadStream(item._id);
        stream.respond({
            "Content-Type": file.contentType,
            "Content-Length": file.length,
            "Transfer-Encoding": "chuncked",
            ...attachment ? {
                "Content-Disposition": `attachment;filename=${attachment}`
            } : {}
        })
        return await pipeline(
            file,
            stream
        );
    }
}

exports = module.exports = HttpService;