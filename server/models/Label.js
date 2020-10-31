import { Model, raw } from 'objection';
import objectionUnique from 'objection-unique';
import path from 'path';

const unique = objectionUnique({ fields: ['name'] });

export default class Label extends unique(Model) {
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
    return {
      tasks: {
        relation: Model.ManyToManyRelation,
        modelClass: path.join(__dirname, 'Task'),
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
            .select('id as selected_id', raw("'selected' as selected"))
            .whereIn('selected_id', selectedIds)
            .as('t2'),
          't2.selected_id',
          'id',
        );
      },
    };
  }
}
