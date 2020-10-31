// @ts-check

import i18next from 'i18next';
import encrypt from '../lib/secure.js';

export default (app) => {
  app
    .get('/sessions/new', { name: 'sessions#new' }, (req, reply) => {
      const signInForm = {};
      reply.render('session/new', { signInForm });
    })

    .post('/sessions', { name: 'sessions#create' }, async (req, reply) => {
      const signInForm = req.body.object;
      const user = await app.objection.models.user.query().findOne({ email: signInForm.email });

      if (!user || (user.passwordDigest !== encrypt(signInForm.password))) {
        req.flash('error', i18next.t('flash.session.create.error'));
        reply.render('session/new', { signInForm });
        return reply;
      }

      req.session.set('userId', user.id);
      req.flash('info', i18next.t('flash.session.create.success'));
      reply.redirect(app.reverse('root'));
      return reply;
    })

    .delete('/sessions', { name: 'sessions#destroy' }, (req, reply) => {
      req.session.set('userId', null);
      req.flash('info', i18next.t('flash.session.delete.success'));
      reply.redirect(app.reverse('root'));
    });
};
