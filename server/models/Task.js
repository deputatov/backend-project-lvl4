import { Model, AjvValidator } from 'objection';
import path from 'path';

export default class Task extends Model {
  static get tableName() {
    return 'tasks';
  }

  static get idColumn() {
    return 'id';
  }

  static createValidator() {
    return new AjvValidator({
      onCreateAjv: (ajv) => ({ ...ajv }),
      options: {
        allErrors: true,
        validateSchema: false,
        ownProperties: true,
        v5: true,
        coerceTypes: 'array',
      },
    });
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'taskStatusId', 'creatorId'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        description: { type: 'string' },
        creatorId: { type: 'integer', minimum: 1 },
        taskStatusId: { type: 'integer', minimum: 1 },
        executorId: { type: 'integer' },
        labels: { type: 'array', items: { type: 'integer' }, default: [] },
      },
    };
  }

  static get relationMappings() {
    return {
      taskStatuses: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'TaskStatus'),
        join: {
          from: 'tasks.task_status_id',
          to: 'task_statuses.id',
        },
      },
      creators: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'User'),
        join: {
          from: 'tasks.creator_id',
          to: 'users.id',
        },
      },
      executors: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'User'),
        join: {
          from: 'tasks.executor_id',
          to: 'users.id',
        },
      },
      labels: {
        relation: Model.ManyToManyRelation,
        modelClass: path.join(__dirname, 'Label'),
        join: {
          from: 'tasks.id',
          through: {
            from: 'tasks_labels.task_id',
            to: 'tasks_labels.label_id',
          },
          to: 'labels.id',
        },
      },
    };
  }
}
