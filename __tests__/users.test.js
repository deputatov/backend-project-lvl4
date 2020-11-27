import _ from 'lodash';
import faker from 'faker';
import app from '../server/index.js';
import encrypt from '../server/lib/secure.js';

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

  it('Get users page', async () => {
    const res = await server.inject({
      method: 'GET',
      url: server.reverse('users#index'),
    });
    expect(res.statusCode).toBe(200);
  });

  it('Create user', async () => {
    const res1 = await server.inject({
      method: 'GET',
      url: server.reverse('users#new'),
    });
    expect(res1.statusCode).toBe(200);

    const res2 = await server.inject({
      method: 'POST',
      url: server.reverse('users#create'),
      payload: { object: { ...userData } },
    });
    expect(res2.statusCode).toBe(302);

    const result = await server.objection.models.user.query().first();
    const obj = { ...userData, passwordDigest: encrypt(userData.password) };
    const expected = _.omit(obj, ['password']);
    expect(result).toMatchObject(expected);

    const res3 = await server.inject({
      method: 'POST',
      url: server.reverse('users#create'),
      payload: { object: { firstName: userData.firstName } },
    });
    expect(res3.statusCode).toBe(400);

    const auth = await server.inject({
      method: 'POST',
      url: server.reverse('sessions#create'),
      payload: { object: { email: userData.email, password: userData.password } },
    });
    const { headers } = auth;
    cookie = headers['set-cookie'];
    expect(auth.statusCode).toBe(302);
  });

  it('Read user', async () => {
    const { id } = await server.objection.models.user.query().first();

    const res1 = await server.inject({
      method: 'GET',
      url: server.reverse('users#edit', { id }),
      headers: { cookie },
    });
    expect(res1.statusCode).toBe(200);

    const res2 = await server.inject({
      method: 'GET',
      url: server.reverse('users#edit', { id: 'AnotherID' }),
      headers: { cookie },
    });
    expect(res2.statusCode).toBe(302);
  });

  it('Update user', async () => {
    const { id } = await server.objection.models.user.query().first();

    const res1 = await server.inject({
      method: 'PATCH',
      url: server.reverse('users#update', { id }),
      headers: { cookie },
      payload: { object: { ...updatedUserData } },
    });
    expect(res1.statusCode).toBe(302);

    const result = await server.objection.models.user.query().first();
    const obj = { ...updatedUserData, passwordDigest: encrypt(updatedUserData.password) };
    const expected = _.omit(obj, ['password']);
    expect(result).toMatchObject(expected);

    const res2 = await server.inject({
      method: 'PATCH',
      url: server.reverse('users#update', { id }),
      payload: { object: { firstName: '' } },
    });
    expect(res2.statusCode).toBe(302);

    const res3 = await server.inject({
      method: 'PATCH',
      url: server.reverse('users#update', { id: 'AnotherID' }),
      headers: { cookie },
      payload: { object: { ...updatedUserData } },
    });
    expect(res3.statusCode).toBe(302);
  });

  it('Delete user', async () => {
    const { id } = await server.objection.models.user.query().first();

    const res = await server.inject({
      method: 'DELETE',
      url: server.reverse('users#destroy', { id }),
      headers: { cookie },
    });
    expect(res.statusCode).toBe(302);

    const result = await server.objection.models.user.query();
    expect(result).toEqual([]);
  });
});
