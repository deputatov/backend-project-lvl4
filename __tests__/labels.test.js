import faker from 'faker';
import app from '../server/index.js';

const userData = {
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
};

const labelData = {
  name: faker.lorem.word(),
};

const updatedLabelData = {
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

  it('Get labels', async () => {
    const res = await server.inject({
      method: 'GET',
      url: server.reverse('labels#index'),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(200);
  });

  it('Create label', async () => {
    const res1 = await server.inject({
      method: 'GET',
      url: server.reverse('labels#new'),
      headers: { cookie },
    });
    expect(res1.statusCode).toBe(200);

    const res2 = await server.inject({
      method: 'POST',
      url: server.reverse('labels#create'),
      headers: { cookie },
      payload: { object: { ...labelData } },
    });
    expect(res2.statusCode).toBe(302);

    const result = await server.objection.models.label.query().first();
    expect(result).toMatchObject(labelData);

    const res3 = await server.inject({
      method: 'POST',
      url: server.reverse('labels#create'),
      headers: { cookie },
      payload: { object: {} },
    });
    expect(res3.statusCode).toBe(400);

    const res4 = await server.inject({
      method: 'POST',
      url: server.reverse('labels#create'),
      headers: { cookie },
    });
    expect(res4.statusCode).toBe(500);
  });

  it('Read label', async () => {
    const { id } = await server.objection.models.label.query().first();

    const res1 = await server.inject({
      method: 'GET',
      url: server.reverse('labels#edit', { id }),
      headers: { cookie },
    });
    expect(res1.statusCode).toBe(200);

    const res2 = await server.inject({
      method: 'GET',
      url: server.reverse('labels#edit', { id: 'NotFound' }),
      headers: { cookie },
    });
    expect(res2.statusCode).toBe(404);
  });

  it('Update label', async () => {
    const { id } = await server.objection.models.label.query().first();

    const res1 = await server.inject({
      method: 'PATCH',
      url: server.reverse('labels#update', { id }),
      headers: { cookie },
      payload: { object: { ...updatedLabelData } },
    });
    expect(res1.statusCode).toBe(302);

    const result = await server.objection.models.label.query().first();
    expect(result).toMatchObject(updatedLabelData);

    const res2 = await server.inject({
      method: 'PATCH',
      url: server.reverse('labels#update', { id: 'NotFound' }),
      headers: { cookie },
      payload: { object: { ...updatedLabelData } },
    });
    expect(res2.statusCode).toBe(404);

    const res3 = await server.inject({
      method: 'PATCH',
      url: server.reverse('labels#update', { id }),
      headers: { cookie },
    });
    expect(res3.statusCode).toBe(500);
  });

  it('Delete label', async () => {
    const { id } = await server.objection.models.label.query().first();

    const res1 = await server.inject({
      method: 'DELETE',
      url: server.reverse('labels#destroy', { id }),
      headers: { cookie },
    });
    expect(res1.statusCode).toBe(302);

    const res2 = await server.inject({
      method: 'DELETE',
      url: server.reverse('labels#destroy', { id }),
      headers: { cookie },
    });
    expect(res2.statusCode).toBe(404);

    const result = await server.objection.models.label.query();
    expect(result).toEqual([]);
  });
});
