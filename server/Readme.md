# Sequelize CLI Commands

## Installation

If you haven't installed Sequelize CLI yet, install it as a development dependency:

```sh
pnpm add -D sequelize-cli
```

## Initialize Sequelize

Initialize Sequelize to generate necessary folders:

```sh
npx sequelize-cli init
```

### Generated Folder Structure:

```
📂 project-root
 ├── 📂 config         # Configuration files (database.js)
 ├── 📂 migrations     # Migration files
 ├── 📂 models         # Models (index.js, model definitions)
 ├── 📂 seeders        # Seeder files
```

## Model & Migration Commands

### Generate a Model (with Migration)

```sh
npx sequelize-cli model:generate --name User --attributes name:string,email:string,password:string
```

This creates:

- A model file in `models/`
- A migration file in `migrations/`

### Run Migrations

```sh
npx sequelize-cli db:migrate
```

Applies all pending migrations to the database.

### Undo Migrations

- Undo the last migration:
  ```sh
  npx sequelize-cli db:migrate:undo
  ```
- Undo all migrations:
  ```sh
  npx sequelize-cli db:migrate:undo:all
  ```

### Create a Migration Manually

```sh
npx sequelize-cli migration:generate --name add-column-to-users
```

Modify the generated file under `migrations/` to define the changes, then run:

```sh
npx sequelize-cli db:migrate
```

## Seeder Commands

### Generate a Seeder

```sh
npx sequelize-cli seed:generate --name demo-user
```

This creates a seeder file inside `seeders/`.

### Run Seeders

```sh
npx sequelize-cli db:seed:all
```

This inserts seed data into the database.

- Run a specific seeder:
  ```sh
  npx sequelize-cli db:seed --seed <seeder-file-name>
  ```

### Undo Seeders

- Undo the last seed:
  ```sh
  npx sequelize-cli db:seed:undo
  ```
- Undo all seeders:
  ```sh
  npx sequelize-cli db:seed:undo:all
  ```

## Database Utilities

### Check Database Connection

```sh
npx sequelize-cli db:version
```

Verifies the database connection and displays the Sequelize version.

## Adding Scripts to `package.json`

To simplify running commands, add scripts to your `package.json`:

```json
"scripts": {
  "migrate": "sequelize-cli db:migrate",
  "migrate:undo": "sequelize-cli db:migrate:undo",
  "migrate:undo:all": "sequelize-cli db:migrate:undo:all",
  "seed": "sequelize-cli db:seed:all",
  "seed:undo": "sequelize-cli db:seed:undo",
  "seed:undo:all": "sequelize-cli db:seed:undo:all"
}
```

Now you can run:

```sh
pnpm run migrate
pnpm run seed
```

## Notes

- Always define models before running migrations.
- Use seeders for inserting dummy data.
- Keep your migrations version-controlled for team collaboration.

---

**Enjoy using Sequelize CLI! 🚀**
