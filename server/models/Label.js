import { Model } from 'objection';
import objectionUnique from 'objection-unique';

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
    const TaskLabel = require('./TaskLabel.js');
    return {
      tasks: {
        relation: Model.HasManyRelation,
        modelClass: TaskLabel,
        join: {
          from: 'labels.id',
          to: 'tasks_labels.label_id',
        },
      },
    };
  }
}
