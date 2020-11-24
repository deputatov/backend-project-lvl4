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

  it('Sign up', async () => {
    const createUser1 = await server.inject({
      method: 'POST',
      url: server.reverse('users#create'),
      payload: { object: { ...user } },
    });
    expect(createUser1.statusCode).toBe(302);

    const createUser2 = await server.inject({
      method: 'POST',
      url: server.reverse('users#create'),
      payload: { object: { ...userUpdateData } },
    });
    expect(createUser2.statusCode).toBe(302);
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

  it('Create task statuses', async () => {
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

  it('Create labels', async () => {
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

  it('Get tasks', async () => {
    const tasks = await server.inject({
      method: 'GET',
      url: server.reverse('tasks#index'),
      headers: { cookie },
    });
    expect(tasks.statusCode).toBe(200);
  });

  it('Create task', async () => {
    const newTask = await server.inject({
      method: 'GET',
      url: server.reverse('tasks#new'),
      headers: { cookie },
    });
    expect(newTask.statusCode).toBe(200);

    const createTask = await server.inject({
      method: 'POST',
      url: server.reverse('tasks#create'),
      headers: { cookie },
      payload: { object: { ...task } },
    });
    expect(createTask.statusCode).toBe(302);

    const createdTask = await server.objection.models.task
      .query()
      .first()
      .withGraphFetched('labels')
      .modifyGraph('labels', (builder) => {
        builder.select('labels.id');
      });
    expect({
      ...createdTask,
      labels: createdTask.labels.map(({ id }) => id),
    }).toMatchObject(task);

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

  it('Read task', async () => {
    const { id } = await server.objection.models.task.query().first();

    const nonExistentId = id + id;

    const showTask = await server.inject({
      method: 'GET',
      url: server.reverse('tasks#show', { id }),
      headers: { cookie },
    });
    expect(showTask.statusCode).toBe(200);

    const taskNotFound = await server.inject({
      method: 'GET',
      url: server.reverse('tasks#show', { id: nonExistentId }),
      headers: { cookie },
    });
    expect(taskNotFound.statusCode).toBe(404);

    const editTask = await server.inject({
      method: 'GET',
      url: server.reverse('tasks#edit', { id }),
      headers: { cookie },
    });
    expect(editTask.statusCode).toBe(200);

    const editTaskNotFound = await server.inject({
      method: 'GET',
      url: server.reverse('tasks#edit', { id: nonExistentId }),
      headers: { cookie },
    });
    expect(editTaskNotFound.statusCode).toBe(404);
  });

  it('Update task', async () => {
    const { id } = await server.objection.models.task.query().first();

    const nonExistentId = id + id;

    const updateTask = await server.inject({
      method: 'PATCH',
      url: server.reverse('tasks#update', { id }),
      headers: { cookie },
      payload: { object: { ...taskUpdateData } },
    });
    expect(updateTask.statusCode).toBe(302);

    const updatedTask = await server.objection.models.task
      .query()
      .first()
      .withGraphFetched('labels')
      .modifyGraph('labels', (builder) => {
        builder.select('labels.id');
      });
    expect({
      ...updatedTask,
      labels: updatedTask.labels.map((item) => item.id),
    }).toMatchObject(taskUpdateData);

    const taskNotFound = await server.inject({
      method: 'PATCH',
      url: server.reverse('tasks#update', { id: nonExistentId }),
      headers: { cookie },
      payload: { object: { ...taskUpdateData } },
    });
    expect(taskNotFound.statusCode).toBe(404);

    const serverError = await server.inject({
      method: 'PATCH',
      url: server.reverse('tasks#update', { id }),
      headers: { cookie },
    });
    expect(serverError.statusCode).toBe(500);
  });

  it('Delete task', async () => {
    const { id } = await server.objection.models.task.query().first();

    const deleteTask = await server.inject({
      method: 'DELETE',
      url: server.reverse('tasks#destroy', { id }),
      headers: { cookie },
    });
    expect(deleteTask.statusCode).toBe(302);

    const deletedTask = await server.objection.models.task.query();
    expect(deletedTask).toEqual([]);

    const taskNotFound = await server.inject({
      method: 'DELETE',
      url: server.reverse('tasks#destroy', { id }),
      headers: { cookie },
    });
    expect(taskNotFound.statusCode).toEqual(404);
  });
});
