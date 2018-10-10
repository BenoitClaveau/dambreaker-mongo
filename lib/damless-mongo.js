/*!
 * damless-mongo
 * Copyright(c) 2018 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
 */

//https://mongodb.github.io/node-mongodb-native

"use strict";

const { Error, UndefinedError } = require("oups");
const { MongoClient, Server } = require("mongodb");
const { ObjectID } = require("mongodb");
const { Mutex } = require("./core");

const mutex = new Mutex();

class MongoService {
    constructor(config) {
        if (!config.mongo) throw new UndefinedError("config.mongo");
        this.config = config;
        this.connections = {};
        
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

    async connect(dbName = "db") {
        let connection = this.connections[dbName];
        if (connection) return connection.db;

        return await mutex.lock(async () => {
            let config = this.configuration(dbName);
            const { user, password, host, port, database } = config;
            let db, client, server, connectionString;
            try {
                //https://github.com/mongodb/node-mongodb-native/blob/3.0.0/CHANGES_3.0.0.md#api-changes
                const portStr = port ? ":" + port : ""; //port is optional
                connectionString = user && password ? `mongodb://${user}:${password}@${host}${portStr}/${database}` : `mongodb://${host}${portStr}/${database}`;
                console.log("Mongo connection", connectionString);
                client = await MongoClient.connect(connectionString, { useNewUrlParser: true });
                db = client.db(database);
            }
            catch (error) {
                throw new Error("Failed to connect to the mongo database ${connectionString}.", { connectionString, database }, error);
            }
            if (!db.collection) throw new Error("No collection in database ${database} on ${host}:${port}.", { host, port, database });

            this.connections[dbName] = { db, client, server };
            client.on("close", () => {
                delete this.connections[dbName];
            });
            return db;
        });
    }

    async unmount() {
        for (let [dbName, { client, db, server }] of Object.entries(this.connections)) {
            try {
                await client.close();
            }
            catch (error) {
                console.error(error)
            }
        }
    }
};

exports = module.exports = MongoService;