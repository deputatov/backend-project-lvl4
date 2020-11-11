import {
  describe,
  beforeAll,
  it,
  expect,
  afterAll,
} from '@jest/globals';
import faker from 'faker';
import app from '../server/index.js';

const user = {
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
};

const label = {
  name: faker.lorem.word(),
};

const labelUpdateData = {
  name: faker.lorem.word(),
};

describe('CRUD labels', () => {
  let server;
  let cookie;

  beforeAll(async () => {
    server = await app();
    await server.objection.knex.migrate.latest();
  });

  afterAll(async () => {
    await server.close();
  });

  it('users#create', async () => {
    const res = await server.inject({
      method: 'POST',
      url: server.reverse('users#create'),
      payload: { object: { ...user } },
    });
    expect(res.statusCode).toBe(302);
  });

  it('sessions#create', async () => {
    const auth = await server.inject({
      method: 'POST',
      url: server.reverse('sessions#create'),
      payload: { object: { email: user.email, password: user.password } },
    });
    const { headers } = auth;
    cookie = headers['set-cookie'];
    expect(auth.statusCode).toBe(302);
  });

  it('labels#index', async () => {
    const res = await server.inject({
      method: 'GET',
      url: server.reverse('labels#index'),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
  });

  it('labels#new', async () => {
    const res = await server.inject({
      method: 'GET',
      url: server.reverse('labels#new'),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
  });

  it('labels#create', async () => {
    const res = await server.inject({
      method: 'POST',
      url: server.reverse('labels#create'),
      headers: { cookie },
      payload: { object: { ...label } },
    });
    expect(res.statusCode).toBe(302);

    const createdLabel = await server.objection.models.label
      .query()
      .findOne({ name: label.name });
    expect(createdLabel).toMatchObject(label);

    const requiredFields = await server.inject({
      method: 'POST',
      url: server.reverse('labels#create'),
      headers: { cookie },
      payload: { object: { } },
    });
    expect(requiredFields.statusCode).toBe(400);

    const serverError = await server.inject({
      method: 'POST',
      url: server.reverse('labels#create'),
      headers: { cookie },
    });
    expect(serverError.statusCode).toBe(500);
  });

  it('labels#edit', async () => {
    const res = await server.inject({
      method: 'GET',
      url: server.reverse('labels#edit', { id: 1 }),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);

    const notFound = await server.inject({
      method: 'GET',
      url: server.reverse('labels#edit', { id: 2 }),
      headers: { cookie },
    });
    expect(notFound.statusCode).toBe(404);
  });

  it('labels#update', async () => {
    const res = await server.inject({
      method: 'PATCH',
      url: server.reverse('labels#update', { id: 1 }),
      headers: { cookie },
      payload: { object: { ...labelUpdateData } },
    });
    expect(res.statusCode).toBe(302);

    const updatedLabel = await server.objection.models.label
      .query()
      .findOne({ name: labelUpdateData.name });
    expect(updatedLabel).toMatchObject(labelUpdateData);

    const serverError = await server.inject({
      method: 'PATCH',
      url: server.reverse('labels#update', { id: 1 }),
      headers: { cookie },
    });
    expect(serverError.statusCode).toBe(500);
  });

  it('labels#destroy', async () => {
    const res = await server.inject({
      method: 'DELETE',
      url: server.reverse('labels#destroy', { id: 1 }),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(302);

    const notFound = await server.inject({
      method: 'DELETE',
      url: server.reverse('labels#destroy', { id: 2 }),
      headers: { cookie },
    });
    expect(notFound.statusCode).toBe(404);

    const deletedLabels = await server.objection.models.label.query();
    expect(deletedLabels).toEqual([]);
  });
});
