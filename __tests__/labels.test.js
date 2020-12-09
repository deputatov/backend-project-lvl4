import getApp from '../server/index.js';
import { getTestData, prepareData, getSessionCookie } from './helpers/index.js';

describe('CRUD labels', () => {
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

  it('Get labels page', async () => {
    const res = await app.inject({
      method: 'GET',
      url: app.reverse('labels#index'),
      cookies: cookie,
    });
    expect(res.statusCode).toBe(200);
  });

  it('New label', async () => {
    const res = await app.inject({
      method: 'GET',
      url: app.reverse('labels#new'),
      cookies: cookie,
    });
    expect(res.statusCode).toBe(200);
  });

  it('Create label', async () => {
    const params = testData.labels.new;
    const res = await app.inject({
      method: 'POST',
      url: app.reverse('labels#create'),
      cookies: cookie,
      payload: { object: { ...params } },
    });
    expect(res.statusCode).toBe(302);

    const result = await models.label.query().findOne({ name: params.name });
    expect(result).toMatchObject(params);

    const res2 = await app.inject({
      method: 'POST',
      url: app.reverse('labels#create'),
      cookies: cookie,
      payload: { object: {} },
    });
    expect(res2.statusCode).toBe(400);

    const res3 = await app.inject({
      method: 'POST',
      url: app.reverse('labels#create'),
      cookies: cookie,
    });
    expect(res3.statusCode).toBe(500);
  });

  it('Read label', async () => {
    const params = testData.labels.existing;
    const { id } = await models.label.query().findOne({ name: params.name });

    const res1 = await app.inject({
      method: 'GET',
      url: app.reverse('labels#edit', { id }),
      cookies: cookie,
    });
    expect(res1.statusCode).toBe(200);

    const res2 = await app.inject({
      method: 'GET',
      url: app.reverse('labels#edit', { id: 'NotFound' }),
      cookies: cookie,
    });
    expect(res2.statusCode).toBe(404);
  });

  it('Update label', async () => {
    const { existing, updated } = testData.labels;
    const { id } = await models.label.query().findOne({ name: existing.name });

    const res1 = await app.inject({
      method: 'PATCH',
      url: app.reverse('labels#update', { id }),
      cookies: cookie,
      payload: { object: { ...updated } },
    });
    expect(res1.statusCode).toBe(302);

    const result = await models.label.query().findById(id);
    expect(result).toMatchObject(updated);

    const res2 = await app.inject({
      method: 'PATCH',
      url: app.reverse('labels#update', { id: 'NotFound' }),
      cookies: cookie,
      payload: { object: { ...updated } },
    });
    expect(res2.statusCode).toBe(404);

    const res3 = await app.inject({
      method: 'PATCH',
      url: app.reverse('labels#update', { id }),
      cookies: cookie,
    });
    expect(res3.statusCode).toBe(500);
  });

  it('Delete label', async () => {
    const params = testData.labels.existing;
    const { id } = await models.label.query().findOne({ name: params.name });

    const res1 = await app.inject({
      method: 'DELETE',
      url: app.reverse('labels#destroy', { id }),
      cookies: cookie,
    });
    expect(res1.statusCode).toBe(302);

    const result = await models.label.query().findById(id);
    expect(result).toBeUndefined();
  });
});
