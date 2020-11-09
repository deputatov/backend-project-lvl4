// @ts-check
import {
  describe,
  beforeAll,
  it,
  expect,
  afterAll,
} from '@jest/globals';
import faker from 'faker';
import app from '../server/index.js';
// import encrypt from '../server/lib/secure.js';

describe('requests', () => {
  let server;

  beforeAll(async () => {
    server = await app();
  });

  it('GET 200', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/',
    });
    expect(res.statusCode).toBe(200);
  });

  it('GET 404', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/wrong-path',
    });
    expect(res.statusCode).toBe(404);
  });

  afterAll(async () => {
    await server.close();
  });
});

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

const status = {
  name: faker.lorem.word(),
};

const statusUpdateData = {
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
  statusId: 1,
  executorId: 1,
  labels: [1, 2],
};

const taskUpdateData = {
  name: faker.lorem.word(),
  description: faker.lorem.word(),
  creatorId: 1,
  statusId: 2,
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

  it('statuses#create', async () => {
    const status1 = await server.inject({
      method: 'POST',
      url: server.reverse('statuses#create'),
      headers: { cookie },
      payload: { object: { ...status } },
    });
    expect(status1.statusCode).toBe(302);

    const status2 = await server.inject({
      method: 'POST',
      url: server.reverse('statuses#create'),
      headers: { cookie },
      payload: { object: { ...statusUpdateData } },
    });
    expect(status2.statusCode).toBe(302);
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
  });

  it('tasks#show', async () => {
    const res = await server.inject({
      method: 'GET',
      url: server.reverse('tasks#show', { id: 1 }),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
  });

  it('tasks#edit', async () => {
    const res = await server.inject({
      method: 'GET',
      url: server.reverse('tasks#edit', { id: 1 }),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
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
  });
});
