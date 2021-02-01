/*!
 * damless-mongo
 * Copyright(c) 2021 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
 */
"use strict"

const setup = require("./setup");
const expect = require("expect.js");
const process = require("process");
const { inspect } = require("util");
process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', inspect(reason));
});
  
describe("A suite for mongo db", () => {
    before(async function() {  this.timeout(10000); await setup.run({ http: false }); });
    after(async () => await setup.stop());

    it("connect", async () => {
        const mongo = await setup.damless.resolve("mongo");
        const db = await mongo.singleConnect();
        expect(db.databaseName).to.be("test");
    });

    it("find", async () => {
        const mongo = await setup.damless.resolve("mongo");
        const db = await mongo.singleConnect();
        const docs = await db.collection("users").find().toArray();
        expect(docs.length).to.be(6);
    }).timeout(10000);
});
