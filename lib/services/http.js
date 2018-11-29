/*!
 * damless-mongo
 * Copyright(c) 2018 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */

"use strict";

const { UndefinedError } = require("oups");
const Crud = require('./crud');

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

        stream.mode("object");
        return this.findOne(filter, options).pipe(stream);
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

        return cursor.pipe(stream);
    }

    async httpAggregate(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { pipeline, options } = context.mongo || {};

        return this.aggregate(pipeline, options).pipe(stream);
    }

    async httpInsertOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        return stream
            .mode("object")
            .pipe(this.insert())
            .pipe(stream);
    }

    async httpInsertMany(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        return stream
            .pipe(this.insert())
            .pipe(stream);
    }

    /* user $set, $unset, $rename */
    async httpUpdateOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        if (!context.mongo && context.params.id) filter = { ...filter || {}, _id: context.params.id };

        return stream
            .mode("object")
            .pipe(this.update(filter, options))
            .pipe(stream);
    }

    /* user $set, $unset, $rename */
    async httpUpdateMany(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};

        return stream
            .pipe(this.update(filter, options))
            .pipe(stream);
    }

    async httpReplaceOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        if (!context.mongo && context.params.id) filter = { ...filter || {}, _id: context.params.id };

        return stream
            .mode("object")
            .pipe(this.replace(filter, options))
            .pipe(stream);
    }

    async httpReplaceMany(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};

        return stream
            .mode("object")
            .pipe(this.replace(filter, options))
            .pipe(stream);
    }

    async httpDeleteOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        if (!context.mongo && context.params.id) filter = { ...filter || {}, _id: context.params.id };

        stream.mode("object");
        return this.deleteOne(filter, options).pipe(stream);
    }

    async httpDeleteMany(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};

        return this.deleteOne(filter, options).pipe(stream);
    }

    async httpSaveOne(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};
        if (!context.mongo && context.params.id) filter = { ...filter || {}, _id: context.params.id };

        return stream
            .mode("object")
            .pipe(this.save(filter, options))
            .pipe(stream);
    }

    async httpSaveMany(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        let { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};

        return stream
            .pipe(this.save(filter, options))
            .pipe(stream);
    }

    async httpCountDocuments(context, stream, headers) {
        if (!context) throw new UndefinedError("context");
        if (!stream) throw new UndefinedError("stream");
        if (!headers) throw new UndefinedError("headers");

        const { filter, options } = context.mongo || this.qs.parse(context.querystring) || {};

        stream.mode("object");
        return this.countDocuments(filter, options).pipe(stream);
    }
}

exports = module.exports = HttpService;