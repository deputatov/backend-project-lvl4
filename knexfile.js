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
  //   client: 'sqlite3',
  //   connection: {
  //     filename: './database.sqlite',
  //   },
  //   migrations,
  // },
  // production: {
  //   client: 'pg',
  //   connection: {
  //     connectionString: process.env.DATABASE_URL,
  //     ssl: {
  //       rejectUnauthorized: false,
  //     },
  //     sslmode: 'require',
  //   },
  //   migrations,
  // },
  production: {
    client: 'pg',
    connection: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      sslmode: 'require',
      ssl: {
        rejectUnauthorized: false,
      },
    },
    migrations,
  },
};
