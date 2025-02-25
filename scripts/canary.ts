import dayjs from "dayjs/esm";
import dayjsUtc from "dayjs/esm/plugin/utc";

dayjs.extend(dayjsUtc);

const prerelease =
	process.argv
		.at(2)
		?.match(/^[a-z]+$/)
		?.at(0) ?? "canary";

const packageJsonFile = Bun.file(`${import.meta.dirname}/../dist/package.json`);
const packageJson = await packageJsonFile.json();

const now = dayjs().utc().format("YYYYMMDDHHmmss");

packageJson.version = `0.0.0-${prerelease}.${now}`;

await packageJsonFile.write(JSON.stringify(packageJson, null, 2));

console.log(`version: ${packageJson.version}`);
