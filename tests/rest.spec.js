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

describe("A suite for Rest", () => {

    before(async () => await setup.run())
    after(async () => await setup.stop())

    it("find", async () => {
        const { damless } = setup;
        const client = await damless.resolve("client");
        const res = await client.get({ url: "http://localhost:3100/users", json: true });
        expect(res.statusCode).to.be(200);
        expect(res.body.length).to.be(6);
    });

    it("custom find", async () => {
        const { damless } = setup;
        const client = await damless.resolve("client");
        const res = await client.get({ url: "http://localhost:3100/users2", json: true });
        expect(res.statusCode).to.be(200);
        expect(res.body.length).to.be(6);
    });

    it("find with regexp", async () => {
        const { damless } = setup;
        const client = await damless.resolve("client");
        const res = await client.get({ url: "http://localhost:3100/users?login=/^PA/ig", json: true });
        expect(res.statusCode).to.be(200);
        expect(res.body.length).to.be(2);
    });

    it("find with regexp 2", async () => {
        const { damless } = setup;
        const client = await damless.resolve("client");
        const res = await client.get({ url: "http://localhost:3100/users?login=/^PA/", json: true });
        expect(res.statusCode).to.be(200);
        expect(res.body.length).to.be(0);
    });

    it("find with or", async () => {
        const { damless } = setup;
        const client = await damless.resolve("client");
        const res = await client.get({ url: "http://localhost:3100/users?login=/^PA/ig||password=passw@rd", json: true });
        expect(res.body.length).to.be(3);
    }).timeout(6000);

    it("find with ()", async () => {
        const { damless } = setup;
        const client = await damless.resolve("client");
        const res = await client.get({ url: "http://localhost:3100/users?(login=/^PA/ig||password=passw@rd)", json: true });
        expect(res.body.length).to.be(3);
    }).timeout(6000);
});
