import faker from 'faker';
import app from '../server/index.js';

const userData = {
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

  it('Sign up', async () => {
    const res = await server.inject({
      method: 'POST',
      url: server.reverse('users#create'),
      payload: { object: { ...userData } },
    });
    expect(res.statusCode).toBe(302);
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

  it('Get task statuses', async () => {
    const res = await server.inject({
      method: 'GET',
      url: server.reverse('taskStatuses#index'),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
  });

  it('Create task status', async () => {
    const res1 = await server.inject({
      method: 'GET',
      url: server.reverse('taskStatuses#new'),
      headers: { cookie },
    });
    expect(res1.statusCode).toBe(200);

    const res2 = await server.inject({
      method: 'POST',
      url: server.reverse('taskStatuses#create'),
      headers: { cookie },
      payload: { object: { ...taskStatusData } },
    });
    expect(res2.statusCode).toBe(302);

    const result = await server.objection.models.taskStatus.query().first();
    expect(result).toMatchObject(taskStatusData);

    const res3 = await server.inject({
      method: 'POST',
      url: server.reverse('taskStatuses#create'),
      headers: { cookie },
      payload: { object: {} },
    });
    expect(res3.statusCode).toBe(400);

    const res4 = await server.inject({
      method: 'POST',
      url: server.reverse('taskStatuses#create'),
      headers: { cookie },
    });
    expect(res4.statusCode).toBe(500);
  });

  it('Read task status', async () => {
    const { id } = await server.objection.models.taskStatus.query().first();

    const res1 = await server.inject({
      method: 'GET',
      url: server.reverse('taskStatuses#edit', { id }),
      headers: { cookie },
    });
    expect(res1.statusCode).toBe(200);

    const res2 = await server.inject({
      method: 'GET',
      url: server.reverse('taskStatuses#edit', { id: 'NotFound' }),
      headers: { cookie },
    });
    expect(res2.statusCode).toBe(404);
  });

  it('Update task status', async () => {
    const { id } = await server.objection.models.taskStatus.query().first();

    const res1 = await server.inject({
      method: 'PATCH',
      url: server.reverse('taskStatuses#update', { id }),
      headers: { cookie },
      payload: { object: { ...updatedTaskStatusData } },
    });
    expect(res1.statusCode).toBe(302);

    const result = await server.objection.models.taskStatus.query().first();
    expect(result).toMatchObject(updatedTaskStatusData);

    const res2 = await server.inject({
      method: 'PATCH',
      url: server.reverse('taskStatuses#update', { id: 'NotFound' }),
      headers: { cookie },
      payload: { object: { ...updatedTaskStatusData } },
    });
    expect(res2.statusCode).toBe(404);

    const res3 = await server.inject({
      method: 'PATCH',
      url: server.reverse('taskStatuses#update', { id }),
      headers: { cookie },
    });
    expect(res3.statusCode).toBe(500);
  });

  it('Delete task status', async () => {
    const { id } = await server.objection.models.taskStatus.query().first();

    const res1 = await server.inject({
      method: 'DELETE',
      url: server.reverse('taskStatuses#destroy', { id }),
      headers: { cookie },
    });
    expect(res1.statusCode).toBe(302);

    const res2 = await server.inject({
      method: 'DELETE',
      url: server.reverse('taskStatuses#destroy', { id }),
      headers: { cookie },
    });
    expect(res2.statusCode).toBe(404);

    const result = await server.objection.models.taskStatus.query();
    expect(result).toEqual([]);
  });
});
