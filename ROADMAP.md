# Roadmap

This is a list of features that are planned for the future.

## Statements

Essentials:

- [ ] `SELECT` - Partial support
- [ ] `CREATE` - Partial support
- [ ] `UPDATE` - No support yet
- [ ] `DELETE` - No support yet
- [ ] `INSERT` - No support yet
- [ ] `UPSERT` - No support yet
- [ ] `RELATE` - No support yet

Advanced:

**TODO**

## Repositories

### Repo API Proposal

```ts
type Filter = Record<Field, unknown> | Condition[];

type Repository = {
	// shortcut for countBy({}) without filter
	count(): Promise<number>;
	countBy(filter: Filter): Promise<number>;

	// shortcut for findBy({}) without filter
	find(): Promise<Record[]>;
	findBy(filter: Filter, options?: unknown): Promise<Record[]>;
	findById(id: RecordId): Promise<Record | undefined>;
	findOneBy(filter: Filter, options?: unknown): Promise<Record | undefined>;

	// same as find but with live query
	// live<...>();

	create(record: Record): Promise<Record>;
	createMany(records: Record[]): Promise<Record[]>;

	update(record: Record): Promise<Record>;
	updateBy(filter: Filter, fields: SetLike<Record>): Promise<Record[]>;
	updateById(id: RecordId, fields: SetLike<Record>): Promise<Record>;
	updateMany(records: Record[]): Promise<Record[]>;

	upsert(record: Record): Promise<Record>;
	// upsertBy even useful?
	upsertBy(filter: Filter, fields: SetLike<Record>): Promise<Record[]>;
	upsertMany(records: Record[]): Promise<Record[]>;

	delete(record: Record): Promise<void>;
	deleteBy(filter: Filter): Promise<void>;
	deleteById(id: RecordId): Promise<void>;
	deleteMany(records: Record[]): Promise<void>;
};
```

A repository class which provides you with simple CRUD operations like:

- `find`
- `findBy`
- `findOneBy`
- `findById`

- `create`
- `updateBy`

and many more. Get inspired by the [TypeORM](https://github.com/typeorm/typeorm) repository class.
