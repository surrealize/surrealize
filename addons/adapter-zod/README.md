# @surrealize/adatper-zod

This package provides useful Zod schemas for working with Surrealize and Zod.

## Features

- 🔎 Zod schemas for
  - 🏷️ RecordId
  - 📋 Table
  - 📝 Record (object with `id` property)
  - 🔗 RelationRecord (object with `id`, `in` and `out` properties)

## Installation

```bash
# Using npm
npm install @surrealize/adatper-zod

# Using yarn
yarn add @surrealize/adatper-zod

# Using pnpm
pnpm add @surrealize/adatper-zod

# Using bun
bun add @surrealize/adatper-zod
```

## Usage

```ts
import { Table, RecordId, type RecordIdValue } from "@surrealize/core";
import { record } from "@surrealize/adatper-zod";

/**
 * Use the `record` function to create database model. In this example the schema validates the record id for the table `user`.
 */
const UserSchema = record({ table: Table.from("user") }).extend({
	name: z.string(),
	age: z.number(),
});

const User = UserSchema.parse({
	id: RecordId.from("user:1"),
	name: "John Doe",
	age: 30,
});

// works fine with Zod schema inference
type User = z.infer<typeof UserSchema>;

// This is the same as the above
type User = {
   id: RecordId<"user", RecordIdValue>;
   name: string;
   age: number;
}
```
