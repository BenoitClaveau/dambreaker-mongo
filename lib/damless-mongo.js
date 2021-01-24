/*!
 * damless-mongo
 * Copyright(c) 2021 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
 */

//https://mongodb.github.io/node-mongodb-native

"use strict";

const { Error, UndefinedError } = require("oups");
const { MongoClient, Server } = require("mongodb");
const { ObjectID } = require("mongodb");
const { Mutex } = require("./services");
const EventEmitter = require('events');

const mutex = new Mutex();

class MongoService extends EventEmitter {
    constructor(config) {
        super();
        if (!config.mongo) throw new UndefinedError("config.mongo");
        this.config = config;
        this.connections = {};
        this.mounted = false;

        RegExp.prototype.toJSON = RegExp.prototype.toString; //serialize Regex
        ObjectID.prototype.inspect = function () {
            return "ObjectID(\"" + this.toString() + "\")";
        };
    }

    configuration(dbName) {
        switch (dbName) {
            case "db":
                return this.config.mongo;
            default:
                if (!this.config.mongo[dbName]) throw new Error("Failed to read mongo configuration for ${dbName}", { dbName: dbName, "config.json": `config.mongo.${dbName}` });
                return this.config.mongo[dbName];
        }
    }

    async singleConnect(dbName, options) {
        if (!this.mounted) throw new Error("MongoService is not mounted.");
        if (this.connections[dbName]) return this.connections[dbName].db; // On vérifie que la connexion n'existe pas avant d'attendre le jeton (perf)

        return await mutex.lock(async () => { // On attend un jeton pour éviter plusieurs créations de connexion.
            if (!this.mounted) throw new Error("MongoService is not mounted.");
            if (this.connections[dbName]) return this.connections[dbName].db; // On vérifie que la connexion n'existe car elle a pu être créée en attendant le jeton.

            const { db, client } = await this.connect(dbName, options);
            this.connections[dbName] = { db, client };
            client.on("close", () => {
                delete this.connections[dbName];
                this.emit("close", { name: dbName });
            });
            return db;
        });
    }

    /**
     * Waring must be close manually
     */
    async connect(dbName = "db", options = {}) {
        const config = this.configuration(dbName);
        const { user, password, host, port, database } = config;
        try {
            //https://github.com/mongodb/node-mongodb-native/blob/3.0.0/CHANGES_3.0.0.md#api-changes
            const portStr = port ? ":" + port : ""; //port is optional
            const connectionString = user && password ? `mongodb://${user}:${password}@${host}${portStr}/${database}` : `mongodb://${host}${portStr}/${database}`;
            const client = await MongoClient.connect(connectionString, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                ...options
            });
            const db = client.db(database);
            this.emit("connect", { connectionString });
            if (!db.collection) throw new Error("No collection in database ${database} on ${host}:${port}.", { host, port, database });
            return { db, client };
        }
        catch (error) {
            throw new Error("Failed to connect to the mongo database ${connectionString}.", { connectionString, database }, error);
        }
    }

    async mount() {
        this.mounted = true;
    }

    async unmount() {
        // I use mutex to avoid new connection.
        await mutex.lock(async () => {
            this.mounted = false;
        });
        await this.close();
    }

    async close() {
        for (let [dbName, { client, db, server }] of Object.entries(this.connections)) {
            await client.close();
        }
    }
};

exports = module.exports = MongoService;