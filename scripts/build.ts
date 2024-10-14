import { $ } from "bun";

const buildOrder = ["surrealize", "adapter-zod"];

console.log("🚀 Building...");

for (const packageName of buildOrder) {
	await $`bun run build`.cwd(import.meta.dir + `/../packages/${packageName}`);
}
