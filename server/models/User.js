import { Model, raw } from 'objection';
import objectionUnique from 'objection-unique';
import path from 'path';
import encrypt from '../lib/secure.js';

const unique = objectionUnique({ fields: ['email'] });

export default class User extends unique(Model) {
  static get tableName() {
    return 'users';
  }

  static get virtualAttributes() {
    return ['fullName'];
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        id: { type: 'integer' },
        firstName: { type: 'string', minLength: 1, maxLength: 255 },
        lastName: { type: 'string', minLength: 1, maxLength: 255 },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 3 },
      },
    };
  }

  set password(value) {
    this.passwordDigest = encrypt(value);
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  static get relationMappings() {
    return {
      owner: {
        relation: Model.HasManyRelation,
        modelClass: path.join(__dirname, 'Task'),
        join: {
          from: 'users.id',
          to: 'tasks.creator_id',
        },
      },
      executor: {
        relation: Model.HasManyRelation,
        modelClass: path.join(__dirname, 'Task'),
        join: {
          from: 'users.id',
          to: 'tasks.executor_id',
        },
      },
    };
  }

  static get modifiers() {
    return {
      getUsers(query, selectedIds) {
        query.select('*', raw("(case id when ? then 'selected' end) as selected", selectedIds));
      },
    };
  }
}
