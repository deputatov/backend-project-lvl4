// @ts-check

import path from 'path';
import fastify from 'fastify';
import fastifyAuth from 'fastify-auth';
import fastifyStatic from 'fastify-static';
import fastifyErrorPage from 'fastify-error-page';
import pointOfView from 'point-of-view';
import fastifyFormbody from 'fastify-formbody';
import fastifySecureSession from 'fastify-secure-session';
import fastifyFlash from 'fastify-flash';
import fastifyReverseRoutes from 'fastify-reverse-routes';
import fastifyMethodOverride from 'fastify-method-override';
import fastifyObjectionjs from 'fastify-objectionjs';
import Pug from 'pug';
import i18next from 'i18next';

import dotenv from 'dotenv';
import Rollbar from 'rollbar';

import ru from './locales/ru.js';
import webpackConfig from '../webpack.config.js';

import addRoutes from './routes/index.js';
import getHelpers from './helpers/index.js';
import knexConfig from '../knexfile.js';
import models from './models/index.js';
import {
  verifyAuth,
  verifyUserCreator,
  asyncVerifyTaskCreator,
} from './lib/auth.js';

dotenv.config();

const mode = process.env.NODE_ENV || 'development';
const isProduction = mode === 'production';
const isDevelopment = mode === 'development';

const setUpViews = (app) => {
  const { devServer } = webpackConfig;
  const devHost = `http://${devServer.host}:${devServer.port}`;
  const domain = isDevelopment ? devHost : '';
  const helpers = getHelpers(app);
  app.register(pointOfView, {
    engine: {
      pug: Pug,
    },
    includeViewExtension: true,
    defaultContext: {
      ...helpers,
      assetPath: (filename) => `${domain}/assets/${filename}`,
    },
    templates: path.join(__dirname, '..', 'server', 'views'),
  });

  app.decorateReply('render', function render(viewPath, locals) {
    this.view(viewPath, { ...locals, reply: this });
  });
};

const setUpStaticAssets = (app) => {
  const pathPublic = isProduction
    ? path.join(__dirname, '..', 'public')
    : path.join(__dirname, '..', 'dist', 'public');
  app.register(fastifyStatic, {
    root: pathPublic,
    prefix: '/assets/',
  });
};

const setupLocalization = () => {
  i18next.init({
    lng: 'ru',
    fallbackLng: 'en',
    debug: isDevelopment,
    resources: {
      ru,
    },
  });
};

const addHooks = (app) => {
  app.decorateRequest('currentUser', null);
  app.decorateRequest('signedIn', false);

  app.addHook('preHandler', async (req) => {
    const userId = req.session.get('userId');
    if (userId) {
      req.currentUser = await app.objection.models.user
        .query()
        .findById(userId);
      req.signedIn = true;
    }
  });
};

const registerPlugins = (app) => {
  app.register(fastifyErrorPage);
  app.register(fastifyReverseRoutes);
  app.register(fastifyFormbody);
  app.register(fastifySecureSession, {
    secret: 'a secret with minimum length of 32 characters',
    cookie: {
      path: '/',
    },
  });
  app.register(fastifyFlash);
  app.register(fastifyMethodOverride);
  app.register(fastifyObjectionjs, {
    knexConfig: knexConfig[mode],
    models,
  });
  app.register(fastifyAuth);
};

const addDecorators = (app) => app
  .decorate('verifyAuth', verifyAuth(app))
  .decorate('verifyUserCreator', verifyUserCreator(app))
  .decorate('asyncVerifyTaskCreator', asyncVerifyTaskCreator(app));

export default async () => {
  const app = fastify({
    logger: {
      prettyPrint: isDevelopment,
      timestamp: isProduction,
      base: null,
    },
  });

  registerPlugins(app);
  setupLocalization();
  setUpViews(app);
  setUpStaticAssets(app);
  // await addRoutes(app);
  addDecorators(app);
  await app.register(addRoutes);
  addHooks(app);

  const rollbar = new Rollbar({
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
  });

  app.setErrorHandler((error) => rollbar.log(error));

  return app;
};
