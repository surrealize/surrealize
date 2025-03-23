import { decode } from "cborkit/decoder";
import { defaultDecoder } from "cborkit/decoder/default";
import { encode } from "cborkit/encoder";
import { defaultEncoder } from "cborkit/encoder/default";
import { ClassRegistry } from "cborkit/plugins/class_transformer";

import { TYPE_NONE, tags } from "./tags.ts";

export class DefaultCborCodec {
	classRegistry: ClassRegistry;

	constructor() {
		this.classRegistry = new ClassRegistry(tags);
	}

	encode(value: unknown): Uint8Array {
		return encode(value, {
			encoders: [TYPE_NONE.encoder, this.classRegistry.encoder, defaultEncoder],
		});
	}

	decode<T = unknown>(value: Uint8Array): T {
		return decode(value, {
			decoders: [TYPE_NONE.decoder, this.classRegistry.decoder, defaultDecoder],
		}) as T;
	}
}
