export type TransformCodec<TValue = unknown, TTransformed = unknown> = {
	check: (value: unknown) => value is TValue;
	transform: (value: TValue) => TTransformed;
};

export type TransformerCustomType<TValue = unknown, TEncoded = unknown> = {
	encode?: TransformCodec<TValue, TEncoded>;
	decode?: TransformCodec<TEncoded, TValue>;
};

export type Encodeable<TValue = unknown> = Record<
	typeof Transformer.encoder,
	() => TValue
>;

export type Decodeable<TValue = unknown> = Record<
	typeof Transformer.decoder,
	() => TValue
>;

export class Transformer {
	readonly encoders: Array<TransformCodec> = [];
	readonly decoders: Array<TransformCodec> = [];

	/**
	 * Initialize a new transformer with custom types.
	 *
	 * @param customTypes The custom types to use for transformation.
	 */
	constructor(customTypes: Array<TransformerCustomType>) {
		for (const codec of customTypes) {
			if (codec.encode) this.encoders.push(codec.encode);
			if (codec.decode) this.decoders.push(codec.decode);
		}
	}

	/**
	 * Encode a value using the registered codecs.
	 *
	 * @param value The value to encode.
	 * @returns The encoded value.
	 */
	encode(value: unknown): unknown {
		return this.transform(value, "encode");
	}

	/**
	 * Decode a value using the registered codecs.
	 *
	 * @param value The value to decode.
	 * @returns The decoded value.
	 */
	decode(value: unknown): unknown {
		return this.transform(value, "decode");
	}

	/**
	 * Transform a arbitrary value using the registered codecs.
	 *
	 * @param value The value to transform.
	 * @param mode The mode to use for transformation. Either "encode" or "decode".
	 * @returns The transformed value.
	 */
	private transform(value: unknown, mode: "encode" | "decode"): unknown {
		const symbol =
			mode === "encode" ? Transformer.encoder : Transformer.decoder;

		// if value is not an object, try to find a codec and transform it
		// if no codec is found, return the value as is
		if (typeof value !== "object")
			return this.findCodecAndTransform(value, mode);

		// if value is `null`, return it as is
		if (value === null) {
			return value;
		}
		// if value has a custom transformer symbol, use it
		if (symbol in value) {
			// get the custom transformer
			const customTransformer = (value as Record<typeof symbol, () => unknown>)[
				symbol
			];

			// if the custom transformer is not a function, throw an error
			if (typeof customTransformer !== "function")
				throw new Error(
					`Invalid custom transformer. Expected a function, received: ${typeof customTransformer}`,
				);

			// use the custom transformer to transform the value
			return customTransformer.bind(value)();
		}
		// if the value is an array, map each item and recursively transform it
		if (Array.isArray(value)) {
			return value.map((item) => this.transform(item, mode));
		}
		// if the value is an raw object, map each key-value pair and recursively transform the value
		if (value.constructor === Object) {
			return Object.fromEntries(
				Object.entries(value).map(([key, value]) => [
					key,
					this.transform(value, mode),
				]),
			);
		}

		// in any other case, try to find a codec and transform it
		return this.findCodecAndTransform(value, mode);
	}

	/**
	 * Finds an codec for the given value and transforms it.
	 * If no codec is found, the value is returned as is.
	 *
	 * @param value The value to transform.
	 * @param codecs The codecs to use for transformation.
	 * @returns The transformed value or the original value if no codec was found.
	 */
	private findCodecAndTransform(
		value: unknown,
		mode: "encode" | "decode",
	): unknown {
		const codecs = mode === "encode" ? this.encoders : this.decoders;
		const codec = codecs.find((codec) => codec.check(value));
		return codec ? codec.transform(value) : value;
	}

	/**
	 * Symbol used to store an encoder function in an object.
	 */
	static readonly encoder: unique symbol = Symbol("Transformer.encoder");

	/**
	 * Symbol used to store a decoder function in an object.
	 */
	static readonly decoder: unique symbol = Symbol("Transformer.decoder");
}
