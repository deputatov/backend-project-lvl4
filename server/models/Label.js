import { Model, raw } from 'objection';
import objectionUnique from 'objection-unique';

const unique = objectionUnique({ fields: ['name'] });

class Label extends unique(Model) {
  static get tableName() {
    return 'labels';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
      },
    };
  }

  static get relationMappings() {
    const Task = require('./Task');
    return {
      tasks: {
        relation: Model.ManyToManyRelation,
        modelClass: Task,
        join: {
          from: 'labels.id',
          through: {
            from: 'tasks_labels.label_id',
            to: 'tasks_labels.task_id',
          },
          to: 'tasks.id',
        },
      },
    };
  }

  static get modifiers() {
    return {
      getLabels(query, selectedIds) {
        query.select('id', 'name', 't2.selected').leftJoin(
          Label
            .query()
            .select('id as selected_id', raw('"selected" as selected'))
            .whereIn('selected_id', selectedIds)
            .as('t2'),
          't2.selected_id',
          'id',
        );
      },
    };
  }
}

module.exports = Label;
