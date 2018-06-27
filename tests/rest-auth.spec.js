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

describe("A suite for rest-auth", () => {

    // before(async () => await setup.run())
    // after(async () => await setup.stop())

    // it("find", async () => {
    //     const { damless } = setup;
    //     const auth = await damless.resolve("auth");
    //     const token = auth.encode({ login: "paul" });
    //     const client = await damless.resolve("client");
    //     const res = await client.get({ url: "http://localhost:3100/auth-users", auth: { "bearer": token }, json: true });
    //     expect(res.statusCode).to.be(200);
    //     expect(res.body.length).to.be(2);
    // });

    // it("find 401", async () => {
    //     const { damless } = setup;
    //     const client = await damless.resolve("client");
    //     try {
    //         await client.get({ url: "http://localhost:3100/auth-users", json: true });
    //     }
    //     catch(error) {
    //         expect(error.statusCode).to.be(401);
    //     }
    // });
});
