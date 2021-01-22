/*!
 * damless-mongo
 * Copyright(c) 2021 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
 */
"use strict"

const setup = require("./setup");
const expect = require("expect.js");
const { inspect } = require("util");
process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', inspect(reason));
});

describe("A suite for http", () => {

    before(async function() {  this.timeout(10000); await setup.run(); });
    after(async () => await setup.stop())

    it("get", async () => {
        const { damless } = setup;
        const client = await damless.resolve("client");
        const res = await client.get({ url: "http://localhost:3100/users", json: true });
        expect(res.statusCode).to.be(200);
        expect(res.body.length).to.be(6);
    }).timeout(10000);

    it("get with regexp", async () => {
        const { damless } = setup;
        const client = await damless.resolve("client");
        const res = await client.get({ url: "http://localhost:3100/users?login=/^PA/ig", json: true });
        expect(res.statusCode).to.be(200);
        expect(res.body.length).to.be(2);
    });

    it("get with regexp 2", async () => {
        const { damless } = setup;
        const client = await damless.resolve("client");
        const res = await client.get({ url: "http://localhost:3100/users?login=/^PA/", json: true });
        expect(res.statusCode).to.be(200);
        expect(res.body.length).to.be(0);
    });

    it("get with or", async () => {
        const { damless } = setup;
        const client = await damless.resolve("client");
        const res = await client.get({ url: "http://localhost:3100/users?login=/^PA/ig||password=passw@rd", json: true });
        expect(res.body.length).to.be(3);
    }).timeout(6000);

    it("get with ()", async () => {
        const { damless } = setup;
        const client = await damless.resolve("client");
        const res = await client.get({ url: "http://localhost:3100/users?(login=/^PA/ig||password=passw@rd)", json: true });
        expect(res.body.length).to.be(3);
    }).timeout(6000);

    it("custom find", async () => {
        const { damless } = setup;
        const client = await damless.resolve("client");
        const res = await client.get({ url: "http://localhost:3100/users2", json: true });
        expect(res.statusCode).to.be(200);
        expect(res.body.length).to.be(6);
    });

    it("user by city", async () => {
        const { damless } = setup;
        const client = await damless.resolve("client");
        const res = await client.get({ url: "http://localhost:3100/users-by-city", json: true });
        expect(res.statusCode).to.be(200);
        expect(res.body.length).to.be(5);
        expect(res.body[0].city).to.be("Bordeaux");
        expect(res.body[1].city).to.be("Nantes");
        expect(res.body[2].city).to.be("Paris");
        expect(res.body[3].city).to.be("Puteaux");
        expect(res.body[4].city).to.be("Versailles");
    });

    xit("get by id", async () => {
        const { damless } = setup;
        const client = await damless.resolve("client");
        const res = await client.get({ url: "http://localhost:3100/user/1", json: true });
        expect(res.body.length).to.be(3);
    }).timeout(6000);

    it("post", async () => {
        const { damless } = setup;
        const client = await damless.resolve("client");
        const res = await client.post({
            url: "http://localhost:3100/user",
            json: {
                login: "ben",
                password: "0001",
                address: { city: "Paris" }
            },
        });
        expect(res.body.ops[0].login).to.be("ben");
        expect(res.body.ops[0].address.city).to.be("Paris");
    }).timeout(6000);

    it("post with save", async () => {
        const { damless } = setup;
        const client = await damless.resolve("client");
        const res = await client.post({
            url: "http://localhost:3100/save",
            json: {
                login: "ben",
                password: "x0001",
                address: { city: "Paris" }
            },
        });
        expect(res.body.login).to.be("ben");
        expect(res.body.password).to.be("x0001");
        expect(res.body.address.city).to.be("Paris");

        const res2 = await client.post({
            url: `http://localhost:3100/save?_id=${res.body._id}`,
            json: {
                login: "benoit",
            },
        });
        expect(res2.body.login).to.be("benoit");
        expect(res2.body.password).to.be(undefined);

    }).timeout(6000);

    it("put", async () => {
        const { damless } = setup;
        const client = await damless.resolve("client");
        const res = await client.post({
            url: "http://localhost:3100/user",
            json: {
                login: "put",
                password: "w0001",
                address: { city: "Versailles" }
            },
        });
        expect(res.body.ops[0].login).to.be("put");
        expect(res.body.ops[0].password).to.be("w0001");
        expect(res.body.ops[0].address.city).to.be("Versailles");
        const res2 = await client.put({
            url: `http://localhost:3100/user/${res.body.ops[0]._id}`,
            json: {
                login: "put",
                password: "w0003",
            },
        });
        expect(res2.body.ops[0].login).to.be("put");
        expect(res2.body.ops[0].password).to.be("w0003");
    }).timeout(12000);

    it("patch", async () => {
        const { damless } = setup;
        const client = await damless.resolve("client");
        const res = await client.post({
            url: "http://localhost:3100/user",
            json: {
                login: "put",
                password: "w0001",
                address: { city: "Versailles" }
            },
        });
        expect(res.body.ops[0].login).to.be("put");
        expect(res.body.ops[0].password).to.be("w0001");
        expect(res.body.ops[0].address.city).to.be("Versailles");
        const res2 = await client.patch({
            url: `http://localhost:3100/user/${res.body.ops[0]._id}`,
            json: {
                $set: {
                    password: "w0003"
                }
            },
        });
        expect(res2.body.result.ok).to.be(1);
        const res3 = await client.get({
            url: `http://localhost:3100/user/${res.body.ops[0]._id}`,
            json: true
        });
        expect(res3.body.login).to.be("put");
        expect(res3.body.password).to.be("w0003");
        expect(res3.body.address.city).to.be("Versailles");
    }).timeout(18000);

    it("delete", async () => {
        const { damless } = setup;
        const client = await damless.resolve("client");
        const res = await client.post({
            url: "http://localhost:3100/user",
            json: {
                login: "delete",
                password: "l001",
                address: { city: "Lyon" }
            },
        });
        expect(res.body.ops[0]._id).not.to.be(undefined)
        expect(res.body.ops[0].login).to.be("delete");
        expect(res.body.ops[0].password).to.be("l001");
        expect(res.body.ops[0].address.city).to.be("Lyon");
        const res2 = await client.delete({
            url: `http://localhost:3100/user/${res.body.ops[0]._id}`,
            json: true,
        });
        expect(res2.body.result.ok).to.be(1);
        try {
            await client.get({
                url: `http://localhost:3100/user/5b477805630b3c121899a796`,
                json: true
            });
            throw Error("Error");
        } catch (error) {
            expect(error.statusCode).to.be(500); //need to be replace by 404
        }
    }).timeout(60000);
});
