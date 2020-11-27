import faker from 'faker';
import app from '../server/index.js';

const userData = {
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
};

const updatedUserData = {
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
};

const taskStatusData = {
  name: faker.lorem.word(),
};

const updatedTaskStatusData = {
  name: faker.lorem.word(),
};

const labelData = {
  name: faker.lorem.word(),
};

const updatedLabelData = {
  name: faker.lorem.word(),
};

const taskData = {
  name: faker.lorem.word(),
  description: faker.lorem.word(),
  creatorId: 1,
  taskStatusId: 1,
  executorId: 1,
  labels: [1, 2],
};

const updatedTaskData = {
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

  it('Sign up', async () => {
    const res1 = await server.inject({
      method: 'POST',
      url: server.reverse('users#create'),
      payload: { object: { ...userData } },
    });
    expect(res1.statusCode).toBe(302);

    const res2 = await server.inject({
      method: 'POST',
      url: server.reverse('users#create'),
      payload: { object: { ...updatedUserData } },
    });
    expect(res2.statusCode).toBe(302);
  });

  it('Sign in', async () => {
    const auth = await server.inject({
      method: 'POST',
      url: server.reverse('sessions#create'),
      payload: { object: { email: userData.email, password: userData.password } },
    });
    const { headers } = auth;
    cookie = headers['set-cookie'];
    expect(auth.statusCode).toBe(302);
  });

  it('Create task statuses', async () => {
    const res1 = await server.inject({
      method: 'POST',
      url: server.reverse('taskStatuses#create'),
      headers: { cookie },
      payload: { object: { ...taskStatusData } },
    });
    expect(res1.statusCode).toBe(302);

    const res2 = await server.inject({
      method: 'POST',
      url: server.reverse('taskStatuses#create'),
      headers: { cookie },
      payload: { object: { ...updatedTaskStatusData } },
    });
    expect(res2.statusCode).toBe(302);
  });

  it('Create labels', async () => {
    const res1 = await server.inject({
      method: 'POST',
      url: server.reverse('labels#create'),
      headers: { cookie },
      payload: { object: { ...labelData } },
    });
    expect(res1.statusCode).toBe(302);

    const res2 = await server.inject({
      method: 'POST',
      url: server.reverse('labels#create'),
      headers: { cookie },
      payload: { object: { ...updatedLabelData } },
    });
    expect(res2.statusCode).toBe(302);
  });

  it('Get tasks', async () => {
    const res = await server.inject({
      method: 'GET',
      url: server.reverse('tasks#index'),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
  });

  it('Create task', async () => {
    const res1 = await server.inject({
      method: 'GET',
      url: server.reverse('tasks#new'),
      headers: { cookie },
    });
    expect(res1.statusCode).toBe(200);

    const res2 = await server.inject({
      method: 'POST',
      url: server.reverse('tasks#create'),
      headers: { cookie },
      payload: { object: { ...taskData } },
    });
    expect(res2.statusCode).toBe(302);

    const task = await server.objection.models.task
      .query()
      .first()
      .withGraphFetched('labels')
      .modifyGraph('labels', (builder) => {
        builder.select('labels.id');
      });
    const result = { ...task, labels: task.labels.map(({ id }) => id) };
    expect(result).toMatchObject(taskData);

    const res3 = await server.inject({
      method: 'POST',
      url: server.reverse('tasks#create'),
      headers: { cookie },
      payload: { object: { ...taskData, name: '' } },
    });
    expect(res3.statusCode).toBe(400);

    const res4 = await server.inject({
      method: 'POST',
      url: server.reverse('tasks#create'),
      headers: { cookie },
    });
    expect(res4.statusCode).toBe(500);
  });

  it('Read task', async () => {
    const { id } = await server.objection.models.task.query().first();

    const res1 = await server.inject({
      method: 'GET',
      url: server.reverse('tasks#show', { id }),
      headers: { cookie },
    });
    expect(res1.statusCode).toBe(200);

    const res2 = await server.inject({
      method: 'GET',
      url: server.reverse('tasks#show', { id: 'NotFound' }),
      headers: { cookie },
    });
    expect(res2.statusCode).toBe(404);

    const res3 = await server.inject({
      method: 'GET',
      url: server.reverse('tasks#edit', { id }),
      headers: { cookie },
    });
    expect(res3.statusCode).toBe(200);

    const res4 = await server.inject({
      method: 'GET',
      url: server.reverse('tasks#edit', { id: 'NotFound' }),
      headers: { cookie },
    });
    expect(res4.statusCode).toBe(404);
  });

  it('Update task', async () => {
    const { id } = await server.objection.models.task.query().first();

    const res1 = await server.inject({
      method: 'PATCH',
      url: server.reverse('tasks#update', { id }),
      headers: { cookie },
      payload: { object: { ...updatedTaskData } },
    });
    expect(res1.statusCode).toBe(302);

    const task = await server.objection.models.task
      .query()
      .first()
      .withGraphFetched('labels')
      .modifyGraph('labels', (builder) => {
        builder.select('labels.id');
      });
    const result = { ...task, labels: task.labels.map((item) => item.id) };
    expect(result).toMatchObject(updatedTaskData);

    const res2 = await server.inject({
      method: 'PATCH',
      url: server.reverse('tasks#update', { id: 'NotFound' }),
      headers: { cookie },
      payload: { object: { ...updatedTaskData } },
    });
    expect(res2.statusCode).toBe(404);

    const res3 = await server.inject({
      method: 'PATCH',
      url: server.reverse('tasks#update', { id }),
      headers: { cookie },
    });
    expect(res3.statusCode).toBe(500);
  });

  it('Delete task', async () => {
    const { id } = await server.objection.models.task.query().first();

    const res1 = await server.inject({
      method: 'DELETE',
      url: server.reverse('tasks#destroy', { id }),
      headers: { cookie },
    });
    expect(res1.statusCode).toBe(302);

    const result = await server.objection.models.task.query();
    expect(result).toEqual([]);

    const res2 = await server.inject({
      method: 'DELETE',
      url: server.reverse('tasks#destroy', { id }),
      headers: { cookie },
    });
    expect(res2.statusCode).toEqual(404);
  });
});
