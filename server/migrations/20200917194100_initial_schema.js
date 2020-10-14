exports.up = (knex) => {
  return knex.schema
    .createTable('users', (table) => {
      table.increments('id').primary();
      table.string('first_name');
      table.string('last_name');
      table.string('email');
      table.string('password_digest');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('statuses', (table) => {
      table.increments('id').primary();
      table.string('name');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('labels', (table) => {
      table.increments('id').primary();
      table.string('name');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('tasks', (table) => {
      table.increments('id').primary();
      table
        .integer('status_id')
        .unsigned()
        .references('id')
        .inTable('statuses')
        .onDelete('SET NULL')
        .index();
      table
        .integer('author_id')
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
    })
    .createTable('tasks_labels', (table) => {
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
    })
};

exports.down = (knex) => {
  return knex.schema
    .dropTableIfExists('users')
    .dropTableIfExists('statuses')
    .dropTableIfExists('labels')
    .dropTableIfExists('tasks')
    .dropTableIfExists('tasks_labels')
};