import { CborCodec } from "./cbor.ts";
import { tags } from "./tags.ts";

export class DefaultCborCodec extends CborCodec {
	constructor() {
		super(tags);
	}
}
