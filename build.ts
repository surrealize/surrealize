import { copyFile } from "node:fs/promises";
import { build } from "tsup";

import packageJson from "./package.json" with { type: "json" };

const packageJsonString = JSON.stringify(
  {
    name: packageJson.name,
    version: packageJson.version,
    type: packageJson.type,

    exports: {
      ".": {
        import: {
          default: "./index.js",
          types: "./index.d.ts",
        },
        require: {
          default: "./index.cjs",
          types: "./index.d.cts",
        },
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
);

await build({
  entry: [`${import.meta.dirname}/src/index.ts`],
  outDir: `${import.meta.dirname}/dist`,
  format: ["esm", "cjs"],
  minify: true,
  clean: true,
  dts: { resolve: true },
});

await Promise.all([
  Bun.write(`${import.meta.dirname}/dist/package.json`, packageJsonString),
  copyFile(
    `${import.meta.dirname}/README.md`,
    `${import.meta.dirname}/dist/README.md`,
  ),
  copyFile(
    `${import.meta.dirname}/LICENSE.md`,
    `${import.meta.dirname}/dist/LICENSE.md`,
  ),
  copyFile(
    `${import.meta.dirname}/CHANGELOG.md`,
    `${import.meta.dirname}/dist/CHANGELOG.md`,
  ),
]);

console.log("🚀 Build complete");
