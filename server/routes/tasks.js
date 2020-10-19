/* eslint no-restricted-syntax: 0 */
import i18next from 'i18next';
import { ValidationError } from 'objection';
import { castArray } from 'lodash';

export default (app) => {
  app
    .get('/tasks', { name: 'tasks', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      try {
        const tasks = await app.objection.models.task
          .query()
          .withGraphJoined('[executors, authors, statuses]');
        reply.render('tasks/index', { tasks });
        return reply;
      } catch (err) {
        reply.code(err.statusCode).type('application/json').send(err.data);
        return reply;
      }
    })

    .get('/tasks/new', { name: 'newTask', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      try {
        const [
          statusId,
          executorId,
          labels,
        ] = await Promise.all([
          app.objection.models.taskStatus.query(),
          app.objection.models.user.query(),
          app.objection.models.label.query(),
        ]);
        const task = {
          statusId,
          executorId,
          labels,
        };
        reply.render('tasks/new', { task });
        return reply;
      } catch (err) {
        reply.code(err.statusCode).type('application/json').send(err.data);
        return reply;
      }
    })

    .get('/tasks/:id', { name: 'getTask', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      try {
        const task = await app.objection.models.task
          .query()
          .findById(req.params.id)
          .withGraphJoined('[executors, authors, statuses, labels]');
        if (task) {
          reply.render('tasks/show', { task });
          return reply;
        }
        reply.code(404).type('text/plain').send('Not Found');
        return reply;
      } catch (err) {
        reply.code(err.statusCode).type('application/json').send(err.data);
        return reply;
      }
    })

    .post('/tasks', { name: 'addTask', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      const selectedIds = castArray(req.body.object.labels || []);
      try {
        await app.objection.models.task.transaction(async (trx) => {
          await app.objection.models.task
            .query(trx)
            .allowGraph('labels')
            .insertGraph({
              ...req.body.object,
              authorId: req.currentUser.id,
              labels: selectedIds.map((id) => ({ id })),
            }, { relate: true });
        });
        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.code(201).redirect(302, app.reverse('tasks'));
        return reply;
      } catch (err) {
        if (err instanceof ValidationError) {
          const [
            statusId,
            executorId,
            labels,
          ] = await Promise.all([
            app.objection.models.taskStatus
              .query()
              .modify('getStatuses', req.body.object.statusId),
            app.objection.models.user
              .query()
              .modify('getUsers', req.body.object.executorId),
            app.objection.models.label
              .query()
              .modify('getLabels', selectedIds),
          ]);
          const task = {
            ...req.body.object,
            statusId,
            executorId,
            labels,
          };
          req.flash('error', i18next.t('flash.tasks.create.error'));
          reply.code(err.statusCode).render('tasks/new', { task, errors: err.data });
          return reply;
        }
        reply.code(err.statusCode).type('application/json').send(err.data);
        return reply;
      }
    })

    .get('/tasks/:id/edit', { name: 'editTask', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      try {
        const toEdit = await app.objection.models.task
          .query()
          .findById(req.params.id)
          .withGraphFetched('labels')
          .modifyGraph('labels', (builder) => {
            builder.select('labels.id');
          });
        if (toEdit) {
          const [
            statusId,
            executorId,
            labels,
          ] = await Promise.all([
            app.objection.models.taskStatus
              .query()
              .modify('getStatuses', toEdit.statusId),
            app.objection.models.user
              .query()
              .modify('getUsers', toEdit.executorId),
            app.objection.models.label
              .query()
              .modify('getLabels', toEdit.labels.map(({ id }) => id)),
          ]);
          const task = {
            ...toEdit,
            statusId,
            executorId,
            labels,
          };
          reply.render('tasks/edit', { task });
          return reply;
        }
        reply.code(404).type('text/plain').send('Not Found');
        return reply;
      } catch (err) {
        reply.code(err.statusCode).type('application/json').send(err.data);
        return reply;
      }
    })

    .patch('/tasks/:id', { name: 'patchTask', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      const selectedIds = castArray(req.body.object.labels || []);
      try {
        const toPatch = await app.objection.models.task.query().findById(req.params.id);
        if (toPatch) {
          await app.objection.models.task.transaction(async (trx) => {
            await app.objection.models.task
              .query(trx)
              .upsertGraph({
                id: req.params.id,
                authorId: req.currentUser.id,
                ...req.body.object,
                labels: selectedIds.map((id) => ({ id })),
              }, { relate: true, unrelate: true });
          });
          req.flash('info', i18next.t('flash.task.update.success'));
          reply.code(201).redirect(302, app.reverse('tasks'));
          return reply;
        }
        reply.code(404).type('text/plain').send('Not Found');
        return reply;
      } catch (err) {
        if (err instanceof ValidationError) {
          const [
            statusId,
            executorId,
            labels,
          ] = await Promise.all([
            app.objection.models.taskStatus
              .query()
              .modify('getStatuses', req.body.object.statusId),
            app.objection.models.user
              .query()
              .modify('getUsers', req.body.object.executorId),
            app.objection.models.label
              .query()
              .modify('getLabels', selectedIds),
          ]);
          const task = {
            id: req.params.id,
            ...req.body.object,
            statusId,
            executorId,
            labels,
          };
          reply.code(err.statusCode).render('tasks/edit', { task, errors: err.data });
          return reply;
        }
        reply.code(err.statusCode).type('application/json').send(err.data);
        return reply;
      }
    })

    .delete('/tasks/:id', { name: 'deleteTask', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      try {
        const toDelete = await app.objection.models.task.query().findById(req.params.id);
        if (toDelete) {
          if (toDelete.authorId !== req.currentUser.id) {
            req.flash('error', i18next.t('flash.tasks.accessError'));
            reply.code(403).redirect(302, app.reverse('tasks'));
            return reply;
          }
          await app.objection.models.task.transaction(async (trx) => {
            await toDelete.$query(trx).delete();
            await toDelete.$relatedQuery('labels', trx).unrelate();
          });
          req.flash('info', i18next.t('flash.tasks.delete.success'));
          reply.code(204).redirect(302, app.reverse('tasks'));
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
