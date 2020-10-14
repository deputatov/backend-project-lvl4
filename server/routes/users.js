// @ts-check

import i18next from 'i18next';
import { ValidationError } from 'objection';

export default (app) => {
  app

    .get('/users', { name: 'users' }, async (req, reply) => {
      const users = await app.objection.models.user.query();
      reply.render('users/index', { users });
      return reply;
    })

    .get('/users/new', { name: 'newUser' }, (req, reply) => {
      const user = {};
      reply.render('users/new', { user });
    })

    .post('/users', async (req, reply) => {
      try {
        await app.objection.models.user.query().insert(req.body.object);
        req.flash('info', i18next.t('flash.users.create.success'));
        reply.code(201).redirect(302, app.reverse('root'));
        return reply;
      } catch (err) {
        if (err instanceof ValidationError) {
          req.flash('error', i18next.t('flash.users.create.error'));
          reply.code(err.statusCode).render('users/new', { user: req.body.object, errors: err.data });
          return reply;
        }
        reply.code(err.statusCode).type('application/json').send(err.data);
        return reply;
      }
    })

    .get('/users/:id/edit', async (req, reply) => {
      if (!req.signedIn) {
        req.flash('error', i18next.t('flash.users.authorizationError'));
        reply.code(401).redirect(302, app.reverse('root'));
        return reply;
      }
      if (req.currentUser.id !== Number(req.params.id)) {
        req.flash('error', i18next.t('flash.users.accessError'));
        reply.code(403).redirect(302, app.reverse('users'));
        return reply;
      }
      reply.render('users/edit', { user: { ...req.currentUser } });
      return reply;
    })

    .patch('/users/:id', async (req, reply) => {
      const { id } = req.params;
      const { object } = req.body;
      try {
        const user = await app.objection.models.user.query().findById(id);
        await user.$query().patch(object);
        req.flash('info', i18next.t('flash.users.update.success'));
        reply.redirect(app.reverse('users'));
        return reply;
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.users.update.error'));
        reply.code(422).render('users/edit', { user: { id, ...object }, errors: data });
        return reply;
      }
    })

    .delete('/users/:id', async (req, reply) => {
      if (!req.signedIn) {
        req.flash('error', i18next.t('flash.users.authorizationError'));
        reply.code(401).redirect(302, app.reverse('root'));
        return reply;
      }
      if (req.currentUser.id !== Number(req.params.id)) {
        req.flash('error', i18next.t('flash.users.accessError'));
        reply.code(403).redirect(302, app.reverse('users'));
        return reply;
      }
      await app.objection.models.user.query().deleteById(req.params.id);
      req.session.delete();
      req.flash('info', i18next.t('flash.users.delete.succes'));
      reply.code(204).redirect(302, app.reverse('users'));
      return reply;
    });
};
