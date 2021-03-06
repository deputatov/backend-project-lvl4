import i18next from 'i18next';
import { ValidationError, ForeignKeyViolationError } from 'objection';

export default (app) => {
  app
    .get('/labels', { name: 'labels#index', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      const labels = await app.objection.models.label.query();
      reply.render('labels/index', { labels });
      return reply;
    })

    .get('/labels/new', { name: 'labels#new', preHandler: app.auth([app.verifyAuth]) }, (req, reply) => {
      const label = {};
      reply.render('labels/new', { label });
    })

    .post('/labels', { name: 'labels#create', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      try {
        await app.objection.models.label.query().insert(req.body.object);
        req.flash('info', i18next.t('flash.labels.create.success'));
        reply.redirect(app.reverse('labels#index'));
        return reply;
      } catch (err) {
        if (err instanceof ValidationError) {
          req.flash('error', i18next.t('flash.labels.create.error'));
          reply.code(err.statusCode).render('labels/new', { label: req.body.object, errors: err.data });
          return reply;
        }
        reply.send(err);
        return reply;
      }
    })

    .get('/labels/:id/edit', { name: 'labels#edit', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      try {
        const toEdit = await app.objection.models.label.query().findById(req.params.id);
        if (!toEdit) {
          reply.callNotFound();
          return reply;
        }
        reply.render('labels/edit', { label: { ...toEdit } });
        return reply;
      } catch (err) {
        reply.send(err);
        return reply;
      }
    })

    .patch('/labels/:id', { name: 'labels#update', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      try {
        const toPatch = await app.objection.models.label.query().findById(req.params.id);
        if (!toPatch) {
          reply.callNotFound();
          return reply;
        }
        await toPatch.$query().patch(req.body.object);
        req.flash('info', i18next.t('flash.labels.update.success'));
        reply.redirect(app.reverse('labels#index'));
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
        reply.send(err);
        return reply;
      }
    })

    .delete('/labels/:id', { name: 'labels#destroy', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      try {
        const toDelete = await app.objection.models.label.query().findById(req.params.id);
        if (!toDelete) {
          reply.callNotFound();
          return reply;
        }
        await toDelete.$query().delete();
        req.flash('info', i18next.t('flash.labels.delete.success'));
        reply.redirect(app.reverse('labels#index'));
        return reply;
      } catch (err) {
        if (err instanceof ForeignKeyViolationError) {
          req.flash('error', i18next.t('flash.labels.delete.error'));
          reply.redirect(app.reverse('labels#index'));
          return reply;
        }
        reply.send(err);
        return reply;
      }
    });
};
