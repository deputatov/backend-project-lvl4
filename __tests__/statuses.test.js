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

const status = {
  name: faker.lorem.word(),
};

const statusUpdateData = {
  name: faker.lorem.word(),
};

describe('CRUD statuses', () => {
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

  it('statuses#index', async () => {
    const res = await server.inject({
      method: 'GET',
      url: server.reverse('statuses#index'),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
  });

  it('statuses#new', async () => {
    const res = await server.inject({
      method: 'GET',
      url: server.reverse('statuses#new'),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
  });

  it('statuses#create', async () => {
    const res = await server.inject({
      method: 'POST',
      url: server.reverse('statuses#create'),
      headers: { cookie },
      payload: { object: { ...status } },
    });
    expect(res.statusCode).toBe(302);

    const createdStatus = await server.objection.models.taskStatus
      .query()
      .findOne({ name: status.name });
    expect(createdStatus).toMatchObject(status);

    const requiredFields = await server.inject({
      method: 'POST',
      url: server.reverse('statuses#create'),
      headers: { cookie },
      payload: { object: { } },
    });
    expect(requiredFields.statusCode).toBe(400);
  });

  it('statuses#edit', async () => {
    const res = await server.inject({
      method: 'GET',
      url: server.reverse('statuses#edit', { id: 1 }),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
  });

  it('statuses#update', async () => {
    const res = await server.inject({
      method: 'PATCH',
      url: server.reverse('statuses#update', { id: 1 }),
      headers: { cookie },
      payload: { object: { ...statusUpdateData } },
    });
    expect(res.statusCode).toBe(302);

    const updatedStatus = await server.objection.models.taskStatus
      .query()
      .findOne({ name: statusUpdateData.name });
    expect(updatedStatus).toMatchObject(statusUpdateData);
  });

  it('statuses#destroy', async () => {
    const res = await server.inject({
      method: 'DELETE',
      url: server.reverse('statuses#update', { id: 1 }),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(302);

    const deletedStatuses = await server.objection.models.taskStatus.query();
    expect(deletedStatuses).toEqual([]);
  });
});
