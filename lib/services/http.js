/*!
 * damless-mongo
 * Copyright(c) 2018 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */

"use strict";

const { UndefinedError } = require("oups");
const Crud = require('./crud');
const { pipeline } = require('stream');
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

        return pipeline(
            this.findOne(filter, options),
            stream.mode("object"),
            error => {
                if (error) stream.emit("error", error); // !important throw error before destory all streams
            }
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

        return pipeline(
            cursor,
            stream,
            error => {
                if (error) throw error; // !important throw error before destory all streams
            }
        );
    }

    async httpAggregate(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { pipeline, options } = context.mongo || {};

        return pipeline(
            this.aggregate(pipeline, options),
            stream,
            error => {
                if (error) throw error; // !important throw error before destory all streams
            }
        );
    }

    async httpInsertOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        return pipeline(
            stream.mode("object"),
            this.insert(),
            stream,
            error => {
                if (error) throw error; // !important throw error before destory all streams
            }
        );
    }

    async httpInsertMany(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        return pipeline(
            stream,
            this.insert(),
            stream,
            error => {
                if (error) throw error; // !important throw error before destory all streams
            }
        );
    }

    /* user $set, $unset, $rename */
    async httpUpdateOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        if (!context.mongo && context.params.id) filter = { ...filter || {}, _id: context.params.id };

        return pipeline(
            stream.mode("object"),
            this.update(filter, options),
            stream,
            error => {
                if (error) throw error; // !important throw error before destory all streams
            }
        );
    }

    /* user $set, $unset, $rename */
    async httpUpdateMany(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};

        return pipeline(
            stream,
            this.update(filter, options),
            stream,
            error => {
                if (error) throw error; // !important throw error before destory all streams
            }
        );
    }

    async httpReplaceOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        if (!context.mongo && context.params.id) filter = { ...filter || {}, _id: context.params.id };

        return pipeline(
            stream.mode("object"),
            this.replace(filter, options),
            stream,
            error => {
                if (error) throw error; // !important throw error before destory all streams
            }
        );
    }

    async httpReplaceMany(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};

        return pipeline(
            stream,
            this.replace(filter, options),
            stream,
            error => {
                if (error) throw error; // !important throw error before destory all streams
            }
        );
    }

    async httpDeleteOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        if (!context.mongo && context.params.id) filter = { ...filter || {}, _id: context.params.id };

        return pipeline(
            this.deleteOne(filter, options),
            stream.mode("object"),
            error => {
                if (error) throw error; // !important throw error before destory all streams
            }
        );
    }

    async httpDeleteMany(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};

        return pipeline(
            this.deleteOne(filter, options),
            stream,
            error => {
                if (error) throw error; // !important throw error before destory all streams
            }
        );
    }

    async httpSaveOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        if (!context.mongo && context.params.id) filter = { ...filter || {}, _id: context.params.id };

        return pipeline(
            stream.mode("object"),
            this.save(filter, options),
            stream,
            error => {
                if (error) throw error; // !important throw error before destory all streams
            }
        );
    }

    async httpSaveMany(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};

        return pipeline(
            stream,
            this.save(filter, options),
            stream,
            error => {
                if (error) throw error; // !important throw error before destory all streams
            }
        );
    }

    async httpCountDocuments(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        const { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};

        return pipeline(
            this.countDocuments(filter, options),
            stream.mode("object"),
            error => {
                if (error) throw error; // !important throw error before destory all streams
            }
        );
    }
}

exports = module.exports = HttpService;