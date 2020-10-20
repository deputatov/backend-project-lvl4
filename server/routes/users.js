// @ts-check

import i18next from 'i18next';
import { ValidationError } from 'objection';

export default (app) => {
  const opts = { preHandler: app.auth([app.verifyAuth, app.verifyUserCreator], { relation: 'and' }) };

  app
    .get('/users', { name: 'users#index' }, async (req, reply) => {
      const users = await app.objection.models.user.query();
      reply.render('users/index', { users });
      return reply;
    })

    .get('/users/new', { name: 'users#new' }, (req, reply) => {
      const user = {};
      reply.render('users/new', { user });
    })

    .post('/users', { name: 'users#create' }, async (req, reply) => {
      try {
        await app.objection.models.user.query().insert(req.body.object);
        req.flash('info', i18next.t('flash.users.create.success'));
        reply.code(201).redirect(302, app.reverse('root'));
        return reply;
      } catch (err) {
        if (err instanceof ValidationError) {
          req.flash('error', i18next.t('flash.users.create.error'));
          reply
            .code(err.statusCode)
            .render('users/new', { user: req.body.object, errors: err.data });
          return reply;
        }
        reply.code(err.statusCode).type('application/json').send(err.data);
        return reply;
      }
    })

    .get('/users/:id/edit', { name: 'users#edit', ...opts }, async (req, reply) => {
      try {
        const toEdit = await app.objection.models.user
          .query()
          .findById(req.params.id);
        reply.render('users/edit', { user: { ...toEdit } });
        return reply;
      } catch (err) {
        reply.code(err.statusCode).type('application/json').send(err.data);
        return reply;
      }
    })

    .patch('/users/:id', { name: 'users#update', ...opts }, async (req, reply) => {
      try {
        const user = await app.objection.models.user.query().findById(req.params.id);
        await user.$query().patch(req.body.object);
        req.flash('info', i18next.t('flash.users.update.success'));
        reply.redirect(app.reverse('users#index'));
        return reply;
      } catch (err) {
        if (err instanceof ValidationError) {
          req.flash('error', i18next.t('flash.users.update.error'));
          reply
            .code(err.statusCode)
            .render('users/edit', { user: { id: req.params.id, ...req.body.object }, errors: err.data });
          return reply;
        }
        reply.code(err.statusCode).type('application/json').send(err.data);
        return reply;
      }
    })

    .delete('/users/:id', { name: 'users#destroy', ...opts }, async (req, reply) => {
      try {
        await app.objection.models.user.query().deleteById(req.params.id);
        req.session.delete();
        req.flash('info', i18next.t('flash.users.delete.succes'));
        reply.code(204).redirect(302, app.reverse('users#index'));
        return reply;
      } catch (err) {
        reply.code(err.statusCode).type('application/json').send(err.data);
        return reply;
      }
    });
};
