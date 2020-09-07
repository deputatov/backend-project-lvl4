// @ts-check

import welcome from './welcome';
import users from './users';
import session from './session';
import statuses from './statuses.js';
import labels from './labels.js';

const controllers = [
  welcome,
  users,
  session,
  statuses,
  labels,
];

export default (app) => controllers.forEach((f) => f(app));
