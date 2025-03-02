import { generateDtsBundle } from "dts-bundle-generator";
import { copyFile, rmdir } from "node:fs/promises";

import packageJson from "../package.json" with { type: "json" };

await rmdir(`${import.meta.dirname}/../dist`, { recursive: true });

await Promise.all([
	Bun.build({
		entrypoints: [`${import.meta.dirname}/../src/index.ts`],
		outdir: `${import.meta.dirname}/../dist`,
		packages: "bundle",
		format: "esm",
		minify: true,
		naming: {
			entry: "index.js",
		},
	}),
	Bun.build({
		entrypoints: [`${import.meta.dirname}/../src/index.ts`],
		outdir: `${import.meta.dirname}/../dist`,
		packages: "bundle",
		format: "cjs",
		minify: true,
		naming: {
			entry: "index.cjs",
		},
	}),
]);

const [dts] = generateDtsBundle([
	{
		filePath: `${import.meta.dirname}/../src/index.ts`,
		libraries: { inlinedLibraries: Object.keys(packageJson.dependencies) },
		output: {
			exportReferencedTypes: false,
		},
	},
]);

const packageJsonString = JSON.stringify(
	{
		name: packageJson.name,
		version: packageJson.version,
		type: packageJson.type,

		exports: {
			".": {
				types: "./index.d.ts",
				import: "./index.js",
				require: "./index.cjs",
			},
		},

		license: packageJson.license,
		author: packageJson.author,
		homepage: packageJson.homepage,
		repository: packageJson.repository,
		bugs: packageJson.bugs,
		keywords: packageJson.keywords,
	},
	null,
	2,
);

await Promise.all([
	Bun.write(`${import.meta.dirname}/../dist/index.d.ts`, dts),
	Bun.write(`${import.meta.dirname}/../dist/package.json`, packageJsonString),
	copyFile(
		`${import.meta.dirname}/../README.md`,
		`${import.meta.dirname}/../dist/README.md`,
	),
]);

console.log("🚀 Build complete");
