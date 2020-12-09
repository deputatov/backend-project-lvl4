import getApp from '../server/index.js';
import { getTestData, prepareData, getSessionCookie } from './helpers/index.js';

describe('CRUD tasks', () => {
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

  it('Get tasks', async () => {
    const res = await app.inject({
      method: 'GET',
      url: app.reverse('tasks#index'),
      cookies: cookie,
    });
    expect(res.statusCode).toBe(200);
  });

  it('New task', async () => {
    const res = await app.inject({
      method: 'GET',
      url: app.reverse('tasks#new'),
      cookies: cookie,
    });
    expect(res.statusCode).toBe(200);
  });

  it('Create task', async () => {
    const params = testData.tasks.new;
    const res1 = await app.inject({
      method: 'POST',
      url: app.reverse('tasks#create'),
      cookies: cookie,
      payload: { object: { ...params } },
    });
    expect(res1.statusCode).toBe(302);

    const task = await models.task
      .query()
      .findOne({ 'tasks.name': params.name })
      .withGraphJoined('labels');
    const result = { ...task, labels: task.labels.map(({ id }) => id) };
    expect(result).toMatchObject(params);

    const res2 = await app.inject({
      method: 'POST',
      url: app.reverse('tasks#create'),
      cookies: cookie,
      payload: { object: { ...params, name: '' } },
    });
    expect(res2.statusCode).toBe(400);

    const res4 = await app.inject({
      method: 'POST',
      url: app.reverse('tasks#create'),
      cookies: cookie,
    });
    expect(res4.statusCode).toBe(500);
  });

  it('Read task', async () => {
    const { id } = await models.task.query().first();

    const res1 = await app.inject({
      method: 'GET',
      url: app.reverse('tasks#show', { id }),
      cookies: cookie,
    });
    expect(res1.statusCode).toBe(200);

    const res2 = await app.inject({
      method: 'GET',
      url: app.reverse('tasks#show', { id: 'NotFound' }),
      cookies: cookie,
    });
    expect(res2.statusCode).toBe(404);

    const res3 = await app.inject({
      method: 'GET',
      url: app.reverse('tasks#edit', { id }),
      cookies: cookie,
    });
    expect(res3.statusCode).toBe(200);

    const res4 = await app.inject({
      method: 'GET',
      url: app.reverse('tasks#edit', { id: 'NotFound' }),
      cookies: cookie,
    });
    expect(res4.statusCode).toBe(404);
  });

  it('Update task', async () => {
    const params = testData.tasks.updated;
    const { id } = await models.task.query().first();

    const res1 = await app.inject({
      method: 'PATCH',
      url: app.reverse('tasks#update', { id }),
      cookies: cookie,
      payload: { object: { ...params } },
    });
    expect(res1.statusCode).toBe(302);

    const task = await models.task
      .query()
      .first()
      .withGraphJoined('labels');
    const result = { ...task, labels: task.labels.map((item) => item.id) };
    expect(result).toMatchObject(params);

    const res2 = await app.inject({
      method: 'PATCH',
      url: app.reverse('tasks#update', { id: 'NotFound' }),
      cookies: cookie,
      payload: { object: { ...params } },
    });
    expect(res2.statusCode).toBe(404);

    const res3 = await app.inject({
      method: 'PATCH',
      url: app.reverse('tasks#update', { id }),
      cookies: cookie,
    });
    expect(res3.statusCode).toBe(500);
  });

  it('Delete task', async () => {
    const { email } = testData.users.existing1;
    const { id: creatorId } = await models.user.query().findOne({ email });
    const { id } = await models.task.query().findOne({ creatorId });

    const res1 = await app.inject({
      method: 'DELETE',
      url: app.reverse('tasks#destroy', { id }),
      cookies: cookie,
    });
    expect(res1.statusCode).toBe(302);

    const result = await models.task.query().findById(id);
    expect(result).toBeUndefined();
  });
});
