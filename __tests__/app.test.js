import getApp from '../server/index.js';

describe('requests', () => {
  let server;

  beforeAll(async () => {
    server = await getApp();
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
