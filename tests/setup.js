/*!
 * damless-mongo
 * Copyright(c) 2018 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
 */
"use strict"

const { Error } = require("oups");
const damless = require("damless");
const path = require("path");
const { inspect } = require("util");

class Setup {

    constructor() {
        this.damless = new damless({ dirname: __dirname });
    }

    async resolve(name) {
        return await this.damless.resolve(name);
    }

    async run(options = {}) {
        const { mongo = true } = options;
        try {
            const { damless } = this;
            if (mongo) await damless.inject("mongo", path.join(__dirname, "..", "index"));
            await damless.start();
            
            if (!mongo)  return
            const config = await damless.resolve("config");
            if (config.mongo.host !== "localhost") throw new Error("Inconherent mongo connectionString.");
            if (config.mongo.database !== "test") throw new Error("Inconherent mongo connectionString.");

            await this.clear();
            await this.schema();
            await this.data();
        }
        catch(error) {
            console.error(inspect(error));
            throw error;
        }
    };

    async schema() {
        const { damless } = this;
        let mongo = await damless.resolve("mongo");
        let db = await mongo.connect();
        await db.createCollection("users");
        await db.ensureIndex("users", { "login": 1 });
    };
    
    async data() {
        const { damless } = this;
        const mongo = await damless.resolve("mongo");
        const db = await mongo.connect();

        [
            { login: "paul", password: "1234", address: { city: "Paris"}},
            { login: "henri", password: "mypass", address: { city: "Versailles"}},
            { login: "pierre", password: "pass", address: { city: "Paris"}},
            { login: "jean-paul", password: "passw@rd", address: { city: "Nantes"}},
            { login: "peter", password: "pan", address: { city: "Bordeaux"}},
            { login: "parker", password: "tony", address: { city: "Puteaux"}},
        ].map(async user => {;
            await db.collection("users").insertOne(user);
        })

    };

    async clear() {
        const { damless } = this;
        let mongo = await damless.resolve("mongo");
        let db = await mongo.connect();
        await db.collection("users").remove();
    };

    async stop() {
        const { damless } = this;
        await damless.stop();
    }

};

exports = module.exports = new Setup();
