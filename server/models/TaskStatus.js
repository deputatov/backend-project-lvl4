import { Model, raw } from 'objection';
import objectionUnique from 'objection-unique';
import path from 'path';

const unique = objectionUnique({ fields: ['name'] });

export default class TaskStatus extends unique(Model) {
  static get tableName() {
    return 'statuses';
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
        relation: Model.HasManyRelation,
        modelClass: path.join(__dirname, 'Task'),
        join: {
          from: 'statuses.id',
          to: 'tasks.status_id',
        },
      },
    };
  }

  static get modifiers() {
    return {
      getStatuses(query, selectedIds) {
        query.select('*', raw("(case id when ? then 'selected' else null end) as selected", selectedIds));
      },
    };
  }
}
