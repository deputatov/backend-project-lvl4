import { Model, raw } from 'objection';
import objectionUnique from 'objection-unique';

const unique = objectionUnique({ fields: ['name'] });

class TaskStatus extends unique(Model) {
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
    const Task = require('./Task');
    return {
      tasks: {
        relation: Model.HasManyRelation,
        modelClass: Task,
        join: {
          from: 'statuses.id',
          to: 'tasks.status_id',
        },
      },
    };
  }

  static get modifiers() {
    return {
      getStatuses(query, id) {
        query.select('*', raw('(case id when ? then "selected" end) as selected', id));
      },
    };
  }
}

module.exports = TaskStatus;
