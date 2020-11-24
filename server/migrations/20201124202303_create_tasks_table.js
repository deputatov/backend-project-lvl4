exports.up = function (knex) {
  return knex.schema.createTable('tasks', (table) => {
    table.increments('id').primary();
    table
      .integer('task_status_id')
      .unsigned()
      .references('id')
      .inTable('task_statuses')
      .onDelete('SET NULL')
      .index();
    table
      .integer('creator_id')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL')
      .index();
    table
      .integer('executor_id')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL')
      .index();
    table.string('name');
    table.string('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('tasks');
};
