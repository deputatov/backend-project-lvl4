import i18next from 'i18next';
import _ from 'lodash';

export default (app) => ({
  route(name, args = null) {
    return app.reverse(name, args);
  },
  t(key) {
    return i18next.t(key);
  },
  _,
  getAlertClass(type) {
    switch (type) {
      case 'error':
        return 'danger';
      case 'info':
        return 'info';
      default:
        throw new Error(`Unknown type: '${type}'`);
    }
  },
  formatDate(str) {
    const date = new Date(str);
    return date.toLocaleString();
  },
});
