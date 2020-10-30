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
import encrypt from '../server/lib/secure.js';

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

describe('CRUD users', () => {
  let server;
  let cookie;

  beforeAll(async () => {
    server = await app();
    await server.objection.knex.migrate.latest();
  });

  afterAll(async () => {
    await server.close();
  });

  it('users#index', async () => {
    const res = await server.inject({
      method: 'GET',
      url: server.reverse('users#index'),
    });
    expect(res.statusCode).toBe(200);
  });

  it('users#new', async () => {
    const res = await server.inject({
      method: 'GET',
      url: server.reverse('users#new'),
    });
    expect(res.statusCode).toBe(200);
  });

  it('users#create', async () => {
    const res = await server.inject({
      method: 'POST',
      url: server.reverse('users#create'),
      payload: { object: { ...user } },
    });
    expect(res.statusCode).toBe(302);

    const createdUser = await server.objection.models.user
      .query()
      .findOne({ email: user.email });
    expect(createdUser).toMatchObject({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      passwordDigest: encrypt(user.password),
    });

    const requiredFields = await server.inject({
      method: 'POST',
      url: server.reverse('users#create'),
      payload: { object: { firstName: user.firstName } },
    });
    expect(requiredFields.statusCode).toBe(400);
  });

  it('session#create', async () => {
    const auth = await server.inject({
      method: 'POST',
      url: server.reverse('session#create'),
      payload: { object: { email: user.email, password: user.password } },
    });
    const { headers } = auth;
    cookie = headers['set-cookie'];
    expect(auth.statusCode).toBe(302);
  });

  it('users#edit', async () => {
    const res = await server.inject({
      method: 'GET',
      url: server.reverse('users#edit', { id: 1 }),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
  });

  it('users#update', async () => {
    const res = await server.inject({
      method: 'PATCH',
      url: server.reverse('users#update', { id: 1 }),
      headers: { cookie },
      payload: { object: { ...userUpdateData } },
    });
    expect(res.statusCode).toBe(302);

    const updatedUser = await server.objection.models.user
      .query()
      .findOne({ email: userUpdateData.email });
    expect(updatedUser).toMatchObject({
      firstName: userUpdateData.firstName,
      lastName: userUpdateData.lastName,
      email: userUpdateData.email,
      passwordDigest: encrypt(userUpdateData.password),
    });

    const requiredFields = await server.inject({
      method: 'PATCH',
      url: server.reverse('users#update', { id: 1 }),
      payload: { object: { firstName: '' } },
    });
    expect(requiredFields.statusCode).toBe(302);
  });

  it('users#destroy', async () => {
    const res = await server.inject({
      method: 'DELETE',
      url: server.reverse('users#destroy', { id: 1 }),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(302);

    const deletedUsers = await server.objection.models.user.query();
    expect(deletedUsers).toEqual([]);
  });
});

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

  it('session#create', async () => {
    const auth = await server.inject({
      method: 'POST',
      url: server.reverse('session#create'),
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

  it('session#create', async () => {
    const auth = await server.inject({
      method: 'POST',
      url: server.reverse('session#create'),
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

    const createdStatus = await server.objection.models.label
      .query()
      .findOne({ name: label.name });
    expect(createdStatus).toMatchObject(label);

    const requiredFields = await server.inject({
      method: 'POST',
      url: server.reverse('labels#create'),
      headers: { cookie },
      payload: { object: { } },
    });
    expect(requiredFields.statusCode).toBe(400);
  });

  it('labels#edit', async () => {
    const res = await server.inject({
      method: 'GET',
      url: server.reverse('labels#edit', { id: 1 }),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
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
  });

  it('labels#destroy', async () => {
    const res = await server.inject({
      method: 'DELETE',
      url: server.reverse('labels#update', { id: 1 }),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(302);

    const deletedLabels = await server.objection.models.label.query();
    expect(deletedLabels).toEqual([]);
  });
});

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

  it('session#create', async () => {
    const auth = await server.inject({
      method: 'POST',
      url: server.reverse('session#create'),
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
