import { $ } from "bun";

const buildOrder = ["core", "adapter-zod"];

console.log("🚀 Building...");

for (const packageName of buildOrder) {
	await $`bun run build`.cwd(import.meta.dir + `/../packages/${packageName}`);
}
