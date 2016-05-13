'use strict';

module.exports = function (config) {
  const knexConfig = config || require('./knexConfig');
  const knex = require('knex')(knexConfig);

  return knex.migrate.latest()
  .then(() => {
    return {
      log (type, message) {
        if (arguments.length === 1) {
          message = type instanceof Error ? { stack: type.stack, message: type.toString() } : type;
          type = type.name || 'log';
        }
        if (typeof type !== 'string') {
          type = type.name || 'log';
        }
        if (message instanceof Error) {
          message = { stack: message.stack, message: message.toString() };
        }
        return knex(knexConfig.tableName)
        .insert({
          module: new Error().stack.split('\n')[2].split('/').pop().split(':')[0],
          type: type.toLowerCase(),
          message: typeof message === 'string' ? message : JSON.stringify(message)
        });
      },
      knex: knex
    };
  });
};
