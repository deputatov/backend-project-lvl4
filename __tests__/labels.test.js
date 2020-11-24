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

  it('Get labels', async () => {
    const labels = await server.inject({
      method: 'GET',
      url: server.reverse('labels#index'),
      headers: { cookie },
    });
    expect(labels.statusCode).toBe(200);
  });

  it('Create label', async () => {
    const newLabel = await server.inject({
      method: 'GET',
      url: server.reverse('labels#new'),
      headers: { cookie },
    });
    expect(newLabel.statusCode).toBe(200);

    const createLabel = await server.inject({
      method: 'POST',
      url: server.reverse('labels#create'),
      headers: { cookie },
      payload: { object: { ...label } },
    });
    expect(createLabel.statusCode).toBe(302);

    const createdLabel = await server.objection.models.label.query().first();
    expect(createdLabel).toMatchObject(label);

    const requiredFields = await server.inject({
      method: 'POST',
      url: server.reverse('labels#create'),
      headers: { cookie },
      payload: { object: {} },
    });
    expect(requiredFields.statusCode).toBe(400);

    const serverError = await server.inject({
      method: 'POST',
      url: server.reverse('labels#create'),
      headers: { cookie },
    });
    expect(serverError.statusCode).toBe(500);
  });

  it('Read label', async () => {
    const { id } = await server.objection.models.label.query().first();

    const nonExistentId = id + id;

    const editLabel = await server.inject({
      method: 'GET',
      url: server.reverse('labels#edit', { id }),
      headers: { cookie },
    });
    expect(editLabel.statusCode).toBe(200);

    const labelNotFound = await server.inject({
      method: 'GET',
      url: server.reverse('labels#edit', { id: nonExistentId }),
      headers: { cookie },
    });
    expect(labelNotFound.statusCode).toBe(404);
  });

  it('Update label', async () => {
    const { id } = await server.objection.models.label.query().first();

    const updateLabel = await server.inject({
      method: 'PATCH',
      url: server.reverse('labels#update', { id }),
      headers: { cookie },
      payload: { object: { ...labelUpdateData } },
    });
    expect(updateLabel.statusCode).toBe(302);

    const updatedLabel = await server.objection.models.label
      .query()
      .findOne({ name: labelUpdateData.name });
    expect(updatedLabel).toMatchObject(labelUpdateData);

    const serverError = await server.inject({
      method: 'PATCH',
      url: server.reverse('labels#update', { id }),
      headers: { cookie },
    });
    expect(serverError.statusCode).toBe(500);
  });

  it('Delete label', async () => {
    const { id } = await server.objection.models.label.query().first();

    const nonExistentId = id + id;

    const deleteLabel = await server.inject({
      method: 'DELETE',
      url: server.reverse('labels#destroy', { id }),
      headers: { cookie },
    });
    expect(deleteLabel.statusCode).toBe(302);

    const labelNotFound = await server.inject({
      method: 'DELETE',
      url: server.reverse('labels#destroy', { id: nonExistentId }),
      headers: { cookie },
    });
    expect(labelNotFound.statusCode).toBe(404);

    const deletedLabels = await server.objection.models.label.query();
    expect(deletedLabels).toEqual([]);
  });
});
