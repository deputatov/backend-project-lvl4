import { Model } from 'objection';

export default class Task extends Model {
  static get tableName() {
    return 'tasks';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name, statusId, executorId'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        description: { type: 'string' },
        statusId: { type: ['integer', 'null'] },
        authorId: { type: ['integer', 'null'] },
        executorId: { type: ['integer', 'null'] },
        labelId: { type: ['integer', 'null'] },
      },
    };
  }

  static get relationMappings() {
    const TaskStatus = require('./TaskStatus.js');
    const User = require('./User.js');
    const Label = require('./Label.js');
    return {
      statuses: {
        relation: Model.BelongsToOneRelation,
        modelClass: TaskStatus,
        join: {
          from: 'tasks.status_id',
          to: 'users.id',
        },
      },
      authors: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'tasks.author_id',
          to: 'users.id',
        },
      },
      executors: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'tasks.executor_id',
          to: 'users.id',
        },
      },
      labels: {
        relation: Model.ManyToManyRelation,
        modelClass: Label,
        join: {
          from: 'task.id',
          through: {
            from: 'tasks_labels.task_id',
            to: 'tasks_labels.label_id',
          },
          to: 'label.id',
        },
      },
    };
  }
}
