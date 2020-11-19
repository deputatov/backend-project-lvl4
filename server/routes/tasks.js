import i18next from 'i18next';
import { ValidationError } from 'objection';
import _, {
  castArray,
  includes,
  assign,
} from 'lodash';

const addPropertySelected = (collection, selectedIds) => {
  if (!selectedIds) {
    return collection;
  }

  if (Array.isArray(selectedIds)) {
    const convertedIds = selectedIds.map(Number);
    return collection.map((v) => (includes(convertedIds, v.id) ? assign(v, { selected: 'selected' }) : v));
  }

  const convertedId = Number(selectedIds);
  return collection.map((v) => (convertedId === v.id ? assign(v, { selected: 'selected' }) : v));
};

export default (app) => {
  app
    .get('/tasks', { name: 'tasks#index', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      const { query: { isCreatorUser }, currentUser: { id: currentUserId } } = req;
      const filterCondition = { ...req.query, creatorId: isCreatorUser && currentUserId };
      const queryCondition = _.pickBy(filterCondition, (value, key) => value && key !== 'isCreatorUser');
      try {
        const [
          allTaskStatuses,
          allExecutors,
          allLabels,
          tasks,
        ] = await Promise.all([
          app.objection.models.taskStatus.query(),
          app.objection.models.user.query(),
          app.objection.models.label.query(),
          app.objection.models.task
            .query()
            .withGraphJoined('[executors, creators, taskStatuses, labels]')
            .where(queryCondition)
            .orderBy('id', 'desc'),
        ]);
        reply.render('tasks/index', {
          filters:
          {
            taskStatusId: addPropertySelected(allTaskStatuses, filterCondition.taskStatusId),
            executorId: addPropertySelected(allExecutors, filterCondition.executorId),
            labelId: addPropertySelected(allLabels, filterCondition.labelId),
            isCreatorUser: filterCondition.isCreatorUser,
          },
          tasks,
        });
        return reply;
      } catch (err) {
        reply.send(err);
        return reply;
      }
    })

    .get('/tasks/new', { name: 'tasks#new', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      try {
        const [
          taskStatusId,
          executorId,
          labels,
        ] = await Promise.all([
          app.objection.models.taskStatus.query(),
          app.objection.models.user.query(),
          app.objection.models.label.query(),
        ]);
        const task = {
          taskStatusId,
          executorId,
          labels,
        };
        reply.render('tasks/new', { task });
        return reply;
      } catch (err) {
        reply.send(err);
        return reply;
      }
    })

    .post('/tasks', { name: 'tasks#create', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      const {
        taskStatusId: selectedTaskStatusId,
        executorId: selectedExecutorId,
        labels: selectedLabelsId,
      } = req.body.object;
      try {
        await app.objection.models.task.transaction(async (trx) => {
          await app.objection.models.task
            .query(trx)
            .allowGraph('labels')
            .insertGraph({
              ...req.body.object,
              creatorId: req.currentUser.id,
              labels: castArray(selectedLabelsId || []).map((id) => ({ id })),
            }, { relate: true });
        });
        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.code(201).redirect(302, app.reverse('tasks#index'));
        return reply;
      } catch (err) {
        if (err instanceof ValidationError) {
          const [
            allTaskStatuses,
            allExecutors,
            allLabels,
          ] = await Promise.all([
            app.objection.models.taskStatus.query(),
            app.objection.models.user.query(),
            app.objection.models.label.query(),
          ]);
          const task = {
            ...req.body.object,
            taskStatusId: addPropertySelected(allTaskStatuses, selectedTaskStatusId),
            executorId: addPropertySelected(allExecutors, selectedExecutorId),
            labels: addPropertySelected(allLabels, selectedLabelsId),
          };
          req.flash('error', i18next.t('flash.tasks.create.error'));
          reply.code(err.statusCode).render('tasks/new', { task, errors: err.data });
          return reply;
        }
        reply.send(err);
        return reply;
      }
    })

    .get('/tasks/:id', { name: 'tasks#show', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      try {
        const task = await app.objection.models.task
          .query()
          .findById(req.params.id)
          .withGraphJoined('[executors, creators, taskStatuses, labels]');
        if (!task) {
          reply.callNotFound();
          return reply;
        }
        reply.render('tasks/show', { task });
        return reply;
      } catch (err) {
        reply.send(err);
        return reply;
      }
    })

    .get('/tasks/:id/edit', { name: 'tasks#edit', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      try {
        const toEdit = await app.objection.models.task
          .query()
          .findById(req.params.id)
          .withGraphFetched('labels')
          .modifyGraph('labels', (builder) => {
            builder.select('labels.id');
          });
        if (!toEdit) {
          reply.callNotFound();
          return reply;
        }
        const [
          allTaskStatuses,
          allExecutors,
          allLabels,
        ] = await Promise.all([
          app.objection.models.taskStatus.query(),
          app.objection.models.user.query(),
          app.objection.models.label.query(),
        ]);
        const task = {
          ...toEdit,
          taskStatusId: addPropertySelected(allTaskStatuses, toEdit.taskStatusId),
          executorId: addPropertySelected(allExecutors, toEdit.executorId),
          labels: addPropertySelected(allLabels, toEdit.labels.map(({ id }) => id)),
        };
        reply.render('tasks/edit', { task });
        return reply;
      } catch (err) {
        reply.send(err);
        return reply;
      }
    })

    .patch('/tasks/:id', { name: 'tasks#update', preHandler: app.auth([app.verifyAuth]) }, async (req, reply) => {
      const {
        taskStatusId: selectedTaskStatusId,
        executorId: selectedExecutorId,
        labels: selectedLabelsId,
      } = req.body.object;
      try {
        const toPatch = await app.objection.models.task.query().findById(req.params.id);
        if (!toPatch) {
          reply.callNotFound();
          return reply;
        }
        await app.objection.models.task.transaction(async (trx) => {
          await app.objection.models.task
            .query(trx)
            .upsertGraph({
              id: req.params.id,
              creatorId: req.currentUser.id,
              ...req.body.object,
              labels: castArray(selectedLabelsId || []).map((id) => ({ id })),
            }, { relate: true, unrelate: true });
        });
        req.flash('info', i18next.t('flash.tasks.update.success'));
        reply.code(201).redirect(302, app.reverse('tasks#index'));
        return reply;
      } catch (err) {
        if (err instanceof ValidationError) {
          const [
            allTaskStatuses,
            allExecutors,
            allLabels,
          ] = await Promise.all([
            app.objection.models.taskStatus.query(),
            app.objection.models.user.query(),
            app.objection.models.label.query(),
          ]);
          const task = {
            id: req.params.id,
            ...req.body.object,
            taskStatusId: addPropertySelected(allTaskStatuses, selectedTaskStatusId),
            executorId: addPropertySelected(allExecutors, selectedExecutorId),
            labels: addPropertySelected(allLabels, selectedLabelsId),
          };
          reply.code(err.statusCode).render('tasks/edit', { task, errors: err.data });
          return reply;
        }
        reply.send(err);
        return reply;
      }
    })

    .delete('/tasks/:id', { name: 'tasks#destroy', preHandler: app.auth([app.verifyAuth, app.asyncVerifyTaskCreator], { relation: 'and' }) }, async (req, reply) => {
      try {
        const toDelete = await app.objection.models.task.query().findById(req.params.id);
        if (!toDelete) {
          reply.callNotFound();
          return reply;
        }
        await app.objection.models.task.transaction(async (trx) => {
          await toDelete.$query(trx).delete();
          await toDelete.$relatedQuery('labels', trx).unrelate();
        });
        req.flash('info', i18next.t('flash.tasks.delete.success'));
        reply.code(204).redirect(302, app.reverse('tasks#index'));
        return reply;
      } catch (err) {
        reply.send(err);
        return reply;
      }
    });
};
