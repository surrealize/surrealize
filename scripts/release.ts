import { readdir } from "node:fs/promises";

const isVersionAvailable = async (
	name: string,
	version: string,
): Promise<boolean> => {
	const result = await fetch(`https://registry.npmjs.org/${name}`).then((res) =>
		res.json(),
	);

	return !result?.versions?.[version];
};

const publishPackage = async (packagePath: string) => {
	const packageJson = await Bun.file(`${packagePath}/package.json`).json();
	const canPublish = await isVersionAvailable(
		packageJson.name,
		packageJson.version,
	);

	if (!canPublish) {
		console.log(
			`Skipping ${packageJson.name}@${packageJson.version}. Already published.`,
		);
		return;
	}

	console.log(`Publishing ${packageJson.name}@${packageJson.version}`);

	const job = Bun.spawnSync({
		cmd: ["npm", "publish", "--dry-run"],
		cwd: `${packagePath}/dist`,
		stdout: "inherit",
		stderr: "inherit",
		stdin: null,
	});

	if (job.exitCode !== 0) process.exit(job.exitCode);
};

const packageFolders = await readdir(`${import.meta.dirname}/../packages`);

for (const packageFolder of packageFolders) {
	await publishPackage(`${import.meta.dirname}/../packages/${packageFolder}`);
}
