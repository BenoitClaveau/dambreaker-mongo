/*!
 * damless-mongo
 * Copyright(c) 2018 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
 */
"use strict"

const setup = require("./setup");
const damless = require("damless");
const expect = require("expect.js");
const { inspect } = require("util");
process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', inspect(reason));
});

describe("A suite for GridFS", () => {

    before(async function() {  this.timeout(10000); await setup.run(); });
    after(async () => await setup.stop())

    it("gridfs", async () => {
        // const { damless } = setup;
        // const client = await damless.resolve("client");
        // const res = await client.get({ url: "http://localhost:3100/users", json: true });
        // expect(res.statusCode).to.be(200);
        // expect(res.body.length).to.be(2);
    });
});
