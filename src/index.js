import 'bootstrap/dist/css/bootstrap.min.css';
import Rollbar from 'rollbar';
import app from '../server/index.js';

export default () => {
  const rollbar = new Rollbar({
    accessToken: '2d6040f98f2b461d8ea09405ecfbf315',
    captureUncaught: true,
    captureUnhandledRejections: true,
  });

  rollbar.log('Hello world!');
  app.use(rollbar.errorHandler());
};
