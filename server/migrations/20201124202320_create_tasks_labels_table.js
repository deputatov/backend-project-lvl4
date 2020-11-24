exports.up = function (knex) {
  return knex.schema.createTable('tasks_labels', (table) => {
    table.increments('id').primary();
    table
      .integer('task_id')
      .unsigned()
      .references('id')
      .inTable('tasks')
      .onDelete('CASCADE')
      .index();
    table
      .integer('label_id')
      .unsigned()
      .references('id')
      .inTable('labels')
      .onDelete('CASCADE')
      .index();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('tasks_labels');
};
