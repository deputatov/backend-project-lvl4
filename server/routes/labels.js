import i18next from 'i18next';

export default (app) => {
  app
    .get('/labels', { name: 'labels' }, async (req, reply) => {
      const labels = await app.objection.models.label.query();
      reply.render('labels/index', { labels });
      return reply;
    })
    .get('/labels/new', { name: 'newLabel' }, async (req, reply) => {
      const label = {};
      reply.render('labels/new', { label });
    })
    .post('/labels', async (req, reply) => {
      try {
        const label = await app.objection.models.label.fromJson(req.body.object);
        await app.objection.models.label.query().insert(label);
        req.flash('info', i18next.t('flash.labels.create.success'));
        reply.code(201).redirect(302, app.reverse('labels'));
        return reply;
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.labels.create.error'));
        reply.code(422).render('labels/new', { label: req.body.object, errors: data });
        return reply;
      }
    })
    .get('/labels/:id/edit', async (req, reply) => {
      const result = await app.objection.models.label
        .query()
        .findById(req.params.id);
      const data = { label: result.$toJson() };
      reply.render('labels/edit', data);
      return reply;
    })
    .patch('/labels/:id', async (req, reply) => {
      const { id } = req.params;
      const { object } = req.body;
      try {
        const label = await app.objection.models.label.query().findById(id);
        await label.$query().patch(object);
        req.flash('info', i18next.t('flash.labels.update.success'));
        reply.redirect(app.reverse('labels'));
        return reply;
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.labels.update.error'));
        reply.code(422).render('labels/edit', { label: { id, ...object }, errors: data });
        return reply;
      }
    })
    .delete('/labels/:id', async (req, reply) => {
      await app.objection.models.label.query().deleteById(req.params.id);
      req.flash('info', i18next.t('flash.labels.delete.success'));
      reply.code(204).redirect(302, app.reverse('labels'));
      return reply;
    });
};
