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
