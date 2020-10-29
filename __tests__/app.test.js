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

describe('basic functionality', () => {
  let server;

  beforeAll(async () => {
    server = await app();
    await server.objection.knex.migrate.latest();
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

  describe('CRUD users', () => {
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
      const createdUser = await server.objection.models.user
        .query()
        .findOne({ email: user.email });
      expect(res.statusCode).toBe(302);
      expect(createdUser).toMatchObject({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        passwordDigest: encrypt(user.password),
      });
    });

    let cookie;

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

      const updatedUser = await server.objection.models.user
        .query()
        .findOne({ email: userUpdateData.email });

      expect(res.statusCode).toBe(302);
      expect(updatedUser).toMatchObject({
        firstName: userUpdateData.firstName,
        lastName: userUpdateData.lastName,
        email: userUpdateData.email,
        passwordDigest: encrypt(userUpdateData.password),
      });
    });

    it('users#destroy', async () => {
      const res = await server.inject({
        method: 'DELETE',
        url: server.reverse('users#destroy', { id: 1 }),
        headers: { cookie },
      });
      expect(res.statusCode).toBe(302);
    });
  });
});
