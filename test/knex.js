'use strict';

const assert = require('chai').assert;

const testTable = require('../lib/knex/migrations/20160513120014_errorTableMigration').microkitTableName;
const knexConfig = {
  tableName: testTable,
  client: 'sqlite3',
  automigrate: true,
  debug: false,
  migrations: {
    tableName: 'migrations',
    directory: './lib/knex/migrations'
  },
  connection: {
    filename: ':memory:'
  },
  useNullAsDefault: true
};
var knex;
var testedModule;

describe('Knex', () => {
  before(function (next) {
    require('../lib/knex')(knexConfig)
    .then(r => {
      knex = r.knex;
      testedModule = r;
      next();
    });
  });

  it('should insert and retrieve log with proper params - string + object', function (next) {
    testedModule.log('error', {
      error: 'Random Error Test',
      data: {
        array: [1, 2, 3],
        string: 'random string'
      }
    })
    .then(() => knex(testTable).where({id: 1}))
    .then(r => r.map(e => {
      e.message = JSON.parse(e.message);
      return e;
    }))
    .then(r => r.map(e => {
      assert.deepEqual(e, {
        id: 1,
        created_at: e.created_at,
        module: 'knex.js',
        type: 'error',
        message: {
          error: 'Random Error Test',
          data: {
            array: [1, 2, 3],
            string: 'random string'
          }
        }
      });
      return next();
    }));
  });

  it('should insert and retrieve log with single param - object', function (next) {
    testedModule.log(new Error('Random error'))
    .then(() => knex(testTable).where({id: 2}))
    .then(r => r.map(e => {
      e.message = JSON.parse(e.message);
      return e;
    }))
    .then(r => r.map(e => {
      assert.deepEqual(e, {
        id: 2,
        created_at: e.created_at,
        module: 'knex.js',
        type: 'error',
        message: e.message
      });
      assert.isOk(e.message.message);
      assert.isOk(e.message.stack);
      return next();
    }));
  });

  it('should insert and retrieve log with two params - Error + {}', function (next) {
    testedModule.log(new Error('Random error'), {'trololo': 'trololo', 'hopsasa': 'hopsasa'})
    .then(() => knex(testTable).where({id: 3}))
    .then(r => r.map(e => {
      e.message = JSON.parse(e.message);
      return e;
    }))
    .then(r => r.map(e => {
      assert.deepEqual(e, {
        id: 3,
        created_at: e.created_at,
        module: 'knex.js',
        type: 'error',
        message: e.message
      });
      return next();
    }));
  });

  it('should insert and retrieve log with two params - string + Error', function (next) {
    testedModule.log('random', new Error('Random error'))
    .then(() => knex(testTable).where({id: 4}))
    .then(r => r.map(e => {
      e.message = JSON.parse(e.message);
      return e;
    }))
    .then(r => r.map(e => {
      assert.deepEqual(e, {
        id: 4,
        created_at: e.created_at,
        module: 'knex.js',
        type: 'random',
        message: e.message
      });
      assert.isOk(e.message.message);
      assert.isOk(e.message.stack);
      return next();
    }));
  });
});
