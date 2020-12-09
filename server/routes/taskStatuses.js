import i18next from 'i18next';
import { ValidationError, ForeignKeyViolationError } from 'objection';

export default (app) => {
  app
    .get('/taskStatuses', { name: 'taskStatuses#index', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      const taskStatuses = await app.objection.models.taskStatus.query();
      reply.render('taskStatuses/index', { taskStatuses });
      return reply;
    })

    .get('/taskStatuses/new', { name: 'taskStatuses#new', preHandler: app.auth([app.verifyAuth]) }, (req, reply) => {
      const taskStatus = {};
      reply.render('taskStatuses/new', { taskStatus });
    })

    .post('/taskStatuses', { name: 'taskStatuses#create', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      try {
        await app.objection.models.taskStatus.query().insert(req.body.object);
        req.flash('info', i18next.t('flash.taskStatuses.create.success'));
        reply.redirect(app.reverse('taskStatuses#index'));
        return reply;
      } catch (err) {
        if (err instanceof ValidationError) {
          req.flash('error', i18next.t('flash.taskStatuses.create.error'));
          reply.code(err.statusCode).render('taskStatuses/new', { taskStatus: req.body.object, errors: err.data });
          return reply;
        }
        reply.send(err);
        return reply;
      }
    })

    .get('/taskStatuses/:id/edit', { name: 'taskStatuses#edit', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      try {
        const toEdit = await app.objection.models.taskStatus.query().findById(req.params.id);
        if (!toEdit) {
          reply.callNotFound();
          return reply;
        }
        reply.render('taskStatuses/edit', { taskStatus: { ...toEdit } });
        return reply;
      } catch (err) {
        reply.send(err);
        return reply;
      }
    })

    .patch('/taskStatuses/:id', { name: 'taskStatuses#update', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      try {
        const toPatch = await app.objection.models.taskStatus.query().findById(req.params.id);
        if (!toPatch) {
          reply.callNotFound();
          return reply;
        }
        await toPatch.$query().patch(req.body.object);
        req.flash('info', i18next.t('flash.taskStatuses.update.success'));
        reply.redirect(app.reverse('taskStatuses#index'));
        return reply;
      } catch (err) {
        if (err instanceof ValidationError) {
          req.flash('error', i18next.t('flash.taskStatuses.update.error'));
          reply.code(err.statusCode).render('taskStatuses/edit', {
            taskStatus: {
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

    .delete('/taskStatuses/:id', { name: 'taskStatuses#destroy', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      try {
        const toDelete = await app.objection.models.taskStatus.query().findById(req.params.id);
        if (!toDelete) {
          reply.callNotFound();
          return reply;
        }
        await toDelete.$query().delete();
        req.flash('info', i18next.t('flash.taskStatuses.delete.success'));
        reply.redirect(app.reverse('taskStatuses#index'));
        return reply;
      } catch (err) {
        if (err instanceof ForeignKeyViolationError) {
          req.flash('error', i18next.t('flash.taskStatuses.delete.error'));
          reply.redirect(app.reverse('taskStatuses#index'));
          return reply;
        }
        reply.send(err);
        return reply;
      }
    });
};
