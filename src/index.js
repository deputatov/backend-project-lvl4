import 'bootstrap/dist/css/bootstrap.min.css';
import Rollbar from 'rollbar';
import app from '../server/index.js';

const rollbar = new Rollbar({
  accessToken: '2d6040f98f2b461d8ea09405ecfbf315',
  captureUncaught: true,
  captureUnhandledRejections: true,
});

// export default () => {
//   const rollbar = new Rollbar({
//     accessToken: '2d6040f98f2b461d8ea09405ecfbf315',
//     captureUncaught: true,
//     captureUnhandledRejections: true,
//   });

//   rollbar.log('Hello world!');
//   app.use(rollbar.errorHandler());
// };

// app.use((req, res) => {
//   res.end('middleware');
// });

app.addHook('onError', async (request, reply, error) => {
  await rollbar.log(error);
});
