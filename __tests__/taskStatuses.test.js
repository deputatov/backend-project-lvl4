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

const taskStatus = {
  name: faker.lorem.word(),
};

const taskStatusUpdateData = {
  name: faker.lorem.word(),
};

describe('CRUD task statuses', () => {
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

  it('taskStatuses#index', async () => {
    const res = await server.inject({
      method: 'GET',
      url: server.reverse('taskStatuses#index'),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
  });

  it('taskStatuses#new', async () => {
    const res = await server.inject({
      method: 'GET',
      url: server.reverse('taskStatuses#new'),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
  });

  it('taskStatuses#create', async () => {
    const res = await server.inject({
      method: 'POST',
      url: server.reverse('taskStatuses#create'),
      headers: { cookie },
      payload: { object: { ...taskStatus } },
    });
    expect(res.statusCode).toBe(302);

    const createdTaskStatus = await server.objection.models.taskStatus
      .query()
      .findOne({ name: taskStatus.name });
    expect(createdTaskStatus).toMatchObject(taskStatus);

    const requiredFields = await server.inject({
      method: 'POST',
      url: server.reverse('taskStatuses#create'),
      headers: { cookie },
      payload: { object: { } },
    });
    expect(requiredFields.statusCode).toBe(400);
  });

  it('taskStatuses#edit', async () => {
    const res = await server.inject({
      method: 'GET',
      url: server.reverse('taskStatuses#edit', { id: 1 }),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
  });

  it('taskStatuses#update', async () => {
    const res = await server.inject({
      method: 'PATCH',
      url: server.reverse('taskStatuses#update', { id: 1 }),
      headers: { cookie },
      payload: { object: { ...taskStatusUpdateData } },
    });
    expect(res.statusCode).toBe(302);

    const updatedTaskStatus = await server.objection.models.taskStatus
      .query()
      .findOne({ name: taskStatusUpdateData.name });
    expect(updatedTaskStatus).toMatchObject(taskStatusUpdateData);
  });

  it('taskStatuses#destroy', async () => {
    const res = await server.inject({
      method: 'DELETE',
      url: server.reverse('taskStatuses#update', { id: 1 }),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(302);

    const deletedTaskStatuses = await server.objection.models.taskStatus.query();
    expect(deletedTaskStatuses).toEqual([]);
  });
});
