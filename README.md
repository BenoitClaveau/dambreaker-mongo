# damless-mongo
[Mongo](https://www.npmjs.com/package/mongodb) service for [damless](https://www.npmjs.com/package/damless).

 [![NPM][npm-image]][npm-url]
 [![Build Status][travis-image]][travis-url]
 [![Coverage Status][coveralls-image]][coveralls-url]

## Features

 * [damless](https://www.npmjs.com/package/damless)
 * [Mongo API](http://mongodb.github.io/node-mongodb-native/3.1/api/)

## REST api

 * GET/:id                          => httpFindOne
 * GET/?query-string as filter      => httpFind
 * POST                             => httpInsertOne
 * PUT/:id                          => httpSaveOne
 * PATCH/:id                        => httpUpdateOne with $set
 * DELETE /:id                      => httpDeleteOne

## Create an api

```js
const { Http } = require("damless-mongo");
class Api extends Http {

    constructor(giveme) {    //giveme is the dependencies injection service used by damless
        super(giveme, "<collectionName>");
    };

    ...
}
```

## Cutomize your api

```js
const { Http } = require("damless-mongo");
class Api extends Http {

    constructor(giveme) {    //giveme is the dependencies injection service used by damless
        super(giveme, "<collectionName>");
    };

    //override the default httpFind an use Crud primitives
    async httpFind(context, stream, headers) {
        this.findWords(context.query.q).pipe(stream);
    }
}
```

## Use lower level 

```js
const { Crud } = require("damless-mongo");
class Api extends Crud {

    constructor(giveme) {    //giveme is the dependencies injection service used by damless
        super(giveme, "<collectionName>");
    };

    ...
}
```


## Add the mongo connection string in damless.json

```damless.json
{
	"mongo": {
        "connectionString": "mongodb://localhost:27017/database"
    },
}
```

## Inject damless-mongo service

```services.json
{
  "services": [
    { "name": "mongo", "location": "damless-mongo" }
  ]
}
```

Or in javascript

```js
const DamLess = require("damless");
const damless = new DamLess();
damless.inject("mongo", "damless-mongo");
```

## Installation

```bash
$ npm install damless-mongo
```

## Test

To run our tests, clone the damless-mongo repo and install the dependencies.

```bash
$ git clone https://github.com/BenoitClaveau/damless-mongo --depth 1
$ cd damless-mongo
$ npm install
$ mongod --dbpath ./data/db
$ node.exe "../node_modules/mocha/bin/mocha" tests
```

[npm-image]: https://img.shields.io/npm/v/damless-mongo.svg
[npm-url]: https://npmjs.org/package/damless-mongo
[travis-image]: https://travis-ci.org/BenoitClaveau/damless-mongo.svg?branch=master
[travis-url]: https://travis-ci.org/BenoitClaveau/damless-mongo
[coveralls-image]: https://coveralls.io/repos/BenoitClaveau/damless-mongo/badge.svg?branch=master&service=github
[coveralls-url]: https://coveralls.io/github/BenoitClaveau/damless-mongo?branch=master
