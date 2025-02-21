import { parse } from "@std/semver";

const NPM_REGISTRY_URL = process.env.NPM_REGISTRY_URL;
const NPM_TOKEN = process.env.NPM_TOKEN;

if (!NPM_REGISTRY_URL || !NPM_TOKEN)
	throw new Error("NPM_TOKEN and NPM_REGISTRY_URL must be set");

const isVersionAvailable = async (
	name: string,
	version: string,
): Promise<boolean> => {
	const result = await fetch(`${NPM_REGISTRY_URL}/${name}`, {
		headers: {
			Authorization: `Bearer ${NPM_TOKEN}`,
		},
	}).then((res) => res.json());

	return !result?.versions?.[version];
};

const determineTag = (version: string): string => {
	const semver = parse(version);

	const prerelease = semver.prerelease?.[0];

	// if the version has no prerelease tag, return "latest"
	if (!prerelease) return "latest";

	// if the first prerelease tag is not a string, throw an error
	if (typeof prerelease !== "string") throw new Error("Invalid prerelease");

	// else return the prerelease tag
	return prerelease;
};

const publishPackage = async () => {
	const packageJson = await Bun.file(
		`${import.meta.dirname}/../package.json`,
	).json();

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

	const tag = determineTag(packageJson.version);

	console.log(
		`Publishing ${packageJson.name}@${packageJson.version} (tag = ${tag})`,
	);

	const job = Bun.spawnSync({
		cmd: ["npm", "publish", "--tag", tag, "--access", "public"],
		cwd: `${import.meta.dirname}/../dist`,
		stdout: "inherit",
		stderr: "inherit",
		stdin: null,
	});

	if (job.exitCode !== 0) process.exit(job.exitCode);
};

await publishPackage();
