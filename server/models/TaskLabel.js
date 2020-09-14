import { Model } from 'objection';

export default class TaskLabel extends Model {
  static get tableName() {
    return 'tasks_labels';
  }

  static get idColumn() {
    return 'id';
  }
}
