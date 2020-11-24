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

  it('Sign up', async () => {
    const createUser = await server.inject({
      method: 'POST',
      url: server.reverse('users#create'),
      payload: { object: { ...user } },
    });
    expect(createUser.statusCode).toBe(302);
  });

  it('Sign in', async () => {
    const auth = await server.inject({
      method: 'POST',
      url: server.reverse('sessions#create'),
      payload: { object: { email: user.email, password: user.password } },
    });
    const { headers } = auth;
    cookie = headers['set-cookie'];
    expect(auth.statusCode).toBe(302);
  });

  it('Get task statuses', async () => {
    const taskStatuses = await server.inject({
      method: 'GET',
      url: server.reverse('taskStatuses#index'),
      headers: { cookie },
    });
    expect(taskStatuses.statusCode).toBe(200);
  });

  it('Create task status', async () => {
    const newTaskStatus = await server.inject({
      method: 'GET',
      url: server.reverse('taskStatuses#new'),
      headers: { cookie },
    });
    expect(newTaskStatus.statusCode).toBe(200);

    const createTaskStatus = await server.inject({
      method: 'POST',
      url: server.reverse('taskStatuses#create'),
      headers: { cookie },
      payload: { object: { ...taskStatus } },
    });
    expect(createTaskStatus.statusCode).toBe(302);

    const createdTaskStatus = await server.objection.models.taskStatus
      .query()
      .first();
    expect(createdTaskStatus).toMatchObject(taskStatus);

    const requiredFields = await server.inject({
      method: 'POST',
      url: server.reverse('taskStatuses#create'),
      headers: { cookie },
      payload: { object: {} },
    });
    expect(requiredFields.statusCode).toBe(400);

    const serverError = await server.inject({
      method: 'POST',
      url: server.reverse('taskStatuses#create'),
      headers: { cookie },
    });
    expect(serverError.statusCode).toBe(500);
  });

  it('Read task status', async () => {
    const { id } = await server.objection.models.taskStatus.query().first();

    const editTaskStatus = await server.inject({
      method: 'GET',
      url: server.reverse('taskStatuses#edit', { id }),
      headers: { cookie },
    });
    expect(editTaskStatus.statusCode).toBe(200);
  });

  it('Update task status', async () => {
    const { id } = await server.objection.models.taskStatus.query().first();

    const updateTaskStatus = await server.inject({
      method: 'PATCH',
      url: server.reverse('taskStatuses#update', { id }),
      headers: { cookie },
      payload: { object: { ...taskStatusUpdateData } },
    });
    expect(updateTaskStatus.statusCode).toBe(302);

    const updatedTaskStatus = await server.objection.models.taskStatus
      .query()
      .first();
    expect(updatedTaskStatus).toMatchObject(taskStatusUpdateData);

    const serverError = await server.inject({
      method: 'PATCH',
      url: server.reverse('taskStatuses#update', { id }),
      headers: { cookie },
    });
    expect(serverError.statusCode).toBe(500);
  });

  it('Delete task status', async () => {
    const { id } = await server.objection.models.taskStatus.query().first();

    const deleteTaskStatus = await server.inject({
      method: 'DELETE',
      url: server.reverse('taskStatuses#destroy', { id }),
      headers: { cookie },
    });
    expect(deleteTaskStatus.statusCode).toBe(302);

    const taskStatusNotFound = await server.inject({
      method: 'DELETE',
      url: server.reverse('taskStatuses#destroy', { id }),
      headers: { cookie },
    });
    expect(taskStatusNotFound.statusCode).toBe(404);

    const deletedTaskStatuses = await server.objection.models.taskStatus.query();
    expect(deletedTaskStatuses).toEqual([]);
  });
});
