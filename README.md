# Surrealize

Surrealize is a **ODM** and **Query Builder** for [**SurrealDB**](https://surrealdb.com/) written in **TypeScript**.
It provides you with a Query Builder, a Repository API, an agnostic schema validation and many more features.

## Features

- 📦 Object Document Mapper (ODM)
- 🛠️ Query Builder
- 🛡️ Type Safety
- 📜 Agnostic schema validation
- ⚙️ TypeScript support
- 🔗 Native [surrealdb.js](https://github.com/surrealdb/surrealdb.js) integration

## Installation

```bash
# Using npm
npm install @surrealize/core
```

```bash
# Using yarn
yarn add @surrealize/core
```

```bash
# Using pnpm
pnpm add @surrealize/core
```

```bash
# Using bun
bun add @surrealize/core
```

### JSR / Deno

_Coming soon..._

## Documentation

Documentation can be found [here](https://surrealize.pages.dev).

## Frequently Asked Questions

### Why ODM and not ORM?

- **ODM** stands for Object Document Mapping.
- **ORM** stands for Object Relational Mapping.

SurrealDB at it's core is a document database (see [Concepts](https://surrealdb.com/docs/surrealdb/introduction/concepts)), so **ODM** makes more sense than **ORM**.
