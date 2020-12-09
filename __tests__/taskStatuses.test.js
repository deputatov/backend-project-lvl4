import getApp from '../server/index.js';
import { getTestData, prepareData, getSessionCookie } from './helpers/index.js';

describe('CRUD task statuses', () => {
  let app;
  let knex;
  let models;
  let cookie;

  const testData = getTestData();

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await prepareData(app);
    cookie = await getSessionCookie(app, testData.users.existing1);
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Get task statuses', async () => {
    const res = await app.inject({
      method: 'GET',
      url: app.reverse('taskStatuses#index'),
      cookies: cookie,
    });
    expect(res.statusCode).toBe(200);
  });

  it('New task status', async () => {
    const res = await app.inject({
      method: 'GET',
      url: app.reverse('taskStatuses#new'),
      cookies: cookie,
    });
    expect(res.statusCode).toBe(200);
  });

  it('Create task status', async () => {
    const params = testData.taskStatuses.new;
    const res1 = await app.inject({
      method: 'POST',
      url: app.reverse('taskStatuses#create'),
      cookies: cookie,
      payload: { object: { ...params } },
    });
    expect(res1.statusCode).toBe(302);

    const result = await models.taskStatus.query().findOne({ name: params.name });
    expect(result).toMatchObject(params);

    const res2 = await app.inject({
      method: 'POST',
      url: app.reverse('taskStatuses#create'),
      cookies: cookie,
      payload: { object: {} },
    });
    expect(res2.statusCode).toBe(400);

    const res3 = await app.inject({
      method: 'POST',
      url: app.reverse('taskStatuses#create'),
      cookies: cookie,
    });
    expect(res3.statusCode).toBe(500);
  });

  it('Read task status', async () => {
    const params = testData.taskStatuses.existing;
    console.log(params);
    const { id } = await models.taskStatus.query().findOne({ name: params.name });

    const res1 = await app.inject({
      method: 'GET',
      url: app.reverse('taskStatuses#edit', { id }),
      cookies: cookie,
    });
    expect(res1.statusCode).toBe(200);

    const res2 = await app.inject({
      method: 'GET',
      url: app.reverse('taskStatuses#edit', { id: 'NotFound' }),
      cookies: cookie,
    });
    expect(res2.statusCode).toBe(404);
  });

  it('Update task status', async () => {
    const { existing, updated } = testData.taskStatuses;
    const { id } = await models.taskStatus.query().findOne({ name: existing.name });

    const res1 = await app.inject({
      method: 'PATCH',
      url: app.reverse('taskStatuses#update', { id }),
      cookies: cookie,
      payload: { object: { ...updated } },
    });
    expect(res1.statusCode).toBe(302);

    const result = await models.taskStatus.query().findById(id);
    expect(result).toMatchObject(updated);

    const res2 = await app.inject({
      method: 'PATCH',
      url: app.reverse('taskStatuses#update', { id: 'NotFound' }),
      cookies: cookie,
      payload: { object: { ...updated } },
    });
    expect(res2.statusCode).toBe(404);

    const res3 = await app.inject({
      method: 'PATCH',
      url: app.reverse('taskStatuses#update', { id }),
      cookies: cookie,
    });
    expect(res3.statusCode).toBe(500);
  });

  it('Delete task status', async () => {
    const params = testData.taskStatuses.existing;
    const { id } = await models.taskStatus.query().findOne({ name: params.name });

    const res1 = await app.inject({
      method: 'DELETE',
      url: app.reverse('taskStatuses#destroy', { id }),
      cookies: cookie,
    });
    expect(res1.statusCode).toBe(302);

    const res2 = await app.inject({
      method: 'DELETE',
      url: app.reverse('taskStatuses#destroy', { id }),
      cookies: cookie,
    });
    expect(res2.statusCode).toBe(404);

    const result = await models.taskStatus.query().findById(id);
    expect(result).toBeUndefined();
  });
});
