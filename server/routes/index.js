// @ts-check

import welcome from './welcome';
import users from './users';
import session from './session';
import taskStatuses from './taskStatuses.js';
import labels from './labels.js';
import tasks from './tasks.js';

const controllers = [
  welcome,
  users,
  session,
  taskStatuses,
  labels,
  tasks,
];

export default async (app) => controllers.forEach((f) => f(app));
