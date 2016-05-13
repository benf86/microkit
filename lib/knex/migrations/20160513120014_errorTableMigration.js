'use strict';

const config = require('../knexConfig');

module.exports = (opts => {
  const microkitTableName = opts ? opts.tableName || 'microkit_logs' : 'microkit_logs';
  return {
    up: function (knex) {
      return knex.schema
      .createTable(microkitTableName, table => {
        table.increments('id').primary();
        table.datetime('created_at').default(knex.fn.now());
        table.string('module').notNull();
        table.string('type').default('info').notNull();
        table.text('message').notNull();
      });
    },

    down: function (knex) {
      return knex.schema
      .dropTable(microkitTableName);
    },

    microkitTableName
  };
})(config);
