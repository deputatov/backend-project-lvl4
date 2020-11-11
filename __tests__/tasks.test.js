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

const userUpdateData = {
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

const label = {
  name: faker.lorem.word(),
};

const labelUpdateData = {
  name: faker.lorem.word(),
};

const task = {
  name: faker.lorem.word(),
  description: faker.lorem.word(),
  creatorId: 1,
  taskStatusId: 1,
  executorId: 1,
  labels: [1, 2],
};

const taskUpdateData = {
  name: faker.lorem.word(),
  description: faker.lorem.word(),
  creatorId: 1,
  taskStatusId: 2,
  executorId: 2,
  labels: [1],
};

describe('CRUD tasks', () => {
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
    const user1 = await server.inject({
      method: 'POST',
      url: server.reverse('users#create'),
      payload: { object: { ...user } },
    });
    expect(user1.statusCode).toBe(302);

    const user2 = await server.inject({
      method: 'POST',
      url: server.reverse('users#create'),
      payload: { object: { ...userUpdateData } },
    });
    expect(user2.statusCode).toBe(302);
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

  it('taskStatuses#create', async () => {
    const taskStatus1 = await server.inject({
      method: 'POST',
      url: server.reverse('taskStatuses#create'),
      headers: { cookie },
      payload: { object: { ...taskStatus } },
    });
    expect(taskStatus1.statusCode).toBe(302);

    const taskStatus2 = await server.inject({
      method: 'POST',
      url: server.reverse('taskStatuses#create'),
      headers: { cookie },
      payload: { object: { ...taskStatusUpdateData } },
    });
    expect(taskStatus2.statusCode).toBe(302);
  });

  it('labels#create', async () => {
    const label1 = await server.inject({
      method: 'POST',
      url: server.reverse('labels#create'),
      headers: { cookie },
      payload: { object: { ...label } },
    });
    expect(label1.statusCode).toBe(302);

    const label2 = await server.inject({
      method: 'POST',
      url: server.reverse('labels#create'),
      headers: { cookie },
      payload: { object: { ...labelUpdateData } },
    });
    expect(label2.statusCode).toBe(302);
  });

  it('tasks#index', async () => {
    const res = await server.inject({
      method: 'GET',
      url: server.reverse('tasks#index'),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
  });

  it('tasks#new', async () => {
    const res = await server.inject({
      method: 'GET',
      url: server.reverse('tasks#new'),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
  });

  it('tasks#create', async () => {
    const res = await server.inject({
      method: 'POST',
      url: server.reverse('tasks#create'),
      headers: { cookie },
      payload: { object: { ...task } },
    });
    expect(res.statusCode).toBe(302);

    const createdTask = await server.objection.models.task
      .query()
      .first()
      .withGraphFetched('labels')
      .modifyGraph('labels', (builder) => {
        builder.select('labels.id');
      });
    expect(
      {
        ...createdTask,
        labels: createdTask.labels.map(({ id }) => id),
      },
    ).toMatchObject(task);

    const requiredFields = await server.inject({
      method: 'POST',
      url: server.reverse('tasks#create'),
      headers: { cookie },
      payload: { object: { ...task, name: '' } },
    });
    expect(requiredFields.statusCode).toBe(400);

    const serverError = await server.inject({
      method: 'POST',
      url: server.reverse('tasks#create'),
      headers: { cookie },
    });
    expect(serverError.statusCode).toBe(500);
  });

  it('tasks#show', async () => {
    const res = await server.inject({
      method: 'GET',
      url: server.reverse('tasks#show', { id: 1 }),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);

    const notFound = await server.inject({
      method: 'GET',
      url: server.reverse('tasks#show', { id: 2 }),
      headers: { cookie },
    });
    expect(notFound.statusCode).toBe(404);
  });

  it('tasks#edit', async () => {
    const res = await server.inject({
      method: 'GET',
      url: server.reverse('tasks#edit', { id: 1 }),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);

    const notFound = await server.inject({
      method: 'GET',
      url: server.reverse('tasks#edit', { id: 2 }),
      headers: { cookie },
    });
    expect(notFound.statusCode).toBe(404);
  });

  it('tasks#update', async () => {
    const res = await server.inject({
      method: 'PATCH',
      url: server.reverse('tasks#update', { id: 1 }),
      headers: { cookie },
      payload: { object: { ...taskUpdateData } },
    });
    expect(res.statusCode).toBe(302);

    const updatedTask = await server.objection.models.task
      .query()
      .first()
      .withGraphFetched('labels')
      .modifyGraph('labels', (builder) => {
        builder.select('labels.id');
      });
    expect(
      {
        ...updatedTask,
        labels: updatedTask.labels.map(({ id }) => id),
      },
    ).toMatchObject(taskUpdateData);

    const notFound = await server.inject({
      method: 'PATCH',
      url: server.reverse('tasks#update', { id: 2 }),
      headers: { cookie },
      payload: { object: { ...taskUpdateData } },
    });
    expect(notFound.statusCode).toBe(404);

    const serverError = await server.inject({
      method: 'PATCH',
      url: server.reverse('tasks#update', { id: 1 }),
      headers: { cookie },
    });
    expect(serverError.statusCode).toBe(500);
  });

  it('tasks#destroy', async () => {
    const res = await server.inject({
      method: 'DELETE',
      url: server.reverse('tasks#destroy', { id: 1 }),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(302);

    const deletedTask = await server.objection.models.task.query();
    expect(deletedTask).toEqual([]);

    const notFound = await server.inject({
      method: 'DELETE',
      url: server.reverse('tasks#destroy', { id: 1 }),
      headers: { cookie },
    });
    expect(notFound.statusCode).toEqual(404);
  });
});
