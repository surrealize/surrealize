# Surrealize

Surrealize is a **ODM** and **Query Builder** for [**SurrealDB**](https://surrealdb.com/) written in **TypeScript**.
It provides you with a Query Builder, a Repository API, an agnostic schema validation and many more features.

> [!WARNING]
> This project is still in early development and is not ready for production use.

## Features

- 📦 Object Document Mapper (ODM)
- 🛠️ Query Builder
- 🛡️ Type Safety
- 📜 Agnostic schema validation (using [Standard Schema](https://github.com/standard-schema/standard-schema))
- ⚙️ TypeScript support

## Installation

```bash
# Using npm
npm install surrealize
```

```bash
# Using yarn
yarn add surrealize
```

```bash
# Using pnpm
pnpm add surrealize
```

```bash
# Using bun
bun add surrealize
```

## Documentation

Documentation is currently missing, but will be added soon. Feel free to contribute! ([surrealize/docs](https://github.com/surrealize/docs))

## Frequently Asked Questions

### Why ODM and not ORM?

- **ODM** stands for Object Document Mapping.
- **ORM** stands for Object Relational Mapping.

SurrealDB at it's core is a document database (see [Concepts](https://surrealdb.com/docs/surrealdb/introduction/concepts)), so **ODM** makes more sense than **ORM**.
