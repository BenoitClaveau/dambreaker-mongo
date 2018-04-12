# dambreaker-mongo
[Mongo](https://www.npmjs.com/package/mongodb) service for [dambreaker](https://www.npmjs.com/package/dambreaker).

 [![NPM][npm-image]][npm-url]
 [![Build Status][travis-image]][travis-url]
 [![Coverage Status][coveralls-image]][coveralls-url]

## Features

  * [dambreaker](https://www.npmjs.com/package/dambreaker)
  * [Mongo API](http://mongodb.github.io/node-mongodb-native/2.3/api/)
  * Singleton

```js
return $mongo.db.then(db => {
  //db is a singleton Mongo Db instance
});
```

### Add the mongo connection string in dambreaker.json

```dambreaker.json
{
	"mongo": {
        "connectionString": "mongodb://localhost:27017/database"
    },
}
```

### Inject the dambreaker mongo service

```services.json
{
  "services": [
    { "name": "mongo", "location": "dambreaker-mongo" }
  ]
}
```

Or in javascript

```js
const DamBreaker = require("dambreaker");
const dambreaker = new DamBreaker();
dambreaker.inject("mongo" ,"dambreaker-mongo");
```

### Use REST api

```js

class Api {
    constructor(mongo) {    //mongo service is injected by dambreaker DI
        super("<collectionName>", mongo);
    };
```

### Override the default behaviour

```js
const { CRUD } = require("dambreaker-mongo");

class Api extends CRUD {
  constructor(mongo) {
    this.mongo = mongo;
  };
};
```

## Installation

```bash
$ npm install dambreaker-mongo
```

## Test

To run our tests, clone the dambreaker-mongo repo and install the dependencies.

```bash
$ git clone https://github.com/BenoitClaveau/dambreaker-mongo --depth 1
$ cd dambreaker-mongo
$ npm install
$ mongod --dbpath ./data/db
$ node.exe "../node_modules/mocha/bin/mocha" tests
```

[npm-image]: https://img.shields.io/npm/v/dambreaker-mongo.svg
[npm-url]: https://npmjs.org/package/dambreaker-mongo
[travis-image]: https://travis-ci.org/BenoitClaveau/dambreaker-mongo.svg?branch=master
[travis-url]: https://travis-ci.org/BenoitClaveau/dambreaker-mongo
[coveralls-image]: https://coveralls.io/repos/BenoitClaveau/dambreaker-mongo/badge.svg?branch=master&service=github
[coveralls-url]: https://coveralls.io/github/BenoitClaveau/dambreaker-mongo?branch=master
