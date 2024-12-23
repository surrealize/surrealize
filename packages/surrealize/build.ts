import { copyFile } from "node:fs/promises";
import { build } from "tsup";

import packageJson from "./package.json" with { type: "json" };

// bundle the library
await build({
	entry: [`${import.meta.dirname}/src/index.ts`],
	outDir: `${import.meta.dirname}/dist`,
	format: ["esm", "cjs"],
	dts: true,
	clean: true,
	minify: true,
	platform: "neutral",
	sourcemap: true,
});

// write package.json
await Bun.write(
	`${import.meta.dirname}/dist/package.json`,
	JSON.stringify(
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

			dependencies: packageJson.dependencies,
			license: packageJson.license,
			author: packageJson.author,
			homepage: packageJson.homepage,
			repository: packageJson.repository,
			bugs: packageJson.bugs,
			keywords: packageJson.keywords,
		},
		null,
		2,
	),
);

await Promise.all([
	copyFile(
		`${import.meta.dirname}/../../README.md`,
		`${import.meta.dirname}/dist/README.md`,
	),
]);

console.log("🚀 Build complete");
