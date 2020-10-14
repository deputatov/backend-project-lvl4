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
          reply.code(err.statusCode).render('statuses/new', { status: req.body.object, errors: data });
          return reply;
        }
        reply.code(err.statusCode).type('application/json').send(err.data);
        return reply;
      }
    })

    .get('/statuses/:id/edit', async (req, reply) => {
      const result = await app.objection.models.taskStatus
        .query()
        .findById(req.params.id);
      const data = { status: result.$toJson() };
      reply.render('statuses/edit', data);
      return reply;
    })

    .patch('/statuses/:id', async (req, reply) => {
      const { id } = req.params;
      const { object } = req.body;
      try {
        const status = await app.objection.models.taskStatus.query().findById(id);
        await status.$query().patch(object);
        req.flash('info', i18next.t('flash.statuses.update.success'));
        reply.redirect(app.reverse('statuses'));
        return reply;
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.statuses.update.error'));
        reply.code(422).render('statuses/edit', { status: { id, ...object }, errors: data });
        return reply;
      }
    })

    .delete('/statuses/:id', async (req, reply) => {
      await app.objection.models.taskStatus.query().deleteById(req.params.id);
      req.flash('info', i18next.t('flash.statuses.delete.success'));
      reply.code(204).redirect(302, app.reverse('statuses'));
      return reply;
    });
};
