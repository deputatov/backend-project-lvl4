import i18next from 'i18next';
import { ValidationError } from 'objection';

export default (app) => {
  app
    .get('/statuses', { name: 'statuses' }, async (req, reply) => {
      const statuses = await app.objection.models.taskStatus.query();
      reply.render('statuses/index', { statuses });
      return reply;
    })

    .get('/statuses/new', { name: 'newStatus' }, async (req, reply) => {
      const status = {};
      reply.render('statuses/new', { status });
    })

    .post('/statuses', async (req, reply) => {
      try {
        await app.objection.models.taskStatus.query().insert(req.body.object);
        req.flash('info', i18next.t('flash.statuses.create.success'));
        reply.code(201).redirect(302, app.reverse('statuses'));
        return reply;
      } catch (err) {
        if (err instanceof ValidationError) {
          req.flash('error', i18next.t('flash.statuses.create.error'));
          reply.code(err.statusCode).render('statuses/new', { status: req.body.object, errors: err.data });
          return reply;
        }
        reply.code(err.statusCode).type('application/json').send(err.data);
        return reply;
      }
    })

    .get('/statuses/:id/edit', async (req, reply) => {
      try {
        const toEdit = await app.objection.models.taskStatus.query().findById(req.params.id);
        if (toEdit) {
          reply.render('statuses/edit', { status: { ...toEdit } });
          return reply;
        }
        reply.code(404).type('text/plain').send('Not Found');
        return reply;
      } catch (err) {
        reply.code(err.statusCode).type('application/json').send(err.data);
        return reply;
      }
    })

    .patch('/statuses/:id', async (req, reply) => {
      try {
        const toPatch = await app.objection.models.taskStatus.query().findById(req.params.id);
        if (toPatch) {
          await toPatch.$query().patch(req.body.object);
          req.flash('info', i18next.t('flash.statuses.update.success'));
          reply.redirect(app.reverse('statuses'));
          return reply;
        }
        reply.code(404).type('text/plain').send('Not Found');
        return reply;
      } catch (err) {
        if (err instanceof ValidationError) {
          req.flash('error', i18next.t('flash.statuses.update.error'));
          reply.code(err.statusCode).render('statuses/edit', {
            status: {
              id: req.params.id,
              ...req.body.object,
            },
            errors: err.data,
          });
          return reply;
        }
        reply.code(err.statusCode).type('application/json').send(err.data);
        return reply;
      }
    })

    .delete('/statuses/:id', async (req, reply) => {
      try {
        const toDelete = await app.objection.models.taskStatus.query().findById(req.params.id);
        if (toDelete) {
          await toDelete.$query().delete();
          req.flash('info', i18next.t('flash.statuses.delete.success'));
          reply.code(204).redirect(302, app.reverse('statuses'));
          return reply;
        }
        reply.code(404).type('text/plain').send('Not Found');
        return reply;
      } catch (err) {
        reply.code(err.statusCode).type('application/json').send(err.data);
        return reply;
      }
    });
};
