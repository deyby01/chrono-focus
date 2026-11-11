import { Sequelize } from 'sequelize';
import pg from 'pg';
import { env } from './env.js';

pg.types.setTypeParser(1082, (value) => value);
pg.types.setTypeParser(20, (value) => Number(value));

/**
 * Shared Sequelize ORM instance for PostgreSQL.
 * Uses `DATABASE_URL` when provided, otherwise discrete connection settings.
 * DATE columns are returned as raw `YYYY-MM-DD` strings and BIGINT as numbers.
 *
 * @type {import('sequelize').Sequelize}
 */
export const sequelize = env.databaseUrl
  ? new Sequelize(env.databaseUrl, {
      dialect: 'postgres',
      logging: false,
      define: {
        underscored: true,
        freezeTableName: true,
      },
      pool: {
        max: 20,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    })
  : new Sequelize(env.db.database, env.db.user, env.db.password, {
      host: env.db.host,
      port: env.db.port,
      dialect: 'postgres',
      logging: false,
      define: {
        underscored: true,
        freezeTableName: true,
      },
      pool: {
        max: 20,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });
