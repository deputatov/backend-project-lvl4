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
      required: ['name', 'statusId', 'authorId'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        description: { type: 'string' },
        authorId: { type: 'integer', minimum: 1 },
        statusId: { type: 'integer', minimum: 1 },
        executorId: { type: 'integer' },
        labels: { type: 'array', items: { type: 'integer' }, default: [] },
      },
    };
  }

  static get relationMappings() {
    return {
      statuses: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'TaskStatus'),
        join: {
          from: 'tasks.status_id',
          to: 'statuses.id',
        },
      },
      authors: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'User'),
        join: {
          from: 'tasks.author_id',
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
