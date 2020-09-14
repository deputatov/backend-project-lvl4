// @ts-check

exports.up = (knex) => (
  knex.schema
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
      table.string('name');
      table.string('description');      
      table.integer('status_id').unsigned().notNullable();
      table.foreign('status_id').references('id').inTable('statuses');
      table.integer('author_id').unsigned().notNullable();
      table.foreign('author_id').references('id').inTable('users');
      table.integer('executor_id').unsigned().notNullable();
      table.foreign('executor_id').references('id').inTable('users');
      table.integer('label_id').unsigned().notNullable();
      table.foreign('label_id').references('id').inTable('labels');
    })
    .createTable('tasks_labels', (table) => {
      table.increments('id').primary();
      table.integer('task_id').unsigned().notNullable();
      table.foreign('task_id').references('id').inTable('tasks');
      table.integer('label_id').unsigned().notNullable();
      table.foreign('label_id').references('id').inTable('labels');
    })
);

exports.down = (knex) => (knex.schema
  .dropTableIfExists('users')
  .dropTableIfExists('statuses')
  .dropTableIfExists('labels')
  .dropTableIfExists('tasks')
  .dropTableIfExists('tasks_labels')
);
