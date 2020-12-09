import _ from 'lodash';
import getApp from '../server/index.js';
import encrypt from '../server/lib/secure.js';
import { getTestData, prepareData, getSessionCookie } from './helpers/index.js';

describe('CRUD users', () => {
  let app;
  let knex;
  let models;
  let cookie1;
  let cookie2;

  const testData = getTestData();

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await prepareData(app);
    cookie1 = await getSessionCookie(app, testData.users.existing1);
    cookie2 = await getSessionCookie(app, testData.users.existing2);
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Get users page', async () => {
    const res = await app.inject({
      method: 'GET',
      url: app.reverse('users#index'),
    });
    expect(res.statusCode).toBe(200);
  });

  it('New user', async () => {
    const res1 = await app.inject({
      method: 'GET',
      url: app.reverse('users#new'),
    });
    expect(res1.statusCode).toBe(200);
  });

  it('Create user', async () => {
    const params = testData.users.new;
    const res1 = await app.inject({
      method: 'POST',
      url: app.reverse('users#create'),
      payload: { object: { ...params } },
    });
    expect(res1.statusCode).toBe(302);

    const expected = {
      ..._.omit(params, 'password'),
      passwordDigest: encrypt(params.password),
    };
    const user = await models.user.query().findOne({ email: params.email });
    expect(user).toMatchObject(expected);

    const res2 = await app.inject({
      method: 'POST',
      url: app.reverse('users#create'),
      payload: { object: { firstName: params.firstName } },
    });
    expect(res2.statusCode).toBe(400);
  });

  it('Read user', async () => {
    const params = testData.users.existing1;
    const { id } = await models.user.query().findOne({ email: params.email });

    const res1 = await app.inject({
      method: 'GET',
      url: app.reverse('users#edit', { id }),
      cookies: cookie1,
    });
    expect(res1.statusCode).toBe(200);

    const res2 = await app.inject({
      method: 'GET',
      url: app.reverse('users#edit', { id: 'AnotherID' }),
      cookies: cookie1,
    });
    expect(res2.statusCode).toBe(302);
  });

  it('Update user', async () => {
    const { existing1, updated } = testData.users;
    const { id } = await models.user.query().findOne({ email: existing1.email });

    const res1 = await app.inject({
      method: 'PATCH',
      url: app.reverse('users#update', { id }),
      cookies: cookie1,
      payload: { object: { ...updated } },
    });
    expect(res1.statusCode).toBe(302);

    const expected = {
      ..._.omit(updated, 'password'),
      passwordDigest: encrypt(updated.password),
    };
    const user = await models.user.query().findById(id);
    expect(user).toMatchObject(expected);

    const res3 = await app.inject({
      method: 'PATCH',
      url: app.reverse('users#update', { id: 'AnotherID' }),
      cookies: cookie1,
      payload: { object: { ...updated } },
    });
    expect(res3.statusCode).toBe(302);
  });

  it('Delete user', async () => {
    const { email } = testData.users.existing2;
    const { id } = await models.user.query().findOne({ email });

    const res = await app.inject({
      method: 'DELETE',
      url: app.reverse('users#destroy', { id }),
      cookies: cookie2,
    });
    expect(res.statusCode).toBe(302);

    const result = await models.user.query().findById(id);
    expect(result).toBeUndefined();
  });
});
