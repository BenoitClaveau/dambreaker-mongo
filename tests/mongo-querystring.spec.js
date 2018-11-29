/*!
 * damless-mongo
 * Copyright(c) 2018 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
 */
"use strict"

const setup = require("./setup");
const expect = require("expect.js");
const { inspect } = require("util");
const querystring = require('querystring');
process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', inspect(reason));
});

describe("A suite for mongo-querystring", () => {

    before(async function() {  this.timeout(10000); await setup.run({ mongo: false, http: false }); });
    after(async () => await setup.stop())

    it("parse greater", async () => {
        const qs = await setup.resolve("mongo-querystring");
        const query = qs.parse("price>10");
        expect(query.filter).to.eql({
            price: {
                $gt: 10
            }
        });
    });

    it("parse and", async () => {
        const qs = await setup.resolve("mongo-querystring");
        const query = qs.parse("price>10&&price<5");
        expect(query.filter).to.eql({
            $and: [{
                    price: {
                        $gt: 10
                    },
                }, {
                    price: {
                        $lt: 5
                    }
                }
            ]
        });
    });

    it("parse or", async () => {
        const qs = await setup.resolve("mongo-querystring");
        const query = qs.parse("price>10||price<5");
        expect(query.filter).to.eql({
            $or: [{
                    price: {
                        $gt: 10
                    },
                }, {
                    price: {
                        $lt: 5
                    }
                }
            ]
        });
    });

    it("parse regexp", async () => {
        const qs = await setup.resolve("mongo-querystring");
        const query = qs.parse("name=/^pa/");
        expect(query.filter).to.eql({
            name: {
                $options: "",
                $regex: "^pa"
            }
        });
    });

    it("parse regexp with undefined expression", async () => {
        const qs = await setup.resolve("mongo-querystring");
        const query = qs.parse("name=/^undefined/");
        expect(query.filter).to.eql({
            name: {
                $options: "",
                $regex: "^undefined"
            }
        });
    });

    it("parse or with regex", async () => {
        const qs = await setup.resolve("mongo-querystring");
        const query = qs.parse("email=/^ben/ig||firstName=/^ben/ig");
        expect(query.filter).to.eql({
            $or: [
                {
                    email: {
                        $options:"ig",
                        $regex: "^ben"
                    }
                }, {
                    firstName: {
                        $options:"ig",
                        $regex: "^ben"
                    }
                }
            ]
        });
    });

    it("parse multiple or with regex", async () => {
        const qs = await setup.resolve("mongo-querystring");
        const query = qs.parse("role=client&(email=/^ben/ig||firstName=/^ben/ig)&limit=8");
        expect(query.filter).to.eql({
            $or: [
                {
                    email: {
                        $options:"ig",
                        $regex: "^ben"
                    }
                }, {
                    firstName: {
                        $options:"ig",
                        $regex: "^ben"
                    }
                }
            ],
            role: "client"
        });
        expect(query.limit).to.be(8);
    });

    it("parse array", async () => {
        const qs = await setup.resolve("mongo-querystring");
        const query = qs.parse("name[0]=1&name[1]=32");
        expect(query.filter).to.eql({
            name: [1,32]
        });
    });

    it("parse array", async () => {
        const qs = await setup.resolve("mongo-querystring");
        const query = qs.parse("name=1&name=32&name=8");
        expect(query.filter).to.eql({
            name: [1,32,8]
        });
    });

    it("parse array", async () => {
        const qs = await setup.resolve("mongo-querystring");
        const query = qs.parse("name[]=1&name[]=32&name[]=8");
        expect(query.filter).to.eql({
            name: [1,32,8]
        });
    });

    it("parse array without id", async () => {
        const qs = await setup.resolve("mongo-querystring");
        const query = qs.parse("name[0]=1&name[0]=32&name[1]=8");
        expect(query.filter).to.eql({
            name: [[1,32],8]
        });
    });

    it("parse array", async () => {
        const qs = await setup.resolve("mongo-querystring");
        const str = querystring.stringify({
            names: ["pierre", "paul", "jacques"]
        });
        const query = qs.parse(str);
        expect(query.filter).to.eql({
            names: ["pierre", "paul", "jacques"]
        });
    });
});
