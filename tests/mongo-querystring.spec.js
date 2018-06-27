/*!
 * damless-mongo
 * Copyright(c) 2018 Benoît Claveau <benoit.claveau@gmail.com>
 * MIT Licensed
 */
"use strict"

const setup = require("./setup");
const damless = require("damless");
const qs0 = require("qs");
const expect = require("expect.js");
const { inspect } = require("util");
process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', inspect(reason));
});


describe("A suite for mongo-querystring", () => {

    before(async () => await setup.run({ mongo: false, http: false }))
    after(async () => await setup.stop())

    it("parse regexp", async () => {
        const qs = await setup.resolve("mongo-querystring");
        const query = qs.parse("name=/^pa/");
        expect(query.filter).to.eql({
            name: {
                $option: "",
                "$regex": "^pa"
            }
        });
    });

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
});
