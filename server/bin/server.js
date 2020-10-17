#! /usr/bin/env node

import getApp from '../index.js';

const port = process.env.PORT || 5000;
const address = '0.0.0.0';

const run = async () => {
  const app = await getApp();
  app.listen(port, address, () => {
    console.log(`Server is running on port: ${port}`);
  });
};

run();
