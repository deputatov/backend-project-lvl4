import i18next from 'i18next';
import { ValidationError } from 'objection';

export default (app) => {
  app
    .get('/labels', { name: 'labels#index', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      const labels = await app.objection.models.label.query();
      reply.render('labels/index', { labels });
      return reply;
    })

    .get('/labels/new', { name: 'labels#new', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      const label = {};
      reply.render('labels/new', { label });
    })

    .post('/labels', { name: 'labels#create', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      try {
        await app.objection.models.label.query().insert(req.body.object);
        req.flash('info', i18next.t('flash.labels.create.success'));
        reply.code(201).redirect(302, app.reverse('labels#index'));
        return reply;
      } catch (err) {
        if (err instanceof ValidationError) {
          req.flash('error', i18next.t('flash.labels.create.error'));
          reply.code(err.statusCode).render('labels/new', { label: req.body.object, errors: err.data });
          return reply;
        }
        reply.code(err.statusCode).type('application/json').send(err.data);
        return reply;
      }
    })

    .get('/labels/:id/edit', { name: 'labels#edit', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      try {
        const toEdit = await app.objection.models.label.query().findById(req.params.id);
        if (toEdit) {
          reply.render('labels/edit', { label: { ...toEdit } });
          return reply;
        }
        reply.code(404).type('text/plain').send('Not Found');
        return reply;
      } catch (err) {
        reply.code(err.statusCode).type('application/json').send(err.data);
        return reply;
      }
    })

    .patch('/labels/:id', { name: 'labels#update', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      try {
        const toPatch = await app.objection.models.label.query().findById(req.params.id);
        if (toPatch) {
          await toPatch.$query().patch(req.body.object);
          req.flash('info', i18next.t('flash.labels.update.success'));
          reply.redirect(app.reverse('labels#index'));
          return reply;
        }
        reply.code(404).type('text/plain').send('Not Found');
        return reply;
      } catch (err) {
        if (err instanceof ValidationError) {
          req.flash('error', i18next.t('flash.labels.update.error'));
          reply.code(err.statusCode).render('labels/edit', {
            label: {
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

    .delete('/labels/:id', { name: 'labels#destroy', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      try {
        const toDelete = await app.objection.models.label.query().findById(req.params.id);
        if (toDelete) {
          await toDelete.$query().delete();
          req.flash('info', i18next.t('flash.labels.delete.success'));
          reply.code(204).redirect(302, app.reverse('labels#index'));
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
