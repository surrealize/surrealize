export class UUID {
  constructor(readonly bytes: Uint8Array) {
    if (bytes.length !== 16) throw new Error("Invalid UUID");
  }
}
