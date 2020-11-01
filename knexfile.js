// @ts-check

const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const migrations = {
  directory: path.resolve('server', 'migrations'),
};

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './database.sqlite',
    },
    migrations,
  },
  test: {
    client: 'sqlite3',
    connection: ':memory:',
    migrations,
  },
  // production: {
  //   client: 'pg',
  //   connection: {
  //     connectionString: process.env.DATABASE_URL,
  //     ssl: {
  //       rejectUnauthorized: false,
  //     },
  //   },
  //   migrations,
  // },
  production: {
    client: 'pg',
    connection: {
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      password: process.env.DB_PASS,
      user: process.env.DB_USER,
      ssl: {
        rejectUnauthorized: false,
      },
    },
    migrations,
  },
};
