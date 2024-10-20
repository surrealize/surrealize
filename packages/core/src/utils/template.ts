/**
 * A tagged template is a template literal with all variables as an array.
 */
export type TaggedTemplate = [string[] | TemplateStringsArray, unknown[]];

/**
 * A variable converter function used in the {@link format} function to convert the variable values to strings.
 *
 * This is needed to convert a {@link TaggedTemplate} into a string.
 */
export type FormatVariableConverter = (value: unknown, index: number) => string;

/**
 * Function to create a tagged template using a template literals.
 * This also preserves the variables in the template.
 *
 * @returns A tagged template.
 */
export const tag = (
	strings: string[] | TemplateStringsArray,
	...values: unknown[]
): TaggedTemplate => [strings, values];

/**
 * Function to create a tagged template from a string without any variables.
 *
 * @param str The string to create the tagged template from.
 * @returns A tagged template.
 */
export const tagString = (str: string): TaggedTemplate => [[str], []];

/**
 * Function to merge multiple tagged templates into one.
 *
 * @param tags A list of tagged templates to merge.
 * @param join A optional join string which gets inserted between the tagged templates.
 * @returns A merged tagged template.
 */
export const merge = (tags: TaggedTemplate[], join = ""): TaggedTemplate => {
	const strings: string[] = [];
	const values: unknown[] = [];

	for (let i = 0; i < tags.length; i++) {
		const tag = tags[i];
		const [strings_, values_] = tag;

		for (let j = 0; j < strings_.length; j++) {
			const str = strings_[j];
			const val = values_[j];

			if (i > 0 && j === 0) {
				strings[strings.length - 1] += join + str;
			} else {
				strings.push(str);
			}

			// if not last
			if (j !== values_.length) {
				values.push(val);
			}
		}
	}

	return [strings, values];
};

/**
 * Function to format a tagged template into a string.
 *
 * @param tag The tagged template to format.
 * @param variableConverter An optional variable converter function to convert the variable values to strings. (default: String constructor)
 * @returns The formatted string.
 */
export const format = (
	tag: TaggedTemplate,
	variableConverter: FormatVariableConverter = (v) => String(v),
): string => {
	const [strings, values] = tag;
	return strings.reduce(
		(acc, str, i) =>
			acc + str + (i in values ? variableConverter(values[i], i) : ""),
		"",
	);
};

/**
 * Check whether a tagged template is empty.
 *
 * This means that the template will be formatted to an empty string.
 *
 * @param template The tagged template to check.
 * @returns True if the template is empty, false otherwise.
 */
export const isEmpty = (template: TaggedTemplate): boolean => {
	const [strings, values] = template;

	// if there are values, the template is never empty
	if (values.length !== 0) return false;

	// if there are no strings, the template is empty
	if (strings.length === 0) return true;

	// if there is only one empty string, the template is empty
	if (strings.length === 1 && strings[0] === "") return true;

	return false;
};
