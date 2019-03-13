/*!
 * damless-mongo
 * Copyright(c) 2018 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */

"use strict";

const { UndefinedError } = require("oups");
const Crud = require('./crud');
const { promisify } = require("util");
const { pipeline } = require("stream");
const pipelineAsync = promisify(pipeline);

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

    constructor(giveme, collectionName, dbName) {
        super(giveme, collectionName, dbName);
        giveme.inject("mongo-querystring", `${__dirname}/mongo-querystring`, { reload: false });
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

        return await pipelineAsync(
            this.findOne(filter, options),
            stream.mode("object")
        );
    }


    async httpFind(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options, skip, limit, sort, project } = context.mongo || this.qs.parse(context.querystring) || {};

        let cursor = this.find(filter, options);
        if (skip) cursor = cursor.skip(skip);
        if (limit) cursor = cursor.limit(limit);
        if (sort) cursor = cursor.sort(sort);
        if (project) cursor = cursor.project(project);

        return await pipelineAsync(
            cursor,
            stream
        );
    }

    async httpAggregate(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { pipeline, options } = context.mongo || {};

        return await pipelineAsync(
            this.aggregate(pipeline, options),
            stream
        );
    }

    async httpInsertOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        return await pipelineAsync(
            stream.mode("object"),
            this.insert(),
            stream
        );
    }

    async httpInsertMany(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        return await pipelineAsync(
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

        return await pipelineAsync(
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

        return await pipelineAsync(
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

        return await pipelineAsync(
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

        return await pipelineAsync(
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

        return await pipelineAsync(
            this.deleteOne(filter, options),
            stream.mode("object")
        );
    }

    async httpDeleteMany(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};

        return await pipelineAsync(
            this.deleteOne(filter, options),
            stream
        );
    }

    async httpSaveOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        if (!context.mongo && context.params.id) filter = { ...filter || {}, _id: context.params.id };

        return await pipelineAsync(
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

        return await pipelineAsync(
            stream,
            this.saveOne(filter, options),
            stream
        );
    }

    async httpCountDocuments(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        const { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};

        return await pipelineAsync(
            this.countDocuments(filter, options),
            stream.mode("object")
        );
    }
}

exports = module.exports = HttpService;