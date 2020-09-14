import { Model } from 'objection';

export default class TaskLabel extends Model {
  static get tableName() {
    return 'tasks_labels';
  }

  static get idColumn() {
    return 'id';
  }

  // static get relationMappings() {
  //   const Task = require('./Task.js');
  //   return {
  //     tasks: {
  //       relation: Model.
  //     }
  //   }
  // }
}
