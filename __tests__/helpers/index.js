import fs from 'fs';
import path from 'path';

const getFixturePath = (filename) => path.join(__dirname, '..', '..', '__fixtures__', filename);
const readFixture = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8').trim();
const getFixtureData = (filename) => JSON.parse(readFixture(filename));

export const getTestData = () => getFixtureData('testData.json');

export const prepareData = async (app) => {
  const { knex } = app.objection;
  await knex('users').insert(getFixtureData('users.json'));
  await knex('labels').insert(getFixtureData('labels.json'));
  await knex('taskStatuses').insert(getFixtureData('taskStatuses.json'));
  await knex('tasks').insert(getFixtureData('tasks.json'));
};

export const getSessionCookie = async (app, data) => {
  const responseSignIn = await app.inject({
    method: 'POST',
    url: app.reverse('sessions#create'),
    payload: {
      object: data,
    },
  });
  const [sessionCookie] = responseSignIn.cookies;
  const { name, value } = sessionCookie;
  const cookie = { [name]: value };
  return cookie;
};
