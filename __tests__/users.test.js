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

  it('Get users page', async () => {
    const users = await server.inject({
      method: 'GET',
      url: server.reverse('users#index'),
    });
    expect(users.statusCode).toBe(200);
  });

  it('Create user', async () => {
    const newUser = await server.inject({
      method: 'GET',
      url: server.reverse('users#new'),
    });
    expect(newUser.statusCode).toBe(200);

    const createUser = await server.inject({
      method: 'POST',
      url: server.reverse('users#create'),
      payload: { object: { ...user } },
    });
    expect(createUser.statusCode).toBe(302);

    const createdUser = await server.objection.models.user.query().first();
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

    const signIn = await server.inject({
      method: 'POST',
      url: server.reverse('sessions#create'),
      payload: { object: { email: user.email, password: user.password } },
    });
    const { headers } = signIn;
    cookie = headers['set-cookie'];
    expect(signIn.statusCode).toBe(302);
  });

  it('Read user', async () => {
    const { id } = await server.objection.models.user.query().first();

    const editUser = await server.inject({
      method: 'GET',
      url: server.reverse('users#edit', { id }),
      headers: { cookie },
    });
    expect(editUser.statusCode).toBe(200);
  });

  it('Update user', async () => {
    const { id } = await server.objection.models.user.query().first();

    const updateUser = await server.inject({
      method: 'PATCH',
      url: server.reverse('users#update', { id }),
      headers: { cookie },
      payload: { object: { ...userUpdateData } },
    });
    expect(updateUser.statusCode).toBe(302);

    const updatedUser = await server.objection.models.user.query().first();

    expect(updatedUser).toMatchObject({
      firstName: userUpdateData.firstName,
      lastName: userUpdateData.lastName,
      email: userUpdateData.email,
      passwordDigest: encrypt(userUpdateData.password),
    });

    const requiredFields = await server.inject({
      method: 'PATCH',
      url: server.reverse('users#update', { id }),
      payload: { object: { firstName: '' } },
    });
    expect(requiredFields.statusCode).toBe(302);
  });

  it('Delete user', async () => {
    const { id } = await server.objection.models.user.query().first();

    const deleteUser = await server.inject({
      method: 'DELETE',
      url: server.reverse('users#destroy', { id }),
      headers: { cookie },
    });
    expect(deleteUser.statusCode).toBe(302);

    const deletedUsers = await server.objection.models.user.query();
    expect(deletedUsers).toEqual([]);
  });
});
