setup: install db-migrate

install: 
	npm install

db-migrate:
	npx knex migrate:latest

build:
	npm run build

prepare:
	touch .env

start:
	heroku local -f Procfile.dev

start-backend:
	npx nodemon --exec npx babel-node server/bin/server.js

start-frontend:
	npx webpack-dev-server

lint:
	npx eslint .

test:
	npm run test

make debug:
	DEBUG=knex:query make start