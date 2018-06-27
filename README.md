# damless-mongo
[Mongo](https://www.npmjs.com/package/mongodb) service for [damless](https://www.npmjs.com/package/damless).

 [![NPM][npm-image]][npm-url]
 [![Build Status][travis-image]][travis-url]
 [![Coverage Status][coveralls-image]][coveralls-url]

## Features

  * [damless](https://www.npmjs.com/package/damless)
  * [Mongo API](http://mongodb.github.io/node-mongodb-native/2.3/api/)
  * Singleton

```js
return mongo.db.then(db => {
  //db is a singleton Mongo Db instance
});
```

### Add the mongo connection string in damless.json

```damless.json
{
	"mongo": {
        "connectionString": "mongodb://localhost:27017/database"
    },
}
```

### Inject the damless mongo service

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
damless.inject("mongo" ,"damless-mongo");
```

### Use REST api

```js

class Api {
    constructor(mongo) {    //mongo service is injected by damless DI
        super("<collectionName>", mongo);
    };
```

### Override the default behaviour

```js
const { CRUD } = require("damless-mongo");

class Api extends CRUD {
  constructor(mongo) {
    this.mongo = mongo;
  };
};
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
